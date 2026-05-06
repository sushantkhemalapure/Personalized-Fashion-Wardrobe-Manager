const { useMemo: featuresUseMemo, useRef: featuresUseRef } = React;
const { motion: featuresMotion, useInView: featuresUseInView } = window.Motion;

const STYLE_SUGGESTIONS = [
  {
    id: "office",
    title: "Client Meeting",
    note: "Polished layers with strong weather and occasion compatibility.",
    occasion: "Work",
    route: "calendar",
  },
  {
    id: "smart-casual",
    title: "Smart Casual Day",
    note: "Relaxed pieces that still look intentional and professional.",
    occasion: "Daily",
    route: "closet",
  },
  {
    id: "evening",
    title: "Evening Event",
    note: "Statement pieces for dinner or social plans when the weather is dry.",
    occasion: "Evening",
    route: "calendar",
  },
];

window.FeaturesSection = function FeaturesSection() {
  const ref = featuresUseRef(null);
  const isInView = featuresUseInView(ref, { once: true, amount: 0.2 });
  const products = typeof window.getUserClosetItems === "function" ? window.getUserClosetItems() : (window.CLOSET_ITEMS || []);

  const suggestionCards = featuresUseMemo(() => STYLE_SUGGESTIONS.map((suggestion) => {
    const start = STYLE_SUGGESTIONS.findIndex((item) => item.id === suggestion.id);
    const items = products
      .filter((_, index) => index % STYLE_SUGGESTIONS.length === start)
      .slice(0, 3);
    const weather = Math.round(items.reduce((sum, product) => sum + product.usage.score, 0) / Math.max(items.length, 1));
    const ready = Math.round(items.reduce((sum, product) => sum + product.rating, 0) / Math.max(items.length, 1));

    return { ...suggestion, items, weather, ready };
  }), [products.length]);

  return (
    <section id="suggestions" ref={ref} className="suggestions-section">
      <div className="fashion-backdrop" />
      <div className="section-shell suggestions-shell">
        <featuresMotion.div
          className="suggestions-hero glass"
          initial={{ opacity: 0, y: 34 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div>
            <div className="section-label">Style Suggestions</div>
            <h1 className="section-title">Recommended Looks Built From Occasion, Weather, and Wardrobe Readiness</h1>
            <p className="section-copy" style={{ marginTop: "0.9rem" }}>
              Get rule-based outfit suggestions that combine the clothes you own with practical weather and occasion logic.
            </p>
          </div>
          <div className="suggestions-score">
            <strong>{products.length}</strong>
            <span>Your Clothes</span>
          </div>
        </featuresMotion.div>

        <div className="suggestion-actions">
          <a className="glass" href="#closet"><strong>Closet</strong><span>Browse wardrobe items</span></a>
          <a className="glass" href="#planner"><strong>Weather</strong><span>Check live weather</span></a>
          <a className="glass" href="#calendar"><strong>Calendar</strong><span>Plan events</span></a>
          <a className="glass" href="#outfits"><strong>Board</strong><span>Review selected pieces</span></a>
        </div>

        {products.length === 0 ? (
          <div className="empty-state glass">
            <h3 className="card-name">No clothes to suggest yet</h3>
            <p className="section-copy">Upload your clothes in Wardrobe first. Suggestions will only use items you added.</p>
            <a className="btn-primary" href="#wardrobe">Add Clothes</a>
          </div>
        ) : (
          <div className="suggestion-grid">
            {suggestionCards.filter((suggestion) => suggestion.items.length > 0).map((suggestion, index) => (
            <featuresMotion.article
              className="suggestion-card glass glow-hover"
              key={suggestion.id}
              initial={{ opacity: 0, y: 34 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.58, delay: 0.1 + index * 0.1 }}
            >
              <div className="suggestion-images">
                {suggestion.items.map((product) => (
                  <img src={product.img} alt={product.name} key={product.id} loading="lazy" />
                ))}
              </div>
              <div className="suggestion-body">
                <div className="product-meta">
                  <span>{suggestion.occasion}</span>
                  <span>{suggestion.items.length} Items</span>
                </div>
                <h3 className="feature-title">{suggestion.title}</h3>
                <p className="feature-desc">{suggestion.note}</p>
                <div className="suggestion-metrics">
                  <div><span>Weather</span><strong>{suggestion.weather}</strong></div>
                  <div><span>Ready</span><strong>{suggestion.ready}%</strong></div>
                  <div><span>Items</span><strong>{suggestion.items.length}</strong></div>
                </div>
                <div className="tag-row">
                  {suggestion.items.map((product) => <span className="tag" key={product.id}>{product.name}</span>)}
                </div>
                <a className="btn-primary suggestion-btn" href={`#${suggestion.route}`}>Open Suggestion</a>
              </div>
            </featuresMotion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
