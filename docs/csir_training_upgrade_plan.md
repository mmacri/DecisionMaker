# CSIR Training Platform Upgrade Blueprint

This document consolidates the requested improvements for the DecisionMaker CSIR training platform into implementation-ready guidance. It is organized so designers and developers can map work items to code changes, content authoring, and UX updates.

## 1) Role-aware learning paths
- **Role selection entry:** Add a first-run screen that prompts users to select one or more roles (Incident Commander/Manager, Technical Responder, Compliance Staff, General Staff). Store the selection for dynamic content loading.
- **Dynamic branching:** Tailor scenarios, hints, and feedback per role (e.g., Incident Commanders emphasize coordination/communications; Technical Responders focus on investigation; Compliance Staff receive CIP-008 evidence and reporting guidance; General Staff get streamlined reporting basics).
- **Role checklists:** Provide on-screen and downloadable checklists summarizing duties from the CSIR Plan roles section for quick reference during the scenario.

## 2) Full CSIR incident lifecycle coverage
- **Preparation:** Add a briefing module that covers tooling readiness, team preparation, and forensics readiness (align to CSIR Plan 8.1).
- **Identification & analysis:** Keep the malware alert scenario but require classification (Cyber Event vs. Incident vs. Attempt vs. Reportable) using Appendix C criteria, including a decision on reportability.
- **Containment/response:** Continue through immediate response steps with role-appropriate notifications (SOC, Incident Commander, Incident Management Team when severity warrants).
- **Recovery:** Add restoration steps (backups, reinstall) and a decision on when to return systems to service (CSIR Plan 8.5).
- **Follow-up:** Conclude with lessons learned, plan updates, control testing, and CIP-008-6 R3 documentation tasks for compliance roles.
- **Regulatory reporting simulation:** Include DOE-417 reporting walkthrough (key fields, E-ISAC/CISA submission timelines: 1 hour for reportable incidents, end of next business day for attempts).
- **Visual aids:** Embed an incident lifecycle flow diagram (Preparation → Identification → Investigation → Response → Recovery → Follow-Up).

## 3) Modularized course structure
- **Module breakdown:** Orient the course into Orientation, IR Overview, Role Responsibilities, Scenario Exercise, Knowledge Check & Conclusion (5–10 minutes each).
- **Navigation and progress:** Provide sidebar/top menu with per-module completion states plus a global progress bar. Allow forward/back navigation but gate the final assessment until all modules are completed.
- **State persistence:** Save progress (completed modules, assessment score, certificate unlocked) in `localStorage` so users can resume.

## 4) Professional, low-clutter UI
- **Responsive layouts:** Use a two-column desktop layout (content + actions/visual) with mobile-friendly single-column fallback.
- **Branding and consistency:** Apply a cohesive palette (e.g., City Light blues/neutrals), typography, consistent buttons/icons, and optional logo placement.
- **Progressive disclosure:** Present concise decision prompts with limited choices and reveal feedback on a fresh view/modal.
- **Accessibility:** Ensure sufficient contrast, keyboard navigation, ARIA labels, alt text for diagrams, and screen-reader friendly structures.
- **Feedback styling:** Use gentle success/error accents with coaching guidance and clear next-step cues.

## 5) Guided workflow to certificate
- **Orientation:** Welcome screen with objectives, estimated time, instructions, and course overview.
- **Inline knowledge checks:** Sprinkle short quizzes/decisions to reinforce key concepts before the final assessment.
- **Final assessment:** 5–10 questions covering roles, lifecycle, and reporting; require a passing score (e.g., 80%) with feedback and retries.
- **Certificate generation:** After completion and passing score, generate a PDF/image certificate (course name, learner name, date, certificate ID) with download/email options; only unlock after all modules are done.
- **Completion evidence:** Log completion data (name, role, date, score) via backend/API if available; otherwise instruct users to email certificates and store a local completion flag.
- **Conclusion messaging:** Provide congratulatory summary and next-step guidance (apply learnings, reference CSIR Plan, explore future CIP modules like CIP-005/CIP-010).

## 6) Content accuracy and breadth
- **Policy embedding:** Include CSIR definitions (e.g., Reportable Cyber Security Incident, reporting timelines) verbatim where needed.
- **Incident variety:** Add short decision points for multiple incident types (malicious code, intrusion, DoS, phishing, etc.) to broaden exposure.
- **First responder checklists:** Surface or link to checklists for immediate actions and evidence handling.
- **Plan access:** Link to the CSIR Plan (or abridged version) in resources/help for deeper reference.

## 7) Streamlined branching logic
- **Meaningful choices:** Remove redundant paths; ensure each decision produces distinct feedback or consequences.
- **Acknowledged convergence:** When branches merge, narrate how choices led there (e.g., supervisor escalation) to maintain coherence.
- **Error recovery:** Use incorrect choices as teaching moments and allow rewinds instead of dead ends.
- **Balanced branch depth:** Keep branch lengths comparable so all learners experience the core phases.

## 8) Interactivity and engagement
- **Clear prompts:** Highlight questions and present answer buttons prominently.
- **Lightweight media:** Use supportive images/icons/animations sparingly to illustrate key concepts (e.g., phishing email example).
- **Optional gamification:** Track points/badges subtly without distracting from learning outcomes.
- **Scenario realism:** Use gentle urgency cues (timers/indicators) with accessibility-friendly descriptions and user controls (pause/mute/skip).

## 9) Progress tracking and compliance reporting
- **User identification:** Prompt for name/ID to personalize experience and certificates.
- **Completion logging:** If possible, send completion data to a secure endpoint or instruct users to email certificates; at minimum, record locally.
- **Analytics:** Track anonymized drop-off/failure points to inform content improvements (ensure privacy compliance).
- **Retake readiness:** Support annual retraining and display completion dates/versions on certificates.

## 10) Reusable architecture for other CIP modules
- **Config-driven content:** Externalize scenarios, quizzes, and copy into JSON/Markdown to enable course swaps (e.g., CIP-005, CIP-010) without code changes.
- **Course hub:** Provide a landing page listing available trainings with start buttons and descriptions.
- **Shared components:** Reuse progress tracking, certificates, role selection, and UI theming; allow course-specific role lists via config.
- **Theming:** Maintain a common style with optional accent overrides per module.
- **Authoring guidance:** Supply templates/examples so content contributors can add new modules without editing core logic.
- **Multi-course evidence:** Ensure completion tracking and certificates remain course-specific when multiple trainings are completed.

## Implementation sequencing (suggested)
1. Introduce the modular course shell with navigation, progress state, and gating of assessments.
2. Add role selection, role-aware content placeholders, and role checklists.
3. Build out lifecycle modules (prep through follow-up) with DOE-417 reporting simulation and recovery steps.
4. Implement assessments, certificate generation, and completion logging hooks.
5. Polish UI/UX (responsive layout, accessibility), add media, and streamline branching logic.
6. Externalize content configuration and create a course hub to enable additional CIP modules.
