// 参考になる YouTube 動画の埋め込み
// プライバシー強化モード（youtube-nocookie.com）を使い、再生するまで YouTube の Cookie を保存しにくくする
export default function VideoCard({ video }) {
  return (
    <figure className="video-card">
      <div className="video-frame">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.id}`}
          title={video.title || 'YouTube 動画'}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <figcaption>
        <span className="video-title">{video.title}</span>
        {video.channel && <span className="video-channel">{video.channel}</span>}
        {video.note && <span className="video-note">{video.note}</span>}
      </figcaption>
    </figure>
  );
}
