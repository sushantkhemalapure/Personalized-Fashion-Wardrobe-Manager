const { useEffect: plannerUseEffect, useMemo: plannerUseMemo, useRef: plannerUseRef, useState: plannerUseState } = React;
const { AnimatePresence, motion: plannerMotion, useInView: plannerUseInView } = window.Motion;

const PLANNER_OCCASIONS = [
  { value: "casual", label: "Casual", hints: ["casual", "daily", "comfort", "travel"] },
  { value: "office", label: "Office", hints: ["office", "work", "formal", "smart"] },
  { value: "party", label: "Party", hints: ["party", "evening", "dinner", "function"] },
];

const weatherHints = {
  cold: ["cold", "winter", "jacket", "coat", "knit"],
  mild: ["mild", "warm", "daily", "casual", "light", "cotton"],
  hot: ["hot", "summer", "light", "linen", "breathable"],
  rainy: ["rain", "rainy", "monsoon", "waterproof"],
};

const weatherLabels = {
  cold: "Cold",
  mild: "Mild",
  hot: "Hot",
  rainy: "Rainy",
};

const getPlannerClosetItems = () => (
  typeof window.getUserClosetItems === "function" ? window.getUserClosetItems() : (window.CLOSET_ITEMS || [])
);

const plannerText = (item) => `${item.name} ${item.category} ${item.weather || ""} ${(item.tags || []).join(" ")} ${(item.usage?.occasions || []).join(" ")}`.toLowerCase();

const choosePlannerItems = (items, occasion, weather) => {
  const occasionConfig = PLANNER_OCCASIONS.find((item) => item.value === occasion) || PLANNER_OCCASIONS[0];
  const categories = ["Dresses", "Tops", "Bottoms", "Layers", "Jackets", "Outerwear", "Footwear", "Shoes", "Accessories"];
  const ranked = [...items].sort((a, b) => {
    const score = (item) => {
      const text = plannerText(item);
      let value = item.rating || 80;
      if (occasionConfig.hints.some((hint) => text.includes(hint))) value += 28;
      if ((weatherHints[weather] || []).some((hint) => text.includes(hint))) value += 22;
      value += Math.max(0, 12 - categories.indexOf(item.category));
      return value;
    };
    return score(b) - score(a);
  });

  const picked = [];
  categories.forEach((category) => {
    const item = ranked.find((candidate) => !picked.includes(candidate) && candidate.category === category);
    if (item && picked.length < 3) picked.push(item);
  });

  ranked.forEach((item) => {
    if (!picked.includes(item) && picked.length < 3) picked.push(item);
  });

  return picked;
};

