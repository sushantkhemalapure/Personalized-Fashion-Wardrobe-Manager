const { useEffect: dailyUseEffect, useMemo: dailyUseMemo, useRef: dailyUseRef, useState: dailyUseState } = React;
const { motion: dailyMotion, useInView: dailyUseInView } = window.Motion;

const DAILY_PERIODS = [
  { id: "morning", time: "07:00 AM", period: "Morning", event: "Morning Look" },
  { id: "afternoon", time: "01:00 PM", period: "Afternoon", event: "Afternoon Look" },
  { id: "evening", time: "07:30 PM", period: "Evening", event: "Evening Look" },
];

const DAILY_REQUIRED_CATEGORIES = [
  { category: "Tops", label: "top" },
  { category: "Bottoms", label: "bottom" },
  { category: "Footwear", label: "shoe" },
  { category: "Accessories", label: "accessory" },
];

const getDailyClosetItems = () => (
  typeof window.getUserClosetItems === "function" ? window.getUserClosetItems() : (window.CLOSET_ITEMS || [])
);

const dailyListText = (items) => {
  if (items.length <= 1) return items[0] || "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
};

const getMissingDailyCategories = (items) => {
  const categories = new Set(items.map((item) => item.category));
  return DAILY_REQUIRED_CATEGORIES
    .filter((item) => !categories.has(item.category))
    .map((item) => item.label);
};

const pickDailyOutfit = (items, slotIndex) => DAILY_REQUIRED_CATEGORIES.map(({ category }) => {
  const categoryItems = items.filter((item) => item.category === category);
  if (!categoryItems.length) return null;
  return categoryItems[slotIndex % categoryItems.length];
});

const buildDailyTimeline = (items) => DAILY_PERIODS.map((slot, slotIndex) => {
  const missing = getMissingDailyCategories(items);
  const outfitItems = missing.length ? [] : pickDailyOutfit(items, slotIndex);
  const outfit = outfitItems.map((item) => item.name).join(" / ");
  const missingText = dailyListText(missing);

  return {
    ...slot,
    id: `${slot.id}-${outfitItems.map((item) => item.id).join("-") || "empty"}`,
    detail: outfitItems.length
      ? "Built from one top, one bottom, one shoe, and one accessory in your wardrobe."
      : `Add at least one ${missingText || "top, bottom, shoe, and accessory"} to build this daily look.`,
    outfit: outfit || "Needs top / bottom / shoe / accessory",
    overview: outfitItems.length
      ? "This daily recommendation uses exactly one top, one bottom, one shoe, and one accessory from your wardrobe uploads."
      : `Your daily planner needs ${missingText || "a complete outfit"} before it can build this look.`,
    images: outfitItems.map((item) => ({
      label: item.category,
      name: item.name,
      src: item.img,
    })),
  };
});

window.DAILY_TIMELINE = [];

window.DailyPlanner = function DailyPlanner({ onOpenDetail }) {
  const [active, setActive] = dailyUseState(0);
  const [refreshKey, setRefreshKey] = dailyUseState(0);
  const ref = dailyUseRef(null);
  const isInView = dailyUseInView(ref, { once: true, amount: 0.18 });
  const closetItems = dailyUseMemo(getDailyClosetItems, [refreshKey]);
  const timeline = dailyUseMemo(() => buildDailyTimeline(closetItems), [closetItems]);

  dailyUseEffect(() => {
    window.DAILY_TIMELINE = timeline;
  }, [timeline]);

  dailyUseEffect(() => {
    const refresh = () => setRefreshKey((current) => current + 1);
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("hashchange", refresh);
    window.addEventListener("wdrb-wardrobe-updated", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("hashchange", refresh);
      window.removeEventListener("wdrb-wardrobe-updated", refresh);
    };
  }, []);

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
          <h2 className="section-title">Your Day, Styled<br />From Your Closet</h2>
          <p className="section-copy" style={{ margin: "0.9rem auto 0" }}>
            Morning, afternoon, and evening looks each use one top, one bottom, one shoe, and one accessory.
          </p>
        </dailyMotion.div>

        {closetItems.length === 0 ? (
          <div className="empty-state glass" style={{ width: "min(760px, 100%)", margin: "3rem auto 0" }}>
            <h3 className="card-name">No clothes added yet</h3>
            <p className="section-copy">Upload your clothes in Wardrobe before using daily outfit planning.</p>
            <a className="btn-primary" href="#wardrobe">Add Clothes</a>
          </div>
        ) : (
          <div className="timeline">
            {timeline.map((item, index) => (
              <dailyMotion.button
                key={item.id}
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
        )}
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

        {item.images.length === 0 ? (
          <div className="empty-state glass">
            <h3 className="card-name">Complete outfit needed</h3>
            <p className="section-copy">{item.detail}</p>
            <a className="btn-primary" href="#wardrobe">Add Clothes</a>
          </div>
        ) : (
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
        )}
      </div>
    </section>
  );
};
