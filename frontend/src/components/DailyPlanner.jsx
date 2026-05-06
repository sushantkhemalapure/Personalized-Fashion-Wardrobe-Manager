const { useRef: dailyUseRef, useState: dailyUseState } = React;
const { motion: dailyMotion, useInView: dailyUseInView } = window.Motion;

const TIMELINE = [
  {
    id: "client-presentation",
    time: "07:00 AM",
    period: "Morning",
    event: "Client Presentation",
    detail: "A structured shirt, tailored trousers, and polished loafers create a sharp first impression.",
    outfit: "Crisp Shirt / Tailored Trousers / Leather Loafers",
    overview: "Built for a high-visibility meeting where confidence, polish, and comfort need to work together.",
    images: [
      {
        label: "Top Wear",
        name: "Crisp Shirt",
        src: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=720&q=85",
      },
      {
        label: "Bottom Wear",
        name: "Tailored Trousers",
        src: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=720&q=85",
      },
      {
        label: "Footwear",
        name: "Leather Loafers",
        src: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=720&q=85",
      },
    ],
  },
  {
    id: "strategy-session",
    time: "01:00 PM",
    period: "Afternoon",
    event: "Strategy Session",
    detail: "Layer with a blazer for a confident boardroom look that still feels comfortable through long discussions.",
    outfit: "Blazer / Knit Top / Derby Shoes",
    overview: "Designed for collaborative planning, leadership discussions, and a workday that needs relaxed authority.",
    images: [
      {
        label: "Layer",
        name: "Blazer",
        src: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=720&q=85",
      },
      {
        label: "Top Wear",
        name: "Knit Top",
        src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=720&q=85",
      },
      {
        label: "Footwear",
        name: "Derby Shoes",
        src: "https://images.unsplash.com/photo-1614251055880-ee96e4803393?auto=format&fit=crop&w=720&q=85",
      },
    ],
  },
  {
    id: "executive-networking",
    time: "07:30 PM",
    period: "Evening",
    event: "Executive Networking",
    detail: "Darker tones and refined footwear keep the outfit elevated for after-hours professional events.",
    outfit: "Dark Blazer / Pressed Pants / Chelsea Boots",
    overview: "A refined evening look for professional mixers, investor conversations, and formal social settings.",
    images: [
      {
        label: "Layer",
        name: "Dark Blazer",
        src: "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=720&q=85",
      },
      {
        label: "Bottom Wear",
        name: "Pressed Pants",
        src: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=720&q=85",
      },
      {
        label: "Footwear",
        name: "Chelsea Boots",
        src: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=720&q=85",
      },
    ],
  },
];

window.DAILY_TIMELINE = TIMELINE;

window.DailyPlanner = function DailyPlanner({ onOpenDetail }) {
  const [active, setActive] = dailyUseState(0);
  const ref = dailyUseRef(null);
  const isInView = dailyUseInView(ref, { once: true, amount: 0.18 });

  return (
    <section id="profile" ref={ref}>
      <div className="fashion-backdrop" />
      <div className="section-shell">
        <dailyMotion.div
          style={{ textAlign: "center" }}
          initial={{ opacity: 0, y: 34 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="section-label">Daily Planner</div>
          <h2 className="section-title">Your Day, Styled<br />Hour by Hour</h2>
          <p className="section-copy" style={{ margin: "0.9rem auto 0" }}>
            Select a professional moment to review the styling details and outfit images.
          </p>
        </dailyMotion.div>

        <div className="timeline">
          {TIMELINE.map((item, index) => (
            <dailyMotion.button
              key={item.time}
              className={`timeline-item ${active === index ? "active" : ""}`}
              initial={{ opacity: 0, x: -28 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.58, delay: index * 0.12, ease: [0.23, 1, 0.32, 1] }}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => onOpenDetail(item)}
              type="button"
            >
              <div className="timeline-dot" />
              <div className="timeline-card glass glow-hover">
                <div className="timeline-time">{item.time} / {item.period}</div>
                <div className="timeline-event">{item.event}</div>
                <div className="timeline-detail">
                  <p>{item.detail}</p>
                  <p style={{ marginTop: "0.55rem", color: "rgba(255,255,255,0.76)" }}>{item.outfit}</p>
                </div>
              </div>
            </dailyMotion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

window.DayStyleDetail = function DayStyleDetail({ item, onBack }) {
  return (
    <section className="day-detail-page">
      <div className="fashion-backdrop" />
      <div className="section-shell day-detail-shell">
        <button className="btn-secondary day-back-btn" type="button" onClick={onBack}>Back to Planner</button>

        <dailyMotion.div
          className="day-detail-hero"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div>
            <div className="section-label">{item.time} / {item.period}</div>
            <h1 className="section-title">{item.event}</h1>
            <p className="section-copy day-detail-copy">{item.overview}</p>
          </div>
          <div className="day-detail-summary glass">
            <div className="timeline-time">Recommended Outfit</div>
            <div className="timeline-event">{item.outfit}</div>
            <p>{item.detail}</p>
          </div>
        </dailyMotion.div>

        <div className="day-image-grid">
          {item.images.map((image, index) => (
            <dailyMotion.article
              className="day-image-card glass glow-hover"
              key={image.name}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: index * 0.08 }}
            >
              <img src={image.src} alt={image.name} />
              <div className="day-image-card-body">
                <div className="card-category">{image.label}</div>
                <div className="card-name">{image.name}</div>
              </div>
            </dailyMotion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
