# CSIR Training Platform Upgrade Plan

This document provides an implementation-ready blueprint for bringing the DecisionMaker CSIR training platform into alignment with the CSIR Plan, covering all roles, the full incident lifecycle, and reusable architecture for future CIP modules (e.g., CIP-005, CIP-010). Use it as a guide for designers, content authors, and developers.

## 1) Implement role-aware learning paths
- **Role selection screen:** On first launch, prompt learners to choose one or more roles (Incident Commander/Manager, Technical Responder, Compliance Staff, General Staff). Store the choice so the UI can personalize the flow and remember the selection between visits.
- **Dynamic content branching:** Adjust the scenario and helper content per role:
  - Incident Commanders focus on team coordination and communications.
  - Technical Responders emphasize investigation, containment techniques, and problem solving.
  - Compliance Staff receive CIP-008 evidence collection, documentation, and reporting guidance.
  - General Staff get a streamlined track that stresses incident recognition and how to report.
- **Role-specific checklists:** Offer downloadable or on-screen checklists derived from the CSIR Plan roles/responsibilities section. Keep them accessible during the scenario so users can reference steps quickly.

## 2) Cover the full CSIR incident lifecycle
- **Preparation module (CSIR Plan 8.1):** Add a short interactive briefing on readiness activities (tooling in place, team training, forensics readiness).
- **Identification & analysis:** Keep the malware alert scenario but require learners to classify the event (Cyber Event vs. Cyber Security Incident vs. Attempt vs. Reportable) using Appendix C criteria. Include a decision on whether it is a “Reportable Cyber Security Incident” or an “Attempt to Compromise,” with corrective feedback.
- **Containment/response:** Continue through immediate response (isolate systems, credential resets) and require role-appropriate notifications (SOC, Incident Commander). Include a decision on contacting the City’s Incident Management Team when severity warrants.
- **Recovery (CSIR Plan 8.5):** Add steps to restore from backups/reinstall and require a decision on when to return systems to service and validate they are clean.
- **Follow-up:** Require lessons-learned actions, CSIR Plan updates, and control testing. For Compliance roles, include CIP-008-6 R3 documentation and evidence log updates.
- **Regulatory reporting workflow:** Simulate a DOE-417 report segment (key fields, routing to E-ISAC/CISA) and reinforce timelines (1 hour for reportable incidents, end of next business day for attempts).
- **Visual aids:** Embed or reference an incident lifecycle flow diagram (Preparation → Identification → Investigation → Response → Recovery → Follow-Up).

## 3) Modularize the training content
- **Module breakdown:** Organize into Orientation, Incident Response Overview (theory), Role Responsibilities, Scenario Exercise, Knowledge Check & Conclusion (each ~5–10 minutes).
- **Menu & progress bar:** Add sidebar/top navigation that shows modules with completion states and a global progress bar.
- **Module navigation:** Allow forward/back navigation while gating the final assessment and certificate until all modules are complete.
- **Save state:** Persist module completion, assessment scores, and certificate unlocks in `localStorage` (or cookies) so users can resume where they left off.

## 4) Professional and low-clutter UI redesign
- **Responsive layout:** Use a two-column desktop layout (content on the left, decisions/visuals on the right) with a single-column fallback on small screens.
- **Visual consistency:** Apply a unified palette (e.g., Seattle City Light blues/neutrals), consistent sans-serif typography, and uniform buttons/icons. Include City Light or CSIR branding where available.
- **Simplified screens:** Present concise scenario descriptions first, then 2–3 clear choices; show outcome feedback in a fresh view or modal to reduce clutter.
- **Text formatting:** Prefer short paragraphs, bullets, and callouts/tooltips for definitions (e.g., “Reportable Cyber Security Incident”). Avoid long walls of text.
- **Accessibility:** Ensure sufficient contrast, alt text for diagrams, keyboard access for all controls, and ARIA labels for custom elements. Validate with a screen reader.
- **Feedback and alerts:** Use green success and gentle red error states with clear guidance (“Click Next to continue”) and a supportive tone.

