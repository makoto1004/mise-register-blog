// 記事の目次。本文の h2（lib/toc.js で id を付けたもの）へのリンクを並べる。最初から開いた形
export default function PostToc({ items }) {
  return (
    <nav className="post-toc" aria-labelledby="post-toc-heading">
      <p id="post-toc-heading" className="post-toc-heading">
        目次
      </p>
      <ol>
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`}>{item.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
