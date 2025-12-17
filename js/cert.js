import { loadProgress, resetProgress } from './storage.js';

async function fetchPack(courseId = 'scl-csir') {
  const res = await fetch(`contentpacks/${courseId}/pack.json`);
  return res.json();
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

async function generateHash(value) {
  const data = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

async function initCertificate() {
  const progress = loadProgress();
  if (!progress.completedAt) {
    window.location.href = 'learn.html';
    return;
  }
  const pack = await fetchPack(progress.courseId || 'scl-csir');
  const roleLabel = pack.roles.find((r) => r.id === progress.roleId)?.label || progress.roleId;
  const completionDate = formatDate(progress.completedAt);
  const certId = await generateHash(`${progress.learnerName}-${progress.roleId}-${completionDate}`);

  document.getElementById('certName').textContent = progress.learnerName;
  document.getElementById('certRole').textContent = roleLabel;
  document.getElementById('certDate').textContent = completionDate;
  document.getElementById('certCourse').textContent = pack.meta.title;
  document.getElementById('certId').textContent = certId;

  document.getElementById('downloadCert').addEventListener('click', () => downloadPdf(pack.meta.title, progress, roleLabel, completionDate, certId));
  document.getElementById('downloadPng').addEventListener('click', () => downloadPng(certId));
  document.getElementById('reset').addEventListener('click', () => {
    resetProgress();
    window.location.href = 'index.html';
  });
}

function downloadPdf(courseTitle, progress, roleLabel, completionDate, certId) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Seattle City Light – OT CSIR Training', 50, 80);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Learner: ${progress.learnerName}`, 50, 120);
  doc.text(`Role path: ${roleLabel}`, 50, 145);
  doc.text(`Completion date: ${completionDate}`, 50, 170);
  doc.text(`Course: ${courseTitle}`, 50, 195);
  doc.text(`Certificate ID (verify): ${certId}`, 50, 220);
  doc.text('This certificate confirms successful completion of all steps and assessments.', 50, 260, { maxWidth: 500 });
  doc.save(`${progress.learnerName}-csir-certificate.pdf`);
}

async function downloadPng(certId) {
  const panel = document.getElementById('certificatePanel');
  const canvas = await html2canvas(panel, { backgroundColor: '#0f172a' });
  const link = document.createElement('a');
  link.download = `csir-certificate-${certId}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

window.addEventListener('DOMContentLoaded', initCertificate);
