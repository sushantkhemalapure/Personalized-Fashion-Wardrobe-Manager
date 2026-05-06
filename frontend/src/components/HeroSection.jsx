const { useEffect: heroUseEffect, useRef: heroUseRef } = React;
const { motion: heroMotion, useScroll: heroUseScroll, useTransform: heroUseTransform } = window.Motion;

const FLOATING_LABELS = ["closet", "weather", "coat", "tee", "boots", "denim", "dress", "planner", "occasion", "style"];

const HOME_SHOWCASE = [
  {
    label: "Workday Capsule",
    title: "Power Dressing",
    copy: "Blazers, shirts, trousers, and shoes grouped as reusable wardrobe items for meetings that matter.",
    image: "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=90",
  },
  {
    label: "Weekend Rotation",
    title: "Street Polish",
    copy: "Relaxed silhouettes, easy sneakers, and casual pieces organized for repeatable off-duty looks.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=90",
  },
  {
    label: "Evening Plan",
    title: "After Hours",
    copy: "Dark textures, sharper shoes, and occasion-ready outfits built from your saved closet.",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=90",
  },
];

const HOME_STEPS = [
  ["01", "Add", "Upload or browse wardrobe items by category, season, fabric, and color."],
  ["02", "Organize", "Save useful pieces and keep an outfit board stored in your browser."],
  ["03", "Suggest", "Pick occasion and weather to get simple rule-based outfit ideas."],
  ["04", "Plan", "Save looks for work, casual days, rainy plans, parties, and travel."],
];

window.HeroSection = function HeroSection() {
  const iconsRef = heroUseRef(null);
  const homeRef = heroUseRef(null);
  const { scrollYProgress } = heroUseScroll({ target: homeRef, offset: ["start start", "end end"] });
  const heroDepth = heroUseTransform(scrollYProgress, [0, 0.35], [0, -130]);
  const heroScale = heroUseTransform(scrollYProgress, [0, 0.35], [1, 0.92]);
  const leftCardY = heroUseTransform(scrollYProgress, [0, 0.55], [70, -120]);
  const rightCardY = heroUseTransform(scrollYProgress, [0, 0.55], [-40, 105]);
  const centerRotate = heroUseTransform(scrollYProgress, [0, 0.65], [-7, 8]);

  heroUseEffect(() => {
    const container = iconsRef.current;
    if (!container) return;

    const spawn = () => {
      const el = document.createElement("div");
      el.className = "floating-icon";
      el.textContent = FLOATING_LABELS[Math.floor(Math.random() * FLOATING_LABELS.length)];
      el.style.left = `${8 + Math.random() * 84}%`;
      el.style.animationDuration = `${9 + Math.random() * 8}s`;
      el.style.animationDelay = `${Math.random() * 1.5}s`;
      container.appendChild(el);
      setTimeout(() => el.remove(), 18000);
    };

    for (let i = 0; i < 5; i += 1) setTimeout(spawn, i * 350);
    const interval = setInterval(spawn, 1450);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="home" className="home-page" ref={homeRef}>
      <section className="hero-section home-hero">
        <FadingVideo />
        <div className="floating-icons" ref={iconsRef} />
        <heroMotion.div className="home-orbit home-orbit-left" style={{ y: leftCardY }}>
          <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=520&q=90" alt="Editorial fashion look" />
        </heroMotion.div>
        <heroMotion.div className="home-orbit home-orbit-right" style={{ y: rightCardY }}>
          <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=520&q=90" alt="Runway outfit" />
        </heroMotion.div>
        <heroMotion.div className="hero-content" style={{ y: heroDepth, scale: heroScale }}>
          <heroMotion.div
            className="hero-badge glass"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.55 }}
          >
            <span className="hero-badge-dot" />
            New - Smart Outfit Planning Now Live
          </heroMotion.div>

          <heroMotion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 38 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            Style Smarter,<br />Dress Better Every Day
          </heroMotion.h1>

          <heroMotion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62, duration: 0.68 }}
          >
            Organize your clothes, track useful pieces, and get simple outfit suggestions based on occasion and weather.
          </heroMotion.p>

          <heroMotion.div
            className="hero-ctas"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.82, duration: 0.58 }}
          >
            <a className="btn-primary" href="#closet">Open Closet</a>
            <a className="btn-secondary" href="#wardrobe">Manage Wardrobe</a>
          </heroMotion.div>
        </heroMotion.div>
      </section>

      <section className="home-cinematic-section">
        <div className="section-shell home-cinematic-shell">
          <heroMotion.div
            className="home-cinematic-copy"
            initial={{ opacity: 0, y: 42 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.28 }}
            transition={{ duration: 0.75 }}
          >
            <div className="section-label">Wardrobe System</div>
            <h2 className="section-title">A Closet That Moves With Your Day</h2>
            <p className="section-copy">
              The app centers on the user wardrobe: catalog items, match them by occasion, and understand when each piece works best.
            </p>
          </heroMotion.div>
          <div className="home-3d-stage">
            {HOME_SHOWCASE.map((item, index) => (
              <heroMotion.article
                className={`home-3d-card home-3d-card-${index + 1}`}
                key={item.title}
                style={index === 1 ? { rotateZ: centerRotate } : {}}
                initial={{ opacity: 0, y: 80, rotateX: 18 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, amount: 0.24 }}
                transition={{ duration: 0.7, delay: index * 0.12 }}
              >
                <img src={item.image} alt={item.title} />
                <div className="home-3d-card-body glass-dark">
                  <span>{item.label}</span>
                  <strong>{item.title}</strong>
                  <p>{item.copy}</p>
                </div>
              </heroMotion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-feature-strip">
        <div className="section-shell home-feature-shell">
          {HOME_STEPS.map(([number, title, copy], index) => (
            <heroMotion.article
              className="home-step glass glow-hover"
              key={title}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.32 }}
              transition={{ duration: 0.55, delay: index * 0.08 }}
            >
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </heroMotion.article>
          ))}
        </div>
      </section>

      <section className="home-editorial-section">
        <div className="section-shell home-editorial-shell">
          <heroMotion.div
            className="home-editorial-image"
            initial={{ opacity: 0, x: -60, rotateY: -16 }}
            whileInView={{ opacity: 1, x: 0, rotateY: -4 }}
            viewport={{ once: true, amount: 0.28 }}
            transition={{ duration: 0.8 }}
          >
            <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1100&q=90" alt="Fashion campaign model" />
          </heroMotion.div>
          <heroMotion.div
            className="home-editorial-copy"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.28 }}
            transition={{ duration: 0.75, delay: 0.1 }}
          >
            <div className="section-label">Personal Styling</div>
            <h2 className="section-title">From Closet Items to Complete Looks</h2>
            <p className="section-copy">
              Move from wardrobe management into weather-aware outfit planning and daily styling without relying on AI or store flows.
            </p>
            <div className="home-editorial-actions">
              <a className="btn-primary" href="#closet">Open Closet</a>
              <a className="btn-secondary" href="#planner">Plan Outfit</a>
            </div>
          </heroMotion.div>
        </div>
      </section>
    </div>
  );
};
