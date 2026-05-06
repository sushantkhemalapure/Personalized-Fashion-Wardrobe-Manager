window.Footer = function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">WDRB</div>
          <p className="footer-tagline">
            A responsive wardrobe manager for organizing clothes, planning outfits, and matching looks to weather and occasions.
          </p>
        </div>

        <div className="footer-col">
          <h4>Product</h4>
          <ul>
            {[
              ["Closet", "closet"],
              ["Outfit Board", "outfits"],
              ["Calendar", "calendar"],
              ["Wardrobe", "wardrobe"],
              ["Weather Planner", "planner"],
            ].map(([item, id]) => (
              <li key={item}><a href={`#${id}`}>{item}</a></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Planning</h4>
          <ul>
            <li><a href="#saved">Saved Pieces</a></li>
            <li><a href="#calendar">Event Calendar</a></li>
            <li><a href="#suggestions">Suggestions</a></li>
            <li><a href="#outfits">Board Summary</a></li>
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
        <span>Rule-based outfit planning for project presentation.</span>
      </div>
    </footer>
  );
};
