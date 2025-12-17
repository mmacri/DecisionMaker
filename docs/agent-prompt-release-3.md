# Release 3 — Agent Prompt Addendum

Use this addendum alongside the existing **CSIR MEGA PROMPT**. Keep the original wording of the MEGA prompt intact, then append the Release 3 instructions below so the agent layers the CSIR experience onto the current site without rebuilding the shell.

## New flow order
Landing → Role selection gate → Foundation → Role path → Scenarios → Knowledge check → Checklist → Certificate.

## Directives to append to the CSIR MEGA PROMPT
- **Reuse the app shell and flow engine:** Keep the current navigation, router, storage/persistence, and layout. Do not rebuild the shell—simply plug the CSIR experience into it.
- **Swap in CSIR sections in the new order:** Replace the existing sections with the CSIR pages/content and enforce the flow sequence listed above.
- **Certificate generation (PDF + PNG):** Ensure the certificate download flow produces both PDF and PNG outputs while preserving existing styling and metadata.
- **Knowledge-check gating:** Keep Checklist and Certificate locked until the learner passes the knowledge check, and integrate this gating with the existing flow controls.

Copy/paste the full CSIR MEGA PROMPT plus these directives when kicking off the Release 3 build.
