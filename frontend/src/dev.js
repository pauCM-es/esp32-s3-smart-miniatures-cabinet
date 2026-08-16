import "./custom-panel/smart-cabinet-panel.ts";
import "./dev.css";
import { createMockHass } from "./dev/mock-hass.js";

const panel = document.querySelector("ha-panel-smart-cabinet");
const reset = document.querySelector("#reset");
const mount = () => {
  const hass = createMockHass(() => { panel.hass = hass; });
  panel.panel = { config: { command_topic: "smartcabinet/cabinet01/api/command", layout_entity: "sensor.smart_cabinet_layout", miniatures_entity: "sensor.smart_cabinet_miniatures", scene_entity: "sensor.smart_cabinet_scene", mini_lights_command_topic: "smartcabinet/cabinet01/ha/mini_lights/set" } };
  panel.narrow = window.innerWidth < 900;
  panel.hass = hass;
};
reset.addEventListener("click", mount);
window.addEventListener("resize", () => { panel.narrow = window.innerWidth < 900; });
mount();
