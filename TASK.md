# TASK — Web Event-Driven Turn Engine

Branch: `feat/web-event-driven-turn-engine`

Goal: refactor CodexNative Web into a Web-only, backend-local, event-driven runtime where turn lifecycle is governed by a deterministic state machine instead of scattered polling/retry logic.

## Non-negotiable architecture rules

- [x] Web-only: no OpenAI API provider and no direct private ChatGPT backend calls.
- [x] Browser owns authentication/session.
- [x] Network/CDP is the transport lifecycle authority.
- [x] DOM is a rendering/control adapter, not the transport authority.
- [x] MCP/tunnel emits tool lifecycle events; it does not mutate turn state directly.
- [x] Single-writer principle: only the Turn Actor/Reducer changes turn state.
- [x] No operational polling as the normal control path.
- [x] No arbitrary `sleep()` synchronization.
- [x] No unbounded retry loops.
- [x] No unbounded event queues.
- [x] No silent fallbacks.
- [x] No new god class replacing `browser-worker.ts`.
- [x] Modular monolith with explicit ports/adapters.
- [x] Timers are limited to deadline, heartbeat and watchdog responsibilities.

## Phase 0 — repository safety and baseline

- [x] Create isolated feature branch from `main`.
- [x] Create this `TASK.md`.
- [x] Open a draft PR and use it as the execution log.
- [x] Inspect current remote implementation and establish integration seams.
- [x] Document baseline invariants and existing network/DOM/MCP responsibilities.

## Phase 1 — domain event model

- [ ] Add typed immutable turn events.
- [ ] Add explicit turn states and terminal states.
- [ ] Add deterministic reducer/state-transition rules.
- [ ] Reject invalid state transitions explicitly.
- [ ] Add monotonic event sequence support.
- [ ] Add unit tests for valid/invalid transitions.

Acceptance:
- State transitions can be tested without browser, DOM, CDP, MCP or timers.
- No external adapter can directly mutate domain state.

## Phase 2 — per-request transport state

- [ ] Add request-level transport model keyed by request id.
- [ ] Track request lifecycle independently: sent/accepted/data/finished/failed.
- [ ] Preserve response status, byte count, chunk count and terminal reason per request.
- [ ] Add request correlation policy for the primary assistant transport.
- [ ] Prevent auxiliary/retry requests from overwriting the primary request.
- [ ] Add tests for 200 primary + 404 auxiliary, redirects, retries and aborted requests.

Acceptance:
- A secondary request can never corrupt the authoritative status of the primary stream.
- `ERR_ABORTED` can be classified using request-local evidence.

## Phase 3 — Turn Actor / mailbox

- [ ] Add one actor/mailbox per turn.
- [ ] Enforce single writer for turn state.
- [ ] Add bounded queue semantics.
- [ ] Coalesce high-frequency replaceable events such as DOM revisions/progress.
- [ ] Preserve non-droppable terminal/tool/network events.
- [ ] Add deterministic shutdown/cancellation.
- [ ] Add actor tests including concurrent producers.

Acceptance:
- CDP, DOM, MCP and launcher can publish concurrently without racing on turn state.
- Queue cannot grow without bound.

## Phase 4 — browser/CDP adapter

- [ ] Extract transport observation out of browser orchestration.
- [ ] Convert Playwright request/response/requestfinished/requestfailed to typed events.
- [ ] Convert CDP requestWillBeSent/responseReceived/dataReceived/loadingFinished/loadingFailed to typed events.
- [ ] Correlate Playwright/CDP observations without double-counting.
- [ ] Keep browser/session ownership independent from turn domain.
- [ ] Add tests for navigation, 2xx+data+ERR_ABORTED and genuine pre-response failure.

Acceptance:
- Browser transport publishes events only; lifecycle decisions remain in Core.

## Phase 5 — DOM adapter

- [ ] Convert MutationObserver/assistant surface observations to typed events.
- [ ] Add revision-based coalescing.
- [ ] Remove DOM as a prerequisite for network-active turn survival.
- [ ] Keep DOM responsibilities limited to rendered text, controls, confirmations and surface identity.
- [ ] Make surface-loss recovery explicit and bounded.
- [ ] Add tests for DOM detach/remount while network remains active.

Acceptance:
- DOM disappearance alone cannot fail an otherwise healthy streaming turn.

## Phase 6 — completion and failure policies

