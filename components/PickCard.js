// 実際の商品の例（楽天アフィリエイトなどで発行した画像付きリンク）を小さく表示するカード
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
        <span className="pick-button">{pick.shop}で見る</span>
      </span>
    </a>
  );
}
