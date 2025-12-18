(function(){
  const moduleOverviews = [
    'Purpose, goals, scope, and assumptions for OT cyber readiness.',
    'Roles, responsibilities, and communications layers.',
    'Terminology, classification, and severity definitions.',
    'Six-phase workflow from preparation through follow-up.',
    'Reporting timelines, documentation practices, and audit etiquette reminders.',
    'OT scenarios and drills with containment and evidence expectations.',
    'Exam readiness with the existing runtime sequence.'
  ];

  const modules = moduleOverviews.map((summary, idx) => {
    const moduleNum = idx + 1;
    return {
      title: `Module ${moduleNum}`,
      steps: [
        {
          type: 'overview',
          title: 'Overview',
          sections: [
            { heading: `Module ${moduleNum} snapshot`, body: summary },
            { heading: 'What to look for', list: [
              'Stay aligned to the six-phase spine and note any required evidence.',
              'Use the runtime to experience the full interactive drills.',
              'Capture personal notes you want to reuse in the certification track.'
            ]}
          ]
        },
        {
          type: 'iframe',
          title: 'Interactive Training',
          src: `learn.html#module-${moduleNum}`
        }
      ]
    };
  });

  window.TRAINING_TRACKS = window.TRAINING_TRACKS || {};
  window.TRAINING_TRACKS['csir-interactive'] = {
    id: 'csir-interactive',
    name: 'Interactive Mode (Deep Dive)',
    description: 'Full interactive runtime with manual completion gating for each embedded step.',
    enforceLinear: true,
    modules,
  };
})();