- [ ] Centralize completion policy.
- [ ] Centralize transport-failure classification.
- [ ] Centralize retry/recovery policy.
- [ ] Add explicit benign/recoverable/retryable/terminal classifications.
- [ ] Remove scattered retry decisions from browser code where migrated.
- [ ] Add bounded recovery budgets.
- [ ] Add tests for known historical failures.

Historical scenarios:
- [ ] HTTP 200 + data + post-response `ERR_ABORTED`.
- [ ] Missing assistant DOM while network progresses.
- [ ] Surface rebind during an active stream.
- [ ] Secondary 404 after a valid primary response.
- [ ] Browser observation timeout.
- [ ] Real transport failure before response/data.

## Phase 7 — compaction engine isolation

- [ ] Separate compaction session lifecycle from normal assistant streaming.
- [ ] Keep provisional renderer projections internal.
- [ ] Serialize one final checkpoint after completion fence.
- [ ] Integrate retained-compaction handoff through domain events.
- [ ] Remove dependence on normal streaming consistency rules for provisional compaction text.
- [ ] Add rewrite/remount/cancel/retry tests.

Acceptance:
- Provisional renderer rewrites cannot produce client-visible retraction errors.
- Compaction completion is deterministic.

## Phase 8 — MCP/tool lifecycle integration

- [ ] Model tool requested/started/completed/failed events.
- [ ] Keep tool runtime behind a port.
- [ ] Make WAITING_TOOL / TOOL_RUNNING transitions explicit.
- [ ] Preserve Codex approvals/sandbox behavior.
- [ ] Ensure tunnel reconnect cannot mutate an unrelated turn.
- [ ] Add tool timeout/cancel/reconnect tests.

## Phase 9 — supervisors and resilience

- [ ] Add Turn Supervisor boundary.
- [ ] Add Browser Supervisor boundary.
- [ ] Preserve Runtime/Tunnel supervisor ownership rules.
- [ ] Add named deadline/watchdog policies.
- [ ] Remove migrated magic timeout values from orchestration paths.
- [ ] Ensure one turn/browser fault does not corrupt unrelated turns.

## Phase 10 — integration into existing adapter

- [ ] Wire new Core into ChatGPT Web adapter incrementally.
- [ ] Preserve public Responses behavior.
- [ ] Preserve Browser-only.
- [ ] Preserve Full Harness.
- [ ] Preserve Zero Risk behavior outside automatic browser lifecycle.
- [ ] Preserve saved/temporary chat configuration.
- [ ] Preserve existing diagnostics during migration.
- [ ] Remove dead legacy orchestration paths only after replacement tests pass.

## Phase 11 — observability

- [ ] Emit structured trace events with traceId/turnId/requestId/source/sequence/timestamp.
- [ ] Keep sensitive values redacted.
- [ ] Add final state + causal terminal event to diagnostics.
- [ ] Make event history sufficient to reconstruct a failed turn.
- [ ] Avoid duplicate CDP/Playwright accounting.

## Phase 12 — fault injection and regression coverage

- [ ] DOM disappears during stream.
- [ ] DOM remounts with a new revision.
- [ ] 200 + chunks + ERR_ABORTED.
- [ ] Request fails before response.
- [ ] Primary 200 plus auxiliary 404.
- [ ] Tool call stalls.
- [ ] Tool completes after DOM remount.
- [ ] Tunnel restarts.
- [ ] Browser reconnects.
- [ ] Codex cancels mid-turn.
- [ ] Two simultaneous turns.
- [ ] Compaction rewrites provisional renderer.
- [ ] Compaction is cancelled/replaced.
- [ ] Event queue pressure/coalescing.

## Phase 13 — validation and cleanup

- [ ] Typecheck.
- [ ] Focused unit tests.
- [ ] Browser contract tests.
- [ ] Compaction tests.
- [ ] MCP/tunnel relevant tests.
- [ ] Full test suite where the available CI runner supports it.
- [ ] Build.
- [ ] Diff/format check.
- [ ] Review for polling/sleep/unbounded-loop regressions.
- [ ] Update architecture documentation.
- [ ] Update this task file to 100% complete.
- [ ] Mark PR ready.
- [ ] Merge only after validation evidence is attached to the PR.

## Execution log

- 2026-09-30 — Branch created. Architecture constraints and complete task plan recorded.
- 2026-09-30 — Draft PR #1 opened. Remote baseline inspected: Playwright/CDP/MutationObserver are event sources, while the main browser orchestration still uses observation loops and distributed completion/retry decisions. Core migration seams identified.
