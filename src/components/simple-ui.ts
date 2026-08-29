import { ensureEl, findEl } from "@/utils";

type LegacyTabId = "optionsTab" | "toolsTab" | "layersTab" | "styleTab" | "aboutTab";
type SimpleSection = "create" | "edit" | "layers" | "style" | "save-export";
type SimpleAction = "open" | "save" | "new" | "help";

const SECTION_LABELS: Record<SimpleSection, string> = {
  create: "Create",
  edit: "Edit",
  layers: "Layers",
  style: "Style",
  "save-export": "Save & Export"
};

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

  if (section === "create") openLegacyTab("optionsTab");
  else if (section === "edit") openLegacyTab("toolsTab");
  else if (section === "layers") openLegacyTab("layersTab");
  else if (section === "style") openLegacyTab("styleTab");
  else clickLegacyAction("exportButton");

  announce(`${SECTION_LABELS[section]} opened`);
}

function runAction(action: SimpleAction): void {
  if (action === "open") clickLegacyAction("loadButton");
  else if (action === "save") clickLegacyAction("saveButton");
  else if (action === "new") clickLegacyAction("newMapButton");
  else openLegacyTab("aboutTab");

  const labels: Record<SimpleAction, string> = {
    open: "Open map",
    save: "Save map",
    new: "Create map",
    help: "Help"
  };
  announce(`${labels[action]} opened`);
}

function initialize(): void {
  if (!findEl("simpleToolbar")) return;

  document.querySelectorAll<HTMLButtonElement>("[data-simple-section]").forEach(button => {
    button.addEventListener("click", () => openSection(button.dataset.simpleSection as SimpleSection));
  });

  document.querySelectorAll<HTMLButtonElement>("[data-simple-action]").forEach(button => {
    button.addEventListener("click", () => runAction(button.dataset.simpleAction as SimpleAction));
  });

  ensureEl("simpleToolbar").addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    findEl<HTMLButtonElement>("optionsHide")?.click();
  });
}

initialize();
