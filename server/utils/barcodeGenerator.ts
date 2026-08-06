/**
 * Utility to generate SVG Barcode (Code 128 simplified representation) and QR Data URLs
 */

// Simple Code 128 B pattern map or pseudo-barcode SVG generator
export function generateBarcodeSvg(value: string, height: number = 40): string {
  const cleanVal = (value || 'STU12345').toUpperCase().replace(/[^A-Z0-9-]/g, '');
  
  // Hash characters to bar widths (1-3 px)
  let bars: { x: number; width: number; isBar: boolean }[] = [];
  let currentX = 10;
  
  // Guard bars
  bars.push({ x: currentX, width: 2, isBar: true }); currentX += 4;
  bars.push({ x: currentX, width: 1, isBar: true }); currentX += 3;
  
  for (let i = 0; i < cleanVal.length; i++) {
    const code = cleanVal.charCodeAt(i);
    const pattern = [(code % 3) + 1, ((code >> 1) % 3) + 1, ((code >> 2) % 3) + 1, ((code >> 3) % 3) + 1];
    
    pattern.forEach((w, idx) => {
      bars.push({ x: currentX, width: w, isBar: idx % 2 === 0 });
      currentX += w + (idx % 2 === 0 ? 1 : 2);
    });
  }
  
  // Stop guard bars
  bars.push({ x: currentX, width: 3, isBar: true }); currentX += 5;
  bars.push({ x: currentX, width: 1, isBar: true }); currentX += 10;

  const totalWidth = currentX;

  const barElements = bars
    .filter(b => b.isBar)
    .map(b => `<rect x="${b.x}" y="2" width="${b.width}" height="${height - 12}" fill="#0f172a" />`)
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${height}" width="100%" height="${height}" preserveAspectRatio="none">
    <rect width="100%" height="100%" fill="#ffffff" />
    ${barElements}
    <text x="${totalWidth / 2}" y="${height - 2}" font-family="monospace" font-size="9" font-weight="bold" fill="#334155" text-anchor="middle">${cleanVal}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