window.OutfitPlanner = function OutfitPlanner() {
  const [occasion, setOccasion] = plannerUseState("casual");
  const [weather, setWeather] = plannerUseState("mild");
  const [key, setKey] = plannerUseState(0);
  const [weatherStatus, setWeatherStatus] = plannerUseState("Use live weather for the most accurate suggestion.");
  const [liveWeather, setLiveWeather] = plannerUseState(null);
  const [refreshKey, setRefreshKey] = plannerUseState(0);
  const ref = plannerUseRef(null);
  const isInView = plannerUseInView(ref, { once: true, amount: 0.22 });
  const closetItems = plannerUseMemo(getPlannerClosetItems, [refreshKey, key]);
  const outfitItems = plannerUseMemo(() => choosePlannerItems(closetItems, occasion, weather), [closetItems, occasion, weather]);

  const update = (setter, value) => {
    setter(value);
    setLiveWeather(null);
    setWeatherStatus("Manual weather selection is active.");
    setKey((current) => current + 1);
  };

  const applyWeather = (nextWeather, message, currentWeather = null) => {
    setWeather(nextWeather);
    setWeatherStatus(message);
    setLiveWeather(currentWeather);
    setKey((current) => current + 1);
  };

  const getWeatherType = ({ apparentTemp, precipitation, rain, showers, weatherCode }) => {
    const rainyCodes = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]);
    if ((precipitation || 0) > 0.1 || (rain || 0) > 0.1 || (showers || 0) > 0.1 || rainyCodes.has(weatherCode)) {
      return "rainy";
    }
    if (apparentTemp <= 20) return "cold";
    if (apparentTemp >= 30) return "hot";
    return "mild";
  };

  const useLiveWeather = () => {
    if (!navigator.geolocation) {
      setWeatherStatus("Live weather needs browser location support. Use the dropdown instead.");
      return;
    }

    setWeatherStatus("Checking live weather with your precise browser location...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,precipitation,rain,showers,weather_code&temperature_unit=celsius&timezone=auto`;
          const response = await fetch(url);
          if (!response.ok) throw new Error("Weather request failed");
          const data = await response.json();
          const current = data.current || {};
          const details = {
            temp: current.temperature_2m,
            apparentTemp: current.apparent_temperature ?? current.temperature_2m,
            precipitation: current.precipitation || 0,
            rain: current.rain || 0,
            showers: current.showers || 0,
            weatherCode: current.weather_code,
          };
          if (!Number.isFinite(details.temp) || !Number.isFinite(details.apparentTemp)) {
            throw new Error("Weather data missing temperature");
          }
          const nextWeather = getWeatherType(details);
          const rainText = details.precipitation || details.rain || details.showers
            ? `, precipitation ${Math.max(details.precipitation, details.rain, details.showers).toFixed(1)} mm`
            : "";
          const label = weatherLabels[nextWeather] || nextWeather;
          applyWeather(
            nextWeather,
            `Live weather: ${Math.round(details.temp)} C, feels like ${Math.round(details.apparentTemp)} C${rainText}. ${label} closet rules applied.`,
            details
          );
        } catch (error) {
          setWeatherStatus("Live weather could not load. Manual selection is still available.");
        }
      },
      () => setWeatherStatus("Location permission was not granted. Manual selection is still available."),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 10 * 60 * 1000 }
    );
  };

  plannerUseEffect(() => {
    const refresh = () => setRefreshKey((current) => current + 1);
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("hashchange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("hashchange", refresh);
    };
  }, []);

  const saveLook = () => {
    if (outfitItems.length === 0) return;
    const saved = JSON.parse(localStorage.getItem("saved-looks") || "[]");
    localStorage.setItem("saved-looks", JSON.stringify([
      ...saved,
      { occasion, weather, outfit: outfitItems, date: new Date().toLocaleDateString() },
    ]));
  };

  return (
    <section id="planner" ref={ref}>
      <div className="fashion-backdrop" />
      <div className="section-shell">
        <plannerMotion.div
          style={{ textAlign: "center" }}
          initial={{ opacity: 0, y: 34 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="section-label">Weather Outfit Planner</div>
          <h2 className="section-title">Dress From Your Closet</h2>
          <p className="section-copy" style={{ margin: "0.9rem auto 0" }}>
            Weather and occasion suggestions now use only clothes you uploaded to your wardrobe.
          </p>
        </plannerMotion.div>

        <plannerMotion.div
          className="planner-inner"
          initial={{ opacity: 0, y: 44 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.18 }}
        >
          <div className="planner-card glass">
            <div className="section-label">Live Weather</div>
            <button className="btn-primary" type="button" onClick={useLiveWeather} style={{ width: "100%", marginBottom: "1rem" }}>
              Check Current Weather
            </button>
            <div className="select-group">
              <label>Occasion</label>
              <select className="custom-select" value={occasion} onChange={(event) => update(setOccasion, event.target.value)}>
                {PLANNER_OCCASIONS.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
              </select>
            </div>
            <div className="select-group">
              <label>Weather Override</label>
              <select className="custom-select" value={weather} onChange={(event) => update(setWeather, event.target.value)}>
                <option value="cold">Cold</option>
                <option value="mild">Mild</option>
                <option value="hot">Hot</option>
                <option value="rainy">Rainy</option>
              </select>
            </div>
            <plannerMotion.div key={weather} className="weather-note glass" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              {outfitItems.length
                ? "Best available match from clothes you added."
                : "Add clothes in Wardrobe before using outfit suggestions."}
            </plannerMotion.div>
            {liveWeather && (
              <div className="weather-note glass" style={{ marginTop: "0.85rem" }}>
                Temperature {Math.round(liveWeather.temp)} C / Feels like {Math.round(liveWeather.apparentTemp)} C
              </div>
            )}
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem", lineHeight: 1.6, marginTop: "0.85rem" }}>
              {weatherStatus}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <plannerMotion.div
              key={key}
              className="outfit-result"
              initial={{ opacity: 0, x: 28, rotateY: -8 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: -28, rotateY: 8 }}
              transition={{ duration: 0.42, ease: [0.23, 1, 0.32, 1] }}
            >
              {outfitItems.length === 0 ? (
                <div className="empty-state glass">
                  <h3 className="card-name">No clothes added yet</h3>
                  <p className="section-copy">Upload clothes in Wardrobe and this planner will use only those pieces.</p>
                  <a className="btn-primary" href="#wardrobe">Add Clothes</a>
                </div>
              ) : (
                outfitItems.map((item, index) => (
                  <plannerMotion.div
                    className="outfit-item glass glass-3d glow-hover"
                    key={item.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.38 }}
                  >
                    <img className="outfit-item-image" src={item.img} alt={item.name} />
                    <div>
                      <div className="outfit-item-label">{item.category}</div>
                      <div className="outfit-item-name">{item.name}</div>
                    </div>
                  </plannerMotion.div>
                ))
              )}
              <button className="btn-primary" style={{ justifySelf: "start" }} onClick={saveLook} disabled={outfitItems.length === 0}>Save This Look</button>
            </plannerMotion.div>
          </AnimatePresence>
        </plannerMotion.div>
      </div>
    </section>
  );
};
