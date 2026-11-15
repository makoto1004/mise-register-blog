// 記事の目次：本文の h2 に id を付け、目次の項目（id と見出しの文字）を取り出す。
// state は 1 記事で 1 つ共有する（本文が差し込みブロックで分かれても、番号が記事全体で続くように）

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };

// HTML のタグを取り、よく使う文字参照を戻した、ふつうの文字にする
function toPlainText(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&(amp|lt|gt|quot|#39);/g, (m) => ENTITIES[m])
    .trim();
}

// 属性のない <h2>…</h2> だけを対象にする（比較表などの見出し class="products-heading" は目次に入れない）
export function addHeadingIds(html, state) {
  const headings = [];
  const out = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (all, inner) => {
    state.count += 1;
    const id = `sec-${state.count}`;
    headings.push({ id, text: toPlainText(inner) });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: out, headings };
}
