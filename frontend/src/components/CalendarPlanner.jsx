const { useEffect: calendarUseEffect, useMemo: calendarUseMemo, useRef: calendarUseRef, useState: calendarUseState } = React;
const { motion: calendarMotion, useInView: calendarUseInView } = window.Motion;

const CALENDAR_EVENT_TYPES = [
  { value: "function", label: "Function", hints: ["Formal", "Office", "Evening"], categories: ["Layers", "Dresses", "Footwear", "Accessories"] },
  { value: "birthday", label: "Birthday", hints: ["Party", "Dinner", "Evening"], categories: ["Dresses", "Layers", "Footwear", "Accessories"] },
  { value: "party", label: "Party", hints: ["Party", "Dinner", "Evening"], categories: ["Dresses", "Footwear", "Layers", "Accessories"] },
  { value: "work", label: "Work", hints: ["Office", "Formal", "Work"], categories: ["Tops", "Bottoms", "Layers", "Footwear", "Accessories"] },
  { value: "travel", label: "Travel", hints: ["Travel", "Casual", "Rainy"], categories: ["Outerwear", "Footwear", "Accessories", "Tops"] },
  { value: "daily", label: "Daily", hints: ["Daily", "Casual", "Office"], categories: ["Tops", "Bottoms", "Footwear", "Accessories", "Outerwear"] },
  { value: "other", label: "Other", hints: ["Daily", "Casual", "Evening"], categories: ["Tops", "Bottoms", "Dresses", "Footwear", "Layers"] },
];

const CALENDAR_WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const readCalendarEvents = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem("wdrb-calendar-events") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem("wdrb-calendar-events");
    return [];
  }
};

const readCalendarPlanSeed = () => localStorage.getItem("wdrb-calendar-plan-seed") || "initial";

const padDate = (value) => String(value).padStart(2, "0");

const dateToIso = (date) => `${date.getFullYear()}-${padDate(date.getMonth() + 1)}-${padDate(date.getDate())}`;

const parseIsoDate = (iso) => {
  const [year, month, day] = String(iso).split("-").map(Number);
  return new Date(year, month - 1, day);
};

const addCalendarDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const startOfCalendarWeek = (date) => {
  const next = new Date(date);
  const mondayOffset = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - mondayOffset);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfCalendarWeek = (date) => addCalendarDays(startOfCalendarWeek(date), 6);

const getWeekKey = (date) => dateToIso(startOfCalendarWeek(date));

const getMonthLabel = (date) => date.toLocaleDateString(undefined, { month: "long", year: "numeric" });

const getEventTypeConfig = (type) => CALENDAR_EVENT_TYPES.find((item) => item.value === type) || CALENDAR_EVENT_TYPES[5];

const textMatchesHints = (item, hints) => {
  const text = `${item.name} ${item.category} ${item.weather} ${item.tags.join(" ")} ${item.usage.occasions.join(" ")}`.toLowerCase();
  return hints.some((hint) => text.includes(hint.toLowerCase()));
};

const hashCalendarText = (text) => String(text).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

const formatCalendarList = (items) => {
  if (items.length <= 1) return items[0] || "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
};

const itemRank = (item, config, dateIso, planSeed = "") => {
  let score = item.rating || 0;
  if (config.categories.includes(item.category)) score += 24 - config.categories.indexOf(item.category) * 3;
  if (textMatchesHints(item, config.hints)) score += 20;
  score += (hashCalendarText(`${dateIso}-${item.id}`) % 13) / 10;
  score += hashCalendarText(`${planSeed}-${dateIso}-${item.id}`) % 90;
  return score;
};

const getMissingOutfitCategories = (closetItems) => {
  const categories = new Set(closetItems.map((item) => item.category));
  return [
    { category: "Tops", label: "top" },
    { category: "Bottoms", label: "bottom" },
    { category: "Footwear", label: "shoe" },
  ].filter((item) => !categories.has(item.category)).map((item) => item.label);
};

