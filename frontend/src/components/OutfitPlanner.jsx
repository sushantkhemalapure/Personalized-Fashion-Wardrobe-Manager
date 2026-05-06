const { useRef: plannerUseRef, useState: plannerUseState } = React;
const { AnimatePresence, motion: plannerMotion, useInView: plannerUseInView } = window.Motion;

const OUTFIT_RULES = {
  hot: {
    casual: {
      top: "T-shirt",
      bottom: "Shorts",
      shoes: "Canvas Sneakers",
      images: {
        top: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=360&q=80",
        bottom: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=360&q=80",
        shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=360&q=80",
      },
      note: "Hot weather calls for breathable fabric and a relaxed shape.",
    },
    office: {
      top: "Linen Shirt",
      bottom: "Chino Trousers",
      shoes: "Loafers",
      images: {
        top: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=360&q=80",
        bottom: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=360&q=80",
        shoes: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=360&q=80",
      },
      note: "Office polish, but lighter fabrics keep the look comfortable.",
    },
    party: {
      top: "Satin Cami",
      bottom: "Mini Skirt",
      shoes: "Block Heels",
      images: {
        top: "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&w=360&q=80",
        bottom: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=360&q=80",
        shoes: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=360&q=80",
      },
      note: "A clean evening shape with heat-friendly layers.",
    },
  },
  cold: {
    casual: {
      top: "Jacket",
      bottom: "Jeans",
      shoes: "Chelsea Boots",
      images: {
        top: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=360&q=80",
        bottom: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=360&q=80",
        shoes: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=360&q=80",
      },
      note: "Cold weather works best with structure, denim, and closed footwear.",
    },
    office: {
      top: "Turtleneck",
      bottom: "Tailored Trousers",
      shoes: "Oxford Shoes",
      images: {
        top: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=360&q=80",
        bottom: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=360&q=80",
        shoes: "https://images.unsplash.com/photo-1614251056216-f748f76cd228?auto=format&fit=crop&w=360&q=80",
      },
      note: "Warm, sharp, and easy to layer under a coat.",
    },
    party: {
      top: "Velvet Blazer",
      bottom: "Dark Jeans",
      shoes: "Ankle Boots",
      images: {
        top: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=360&q=80",
        bottom: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=360&q=80",
        shoes: "https://images.unsplash.com/photo-1542840410-3092f99611a3?auto=format&fit=crop&w=360&q=80",
      },
      note: "A richer texture makes the outfit evening-ready.",
    },
  },
  rainy: {
    casual: {
      top: "Hoodie",
      bottom: "Waterproof Joggers",
      shoes: "Boots",
      images: {
        top: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=360&q=80",
        bottom: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=360&q=80",
        shoes: "https://images.unsplash.com/photo-1605812860427-4024433a70fd?auto=format&fit=crop&w=360&q=80",
      },
      note: "Rainy plans need quick-dry comfort and grippy footwear.",
    },
    office: {
      top: "Trench Coat",
      bottom: "Pressed Chinos",
      shoes: "Derby Shoes",
      images: {
        top: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=360&q=80",
        bottom: "https://images.unsplash.com/photo-1506629905607-d9b297d1f5f5?auto=format&fit=crop&w=360&q=80",
        shoes: "https://images.unsplash.com/photo-1614251055880-ee96e4803393?auto=format&fit=crop&w=360&q=80",
      },
      note: "Weather coverage with a clean office silhouette.",
    },
    party: {
      top: "Sheer Raincoat",
      bottom: "Leather Leggings",
      shoes: "Chunky Boots",
      images: {
        top: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=360&q=80",
        bottom: "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=360&q=80",
        shoes: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=360&q=80",
      },
      note: "Rainproof texture with a stronger night-out edge.",
    },
  },
};