## 5) Guided workflow from start to certificate
- **Orientation module:** Welcome learners, state objectives, estimated time, and instructions (e.g., “You’ll navigate interactive scenarios and must complete all sections.”).
- **Inline knowledge checks:** Place quick quizzes/decision points throughout to reinforce key ideas before the final assessment.
- **Final assessment:** Provide 5–10 questions covering roles, lifecycle steps, and reporting criteria. Require a passing score (e.g., 80%) with feedback and retries.
- **Certificate generation:** After all modules plus a passing score, generate a PDF/image certificate (“Operational Technology Cyber Security Incident Response Training”) with learner name, completion date, and a unique ID. Offer download/email options; gate until completion.
- **Completion evidence logging:** If a backend or third-party endpoint exists, send completion data (name, role, date, score). If not, instruct learners to email their certificate and record a local completion flag.
- **User feedback and next steps:** Conclude with a congratulatory message and next actions (apply learnings, reference the CSIR Plan and role checklist, explore future CIP modules like CIP-005/CIP-010).

## 6) Content enhancements and accuracy
- **Embed policy details:** Present CSIR definitions verbatim where needed (e.g., Reportable Cyber Security Incident, reporting timelines: 1 hour/next business day).
- **Include all incident types:** Add brief scenarios or exercises for other types (malicious code, intrusion, DoS, phishing, etc.) to broaden coverage.
- **First responder checklists:** Emphasize immediate actions and evidence handling; provide interactive lists or downloadable PDFs.
- **Link to plan document:** Add a resources/help section with a link to the full CSIR Plan (or an abridged version) so learners know where to find deeper procedures.

## 7) Eliminate redundant or confusing paths
- **Streamline decision points:** Remove or consolidate branches that lead to identical outcomes so every choice has a distinct learning impact.
- **Clarity in outcomes:** When paths converge, acknowledge how the learner’s choice arrived there (e.g., “Your supervisor escalated to the Incident Commander…”).
- **Error recovery:** Use poor decisions as teaching moments with “what happened next” explanations, then allow rewinds instead of dead ends.
- **Consistent branch length:** Balance branch depths so no path skips core content or is disproportionately long/short.

## 8) Enhance interactivity and engagement
- **Decision prompts:** Highlight questions and present answer buttons prominently (e.g., bold prompt plus clear buttons).
- **Multimedia use:** Include supportive images/icons/animations (e.g., phishing example, shield icon) while keeping assets lightweight.
- **Gamification elements:** Optionally award points/badges for correct decisions and show a final score, without distracting from learning.
- **Scenario realism:** Add gentle urgency cues (timers/indicators) with textual descriptions and user controls to pause/mute/skip non-essential effects.
- **User control:** Let users pause/mute audio and skip non-critical animations to set their own pace.

## 9) Progress tracking and compliance reporting
- **User identification:** Prompt for a name/ID to personalize the experience and stamp certificates.
- **Completion log:** If possible, post completion data to a secure datastore (e.g., Google Apps Script endpoint); otherwise instruct learners to email certificates. Always store a local completion marker.
- **Analytics:** Track anonymized drop-off points and frequently missed decisions to guide future improvements (respect privacy requirements).
- **Frequency and retake:** Indicate completion date/version on certificates to support annual retraining and plan updates.

## 10) Reusability for other CIP modules
- **Scalable structure:** Externalize scenarios, quizzes, and copy into JSON/Markdown so new courses (CIP-005, CIP-010, etc.) can be added without core code changes.
- **Course selection page:** Provide a landing hub listing available trainings with descriptions and Start buttons.
- **Shared components:** Reuse progress tracking, certificates, role selection, and UI theme; allow course-specific role lists via configuration.
- **Styling and theming:** Maintain a common brand; allow minor accent overrides per course via config.
- **Content maintenance:** Ship authoring templates/examples so non-developers can add modules consistently.
- **Testing across modules:** Ensure progress and certificates are course-specific, even when users complete multiple trainings.

## Outcomes
- **Full CSIR alignment:** Training mirrors the CSIR Plan across all lifecycle phases with role-specific guidance.
- **Enhanced learner experience:** Clear, modular navigation with interactive branching that makes decisions meaningful and engaging.
- **Professional, accessible UI:** Modern, low-clutter design with accessibility baked in.
- **Complete workflow:** Orientation through certification with evidence logging for compliance (CIP-004/CIP-008 support).
- **Reuse for CIP family:** Architecture enables rapid rollout of additional CIP trainings while keeping UX consistent.

## Suggested implementation sequence
1. Build the modular shell (navigation, state persistence, gating of assessment/certificate).
2. Add role selection, role-aware content bindings, and checklists.
3. Expand lifecycle content (prep → follow-up) including DOE-417 reporting simulation and recovery steps.
4. Implement assessment, scoring, certificate generation, and completion logging hooks.
5. Polish UI/UX (responsive layout, accessibility), refine branching, and add supporting media.
6. Externalize content config and launch the multi-course hub for additional CIP modules.
