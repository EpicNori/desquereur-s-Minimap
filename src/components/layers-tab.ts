// Layers tab: a projection of the Layers registry. Holds the only mapping between a layer and its button.
import { type LayerId, Layers } from "@/components/layers";
import { ViewportLayers } from "@/renderers/viewport/viewport-renderer";
import { isCtrlClick } from "@/utils";
import { ensureEl, findEl } from "@/utils/nodeUtils";

interface LayerButton {
  label: string; // button text, may contain markup marking the shortcut letter
  shortcut?: string; // KeyboardEvent.code
  hint?: string; // shortcut as shown in the tip, defaults to the code without the "Key" prefix
}

const LAYER_GROUPS: Record<string, string> = {
  texture: "Terrain & climate",
  heightmap: "Terrain & climate",
  lakes: "Terrain & climate",
  biomes: "Terrain & climate",
  cells: "Terrain & climate",
  grid: "Terrain & climate",
  coordinates: "Terrain & climate",
  compass: "Terrain & climate",
  rivers: "Terrain & climate",
  relief: "Terrain & climate",
  temperature: "Terrain & climate",
  ice: "Terrain & climate",
  precipitation: "Terrain & climate",
  religions: "World & politics",
  cultures: "World & politics",
  states: "World & politics",
  provinces: "World & politics",
  zones: "World & politics",
  borders: "World & politics",
  routes: "Settlements & trade",
  goods: "Settlements & trade",
  markets: "Settlements & trade",
  trade: "Settlements & trade",
  population: "Settlements & trade",
  emblems: "Settlements & trade",
  burgIcons: "Settlements & trade",
  labels: "Settlements & trade",
  military: "Settlements & trade",
  markers: "Settlements & trade",
  rulers: "Map frame",
  scaleBar: "Map frame",
  vignette: "Map frame"
};

// only layers listed here get a button, in registry order
export const LAYER_TOGGLES = new Map<LayerId, LayerButton>([
  ["texture", { label: "Te<u>x</u>ture", shortcut: "KeyX" }],
  ["heightmap", { label: "<u>H</u>eightmap", shortcut: "KeyH" }],
  ["lakes", { label: "Lakes", shortcut: "KeyQ" }],
  ["biomes", { label: "<u>B</u>iomes", shortcut: "KeyB" }],
  ["cells", { label: "C<u>e</u>lls", shortcut: "KeyE" }],
  ["grid", { label: "Grid", shortcut: "Semicolon", hint: "; (semicolon)" }],
  ["coordinates", { label: "C<u>o</u>ordinates", shortcut: "KeyO" }],
  ["compass", { label: "<u>W</u>ind Rose", shortcut: "KeyW" }],
  ["rivers", { label: "Ri<u>v</u>ers", shortcut: "KeyV" }],
  ["relief", { label: "Relie<u>f</u>", shortcut: "KeyF" }],
  ["religions", { label: "<u>R</u>eligions", shortcut: "KeyR" }],
  ["cultures", { label: "<u>C</u>ultures", shortcut: "KeyC" }],
  ["states", { label: "<u>S</u>tates", shortcut: "KeyS" }],
  ["provinces", { label: "<u>P</u>rovinces", shortcut: "KeyP" }],
  ["zones", { label: "<u>Z</u>ones", shortcut: "KeyZ" }],
  ["borders", { label: "Bor<u>d</u>ers", shortcut: "KeyD" }],
  ["routes", { label: "Ro<u>u</u>tes", shortcut: "KeyU" }],
  ["temperature", { label: "<u>T</u>emperature", shortcut: "KeyT" }],
  ["ice", { label: "Ice", shortcut: "KeyJ" }],
  ["goods", { label: "<u>G</u>oods", shortcut: "KeyG" }],
  ["markets", { label: "Markets" }],
  ["trade", { label: "Trade", shortcut: "Backquote", hint: "` (backtick)" }],
  ["precipitation", { label: "Precipit<u>a</u>tion", shortcut: "KeyA" }],
  ["population", { label: "Populatio<u>n</u>", shortcut: "KeyN" }],
  ["emblems", { label: "Emblems", shortcut: "KeyY" }],
  ["burgIcons", { label: "<u>I</u>cons", shortcut: "KeyI" }],
  ["labels", { label: "<u>L</u>abels", shortcut: "KeyL" }],
  ["military", { label: "<u>M</u>ilitary", shortcut: "KeyM" }],
  ["markers", { label: "Mar<u>k</u>ers", shortcut: "KeyK" }],
  ["rulers", { label: "Rulers", shortcut: "Equal", hint: "= (equal sign)" }],
  ["scaleBar", { label: "Scale Bar", shortcut: "Slash", hint: "/ (slash sign)" }],
  ["vignette", { label: "Vignette", shortcut: "BracketLeft", hint: "[ (left square bracket)" }]
]);