window.OutfitPlanner = function OutfitPlanner() {
  const [occasion, setOccasion] = plannerUseState("casual");
  const [weather, setWeather] = plannerUseState("hot");
  const [key, setKey] = plannerUseState(0);
  const [weatherStatus, setWeatherStatus] = plannerUseState("Manual weather selection is active.");
  const ref = plannerUseRef(null);
  const isInView = plannerUseInView(ref, { once: true, amount: 0.22 });
  const outfit = OUTFIT_RULES[weather][occasion];

  const update = (setter, value) => {
    setter(value);
    setWeatherStatus("Manual weather selection is active.");
    setKey((current) => current + 1);
  };

  const applyWeather = (nextWeather, message) => {
    setWeather(nextWeather);
    setWeatherStatus(message);
    setKey((current) => current + 1);
  };

  const useLiveWeather = () => {
    if (!navigator.geolocation) {
      setWeatherStatus("Live weather needs browser location support. Use the dropdown instead.");
      return;
    }

    setWeatherStatus("Checking live weather...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation&temperature_unit=celsius`;
          const response = await fetch(url);
          const data = await response.json();
          const temp = data.current?.temperature_2m;
          const precipitation = data.current?.precipitation || 0;

          if (precipitation > 0.1) {
            applyWeather("rainy", `Live weather: ${Math.round(temp)} C with rain. Rainy outfit rules applied.`);
          } else if (temp <= 18) {
            applyWeather("cold", `Live weather: ${Math.round(temp)} C. Cold outfit rules applied.`);
          } else {
            applyWeather("hot", `Live weather: ${Math.round(temp)} C. Light outfit rules applied.`);
          }
        } catch (error) {
          setWeatherStatus("Live weather could not load. Manual selection is still available.");
        }
      },
      () => setWeatherStatus("Location permission was not granted. Manual selection is still available.")
    );
  };

  const saveLook = () => {
    const saved = JSON.parse(localStorage.getItem("saved-looks") || "[]");
    localStorage.setItem("saved-looks", JSON.stringify([
      ...saved,
      { occasion, weather, outfit, date: new Date().toLocaleDateString() },
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
          <div className="section-label">Outfit Planner</div>
          <h2 className="section-title">What Should You Wear?</h2>
          <p className="section-copy" style={{ margin: "0.9rem auto 0" }}>
            Choose an occasion and weather condition. The suggestions are manual, rule-based, and easy to understand.
          </p>
        </plannerMotion.div>

        <plannerMotion.div
          className="planner-inner"
          initial={{ opacity: 0, y: 44 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.18 }}
        >
          <div className="planner-card glass">
            <div className="section-label">Set the Scene</div>
            <div className="select-group">
              <label>Occasion</label>
              <select className="custom-select" value={occasion} onChange={(event) => update(setOccasion, event.target.value)}>
                <option value="casual">Casual</option>
                <option value="office">Office</option>
                <option value="party">Party</option>
              </select>
            </div>
            <div className="select-group">
              <label>Weather</label>
              <select className="custom-select" value={weather} onChange={(event) => update(setWeather, event.target.value)}>
                <option value="hot">Hot</option>
                <option value="cold">Cold</option>
                <option value="rainy">Rainy</option>
              </select>
            </div>
            <button className="btn-secondary" type="button" onClick={useLiveWeather} style={{ marginBottom: "1rem" }}>
              Use Live Weather
            </button>
            <plannerMotion.div key={weather} className="weather-note glass" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              {outfit.note}
            </plannerMotion.div>
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
              {[
                ["Top Wear", outfit.top, outfit.images.top],
                ["Bottom Wear", outfit.bottom, outfit.images.bottom],
                ["Shoes", outfit.shoes, outfit.images.shoes],
              ].map(([label, name, image], index) => (
                <plannerMotion.div
                  className="outfit-item glass glass-3d glow-hover"
                  key={label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.38 }}
                >
                  <img className="outfit-item-image" src={image} alt={name} />
                  <div>
                    <div className="outfit-item-label">{label}</div>
                    <div className="outfit-item-name">{name}</div>
                  </div>
                </plannerMotion.div>
              ))}
              <button className="btn-primary" style={{ justifySelf: "start" }} onClick={saveLook}>Save This Look</button>
            </plannerMotion.div>
          </AnimatePresence>
        </plannerMotion.div>
      </div>
    </section>
  );
};
