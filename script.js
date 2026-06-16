/**
 * Анимация hero-секции, интерактивный блок «Стратегии», «Портфель акций», календарь,
 * секция риска и модальное окно.
 */

document.addEventListener("DOMContentLoaded", function () {
  initHeroAnimation();
  initStrategies();
  initPortfolio();
  initContactManager();
  renderCalendar();
  initRiskProfile();
});

/* ---------- Hero ---------- */

function initHeroAnimation() {
  var animatedElements = document.querySelectorAll(
    ".hero__title, .hero__bio, .hero__subtitle, .hero__cta"
  );

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    animatedElements.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  requestAnimationFrame(function () {
    animatedElements.forEach(function (el) {
      el.classList.add("is-visible");
    });
  });
}

/* ---------- Стратегии ---------- */

var STORAGE_KEY = "selected-strategy-index";
var currentStrategyKey = null;

function initStrategies() {
  var grid = document.getElementById("skills-grid");
  var selectBtn = document.getElementById("select-strategy-btn");

  if (!grid || !selectBtn) {
    return;
  }

  var cards = grid.querySelectorAll(".strategy-card");
  var selectedIndex = loadSelectedIndex();

  if (selectedIndex !== null) {
    applySelection(cards, selectedIndex);
    updateButtonLabel(selectBtn, cards, selectedIndex);
    currentStrategyKey = getStrategyKey(selectedIndex);
    showPortfolio(currentStrategyKey);
  }

  grid.addEventListener("click", function (event) {
    var card = event.target.closest(".strategy-card");
    if (!card) {
      return;
    }
    selectStrategy(cards, Number(card.dataset.index), selectBtn);
  });

  selectBtn.addEventListener("click", function () {
    var selectedCard = findSelectedCard(cards);
    if (!selectedCard) return;
    var index = Number(selectedCard.dataset.index);
    currentStrategyKey = getStrategyKey(index);
    saveSelectedIndex(index);
    updateButtonLabel(selectBtn, cards, index);
    showPortfolio(currentStrategyKey);
    var portfolioSection = document.getElementById("portfolio");
    if (portfolioSection) {
      portfolioSection.scrollIntoView({ behavior: "smooth" });
    }
  });
}

function getStrategyKey(index) {
  var map = {
    0: "beginner",
    1: "conservative",
    2: "aggressive"
  };
  return map[index] || "beginner";
}

function loadSelectedIndex() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    var index = Number(raw);
    if (Number.isNaN(index) || index < 0 || index > 2) return null;
    return index;
  } catch {
    return null;
  }
}

function saveSelectedIndex(index) {
  localStorage.setItem(STORAGE_KEY, String(index));
}

function applySelection(cards, selectedIndex) {
  cards.forEach(function (card, index) {
    var isSelected = index === selectedIndex;
    card.classList.toggle("is-selected", isSelected);
    card.classList.toggle("is-expanded", isSelected);
    card.setAttribute("aria-expanded", isSelected ? "true" : "false");
  });
}

function selectStrategy(cards, index, selectBtn) {
  applySelection(cards, index);
  saveSelectedIndex(index);
  currentStrategyKey = getStrategyKey(index);
  updateButtonLabel(selectBtn, cards, index);
}

function findSelectedCard(cards) {
  for (var i = 0; i < cards.length; i++) {
    if (cards[i].classList.contains("is-selected")) return cards[i];
  }
  return null;
}

function updateButtonLabel(selectBtn, cards, index) {
  var title = cards[index].querySelector(".strategy-card__title").textContent;
  selectBtn.textContent = "Выбрано: " + title;
  selectBtn.classList.add("is-confirmed");
  selectBtn.disabled = false;
}

/* ---------- Портфель акций ---------- */

