const { useEffect: wardrobeUseEffect, useMemo: wardrobeUseMemo, useRef: wardrobeUseRef, useState: wardrobeUseState } = React;
const { motion: wardrobeMotion, useInView: wardrobeUseInView } = window.Motion;

const readUserWardrobeItems = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("wardrobe-items") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    localStorage.removeItem("wardrobe-items");
    return [];
  }
};

const closetCategoryFor = (category) => ({
  Jackets: "Layers",
  Shoes: "Footwear",
}[category] || category);

const weatherForTags = (tags) => {
  const text = tags.join(" ").toLowerCase();
  if (text.includes("rain")) return "Rainy";
  if (text.includes("cold") || text.includes("winter")) return "Cold";
  if (text.includes("hot") || text.includes("summer")) return "Hot";
  if (text.includes("mild") || text.includes("warm")) return "Mild";
  if (text.includes("dry")) return "Dry";
  return "Any";
};

const normalizeUserClosetItem = (item, index = 0) => {
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const weather = weatherForTags(tags);
  const occasions = tags.length ? tags : ["Daily"];

  return {
    ...item,
    id: item.id || `custom-${index}`,
    name: item.name || "Wardrobe Item",
    category: closetCategoryFor(item.category || "Tops"),
    season: weather === "Any" ? "All Season" : weather,
    weather,
    rating: 80 + (index % 16),
    img: item.img,
    tags: tags.length ? tags : ["Daily"],
    usage: {
      score: 82 + (index % 14),
      occasions,
      weatherMatch: weather === "Any" ? "Flexible weather" : `${weather} weather`,
      repeats: "Rotated by calendar",
      note: "This suggestion uses only clothes you added to your wardrobe.",
    },
    care: {
      frequency: "As needed",
      fabric: "Your wardrobe",
      status: item.inLaundry && isLaundryEligible(item) ? "In laundry" : "Added by you",
      tip: "Check the item before wearing it.",
      priority: "Low",
    },
  };
};

const notifyWardrobeUpdated = (items) => {
  window.dispatchEvent(new CustomEvent("wdrb-wardrobe-updated", { detail: { items } }));
};

const isLaundryEligible = (item) => item.category !== "Accessories";
const getAvailableWardrobeItems = () => readUserWardrobeItems().filter((item) => !item.inLaundry || !isLaundryEligible(item));
const getLaundryWardrobeItems = () => readUserWardrobeItems().filter((item) => item.inLaundry && isLaundryEligible(item));
const refreshWardrobeGlobals = () => {
  window.CLOSET_ITEMS = getAvailableWardrobeItems().map(normalizeUserClosetItem);
  window.LAUNDRY_ITEMS = getLaundryWardrobeItems().map(normalizeUserClosetItem);
  window.SHOP_PRODUCTS = window.CLOSET_ITEMS;
  notifyWardrobeUpdated(window.CLOSET_ITEMS);
};

window.getUserWardrobeItems = readUserWardrobeItems;
window.getUserClosetItems = () => getAvailableWardrobeItems().map(normalizeUserClosetItem);
window.getLaundryItems = () => getLaundryWardrobeItems().map(normalizeUserClosetItem);
window.setWardrobeLaundryStatus = (id, inLaundry) => {
  const nextItems = readUserWardrobeItems().map((item) => (
    item.id === id && isLaundryEligible(item)
      ? {
        ...item,
        inLaundry,
        laundryAt: inLaundry ? new Date().toISOString() : null,
      }
      : item
  ));
  localStorage.setItem("wardrobe-items", JSON.stringify(nextItems));
  refreshWardrobeGlobals();
  return nextItems;
};
window.CLOSET_ITEMS = window.getUserClosetItems();
window.LAUNDRY_ITEMS = window.getLaundryItems();
window.SHOP_PRODUCTS = window.CLOSET_ITEMS;

