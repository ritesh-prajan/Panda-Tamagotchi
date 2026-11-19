// src/main/create-tray-icon.js
// Generates a cute 32x32 panda icon PNG for the Windows system tray.

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function generatePandaTrayIcon(outputPath) {
  if (fs.existsSync(outputPath)) {
    return outputPath;
  }

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const width = 32;
  const height = 32;

  // Colors RGBA
  const transparent = [0, 0, 0, 0];
  const earBlack = [35, 39, 42, 255];
  const faceWhite = [250, 250, 250, 255];
  const eyePatch = [44, 53, 64, 255];
  const eyePupil = [255, 255, 255, 255];
  const noseBlack = [30, 30, 30, 255];
  const bambooGreen = [46, 204, 113, 255];

  function getPixel(x, y) {
    // Left ear (center around 8, 8, radius 4.5)
    const distEarL = Math.hypot(x - 8, y - 8);
    if (distEarL <= 4.5) return earBlack;

    // Right ear (center around 23, 8, radius 4.5)
    const distEarR = Math.hypot(x - 23, y - 8);
    if (distEarR <= 4.5) return earBlack;

    // Head base (oval centered at 16, 18, radius rx=11, ry=10)
    const dx = (x - 16) / 11;
    const dy = (y - 18) / 10;
    if (dx * dx + dy * dy <= 1) {
      // Eye pupils (white reflection)
      if ((x === 11 && y === 16) || (x === 21 && y === 16)) {
        return eyePupil;
      }

      // Eye patches (left: 11, 17, r=3; right: 21, 17, r=3)
      if (Math.hypot(x - 11, y - 17) <= 2.8 || Math.hypot(x - 21, y - 17) <= 2.8) {
        return eyePatch;
      }

      // Nose / mouth (16, 20)
      if ((x >= 15 && x <= 17 && y === 20) || (x === 16 && y === 21)) {
        return noseBlack;
      }

      // Bamboo stalk held in mouth (20 to 26, y=22)
      if (x >= 19 && x <= 26 && y === 22) {
        return bambooGreen;
      }

      return faceWhite;
    }

    // Bamboo leaf tip outside head
    if ((x === 26 && y === 21) || (x === 27 && y === 22)) {
      return bambooGreen;
    }

    return transparent;
  }

  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // CRC32 table
  const crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[i] = c;
  }

  function crc32(buf) {
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(typeAndData), 0);
    return Buffer.concat([len, typeAndData, crcBuf]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const pngBuffer = Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);

  fs.writeFileSync(outputPath, pngBuffer);
  return outputPath;
}

module.exports = {
  generatePandaTrayIcon
};
