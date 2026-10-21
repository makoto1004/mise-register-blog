// 実際の商品の例（楽天アフィリエイト・もしもアフィリエイトなどで発行した画像付きリンク）を小さく表示するカード
// pixel があれば、表示回数の計測用の画像（1×1）も置く
export default function PickCard({ pick }) {
  return (
    <a href={pick.url} target="_blank" rel="sponsored nofollow noopener" className="pick-card">
      {pick.image && (
        // eslint-disable-next-line @next/next/no-img-element -- アフィリエイトサービスが発行した商品画像
        <img src={pick.image} alt={pick.name} className="pick-image" loading="lazy" />
      )}
      <span className="pick-body">
        <span className="pick-name">{pick.name}</span>
        {pick.note && <span className="pick-note">{pick.note}</span>}
        <span className="pick-button">
          <span className="ad-tag">PR</span>
          {pick.shop}で見る
        </span>
      </span>
      {pick.pixel && (
        // eslint-disable-next-line @next/next/no-img-element -- アフィリエイトサービスの計測用画像（1×1）
        <img src={pick.pixel} width="1" height="1" alt="" className="service-pixel" loading="lazy" />
      )}
    </a>
  );
}
