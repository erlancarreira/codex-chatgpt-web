import { expect, test } from "bun:test";
import { ChatGptCompactionProjection } from "../src/adapters/chatgpt-web/compaction-projection";
import type { ChatGptMarkdownSegment } from "../src/adapters/chatgpt-web/markdown";

test("compaction projection never emits provisional text and serializes only the final renderer", () => {
  const projection = new ChatGptCompactionProjection();
  const first: ChatGptMarkdownSegment[] = [{
    key: "summary",
    tag: "p",
    text: "Provisional checkpoint",
    html: "<p>Provisional checkpoint</p>",
    sourceStart: 0,
    sourceEnd: 22,
    streamable: true,
  }];
  const final: ChatGptMarkdownSegment[] = [{
    ...first[0]!,
    text: "Final checkpoint",
    html: "<p>Final checkpoint</p>",
    sourceEnd: 16,
  }];

  expect(projection.observe(first)).toBe("");
  expect(projection.observe(final)).toBe("");
  expect(projection.currentSnapshotIsConsistent()).toBeTrue();
  expect(projection.finish()).toEqual({
    markdown: "Final checkpoint",
    delta: "Final checkpoint",
  });
});
