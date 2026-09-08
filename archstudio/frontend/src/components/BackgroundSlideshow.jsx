import { useState, useEffect, useRef } from 'react';

const media = [
  { type: 'video', src: '/videos/hero_videos/hero-bg-1.mp4' },
  { type: 'video', src: '/videos/hero_videos/hero-bg-2.mp4' },
  { type: 'video', src: '/videos/hero_videos/hero-bg-3.mp4' },
  { type: 'video', src: '/videos/hero_videos/hero-bg-4.mp4' },
  { type: 'video', src: '/videos/hero_videos/hero-bg-5.mp4' },
  { type: 'video', src: '/videos/hero_videos/hero-bg-6.mp4' },
];

function BackgroundVideo() {
  const [index, setIndex] = useState(0);
  const current = media[index];
  const videoRef = useRef(null);

  const goNext = () => {
    setIndex((prev) => (prev + 1) % media.length);
  };

  useEffect(() => {
    const vid = videoRef.current;
    if (vid) {
      vid.muted = true;
      vid.setAttribute('muted', '');
      const p = vid.play();
      if (p !== undefined) {
        p.catch(() => {});
      }
    }
  }, [index]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#111]">
      <video
        ref={videoRef}
        key={current.src}
        playsInline
        onEnded={goNext}
        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
      >
        <source src={current.src} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/55"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black"></div>
    </div>
  );
}

export default BackgroundVideo;