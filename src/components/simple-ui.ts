import { ensureEl, findEl } from "@/utils";

type LegacyTabId = "optionsTab" | "toolsTab" | "layersTab" | "styleTab" | "aboutTab";
type SimpleSection = "create" | "edit" | "layers" | "style" | "save-export";
type SimpleAction = "open" | "save" | "undo" | "redo" | "new" | "help";
type SimpleStartAction = "create" | "open" | "continue" | "advanced";

interface CreateWizardState {
  step: number;
  preset: "quick" | "islands" | "blank";
  detail: "light" | "standard" | "rich";
  cultures: number;
  states: number;
  religions: number;
  style: string;
  name: string;
}

const DEFAULT_WIZARD_STATE: CreateWizardState = {
  step: 0,
  preset: "quick",
  detail: "standard",
  cultures: 8,
  states: 12,
  religions: 4,
  style: "default",
  name: ""
};

const SECTION_LABELS: Record<SimpleSection, string> = {
  create: "Create",
  edit: "Edit",
  layers: "Layers",
  style: "Style",
  "save-export": "Save & Export"
};

const TOOL_CATEGORIES: Record<string, string[]> = {
  terrain: ["editBiomesButton", "editCoastlineSettings", "editHeightmapButton", "overviewRiversButton", "regenerateIce", "regenerateReliefIcons", "regenerateRivers", "addRiver"],
  world: ["editCulturesButton", "editDiplomacyButton", "editGoods", "editNamesBaseButton", "editProvincesButton", "editReligions", "editStatesButton", "editUnitsButton", "editZonesButton", "regenerateBurgs", "regenerateCultures", "regenerateEconomy", "regenerateGoods", "regenerateMarkets", "regenerateMilitary", "regeneratePopulation", "regenerateProduction", "regenerateProvinces", "regenerateReligions", "regenerateStates", "regenerateZones"],
  labels: ["overviewLabelsButton", "editNamesBaseButton", "regenerateStateLabels", "addLabel"],
  decorations: ["editEmblemButton", "overviewMarkersButton", "overviewMilitaryButton", "regenerateEmblems", "regenerateMarkers", "regenerateMilitary", "addBurgTool", "addMarker", "addRoute", "openSubmapTool"],
  analysis: ["overviewBurgsButton", "overviewMarketsButton", "editMeasurersButton", "editNotesButton", "overviewCellsButton", "overviewChartsButton", "overviewRoutesButton", "openMinimapButton", "openTransformTool", "editTradeAnimationButton"]
};

function updateToolVisibility(activeCategory = "all"): void {
  const tools = findEl<HTMLElement>("toolsContent");
  if (!tools) return;
  const query = findEl<HTMLInputElement>("simpleToolSearch")?.value.trim().toLowerCase() ?? "";
  const categoryIds = activeCategory === "all" ? undefined : new Set(TOOL_CATEGORIES[activeCategory] ?? []);
  const grids = new Set<HTMLElement>();

  tools.querySelectorAll<HTMLButtonElement>(".grid button").forEach(button => {
    const matchesCategory = !categoryIds || categoryIds.has(button.id);
    const matchesQuery = !query || button.textContent?.toLowerCase().includes(query) || button.dataset.tip?.toLowerCase().includes(query);
    button.hidden = !(matchesCategory && Boolean(matchesQuery));
    const grid = button.closest<HTMLElement>(".grid");
    if (grid) grids.add(grid);
  });
  grids.forEach(grid => {
    grid.hidden = !grid.querySelector("button:not([hidden])");
  });
}

function initializeToolFilters(): void {
  const search = findEl<HTMLInputElement>("simpleToolSearch");
  const filters = document.querySelectorAll<HTMLButtonElement>("[data-simple-tool-filter]");
  let activeCategory = "all";
  const apply = (): void => updateToolVisibility(activeCategory);

  search?.addEventListener("input", apply);
  filters.forEach(button => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.simpleToolFilter ?? "all";
      filters.forEach(filter => {
        const active = filter === button;
        filter.classList.toggle("active", active);
        filter.setAttribute("aria-pressed", String(active));
      });
      apply();
      announce(`${button.textContent?.trim() ?? "All"} tools shown`);
    });
  });
  apply();
}

