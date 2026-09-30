import {
  ChatGptMarkdownBuffer,
  type ChatGptMarkdownSegment,
} from "./markdown";

/**
 * Compaction renderer projection.
 *
 * Provisional renderer text is intentionally never emitted. ChatGPT may rewrite the same
 * renderer block while producing a checkpoint; only the final observed projection is serialized.
 */
export class ChatGptCompactionProjection {
  private readonly buffer = new ChatGptMarkdownBuffer(markdown => markdown, 750, false);

  observe(segments: readonly ChatGptMarkdownSegment[]): string {
    this.buffer.observe([...segments]);
    return "";
  }

  finish(): { markdown: string; delta: string } {
    return this.buffer.finish();
  }

  currentSnapshotIsConsistent(): boolean {
    return this.buffer.currentSnapshotIsConsistent();
  }
}
