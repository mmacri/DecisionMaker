# Release 3 — Agent Prompt Addendum

Use this addendum with the existing **CSIR MEGA PROMPT**. Keep the original wording and append the following directives so the agent reuses the current UX/app shell and only swaps in the CSIR experience in the new order.

## New flow order
Landing → Role selection gate → Foundation → Role path → Scenarios → Knowledge check → Checklist → Certificate.

## Directives to append
- Reuse the existing app shell and flow engine; do not rebuild the navigation, routing, or persistence layers.
- Replace the current sections with the CSIR pages/content, respecting the new sequence above.
- Implement certificate generation in both PDF and PNG formats (maintain existing styling/metadata, only update the flow integration).
- Enforce knowledge-check gating: Checklist and Certificate remain locked until the learner passes the knowledge check.

Copy/paste the full CSIR MEGA PROMPT plus these directives for the Release 3 build.
