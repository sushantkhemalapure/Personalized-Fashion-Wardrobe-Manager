const { useEffect: shopUseEffect, useMemo: shopUseMemo, useState: shopUseState } = React;
const { motion: shopMotion } = window.Motion;

const getCurrentClosetItems = () => {
  const items = typeof window.getUserClosetItems === "function" ? window.getUserClosetItems() : [];
  window.CLOSET_ITEMS = items;
  window.SHOP_PRODUCTS = items;
  return items;
};

const readRawWardrobeItems = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem("wardrobe-items") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem("wardrobe-items");
    return [];
  }
};

const saveRawWardrobeItems = (items) => {
  localStorage.setItem("wardrobe-items", JSON.stringify(items));
  if (typeof window.getUserClosetItems === "function") {
    window.CLOSET_ITEMS = window.getUserClosetItems();
    window.SHOP_PRODUCTS = window.CLOSET_ITEMS;
  }
  window.dispatchEvent(new CustomEvent("wdrb-wardrobe-updated", { detail: { items: window.CLOSET_ITEMS || [] } }));
};

const getUsage = (item) => item.usage || {
  score: 80,
  occasions: item.tags?.length ? item.tags : ["Daily"],
  repeats: "Rotated by calendar",
};

const renderItemCard = (item, savedItems, onToggleSaved, onAddBoardItem, onEditItem = null) => {
  const usage = getUsage(item);
  const isSaved = savedItems.includes(item.id);

  return (
    <article className="product-card glass glow-hover" key={item.id}>
      <div className="product-image">
        <img src={item.img} alt={item.name} loading="lazy" />
        <button
          className={`favorite-btn ${isSaved ? "active" : ""}`}
          type="button"
          onClick={() => onToggleSaved(item.id)}
          aria-label={`${isSaved ? "Remove" : "Save"} ${item.name}`}
        >
          <span className="sr-only">{isSaved ? "Saved" : "Save"}</span>
        </button>
      </div>
      <div className="product-body">
        <div className="product-meta">
          <span>{item.category}</span>
          <span>{item.weather || "Any"}</span>
        </div>
        <a className="trust-chip" href="#planner">Match {usage.score}</a>
        <a className="size-chip" href="#calendar">Plan Wear</a>
        <h3 className="product-name">{item.name}</h3>
        <div className="tag-row">
          {(item.tags?.length ? item.tags : ["Daily"]).map((tag) => <span className="tag" key={tag}>{tag}</span>)}
        </div>
        <div className="product-buy-row">
          <strong>{usage.repeats}</strong>
          <div className="closet-card-actions">
            {onEditItem && (
              <button className="btn-secondary add-cart-btn" type="button" onClick={() => onEditItem(item)}>
                Edit
              </button>
            )}
            <button className="btn-primary add-cart-btn" type="button" onClick={() => onAddBoardItem(item)}>Add to Board</button>
          </div>
        </div>
      </div>
    </article>
  );
};

