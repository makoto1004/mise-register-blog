// トップページの背景に敷く、4 業種の情景の線画（カフェ・美容院・アパレル・キッチンカー）
// 細い線・薄い色で、上部の左右にだけ置く（中央の文字のじゃまをしない）

import { SCENES } from '@/lib/scenes';

function Scene({ name, x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {SCENES[name].map((d, i) => (
        <path key={i} d={d} />
      ))}
    </g>
  );
}

// トップの見出し部分の背景（1200×360 の枠。左右に 2 つずつ）
export default function StoreScenes() {
  return (
    <svg className="store-scenes" viewBox="0 0 1200 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke">
        <Scene name="cafe" x={20} y={22} scale={0.95} />
        <Scene name="salon" x={110} y={196} scale={0.8} />
        <Scene name="apparel" x={968} y={22} scale={0.95} />
        <Scene name="kitchen-car" x={900} y={200} scale={0.8} />
      </g>
    </svg>
  );
}
