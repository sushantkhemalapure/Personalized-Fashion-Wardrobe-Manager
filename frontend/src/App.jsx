const { useEffect: appUseEffect, useState: appUseState } = React;

const App = () => {
  const [user, setUser] = appUseState(null);
  const [checkingAuth, setCheckingAuth] = appUseState(true);
  const [cart, setCart] = appUseState(() => JSON.parse(localStorage.getItem("wdrb-cart") || "[]"));
  const [favorites, setFavorites] = appUseState(() => JSON.parse(localStorage.getItem("wdrb-favorites") || "[]"));
  const [page, setPage] = appUseState(() => {
    const current = window.location.hash.replace("#", "");
    return ["home", "wardrobe", "shop", "planner", "suggestions", "profile"].includes(current) ? current : "home";
  });
  const [checkoutOpen, setCheckoutOpen] = appUseState(() => window.location.hash === "#checkout");
  const [activeDayPlan, setActiveDayPlan] = appUseState(() => {
    const id = window.location.hash.replace("#day-", "");
    return window.DAILY_TIMELINE?.find((item) => item.id === id) || null;
  });

  appUseEffect(() => {
    localStorage.setItem("wdrb-cart", JSON.stringify(cart));
  }, [cart]);

  appUseEffect(() => {
    localStorage.setItem("wdrb-favorites", JSON.stringify(favorites));
  }, [favorites]);

  appUseEffect(() => {
    const syncRoute = () => {
      const hash = window.location.hash;
      setCheckoutOpen(hash === "#checkout");
      const nextPage = hash.replace("#", "");

      if (["home", "wardrobe", "shop", "planner", "suggestions", "profile"].includes(nextPage)) {
        setPage(nextPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      if (!hash.startsWith("#day-")) {
        setActiveDayPlan(null);
        return;
      }

      const id = hash.replace("#day-", "");
      setActiveDayPlan(window.DAILY_TIMELINE?.find((item) => item.id === id) || null);
    };

    window.addEventListener("hashchange", syncRoute);
    syncRoute();
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  appUseEffect(() => {
    const token = localStorage.getItem("wdrb-token");
    if (!token) {
      setCheckingAuth(false);
      return;
    }

    fetch("/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem("wdrb-token"))
      .finally(() => setCheckingAuth(false));
  }, []);

  const handleAuth = ({ token, user: nextUser }) => {
    localStorage.setItem("wdrb-token", token);
    setUser(nextUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("wdrb-token");
    setUser(null);
  };

  const addCartItem = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...current, { ...product, qty: 1 }];
    });
  };

  const updateCartQty = (id, qty) => {
    setCart((current) => current
      .map((item) => item.id === id ? { ...item, qty } : item)
      .filter((item) => item.qty > 0));
  };

  const toggleFavorite = (id) => {
    setFavorites((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]);
  };

  const openCheckout = () => {
    setCheckoutOpen(true);
    window.location.hash = "checkout";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeCheckout = () => {
    setCheckoutOpen(false);
    window.location.hash = "shop";
  };

  const placeOrder = () => {
    setCart([]);
  };

  const openDayPlan = (item) => {
    setActiveDayPlan(item);
    window.location.hash = `day-${item.id}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeDayPlan = () => {
    setActiveDayPlan(null);
    window.location.hash = "profile";
  };

  const renderPage = () => {
    if (page === "wardrobe") return <WardrobeCarousel />;
    if (page === "shop") {
      return (
        <ShopSection
          cart={cart}
          favorites={favorites}
          onAddCart={addCartItem}
          onToggleFavorite={toggleFavorite}
          onUpdateCart={updateCartQty}
          onCheckout={openCheckout}
        />
      );
    }
    if (page === "planner") return <OutfitPlanner />;
    if (page === "suggestions") return <FeaturesSection />;
    if (page === "profile") return <DailyPlanner onOpenDetail={openDayPlan} />;
    return <HeroSection />;
  };

  if (checkingAuth) {
    return (
      <React.Fragment>
        <div className="site-background" aria-hidden="true" />
        <div className="auth-page">
          <div className="auth-card glass">
            <div className="section-label">WDRB</div>
            <h1 className="auth-title">Loading your wardrobe</h1>
          </div>
        </div>
      </React.Fragment>
    );
  }

  if (!user) {
    return (
      <React.Fragment>
        <div className="site-background" aria-hidden="true" />
        <AuthPage onAuth={handleAuth} />
      </React.Fragment>
    );
  }

  if (checkoutOpen) {
    return (
      <React.Fragment>
        <div className="site-background" aria-hidden="true" />
        <Navbar user={user} onLogout={handleLogout} cartCount={cart.reduce((sum, item) => sum + item.qty, 0)} favoriteCount={favorites.length} />
        <main>
          <CheckoutPage cart={cart} onBack={closeCheckout} onPlaceOrder={placeOrder} />
        </main>
      </React.Fragment>
    );
  }

  if (activeDayPlan) {
    return (
      <React.Fragment>
        <div className="site-background" aria-hidden="true" />
        <Navbar user={user} onLogout={handleLogout} cartCount={cart.reduce((sum, item) => sum + item.qty, 0)} favoriteCount={favorites.length} />
        <main>
          <DayStyleDetail item={activeDayPlan} onBack={closeDayPlan} />
        </main>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <div className="site-background" aria-hidden="true" />
      <Navbar user={user} onLogout={handleLogout} cartCount={cart.reduce((sum, item) => sum + item.qty, 0)} favoriteCount={favorites.length} />
      <main>
        {renderPage()}
      </main>
      <Footer />
    </React.Fragment>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
