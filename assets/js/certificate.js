const Certificate = (() => {
  const key = 'csir_certificate';

  const render = () => {
    const profile = Role.state();
    const cert = Storage.get(key, null);
    if (cert) fillCertificate(cert);
    const progress = Progress.state();
    const generateBtn = document.querySelector('#generate-cert');
    const nameInput = document.querySelector('#cert-name');
    const emailInput = document.querySelector('#cert-email');
    if (nameInput && profile.name) nameInput.value = profile.name;
    if (emailInput && profile.email) emailInput.value = profile.email;
    if (progress.score < 80) {
      generateBtn.disabled = true;
      generateBtn.textContent = 'Pass knowledge check to generate';
    } else {
      generateBtn.disabled = false;
      generateBtn.textContent = 'Generate certificate';
      generateBtn.onclick = generate;
    }
  };

  const generate = async () => {
    const nameInput = document.querySelector('#cert-name');
    const emailInput = document.querySelector('#cert-email');
    if (!nameInput.value.trim()) {
      alert('Please enter your full name.');
      return;
    }
    if (!emailInput.value.trim()) {
      alert('Please enter your email.');
      return;
    }
    if (!emailInput.value.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    Role.setProfile({ name: nameInput.value.trim(), email: emailInput.value.trim() });
    Role.setName(nameInput.value.trim());
    const cert = {
      id: `SCL-CSIR-${Math.random().toString(36).substr(2,6).toUpperCase()}`,
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      role: Role.state().role,
      completedAt: new Date().toISOString(),
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      version: 'Dec 2025'
    };
    Storage.set(key, cert);
    fillCertificate(cert);
  };

  const fillCertificate = (cert) => {
    document.querySelector('#cert-name-display').textContent = cert.name;
    document.querySelector('#cert-email-display').textContent = cert.email || '—';
    document.querySelector('#cert-role-display').textContent = UI.roleName(cert.role);
    document.querySelector('#cert-date-display').textContent = `${new Date(cert.completedAt).toLocaleString()} (${cert.tz})`;
    document.querySelector('#cert-id-display').textContent = cert.id;
    document.querySelector('#cert-version-display').textContent = cert.version;
    document.querySelector('#download-png').onclick = () => downloadPNG();
    document.querySelector('#download-pdf').onclick = () => downloadPDF();
  };

  const downloadPNG = async () => {
    const target = document.querySelector('#certificate-card');
    const canvas = await html2canvas(target);
    const link = document.createElement('a');
    link.download = 'scl-csir-certificate.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const downloadPDF = async () => {
    const target = document.querySelector('#certificate-card');
    const canvas = await html2canvas(target);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new window.jspdf.jsPDF('landscape', 'pt', 'letter');
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, 'PNG', 20, 20, width - 40, height - 40);
    pdf.save('scl-csir-certificate.pdf');
  };

  return { render };
})();
