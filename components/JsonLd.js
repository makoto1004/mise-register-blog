// 構造化データ（JSON-LD）。検索エンジンに、記事のタイトル・日付・パンくずなどを機械で読める形で伝える
export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      // JSON の中に </script> が入らないよう < をエスケープする
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
