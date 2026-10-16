// タグをピル型で並べて表示する
export default function TagList({ tags }) {
  if (tags.length === 0) return null;
  return (
    <ul className="tags">
      {tags.map((tag) => (
        <li key={tag} className="tag">#{tag}</li>
      ))}
    </ul>
  );
}
