// 記事ごとのイメージ背景（線画のイラストを周りに散らし、中央は文字のために空ける）
// 写真は使わず、カテゴリーと記事のテーマからモチーフを選んで描く。配置は slug から決まるので毎回同じになる

// 24×24 の線画アイコン（stroke で描く）
const ICONS = {
  cup: 'M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z M16 10h2a3 3 0 0 1 0 6h-2 M7 2.5c0 1 1 1 1 2.5 M11 2.5c0 1 1 1 1 2.5',
  scissors: 'M8.2 15.8 19 4 M15.8 15.8 5 4 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M21 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  truck: 'M2 6h11v10H2z M13 9h4l3 3.5V16h-7z M8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z M19 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z',
  hanger: 'M10 5.5a2 2 0 1 1 2 2v1.5 M12 9 3 16h18z',
  receipt: 'M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5-2 1.5z M9 8h6 M9 12h6 M9 16h4',
  card: 'M3 6h18v12H3z M3 10h18 M6 15h4',
  chair: 'M7 3v18 M7 12h10v9 M7 16h10',
  table: 'M3 9h18 M6 9v11 M18 9v11',
  sofa: 'M4 10V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2 M2 11h20v6H2z M4 17v2 M20 17v2',
  bulb: 'M9 18h6 M10 21h4 M12 3a6 6 0 0 1 4 10.5V16H8v-2.5A6 6 0 0 1 12 3z',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M9 12l2 2 4-4',
  wifi: 'M2 9a15 15 0 0 1 20 0 M5 12.5a10 10 0 0 1 14 0 M8.5 16a5 5 0 0 1 7 0 M12 19.5h.01',
  box: 'M3 7l9-4 9 4v10l-9 4-9-4z M3 7l9 4 9-4 M12 11v10',
  calculator: 'M5 3h14v18H5z M8 6h8v4H8z M8 13.5h.01 M12 13.5h.01 M16 13.5h.01 M8 17.5h.01 M12 17.5h.01 M16 17.5h.01',
  car: 'M3 15l2-6h14l2 6v3H3z M7 18v2 M17 18v2 M6.5 13.5h.01 M17.5 13.5h.01',
  tablet: 'M6 3h12v16H6z M10 21h4 M11 16h2',
  barcode: 'M4 5v14 M7 5v14 M9 5v14 M12 5v14 M15 5v14 M17 5v14 M20 5v14',
  drawer: 'M3 8h18v10H3z M3 13h18 M10 15.5h4',
  sign: 'M7 21 12 4l5 17 M9 14h6',
  store: 'M3 9l2-5h14l2 5 M3 9h18v11H3z M9 20v-6h6v6',
  coin: 'M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0z M12 8v8 M9.5 10h5',
  key: 'M14 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0z M12.8 10.8 20 18 M17 15l2-2',
  book: 'M4 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z M20 4h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z',
  mirror: 'M12 3c3.3 0 6 3.6 6 8s-2.7 8-6 8-6-3.6-6-8 2.7-8 6-8z M12 19v2 M8 21h8',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z',
  battery: 'M3 8h16v8H3z M19 10.5h2v3h-2 M5.5 10.5h3v3h-3',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4z M10 20.5h4',
  clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M12 7v5l3 2',
};

// カテゴリーごとの基本のモチーフ
const CATEGORY_ICONS = {
  cafe: ['cup', 'table'],
  salon: ['scissors', 'mirror'],
  'kitchen-car': ['truck', 'sign'],
  apparel: ['hanger', 'store'],
  devices: ['receipt', 'tablet'],
};

