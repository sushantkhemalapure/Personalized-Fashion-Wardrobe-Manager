const { useRef: featuresUseRef } = React;
const { motion: featuresMotion, useInView: featuresUseInView } = window.Motion;

const FEATURES = [
  {
    icon: "SC",
    title: "Shop Collection",
    desc: "Browse curated clothes with category filters, search, ratings, prices, and quick add-to-cart actions.",
    tags: ["Products", "Search", "Filters", "Pricing"],
  },
  {
    icon: "CF",
    title: "Cart and Favorites",
    desc: "Save favorite pieces, adjust quantities, and review your bag in a responsive shopping panel.",
    tags: ["Cart", "Favorites", "Quantity", "Responsive"],
  },
  {
    icon: "PY",
    title: "Demo Payment",
    desc: "Complete a checkout flow with address details and payment choices for card, UPI, or cash on delivery.",
    tags: ["Checkout", "Card", "UPI", "COD"],
  },
];

window.FeaturesSection = function FeaturesSection() {
  const ref = featuresUseRef(null);
  const isInView = featuresUseInView(ref, { once: true, amount: 0.24 });

  const tilt = (event) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    card.style.transform = `perspective(1000px) rotateX(${-(y / rect.height) * 10}deg) rotateY(${(x / rect.width) * 10}deg) scale(1.03)`;
  };

  const resetTilt = (event) => {
    event.currentTarget.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
  };

  return (
    <section id="suggestions" ref={ref}>
      <div className="fashion-backdrop" />
      <div className="section-shell">
        <featuresMotion.div
          style={{ textAlign: "center" }}
          initial={{ opacity: 0, y: 36 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="section-label">What We Offer</div>
          <h2 className="section-title">Everything You Need<br />to Dress With Confidence</h2>
        </featuresMotion.div>

        <div className="features-grid">
          {FEATURES.map((feature, index) => (
            <featuresMotion.article
              key={feature.title}
              className="feature-card glass glow-hover"
              initial={{ opacity: 0, y: 46 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.68, delay: 0.12 + index * 0.12, ease: [0.23, 1, 0.32, 1] }}
              onMouseMove={tilt}
              onMouseLeave={resetTilt}
            >
              <div className="feature-icon-wrap">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
              <div className="tag-row">
                {feature.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
              </div>
            </featuresMotion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
