import { expect, test } from "bun:test";
import {
  createTurnState,
  InvalidTurnTransitionError,
  reduceTurnState,
  sequenceTurnEvent,
  type SequencedTurnEvent,
  type TurnEvent,
  type TurnState,
} from "../src/core/turn/turn-state-machine";

function apply(state: TurnState, source: SequencedTurnEvent["source"], event: TurnEvent): TurnState {
  return reduceTurnState(state, sequenceTurnEvent(state, source, event));
}

test("turn state machine follows one deterministic response lifecycle", () => {
  let state = createTurnState();
  state = apply(state, "runtime", { type: "prepare", at: 1 });
  state = apply(state, "runtime", { type: "submission_sent", at: 2 });
  state = apply(state, "transport", { type: "transport_accepted", at: 3, requestId: "r1", status: 200 });
  state = apply(state, "transport", { type: "transport_data", at: 4, requestId: "r1", bytes: 128 });
  state = apply(state, "dom", { type: "dom_revision", at: 5, revision: 1 });
  state = apply(state, "transport", { type: "transport_finished", at: 6, requestId: "r1" });
  expect(state.phase).toBe("finalizing");
  expect(state.sequence).toBe(6);
  expect(state.hasTransportData).toBeTrue();
  state = apply(state, "runtime", { type: "complete", at: 7 });
  expect(state.phase).toBe("completed");
  expect(state.terminal).toEqual({ phase: "completed", sequence: 7 });
});

test("tool lifecycle is explicit and completion waits for the active batch", () => {
  let state = createTurnState();
  state = apply(state, "runtime", { type: "prepare", at: 1 });
  state = apply(state, "runtime", { type: "submission_sent", at: 2 });
  state = apply(state, "transport", { type: "transport_accepted", at: 3, requestId: "r1", status: 200 });
  state = apply(state, "tool", { type: "tool_requested", at: 4, callIds: ["a", "b"] });
  state = apply(state, "tool", { type: "tool_started", at: 5, callId: "a" });
  expect(state.phase).toBe("tool_running");
  state = apply(state, "transport", { type: "transport_finished", at: 6, requestId: "r1" });
  expect(state.transportFinished).toBeTrue();
  expect(state.phase).toBe("tool_running");
  state = apply(state, "tool", { type: "tool_completed", at: 7, callId: "a" });
  expect(state.phase).toBe("waiting_tool");
  state = apply(state, "tool", { type: "tool_started", at: 8, callId: "b" });
  state = apply(state, "tool", { type: "tool_completed", at: 9, callId: "b" });
  expect(state.phase).toBe("finalizing");
});

test("benign and recoverable transport failures do not terminate a proven turn", () => {
  let state = createTurnState();
  state = apply(state, "runtime", { type: "prepare", at: 1 });
  state = apply(state, "runtime", { type: "submission_sent", at: 2 });
  state = apply(state, "transport", { type: "transport_accepted", at: 3, requestId: "r1", status: 200 });
  state = apply(state, "transport", { type: "transport_data", at: 4, requestId: "r1", bytes: 1 });
  state = apply(state, "transport", {
    type: "transport_failed", at: 5, requestId: "r1", classification: "benign", reason: "net::ERR_ABORTED",
  });
  expect(state.phase).toBe("streaming");
  expect(state.lastTransportFailure?.classification).toBe("benign");
  state = apply(state, "transport", {
    type: "transport_failed", at: 6, requestId: "r1", classification: "recoverable", reason: "renderer navigation",
  });
  expect(state.phase).toBe("streaming");
});

test("terminal failures, cancellation and deadlines are terminal", () => {
  let failed = createTurnState();
  failed = apply(failed, "runtime", { type: "prepare", at: 1 });
  failed = apply(failed, "runtime", { type: "submission_sent", at: 2 });
  failed = apply(failed, "transport", {
    type: "transport_failed", at: 3, requestId: "r1", classification: "terminal", reason: "connection reset",
  });
  expect(failed.phase).toBe("failed");
  expect(() => apply(failed, "dom", { type: "dom_revision", at: 4, revision: 1 }))
    .toThrow(InvalidTurnTransitionError);

  let cancelled = createTurnState();
  cancelled = apply(cancelled, "client", { type: "cancel", at: 1, reason: "user" });
  expect(cancelled.phase).toBe("cancelled");

  let timedOut = createTurnState();
  timedOut = apply(timedOut, "watchdog", { type: "deadline_exceeded", at: 10, deadline: 10 });
  expect(timedOut.phase).toBe("timed_out");
});

test("turn sequence and primary request invariants fail closed", () => {
  const state = createTurnState();
  expect(() => reduceTurnState(state, {
    sequence: 2,
    source: "runtime",
    event: { type: "prepare", at: 1 },
  })).toThrow("sequence");

  let active = apply(state, "runtime", { type: "prepare", at: 1 });
  active = apply(active, "runtime", { type: "submission_sent", at: 2 });
  active = apply(active, "transport", { type: "transport_accepted", at: 3, requestId: "r1", status: 200 });
  expect(() => apply(active, "transport", {
    type: "transport_data", at: 4, requestId: "r2", bytes: 1,
  })).toThrow("primary request");
});
