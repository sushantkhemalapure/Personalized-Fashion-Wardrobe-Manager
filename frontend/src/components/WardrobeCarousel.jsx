const { useEffect: wardrobeUseEffect, useMemo: wardrobeUseMemo, useRef: wardrobeUseRef, useState: wardrobeUseState } = React;
const { motion: wardrobeMotion, useInView: wardrobeUseInView } = window.Motion;

const DEFAULT_CLOTHES = [
  {
    id: "look-1",
    name: "Silk Evening Gown",
    category: "Dresses",
    tags: ["Evening", "Formal", "Elegant"],
    img: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=720&q=90",
  },
  {
    id: "look-2",
    name: "Oxford Blazer",
    category: "Jackets",
    tags: ["Office", "Smart", "Classic"],
    img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=720&h=900&fit=crop",
  },
  {
    id: "look-3",
    name: "Linen Summer Dress",
    category: "Dresses",
    tags: ["Casual", "Hot", "Breezy"],
    img: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=720&h=900&fit=crop",
  },
  {
    id: "look-4",
    name: "Leather Biker Jacket",
    category: "Jackets",
    tags: ["Street", "Cold", "Party"],
    img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=720&h=900&fit=crop",
  },
  {
    id: "look-5",
    name: "Tailored Trousers",
    category: "Bottoms",
    tags: ["Office", "Neutral", "Smart"],
    img: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=720&q=90",
  },
  {
    id: "look-6",
    name: "Chunky Knit Sweater",
    category: "Tops",
    tags: ["Cozy", "Cold", "Casual"],
    img: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=720&h=900&fit=crop",
  },
];