const buildCandidateOutfits = (closetItems, type, dateIso, planSeed) => {
  const config = getEventTypeConfig(type);
  const ranked = [...closetItems].sort((a, b) => itemRank(b, config, dateIso, planSeed) - itemRank(a, config, dateIso, planSeed));
  const byCategory = (category) => ranked.filter((item) => item.category === category);
  const candidates = [];

  const addCandidate = (items, reason) => {
    const unique = items.filter(Boolean).filter((item, index, list) => list.findIndex((other) => other.id === item.id) === index);
    if (unique.length !== 3) return;
    const key = unique.map((item) => item.id).sort().join("|");
    if (!candidates.some((candidate) => candidate.key === key)) {
      candidates.push({ key, items: unique, reason });
    }
  };

  const footwear = byCategory("Footwear");
  const tops = byCategory("Tops");
  const bottoms = byCategory("Bottoms");

  tops.forEach((top) => bottoms.forEach((bottom) => footwear.forEach((shoe) => (
    addCandidate([top, bottom, shoe], "A complete calendar outfit built from one top, one bottom, and one shoe.")
  ))));

  return candidates;
};

const chooseCalendarOutfit = ({ dateIso, type, closetItems, savedItemIds, hasEvent, planSeed, weekUsage, priorOutfits }) => {
  if (!closetItems.length) {
    return { key: "empty", items: [], reason: "Add clothes to your closet to unlock daily recommendations.", primaryId: null };
  }

  const candidates = buildCandidateOutfits(closetItems, type, dateIso, planSeed);
  if (!candidates.length) {
    const missing = getMissingOutfitCategories(closetItems);
    return {
      key: `missing-${missing.join("-") || "outfit"}`,
      items: [],
      reason: missing.length
        ? `Add at least one ${missing.join(", ")} to your wardrobe so the calendar can build one top, one bottom, and one shoe.`
        : "Add a top, bottom, and shoe to your wardrobe so the calendar can build a complete outfit.",
      primaryId: null,
    };
  }
  const date = parseIsoDate(dateIso);
  const weekKey = getWeekKey(date);
  const week = weekUsage.get(weekKey) || { outfitKeys: new Set(), primaryIds: new Set(), itemIds: new Set() };
  const sameWeekdayLastWeek = dateToIso(addCalendarDays(date, -7));
  const lastWeekOutfit = priorOutfits.get(sameWeekdayLastWeek);

  const scored = candidates.map((candidate) => {
    const primary = candidate.items[0];
    const savedEventItems = candidate.items.filter((item) => savedItemIds.has(item.id));
    let score = candidate.items.reduce((sum, item) => sum + itemRank(item, getEventTypeConfig(type), dateIso, planSeed), 0);
    if (hasEvent && savedEventItems.length) score += savedEventItems.length * 9000;
    if (hasEvent && savedEventItems.length === 3) score += 5000;
    if (hasEvent && primary && savedItemIds.has(primary.id)) score += 520;
    if (week.outfitKeys.has(candidate.key)) score -= 800;
    if (lastWeekOutfit?.key === candidate.key) score -= 650;
    if (primary && week.primaryIds.has(primary.id)) score -= 260;
    if (lastWeekOutfit?.primaryId === primary?.id) score -= 230;
    score -= candidate.items.filter((item) => week.itemIds.has(item.id)).length * 42;
    score += candidate.items.length * 5;
    return {
      ...candidate,
      savedItemId: savedEventItems[0]?.id || null,
      savedItemIds: savedEventItems.map((item) => item.id),
      primaryId: primary?.id,
      score,
    };
  }).sort((a, b) => b.score - a.score);

  const chosen = scored[0];
  if (hasEvent && chosen.savedItemIds?.length) {
    const savedNames = chosen.items
      .filter((item) => chosen.savedItemIds.includes(item.id))
      .map((item) => item.name);
    const savedText = formatCalendarList(savedNames);
    chosen.reason = `${savedText} ${savedNames.length === 1 ? "is" : "are"} from your saved closet, so ${savedNames.length === 1 ? "it is" : "they are"} suggested first for this event day.`;
  }
  chosen.items.forEach((item) => week.itemIds.add(item.id));
  if (chosen.primaryId) week.primaryIds.add(chosen.primaryId);
  week.outfitKeys.add(chosen.key);
  weekUsage.set(weekKey, week);
  priorOutfits.set(dateIso, chosen);
  return chosen;
};

