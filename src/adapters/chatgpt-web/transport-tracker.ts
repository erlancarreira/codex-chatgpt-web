import {
  classifyTransportFailure,
  createTransportSessionState,
  reduceTransportSession,
  type TransportObservation,
  type TransportObservationSource,
  type TransportSessionState,
} from "../../core/transport/transport-session";

export interface ChatGptWebTransportSnapshot {
  cdpAttached: boolean;
  requestSeen: boolean;
  responseSeen: boolean;
  responseStatus?: number;
  streamActive: boolean;
  completed: boolean;
  failed: boolean;
  failureText?: string;
  abortedAfterResponse: boolean;
  abortText?: string;
  requestAt?: number;
  responseAt?: number;
  lastActivityAt?: number;
  completedAt?: number;
  dataChunks: number;
  dataBytes: number;
  primaryRequestId?: string;
  requestCount: number;
}

export class ChatGptWebTransportTracker {
  private session: TransportSessionState = createTransportSessionState();
  private cdpAttached = false;
  private sourceMode?: TransportObservationSource;

  reset(): void {
    this.session = createTransportSessionState();
    this.cdpAttached = false;
    this.sourceMode = undefined;
  }

  setCdpAttached(attached: boolean): void {
    this.cdpAttached = attached;
    if (!attached && this.sourceMode === "cdp" && this.session.revision === 0) {
      this.sourceMode = undefined;
    }
  }

  snapshotSession(): TransportSessionState {
    return this.session;
  }

  record(observation: TransportObservation): boolean {
    if (!this.shouldAcceptSource(observation)) return false;
    const next = reduceTransportSession(this.session, observation);
    if (next === this.session) return false;
    this.session = next;
    return true;
  }

  networkSnapshot(): ChatGptWebTransportSnapshot {
    const requests = Object.values(this.session.requests).filter(request => request.role === "candidate");
    const primary = this.session.primaryRequestId
      ? this.session.requests[this.session.primaryRequestId]
      : undefined;
    const failureClassification = primary?.lifecycle === "failed"
      ? classifyTransportFailure(primary)
      : undefined;
    const abortedAfterResponse = failureClassification === "benign";

    return {
      cdpAttached: this.cdpAttached,
      requestSeen: requests.length > 0,
      responseSeen: primary?.responseStatus !== undefined,
      ...(primary?.responseStatus !== undefined ? { responseStatus: primary.responseStatus } : {}),
      streamActive: primary !== undefined
        && (primary.lifecycle === "sent" || primary.lifecycle === "accepted" || primary.lifecycle === "streaming"),
      completed: primary?.lifecycle === "finished",
      failed: primary?.lifecycle === "failed" && failureClassification !== "benign",
      ...(primary?.lifecycle === "failed" && failureClassification !== "benign" && primary.failureText
        ? { failureText: primary.failureText }
        : {}),
      abortedAfterResponse,
      ...(abortedAfterResponse && primary?.failureText ? { abortText: primary.failureText } : {}),
      ...(primary ? { requestAt: primary.sentAt } : {}),
      ...(primary?.responseAt !== undefined ? { responseAt: primary.responseAt } : {}),
      ...(primary?.lastActivityAt !== undefined ? { lastActivityAt: primary.lastActivityAt } : {}),
      ...(primary?.finishedAt !== undefined ? { completedAt: primary.finishedAt } : {}),
      dataChunks: primary?.chunksReceived ?? 0,
      dataBytes: primary?.bytesReceived ?? 0,
      ...(primary ? { primaryRequestId: primary.requestId } : {}),
      requestCount: requests.length,
    };
  }

  networkIsLive(now: number, graceMs: number): boolean {
    if (!Number.isFinite(now) || !Number.isFinite(graceMs) || graceMs < 0) {
      throw new Error("Transport liveness requires finite time and non-negative grace");
    }
    const snapshot = this.networkSnapshot();
    return snapshot.requestSeen
      && !snapshot.completed
      && !snapshot.failed
      && snapshot.lastActivityAt !== undefined
      && now - snapshot.lastActivityAt <= graceMs;
  }

  private shouldAcceptSource(observation: TransportObservation): boolean {
    if (this.sourceMode === "cdp") return observation.source === "cdp";
    if (this.sourceMode === "playwright") return observation.source === "playwright";

    if (this.cdpAttached) {
      if (observation.source !== "cdp") return false;
      if (observation.type === "request_sent") this.sourceMode = "cdp";
      return true;
    }

    if (observation.type === "request_sent") this.sourceMode = observation.source;
    return this.sourceMode === undefined || observation.source === this.sourceMode;
  }
}
