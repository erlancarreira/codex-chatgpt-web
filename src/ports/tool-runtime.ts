export interface ToolRuntimePort<TRequest, TResult> {
  nextBatch(signal?: AbortSignal): Promise<readonly TRequest[]>;
  complete(callId: string, result: TResult): Promise<void>;
  revoke(reason?: Error): Promise<void>;
}
