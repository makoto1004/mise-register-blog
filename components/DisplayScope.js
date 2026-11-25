import { Kaisei_Opti } from 'next/font/google';

// トップの大きな見出しと、AI無料POSレジ診断の名前・ひと言に使う、手書きっぽさのある明朝体（2026-11-16 にユーザーが選んだ）。
// 使うページだけを囲んで読み込む（理由は MinchoScope と同じ）
const display = Kaisei_Opti({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-display',
  display: 'swap',
  preload: false,
});

export default function DisplayScope({ children }) {
  return <div className={`font-scope ${display.variable}`}>{children}</div>;
}
