class SmartCabinetCard extends HTMLElement {
  setConfig(config) {
    this.config = {
      title: config.title || "Smart Cabinet",
      power_entity:
        config.power_entity || "switch.smart_cabinet_power",
      brightness_entity:
        config.brightness_entity ||
        "number.smart_cabinet_brightness",
      highlight_entity:
        config.highlight_entity ||
        "sensor.smart_cabinet_last_highlight",
      command_topic:
        config.command_topic ||
        "smartcabinet/cabinet01/api/command",
    };

    this._rendered = false;
  }

  set hass(hass) {
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._rendered = true;
    }

    this._update();
  }

  getCardSize() {
    return 4;
  }

  getGridOptions() {
    return {
      columns: 6,
      min_columns: 3,
      rows: 4,
      min_rows: 3,
    };
  }

  _render() {
    this.innerHTML = `
      <ha-card>
        <div class="card-content">
          <div class="header"></div>

          <div class="row power-row">
            <span>Power</span>
            <button class="power-button">Toggle</button>
          </div>

          <div class="field">
            <div class="field-label">
              <span>Brightness</span>
              <span class="brightness-value">--%</span>
            </div>
            <input
              class="brightness-slider"
              type="range"
              min="0"
              max="100"
              step="1"
            />
          </div>

          <div class="field">
            <div class="field-label">
              <span>Highlight location</span>
            </div>

            <div class="highlight-controls">
              <label>
                Shelf
                <input
                  class="shelf-input"
                  type="number"
                  min="1"
                  value="1"
                />
              </label>

              <label>
                Location
                <input
                  class="location-input"
                  type="number"
                  min="1"
                  value="1"
                />
              </label>

              <button class="highlight-button">Highlight</button>
            </div>
          </div>

          <div class="status"></div>
        </div>

        <style>
          .card-content {
            display: grid;
            gap: 18px;
          }

          .header {
            font-size: 20px;
            font-weight: 600;
          }

          .row,
          .field-label {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }

          button,
          input {
            font: inherit;
          }

          button {
            min-height: 38px;
            padding: 0 14px;
            border-radius: 10px;
            border: 1px solid var(--divider-color);
            background: var(--secondary-background-color);
            color: var(--primary-text-color);
            cursor: pointer;
          }

          .power-button.on {
            background: var(--primary-color);
            color: var(--text-primary-color);
          }

          .brightness-slider {
            width: 100%;
          }

          .highlight-controls {
            display: grid;
            grid-template-columns: 1fr 1fr auto;
            gap: 10px;
            align-items: end;
            margin-top: 8px;
          }

          label {
            display: grid;
            gap: 5px;
            font-size: 12px;
            color: var(--secondary-text-color);
          }

          input[type="number"] {
            box-sizing: border-box;
            width: 100%;
            min-height: 38px;
            padding: 6px 8px;
            border-radius: 8px;
            border: 1px solid var(--divider-color);
            background: var(--card-background-color);
            color: var(--primary-text-color);
          }

          .status {
            color: var(--secondary-text-color);
            font-size: 13px;
          }

          @media (max-width: 500px) {
            .highlight-controls {
              grid-template-columns: 1fr 1fr;
            }

            .highlight-button {
              grid-column: 1 / -1;
            }
          }
        </style>
      </ha-card>
    `;

    this.querySelector(".header").textContent = this.config.title;

    this.querySelector(".power-button").addEventListener(
      "click",
      () => this._togglePower()
    );

    this.querySelector(".brightness-slider").addEventListener(
      "change",
      (event) => this._setBrightness(event.target.value)
    );

    this.querySelector(".highlight-button").addEventListener(
      "click",
      () => this._highlight()
    );
  }

  _update() {
    if (!this._hass) {
      return;
    }

    const powerState =
      this._hass.states[this.config.power_entity];

    const brightnessState =
      this._hass.states[this.config.brightness_entity];

    const highlightState =
      this._hass.states[this.config.highlight_entity];

    const powerOn = powerState?.state === "on";
    const unavailable =
      powerState == null ||
      powerState.state === "unavailable";

    const powerButton =
      this.querySelector(".power-button");

    powerButton.textContent = powerOn ? "ON" : "OFF";
    powerButton.classList.toggle("on", powerOn);
    powerButton.disabled = unavailable;

    const brightness = Number(brightnessState?.state);
    const validBrightness = Number.isFinite(brightness)
      ? brightness
      : 0;

    this.querySelector(".brightness-slider").value =
      validBrightness;

    this.querySelector(".brightness-value").textContent =
      `${validBrightness}%`;

    const highlight =
      highlightState?.state &&
      highlightState.state !== "unknown" &&
      highlightState.state !== "unavailable"
        ? highlightState.state
        : "None";

    this.querySelector(".status").textContent =
      unavailable
        ? "Controller unavailable"
        : `Last highlight: ${highlight}`;
  }

  _togglePower() {
    const powerState =
      this._hass.states[this.config.power_entity];

    const service =
      powerState?.state === "on" ? "turn_off" : "turn_on";

    this._hass.callService("switch", service, {
      entity_id: this.config.power_entity,
    });
  }

  _setBrightness(value) {
    const brightness = Math.max(
      0,
      Math.min(100, Number(value))
    );

    this._hass.callService("number", "set_value", {
      entity_id: this.config.brightness_entity,
      value: brightness,
    });
  }

  _highlight() {
    const shelf = Number(
      this.querySelector(".shelf-input").value
    );

    const location = Number(
      this.querySelector(".location-input").value
    );

    if (
      !Number.isInteger(shelf) ||
      !Number.isInteger(location) ||
      shelf < 1 ||
      location < 1
    ) {
      return;
    }

    this._hass.callService("mqtt", "publish", {
      topic: this.config.command_topic,
      payload: JSON.stringify({
        action: "highlightLocation",
        shelf,
        location,
      }),
      qos: 0,
      retain: false,
    });
  }
}

customElements.define(
  "smart-cabinet-card",
  SmartCabinetCard
);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "smart-cabinet-card",
  name: "Smart Cabinet",
  description:
    "Basic controls for the DIY Smart Miniature Cabinet",
});