window.ClosetSection = function ClosetSection({ savedItems, outfitBoard, onAddBoardItem, onToggleSaved }) {
  const [category, setCategory] = shopUseState("All");
  const [query, setQuery] = shopUseState("");
  const [refreshKey, setRefreshKey] = shopUseState(0);
  const [editingItem, setEditingItem] = shopUseState(null);
  const [editForm, setEditForm] = shopUseState({ name: "", category: "Tops", tags: "", image: "" });
  const closetItems = shopUseMemo(getCurrentClosetItems, [refreshKey]);
  const categories = ["All", ...new Set(closetItems.map((item) => item.category))];

  shopUseEffect(() => {
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

  const filteredItems = shopUseMemo(() => closetItems.filter((item) => {
    const matchesCategory = category === "All" || item.category === category;
    const text = `${item.name} ${item.category} ${item.season || ""} ${item.weather || ""} ${(item.tags || []).join(" ")}`.toLowerCase();
    return matchesCategory && text.includes(query.trim().toLowerCase());
  }), [category, query, closetItems]);

  const openEditItem = (item) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      category: item.category,
      tags: (item.tags || []).join(", "),
      image: item.img,
    });
    window.setTimeout(() => {
      document.querySelector(".closet-edit-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 40);
  };

  const handleEditImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEditForm((current) => ({ ...current, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const saveEditedItem = (event) => {
    event.preventDefault();
    if (!editingItem || !editForm.name.trim() || !editForm.image) return;

    const nextItems = readRawWardrobeItems().map((item) => (
      item.id === editingItem.id
        ? {
          ...item,
          name: editForm.name.trim(),
          category: editForm.category,
          tags: editForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 4),
          img: editForm.image,
        }
        : item
    ));

    saveRawWardrobeItems(nextItems);
    setEditingItem(null);
    setEditForm({ name: "", category: "Tops", tags: "", image: "" });
    setRefreshKey((current) => current + 1);
  };

  return (
    <section id="closet" className="shop-section">
      <div className="fashion-backdrop" />
      <div className="section-shell shop-shell">
        <shopMotion.div className="shop-heading" initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.24 }} transition={{ duration: 0.7 }}>
          <div>
            <div className="section-label">Closet Catalog</div>
            <h2 className="section-title">Only Clothes You Added</h2>
            <p className="section-copy" style={{ marginTop: "0.9rem" }}>
              This closet is built from your uploaded wardrobe items. Add clothes on the Wardrobe page to use them for boards, events, and calendar recommendations.
            </p>
          </div>
          <div className="shop-stats glass">
            <a href="#saved"><strong>{savedItems.length}</strong><span>Saved Items</span></a>
            <a href="#outfits"><strong>{outfitBoard.length}</strong><span>Board Items</span></a>
            <div><strong>{closetItems.length}</strong><span>Your Clothes</span></div>
          </div>
        </shopMotion.div>

        <div className="shop-toolbar glass">
          <input className="input shop-search" placeholder="Search your clothes, tags, weather..." value={query} onChange={(event) => setQuery(event.target.value)} />
          <div className="shop-tabs">
            {categories.map((item) => (
              <button className={category === item ? "active" : ""} type="button" key={item} onClick={() => setCategory(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>

        {editingItem && (
          <form className="closet-edit-panel glass" onSubmit={saveEditedItem}>
            <div>
              <div className="section-label">Edit Closet Item</div>
              <h3 className="card-name">Update {editingItem.name}</h3>
            </div>
            <div className="closet-edit-preview">
              <img src={editForm.image} alt={editForm.name || editingItem.name} />
            </div>
            <div className="upload-grid">
              <input className="input" placeholder="Item name" value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} />
              <select className="custom-select" value={editForm.category} onChange={(event) => setEditForm({ ...editForm, category: event.target.value })}>
                {["Tops", "Bottoms", "Dresses", "Layers", "Outerwear", "Footwear", "Accessories"].map((nextCategory) => <option key={nextCategory}>{nextCategory}</option>)}
              </select>
              <input className="input" placeholder="Tags: office, rainy, casual" value={editForm.tags} onChange={(event) => setEditForm({ ...editForm, tags: event.target.value })} />
              <input className="input" type="file" accept="image/*" onChange={handleEditImage} />
            </div>
            <div className="closet-edit-actions">
              <button className="btn-primary" type="submit">Save Changes</button>
              <button className="btn-secondary" type="button" onClick={() => setEditingItem(null)}>Cancel</button>
            </div>
          </form>
        )}

        {closetItems.length === 0 ? (
          <div className="empty-state glass">
            <h3 className="card-name">Your closet is empty</h3>
            <p className="section-copy">Upload clothes in Wardrobe first. Only clothes you added will appear here.</p>
            <a className="btn-primary" href="#wardrobe">Add Clothes</a>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state glass">
            <h3 className="card-name">No matching clothes</h3>
            <p className="section-copy">Try another category or search term.</p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredItems.map((item, index) => (
              <shopMotion.div key={item.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.42, delay: index * 0.04 }}>
                {renderItemCard(item, savedItems, onToggleSaved, onAddBoardItem, openEditItem)}
              </shopMotion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

window.SavedLooksPage = function SavedLooksPage({ savedItems, onAddBoardItem, onToggleSaved }) {
  const savedClosetItems = getCurrentClosetItems().filter((item) => savedItems.includes(item.id));

  return (
    <section className="collection-page">
      <div className="fashion-backdrop" />
      <div className="section-shell shop-shell">
        <div className="shop-heading">
          <div>
            <div className="section-label">Saved Closet</div>
            <h1 className="section-title">Pieces You Saved</h1>
            <p className="section-copy" style={{ marginTop: "0.9rem" }}>
              Saved pieces come only from clothes you uploaded.
            </p>
          </div>
          <a className="btn-secondary" href="#closet">Back to Closet</a>
        </div>

        {savedClosetItems.length === 0 ? (
          <div className="empty-state glass">
            <h3 className="card-name">No saved pieces yet</h3>
            <p className="section-copy">Save your uploaded clothes from the closet page.</p>
            <a className="btn-primary" href="#wardrobe">Add Clothes</a>
          </div>
        ) : (
          <div className="product-grid">
            {savedClosetItems.map((item) => renderItemCard(item, savedItems, onToggleSaved, onAddBoardItem))}
          </div>
        )}
      </div>
    </section>
  );
};

window.OutfitBoardPage = function OutfitBoardPage({ outfitBoard, onRemoveBoardItem }) {
  const occasionList = [...new Set(outfitBoard.flatMap((item) => getUsage(item).occasions))];

  return (
    <section className="collection-page">
      <div className="fashion-backdrop" />
      <div className="section-shell shop-shell">
        <div className="shop-heading">
          <div>
            <div className="section-label">Outfit Board</div>
            <h1 className="section-title">Build a Look Before You Wear It</h1>
            <p className="section-copy" style={{ marginTop: "0.9rem" }}>
              Combine clothes you uploaded into a practical outfit board for today or an upcoming event.
            </p>
          </div>
          <a className="btn-secondary" href="#calendar">Use Calendar</a>
        </div>

        <div className="cart-page-grid">
          <div className="cart-list cart-page-list">
            {outfitBoard.length === 0 && (
              <div className="empty-state glass">
                <h3 className="card-name">Your outfit board is empty</h3>
                <p className="section-copy">Add your own clothes from the closet catalog to compare combinations.</p>
                <a className="btn-primary" href="#closet">Open Closet</a>
              </div>
            )}
            {outfitBoard.map((item) => (
              <div className="cart-item glass" key={item.id}>
                <img src={item.img} alt={item.name} />
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.category} / {item.weather || "Any"}</span>
                  <div className="tag-row">
                    {getUsage(item).occasions.map((occasion) => <span className="tag" key={occasion}>{occasion}</span>)}
                  </div>
                </div>
                <button className="btn-secondary cart-line-total" type="button" onClick={() => onRemoveBoardItem(item.id)}>Remove</button>
              </div>
            ))}
          </div>

          <aside className="cart-panel glass">
            <div className="section-label">Board Summary</div>
            <div className="cart-total"><span>Items</span><strong>{outfitBoard.length}</strong></div>
            <div className="cart-total"><span>Occasions</span><strong>{occasionList.length || 0}</strong></div>
            <p className="payment-note">Use this board to prepare looks from your existing wardrobe, then plan final outfits in the calendar.</p>
          </aside>
        </div>
      </div>
    </section>
  );
};
