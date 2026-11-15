// 記事の最後に出す「同じテーマの記事」を選ぶ。
// 点 ＝ 重なるタグの数 × 2 ＋（同じカテゴリなら 1）。点の高い順、同点は allPosts の並び（新しい順）。
// フロントマターの related（slug の並び）があれば、それを先に出す。

const TAG_POINT = 2;
const CATEGORY_POINT = 1;

export function pickRelated(post, allPosts, count = 3) {
  const bySlug = new Map(allPosts.map((p) => [p.slug, p]));
  const picked = [];
  const used = new Set([post.slug]);

  for (const slug of post.related ?? []) {
    if (picked.length >= count) break;
    if (used.has(slug) || !bySlug.has(slug)) continue;
    picked.push(bySlug.get(slug));
    used.add(slug);
  }

  const tags = new Set(post.tags ?? []);
  const scored = allPosts
    .map((p, index) => {
      const shared = (p.tags ?? []).filter((tag) => tags.has(tag)).length;
      const score = shared * TAG_POINT + (p.category === post.category ? CATEGORY_POINT : 0);
      return { p, index, score };
    })
    .filter(({ p, score }) => score > 0 && !used.has(p.slug))
    .sort((a, b) => b.score - a.score || a.index - b.index);

  for (const { p } of scored) {
    if (picked.length >= count) break;
    picked.push(p);
  }
  return picked;
}
