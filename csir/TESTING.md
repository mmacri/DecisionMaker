# CSIR Player Test Plan

1. **Start Certification Mode fresh**
   - Visit `player.html?track=csir-cert&m=1&s=1`.
   - Confirm Module 1 Step 1 loads with course map showing other modules locked.
2. **Complete Module 1 Step 1**
   - Click **Mark as read** to complete the overview and ensure **Next** becomes enabled.
3. **Complete Step 2 quiz**
   - Answer all questions; submit until score is ≥70%.
   - Verify **Next** moves to Module 2 Step 1 and does not skip modules.
4. **Repeat through Module 6**
   - Complete overview + knowledge check for Modules 2–6; confirm progression stays linear.
5. **Module 7 gating**
   - Confirm Module 7 remains locked until Modules 1–6 are completed, then unlocks.
6. **Pass exam and download certificate**
   - In Module 7 Step 2 score ≥80%; ensure certificate download button enables and PDF generates with name/role/timestamp/ID.
7. **Resume state**
   - Refresh the page; ensure `player.html?resume=1` returns to the last saved module and step.
8. **Interactive Mode manual completion**
   - Launch `player.html?track=csir-interactive`.
   - For a module’s Training step, check the confirmation box and click **Mark step complete** to unlock **Next** without relying on runtime triggers.
