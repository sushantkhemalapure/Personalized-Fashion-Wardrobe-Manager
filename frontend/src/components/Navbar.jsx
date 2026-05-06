const { useEffect: navUseEffect, useState: navUseState } = React;
const { motion: navMotion } = window.Motion;

window.Navbar = function Navbar({ user, onLogout, cartCount = 0, favoriteCount = 0 }) {
  const [scrolled, setScrolled] = navUseState(false);
  const links = [
    ["Home", "home"],
    ["Wardrobe", "wardrobe"],
    ["Shop", "shop"],
    ["Planner", "planner"],
    ["Suggestions", "suggestions"],
    ["Profile", "profile"],
  ];

  navUseEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <navMotion.nav
      className="navbar"
      initial={{ y: -30, x: "-50%", opacity: 0 }}
      animate={{ y: 0, x: "-50%", opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
      style={{ background: scrolled ? "rgba(0,0,0,0.68)" : "rgba(0,0,0,0.38)" }}
    >
      <a className="nav-logo" href="#home" aria-label="WDRB home">w</a>
      <ul className="nav-links">
        {links.map(([label, id]) => (
          <li key={id}><a href={`#${id}`}>{label}</a></li>
        ))}
      </ul>
      <div className="nav-actions">
        {user && <span className="nav-user">{user.name}</span>}
        <a className="nav-pill" href="#shop" aria-label={`${favoriteCount} favorite items`}>Fav {favoriteCount}</a>
        <a className="nav-pill nav-cart" href="#shop" aria-label={`${cartCount} cart items`}>Cart {cartCount}</a>
        <a className="btn-primary nav-shop-link" href="#shop">Shop Now</a>
        {user && <button className="nav-logout" onClick={onLogout}>Logout</button>}
      </div>
    </navMotion.nav>
  );
};