function initializeStylePresets(): void {
  const select = findEl<HTMLSelectElement>("stylePreset");
  const buttons = document.querySelectorAll<HTMLButtonElement>("[data-simple-style-preset]");
  if (!select || !buttons.length) return;

  const updateActive = (preset: string): void => {
    buttons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.simpleStylePreset === preset)));
  };

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const preset = button.dataset.simpleStylePreset;
      if (!preset || !Array.from(select.options).some(option => option.value === preset)) {
        announce("This style preset is not available");
        return;
      }
      select.value = preset;
      const requestChange = (window as unknown as { requestStylePresetChange?: (value: string) => void }).requestStylePresetChange;
      requestChange?.(preset);
      updateActive(preset);
      announce(`${button.textContent?.trim() ?? "Style"} selected`);
    });
  });

  select.addEventListener("change", () => updateActive(select.value));
  updateActive(select.value || "default");
}

function initializeExportChoices(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-simple-export-target]").forEach(button => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.simpleExportTarget;
      const target = targetId ? findEl<HTMLElement>(targetId) : null;
      const details = target?.closest<HTMLDetailsElement>("details");
      if (!target || !details) return;
      details.open = true;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function openLegacyTab(tabId: LegacyTabId): void {
  const options = findEl<HTMLElement>("options");
  const trigger = findEl<HTMLButtonElement>("optionsTrigger");

  if (options?.style.display === "none") trigger?.click();
  findEl<HTMLButtonElement>(tabId)?.click();
}

function clickLegacyAction(id: string): void {
  findEl<HTMLButtonElement>(id)?.click();
}

function announce(message: string): void {
  const status = findEl("simpleUiStatus");
  if (!status) return;
  status.textContent = message;
  window.setTimeout(() => {
    if (status.textContent === message) status.textContent = "";
  }, 3000);
}

