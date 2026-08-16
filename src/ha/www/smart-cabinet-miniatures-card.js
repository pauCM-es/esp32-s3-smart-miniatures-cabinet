class o extends HTMLElement {
  setConfig(t) {
    this.config = {
      title: t.title || "Miniatures",
      catalog_entity: t.catalog_entity || "sensor.smart_cabinet_miniatures",
      command_topic: t.command_topic || "smartcabinet/cabinet01/api/command"
    }, this._editingId = null, this._rendered = !1;
  }
  set hass(t) {
    this._hass = t, this._rendered || (this._render(), this._rendered = !0), this._updateList();
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

            <label>
              Collection
              <input class="collection-input" type="text" maxlength="80" />
            </label>

            <div class="position-row">
              <label>
                Artist
                <input class="artist-input" type="text" maxlength="80" />
              </label>
              <label>
                Date
                <input class="date-input" type="text" maxlength="40" />
              </label>
            </div>

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
    `, this.querySelector(".title").textContent = this.config.title, this.querySelector(".save-button").addEventListener(
      "click",
      () => this._save()
    ), this.querySelector(".cancel-button").addEventListener(
      "click",
      () => this._resetEditor()
    );
  }
  _items() {
    const i = this._hass?.states[this.config.catalog_entity]?.attributes?.items;
    return Array.isArray(i) ? i : [];
  }
  _updateList() {
    if (!this._hass || !this._rendered)
      return;
    const t = this._items(), i = this.querySelector(".list");
    if (this.querySelector(".count").textContent = `${t.length} item${t.length === 1 ? "" : "s"}`, t.length === 0) {
      i.innerHTML = '<div class="empty">No miniatures yet.</div>';
      return;
    }
    i.innerHTML = t.map(
      (e) => `
          <div class="item" data-id="${this._escapeAttr(e.id)}">
            <div class="item-header">
              <div class="item-name">
                ${this._escapeHtml(e.name)}
              </div>
              <div class="item-position">
                Shelf ${Number(e.shelf)}
                · Location ${Number(e.location)}
              </div>
            </div>

            ${e.collection || e.artist || e.date ? `
              <div class="item-notes">
                ${[e.collection, e.artist, e.date].filter(Boolean).map((r) => this._escapeHtml(r)).join(" · ")}
              </div>` : ""}

            ${e.notes ? `<div class="item-notes">
                    ${this._escapeHtml(e.notes)}
                   </div>` : ""}

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
    ).join(""), i.querySelectorAll(".item").forEach((e) => {
      const r = e.dataset.id, a = t.find((s) => s.id === r);
      a && (e.querySelector('[data-action="highlight"]').addEventListener("click", () => this._highlight(a)), e.querySelector('[data-action="edit"]').addEventListener("click", () => this._edit(a)), e.querySelector('[data-action="delete"]').addEventListener("click", () => this._delete(a)));
    });
  }
  _save() {
    const t = this.querySelector(".name-input").value.trim(), i = this.querySelector(".collection-input").value.trim(), e = this.querySelector(".artist-input").value.trim(), r = this.querySelector(".date-input").value.trim(), a = Number(this.querySelector(".shelf-input").value), s = Number(this.querySelector(".location-input").value), n = this.querySelector(".notes-input").value.trim();
    !t || !Number.isInteger(a) || !Number.isInteger(s) || a < 1 || s < 1 || (this._editingId ? this._publish({
      action: "updateMiniature",
      id: this._editingId,
      name: t,
      collection: i,
      artist: e,
      date: r,
      shelf: a,
      location: s,
      notes: n
    }) : this._publish({
      action: "createMiniature",
      name: t,
      collection: i,
      artist: e,
      date: r,
      shelf: a,
      location: s,
      notes: n
    }), this._resetEditor());
  }
  _edit(t) {
    this._editingId = t.id, this.querySelector(".editor-title").textContent = "Edit miniature", this.querySelector(".save-button").textContent = "Save", this.querySelector(".cancel-button").hidden = !1, this.querySelector(".name-input").value = t.name || "", this.querySelector(".collection-input").value = t.collection || "", this.querySelector(".artist-input").value = t.artist || "", this.querySelector(".date-input").value = t.date || "", this.querySelector(".shelf-input").value = Number(t.shelf) || 1, this.querySelector(".location-input").value = Number(t.location) || 1, this.querySelector(".notes-input").value = t.notes || "";
  }
  _delete(t) {
    window.confirm(`Delete "${t.name}"?`) && (this._publish({
      action: "deleteMiniature",
      id: t.id
    }), this._editingId === t.id && this._resetEditor());
  }
  _highlight(t) {
    this._publish({
      action: "highlightLocation",
      shelf: Number(t.shelf),
      location: Number(t.location)
    });
  }
  _resetEditor() {
    this._editingId = null, this.querySelector(".editor-title").textContent = "Add miniature", this.querySelector(".save-button").textContent = "Add", this.querySelector(".cancel-button").hidden = !0, this.querySelector(".name-input").value = "", this.querySelector(".collection-input").value = "", this.querySelector(".artist-input").value = "", this.querySelector(".date-input").value = "", this.querySelector(".shelf-input").value = "1", this.querySelector(".location-input").value = "1", this.querySelector(".notes-input").value = "";
  }
  _publish(t) {
    this._hass.callService("mqtt", "publish", {
      topic: this.config.command_topic,
      payload: JSON.stringify(t),
      qos: 0,
      retain: !1
    });
  }
  _escapeHtml(t) {
    return String(t ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  }
  _escapeAttr(t) {
    return this._escapeHtml(t);
  }
}
customElements.define(
  "smart-cabinet-miniatures-card",
  o
);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "smart-cabinet-miniatures-card",
  name: "Smart Cabinet Miniatures",
  description: "Basic CRUD catalogue for the DIY Smart Miniature Cabinet"
});
