import { Noto_Serif_JP } from 'next/font/google';

// 道のりの番号・診断の見出し・ランキングの番号などに使う明朝体。
// 日本語の書体は CSS が大きいので、使うページだけを囲んで読み込む（layout.js に置くと、使わない記事でも読み込まれる）
const mincho = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-mincho',
  display: 'swap',
  preload: false,
});

export default function MinchoScope({ children }) {
  return <div className={`font-scope ${mincho.variable}`}>{children}</div>;
}