var defaultPortfolios = {
  beginner: [
    { name: "Сбербанк (SBER)", desc: "Див. доходность ~6–7%. Идеально по всем критериям: выплаты >10 лет, долг/EBITDA <1, покрытие >2." },
    { name: "НЛМК (NLMK)", desc: "Див. доходность ~8%. Соответствует всем критериям, история выплат >10 лет, долговая нагрузка низкая." },
    { name: "МТС (MTS)", desc: "Див. доходность ~7%. Стабильный денежный поток, покрытие >1,5, долг/EBITDA ~2." },
    { name: "Лукойл (LKOH)", desc: "Див. доходность ~5–6%. Очень низкий долг, надёжная див. политика, выплаты с 2000-х." },
    { name: "Роснефть (ROSN)", desc: "Див. доходность ~6%. Крупнейшая нефтяная компания, но зависимость от нефти; долг/EBITDA ~2,5." },
    { name: "Северсталь (CHMF)", desc: "Див. доходность ~7%. Хорошая история, но цикличность металлургии; долг/EBITDA ~1,5." }
  ],
  conservative: [
    { name: "Сбербанк (SBER)", desc: "Див. доходность ~6–7%. Абсолютный лидер по надёжности, все критерии выполнены." },
    { name: "Лукойл (LKOH)", desc: "Див. доходность ~5–6%. Очень низкий долг, стабильная политика, история >20 лет." },
    { name: "МТС (MTS)", desc: "Див. доходность ~7%. Телеком-монополист, стабильный бизнес, покрытие >2." },
    { name: "НЛМК (NLMK)", desc: "Див. доходность ~8%. Низкая долговая нагрузка, стабильные выплаты даже в кризис." },
    { name: "Северсталь (CHMF)", desc: "Див. доходность ~7%. Очень низкий долг, история выплат, но цикличность." },
    { name: "Газпром (GAZP)", desc: "Див. доходность ~5–6%. Монополия, низкий долг, но политика выплат не всегда предсказуема." },
    { name: "Татнефть (TATN)", desc: "Див. доходность ~7%. Стабильная компания, долг/EBITDA <1, но зависимость от нефти." }
  ],
  aggressive: [
    { name: "МТС (MTS)", desc: "Див. доходность ~7–8%. Высокая доходность, но более волатильная, чем у Сбера." },
    { name: "НЛМК (NLMK)", desc: "Див. доходность ~8%. Высокая, но цикличность металлургии — риск снижения прибыли." },
    { name: "Сургутнефтегаз-преф (SNGSP)", desc: "Див. доходность ~10–12%. Очень высокая, но нестабильная, зависит от курса рубля." },
    { name: "Татнефть (TATN)", desc: "Див. доходность ~7–8%. Стабильная, но нефтяной риск; долг/EBITDA <1." },
    { name: "АЛРОСА (ALRS)", desc: "Див. доходность ~6–7%. Алмазодобыча, циклический бизнес, долг/EBITDA ~2,5." },
    { name: "Роснефть (ROSN)", desc: "Див. доходность ~6%. Крупнейшая, но долг/EBITDA ~2,8 (почти на грани)." },
    { name: "Башнефть (BANE)", desc: "Див. доходность ~8%. Нефтяная компания с высокой доходностью, но долг/EBITDA >3 (критерий не выполняется)." },
    { name: "ММК (MAGN)", desc: "Див. доходность ~7%. Металлургия, низкий долг, но цикличность; покрытие ~1,4 (чуть ниже нормы)." }
  ]
};

function initPortfolio() {
  var confirmBtn = document.getElementById("confirm-portfolio-btn");
  if (!confirmBtn) return;

  confirmBtn.addEventListener("click", function () {
    var contactSection = document.getElementById("contact-manager");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
    setTimeout(function() {
      openModal();
    }, 600);
  });

  if (currentStrategyKey) {
    showPortfolio(currentStrategyKey);
  }
}

function showPortfolio(strategyKey) {
  var portfolioSection = document.getElementById("portfolio");
  if (!portfolioSection) return;
  portfolioSection.classList.remove("portfolio-hidden");
  renderPortfolio(strategyKey);
}

function renderPortfolio(strategyKey) {
  var grid = document.getElementById("portfolio-grid");
  if (!grid) return;

  var stocks = defaultPortfolios[strategyKey] || [];
  grid.innerHTML = "";

  if (stocks.length === 0) {
    grid.innerHTML = "<p style='color: var(--text-muted); text-align: center;'>Для этой стратегии пока нет подходящих акций.</p>";
    return;
  }

  stocks.forEach(function (stock) {
    var card = document.createElement("article");
    card.className = "stock-card";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-expanded", "false");

    var title = document.createElement("h3");
    title.className = "stock-card__title";
    title.textContent = stock.name;

    var desc = document.createElement("p");
    desc.className = "stock-card__desc";
    desc.textContent = stock.desc || "Описание отсутствует.";

    card.appendChild(title);
    card.appendChild(desc);

    card.addEventListener("click", function () {
      var expanded = this.classList.toggle("is-expanded");
      this.setAttribute("aria-expanded", expanded ? "true" : "false");
    });

    grid.appendChild(card);
  });
}

