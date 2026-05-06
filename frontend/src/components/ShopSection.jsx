const { useMemo: shopUseMemo, useState: shopUseState } = React;
const { motion: shopMotion } = window.Motion;

const SHOP_PRODUCTS = [
  {
    id: "shop-1",
    name: "Executive Blazer",
    category: "Jackets",
    price: 2499,
    rating: 4.8,
    img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=720&q=90",
    tags: ["Office", "Premium"],
  },
  {
    id: "shop-2",
    name: "Linen Work Shirt",
    category: "Tops",
    price: 1299,
    rating: 4.6,
    img: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=720&q=90",
    tags: ["Summer", "Formal"],
  },
  {
    id: "shop-3",
    name: "Tailored Trousers",
    category: "Bottoms",
    price: 1799,
    rating: 4.7,
    img: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=720&q=90",
    tags: ["Office", "Classic"],
  },
  {
    id: "shop-4",
    name: "Chelsea Boots",
    category: "Shoes",
    price: 3199,
    rating: 4.9,
    img: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=720&q=90",
    tags: ["Evening", "Leather"],
  },
  {
    id: "shop-5",
    name: "Minimal Sneakers",
    category: "Shoes",
    price: 2199,
    rating: 4.5,
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=720&q=90",
    tags: ["Casual", "Daily"],
  },
  {
    id: "shop-6",
    name: "Evening Dress",
    category: "Dresses",
    price: 2899,
    rating: 4.8,
    img: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=720&q=90",
    tags: ["Party", "Elegant"],
  },
  {
    id: "shop-7",
    name: "Structured Tote",
    category: "Accessories",
    price: 1599,
    rating: 4.4,
    img: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=720&q=90",
    tags: ["Work", "Carry"],
  },
  {
    id: "shop-8",
    name: "Trench Coat",
    category: "Jackets",
    price: 3499,
    rating: 4.7,
    img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=720&q=90",
    tags: ["Rainy", "Layer"],
  },
];

window.SHOP_PRODUCTS = SHOP_PRODUCTS;

