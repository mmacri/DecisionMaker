(function(){
  const modules = [
    {
      title: 'CSIR Overview',
      steps: [
        {
          type: 'overview',
          title: 'Overview',
          sections: [
            { heading: 'Why this module', body: 'Ground responders in the purpose and boundaries of the OT CSIR plan so we protect reliability, safety, and regulatory posture from the first alert.' },
            { heading: 'Objectives', list: ['Recall scope: BES Cyber Assets, ECAMS, PACS, and OT systems owned by SCL.', 'Differentiate Cyber Event, Attempt to Compromise (AtC), and Cyber Incident.', 'Apply the 15-minute escalation rule to anything that smells like an incident or AtC.', 'Confirm assumptions: updated contacts, backups, and evidence handling ready before response.'] },
            { heading: 'What you will do', list: ['Review the plan intent and definitions.', 'Walk through guided micro-steps with embedded questions to lock in the rules.', 'Finish ready to progress to Module 2 without skipping required checks.'] },
          ]
        },
        {
          type: 'guided',
          title: 'Guided Training',
          microSteps: [
            {
              id: 'm1-ms1',
              title: 'Purpose of the OT CSIR plan',
              lessonHtml: '<p>The CSIR plan gives SCL a repeatable, auditable way to protect people, grid reliability, and compliance. It aligns responders so containment and recovery happen fast without improvising approvals.</p>',
              question: {
                type: 'mcq',
                prompt: 'What is the CSIR plan designed to deliver for OT operations?',
                options: ['Automated patching for all substations', 'Consistent, auditable response that protects safety and reliability', 'Shorter project timelines', 'Vendor-led resolutions only'],
                correctIndex: 1,
                explanation: 'The plan standardizes OT incident handling so responders protect reliability, safety, and compliance with traceable decisions.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm1-ms2',
              title: 'Scope of systems',
              lessonHtml: '<p>In scope: BES Cyber Assets, ECAMS, PACS, OT control center systems, substations, and other SCL-owned OT. Seattle IT-managed corporate systems follow their path but must be escalated when they intersect OT.</p>',
              question: {
                type: 'mcq',
                prompt: 'Which systems are explicitly in scope for this plan?',
                options: ['Personal home networks', 'Any public internet site', 'BES Cyber Assets, ECAMS, PACS, and SCL-owned OT systems', 'Only corporate laptops'],
                correctIndex: 2,
                explanation: 'The plan covers SCL-owned OT including BES Cyber Assets, ECAMS, PACS, and control systems; other systems route through Seattle IT escalation.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm1-ms3',
              title: 'Cyber Event vs AtC vs Incident',
              lessonHtml: '<ul><li><strong>Cyber Event:</strong> observable occurrence that may affect OT.</li><li><strong>Attempt to Compromise (AtC):</strong> credible attempt to violate controls even if blocked.</li><li><strong>Cyber Incident:</strong> confirmed compromise or outage impacting confidentiality, integrity, availability, or safety.</li></ul>',
              question: {
                type: 'mcq',
                prompt: 'Which statement is correct?',
                options: ['An AtC is only successful attacks', 'An incident only counts after recovery', 'An AtC is a credible blocked attempt; an incident is confirmed impact', 'Events and incidents are identical'],
                correctIndex: 2,
                explanation: 'An AtC is a credible attempt that may have been blocked; an incident has confirmed impact to OT services or safety.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm1-ms4',
              title: '15-minute escalation rule',
              lessonHtml: '<p>If an alert looks like an incident or AtC, notify the Incident Commander and Technical Lead within 15 minutes using the incident bridge or Service Desk channel. Fast escalation keeps evidence preserved and authorizes containment.</p>',
              question: {
                type: 'mcq',
                prompt: 'When should a potential OT incident or AtC be escalated?',
                options: ['At the end of the shift', 'Within 15 minutes to the IC/Technical Lead', 'After recovery', 'Only if media calls'],
                correctIndex: 1,
                explanation: 'The plan requires escalation within 15 minutes so leadership can classify, contain, and notify regulators if needed.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm1-ms5',
              title: 'Assumptions before response',
              lessonHtml: '<ul><li>Contacts, call trees, and bridge details are current.</li><li>Backups and system images are verified and documented.</li><li>Evidence handling procedures are ready and practiced.</li><li>Change approvals and approvers are known in advance.</li></ul>',
              question: {
                type: 'mcq',
                prompt: 'Why keep backups and contact lists current before incidents occur?',
                options: ['To reduce payroll', 'So containment, approvals, and recovery can start immediately', 'For marketing reports', 'To avoid documenting actions'],
                correctIndex: 1,
                explanation: 'Prepared contacts and backups allow teams to escalate, contain, and recover quickly without scrambling for approvals or images.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm1-ms6',
              title: 'Evidence-friendly mindset',
              lessonHtml: '<p>Record timestamps, who observed the issue, and initial classification. Preserve logs and avoid changes that destroy evidence until containment is approved.</p>',
              question: {
                type: 'mcq',
                prompt: 'What early action protects evidence?',
                options: ['Rebooting immediately', 'Documenting detection time, observer, and preserving logs', 'Deleting alerts', 'Switching off monitoring'],
                correctIndex: 1,
                explanation: 'Documenting detection details and preserving logs keeps the chain of evidence intact for investigation and regulators.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm1-ms7',
              title: 'When Seattle IT is involved',
              lessonHtml: '<p>If a corporate IT issue threatens OT, log an OT incident and coordinate with Seattle IT, but keep ownership of OT impacts. Use the CSIR bridge and classification rules for any OT touchpoint.</p>',
              question: {
                type: 'mcq',
                prompt: 'How should OT teams react when a Seattle IT issue affects OT data flows?',
                options: ['Wait for IT to finish', 'Open an OT incident, coordinate, and keep OT classification active', 'Ignore unless outage lasts 24 hours', 'Move OT assets to public internet'],
                correctIndex: 1,
                explanation: 'Open an OT incident and coordinate with Seattle IT while retaining OT-focused classification, escalation, and evidence steps.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm1-ms8',
              title: 'Success measures',
              lessonHtml: '<p>We measure success by rapid escalation, preserved evidence, safe containment, and accurate documentation that satisfies audits and lessons learned.</p>',
              question: {
                type: 'mcq',
                prompt: 'Which outcome signals the plan is working?',
                options: ['Untracked fixes', 'Rapid escalation with preserved evidence and documented containment', 'Skipping approvals to go faster', 'Silencing alarms'],
                correctIndex: 1,
                explanation: 'Timely escalation, preserved evidence, and documented containment show the plan is effective and audit-ready.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm1-ms9',
              title: 'Local progress tracking',
              lessonHtml: '<p>The player stores module, step, and micro-step completion in localStorage so you can resume even if you refresh.</p>',
              question: {
                type: 'mcq',
                prompt: 'Where is your training progress stored to allow resuming?',
                options: ['Only in memory', 'localStorage on this browser', 'A remote SIEM', 'An email thread'],
                correctIndex: 1,
                explanation: 'Progress is kept in localStorage so guided training, modules, and exams can resume where you left off.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm1-ms10',
              title: 'Ready to proceed',
              lessonHtml: '<p>With scope, definitions, and escalation rules understood, you can move into roles and communications without skipping prerequisites.</p>',
              question: {
                type: 'mcq',
                prompt: 'What unlocks Module 2?',
                options: ['Skipping Module 1', 'Completing Module 1 guided training steps', 'Waiting 24 hours', 'Only taking the exam'],
                correctIndex: 1,
                explanation: 'Module 2 unlocks when Module 1 guided training is complete, keeping the linear certification sequence intact.',
              },
              completionRule: 'answer-or-ack',
            },
          ]
        }
      ]
    },
    {
      title: 'Roles, Responsibilities, Communications',
      steps: [
        {
          type: 'overview',
          title: 'Overview',
          sections: [
            { heading: 'Why this module', body: 'Clear roles and disciplined communications keep containment on track and ensure regulatory notifications are timely.' },
            { heading: 'Objectives', list: ['Name the Incident Commander, Technical Lead, Compliance/ECS roles, and dispatch expectations.', 'Apply the 15-minute escalation rule and bridge etiquette.', 'Use communication layers to keep leadership, IMT, and regulators aligned.'] },
            { heading: 'What you will do', list: ['Practice who to call and how to report signals.', 'Work through micro-scenarios about comms discipline.', 'Confirm when to engage City IMT and external partners.'] },
          ]
        },
        {
          type: 'guided',
          title: 'Guided Training',
          microSteps: [
            {
              id: 'm2-ms1',
              title: 'Incident Commander role',
              lessonHtml: '<p>The Incident Commander (IC) sets objectives, assigns owners, keeps timelines, and ensures reporting commitments are met.</p>',
              question: {
                type: 'mcq',
                prompt: 'What is the IC’s primary duty?',
                options: ['Perform every technical task', 'Set objectives, track status, and meet reporting timelines', 'Avoid regulator contact', 'Approve every firewall change personally'],
                correctIndex: 1,
                explanation: 'The IC sets direction, tracks progress, and ensures required notifications are on time.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm2-ms2',
              title: 'Technical Lead',
              lessonHtml: '<p>The Technical Lead drives investigation and containment decisions, coordinates with asset owners, and validates recovery readiness.</p>',
              question: {
                type: 'mcq',
                prompt: 'Who leads technical investigation and containment choices?',
                options: ['Marketing', 'Technical Lead', 'Facilities', 'Vendors alone'],
                correctIndex: 1,
                explanation: 'The Technical Lead synthesizes evidence and directs containment and recovery with asset owners.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm2-ms3',
              title: 'Compliance and ECS partners',
              lessonHtml: '<p>Compliance and ECS confirm reportability, evidence retention rules, and regulator notification timing. Engage them early for potential CIP-008 triggers.</p>',
              question: {
                type: 'mcq',
                prompt: 'When should Compliance/ECS join?',
                options: ['Only after recovery', 'Early, when classification or reportability may be in play', 'Never for OT', 'Only for Low severity'],
                correctIndex: 1,
                explanation: 'Compliance/ECS should join early to advise on CIP-008, DHS/CISA, and evidence handling requirements.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm2-ms4',
              title: 'Dispatch and Control',
              lessonHtml: '<p>Dispatchers and Control are frontline sensors. They should open an incident/bridge immediately with observations and keep logs running.</p>',
              question: {
                type: 'mcq',
                prompt: 'What should dispatch do upon unusual OT alarms?',
                options: ['Silence alarms and wait', 'Open the incident/bridge with observations within 15 minutes', 'Fix solo', 'Ignore if brief'],
                correctIndex: 1,
                explanation: 'Dispatch and Control should open the incident and escalate fast so the IC/Technical Lead can assess.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm2-ms5',
              title: '15-minute communications muscle',
              lessonHtml: '<p>Alerts that look like AtC or incidents must be shared with IC/Technical Lead within 15 minutes. Include what changed, systems involved, and observable impact.</p>',
              question: {
                type: 'mcq',
                prompt: 'What is expected within 15 minutes?',
                options: ['Draft press release', 'IC/Technical Lead notified with key observations', 'Full root-cause writeup', 'Vendor contracts signed'],
                correctIndex: 1,
                explanation: 'A concise, timely escalation with observations keeps decisions fast and defensible.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm2-ms6',
              title: 'Bridge etiquette',
              lessonHtml: '<ul><li>Identify yourself and role when joining.</li><li>Keep updates concise with facts and timestamps.</li><li>Log decisions and approvals in the ticket/bridge notes.</li><li>Summarize next actions before leaving.</li></ul>',
              question: {
                type: 'mcq',
                prompt: 'Which behavior matches bridge etiquette?',
                options: ['Talking over others', 'Sharing concise facts with timestamps and owners', 'Skipping notes', 'Using side channels only'],
                correctIndex: 1,
                explanation: 'Concise, timestamped updates with owners keep the bridge orderly and auditable.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm2-ms7',
              title: 'Engaging City IMT and partners',
              lessonHtml: '<p>Engage City IMT and external partners for Critical/High severity or AtC on BES assets. IC coordinates to avoid duplicate outreach.</p>',
              question: {
                type: 'mcq',
                prompt: 'When should City IMT be engaged?',
                options: ['Only after lessons learned', 'For Critical/High events or AtC on BES assets', 'Never for OT', 'Only if media asks'],
                correctIndex: 1,
                explanation: 'Critical/High or BES-related AtC warrant IMT and partner involvement to align resources and notifications.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm2-ms8',
              title: 'Shift handoff discipline',
              lessonHtml: '<p>Handoffs require a concise summary: classification, severity, actions taken, outstanding approvals, and next milestones.</p>',
              question: {
                type: 'mcq',
                prompt: 'What must be shared during shift handoff?',
                options: ['Only personal opinions', 'Classification, severity, actions, and pending approvals', 'Nothing if quiet', 'Social updates'],
                correctIndex: 1,
                explanation: 'Structured handoffs prevent loss of context and keep containment and reporting on track.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm2-ms9',
              title: 'Single source of truth',
              lessonHtml: '<p>Ticket/bridge notes are the source of truth. Decisions or approvals in chat must be captured in the record to satisfy audits.</p>',
              question: {
                type: 'mcq',
                prompt: 'Where should critical decisions be recorded?',
                options: ['Only in private chat', 'In the ticket/bridge notes with who approved and when', 'Not recorded', 'On sticky notes'],
                correctIndex: 1,
                explanation: 'Documenting decisions in the ticket/bridge creates the auditable record regulators expect.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm2-ms10',
              title: 'Communication pitfalls',
              lessonHtml: '<p>Avoid speculation, avoid sharing sensitive OT details over unsecured channels, and escalate unknowns instead of guessing.</p>',
              question: {
                type: 'mcq',
                prompt: 'How should unknowns be handled?',
                options: ['Guess a cause', 'Escalate with facts and defer until evidence exists', 'Hide alerts', 'Send unvetted details externally'],
                correctIndex: 1,
                explanation: 'Escalate unknowns transparently and avoid speculation to maintain trust and audit quality.',
              },
              completionRule: 'answer-or-ack',
            },
          ]
        }
      ]
    },
    {
      title: 'Terminology, Classification, Severity',
      steps: [
        {
          type: 'overview',
          title: 'Overview',
          sections: [
            { heading: 'Why this module', body: 'Consistent classification and severity drive correct escalation paths, regulator notifications, and resourcing.' },
            { heading: 'Objectives', list: ['Apply Event/AtC/Incident terminology accurately.', 'Assign severity using impact cues and escalate appropriately.', 'Capture classification decisions with timestamps for audit and regulator readiness.'] },
            { heading: 'What you will do', list: ['Practice classification calls.', 'Tie severity to response triggers.', 'Log decisions the way CIP-008 reviewers expect.'] },
          ]
        },
        {
          type: 'guided',
          title: 'Guided Training',
          microSteps: [
            {
              id: 'm3-ms1',
              title: 'Classification anchors',
              lessonHtml: '<p>Use Event, AtC, or Incident consistently. AtC triggers immediate notice even when blocked. Incident requires confirmed impact.</p>',
              question: {
                type: 'mcq',
                prompt: 'How is an AtC different from an Incident?',
                options: ['AtC is accidental', 'AtC is a credible blocked attempt; Incident has confirmed impact', 'No difference', 'Incident happens only after recovery'],
                correctIndex: 1,
                explanation: 'AtC is a credible attempt even if stopped; an Incident has confirmed impact to OT services or safety.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm3-ms2',
              title: 'Severity cues: Critical',
              lessonHtml: '<p>Critical: major outage, safety risk, or confirmed compromise of BES Cyber Systems. Expect regulator notice and IMT engagement.</p>',
              question: {
                type: 'mcq',
                prompt: 'Which situation is Critical?',
                options: ['Minor nuisance alarm', 'Confirmed compromise of BES Cyber System with outage risk', 'Isolated lab issue', 'Routine maintenance'],
                correctIndex: 1,
                explanation: 'Critical involves confirmed compromise or outage risk to BES Cyber Systems or safety.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm3-ms3',
              title: 'Severity cues: High',
              lessonHtml: '<p>High: significant degradation, widespread malware, or active attacker pivot without confirmed outage. Coordinate tightly with Compliance.</p>',
              question: {
                type: 'mcq',
                prompt: 'Which best fits High severity?',
                options: ['Noise from test lab only', 'Widespread malware on OT endpoints without outage yet', 'Single user ticket', 'Planned patch window'],
                correctIndex: 1,
                explanation: 'High covers widespread malicious activity that threatens operations even before full outage.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm3-ms4',
              title: 'Severity cues: Medium/Low',
              lessonHtml: '<p>Medium: contained scope, controlled impact. Low: low impact, monitored only. Both still require documentation and watchpoints.</p>',
              question: {
                type: 'mcq',
                prompt: 'A contained malware alert on one isolated workstation with no lateral movement is likely:',
                options: ['Critical', 'High', 'Medium', 'Out of scope'],
                correctIndex: 2,
                explanation: 'With limited scope and containment, Medium fits; still document and monitor.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm3-ms5',
              title: 'Reportability triggers',
              lessonHtml: '<p>BES reportable indicators: impact or sustained risk to BES Cyber Systems, loss of required logging, or confirmed compromise. Engage Compliance immediately.</p>',
              question: {
                type: 'mcq',
                prompt: 'Loss of security logs on a BES Cyber Asset is treated as:',
                options: ['Low severity', 'Potentially High/Critical and reportable', 'Not relevant', 'Automatically recovered without notice'],
                correctIndex: 1,
                explanation: 'Loss of required logging on a BES asset is potentially reportable and demands rapid classification and escalation.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm3-ms6',
              title: 'Recording classification',
              lessonHtml: '<p>Log detection time, who classified, rationale, and severity. This supports CIP-008 timelines and later audits.</p>',
              question: {
                type: 'mcq',
                prompt: 'What must be recorded with every classification?',
                options: ['Only a verbal note', 'Time detected, who classified, and rationale', 'Nothing if resolved fast', 'Personal opinions only'],
                correctIndex: 1,
                explanation: 'Time, classifier, and rationale create the audit trail regulators expect.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm3-ms7',
              title: 'Escalation based on severity',
              lessonHtml: '<p>Critical/High: engage IC, Technical Lead, Compliance, IMT, and vendors as needed. Medium: IC/Technical Lead with targeted SMEs. Low: monitor and document.</p>',
              question: {
                type: 'mcq',
                prompt: 'Who must be involved for High severity?',
                options: ['No one beyond analyst', 'IC, Technical Lead, Compliance, possibly IMT', 'Marketing only', 'Only vendors'],
                correctIndex: 1,
                explanation: 'High demands leadership, compliance, and often IMT to manage risk and notifications.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm3-ms8',
              title: 'Multiple signals, one classification',
              lessonHtml: '<p>When multiple alerts point to the same activity, classify once and relate additional evidence under the same incident to avoid fragmentation.</p>',
              question: {
                type: 'mcq',
                prompt: 'How should related alerts be handled?',
                options: ['Open separate incidents for each log', 'Group related evidence under one classification to keep context', 'Ignore duplicates', 'Wait a week then decide'],
                correctIndex: 1,
                explanation: 'Grouping related evidence keeps scope clear and prevents duplicated reporting.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm3-ms9',
              title: 'Downgrades and upgrades',
              lessonHtml: '<p>Severity can change as evidence evolves. Document the reason for any downgrade/upgrade and who approved it.</p>',
              question: {
                type: 'mcq',
                prompt: 'What is required when changing severity?',
                options: ['No record', 'Document rationale and approver for the change', 'Delete prior notes', 'Wait until end'],
                correctIndex: 1,
                explanation: 'Recording rationale and approval maintains traceability and satisfies audit expectations.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm3-ms10',
              title: 'Confidence in calls',
              lessonHtml: '<p>When unsure, classify conservatively (AtC/Incident) and escalate. It is easier to downgrade with evidence than to explain late escalation.</p>',
              question: {
                type: 'mcq',
                prompt: 'If uncertain between Event and AtC:',
                options: ['Assume Event and stay silent', 'Classify as AtC and escalate within 15 minutes', 'Wait for daily standup', 'Ignore until outage'],
                correctIndex: 1,
                explanation: 'Escalating as AtC keeps response timely and is easier to downgrade than defending a delay.',
              },
              completionRule: 'answer-or-ack',
            },
          ]
        }
      ]
    },
    {
      title: 'Workflow by Phase',
      steps: [
        {
          type: 'overview',
          title: 'Overview',
          sections: [
            { heading: 'Why this module', body: 'The six-phase spine keeps containment safe, preserves evidence, and makes approvals predictable.' },
            { heading: 'Objectives', list: ['Follow the sequence: Preparation, Identification, Investigation, Response, Recovery, Follow-Up.', 'Know the expected outputs of each phase.', 'Avoid skipping approvals before containment and recovery.'] },
            { heading: 'What you will do', list: ['Practice decisions in each phase.', 'Tie actions to evidence retention and safety.', 'Reinforce containment-before-recovery discipline.'] },
          ]
        },
        {
          type: 'guided',
          title: 'Guided Training',
          microSteps: [
            {
              id: 'm4-ms1',
              title: 'Preparation essentials',
              lessonHtml: '<p>Maintain plans, backups, monitoring, contacts, and drills. Validate access to runbooks and vendor escalations before incidents.</p>',
              question: {
                type: 'mcq',
                prompt: 'What is a preparation task?',
                options: ['Waiting for alerts', 'Keeping backups/runbooks validated and contacts current', 'Ignoring vendor lists', 'Skipping drills'],
                correctIndex: 1,
                explanation: 'Preparation ensures resources and contacts are ready before an incident hits.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm4-ms2',
              title: 'Identification phase',
              lessonHtml: '<p>Detect, classify, and escalate within 15 minutes. Preserve initial evidence and avoid changes until containment is authorized.</p>',
              question: {
                type: 'mcq',
                prompt: 'Which action belongs in Identification?',
                options: ['Restoring from backup immediately', 'Classifying and escalating with preserved evidence', 'Changing configurations without approval', 'Closing alerts silently'],
                correctIndex: 1,
                explanation: 'Identification focuses on recognizing and escalating the issue with evidence intact.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm4-ms3',
              title: 'Investigation focus',
              lessonHtml: '<p>Define scope, affected assets, entry point, and attack path. Validate severity with SMEs and confirm what is and is not impacted.</p>',
              question: {
                type: 'mcq',
                prompt: 'Investigation success looks like:',
                options: ['Guessing root cause', 'Documented scope, impacted assets, and probable attack path', 'Rebooting everything', 'Ignoring logs'],
                correctIndex: 1,
                explanation: 'Investigation produces a clear scope and attack path to drive containment.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm4-ms4',
              title: 'Response/containment',
              lessonHtml: '<p>Contain and eradicate with approvals. Actions include isolating compromised hosts, blocking malicious access, and coordinating vendor actions. Capture before/after state.</p>',
              question: {
                type: 'mcq',
                prompt: 'Containment requires:',
                options: ['Skipping approvals', 'Documented isolation/blocking with approvals and evidence', 'Deleting all logs', 'Waiting for media'],
                correctIndex: 1,
                explanation: 'Containment must be approved and documented, preserving evidence of actions taken.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm4-ms5',
              title: 'Recovery gates',
              lessonHtml: '<p>Recovery starts after containment approval. Restore from trusted backups, validate integrity, and monitor closely before returning to production.</p>',
              question: {
                type: 'mcq',
                prompt: 'When should recovery begin?',
                options: ['Immediately after detection', 'After containment is approved and documented', 'Before understanding scope', 'Never'],
                correctIndex: 1,
                explanation: 'Recovery begins only after containment is approved to avoid reintroducing risk.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm4-ms6',
              title: 'Follow-Up and lessons',
              lessonHtml: '<p>Collect lessons, retain evidence, and update playbooks. Record regulator communications and outstanding preventive actions.</p>',
              question: {
                type: 'mcq',
                prompt: 'Which item belongs in Follow-Up?',
                options: ['Initiating containment', 'Documenting lessons, evidence retention, and preventive actions', 'Starting new outages', 'Ignoring feedback'],
                correctIndex: 1,
                explanation: 'Follow-Up captures lessons, evidence retention, and remediation commitments.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm4-ms7',
              title: 'Phase discipline',
              lessonHtml: '<p>Do not skip from Identification to Recovery. Phase discipline keeps approvals aligned and prevents evidence loss.</p>',
              question: {
                type: 'mcq',
                prompt: 'Why avoid jumping straight to recovery?',
                options: ['To slow response', 'Because containment approvals and evidence could be skipped', 'No reason', 'Recovery is optional'],
                correctIndex: 1,
                explanation: 'Skipping containment risks losing evidence and restoring compromised systems.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm4-ms8',
              title: 'Change control alignment',
              lessonHtml: '<p>Ensure emergency changes are logged and approved per OT change control. Note who authorized isolations, blocks, and restores.</p>',
              question: {
                type: 'mcq',
                prompt: 'How should emergency changes be handled?',
                options: ['Ignore change control', 'Log and obtain proper approvals, even in emergencies', 'Rely on memory', 'Never isolate anything'],
                correctIndex: 1,
                explanation: 'Emergency actions still require documentation and approvals to remain auditable.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm4-ms9',
              title: 'Safety first',
              lessonHtml: '<p>Containment and recovery steps must consider personnel safety and grid reliability. If actions could disrupt operations, coordinate with system operators.</p>',
              question: {
                type: 'mcq',
                prompt: 'What should happen before isolation that could impact operations?',
                options: ['Do it silently', 'Coordinate with operators to protect safety and reliability', 'Skip coordination', 'Let vendors decide alone'],
                correctIndex: 1,
                explanation: 'Operator coordination avoids unsafe or destabilizing actions during containment.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm4-ms10',
              title: 'Monitoring after recovery',
              lessonHtml: '<p>Post-recovery monitoring should validate stability, confirm no reinfection, and ensure logging/alerting is restored.</p>',
              question: {
                type: 'mcq',
                prompt: 'After recovery, teams should:',
                options: ['Declare victory and leave', 'Monitor closely and confirm logging/alerting is healthy', 'Disable monitoring', 'Ignore user reports'],
                correctIndex: 1,
                explanation: 'Close monitoring verifies recovery success and catches residual issues.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm4-ms11',
              title: 'Evidence continuity',
              lessonHtml: '<p>Capture before/after states, hash critical files when possible, and store evidence paths in the ticket.</p>',
              question: {
                type: 'mcq',
                prompt: 'What supports evidence continuity?',
                options: ['Unrecorded changes', 'Hashing and storing evidence references in the ticket', 'Deleting artifacts', 'Relying on memory'],
                correctIndex: 1,
                explanation: 'Hashes and documented evidence locations make investigations and audits defensible.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm4-ms12',
              title: 'Clear exit criteria',
              lessonHtml: '<p>Define exit criteria for each phase: classification logged (Identification), scope documented (Investigation), containment approvals completed (Response), validation successful (Recovery), lessons assigned (Follow-Up).</p>',
              question: {
                type: 'mcq',
                prompt: 'What signals Response/containment is done?',
                options: ['When someone feels done', 'When isolation/blocking is approved, executed, and documented', 'After deleting notes', 'When media calls stop'],
                correctIndex: 1,
                explanation: 'Containment ends when approved actions are executed and recorded with evidence.',
              },
              completionRule: 'answer-or-ack',
            },
          ]
        }
      ]
    },
    {
      title: 'Reporting & Documentation',
      steps: [
        {
          type: 'overview',
          title: 'Overview',
          sections: [
            { heading: 'Why this module', body: 'Regulatory timelines and audit expectations demand disciplined documentation of facts, actions, and approvals.' },
            { heading: 'Objectives', list: ['Meet reporting timelines for potential reportable incidents.', 'Capture evidence, approvals, and communications in the record of truth.', 'Handle audits with fact-based responses.'] },
            { heading: 'What you will do', list: ['Practice documenting what auditors look for.', 'Decide when to notify Compliance/ECS.', 'Use evidence etiquette that survives audits.'] },
          ]
        },
        {
          type: 'guided',
          title: 'Guided Training',
          microSteps: [
            {
              id: 'm5-ms1',
              title: 'Reporting timelines',
              lessonHtml: '<p>Potential reportable incidents: notify Compliance/ECS immediately; regulators may require notice within 1 hour. Non-reportable but material incidents: document and notify same business day.</p>',
              question: {
                type: 'mcq',
                prompt: 'How fast should potential reportable incidents be raised to Compliance/ECS?',
                options: ['Within 1 hour', 'Next week', 'After recovery only', 'Never'],
                correctIndex: 0,
                explanation: 'Potentially reportable incidents require immediate Compliance/ECS notice; regulator timelines can be as short as 1 hour.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm5-ms2',
              title: 'Documentation essentials',
              lessonHtml: '<ul><li>Who detected and when.</li><li>Classification and severity.</li><li>Systems affected and containment steps.</li><li>Approvals for containment and recovery.</li><li>Evidence captured and storage location.</li></ul>',
              question: {
                type: 'mcq',
                prompt: 'Which items must appear in the record?',
                options: ['Personal opinions', 'Detection time, classification, affected systems, actions, approvals, evidence location', 'Only names', 'Nothing if resolved fast'],
                correctIndex: 1,
                explanation: 'Complete records include detection, classification, impact, actions, approvals, and evidence references.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm5-ms3',
              title: 'Evidence etiquette',
              lessonHtml: '<p>Stick to facts and timestamps. Avoid speculation. Preserve original logs where possible and record hashes or chain of custody if collected.</p>',
              question: {
                type: 'mcq',
                prompt: 'During documentation, you should:',
                options: ['Speculate about likely causes', 'Record facts with timestamps and avoid speculation', 'Skip timestamps', 'Store nothing'],
                correctIndex: 1,
                explanation: 'Fact-based notes with timestamps meet audit standards and avoid misleading narratives.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm5-ms4',
              title: 'Regulator notifications',
              lessonHtml: '<p>For BES reportable events, prepare draft notifications quickly. Capture who contacted whom, when, and what was shared.</p>',
              question: {
                type: 'mcq',
                prompt: 'What must be logged about regulator contact?',
                options: ['Only the regulator name', 'Time, contact, content shared, and approvals', 'Nothing if verbal', 'Only after resolution'],
                correctIndex: 1,
                explanation: 'Logging time, contact, content, and approvals proves compliance with notification rules.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm5-ms5',
              title: 'Service Desk and bridge as record',
              lessonHtml: '<p>Use the ticket/bridge notes as the authoritative record. Summaries sent elsewhere must match the record.</p>',
              question: {
                type: 'mcq',
                prompt: 'Where should final decisions live?',
                options: ['Private chats only', 'In the ticket/bridge notes as the system of record', 'Whiteboards only', 'Memory'],
                correctIndex: 1,
                explanation: 'The ticket/bridge is the auditable record; other channels must align to it.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm5-ms6',
              title: 'Audit etiquette',
              lessonHtml: '<p>Answer auditor questions with evidence, not speculation. If you do not know, say so and escalate. Track auditor requests and responses.</p>',
              question: {
                type: 'mcq',
                prompt: 'How should unknown audit questions be handled?',
                options: ['Guess an answer', 'State what is known, escalate to IC/Compliance, and provide evidence', 'Ignore', 'Provide personal theories'],
                correctIndex: 1,
                explanation: 'Transparent, evidence-based responses that escalate unknowns maintain credibility.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm5-ms7',
              title: 'Evidence retention',
              lessonHtml: '<p>Store evidence in approved repositories with access control. Note retention timelines per policy and CIP requirements.</p>',
              question: {
                type: 'mcq',
                prompt: 'What must accompany stored evidence?',
                options: ['Nothing', 'Location, access, retention expectation, and who placed it there', 'Only a file name', 'Verbal notice only'],
                correctIndex: 1,
                explanation: 'Documenting where evidence lives, who stored it, and retention needs supports compliance.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm5-ms8',
              title: 'Daily status rhythm',
              lessonHtml: '<p>During longer incidents, capture daily status: progress against objectives, open risks, regulator interactions, and next actions.</p>',
              question: {
                type: 'mcq',
                prompt: 'Daily status should include:',
                options: ['Only jokes', 'Objectives, progress, risks, regulator contacts, next steps', 'Raw packet captures only', 'Unrelated tasks'],
                correctIndex: 1,
                explanation: 'Daily summaries keep leadership aligned and create a running audit log.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm5-ms9',
              title: 'Closing the record',
              lessonHtml: '<p>When closing, ensure containment/recovery approvals are attached, lessons learned captured, and follow-up actions assigned with due dates.</p>',
              question: {
                type: 'mcq',
                prompt: 'Before closure you must:',
                options: ['Delete notes', 'Attach approvals, document lessons, and assign follow-up actions', 'Ignore follow-up', 'Send nothing'],
                correctIndex: 1,
                explanation: 'Closure requires evidence of approvals and a plan for follow-up remediation.',
              },
              completionRule: 'answer-or-ack',
            },
          ]
        }
      ]
    },
    {
      title: 'OT Scenarios & Drills',
      steps: [
        {
          type: 'overview',
          title: 'Overview',
          sections: [
            { heading: 'Why this module', body: 'Scenarios reinforce how to act under pressure while keeping evidence, safety, and reporting intact.' },
            { heading: 'Objectives', list: ['Apply CSIR phases in realistic OT conditions.', 'Use the 15-minute escalation and classification discipline.', 'Practice documentation during evolving events.'] },
            { heading: 'What you will do', list: ['Work through scenario-based micro-steps with embedded decisions.', 'Choose containment and communication actions.', 'Confirm readiness for the final exam.'] },
          ]
        },
        {
          type: 'guided',
          title: 'Guided Training',
          microSteps: [
            {
              id: 'm6-ms1',
              title: 'Alarm storm in control center',
              lessonHtml: '<p>Control center alarms spike across multiple substations. Operators note unusual remote access attempts.</p>',
              question: {
                type: 'mcq',
                prompt: 'First move?',
                options: ['Silence alarms', 'Open incident/bridge, classify, and escalate within 15 minutes', 'Reboot SCADA servers immediately', 'Wait for daily report'],
                correctIndex: 1,
                explanation: 'Open the incident, classify, and escalate quickly to coordinate investigation and containment.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm6-ms2',
              title: 'Suspected ransomware on substation HMI',
              lessonHtml: '<p>A substation HMI displays a ransom note. No outage yet. Logs show suspicious file drops.</p>',
              question: {
                type: 'mcq',
                prompt: 'Containment priority?',
                options: ['Pay ransom', 'Isolate the HMI/segment with approvals and notify IC/Technical Lead', 'Ignore because no outage', 'Wipe without notes'],
                correctIndex: 1,
                explanation: 'Isolate with approval and notify leadership; preserve evidence before any rebuild.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm6-ms3',
              title: 'Evidence handling in ransomware scenario',
              lessonHtml: '<p>Before rebuild, capture disk images or logs if safe. Record hashes and store evidence locations in the ticket.</p>',
              question: {
                type: 'mcq',
                prompt: 'What should be documented before rebuild?',
                options: ['Nothing', 'Evidence collected, hashes, and storage location', 'Only the ransom amount', 'Verbal notes only'],
                correctIndex: 1,
                explanation: 'Documenting evidence with hashes and storage paths preserves the chain of custody.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm6-ms4',
              title: 'Unauthorized remote access attempt',
              lessonHtml: '<p>Firewall logs show repeated failed logins to an OT jump host from an unknown source.</p>',
              question: {
                type: 'mcq',
                prompt: 'Classification?',
                options: ['Event only', 'Attempt to Compromise and escalate within 15 minutes', 'Ignore until successful', 'Immediate recovery'],
                correctIndex: 1,
                explanation: 'A credible unauthorized attempt is an AtC requiring 15-minute escalation and investigation.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm6-ms5',
              title: 'AtC communications',
              lessonHtml: '<p>Share source IPs, accounts targeted, and timeframe with IC/Technical Lead. Check if access reached BES Cyber Systems; involve Compliance if so.</p>',
              question: {
                type: 'mcq',
                prompt: 'What should the initial escalation include?',
                options: ['Only a one-word alert', 'Source details, accounts, timeframe, and potential BES impact', 'No data', 'A guess about motives'],
                correctIndex: 1,
                explanation: 'Providing concrete details enables rapid containment and compliance checks.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm6-ms6',
              title: 'Loss of logging on BES device',
              lessonHtml: '<p>Security logs stop on a BES Cyber Asset after a suspected configuration change.</p>',
              question: {
                type: 'mcq',
                prompt: 'Next step?',
                options: ['Wait until morning', 'Classify as potentially reportable, escalate, and restore logging with approval', 'Ignore if device runs', 'Power cycle immediately'],
                correctIndex: 1,
                explanation: 'Loss of required logging is potentially reportable; escalate and restore logging carefully with approvals.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm6-ms7',
              title: 'Scenario decision: remote access',
              lessonHtml: '<p>You confirmed repeated AtC attempts on the jump host. No breach yet.</p>',
              question: {
                type: 'mcq',
                prompt: 'Best action sequence?',
                options: ['Ignore because blocked', 'Escalate, increase monitoring, and block source with approval while preserving logs', 'Immediately rebuild the jump host', 'Announce outage to media'],
                correctIndex: 1,
                explanation: 'Escalate, tighten controls with approval, and preserve logs for investigation and potential regulator input.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm6-ms8',
              title: 'Scenario decision: ransomware isolation',
              lessonHtml: '<p>Containment plan proposes isolating a substation switch that feeds the impacted HMI.</p>',
              question: {
                type: 'mcq',
                prompt: 'What must happen before isolation?',
                options: ['Nothing, just pull power', 'Coordinate with operators, gain approval, and document expected impact', 'Let the attacker continue', 'Send logs to media first'],
                correctIndex: 1,
                explanation: 'Operator coordination and approvals ensure safety and reliability are preserved during isolation.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm6-ms9',
              title: 'Scenario decision: recovery readiness',
              lessonHtml: '<p>After isolating the HMI, you plan to rebuild. Verified backups exist and have been scanned.</p>',
              question: {
                type: 'mcq',
                prompt: 'Recovery should proceed when:',
                options: ['Backups are unverified', 'Containment is approved and validated backups are ready', 'There is still active spread', 'No monitoring is available'],
                correctIndex: 1,
                explanation: 'Recovery requires approved containment and trusted backups to avoid reinfection.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm6-ms10',
              title: 'Scenario decision: communication updates',
              lessonHtml: '<p>Stakeholders ask for status. You have isolated the asset and are preparing recovery.</p>',
              question: {
                type: 'mcq',
                prompt: 'What should you communicate?',
                options: ['Speculation about attackers', 'Current classification, actions taken, approvals, and next milestones', 'Only good news', 'Unvetted technical jargon to everyone'],
                correctIndex: 1,
                explanation: 'Share factual status, approvals, and next steps to keep leadership aligned and audits clean.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm6-ms11',
              title: 'Scenario closure',
              lessonHtml: '<p>System restored, monitoring clean. Lessons: harden remote access, improve logging alerts, validate backup frequency.</p>',
              question: {
                type: 'mcq',
                prompt: 'What must be captured before closure?',
                options: ['Nothing if stable', 'Containment/recovery approvals, evidence locations, and assigned follow-up actions', 'Only uptime metrics', 'Speculation about motives'],
                correctIndex: 1,
                explanation: 'Documenting approvals, evidence, and follow-up ensures learning and compliance.',
              },
              completionRule: 'answer-or-ack',
            },
            {
              id: 'm6-ms12',
              title: 'Ready for certification',
              lessonHtml: '<p>Completing scenario micro-steps confirms you can apply the six phases under pressure.</p>',
              question: {
                type: 'mcq',
                prompt: 'What unlocks the final exam?',
                options: ['Completing Modules 1–6 guided training', 'Skipping to the end', 'Only reading overviews', 'Changing URL manually'],
                correctIndex: 0,
                explanation: 'The final exam unlocks after finishing all guided modules to ensure readiness.',
              },
              completionRule: 'answer-or-ack',
            },
          ]
        }
      ]
    },
    {
      title: 'Exam + Certification',
      steps: [
        {
          type: 'overview',
          title: 'Exam Intro & Rules',
          sections: [
            { heading: 'Passing criteria', list: ['Complete Modules 1–6 guided training.', 'Final exam requires ≥80% to pass.', 'Classification and reportability questions are weighted in your prep.'] },
            { heading: 'Rules', list: ['Use the CSIR plan and your notes.', 'Do not skip steps; Next unlocks after a passing score.', 'Stick to facts: avoid speculation and escalate unknowns.'] },
            { heading: 'Certificate', body: 'After you pass the exam you can download a personalized certificate. Provide your name and role so it is stamped on the PDF.' }
          ]
        },
        {
          type: 'exam',
          title: 'Final Exam (12 questions)',
          passPercent: 80,
          questions: [
            { prompt: 'The CSIR six-phase order is:', options: ['Preparation → Response → Identification → Investigation → Recovery → Follow-Up', 'Preparation → Identification → Investigation → Response → Recovery → Follow-Up', 'Identification → Preparation → Response → Recovery → Investigation → Follow-Up', 'Response → Identification → Preparation → Recovery → Investigation → Follow-Up'], answer: 1 },
            { prompt: 'Classification must be recorded with:', options: ['Only a verbal note', 'Time detected, who classified, and rationale', 'No documentation', 'Only screenshots'], answer: 1 },
            { prompt: 'A Critical severity incident generally involves:', options: ['Minor annoyance', 'Confirmed compromise or outage risk to BES Cyber Systems or safety', 'Planned maintenance', 'Training exercise only'], answer: 1 },
            { prompt: 'Reportable BES incidents should be prepared for regulator notification within:', options: ['1 hour', '1 week', 'Next month', 'When convenient'], answer: 0 },
            { prompt: 'Audit etiquette includes:', options: ['Speculating to fill gaps', 'Sticking to facts, sharing evidence, and escalating unknowns', 'Refusing to speak', 'Narrating guesses without proof'], answer: 1 },
            { prompt: 'When does Module 7 unlock?', options: ['After Module 4', 'After Modules 1–6 are completed', 'Immediately upon login', 'After certificate download'], answer: 1 },
            { prompt: 'For a suspected ransomware in a substation HMI, first action is:', options: ['Pay ransom', 'Isolate/contain and notify IC/Technical Lead within 15 minutes', 'Wait until shift end', 'Delete logs'], answer: 1 },
            { prompt: 'If you cannot answer an auditor question you should:', options: ['Guess a likely answer', 'Escalate to the Incident Commander/Compliance lead with available evidence', 'Provide no context', 'Change the topic'], answer: 1 },
            { prompt: 'Local progress is stored in:', options: ['Memory only', 'localStorage so resume works', 'Remote DB', 'Email threads'], answer: 1 },
            { prompt: 'Passing score for the final exam is:', options: ['50%', '60%', '80% or higher', '100% only'], answer: 2 },
            { prompt: 'An Attempt to Compromise requires:', options: ['No action', '15-minute escalation even if blocked', 'Waiting until the next day', 'Only vendor outreach'], answer: 1 },
            { prompt: 'During containment changes you must:', options: ['Skip documentation', 'Record approvals and actions in the ticket/bridge', 'Avoid involving operators', 'Delete evidence afterwards'], answer: 1 },
          ]
        }
      ]
    }
  ];

  window.TRAINING_TRACKS = window.TRAINING_TRACKS || {};
  window.TRAINING_TRACKS['csir-cert'] = {
    id: 'csir-cert',
    name: 'Certification Mode (Fast Track)',
    description: 'Linear modules, guided training, and a final exam for certification.',
    enforceLinear: true,
    modules,
  };
})();
