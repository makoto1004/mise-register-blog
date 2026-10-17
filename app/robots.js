import { SITE } from '@/lib/site';

// Static Export でも robots.txt を出力するために静的生成を指定する
export const dynamic = 'force-static';

// 検索エンジンに、すべてのページを見てよいことと、サイトマップの場所を伝える
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
