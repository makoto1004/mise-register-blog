// SNS で URL を共有したときに表示される画像（OGP 画像 1200×630）を作り、public/og-image.png に保存する
//
// 使い方: npm run og
// 構成: オフホワイトの背景に細い枠。左にロゴとキャッチコピー、右に 4 業種の線画
// 文字は Windows に入っているフォント（Georgia・游ゴシック）で描く

import path from 'node:path';
import sharp from 'sharp';
import { SCENES } from '../lib/scenes.js';

const W = 1200;
const H = 630;
const INK = '#2f2725';
const MUTED = '#6f6866';
const WARM = '#b4532a';
const JP = "'Yu Gothic', 'YuGothic', 'Meiryo', sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

const scene = (name, x, y, scale) =>
  `<g transform="translate(${x} ${y}) scale(${scale})">${SCENES[name].map((d) => `<path d="${d}"/>`).join('')}</g>`;

// ロゴの左に添える軒先テントの線画（components/Logo.js と同じ形）
const awning = (x, y, s) => `
  <g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${WARM}" stroke-width="${1.5 / s * 2.2}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 9h24l-2 6H6z"/>
    <path d="M6 15c0 2 3.3 2 3.3 0 0 2 3.4 2 3.4 0 0 2 3.3 2 3.3 0 0 2 3.4 2 3.4 0 0 2 3.3 2 3.3 0 0 2 3.3 2 3.3 0"/>
    <path d="M12 9l-.7 6 M20 9l.7 6"/>
    <path d="M7 18v9h18v-9 M13 27v-6h6v6"/>
  </g>`;

const tags = ['カフェ', '美容院', 'キッチンカー', 'アパレル'];
let tagX = 96;
const tagSvg = tags
  .map((t) => {
    const w = t.length * 24 + 36;
    const g = `<rect x="${tagX}" y="500" width="${w}" height="44" fill="none" stroke="${INK}" stroke-width="1.5"/>
      <text x="${tagX + w / 2}" y="530" text-anchor="middle" font-family="${JP}" font-size="22" font-weight="700" fill="${INK}">${t}</text>`;
    tagX += w + 12;
    return g;
  })
  .join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#fafafa"/>
  <rect x="28" y="28" width="${W - 56}" height="${H - 56}" fill="none" stroke="${INK}" stroke-width="1.5"/>

  <!-- 右：4 業種の線画（カテゴリー色の面の上に） -->
  <rect x="770" y="76" width="370" height="478" fill="#f3efe9"/>
  <g fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.75">
    ${scene('cafe', 786, 92, 0.78)}
    ${scene('salon', 962, 92, 0.78)}
    ${scene('apparel', 786, 330, 0.78)}
    ${scene('kitchen-car', 960, 336, 0.76)}
  </g>

  <!-- 左：ロゴ -->
  ${awning(96, 96, 2.4)}
  <text x="190" y="160" fill="${INK}">
    <tspan font-family="${SERIF}" font-size="68" font-weight="600">mise</tspan><tspan dx="14" font-family="${SERIF}" font-size="62" font-style="italic" fill="${WARM}">&amp;</tspan><tspan dx="14" font-family="${JP}" font-size="34" font-weight="700" letter-spacing="6">register</tspan>
  </text>

  <!-- 左：キャッチコピー -->
  <text x="96" y="290" font-family="${JP}" font-size="50" font-weight="700" fill="${INK}">小さなお店のレジ選びを、</text>
  <text x="96" y="360" font-family="${JP}" font-size="50" font-weight="700" fill="${INK}">すっきり、納得。</text>
  <text x="96" y="440" font-family="${JP}" font-size="24" fill="${MUTED}">業種別のPOSレジ・キャッシュレス決済・周辺機器ガイド</text>

  ${tagSvg}
</svg>`;

const out = path.join(process.cwd(), 'public', 'og-image.png');
await sharp(Buffer.from(svg)).png().toFile(out);
console.log(`保存しました: ${path.relative(process.cwd(), out)}`);