function setActiveSection(section: SimpleSection): void {
  document.querySelectorAll<HTMLButtonElement>("[data-simple-section]").forEach(button => {
    const isActive = button.dataset.simpleSection === section;
    button.classList.toggle("active", isActive);
    if (isActive) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
}

function openSection(section: SimpleSection): void {
  setActiveSection(section);

  if (section === "create") openCreateWizard();
  else if (section === "edit") openLegacyTab("toolsTab");
  else if (section === "layers") openLegacyTab("layersTab");
  else if (section === "style") openLegacyTab("styleTab");
  else clickLegacyAction("exportButton");

  announce(`${SECTION_LABELS[section]} opened`);
}

function runAction(action: SimpleAction): void {
  if (action === "open") clickLegacyAction("loadButton");
  else if (action === "save") clickLegacyAction("saveButton");
  else if (action === "undo" || action === "redo") {
    const control = findEl<HTMLButtonElement>(action);
    if (!control) {
      announce(`${action === "undo" ? "Undo" : "Redo"} is available while editing terrain`);
      return;
    }
    if (control.disabled) {
      announce(`Nothing to ${action}`);
      return;
    }
    control.click();
  }
  else if (action === "new") openCreateWizard();
  else openLegacyTab("aboutTab");

  const labels: Record<SimpleAction, string> = {
    open: "Open map",
    save: "Save map",
    undo: "Undo",
    redo: "Redo",
    new: "Create map",
    help: "Help"
  };
  announce(`${labels[action]} opened`);
}

function hideStartScreen(): void {
  const startScreen = findEl<HTMLElement>("simpleStartScreen");
  if (!startScreen) return;
  startScreen.hidden = true;
  startScreen.classList.remove("is-open");
  try {
    localStorage.setItem("simpleStartSeen", "true");
  } catch {
    // Private browsing may deny localStorage. The screen can still be dismissed for this session.
  }
}

function closeCreateWizard(): void {
  const wizard = findEl<HTMLElement>("simpleCreateWizard");
  if (!wizard) return;
  wizard.hidden = true;
  wizard.replaceChildren();
}

function showStartScreen(): void {
  const startScreen = findEl<HTMLElement>("simpleStartScreen");
  if (!startScreen) return;
  startScreen.hidden = false;
  startScreen.classList.add("is-open");
}

function isVisible(element: HTMLElement | null): boolean {
  return Boolean(element && element.style.display !== "none" && element.offsetParent !== null);
}

function scheduleStartScreen(): void {
  let seen = false;
  try {
    seen = localStorage.getItem("simpleStartSeen") === "true";
  } catch {
    // Continue with an in-memory first-run experience when storage is unavailable.
  }
  if (seen) return;

  const hasUnacknowledgedUpdate = (() => {
    try {
      return !localStorage.getItem("version");
    } catch {
      return false;
    }
  })();
  const firstCheck = hasUnacknowledgedUpdate ? 9000 : 1600;

  window.setTimeout(() => {
    const alert = findEl<HTMLElement>("alert");
    if (isVisible(alert)) {
      window.setTimeout(scheduleStartScreen, 2500);
      return;
    }
    showStartScreen();
  }, firstCheck);
}

function setWizardControl(id: string, value: string): void {
  const control = findEl<HTMLInputElement | HTMLSelectElement>(id);
  if (!control) return;
  control.value = value;
  control.dispatchEvent(new Event("input", { bubbles: true }));
  control.dispatchEvent(new Event("change", { bubbles: true }));
}

function setSliderInput(id: string, value: number): void {
  const control = findEl<HTMLElement>(id);
  if (!control) return;
  (control as HTMLInputElement).value = String(value);
  control.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  control.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
}

function applyWizardState(state: CreateWizardState): void {
  setWizardControl("mapName", state.name.trim() || "My Fantasy Map");
  setWizardControl("pointsInput", state.detail === "light" ? "3" : state.detail === "rich" ? "5" : "4");
  setWizardControl("templateInput", state.preset === "islands" ? "highIsland" : "continents");
  setWizardControl("culturesInput", String(state.preset === "blank" ? 1 : state.cultures));
  setSliderInput("statesNumber", state.preset === "blank" ? 0 : state.states);
  setSliderInput("religionsNumber", state.preset === "blank" ? 0 : state.religions);

  const stylePreset = findEl<HTMLSelectElement>("stylePreset");
  if (stylePreset && Array.from(stylePreset.options).some(option => option.value === state.style)) {
    stylePreset.value = state.style;
    const styleChange = (window as unknown as { requestStylePresetChange?: (preset: string) => void })
      .requestStylePresetChange;
    styleChange?.(state.style);
  }
}

function renderWizard(state: CreateWizardState): void {
  const wizard = findEl<HTMLElement>("simpleCreateWizard");
  if (!wizard) return;

  const isLastStep = state.step === 3;
  const stepTitles = ["Choose a starting point", "Choose world detail", "Shape the world", "Finish the map"];
  const stepDescriptions = [
    "Start with a friendly default or choose a different kind of world.",
    "Keep the first map quick, or add more detail for a richer world.",
    "These values affect the new map only. You can refine them later.",
    "Choose a visual direction and give your map a name."
  ];

  let stepContent = "";
  if (state.step === 0) {
    stepContent = `
      <div class="simple-choice-grid" role="group" aria-label="Map starting point">
        <button type="button" class="simple-choice ${state.preset === "quick" ? "selected" : ""}" data-wizard-preset="quick"><strong>Quick fantasy world</strong><span>A balanced continent with familiar defaults</span></button>
        <button type="button" class="simple-choice ${state.preset === "islands" ? "selected" : ""}" data-wizard-preset="islands"><strong>Islands</strong><span>More water and separated landmasses</span></button>
        <button type="button" class="simple-choice ${state.preset === "blank" ? "selected" : ""}" data-wizard-preset="blank"><strong>Blank canvas</strong><span>A lighter starting point for your own design</span></button>
      </div>
      <label class="simple-field-label" for="simpleWizardName">Map name <span>optional</span></label>
      <input id="simpleWizardName" class="simple-field" type="text" maxlength="80" placeholder="My Fantasy Map" autocomplete="off" />
    `;
  } else if (state.step === 1) {
    stepContent = `
      <div class="simple-choice-grid simple-choice-grid-three" role="group" aria-label="World detail">
        <button type="button" class="simple-choice ${state.detail === "light" ? "selected" : ""}" data-wizard-detail="light"><strong>Light</strong><span>Fast and easy to shape</span></button>
        <button type="button" class="simple-choice ${state.detail === "standard" ? "selected" : ""}" data-wizard-detail="standard"><strong>Standard</strong><span>A balanced level of detail</span></button>
        <button type="button" class="simple-choice ${state.detail === "rich" ? "selected" : ""}" data-wizard-detail="rich"><strong>Rich</strong><span>More detail and a denser world</span></button>
      </div>
      <p class="simple-help-text">You can always change the visual style and edit the result later.</p>
    `;
  } else if (state.step === 2) {
    stepContent = `
      <div class="simple-range-field"><label for="simpleWizardCultures">Cultures <output id="simpleWizardCulturesOutput">${state.cultures}</output></label><input id="simpleWizardCultures" type="range" min="1" max="24" value="${state.cultures}" /></div>
      <div class="simple-range-field"><label for="simpleWizardStates">States <output id="simpleWizardStatesOutput">${state.states}</output></label><input id="simpleWizardStates" type="range" min="0" max="40" value="${state.states}" /></div>
      <div class="simple-range-field"><label for="simpleWizardReligions">Religions <output id="simpleWizardReligionsOutput">${state.religions}</output></label><input id="simpleWizardReligions" type="range" min="0" max="20" value="${state.religions}" /></div>
      <p class="simple-help-text">These are starting values. Advanced settings remain available after generation.</p>
    `;
  } else {
    stepContent = `
      <label class="simple-field-label" for="simpleWizardStyle">Visual style</label>
      <select id="simpleWizardStyle" class="simple-field">
        <option value="default">Classic</option>
        <option value="ancient">Ancient</option>
        <option value="watercolor">Watercolor</option>
        <option value="clean">Clean</option>
        <option value="darkSeas">Dark seas</option>
        <option value="night">Night</option>
      </select>
      <div class="simple-summary"><strong>Ready to generate</strong><span>Your map will open with the selected defaults. You can save it at any time.</span></div>
    `;
  }

  wizard.hidden = false;
  wizard.innerHTML = `
    <div class="simple-wizard-card" role="dialog" aria-modal="true" aria-labelledby="simpleWizardTitle">
      <div class="simple-wizard-header"><div><p class="simple-eyebrow">Create a new map</p><h2 id="simpleWizardTitle">${stepTitles[state.step]}</h2><p>${stepDescriptions[state.step]}</p></div><button type="button" class="simple-close-button" data-wizard-close aria-label="Close create wizard">&times;</button></div>
      <div class="simple-wizard-progress" aria-label="Create map progress"><span>Step ${state.step + 1} of 4</span><div><i style="width: ${(state.step + 1) * 25}%"></i></div></div>
      <div class="simple-wizard-content">${stepContent}</div>
      <div class="simple-wizard-footer"><button type="button" class="simple-toolbar-secondary" data-wizard-back ${state.step === 0 ? "disabled" : ""}>Back</button><button type="button" class="simple-toolbar-primary" data-wizard-next>${isLastStep ? "Generate map" : "Continue"}</button></div>
    </div>
  `;

  const nameInput = findEl<HTMLInputElement>("simpleWizardName");
  if (nameInput) nameInput.value = state.name;
  const styleInput = findEl<HTMLSelectElement>("simpleWizardStyle");
  if (styleInput) styleInput.value = state.style;

  wizard.querySelectorAll<HTMLButtonElement>("[data-wizard-preset]").forEach(button => {
    button.addEventListener("click", () => {
      state.preset = button.dataset.wizardPreset as CreateWizardState["preset"];
      if (state.preset === "blank") {
        state.detail = "light";
        state.cultures = 1;
        state.states = 0;
        state.religions = 0;
      }
      renderWizard(state);
    });
  });
  wizard.querySelectorAll<HTMLButtonElement>("[data-wizard-detail]").forEach(button => {
    button.addEventListener("click", () => {
      state.detail = button.dataset.wizardDetail as CreateWizardState["detail"];
      renderWizard(state);
    });
  });
  wizard.querySelectorAll<HTMLInputElement>("#simpleWizardCultures, #simpleWizardStates, #simpleWizardReligions").forEach(input => {
    input.addEventListener("input", () => {
      const key = input.id.replace("simpleWizard", "").toLowerCase() as "cultures" | "states" | "religions";
      state[key] = Number(input.value);
      const output = findEl(`simpleWizard${key[0].toUpperCase()}${key.slice(1)}Output`);
      if (output) output.textContent = input.value;
    });
  });
  findEl<HTMLInputElement>("simpleWizardName")?.addEventListener("input", event => {
    state.name = (event.target as HTMLInputElement).value;
  });
  findEl<HTMLSelectElement>("simpleWizardStyle")?.addEventListener("change", event => {
    state.style = (event.target as HTMLSelectElement).value;
  });
  findEl<HTMLButtonElement>("simpleWizardClose")?.addEventListener("click", closeCreateWizard);
  wizard.querySelector<HTMLButtonElement>("[data-wizard-close]")?.addEventListener("click", closeCreateWizard);
  wizard.querySelector<HTMLButtonElement>("[data-wizard-back]")?.addEventListener("click", () => {
    state.step = Math.max(0, state.step - 1);
    renderWizard(state);
  });
  wizard.querySelector<HTMLButtonElement>("[data-wizard-next]")?.addEventListener("click", () => {
    if (!isLastStep) {
      const name = findEl<HTMLInputElement>("simpleWizardName");
      if (name) state.name = name.value;
      const style = findEl<HTMLSelectElement>("simpleWizardStyle");
      if (style) state.style = style.value;
      state.step += 1;
      renderWizard(state);
      return;
    }
    applyWizardState(state);
    closeCreateWizard();
    hideStartScreen();
    clickLegacyAction("newMapButton");
  });
}

function openCreateWizard(): void {
  hideStartScreen();
  setActiveSection("create");
  renderWizard({ ...DEFAULT_WIZARD_STATE });
}

function handleStartAction(action: SimpleStartAction): void {
  if (action === "create") openCreateWizard();
  else if (action === "open") {
    hideStartScreen();
    clickLegacyAction("loadButton");
  } else if (action === "advanced") {
    hideStartScreen();
    openLegacyTab("optionsTab");
  } else hideStartScreen();
}

function initialize(): void {
  if (!findEl("simpleToolbar")) return;

  document.querySelectorAll<HTMLButtonElement>("[data-simple-section]").forEach(button => {
    button.addEventListener("click", () => openSection(button.dataset.simpleSection as SimpleSection));
  });

  document.querySelectorAll<HTMLButtonElement>("[data-simple-action]").forEach(button => {
    button.addEventListener("click", () => runAction(button.dataset.simpleAction as SimpleAction));
  });

  document.querySelectorAll<HTMLButtonElement>("[data-simple-start]").forEach(button => {
    button.addEventListener("click", () => handleStartAction(button.dataset.simpleStart as SimpleStartAction));
  });

  initializeToolFilters();
  initializeStylePresets();
  initializeExportChoices();

  ensureEl("simpleToolbar").addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    findEl<HTMLButtonElement>("optionsHide")?.click();
  });
}

initialize();
scheduleStartScreen();
