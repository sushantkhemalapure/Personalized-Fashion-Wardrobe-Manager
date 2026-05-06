window.Footer = function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">WDRB</div>
          <p className="footer-tagline">
            A responsive cloth-shop and wardrobe manager for shopping, saving favorites, checkout, and outfit planning.
          </p>
        </div>

        <div className="footer-col">
          <h4>Product</h4>
          <ul>
            {[
              ["Shop", "shop"],
              ["Cart", "shop"],
              ["Wardrobe", "wardrobe"],
              ["Outfit Planner", "planner"],
            ].map(([item, id]) => (
              <li key={item}><a href={`#${id}`}>{item}</a></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Shopping</h4>
          <ul>
            {["Favorites", "Demo Payment", "Order Summary", "Categories"].map((item) => (
              <li key={item}><a href="#shop">{item}</a></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Profile</h4>
          <ul>
            {["Saved Looks", "Local Wardrobe", "Preferences", "Timeline"].map((item) => (
              <li key={item}><a href="#profile">{item}</a></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>Copyright {new Date().getFullYear()} WDRB. All rights reserved.</span>
        <span>Demo checkout for project presentation.</span>
      </div>
    </footer>
  );
};
