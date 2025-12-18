(function(){
  const modules = [
    {
      title: 'CSIR Overview',
      steps: [
        {
          type: 'overview',
          title: 'Overview',
          sections: [
            { heading: 'Purpose & scope', body: 'Reinforce the OT Cyber Security Incident Response plan so responders act quickly, consistently, and in alignment with SCL policy and NERC CIP expectations.' },
            { heading: 'Applicability', list: ['BES Cyber Assets, ECAMS, PACS, and OT systems owned by SCL are in scope.', 'Systems solely managed by Seattle IT are escalated but follow Seattle IT incident paths.', 'Assumes trained staff, current contacts, asset inventories, tested backups, and staged spares.'] },
            { heading: 'Event vs Incident vs Attempt to Compromise', list: ['Cyber Event: any observable occurrence that may affect OT systems.', 'Attempt to Compromise (AtC): credible attempt to violate security controls even if not successful.', 'Cyber Incident: confirmed compromise or outage that impacts confidentiality, integrity, availability, or safety.'] }
          ]
        },
        {
          type: 'quiz',
          title: 'Knowledge Check',
          passPercent: 70,
          questions: [
            { prompt: 'What does the CSIR plan seek to deliver for OT operations?', options: ['Rapid IT upgrades', 'Consistent, auditable incident handling for OT systems', 'Cost reduction for engineering projects', 'Firewall change automation'], answer: 1 },
            { prompt: 'Which systems are in scope for the SCL OT CSIR plan?', options: ['Home Wi-Fi', 'Any device on the public internet', 'BES Cyber Assets, ECAMS, PACS, and other SCL OT systems', 'Only corporate laptops'], answer: 2 },
            { prompt: 'How is an Attempt to Compromise different from an Incident?', options: ['An AtC is always accidental', 'An AtC is a failed or blocked attempt to violate controls; an incident is a confirmed impact', 'They are the same', 'Incidents are ignored if short'], answer: 1 },
            { prompt: 'Why keep OT contact lists current?', options: ['To schedule vacations', 'To speed notifications and escalation during events', 'To allow anonymous reporting', 'For payroll changes'], answer: 1 },
            { prompt: 'Which assumption supports reliable recovery?', options: ['Unused spare parts', 'Documented backups and system images maintained by owners', 'No monitoring tools', 'Skipping lessons learned'], answer: 1 }
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
            { heading: 'Role clarity', list: ['Incident Commander sets objectives and keeps reporting on time.', 'Technical Lead drives investigation and containment decisions.', 'ECS and Compliance guide classification, reportability, and evidence.', 'Dispatchers and Control recognize signals and open incidents promptly.'] },
            { heading: 'Communications layers', list: ['Local OT teams → Incident Commander/Technical Lead.', 'ECS and Compliance align regulator notifications.', 'City IMT and external partners engaged for Critical/High events or AtC on BES systems.'] },
            { heading: '15-minute escalation rule', body: 'If an event looks like an incident or AtC, notify Incident Commander and Technical Lead within 15 minutes via the incident bridge or Service Desk channel.' }
          ]
        },
        {
          type: 'quiz',
          title: 'Knowledge Check',
          passPercent: 70,
          questions: [
            { prompt: 'Who sets objectives and keeps the response on schedule?', options: ['Incident Commander', 'Facilities', 'Any analyst', 'Vendors'], answer: 0 },
            { prompt: 'When must an AtC be escalated?', options: ['Within 24 hours', 'When time permits', 'Within 15 minutes to the Incident Commander/Technical Lead', 'Never; only confirmed incidents'], answer: 2 },
            { prompt: 'Which group guides reportability and evidence retention?', options: ['Marketing', 'ECS and Compliance', 'Finance', 'Vendors'], answer: 1 },
            { prompt: 'Dispatchers and Control should…', options: ['Silence alarms', 'Immediately open an incident/bridge with observations', 'Wait for daily standup', 'Fix the issue solo'], answer: 1 },
            { prompt: 'When do we engage City IMT and regulators?', options: ['Only after recovery', 'When severity is Critical/High or an AtC affects BES assets', 'Never for OT', 'Only if media calls'], answer: 1 }
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
            { heading: 'Classification', list: ['Use consistent categories: Event, AtC, Cyber Incident.', 'Identify if the incident is reportable under CIP-008, DHS/CISA, or other rules.', 'Record whether production or safety is at risk.'] },
            { heading: 'Severity scale', list: ['Critical: major outage, safety risk, or confirmed compromise of BES Cyber Systems.', 'High: significant degradation, widespread malware, or active attacker pivot.', 'Medium: contained issue with limited scope.', 'Low: low impact, monitored only.'] },
            { heading: 'Documentation anchors', body: 'Record time detected, initial classification, and who made the call. These notes speed regulatory reporting and follow-up audits.' }
          ]
        },
        {
          type: 'quiz',
          title: 'Knowledge Check',
          passPercent: 70,
          questions: [
            { prompt: 'A confirmed compromise of a BES Cyber System with outage risk is:', options: ['Low', 'Medium', 'High', 'Critical'], answer: 3 },
            { prompt: 'How should classification be recorded?', options: ['Only verbally', 'In incident notes with time detected and who classified', 'On a sticky note', 'Do not record until resolved'], answer: 1 },
            { prompt: 'What is an AtC?', options: ['Any email', 'A credible attempt to violate controls, even if blocked', 'A planned change', 'Routine backup'], answer: 1 },
            { prompt: 'Which severity demands regulator engagement fastest?', options: ['Low', 'Critical', 'Medium', 'None'], answer: 1 },
            { prompt: 'Reportability is supported by:', options: ['Guessing the impact', 'Documented evidence and timestamps', 'Waiting until after recovery', 'Skipping notes'], answer: 1 }
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
            { heading: 'Six-phase spine', list: ['Preparation: maintain plans, backups, monitoring.', 'Identification: detect, classify, and escalate within 15 minutes.', 'Investigation: confirm scope, severity, and attack path.', 'Response: contain, eradicate, and coordinate approvals.', 'Recovery: restore safely, validate, and monitor.', 'Follow-Up: lessons learned, evidence retention, and updates.'] },
            { heading: 'Move in order', body: 'Steps are linear to keep evidence and approvals aligned. Do not jump to recovery before containment is approved.' },
            { heading: 'Progress artifacts', list: ['Ticket/bridge notes with timestamps.', 'Network/system captures kept as evidence.', 'Decision log with who approved containment and recovery.'] }
          ]
        },
        {
          type: 'quiz',
          title: 'Knowledge Check',
          passPercent: 70,
          questions: [
            { prompt: 'Which phase includes confirming severity and scope?', options: ['Preparation', 'Identification', 'Investigation', 'Follow-Up'], answer: 2 },
            { prompt: 'Containment and eradication occur in which phase?', options: ['Response', 'Recovery', 'Preparation', 'Follow-Up'], answer: 0 },
            { prompt: 'Why avoid skipping phases?', options: ['Phases are optional', 'Linear steps keep approvals, evidence, and reporting aligned', 'It saves time', 'Regulators require random order'], answer: 1 },
            { prompt: 'When are lessons learned captured?', options: ['During containment', 'Before classification', 'Follow-Up', 'Never'], answer: 2 },
            { prompt: 'What triggers the 15-minute rule?', options: ['Lunch break', 'Any hint of an incident or AtC', 'Only outages', 'Patch window'], answer: 1 }
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
            { heading: 'Reporting timelines', list: ['Potential reportable incidents: notify Compliance/ECS immediately; regulator notifications may be due within 1 hour for BES reportable events.', 'Non-reportable but material incidents: document and notify within the same business day.', 'Service Desk ticket and bridge notes are the system of record.'] },
            { heading: 'Audit etiquette', list: ['Stick to facts; avoid speculation.', 'Show evidence and timestamps rather than assumptions.', 'Escalate questions you cannot answer.', 'Keep a log of auditor requests and responses.'] },
            { heading: 'Documentation essentials', list: ['Who detected and when.', 'Systems affected and severity.', 'Containment and recovery approvals.', 'Evidence captured and where it is stored.'] }
          ]
        },
        {
          type: 'quiz',
          title: 'Knowledge Check',
          passPercent: 70,
          questions: [
            { prompt: 'How quickly should potential reportable incidents be raised to Compliance/ECS?', options: ['Within 1 hour', 'Next business day', 'Within a week', 'Only after recovery'], answer: 0 },
            { prompt: 'During an audit you should…', options: ['Speculate about likely causes', 'Stick to documented facts and evidence', 'Provide informal stories', 'Refuse all questions'], answer: 1 },
            { prompt: 'What must be logged for regulator notifications?', options: ['Only names', 'Time detected, classification, actions, and approvals', 'Nothing if resolved', 'Screenshots only'], answer: 1 },
            { prompt: 'If you cannot answer an auditor question:', options: ['Guess', 'Escalate to the Incident Commander or Compliance lead', 'Ignore it', 'Change the topic'], answer: 1 },
            { prompt: 'Non-reportable but material incidents should be documented by when?', options: ['End of the same business day', 'Next year', 'Never', 'Only if asked'], answer: 0 }
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
            { heading: 'Scenario focus', list: ['Control center alarm storm', 'Suspected ransomware in substation HMI', 'Unauthorized remote access attempt', 'Loss of logging/monitoring on critical assets'] },
            { heading: 'Expectations', list: ['Validate signals before declaring an incident.', 'Engage Technical Lead and IC within 15 minutes.', 'Capture timelines and evidence for drills.', 'Complete at least one scenario to qualify for certification.'] }
          ]
        },
        {
          type: 'quiz',
          title: 'Scenario Knowledge Check',
          passPercent: 70,
          questions: [
            { prompt: 'During a ransomware screen on a substation HMI you should first:', options: ['Reboot immediately', 'Isolate/contain the asset and notify IC/Technical Lead', 'Ignore it', 'Call media'], answer: 1 },
            { prompt: 'Loss of security logs on a BES Cyber Asset is:', options: ['Low severity', 'Medium always', 'Potentially High/Critical and may be reportable', 'Not in scope'], answer: 2 },
            { prompt: 'If remote access is attempted by an unknown source, you must:', options: ['Wait for confirmation', 'Notify within 15 minutes as an AtC and start investigation', 'Assume it is testing', 'Block nothing'], answer: 1 },
            { prompt: 'What evidence should be captured during drills?', options: ['Only the final score', 'Timestamps, screenshots, network captures when allowed, and decisions made', 'No evidence', 'Names only'], answer: 1 },
            { prompt: 'When is Module 7 unlocked?', options: ['After Module 3', 'After completing Modules 1–6 including this scenario check', 'Immediately', 'After certificate download'], answer: 1 }
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
            { heading: 'Passing criteria', list: ['Complete Modules 1–6 and their knowledge checks.', 'Final exam requires ≥80% to pass.', 'Classification/reportability questions are weighted.'] },
            { heading: 'Rules', list: ['Use the CSIR plan and your notes.', 'Do not skip steps; Next unlocks after a passing score.', 'Keep audit etiquette: facts only, no speculation. Escalate unclear items.'] },
            { heading: 'Certificate', body: 'After you pass the exam you can download a personalized certificate. Provide your name and role so it is stamped on the PDF.' }
          ]
        },
        {
          type: 'exam',
          title: 'Final Exam (10 questions)',
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
            { prompt: 'Passing score for the final exam is:', options: ['50%', '60%', '80% or higher', '100% only'], answer: 2 }
          ]
        }
      ]
    }
  ];

  window.TRAINING_TRACKS = window.TRAINING_TRACKS || {};
  window.TRAINING_TRACKS['csir-cert'] = {
    id: 'csir-cert',
    name: 'Certification Mode (Fast Track)',
    description: 'Linear modules, short checks, and a final exam for certification.',
    enforceLinear: true,
    modules,
  };
})();