window.ShopSection = function ShopSection({ cart, favorites, onAddCart, onToggleFavorite, onUpdateCart, onCheckout }) {
  const [category, setCategory] = shopUseState("All");
  const [query, setQuery] = shopUseState("");
  const categories = ["All", ...new Set(SHOP_PRODUCTS.map((product) => product.category))];
  const cartTotal = cart.reduce((total, item) => total + item.price * item.qty, 0);

  const filteredProducts = shopUseMemo(() => SHOP_PRODUCTS.filter((product) => {
    const matchesCategory = category === "All" || product.category === category;
    const text = `${product.name} ${product.category} ${product.tags.join(" ")}`.toLowerCase();
    return matchesCategory && text.includes(query.trim().toLowerCase());
  }), [category, query]);

  return (
    <section id="shop" className="shop-section">
      <div className="fashion-backdrop" />
      <div className="section-shell shop-shell">
        <shopMotion.div
          className="shop-heading"
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.24 }}
          transition={{ duration: 0.7 }}
        >
          <div>
            <div className="section-label">Online Store</div>
            <h2 className="section-title">Shop Professional Looks</h2>
            <p className="section-copy" style={{ marginTop: "0.9rem" }}>
              Browse curated clothing, save favorites, add items to cart, and complete a demo checkout.
            </p>
          </div>
          <div className="shop-stats glass">
            <div><strong>{favorites.length}</strong><span>Favorites</span></div>
            <div><strong>{cart.reduce((sum, item) => sum + item.qty, 0)}</strong><span>Cart Items</span></div>
            <div><strong>Rs {cartTotal}</strong><span>Total</span></div>
          </div>
        </shopMotion.div>

        <div className="shop-toolbar glass">
          <input
            className="input shop-search"
            placeholder="Search blazer, shoes, office..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="shop-tabs">
            {categories.map((item) => (
              <button
                className={category === item ? "active" : ""}
                type="button"
                key={item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="shop-layout">
          <div className="product-grid">
            {filteredProducts.map((product, index) => {
              const isFavorite = favorites.includes(product.id);
              return (
                <shopMotion.article
                  className="product-card glass glow-hover"
                  key={product.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.42, delay: index * 0.04 }}
                >
                  <div className="product-image">
                    <img src={product.img} alt={product.name} loading="lazy" />
                    <button
                      className={`favorite-btn ${isFavorite ? "active" : ""}`}
                      type="button"
                      onClick={() => onToggleFavorite(product.id)}
                      aria-label={`${isFavorite ? "Remove" : "Add"} ${product.name} favorite`}
                    >
                      {isFavorite ? "♥" : "♡"}
                    </button>
                  </div>
                  <div className="product-body">
                    <div className="product-meta">
                      <span>{product.category}</span>
                      <span>{product.rating} ★</span>
                    </div>
                    <h3 className="product-name">{product.name}</h3>
                    <div className="tag-row">
                      {product.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
                    </div>
                    <div className="product-buy-row">
                      <strong>Rs {product.price}</strong>
                      <button className="btn-primary" type="button" onClick={() => onAddCart(product)}>Add Cart</button>
                    </div>
                  </div>
                </shopMotion.article>
              );
            })}
          </div>

          <aside className="cart-panel glass" id="cart">
            <div className="section-label">Cart</div>
            <h3 className="card-name" style={{ fontSize: "1.65rem" }}>Your Bag</h3>
            <div className="cart-list">
              {cart.length === 0 && <p className="section-copy" style={{ fontSize: "0.9rem" }}>Add products to build your order.</p>}
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img src={item.img} alt={item.name} />
                  <div>
                    <strong>{item.name}</strong>
                    <span>Rs {item.price}</span>
                    <div className="qty-control">
                      <button type="button" onClick={() => onUpdateCart(item.id, item.qty - 1)}>-</button>
                      <span>{item.qty}</span>
                      <button type="button" onClick={() => onUpdateCart(item.id, item.qty + 1)}>+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-total">
              <span>Total</span>
              <strong>Rs {cartTotal}</strong>
            </div>
            <button className="btn-primary checkout-btn" type="button" disabled={cart.length === 0} onClick={onCheckout}>
              Checkout
            </button>
            <p className="payment-note">Demo payment supports card, UPI, and cash on delivery.</p>
          </aside>
        </div>
      </div>
    </section>
  );
};

window.CheckoutPage = function CheckoutPage({ cart, onBack, onPlaceOrder }) {
  const [payment, setPayment] = shopUseState("Card");
  const [message, setMessage] = shopUseState("");
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const submitOrder = (event) => {
    event.preventDefault();
    setMessage(`Order placed with ${payment}. Your demo receipt is ready.`);
    onPlaceOrder();
  };

  return (
    <section className="checkout-page">
      <div className="fashion-backdrop" />
      <div className="section-shell checkout-shell">
        <button className="btn-secondary" type="button" onClick={onBack}>Back to Shop</button>
        <div className="checkout-grid">
          <form className="checkout-form glass" onSubmit={submitOrder}>
            <div className="section-label">Payment</div>
            <h1 className="section-title">Secure Checkout</h1>
            <div className="checkout-fields">
              <input className="input" required placeholder="Full name" />
              <input className="input" required type="email" placeholder="Email address" />
              <input className="input" required placeholder="Delivery address" />
              <select className="custom-select" value={payment} onChange={(event) => setPayment(event.target.value)}>
                <option>Card</option>
                <option>UPI</option>
                <option>Cash on Delivery</option>
              </select>
              {payment === "Card" && <input className="input" required placeholder="Card number" maxLength="19" />}
              {payment === "UPI" && <input className="input" required placeholder="UPI ID" />}
            </div>
            <button className="btn-primary checkout-btn" type="submit" disabled={cart.length === 0}>Pay Rs {total}</button>
            {message && <p className="auth-message">{message}</p>}
          </form>

          <aside className="order-summary glass">
            <div className="section-label">Order Summary</div>
            {cart.map((item) => (
              <div className="summary-row" key={item.id}>
                <span>{item.name} x {item.qty}</span>
                <strong>Rs {item.price * item.qty}</strong>
              </div>
            ))}
            <div className="summary-total">
              <span>Total</span>
              <strong>Rs {total}</strong>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};