/* ---------- Календарь дивидендных отсечек ---------- */

var DIVIDEND_EVENTS = [
  { date: "2026-07-15", ticker: "SBER", name: "Сбербанк" },
  { date: "2026-07-20", ticker: "GAZP", name: "Газпром" },
  { date: "2026-07-25", ticker: "LKOH", name: "Лукойл" },
  { date: "2026-07-28", ticker: "ROSN", name: "Роснефть" },
  { date: "2026-08-01", ticker: "MTS", name: "МТС" },
  { date: "2026-08-05", ticker: "NLMK", name: "НЛМК" },
];

var REMINDERS_STORAGE_KEY = "dividend_reminders";

function loadReminders() {
  try {
    var raw = localStorage.getItem(REMINDERS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveReminders(reminders) {
  localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
}

function renderCalendar() {
  var list = document.querySelector(".dividend-calendar__list");
  if (!list) return;

  var reminders = loadReminders();

  list.innerHTML = "";
  DIVIDEND_EVENTS.forEach(function (event) {
    var item = document.createElement("div");
    item.className = "calendar-item";

    var date = document.createElement("span");
    date.className = "calendar-item__date";
    var d = new Date(event.date + "T00:00:00");
    date.textContent = d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });

    var ticker = document.createElement("span");
    ticker.className = "calendar-item__ticker";
    ticker.textContent = event.ticker;

    var name = document.createElement("span");
    name.className = "calendar-item__name";
    name.textContent = event.name;

    var actions = document.createElement("div");
    actions.className = "calendar-item__actions";

    var btn = document.createElement("button");
    btn.className = "reminder-btn";
    btn.dataset.ticker = event.ticker;

    var eventReminders = reminders[event.ticker] || [];
    if (eventReminders.length > 0) {
      btn.classList.add("active");
      btn.innerHTML = '🔔 <span class="badge">' + eventReminders.length + '</span>';
    } else {
      btn.textContent = "🔔 Добавить напоминание";
    }

    var popover = document.createElement("div");
    popover.className = "reminder-popover";
    popover.dataset.ticker = event.ticker;

    var days = [1, 3, 7];
    days.forEach(function (day) {
      var label = document.createElement("label");
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = day;
      if (eventReminders.includes(day)) {
        cb.checked = true;
      }
      label.appendChild(cb);
      label.appendChild(document.createTextNode(" За " + day + " день" + (day > 1 ? "ей" : "")));
      popover.appendChild(label);
    });

    var actionsDiv = document.createElement("div");
    actionsDiv.className = "reminder-popover__actions";

    var saveBtn = document.createElement("button");
    saveBtn.className = "reminder-popover__save";
    saveBtn.textContent = "Сохранить";

    var cancelBtn = document.createElement("button");
    cancelBtn.className = "reminder-popover__cancel";
    cancelBtn.textContent = "Отмена";

    actionsDiv.appendChild(saveBtn);
    actionsDiv.appendChild(cancelBtn);
    popover.appendChild(actionsDiv);

    actions.appendChild(btn);
    actions.appendChild(popover);
    item.appendChild(date);
    item.appendChild(ticker);
    item.appendChild(name);
    item.appendChild(actions);
    list.appendChild(item);

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      document.querySelectorAll(".reminder-popover.visible").forEach(function (p) {
        if (p !== popover) p.classList.remove("visible");
      });
      popover.classList.toggle("visible");
    });

    document.addEventListener("click", function (e) {
      if (!actions.contains(e.target)) {
        popover.classList.remove("visible");
      }
    });

    saveBtn.addEventListener("click", function () {
      var checked = popover.querySelectorAll("input[type=checkbox]:checked");
      var selectedDays = Array.from(checked).map(function (cb) { return Number(cb.value); });
      var reminders = loadReminders();
      if (selectedDays.length > 0) {
        reminders[event.ticker] = selectedDays;
      } else {
        delete reminders[event.ticker];
      }
      saveReminders(reminders);
      var count = selectedDays.length;
      if (count > 0) {
        btn.classList.add("active");
        btn.innerHTML = '🔔 <span class="badge">' + count + '</span>';
      } else {
        btn.classList.remove("active");
        btn.textContent = "🔔 Добавить напоминание";
      }
      popover.classList.remove("visible");
    });

    cancelBtn.addEventListener("click", function () {
      var reminders = loadReminders();
      var current = reminders[event.ticker] || [];
      popover.querySelectorAll("input[type=checkbox]").forEach(function (cb) {
        cb.checked = current.includes(Number(cb.value));
      });
      popover.classList.remove("visible");
    });
  });
}

