class SmartCabinetMiniaturesCard extends HTMLElement {
  setConfig(config) {
    this.config = {
      title: config.title || "Miniatures",
      catalog_entity:
        config.catalog_entity ||
        "sensor.smart_cabinet_miniatures",
      command_topic:
        config.command_topic ||
        "smartcabinet/cabinet01/api/command",
    };

    this._editingId = null;
    this._rendered = false;
  }

  set hass(hass) {
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._rendered = true;
    }

    this._updateList();
  }

  getCardSize() {
    return 6;
  }

  _render() {
    this.innerHTML = `
      <ha-card>
        <div class="card-content">
          <div class="title-row">
            <div class="title"></div>
            <div class="count"></div>
          </div>

          <div class="editor">
            <div class="editor-title">Add miniature</div>

            <label>
              Name
              <input class="name-input" type="text" maxlength="80" />
            </label>

            <div class="position-row">
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
            </div>

            <label>
              Notes
              <textarea
                class="notes-input"
                rows="2"
                maxlength="300"
              ></textarea>
            </label>

            <div class="editor-actions">
              <button class="cancel-button" hidden>
                Cancel
              </button>
              <button class="save-button">
                Add
              </button>
            </div>
          </div>

          <div class="list"></div>
        </div>

        <style>
          .card-content {
            display: grid;
            gap: 16px;
          }

          .title-row,
          .editor-actions,
          .item-actions {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .title-row {
            justify-content: space-between;
          }

          .title {
            font-size: 20px;
            font-weight: 600;
          }

          .count {
            color: var(--secondary-text-color);
            font-size: 13px;
          }

          .editor {
            display: grid;
            gap: 10px;
            padding: 12px;
            border: 1px solid var(--divider-color);
            border-radius: 12px;
          }

          .editor-title {
            font-weight: 600;
          }

          label {
            display: grid;
            gap: 5px;
            color: var(--secondary-text-color);
            font-size: 12px;
          }

          input,
          textarea,
          button {
            box-sizing: border-box;
            font: inherit;
          }

          input,
          textarea {
            width: 100%;
            padding: 8px 9px;
            border-radius: 8px;
            border: 1px solid var(--divider-color);
            background: var(--card-background-color);
            color: var(--primary-text-color);
          }

          textarea {
            resize: vertical;
          }

          .position-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .editor-actions {
            justify-content: flex-end;
          }

          button {
            min-height: 36px;
            padding: 0 12px;
            border-radius: 9px;
            border: 1px solid var(--divider-color);
            background: var(--secondary-background-color);
            color: var(--primary-text-color);
            cursor: pointer;
          }

          .save-button,
          .highlight-button {
            background: var(--primary-color);
            color: var(--text-primary-color);
          }

          .list {
            display: grid;
            gap: 9px;
          }

          .item {
            display: grid;
            gap: 8px;
            padding: 11px;
            border: 1px solid var(--divider-color);
            border-radius: 10px;
          }

          .item-header {
            display: flex;
            justify-content: space-between;
            gap: 12px;
          }

          .item-name {
            font-weight: 600;
          }

          .item-position,
          .item-notes,
          .empty {
            color: var(--secondary-text-color);
            font-size: 13px;
          }

          .item-actions {
            justify-content: flex-end;
            flex-wrap: wrap;
          }

          .delete-button {
            color: var(--error-color);
          }

          @media (max-width: 500px) {
            .item-actions button {
              flex: 1;
            }
          }
        </style>
      </ha-card>
    `;

    this.querySelector(".title").textContent =
      this.config.title;

    this.querySelector(".save-button").addEventListener(
      "click",
      () => this._save()
    );

    this.querySelector(".cancel-button").addEventListener(
      "click",
      () => this._resetEditor()
    );
  }

  _items() {
    const entity =
      this._hass?.states[this.config.catalog_entity];

    const items = entity?.attributes?.items;

    return Array.isArray(items) ? items : [];
  }

  _updateList() {
    if (!this._hass || !this._rendered) {
      return;
    }

    const items = this._items();
    const list = this.querySelector(".list");

    this.querySelector(".count").textContent =
      `${items.length} item${items.length === 1 ? "" : "s"}`;

    if (items.length === 0) {
      list.innerHTML =
        `<div class="empty">No miniatures yet.</div>`;
      return;
    }

    list.innerHTML = items
      .map(
        (item) => `
          <div class="item" data-id="${this._escapeAttr(item.id)}">
            <div class="item-header">
              <div class="item-name">
                ${this._escapeHtml(item.name)}
              </div>
              <div class="item-position">
                Shelf ${Number(item.shelf)}
                · Location ${Number(item.location)}
              </div>
            </div>

            ${
              item.notes
                ? `<div class="item-notes">
                    ${this._escapeHtml(item.notes)}
                   </div>`
                : ""
            }

            <div class="item-actions">
              <button
                class="highlight-button"
                data-action="highlight"
              >
                Highlight
              </button>
              <button data-action="edit">
                Edit
              </button>
              <button
                class="delete-button"
                data-action="delete"
              >
                Delete
              </button>
            </div>
          </div>
        `
      )
      .join("");

    list.querySelectorAll(".item").forEach((element) => {
      const id = element.dataset.id;
      const item = items.find((candidate) => candidate.id === id);

      if (!item) {
        return;
      }

      element
        .querySelector('[data-action="highlight"]')
        .addEventListener(
          "click",
          () => this._highlight(item)
        );

      element
        .querySelector('[data-action="edit"]')
        .addEventListener(
          "click",
          () => this._edit(item)
        );

      element
        .querySelector('[data-action="delete"]')
        .addEventListener(
          "click",
          () => this._delete(item)
        );
    });
  }

  _save() {
    const name =
      this.querySelector(".name-input").value.trim();

    const shelf = Number(
      this.querySelector(".shelf-input").value
    );

    const location = Number(
      this.querySelector(".location-input").value
    );

    const notes =
      this.querySelector(".notes-input").value.trim();

    if (
      !name ||
      !Number.isInteger(shelf) ||
      !Number.isInteger(location) ||
      shelf < 1 ||
      location < 1
    ) {
      return;
    }

    if (this._editingId) {
      this._publish({
        action: "updateMiniature",
        id: this._editingId,
        name,
        shelf,
        location,
        notes,
      });
    } else {
      this._publish({
        action: "createMiniature",
        name,
        shelf,
        location,
        notes,
      });
    }

    this._resetEditor();
  }

  _edit(item) {
    this._editingId = item.id;

    this.querySelector(".editor-title").textContent =
      "Edit miniature";

    this.querySelector(".save-button").textContent =
      "Save";

    this.querySelector(".cancel-button").hidden = false;

    this.querySelector(".name-input").value =
      item.name || "";

    this.querySelector(".shelf-input").value =
      Number(item.shelf) || 1;

    this.querySelector(".location-input").value =
      Number(item.location) || 1;

    this.querySelector(".notes-input").value =
      item.notes || "";
  }

  _delete(item) {
    const accepted = window.confirm(
      `Delete "${item.name}"?`
    );

    if (!accepted) {
      return;
    }

    this._publish({
      action: "deleteMiniature",
      id: item.id,
    });

    if (this._editingId === item.id) {
      this._resetEditor();
    }
  }

  _highlight(item) {
    this._publish({
      action: "highlightLocation",
      shelf: Number(item.shelf),
      location: Number(item.location),
    });
  }

  _resetEditor() {
    this._editingId = null;

    this.querySelector(".editor-title").textContent =
      "Add miniature";

    this.querySelector(".save-button").textContent =
      "Add";

    this.querySelector(".cancel-button").hidden = true;

    this.querySelector(".name-input").value = "";
    this.querySelector(".shelf-input").value = "1";
    this.querySelector(".location-input").value = "1";
    this.querySelector(".notes-input").value = "";
  }

  _publish(payload) {
    this._hass.callService("mqtt", "publish", {
      topic: this.config.command_topic,
      payload: JSON.stringify(payload),
      qos: 0,
      retain: false,
    });
  }

  _escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  _escapeAttr(value) {
    return this._escapeHtml(value);
  }
}

customElements.define(
  "smart-cabinet-miniatures-card",
  SmartCabinetMiniaturesCard
);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "smart-cabinet-miniatures-card",
  name: "Smart Cabinet Miniatures",
  description:
    "Basic CRUD catalogue for the DIY Smart Miniature Cabinet",
});