// 記事のテーマ（slug・タグに含まれる言葉）→ 追加するモチーフ
const THEME_RULES = [
  [/cashless|キャッシュレス|決済/, ['card', 'coin']],
  [/accounting|会計|確定申告/, ['calculator', 'receipt']],
  [/purchasing|仕入れ|食材/, ['box']],
  [/insurance|保険/, ['car', 'shield']],
  [/crime|防犯/, ['shield', 'key']],
  [/network|ネットワーク|Wi-Fi/, ['wifi']],
  [/rental|レンタル/, ['key', 'truck']],
  [/franchise|フランチャイズ|開業/, ['book', 'store']],
  [/sofa|ソファ|待合/, ['sofa']],
  [/table|テーブル|チェア/, ['chair', 'table']],
  [/rack|ラック|什器|ディスプレイ/, ['hanger', 'bulb']],
  [/printer|プリンター/, ['receipt']],
  [/drawer|ドロア/, ['drawer', 'coin']],
  [/scanner|バーコード/, ['barcode']],
  [/stand|スタンド|ipad|iPad/, ['tablet']],
  [/signboard|看板/, ['sign']],
  [/pos|POS/, ['tablet', 'receipt']],
  [/mobile-order|モバイルオーダー/, ['tablet']],
  [/reservation|予約|顧客/, ['book']],
  [/aruaru|あるある/, ['clock', 'receipt', 'coin']],
  [/reception|受付|電話/, ['phone', 'bell']],
  [/レシート用紙|釣り銭/, ['receipt', 'coin']],
  [/試着室/, ['mirror', 'bell']],
  [/イベント出店/, ['battery', 'wifi']],
];

// 背景の絵を多めに描くときに足すモチーフ（テーマとカテゴリーのモチーフで足りないとき）
const EXTRA_ICONS = ['store', 'coin', 'receipt', 'card'];

// 文字をよけた配置の候補（0〜1 の割合。x, y）
// 中央の帯（タイトル）と、左上・左下（ラベル・カテゴリー名）には置かず、上下の帯の右寄りに散らす
const SLOTS = [
  [0.44, 0.1], [0.62, 0.07], [0.79, 0.12], [0.94, 0.08],
  [0.52, 0.91], [0.69, 0.94], [0.85, 0.89], [0.96, 0.76],
];

// 横長のサムネイル（新着記事のカードなど）で絵を多めに散らすときの配置の候補
// 上下の帯に間をあけて並べる。中央のタイトルと、左上・左下の文字の位置はよける
const DENSE_SLOTS = [
  [0.36, 0.1], [0.48, 0.16], [0.6, 0.08], [0.71, 0.17], [0.82, 0.08], [0.93, 0.15],
  [0.55, 0.9], [0.65, 0.84], [0.75, 0.92], [0.85, 0.84], [0.95, 0.91],
];

// slug から決まる簡単な乱数（毎回同じ結果になる）
function seededRandom(seed) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.codePointAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function pickIcons(post, max) {
  const text = `${post.slug} ${(post.tags ?? []).join(' ')}`;
  const themed = THEME_RULES.filter(([re]) => re.test(text)).flatMap(([, icons]) => icons);
  const base = CATEGORY_ICONS[post.category] ?? ['store'];
  // テーマのモチーフを優先し、カテゴリーのモチーフで補う（多めに描くときは共通のモチーフも足す）
  const extra = max > 4 ? EXTRA_ICONS : [];
  return [...new Set([...themed, ...base, ...extra])].slice(0, max);
}

// dense を付けると、横長のサムネイル向けに絵を多め・小さめに散らす
export default function ThemeBackground({ post, width = 400, height = 350, dense = false }) {
  const random = seededRandom(post.slug);
  const slots = dense ? DENSE_SLOTS : SLOTS;
  const icons = pickIcons(post, dense ? 7 : 4);
  // 配置の候補をずらして、記事ごとに違う並びにする（候補の数と互いに素な数ずつ進めて、全部の候補を使う）
  const offset = Math.floor(random() * slots.length);
  const count = slots.length;
  const step = dense ? 5 : 3;
  const items = Array.from({ length: count }, (_, i) => {
    const [sx, sy] = slots[(offset + i * step) % slots.length];
    const size = dense ? 22 + random() * 16 : 30 + random() * 26;
    return {
      icon: icons[i % icons.length],
      x: sx * width + (random() - 0.5) * 18 - size / 2,
      y: sy * height + (random() - 0.5) * 18 - size / 2,
      size,
      rotate: (random() - 0.5) * 40,
      opacity: 0.22 + random() * 0.22,
    };
  });

  return (
    <svg
      className="theme-bg"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {items.map((item, i) => (
        <g
          key={i}
          transform={`translate(${item.x.toFixed(1)} ${item.y.toFixed(1)}) rotate(${item.rotate.toFixed(1)} ${(item.size / 2).toFixed(1)} ${(item.size / 2).toFixed(1)}) scale(${(item.size / 24).toFixed(3)})`}
          opacity={item.opacity.toFixed(2)}
        >
          <path
            d={ICONS[item.icon]}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      ))}
    </svg>
  );
}