/* ---------- Секция "Какое направление инвестирования ближе вам" ---------- */

var RISK_STORAGE_KEY = "risk_profile_values";

function loadRiskValues() {
  try {
    var raw = localStorage.getItem(RISK_STORAGE_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 4) {
        return parsed;
      }
    }
  } catch {}
  return [50, 50, 50, 50];
}

function saveRiskValues(values) {
  localStorage.setItem(RISK_STORAGE_KEY, JSON.stringify(values));
}

function initRiskProfile() {
  var sliders = [
    document.getElementById("slider1"),
    document.getElementById("slider2"),
    document.getElementById("slider3"),
    document.getElementById("slider4")
  ];
  var outputs = [
    document.getElementById("output1"),
    document.getElementById("output2"),
    document.getElementById("output3"),
    document.getElementById("output4")
  ];
  var avgSpan = document.getElementById("average-value");
  var gaugeBar = document.getElementById("gauge-bar");
  var descSpan = document.getElementById("risk-description");

  if (sliders.some(function (s) { return s === null; })) return;

  var savedValues = loadRiskValues();
  sliders.forEach(function (slider, index) {
    slider.value = savedValues[index];
    outputs[index].textContent = savedValues[index] + "%";
  });

  function update() {
    var values = sliders.map(function (s) { return Number(s.value); });
    saveRiskValues(values);
    values.forEach(function (val, idx) {
      outputs[idx].textContent = val + "%";
    });
    var sum = values.reduce(function (a, b) { return a + b; }, 0);
    var avg = Math.round(sum / values.length);
    avgSpan.textContent = avg + "%";
    gaugeBar.style.width = avg + "%";

    var desc = "";
    if (avg <= 25) desc = "Спекулятивное";
    else if (avg <= 50) desc = "Более спекулятивное";
    else if (avg <= 75) desc = "Более консервативное";
    else desc = "Максимально консервативное";
    descSpan.textContent = desc;
  }

  sliders.forEach(function (slider) {
    slider.addEventListener("input", update);
  });

  update();
}

/* ---------- Связь с менеджером ---------- */

function initContactManager() {
  var callBtn = document.getElementById("call-manager-btn");
  var modalOverlay = document.getElementById("modal-overlay");
  var closeBtn = document.getElementById("modal-close-btn");
  var modalForm = document.getElementById("modal-form");

  if (!callBtn || !modalOverlay || !closeBtn || !modalForm) return;

  callBtn.addEventListener("click", function () {
    openModal();
  });

  closeBtn.addEventListener("click", function () {
    closeModal(modalOverlay);
  });

  modalOverlay.addEventListener("click", function (event) {
    if (event.target === modalOverlay) {
      closeModal(modalOverlay);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modalOverlay.classList.contains("visible")) {
      closeModal(modalOverlay);
    }
  });

  modalForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var phone = document.getElementById("modal-phone").value.trim();
    var name = document.getElementById("modal-name").value.trim();

    if (!phone || !name) {
      alert("Заполните все поля.");
      return;
    }

    alert("Спасибо, " + name + "! Мы свяжемся с вами по номеру " + phone);
    closeModal(modalOverlay);
    modalForm.reset();
  });
}

function openModal() {
  var overlay = document.getElementById("modal-overlay");
  if (!overlay) return;
  overlay.classList.add("visible");
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal(overlay) {
  if (!overlay) {
    overlay = document.getElementById("modal-overlay");
  }
  if (!overlay) return;
  overlay.classList.remove("visible");
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}