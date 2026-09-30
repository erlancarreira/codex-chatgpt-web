import type {
  SequencedTurnEvent,
  TurnEvent,
  TurnState,
} from "../core/turn/turn-state-machine";

export interface TurnLifecycleSink {
  dispatch(source: SequencedTurnEvent["source"], event: TurnEvent): Promise<TurnState>;
  snapshot(): TurnState;
}

export interface TurnLifecycleJournalReader {
  events(): readonly SequencedTurnEvent[];
}
