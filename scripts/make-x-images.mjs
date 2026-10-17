// X（旧 Twitter）のプロフィール用の画像を作り、brand/ に保存する
//   brand/x-icon.png   … アイコン（400×400）
//   brand/x-header.png … ヘッダー（1500×500）
// 使い方: node scripts/make-x-images.mjs

import path from 'node:path';
import fs from 'node:fs';
import sharp from 'sharp';
import { SCENES } from '../lib/scenes.js';

const INK = '#2f2725';
const WARM = '#b4532a';
const BG = '#fafafa';
const JP = "'Yu Gothic', 'YuGothic', 'Meiryo', sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

const awning = (x, y, s, color = WARM) => `
  <g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${color}" stroke-width="${3.2 / s}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 9h24l-2 6H6z"/>
    <path d="M6 15c0 2 3.3 2 3.3 0 0 2 3.4 2 3.4 0 0 2 3.3 2 3.3 0 0 2 3.4 2 3.4 0 0 2 3.3 2 3.3 0 0 2 3.3 2 3.3 0"/>
    <path d="M12 9l-.7 6 M20 9l.7 6"/>
    <path d="M7 18v9h18v-9 M13 27v-6h6v6"/>
  </g>`;

const scene = (name, x, y, s) =>
  `<g transform="translate(${x} ${y}) scale(${s})">${SCENES[name].map((d) => `<path d="${d}"/>`).join('')}</g>`;

// アイコン：中央に軒先テントのマークと「m&r」（X では丸く切り抜かれるので、中央に寄せる）
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="${BG}"/>
  ${awning(128, 70, 4.5)}
  <text x="200" y="300" text-anchor="middle" fill="${INK}">
    <tspan font-family="${SERIF}" font-size="84" font-weight="600">m</tspan><tspan font-family="${SERIF}" font-size="76" font-style="italic" fill="${WARM}">&amp;</tspan><tspan font-family="${SERIF}" font-size="84" font-weight="600">r</tspan>
  </text>
</svg>`;

// ヘッダー：中央にロゴとキャッチコピー、左右に 4 業種の線画（X では左下にアイコンが重なるので、左下は空ける）
const header = `<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="500" viewBox="0 0 1500 500">
  <rect width="1500" height="500" fill="${BG}"/>
  <g fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.35">
    ${scene('cafe', 70, 40, 0.95)}
    ${scene('salon', 300, 60, 0.85)}
    ${scene('apparel', 1010, 40, 0.95)}
    ${scene('kitchen-car', 1230, 70, 0.85)}
  </g>
  ${awning(560, 175, 2.3)}
  <text x="650" y="232" fill="${INK}">
    <tspan font-family="${SERIF}" font-size="72" font-weight="600">mise</tspan><tspan dx="12" font-family="${SERIF}" font-size="64" font-style="italic" fill="${WARM}">&amp;</tspan><tspan dx="12" font-family="${JP}" font-size="34" font-weight="700" letter-spacing="6">register</tspan>
  </text>
  <text x="750" y="310" text-anchor="middle" font-family="${JP}" font-size="34" font-weight="700" fill="${INK}">小さなお店のレジ選びを、すっきり、納得！</text>
  <text x="750" y="356" text-anchor="middle" font-family="${JP}" font-size="20" fill="#6f6866">カフェ・美容院・アパレル・キッチンカーの POSレジ・周辺機器・開業ガイド</text>
</svg>`;

const out = path.join(process.cwd(), 'brand');
fs.mkdirSync(out, { recursive: true });
await sharp(Buffer.from(icon)).png().toFile(path.join(out, 'x-icon.png'));
await sharp(Buffer.from(header)).png().toFile(path.join(out, 'x-header.png'));
console.log('保存しました: brand/x-icon.png, brand/x-header.png');
