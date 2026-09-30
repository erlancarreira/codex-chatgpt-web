import { expect, test } from "bun:test";
import { CompactionLifecycleCoordinator } from "../src/application/compaction-lifecycle-coordinator";

test("compaction coordinator serializes the complete structured handoff lifecycle", async () => {
  let now = 0;
  const lifecycle = new CompactionLifecycleCoordinator({ now: () => ++now });
  await lifecycle.settleSource();
  await lifecycle.waitHandoff("handoff-1");
  await lifecycle.handoffReceived();
  await lifecycle.retireBrowser();
  await lifecycle.browserRetired();

  expect(lifecycle.snapshot()).toMatchObject({
    phase: "completed",
    handoffReceived: true,
    browserRetired: true,
    sequence: 5,
  });
  expect(lifecycle.events().map(event => event.type)).toEqual([
    "settle_source",
    "wait_handoff",
    "handoff_received",
    "retire_browser",
    "browser_retired",
  ]);
});

test("compaction coordinator cancellation is terminal and deterministic", async () => {
  const lifecycle = new CompactionLifecycleCoordinator();
  await lifecycle.settleSource(1);
  await lifecycle.cancel("replaced", 2);
  expect(lifecycle.snapshot()).toMatchObject({ phase: "cancelled", terminalReason: "replaced" });
  await expect(lifecycle.waitHandoff("late", 3)).rejects.toThrow("Invalid compaction transition");
});
