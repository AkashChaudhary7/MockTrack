import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function calculateCrc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    crc = crc ^ byte;
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuf, data]);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(calculateCrc32(typeAndData), 0);

  return Buffer.concat([len, typeAndData, crcBuf]);
}

function createPNG(width, height, colorFn) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image data with 1 filter byte (0) per row
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = colorFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// Ensure /public directory exists
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA icons and screenshots...');

// 1. Icon 192x192
const icon192 = createPNG(192, 192, (x, y, w, h) => {
  const cx = w / 2;
  const cy = h / 2;
  const dist = Math.hypot(x - cx, y - cy);
  // Rounded box / circle logo (Indigo #4F46E5 background with target target icon)
  if (dist > w * 0.46) return [0, 0, 0, 0]; // rounded corners
  if (dist < w * 0.12) return [251, 191, 36, 255]; // Amber center dot
  if (dist > w * 0.22 && dist < w * 0.28) return [255, 255, 255, 255]; // Inner ring
  if (dist > w * 0.35 && dist < w * 0.39) return [255, 255, 255, 200]; // Outer ring
  return [79, 70, 229, 255]; // Indigo background
});
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);

// 2. Icon 512x512
const icon512 = createPNG(512, 512, (x, y, w, h) => {
  const cx = w / 2;
  const cy = h / 2;
  const dist = Math.hypot(x - cx, y - cy);
  if (dist > w * 0.47) return [0, 0, 0, 0];
  if (dist < w * 0.10) return [251, 191, 36, 255]; // Amber central target
  if (dist > w * 0.20 && dist < w * 0.26) return [255, 255, 255, 255]; // White ring 1
  if (dist > w * 0.34 && dist < w * 0.38) return [255, 255, 255, 220]; // White ring 2
  return [79, 70, 229, 255];
});
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);

// 3. Maskable Icon 512x512 (Solid background with safe zone padding)
const maskable512 = createPNG(512, 512, (x, y, w, h) => {
  const cx = w / 2;
  const cy = h / 2;
  const dist = Math.hypot(x - cx, y - cy);
  if (dist < w * 0.08) return [251, 191, 36, 255];
  if (dist > w * 0.16 && dist < w * 0.22) return [255, 255, 255, 255];
  if (dist > w * 0.30 && dist < w * 0.34) return [255, 255, 255, 220];
  return [15, 23, 42, 255]; // Dark slate background for safe zone
});
fs.writeFileSync(path.join(publicDir, 'maskable-icon-512.png'), maskable512);

// 4. Desktop Screenshot (1280x720)
const screenshotDesktop = createPNG(1280, 720, (x, y, w, h) => {
  // Top nav bar
  if (y < 60) return [15, 23, 42, 255];
  // Sidebar
  if (x < 220) return [30, 41, 59, 255];
  // Main canvas (slate background with indigo stats cards)
  const relX = (x - 220) / (w - 220);
  const relY = (y - 60) / (h - 60);
  if (relY < 0.35 && relX > 0.05 && relX < 0.95) return [79, 70, 229, 240]; // Hero banner card
  if (relY > 0.45 && relY < 0.90 && relX > 0.05 && relX < 0.45) return [255, 255, 255, 255]; // Card 1
  if (relY > 0.45 && relY < 0.90 && relX > 0.50 && relX < 0.95) return [255, 255, 255, 255]; // Card 2
  return [248, 250, 252, 255];
});
fs.writeFileSync(path.join(publicDir, 'screenshot-desktop.png'), screenshotDesktop);

// 5. Mobile Screenshot (750x1334)
const screenshotMobile = createPNG(750, 1334, (x, y, w, h) => {
  // Top app bar
  if (y < 120) return [79, 70, 229, 255];
  // Bottom tab bar
  if (y > h - 140) return [15, 23, 42, 255];
  // Cards in middle
  if (y > 180 && y < 450 && x > 40 && x < w - 40) return [255, 255, 255, 255];
  if (y > 480 && y < 750 && x > 40 && x < w - 40) return [255, 255, 255, 255];
  if (y > 780 && y < 1100 && x > 40 && x < w - 40) return [255, 255, 255, 255];
  return [241, 245, 249, 255];
});
fs.writeFileSync(path.join(publicDir, 'screenshot-mobile.png'), screenshotMobile);

console.log('All PWA icons and screenshots generated successfully!');
