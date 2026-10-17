// タイトルロゴ「mise & register」
// mise はセリフ体、& は細い斜体のアクセント色、register は端正なゴシック。左に軒先テントの線画を添える
export function AwningMark({ className = 'logo-mark' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* テントの屋根とひだ */}
        <path d="M4 9h24l-2 6H6z" />
        <path d="M6 15c0 2 3.3 2 3.3 0 0 2 3.4 2 3.4 0 0 2 3.3 2 3.3 0 0 2 3.4 2 3.4 0 0 2 3.3 2 3.3 0 0 2 3.3 2 3.3 0" />
        <path d="M12 9l-.7 6 M20 9l.7 6" />
        {/* お店の入り口 */}
        <path d="M7 18v9h18v-9 M13 27v-6h6v6" />
      </g>
    </svg>
  );
}

export default function Logo({ as: Tag = 'span', className = '' }) {
  return (
    <Tag className={`logo ${className}`}>
      <AwningMark />
      <span className="logo-text">
        <span className="logo-mise">mise</span>
        <span className="logo-amp">&amp;</span>
        <span className="logo-register">register</span>
      </span>
    </Tag>
  );
}
