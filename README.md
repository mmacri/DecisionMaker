# Seattle City Light — OT CSIR Training Portal

A static, GitHub Pages–ready training portal that delivers guided, role-based OT Cyber Security Incident Response (CSIR) training aligned to the Seattle City Light OT CSIR Plan (Dec 2025). The site enforces progression, tracks progress locally, delivers a mandatory knowledge check, and issues downloadable certificates.

## How to run locally
1. Clone the repo and open the folder.
2. Serve the site with any static server (no build needed). Examples:
   - `python3 -m http.server 8000`
   - `npx serve`
3. Visit `http://localhost:8000/index.html#/landing`.
4. Progress, role selection, quiz results, and certificate metadata are stored in `localStorage` (keys: `csir_profile`, `csir_progress`, `csir_certificate`).

## Deploy on GitHub Pages
1. Commit and push to the default branch.
2. Enable GitHub Pages on the repository (root folder).
3. Access the site via the GitHub Pages URL, using hash routes such as `#/landing` and `#/knowledge-check`.

## Update training content
Training copy, roles, quiz, scenarios, and checklist content are all JSON-driven:
- `data/csir_training_content.json` — Page titles, bodies, and completion criteria.
- `data/csir_roles.json` — Role definitions and dynamic callouts per page group.
- `data/csir_quiz.json` — 10-question knowledge check with answers and explanations.
- `data/csir_scenarios.json` — Role-aware scenarios with expected actions.
- `data/csir_checklist.json` — Operational checklist grouped by CSIR phases.

Update these files to change copy without touching layout or logic. Keep IDs stable to preserve routing.

## Key workflows
- **Guided flow:** Sidebar navigation and Back/Next controls step through the 20-page module in order.
- **Resume:** Landing page shows a resume button that returns to the last visited page.
- **Role switching:** Top-right dropdown updates role-specific callouts, scenarios, and certificate metadata.
- **Knowledge check gating:** Checklist and certificate remain locked until a score of 80% or higher.
- **Downloads:** Checklist downloads as HTML; certificates download as PNG and PDF.

## Project structure
```
index.html
assets/
  css/ (theme, layout, components)
  js/ (router, app logic, storage, progress, role, quiz, certificate, download)
data/ (JSON content for all pages, roles, quiz, scenarios, checklist)
pages/ (HTML partials rendered via router)
```
