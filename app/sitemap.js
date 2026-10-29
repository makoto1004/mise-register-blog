import { getAllPosts } from '@/lib/posts';
import { SITE, CATEGORIES } from '@/lib/site';

// Static Export でも sitemap.xml を出力するために静的生成を指定する
export const dynamic = 'force-static';

export default function sitemap() {
  const posts = getAllPosts().map((post) => ({
    url: `${SITE.url}/posts/${post.slug}`,
    lastModified: post.updated || post.date,
  }));
  const categories = Object.keys(CATEGORIES).map((slug) => ({
    url: `${SITE.url}/category/${slug}`,
  }));
  // 有料の作業代行のページは、受付を始めてから載せる
  const services = SITE.orderFormUrl ? [{ url: `${SITE.url}/services` }] : [];
  return [{ url: `${SITE.url}/` }, { url: `${SITE.url}/site-map` }, { url: `${SITE.url}/search` }, ...services, ...categories, ...posts];
}
