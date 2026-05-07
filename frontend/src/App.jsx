const { useEffect: appUseEffect, useState: appUseState } = React;

const readStoredArray = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(key);
    return [];
  }
};

const getOwnedClosetIds = () => new Set(
  (typeof window.getUserWardrobeItems === "function" ? window.getUserWardrobeItems() : (
    typeof window.getUserClosetItems === "function" ? window.getUserClosetItems() : []
  ))
    .map((item) => item.id)
);

const getAvailableClosetIds = () => new Set(
  (typeof window.getUserClosetItems === "function" ? window.getUserClosetItems() : [])
    .map((item) => item.id)
);

const App = () => {
  const [user, setUser] = appUseState(null);
  const [checkingAuth, setCheckingAuth] = appUseState(true);
  const [savedItems, setSavedItems] = appUseState(() => readStoredArray("wdrb-saved-items"));
  const [outfitBoard, setOutfitBoard] = appUseState(() => readStoredArray("wdrb-outfit-board"));
  const [page, setPage] = appUseState(() => {
    const current = window.location.hash.replace("#", "");
    return ["home", "wardrobe", "closet", "laundry", "saved", "outfits", "calendar", "planner", "suggestions", "profile"].includes(current) ? current : "home";
  });
  const [activeDayPlan, setActiveDayPlan] = appUseState(() => {
    const id = window.location.hash.replace("#day-", "");
    return window.DAILY_TIMELINE?.find((item) => item.id === id) || null;
  });

  appUseEffect(() => {
    localStorage.setItem("wdrb-saved-items", JSON.stringify(savedItems));
    window.dispatchEvent(new CustomEvent("wdrb-favorites-updated", { detail: { savedItems } }));
  }, [savedItems]);

  appUseEffect(() => {
    localStorage.setItem("wdrb-outfit-board", JSON.stringify(outfitBoard));
  }, [outfitBoard]);

  appUseEffect(() => {
    const removeUnownedItems = () => {
      const ownedIds = getOwnedClosetIds();
      const availableIds = getAvailableClosetIds();
      setSavedItems((current) => current.filter((id) => ownedIds.has(id)));
      setOutfitBoard((current) => current.filter((item) => availableIds.has(item.id)));
    };

    removeUnownedItems();
    window.addEventListener("focus", removeUnownedItems);
    window.addEventListener("hashchange", removeUnownedItems);
    window.addEventListener("wdrb-wardrobe-updated", removeUnownedItems);
    return () => {
      window.removeEventListener("focus", removeUnownedItems);
      window.removeEventListener("hashchange", removeUnownedItems);
      window.removeEventListener("wdrb-wardrobe-updated", removeUnownedItems);
    };
  }, []);

  appUseEffect(() => {
    const syncRoute = () => {
      const hash = window.location.hash;
      const nextPage = hash.replace("#", "");

      if (nextPage === "weather") {
        window.location.hash = "planner";
        return;
      }

      if (nextPage === "care") {
        window.location.hash = "calendar";
        return;
      }

      if (["home", "wardrobe", "closet", "laundry", "saved", "outfits", "calendar", "planner", "suggestions", "profile"].includes(nextPage)) {
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

  const toggleSavedItem = (id) => {
    setSavedItems((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]);
  };

  const addBoardItem = (item) => {
    if (!getAvailableClosetIds().has(item.id)) return;
    setOutfitBoard((current) => current.some((boardItem) => boardItem.id === item.id) ? current : [...current, item]);
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
    if (page === "closet") {
      return (
        <ClosetSection
          savedItems={savedItems}
          outfitBoard={outfitBoard}
          onAddBoardItem={addBoardItem}
          onToggleSaved={toggleSavedItem}
        />
      );
    }
    if (page === "saved") {
      return (
        <SavedLooksPage
          savedItems={savedItems}
          onAddBoardItem={addBoardItem}
          onToggleSaved={toggleSavedItem}
        />
      );
    }
    if (page === "outfits") {
      return (
        <OutfitBoardPage
          outfitBoard={outfitBoard}
          onRemoveBoardItem={(id) => setOutfitBoard((current) => current.filter((item) => item.id !== id))}
        />
      );
    }
    if (page === "laundry") return <LaundrySection />;
    if (page === "calendar") return <CalendarPlannerPage savedItems={savedItems} />;
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

  if (activeDayPlan) {
    return (
      <React.Fragment>
        <div className="site-background" aria-hidden="true" />
        <Navbar user={user} onLogout={handleLogout} boardCount={outfitBoard.length} savedCount={savedItems.length} />
        <main>
          <DayStyleDetail item={activeDayPlan} onBack={closeDayPlan} />
        </main>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <div className="site-background" aria-hidden="true" />
      <Navbar user={user} onLogout={handleLogout} boardCount={outfitBoard.length} savedCount={savedItems.length} />
      <main>
        {renderPage()}
      </main>
      <Footer />
    </React.Fragment>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