window.WardrobeCarousel = function WardrobeCarousel() {
  const [items, setItems] = wardrobeUseState([]);
  const [form, setForm] = wardrobeUseState({ name: "", category: "Tops", tags: "", image: "" });
  const [activeIdx, setActiveIdx] = wardrobeUseState(DEFAULT_CLOTHES.length);
  const trackRef = wardrobeUseRef(null);
  const dragging = wardrobeUseRef(false);
  const startX = wardrobeUseRef(0);
  const scrollStart = wardrobeUseRef(0);
  const sectionRef = wardrobeUseRef(null);
  const isInView = wardrobeUseInView(sectionRef, { once: true, amount: 0.16 });

  wardrobeUseEffect(() => {
    const saved = JSON.parse(localStorage.getItem("wardrobe-items") || "[]");
    setItems(saved);
  }, []);

  wardrobeUseEffect(() => {
    localStorage.setItem("wardrobe-items", JSON.stringify(items));
  }, [items]);

  const clothes = wardrobeUseMemo(() => [...DEFAULT_CLOTHES, ...items], [items]);
  const allCards = wardrobeUseMemo(() => [...clothes, ...clothes, ...clothes], [clothes]);

  wardrobeUseEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    setTimeout(() => {
      const width = getCardWidth();
      track.scrollLeft = width * clothes.length;
      setActiveIdx(clothes.length);
    }, 0);
  }, [clothes.length]);

  const getCardWidth = () => {
    const card = trackRef.current?.querySelector(".carousel-card");
    if (!card) return 344;
    const styles = window.getComputedStyle(trackRef.current.querySelector(".carousel-track"));
    return card.getBoundingClientRect().width + parseFloat(styles.columnGap || styles.gap || 22);
  };

  const snapToNearest = () => {
    const track = trackRef.current;
    if (!track) return;
    const width = getCardWidth();
    const snapped = Math.round(track.scrollLeft / width) * width;
    const idx = Math.round(snapped / width);
    track.scrollTo({ left: snapped, behavior: "smooth" });
    setActiveIdx(idx);

    setTimeout(() => {
      const len = clothes.length;
      if (idx < len) track.scrollLeft = snapped + len * width;
      if (idx >= len * 2) track.scrollLeft = snapped - len * width;
    }, 360);
  };

  const addItem = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.image) return;

    setItems((current) => [
      ...current,
      {
        id: `custom-${Date.now()}`,
        name: form.name.trim(),
        category: form.category,
        tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 4),
        img: form.image,
      },
    ]);
    setForm({ name: "", category: "Tops", tags: "", image: "" });
  };

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const deleteItem = (id) => setItems((current) => current.filter((item) => item.id !== id));

  const scrollCarousel = (direction) => {
    const track = trackRef.current;
    if (!track) return;

    const width = getCardWidth();
    const nextLeft = track.scrollLeft + direction * width;
    const idx = Math.round(nextLeft / width);

    track.scrollTo({ left: nextLeft, behavior: "smooth" });
    setActiveIdx(idx);

    setTimeout(() => {
      const len = clothes.length;
      if (idx < len) track.scrollLeft = nextLeft + len * width;
      if (idx >= len * 2) track.scrollLeft = nextLeft - len * width;
    }, 360);
  };

  return (
    <section id="wardrobe" className="carousel-section" ref={sectionRef}>
      <div className="fashion-backdrop" />
      <div className="section-shell">
        <wardrobeMotion.div
          className="carousel-heading"
          initial={{ opacity: 0, y: 34 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="section-label">My Wardrobe</div>
          <h2 className="section-title">Your Digital Closet</h2>
          <p className="section-copy" style={{ margin: "0.9rem auto 0" }}>
            Drag through curated pieces, upload your own clothes, and keep everything available for planning.
          </p>
        </wardrobeMotion.div>

        <div className="carousel-stage">
          <button className="carousel-btn carousel-btn-prev" type="button" onClick={() => scrollCarousel(-1)} aria-label="Previous wardrobe item">
            &lt;
          </button>
          <button className="carousel-btn carousel-btn-next" type="button" onClick={() => scrollCarousel(1)} aria-label="Next wardrobe item">
            &gt;
          </button>

          <div
            className="carousel-track-wrap"
            ref={trackRef}
            onMouseDown={(event) => {
              dragging.current = true;
              startX.current = event.pageX;
              scrollStart.current = trackRef.current.scrollLeft;
            }}
            onMouseMove={(event) => {
              if (!dragging.current) return;
              trackRef.current.scrollLeft = scrollStart.current - (event.pageX - startX.current);
            }}
            onMouseUp={() => { dragging.current = false; snapToNearest(); }}
            onMouseLeave={() => { if (dragging.current) { dragging.current = false; snapToNearest(); } }}
            onTouchStart={(event) => {
              startX.current = event.touches[0].pageX;
              scrollStart.current = trackRef.current.scrollLeft;
            }}
            onTouchMove={(event) => {
              trackRef.current.scrollLeft = scrollStart.current - (event.touches[0].pageX - startX.current);
            }}
            onTouchEnd={snapToNearest}
          >
            <div className="carousel-track">
              {allCards.map((item, index) => (
                <article
                  className={`carousel-card glass glass-3d glow-hover ${index === activeIdx ? "center-card" : ""}`}
                  key={`${item.id}-${index}`}
                >
                  <div className="card-img-wrap">
                    <img
                      src={item.img}
                      alt={item.name}
                      draggable={false}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.src = "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=720&q=90";
                      }}
                    />
                  </div>
                  <div className="card-body glass-dark">
                    <div className="card-category">{item.category}</div>
                    <div className="card-name">{item.name}</div>
                    <div className="tag-row">
                      {item.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <wardrobeMotion.div
          className="wardrobe-manager"
          initial={{ opacity: 0, y: 34 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.18 }}
        >
          <form className="upload-panel glass" onSubmit={addItem}>
            <div className="section-label">Upload Clothes</div>
            <h3 className="card-name" style={{ fontSize: "1.65rem" }}>Add a wardrobe item</h3>
            <div className="upload-grid">
              <input className="input" placeholder="Item name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              <select className="custom-select" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                {["Tops", "Bottoms", "Dresses", "Jackets", "Shoes", "Accessories"].map((category) => <option key={category}>{category}</option>)}
              </select>
              <input className="input" placeholder="Tags: office, rainy, casual" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} />
              <input className="input" type="file" accept="image/*" onChange={handleImage} />
            </div>
            <button className="btn-primary" type="submit" style={{ marginTop: "1rem" }}>Save Item</button>
          </form>

          <div className="saved-panel glass">
            <div className="section-label">Local Wardrobe</div>
            <h3 className="card-name" style={{ fontSize: "1.65rem" }}>{items.length} saved pieces</h3>
            <div className="saved-list">
              {items.length === 0 && <p className="section-copy" style={{ fontSize: "0.9rem" }}>Upload a clothing photo to store it in this browser.</p>}
              {items.map((item) => (
                <div className="saved-item" key={item.id}>
                  <img src={item.img} alt={item.name} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.48)", fontSize: "0.82rem" }}>{item.category}</div>
                  </div>
                  <button className="delete-btn" onClick={() => deleteItem(item.id)} aria-label={`Delete ${item.name}`}>x</button>
                </div>
              ))}
            </div>
          </div>
        </wardrobeMotion.div>
      </div>
    </section>
  );
};
