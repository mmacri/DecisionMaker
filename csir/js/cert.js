import { loadProgress, resetProgress, setCertificateId } from './storage.js';
import { enforceNameBeforeCertificate } from './router.js';
import { downloadElementPng, downloadPageScreenshot } from './screenshot.js';

function formatDate(dateStr) {
  const date = dateStr ? new Date(dateStr) : new Date();
  return date.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

async function generateHash(value) {
  const data = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

function renderCertificate(progress, roleLabel, certId, courseTitle) {
  document.getElementById('certName').textContent = progress.learnerName;
  document.getElementById('certRole').textContent = roleLabel;
  document.getElementById('certDate').textContent = formatDate(progress.completedAt);
  document.getElementById('certCourse').textContent = courseTitle;
  document.getElementById('certId').textContent = certId;
}

function downloadPdf(progress, roleLabel, certId, courseTitle) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(courseTitle, 50, 80);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Learner: ${progress.learnerName}`, 50, 120);
  doc.text(`Role path: ${roleLabel}`, 50, 145);
  doc.text(`Completion date: ${formatDate(progress.completedAt)}`, 50, 170);
  doc.text(`Certificate ID: ${certId}`, 50, 195);
  doc.text('This certificate confirms successful completion of all required steps, the final exam, and the operational checklist.', 50, 230, { maxWidth: 500 });
  doc.save(`${progress.learnerName}-scl-csir-certificate.pdf`);
}

async function initCertificate() {
  enforceNameBeforeCertificate();
  const progress = loadProgress();
  const res = await fetch('contentpacks/scl-csir/pack.json');
  const pack = await res.json();
  const role = pack.roles.find((r) => r.id === progress.roleId);
  const roleLabel = role?.label || progress.roleId;
  let certId = progress.certificateId;
  if (!certId) {
    certId = await generateHash(`${progress.learnerName}-${progress.roleId}-${progress.completedAt || new Date().toISOString()}`);
    setCertificateId(certId);
  }
  renderCertificate(progress, roleLabel, certId, pack.course.title);

  document.getElementById('downloadPdf').addEventListener('click', () => downloadPdf(progress, roleLabel, certId, pack.course.title));
  document.getElementById('downloadPng').addEventListener('click', () => downloadElementPng(document.getElementById('certificatePanel'), `scl-csir-certificate-${certId}.png`));
  document.getElementById('downloadShot').addEventListener('click', () => downloadPageScreenshot('scl-csir-completion.png'));
  document.getElementById('reset').addEventListener('click', () => { resetProgress(); window.location.href = 'index.html'; });
}

window.addEventListener('DOMContentLoaded', initCertificate);