const buildCalendarDays = (monthDate) => {
  const firstOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const lastOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const start = startOfCalendarWeek(firstOfMonth);
  const end = endOfCalendarWeek(lastOfMonth);
  const days = [];

  for (let cursor = new Date(start); cursor <= end; cursor = addCalendarDays(cursor, 1)) {
    days.push({
      date: new Date(cursor),
      iso: dateToIso(cursor),
      inMonth: cursor.getMonth() === monthDate.getMonth(),
    });
  }

  return days;
};

const formatSelectedDate = (iso) => parseIsoDate(iso).toLocaleDateString(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

window.CalendarPlannerPage = function CalendarPlannerPage({ savedItems = [] }) {
  const todayIso = dateToIso(new Date());
  const [events, setEvents] = calendarUseState(readCalendarEvents);
  const [monthDate, setMonthDate] = calendarUseState(() => parseIsoDate(todayIso));
  const [selectedDate, setSelectedDate] = calendarUseState(todayIso);
  const [title, setTitle] = calendarUseState("");
  const [type, setType] = calendarUseState("function");
  const [refreshKey, setRefreshKey] = calendarUseState(0);
  const [planNonce, setPlanNonce] = calendarUseState(readCalendarPlanSeed);
  const ref = calendarUseRef(null);
  const detailRef = calendarUseRef(null);
  const isInView = calendarUseInView(ref, { once: true, amount: 0.16 });
  const closetItems = calendarUseMemo(() => (
    typeof window.getUserClosetItems === "function" ? window.getUserClosetItems() : (window.CLOSET_ITEMS || [])
  ), [refreshKey]);
  const favoriteKey = savedItems.join("|");
  const savedItemIds = calendarUseMemo(() => new Set(savedItems), [favoriteKey]);

  const calendarDays = calendarUseMemo(() => buildCalendarDays(monthDate), [monthDate.getFullYear(), monthDate.getMonth()]);

  const eventsByDate = calendarUseMemo(() => events.reduce((map, event) => {
    const list = map.get(event.date) || [];
    list.push(event);
    map.set(event.date, list);
    return map;
  }, new Map()), [events]);

  const planSeed = calendarUseMemo(() => [
    planNonce,
    events.map((event) => `${event.date}:${event.type}:${event.title}`).join("|"),
    favoriteKey,
    closetItems.map((item) => item.id).join("|"),
  ].join("::"), [planNonce, events, favoriteKey, closetItems]);

  const recommendations = calendarUseMemo(() => {
    const visibleDates = calendarDays.map((day) => day.iso);
    const warmupStart = addCalendarDays(parseIsoDate(visibleDates[0]), -7);
    const allDates = [];
    for (let cursor = new Date(warmupStart); cursor <= parseIsoDate(visibleDates[visibleDates.length - 1]); cursor = addCalendarDays(cursor, 1)) {
      allDates.push(dateToIso(cursor));
    }

    const weekUsage = new Map();
    const priorOutfits = new Map();
    const result = new Map();

    allDates.forEach((dateIso) => {
      const dayEvents = eventsByDate.get(dateIso) || [];
      const dayType = dayEvents[0]?.type || "daily";
      const outfit = chooseCalendarOutfit({
        dateIso,
        type: dayType,
        closetItems,
        savedItemIds,
        hasEvent: dayEvents.length > 0,
        planSeed,
        weekUsage,
        priorOutfits,
      });
      result.set(dateIso, {
        ...outfit,
        type: dayType,
        event: dayEvents[0] || null,
      });
    });

    return result;
  }, [calendarDays, eventsByDate, closetItems, favoriteKey, planSeed]);

  calendarUseEffect(() => {
    const refresh = () => {
      setEvents(readCalendarEvents());
      setPlanNonce(readCalendarPlanSeed());
      setRefreshKey((current) => current + 1);
    };
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("hashchange", refresh);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("wdrb-wardrobe-updated", refresh);
    window.addEventListener("wdrb-calendar-updated", refresh);
    window.addEventListener("wdrb-favorites-updated", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("hashchange", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("wdrb-wardrobe-updated", refresh);
      window.removeEventListener("wdrb-calendar-updated", refresh);
      window.removeEventListener("wdrb-favorites-updated", refresh);
    };
  }, []);

  const selectedEvents = eventsByDate.get(selectedDate) || [];
  const selectedRecommendation = recommendations.get(selectedDate);
  const upcomingEvents = [...events]
    .filter((event) => event.date >= todayIso)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  const persistEvents = (nextEvents) => {
    const nextPlanSeed = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setEvents(nextEvents);
    setPlanNonce(nextPlanSeed);
    localStorage.setItem("wdrb-calendar-events", JSON.stringify(nextEvents));
    localStorage.setItem("wdrb-calendar-plan-seed", nextPlanSeed);
    window.dispatchEvent(new CustomEvent("wdrb-calendar-updated", { detail: { events: nextEvents } }));
  };

  const scrollToDayOutfit = () => {
    window.setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const addEvent = (event) => {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) return;
    const nextEvent = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: nextTitle,
      type,
      date: selectedDate,
    };
    persistEvents([...events, nextEvent].sort((a, b) => a.date.localeCompare(b.date)));
    setTitle("");
    scrollToDayOutfit();
  };

  const removeEvent = (id) => {
    persistEvents(events.filter((event) => event.id !== id));
  };

  const changeMonth = (amount) => {
    setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  const selectCalendarDate = (dateIso, shouldOpenOutfit = true) => {
    setSelectedDate(dateIso);
    const nextDate = parseIsoDate(dateIso);
    if (nextDate.getMonth() !== monthDate.getMonth() || nextDate.getFullYear() !== monthDate.getFullYear()) {
      setMonthDate(nextDate);
    }
    if (shouldOpenOutfit) scrollToDayOutfit();
  };

  return (
    <section id="calendar" ref={ref} className="calendar-page">
      <div className="fashion-backdrop" />
      <div className="section-shell calendar-shell">
        <calendarMotion.div
          className="calendar-hero glass"
          initial={{ opacity: 0, y: 34 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div>
            <div className="section-label">Event Calendar</div>
            <h1 className="section-title">Plan What to Wear Every Day</h1>
            <p className="section-copy" style={{ marginTop: "0.9rem" }}>
              Add functions, birthdays, parties, work days, or daily plans. Event days suggest your saved closet first, then complete the look with one top, one bottom, and one shoe.
            </p>
          </div>
          <div className="calendar-rotation-card">
            <strong>{closetItems.length}</strong>
            <span>Closet Items Used</span>
          </div>
        </calendarMotion.div>

        <div className="calendar-layout">
          <calendarMotion.aside
            className="calendar-panel glass"
            initial={{ opacity: 0, x: -24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <form className="calendar-form" onSubmit={addEvent}>
              <div className="section-label">Add Event</div>
              <label className="select-group">
                <span>Event Name</span>
                <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Birthday dinner, family function..." />
              </label>
              <label className="select-group">
                <span>Date</span>
                <input className="input" type="date" value={selectedDate} onChange={(event) => selectCalendarDate(event.target.value, false)} />
              </label>
              <label className="select-group">
                <span>Event Type</span>
                <select className="custom-select" value={type} onChange={(event) => setType(event.target.value)}>
                  {CALENDAR_EVENT_TYPES.filter((item) => item.value !== "daily").map((item) => (
                    <option value={item.value} key={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>
              <button className="btn-primary" type="submit">Add to Calendar</button>
            </form>

            <div className="calendar-upcoming">
              <div className="section-label">Upcoming</div>
              {upcomingEvents.length === 0 ? (
                <p className="calendar-muted">No events yet. Daily outfit suggestions still appear for every date.</p>
              ) : upcomingEvents.map((event) => (
                <div className="calendar-event-row" key={event.id}>
                  <button className="calendar-event-line" type="button" onClick={() => selectCalendarDate(event.date)}>
                    <span>{event.date}</span>
                    <strong>{event.title}</strong>
                  </button>
                  <button className="btn-secondary calendar-remove-btn" type="button" onClick={() => removeEvent(event.id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </calendarMotion.aside>

          <calendarMotion.div
            className="calendar-main glass"
            initial={{ opacity: 0, x: 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.16 }}
          >
            <div className="calendar-toolbar">
              <button className="btn-secondary" type="button" onClick={() => changeMonth(-1)}>Previous</button>
              <div>
                <div className="section-label">Month</div>
                <h2 className="calendar-month-title">{getMonthLabel(monthDate)}</h2>
              </div>
              <button className="btn-secondary" type="button" onClick={() => changeMonth(1)}>Next</button>
            </div>

            <div className="calendar-weekdays">
              {CALENDAR_WEEKDAYS.map((day) => <span key={day}>{day}</span>)}
            </div>

            <div className="calendar-grid">
              {calendarDays.map((day) => {
                const dayEvents = eventsByDate.get(day.iso) || [];
                const recommendation = recommendations.get(day.iso);
                const isSelected = day.iso === selectedDate;
                const isToday = day.iso === todayIso;
                return (
                  <button
                    className={`calendar-day ${day.inMonth ? "" : "muted"} ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
                    type="button"
                    key={day.iso}
                    onClick={() => selectCalendarDate(day.iso)}
                  >
                    <span className="calendar-date-number">{day.date.getDate()}</span>
                    {dayEvents.slice(0, 2).map((event) => (
                      <span className="calendar-event-chip" key={event.id}>{event.title}</span>
                    ))}
                    {recommendation && (
                      <span className="calendar-outfit-chip">
                        {recommendation.items.length
                          ? recommendation.items.map((item) => item.name).join(" + ")
                          : "Needs top + bottom + shoe"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </calendarMotion.div>
        </div>

        <calendarMotion.div
          className="calendar-detail glass"
          ref={detailRef}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.22 }}
        >
          <div className="calendar-detail-heading">
            <div>
              <div className="section-label">{formatSelectedDate(selectedDate)}</div>
              <h2 className="calendar-month-title">
                What to Wear{selectedEvents[0]?.title ? `: ${selectedEvents[0].title}` : ""}
              </h2>
            </div>
            <button className="btn-secondary" type="button" onClick={() => {
              setSelectedDate(todayIso);
              setMonthDate(parseIsoDate(todayIso));
            }}>Today</button>
          </div>

          {selectedEvents.length > 0 && (
            <div className="calendar-selected-events">
              {selectedEvents.map((event) => (
                <div className="calendar-selected-event" key={event.id}>
                  <span>{getEventTypeConfig(event.type).label}</span>
                  <strong>{event.title}</strong>
                  <button className="btn-secondary calendar-remove-btn" type="button" onClick={() => removeEvent(event.id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedRecommendation && selectedRecommendation.items.length === 0 ? (
            <div className="empty-state glass">
              <h3 className="card-name">{closetItems.length ? "Complete outfit needed" : "No clothes added yet"}</h3>
              <p className="section-copy">{selectedRecommendation.reason}</p>
              <a className="btn-primary" href="#wardrobe">Add Clothes</a>
            </div>
          ) : selectedRecommendation && (
            <div className="calendar-outfit-detail">
              <div className="calendar-outfit-note">
                <div className="section-label">Recommendation Rule</div>
                <p>{selectedRecommendation.reason}</p>
                <div className="tag-row">
                  {selectedRecommendation.savedItemIds?.length > 0 && <span className="tag">Saved closet selected</span>}
                  <span className="tag">One top</span>
                  <span className="tag">One bottom</span>
                  <span className="tag">One shoe</span>
                  <span className="tag">No same-week outfit repeat</span>
                  <span className="tag">No next same-weekday repeat</span>
                  <span className="tag">Closet only</span>
                </div>
              </div>
              <div className="calendar-outfit-items">
                {selectedRecommendation.items.map((item) => (
                  <article className="calendar-outfit-card" key={item.id}>
                    <img src={item.img} alt={item.name} />
                    <div>
                      <span>{item.category}</span>
                      {selectedRecommendation.savedItemIds?.includes(item.id) && <span>Saved closet</span>}
                      <strong>{item.name}</strong>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </calendarMotion.div>
      </div>
    </section>
  );
};