export const getLayerByShortcut = (code: string): LayerId | undefined =>
  [...LAYER_TOGGLES].find(([, button]) => button.shortcut === code)?.[0];

function render(): void {
  const query = findEl<HTMLInputElement>("simpleLayerSearch")?.value.trim().toLowerCase() ?? "";
  const renderedGroups = new Set<string>();
  const items = Layers.all.flatMap(layer => {
      const button = LAYER_TOGGLES.get(layer.id);
      if (!button) return [];
      const group = LAYER_GROUPS[layer.id] ?? "Other layers";
      const label = button.label.replace(/<\/?.+?>/g, "");
      if (query && !`${label} ${group}`.toLowerCase().includes(query)) return [];

      const groupHeading =
        !renderedGroups.has(group)
          ? (() => {
              renderedGroups.add(group);
              const heading = document.createElement("li");
              heading.className = "layer-group-heading";
              heading.setAttribute("role", "heading");
              heading.setAttribute("aria-level", "3");
              heading.textContent = group;
              return heading;
            })()
          : null;

      const item = document.createElement("li");
      item.dataset.layer = layer.id;
      item.dataset.group = group;
      item.dataset.tip = `${label}: click to toggle, drag to raise or lower the layer. Ctrl + click to edit layer style`;
      if (button.shortcut) item.dataset.shortcut = button.hint ?? button.shortcut.replace("Key", "");
      item.innerHTML = button.label;
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");
      item.setAttribute("aria-label", `${label}, ${group}`);
      item.setAttribute("aria-pressed", String(Layers.isOn(layer.id)));
      item.classList.toggle("buttonoff", !Layers.isOn(layer.id));
      item.classList.toggle("solid", layer.params.parent !== "viewbox"); // layers outside the viewbox cannot be reordered
      return groupHeading ? [groupHeading, item] : [item];
    });

  ensureEl("mapLayers").replaceChildren(...items);
}

ensureEl("mapLayers").addEventListener("click", event => {
  const id = (event.target as HTMLElement).closest("li")?.dataset.layer;
  if (!id || !Layers.has(id)) return;

  if (isCtrlClick(event)) return void editStyle(Layers.get(id).elementId);
  Layers.toggle(id);
});

ensureEl("mapLayers").addEventListener("keydown", event => {
  if (!(event instanceof KeyboardEvent) || !["Enter", " "].includes(event.key)) return;
  const layer = (event.target as HTMLElement).closest("li[data-layer]") as HTMLElement | null;
  const id = layer?.dataset.layer;
  if (!id || !Layers.has(id)) return;
  event.preventDefault();
  Layers.toggle(id);
});

findEl<HTMLInputElement>("simpleLayerSearch")?.addEventListener("input", render);

// move layers on mapLayers dragging. TODO: deprecate jQuery
$("#mapLayers").sortable({
  items: "li[data-layer]:not(.solid)",
  containment: "parent",
  cancel: ".solid",
  update: (_event: Event, ui: { item: any }) => {
    const id = ui.item.data("layer");
    const before = ui.item.nextAll("li[data-layer]").first().data("layer");
    const thisLayer = Layers.has(id) ? id : undefined;
    const beforeLayer = Layers.has(before) ? before : undefined;
    if (thisLayer) Layers.move(thisLayer, beforeLayer);
  }
});

Layers.subscribe(render);
Layers.subscribe(() => ViewportLayers.renderNow());

// the 3d view renders the map as a texture: refresh it on any layer change, once the batch has settled
let view3dRefresh: number | undefined;
Layers.subscribe(() => {
  if (!findEl("canvas3d")) return;
  clearTimeout(view3dRefresh);
  view3dRefresh = window.setTimeout(() => void Controllers.View3d.update(), 400);
});

render();
