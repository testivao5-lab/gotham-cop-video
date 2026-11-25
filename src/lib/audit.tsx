import React from "react";
import { AbsoluteFill, getInputProps, useCurrentFrame } from "remotion";

/**
 * PREVENTION: runtime framing audit.
 * Components report violations while rendering; <AuditOverlay/> (rendered LAST in the root) consumes them.
 * With --props '{"audit":true}' it paints a pure-magenta 64x64 tag in the top-left corner so the CI
 * audit job (scripts/frame_audit.py) can list every offending frame. Normal renders are untouched.
 */
const store: { list: string[] } = { list: [] };
export const AUDIT: boolean = (() => { try { return !!(getInputProps() as { audit?: boolean }).audit; } catch { return false; } })();
export const auditReport = (msg: string) => { store.list.push(msg); };

export const AuditOverlay: React.FC = () => {
  useCurrentFrame(); // re-render every frame, after all scene content (tree order)
  const list = store.list;
  store.list = [];
  if (!AUDIT || list.length === 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 64, height: 64, background: "#ff00ff" }} />
      <div style={{ position: "absolute", left: 70, top: 6, color: "#ff00ff", font: "bold 22px monospace", background: "#000" }}>{list.join(" | ")}</div>
    </AbsoluteFill>
  );
};
