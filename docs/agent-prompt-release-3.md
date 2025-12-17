# Release 3 — Agent Prompt Addendum

Use this addendum alongside the existing **CSIR MEGA PROMPT**. Keep the original wording of the MEGA prompt intact, then append the Release 3 instructions below so the agent layers the CSIR experience onto the current site without rebuilding the shell or flow engine.

## New flow order
Landing → Role selection gate → Foundation → Role path → Scenarios → Knowledge check → Checklist → Certificate.

## Directives to append to the CSIR MEGA PROMPT
- **Reuse the app shell and flow engine:** Keep the current navigation, router, storage/persistence, layout, and progress logic. Do not rebuild the shell—plug the CSIR experience into what already exists.
- **Swap in CSIR sections in the new order:** Replace existing content with the CSIR pages in the sequence above and ensure navigation respects that order (including back/forward, progress, and resume behaviors).
- **Certificate generation (PDF + PNG):** Implement certificate downloads that emit both PDF and PNG while preserving the current styling, metadata, and learner details. Keep the output names/paths consistent with the existing download flow.
- **Knowledge-check gating:** Lock Checklist and Certificate until the learner passes the knowledge check, and route users back into the knowledge check when they fail or skip it. Integrate this gating with the existing flow controls and persistence so refreshes/restarts honor pass/fail state.

Copy/paste the full CSIR MEGA PROMPT plus these directives when kicking off the Release 3 build.
