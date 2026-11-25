import fs from 'node:fs';
import path from 'node:path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const cache = new Map();

// webp・png の幅と高さを、ファイルの先頭から読む（読めなければ null）
export function parseImageSize(buf) {
  if (buf.length >= 30 && buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP') {
    const type = buf.toString('latin1', 12, 16);
    if (type === 'VP8X') return { width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1 };
    if (type === 'VP8L') {
      const bits = buf.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (type === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    return null;
  }
  if (buf.length >= 24 && buf.readUInt32BE(0) === 0x89504e47) return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  return null;
}

// サイトの中の画像（/images/…）の大きさ。ファイルがないときや読めない形式は null
export function localImageSize(src) {
  if (!/^\/images\/[^?#]+\.(webp|png)$/.test(src)) return null;
  if (cache.has(src)) return cache.get(src);
  let size = null;
  try {
    const fd = fs.openSync(path.join(PUBLIC_DIR, src), 'r');
    const buf = Buffer.alloc(40);
    fs.readSync(fd, buf, 0, 40, 0);
    fs.closeSync(fd);
    size = parseImageSize(buf);
  } catch {
    size = null;
  }
  cache.set(src, size);
  return size;
}

// 本文の <img> に、幅と高さ（読み込み中に文章がずれないように）と、2 枚目からの遅延読み込みを付ける。
// すでに付いている画像と、丸く切り抜くマスコットの画像はそのまま。state.images は記事で通した枚数
export function addImageAttributes(html, state) {
  return html.replace(/<img\b[^>]*>/g, (tag) => {
    state.images = (state.images ?? 0) + 1;
    const src = tag.match(/\bsrc="([^"]*)"/)?.[1] ?? '';
    if (src.startsWith('/images/mascots/')) return tag;
    const add = [];
    const size = localImageSize(src);
    if (size && !/\b(width|height)=/.test(tag)) add.push(`width="${size.width}"`, `height="${size.height}"`);
    if (state.images > 1 && !/\bloading=/.test(tag)) add.push('loading="lazy"', 'decoding="async"');
    return add.length ? tag.replace('<img', `<img ${add.join(' ')}`) : tag;
  });
}
