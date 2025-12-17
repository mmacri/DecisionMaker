const Download = (() => {
  const checklist = (html) => {
    const blob = new Blob([`<html><body>${html}</body></html>`], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scl-csir-checklist.html';
    a.click();
    URL.revokeObjectURL(url);
  };
  return { checklist };
})();
