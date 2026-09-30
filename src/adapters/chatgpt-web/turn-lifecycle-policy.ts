import type { ChatGptWebTransportSnapshot } from "./transport-tracker";

export type MissingAssistantDecision =
  | { kind: "wait"; reason: "transport_live" | "external_progress" | "network_dom_settle"; until?: number }
  | { kind: "recover"; reason: "assistant_dom_missing" }
  | {
      kind: "fail";
      code: "browser_stream_failed" | "browser_response_dom_missing" | "browser_stream_stalled";
      status: 502 | 504;
      retryable: true;
      message: string;
    };

export interface MissingAssistantPolicyInput {
  now: number;
  responseDeadline: number;
  network: ChatGptWebTransportSnapshot;
  networkLive: boolean;
  externalProgressLive: boolean;
  networkDomSettleMs: number;
  abortedStreamDomSettleMs: number;
}

function successfulResponse(network: ChatGptWebTransportSnapshot): boolean {
  return network.responseSeen
    && network.responseStatus !== undefined
    && network.responseStatus >= 200
    && network.responseStatus < 400;
}

export function decideMissingAssistant(
  input: MissingAssistantPolicyInput,
): MissingAssistantDecision {
  const { network } = input;
  if (network.failed) {
    return {
      kind: "fail",
      code: "browser_stream_failed",
      status: 502,
      retryable: true,
      message: "ChatGPT conversation transport failed before the assistant response became available"
        + (network.failureText ? ": " + network.failureText : ""),
    };
  }

  if (network.completed && successfulResponse(network)) {
    const completedAt = network.completedAt ?? network.lastActivityAt ?? input.now;
    const settleDeadline = completedAt + (
      network.abortedAfterResponse
        ? input.abortedStreamDomSettleMs
        : input.networkDomSettleMs
    );
    if (input.now >= settleDeadline) {
      return {
        kind: "fail",
        code: "browser_response_dom_missing",
        status: 502,
        retryable: true,
        message: "ChatGPT completed the response stream, but its assistant turn was not available in the browser DOM.",
      };
    }
    return { kind: "wait", reason: "network_dom_settle", until: settleDeadline };
  }

  if (input.externalProgressLive) {
    return { kind: "wait", reason: "external_progress" };
  }

  if (input.networkLive) {
    return { kind: "wait", reason: "transport_live" };
  }

  if (
    input.now >= input.responseDeadline
    && network.cdpAttached
    && network.requestSeen
    && !network.completed
  ) {
    return {
      kind: "fail",
      code: "browser_stream_stalled",
      status: 504,
      retryable: true,
      message: "ChatGPT response stream stopped producing network data before an assistant turn became available.",
    };
  }

  if (input.now >= input.responseDeadline) {
    return { kind: "recover", reason: "assistant_dom_missing" };
  }

  return { kind: "wait", reason: "transport_live" };
}
