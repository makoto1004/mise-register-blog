// 記事一覧で使うタイトル。「｜」があれば、後ろを小見出しとして次の行に小さく出す
export default function PostTitle({ title }) {
  const index = title.indexOf('｜');
  if (index < 0) return title;
  return (
    <>
      <span className="title-main">{title.slice(0, index)}</span>
      <span className="title-sub">{title.slice(index + 1)}</span>
    </>
  );
}
