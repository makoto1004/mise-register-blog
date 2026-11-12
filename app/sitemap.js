import { getAllPosts } from '@/lib/posts';
import { SITE, CATEGORIES } from '@/lib/site';
import { JOURNEY_STEPS } from '@/lib/journey';

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
  // 作業代行（できること・できないこと）のページ。受付の前も常に載せる
  const services = [{ url: `${SITE.url}/services` }];
  // 開業準備の道のりの 4 ページ
  const journey = JOURNEY_STEPS.map((step) => ({ url: `${SITE.url}${step.path}` }));
  return [{ url: `${SITE.url}/` }, { url: `${SITE.url}/site-map` }, { url: `${SITE.url}/search` }, { url: `${SITE.url}/opening-checklist` }, { url: `${SITE.url}/templates` }, ...journey, ...services, ...categories, ...posts];
}