window.WardrobeCarousel = function WardrobeCarousel() {
  const [items, setItems] = wardrobeUseState(readUserWardrobeItems);
  const [form, setForm] = wardrobeUseState({ name: "", category: "Tops", tags: "", image: "" });
  const [category, setCategory] = wardrobeUseState("All");
  const sectionRef = wardrobeUseRef(null);
  const isInView = wardrobeUseInView(sectionRef, { once: true, amount: 0.16 });

  wardrobeUseEffect(() => {
    localStorage.setItem("wardrobe-items", JSON.stringify(items));
    refreshWardrobeGlobals();
  }, [items]);

  const clothes = wardrobeUseMemo(() => items, [items]);
  const availableCount = wardrobeUseMemo(() => clothes.filter((item) => !item.inLaundry || !isLaundryEligible(item)).length, [clothes]);
  const laundryCount = wardrobeUseMemo(() => clothes.filter((item) => item.inLaundry && isLaundryEligible(item)).length, [clothes]);
  const categories = wardrobeUseMemo(() => ["All", ...new Set(clothes.map((item) => item.category))], [clothes]);
  const filteredClothes = wardrobeUseMemo(() => (
    category === "All" ? clothes : clothes.filter((item) => item.category === category)
  ), [category, clothes]);

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
  const setLaundryStatus = (id, inLaundry) => setItems((current) => current.map((item) => (
    item.id === id && isLaundryEligible(item)
      ? {
        ...item,
        inLaundry,
        laundryAt: inLaundry ? new Date().toISOString() : null,
      }
      : item
  )));

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
          <h2 className="section-title">What You Have in Your Wardrobe</h2>
          <p className="section-copy" style={{ margin: "0.9rem auto 0" }}>
            View every clothing item you own, upload new pieces, and filter your wardrobe by category.
          </p>
        </wardrobeMotion.div>

        <div className="shop-stats glass" style={{ margin: "2rem auto 1rem", maxWidth: "900px" }}>
          <div><strong>{clothes.length}</strong><span>Total Pieces</span></div>
          <div><strong>{availableCount}</strong><span>Available Now</span></div>
          <a href="#laundry"><strong>{laundryCount}</strong><span>In Laundry</span></a>
          <div><strong>{categories.length - 1}</strong><span>Categories</span></div>
        </div>

        <div className="shop-toolbar glass" style={{ marginBottom: "1.5rem" }}>
          <div className="section-label">Filter Wardrobe</div>
          <div className="shop-tabs">
            {categories.map((item) => (
              <button className={category === item ? "active" : ""} type="button" key={item} onClick={() => setCategory(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="wardrobe-grid">
          {filteredClothes.length === 0 && (
            <div className="empty-state glass" style={{ gridColumn: "1 / -1" }}>
              <h3 className="card-name">No clothes added yet</h3>
              <p className="section-copy">Upload your own clothes below. The app will only show and recommend those items.</p>
            </div>
          )}
          {filteredClothes.map((item, index) => (
            <wardrobeMotion.article
              className="wardrobe-item-card glass glow-hover"
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.42, delay: index * 0.04 }}
            >
              <div className="wardrobe-item-image">
                <img
                  src={item.img}
                  alt={item.name}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.src = "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=720&q=90";
                  }}
                />
              </div>
              <div className="wardrobe-item-body">
                <div className="product-meta">
                  <span>{item.category}</span>
                  <span>{item.inLaundry && isLaundryEligible(item) ? "In laundry" : "Available"}</span>
                </div>
                <h3 className="product-name">{item.name}</h3>
                <div className="tag-row">
                  {item.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
                  {item.inLaundry && isLaundryEligible(item) && <span className="tag laundry-tag">Laundry</span>}
                </div>
                <div className="wardrobe-item-actions">
                  {isLaundryEligible(item) && (
                    <button className="btn-secondary add-cart-btn" type="button" onClick={() => setLaundryStatus(item.id, !item.inLaundry)}>
                      {item.inLaundry ? "Mark Clean" : "Send to Laundry"}
                    </button>
                  )}
                  <button className="btn-secondary add-cart-btn" type="button" onClick={() => deleteItem(item.id)}>
                    Remove Item
                  </button>
                </div>
              </div>
            </wardrobeMotion.article>
          ))}
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
                {["Tops", "Bottoms", "Dresses", "Jackets", "Shoes", "Accessories"].map((nextCategory) => <option key={nextCategory}>{nextCategory}</option>)}
              </select>
              <input className="input" placeholder="Tags: office, rainy, casual" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} />
              <input className="input" type="file" accept="image/*" onChange={handleImage} />
            </div>
            <button className="btn-primary" type="submit" style={{ marginTop: "1rem" }}>Save Item</button>
          </form>

          <div className="saved-panel glass">
            <div className="section-label">Your Uploads</div>
            <h3 className="card-name" style={{ fontSize: "1.65rem" }}>{items.length} saved pieces</h3>
            <div className="saved-list">
              {items.length === 0 && <p className="section-copy" style={{ fontSize: "0.9rem" }}>Upload a clothing photo to store it in this browser.</p>}
              {items.map((item) => (
                <div className="saved-item" key={item.id}>
                  <img src={item.img} alt={item.name} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.48)", fontSize: "0.82rem" }}>{item.inLaundry && isLaundryEligible(item) ? "In laundry" : item.category}</div>
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

window.LaundrySection = function LaundrySection() {
  const [items, setItems] = wardrobeUseState(readUserWardrobeItems);
  const laundryEligibleItems = wardrobeUseMemo(() => items.filter(isLaundryEligible), [items]);
  const availableItems = wardrobeUseMemo(() => laundryEligibleItems.filter((item) => !item.inLaundry), [laundryEligibleItems]);
  const laundryItems = wardrobeUseMemo(() => laundryEligibleItems.filter((item) => item.inLaundry), [laundryEligibleItems]);

  wardrobeUseEffect(() => {
    const refresh = () => setItems(readUserWardrobeItems());
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

  const updateLaundry = (id, inLaundry) => {
    const nextItems = typeof window.setWardrobeLaundryStatus === "function"
      ? window.setWardrobeLaundryStatus(id, inLaundry)
      : items.map((item) => item.id === id ? { ...item, inLaundry } : item);
    setItems(nextItems);
  };

  const renderLaundryRow = (item, inLaundry) => (
    <div className="laundry-row glass" key={item.id}>
      <img src={item.img} alt={item.name} />
      <div>
        <strong>{item.name}</strong>
        <span>{item.category} / {(item.tags || []).join(", ") || "Daily"}</span>
      </div>
      <button className={inLaundry ? "btn-primary" : "btn-secondary"} type="button" onClick={() => updateLaundry(item.id, !inLaundry)}>
        {inLaundry ? "Mark Clean" : "Send to Laundry"}
      </button>
    </div>
  );

  return (
    <section id="laundry" className="collection-page">
      <div className="fashion-backdrop" />
      <div className="section-shell shop-shell laundry-shell">
        <div className="shop-heading">
          <div>
            <div className="section-label">Laundry</div>
            <h1 className="section-title">Keep Worn Clothes Out of Suggestions</h1>
            <p className="section-copy" style={{ marginTop: "0.9rem" }}>
              Send clothes to laundry when they are not ready to wear. They will stay out of closet suggestions, calendar outfits, weather planning, daily looks, and style recommendations until you mark them clean.
            </p>
          </div>
          <div className="shop-stats glass">
            <div><strong>{availableItems.length}</strong><span>Available</span></div>
            <div><strong>{laundryItems.length}</strong><span>In Laundry</span></div>
            <div><strong>{laundryEligibleItems.length}</strong><span>Clothes</span></div>
          </div>
        </div>

        <div className="laundry-grid">
          <div className="laundry-panel">
            <div className="section-label">In Laundry</div>
            {laundryItems.length === 0 ? (
              <div className="empty-state glass">
                <h3 className="card-name">No clothes in laundry</h3>
                <p className="section-copy">Send items here when they should not appear in outfit planning.</p>
              </div>
            ) : (
              <div className="laundry-list">
                {laundryItems.map((item) => renderLaundryRow(item, true))}
              </div>
            )}
          </div>

          <div className="laundry-panel">
            <div className="section-label">Available Clothes</div>
            {availableItems.length === 0 ? (
              <div className="empty-state glass">
                <h3 className="card-name">No available clothes</h3>
                <p className="section-copy">Mark something clean or add more clothes in Wardrobe.</p>
                <a className="btn-primary" href="#wardrobe">Add Clothes</a>
              </div>
            ) : (
              <div className="laundry-list">
                {availableItems.map((item) => renderLaundryRow(item, false))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
