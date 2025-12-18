const CURRICULUM = [
  { moduleId: 'm1', steps: ['m1s1', 'm1s2'] },
  { moduleId: 'm2', steps: ['m2s1', 'm2s2'] },
  { moduleId: 'm3', steps: ['m3s1', 'm3s2'] },
  { moduleId: 'm4', steps: ['m4s1', 'm4s2'] },
  { moduleId: 'm5', steps: ['m5s1', 'm5s2'] },
  { moduleId: 'm6', steps: ['m6s1', 'm6s2'] },
  { moduleId: 'm7', steps: ['m7s1', 'm7s2'] },
];

const MODULES = [
  {
    id: 'm1',
    title: 'Module 1 — CSIR Overview',
    steps: [
      { id: 'm1s1', title: 'Overview', type: 'overview', contentSource: 'index', anchor: '#module-1' },
      { id: 'm1s2', title: 'Training', type: 'runtime', runtimeTarget: { kind: 'hash', value: '#m1' } },
    ],
  },
  {
    id: 'm2',
    title: 'Module 2 — Roles, Responsibilities, Communications',
    steps: [
      { id: 'm2s1', title: 'Overview', type: 'overview', contentSource: 'index', anchor: '#module-2' },
      { id: 'm2s2', title: 'Training', type: 'runtime', runtimeTarget: { kind: 'hash', value: '#m2' } },
    ],
  },
  {
    id: 'm3',
    title: 'Module 3 — Terminology, Classification, Severity',
    steps: [
      { id: 'm3s1', title: 'Overview', type: 'overview', contentSource: 'index', anchor: '#module-3' },
      { id: 'm3s2', title: 'Training', type: 'runtime', runtimeTarget: { kind: 'hash', value: '#m3' } },
    ],
  },
  {
    id: 'm4',
    title: 'Module 4 — Workflow by Phase',
    steps: [
      { id: 'm4s1', title: 'Overview', type: 'overview', contentSource: 'index', anchor: '#module-4' },
      { id: 'm4s2', title: 'Training', type: 'runtime', runtimeTarget: { kind: 'hash', value: '#m4' } },
    ],
  },
  {
    id: 'm5',
    title: 'Module 5 — Reporting & Documentation',
    steps: [
      { id: 'm5s1', title: 'Overview', type: 'overview', contentSource: 'index', anchor: '#module-5' },
      { id: 'm5s2', title: 'Training', type: 'runtime', runtimeTarget: { kind: 'hash', value: '#m5' } },
    ],
  },
  {
    id: 'm6',
    title: 'Module 6 — OT Scenarios & Drills',
    steps: [
      { id: 'm6s1', title: 'Overview', type: 'overview', contentSource: 'index', anchor: '#module-6' },
      { id: 'm6s2', title: 'Training', type: 'runtime', runtimeTarget: { kind: 'hash', value: '#m6' } },
    ],
  },
  {
    id: 'm7',
    title: 'Module 7 — Exam + Certification',
    steps: [
      { id: 'm7s1', title: 'Exam Overview', type: 'overview', contentSource: 'index', anchor: '#module-7' },
      { id: 'm7s2', title: 'Final Exam', type: 'runtime', runtimeTarget: { kind: 'hash', value: '#exam' } },
    ],
  },
];

window.CSIR_CURRICULUM = CURRICULUM;
window.CSIR_PLAYER = {
  modules: MODULES,
};
