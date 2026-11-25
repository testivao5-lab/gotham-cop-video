import words from "../data/alignment.json";
import scenes from "../data/scenes.json";

type W = { i: number; word: string; start: number; startFrame: number; endFrame: number };
const WORDS = words as W[];
type S = { id: string; start: number; end: number; wordStart: number; wordEnd: number };
const SC = scenes as S[];

/** local frame (within scene n, 1-based) where `word` (nth occurrence in that scene) starts */
export const cue = (n: number, word: string, nth = 1, lead = 2): number => {
  const s = SC[n - 1];
  let count = 0;
  for (let i = s.wordStart; i <= s.wordEnd; i++) {
    if (WORDS[i].word === word.toLowerCase()) {
      count++;
      if (count === nth) return Math.max(0, WORDS[i].startFrame - s.start - lead);
    }
  }
  throw new Error(`cue not found: scene ${n} "${word}" #${nth}`);
};
export const sceneDur = (n: number) => SC[n - 1].end - SC[n - 1].start + 1;
