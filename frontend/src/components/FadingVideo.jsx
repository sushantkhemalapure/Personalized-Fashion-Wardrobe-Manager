const { useRef, useEffect } = React;

const FASHION_VIDEOS = [
  "https://assets.mixkit.co/videos/preview/mixkit-woman-modeling-fashion-clothes-in-a-studio-43751-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-fashionable-woman-posing-on-street-42510-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-woman-posing-in-the-studio-39875-large.mp4",
];

const loadVideoSource = (video, source) => {
  if (source.endsWith(".m3u8") && window.Hls && window.Hls.isSupported()) {
    const hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: false,
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    return hls;
  }

  video.src = source;
  return null;
};

window.FadingVideo = function FadingVideo({ className = "", overlay = true }) {
  const videoARef = useRef(null);
  const videoBRef = useRef(null);
  const indexRef = useRef(0);
  const activeRef = useRef("A");
  const rafRef = useRef(null);
  const timerRef = useRef(null);
  const hlsARef = useRef(null);
  const hlsBRef = useRef(null);

  useEffect(() => {
    const vA = videoARef.current;
    const vB = videoBRef.current;
    if (!vA || !vB) return;

    hlsARef.current = loadVideoSource(vA, FASHION_VIDEOS[0]);
    vA.style.opacity = "1";
    vB.style.opacity = "0";
    vA.load();
    vA.play().catch(() => {});

    const crossfade = (from, to, done) => {
      let start = null;
      const duration = 1300;

      const tick = (time) => {
        if (!start) start = time;
        const t = Math.min((time - start) / duration, 1);
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        from.style.opacity = String(1 - eased);
        to.style.opacity = String(eased);

        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        from.style.opacity = "0";
        to.style.opacity = "1";
        done();
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    const schedule = () => {
      timerRef.current = setTimeout(() => {
        indexRef.current = (indexRef.current + 1) % FASHION_VIDEOS.length;
        const isA = activeRef.current === "A";
        const outgoing = isA ? vA : vB;
        const incoming = isA ? vB : vA;
        const incomingHlsRef = isA ? hlsBRef : hlsARef;
        const outgoingHlsRef = isA ? hlsARef : hlsBRef;

        incomingHlsRef.current?.destroy?.();
        incomingHlsRef.current = loadVideoSource(incoming, FASHION_VIDEOS[indexRef.current]);
        incoming.load();
        incoming.play().catch(() => {});

        crossfade(outgoing, incoming, () => {
          outgoingHlsRef.current?.destroy?.();
          outgoingHlsRef.current = null;
          activeRef.current = isA ? "B" : "A";
          schedule();
        });
      }, 6200);
    };

    schedule();

    return () => {
      clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      hlsARef.current?.destroy?.();
      hlsBRef.current?.destroy?.();
    };
  }, []);

  return (
    <div className={`video-wrap ${className}`}>
      <video ref={videoARef} muted playsInline preload="auto" style={{ opacity: 1, transition: "none" }} />
      <video ref={videoBRef} muted playsInline preload="auto" style={{ opacity: 0, transition: "none" }} />
      {overlay && <div className="video-overlay" />}
    </div>
  );
};
