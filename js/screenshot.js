export async function downloadElementPng(element, filename) {
  const canvas = await html2canvas(element, { scale: 2 });
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function downloadPageScreenshot(filename) {
  const canvas = await html2canvas(document.body, { scale: 1.5 });
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
