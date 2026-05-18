import { createHash } from 'crypto';
import { deflateSync } from 'zlib';
import { writeFileSync } from 'fs';

const W = 1920, H = 1080;

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (const b of buf) { c ^= b; for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (c & 1 ? 0xEDB88320 : 0); }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.allocUnsafe(4); len.writeUInt32BE(data.length);
  const crcBuf = Buffer.concat([t, data]);
  const crc = Buffer.allocUnsafe(4); crc.writeUInt32BE(crc32(crcBuf));
  return Buffer.concat([len, t, data, crc]);
}

// Build raw pixel data — filter byte 0 (None) before each row
const raw = Buffer.allocUnsafe(H * (1 + W * 3));
const cx = W * 0.5, cy = H * 0.25; // glow centre: upper-middle

for (let y = 0; y < H; y++) {
  raw[y * (1 + W * 3)] = 0; // filter byte
  for (let x = 0; x < W; x++) {
    // Base: Obsidian Night #0B0C10
    let r = 0x0B, g = 0x0C, b = 0x10;

    // Radial glow: Aero Blue #00A3FF, falls off with distance^2
    const dx = (x - cx) / W, dy = (y - cy) / H;
    const dist2 = dx * dx + dy * dy;
    const glow = Math.max(0, 1 - dist2 / 0.18) * 0.12; // very subtle

    r = Math.round(r + (0x00 - r) * glow);
    g = Math.round(g + (0xA3 - g) * glow);
    b = Math.round(b + (0xFF - b) * glow);

    const off = y * (1 + W * 3) + 1 + x * 3;
    raw[off] = r; raw[off + 1] = g; raw[off + 2] = b;
  }
}

const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdr = Buffer.allocUnsafe(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

const compressed = deflateSync(raw, { level: 6 });

const png = Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
writeFileSync('images/background.png', png);
console.log('background.png written —', W, 'x', H);
