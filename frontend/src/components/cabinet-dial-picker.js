import { LitElement, html } from "lit";

export class CabinetDialPicker extends LitElement {
	static properties = {
		value: { type: Number },
		total: { type: Number },
		ticks: { type: Number },
		compact: { type: Boolean },
	};
	constructor() {
		super();
		this.value = 0;
		this.total = 1;
		this.ticks = 3;
		this.compact = false;
		this._drag = null;
	}
	createRenderRoot() {
		return this;
	}
	_start(event) {
		if (event.button !== 0) return;
		this._drag = {
			pointerId: event.pointerId,
			x: event.clientX,
			value: this.value,
			steps: 0,
		};
		event.currentTarget.setPointerCapture(event.pointerId);
		this.classList.add("dragging");
	}
	_move(event) {
		if (!this._drag || event.pointerId !== this._drag.pointerId) return;
		const steps = Math.trunc((this._drag.x - event.clientX) / 36);
		if (steps === this._drag.steps) return;
		this._drag.steps = steps;
		this.dispatchEvent(
			new CustomEvent("dial-change", {
				detail: { value: this._drag.value + steps },
				bubbles: true,
				composed: true,
			}),
		);
	}
	_finish(event) {
		if (event && event.pointerId !== this._drag?.pointerId) return;
		this._drag = null;
		this.classList.remove("dragging");
	}
	render() {
		const offsets = Array.from(
			{ length: this.ticks * 2 + 1 },
			(_, index) => index - this.ticks,
		);
		return html`<div
			class="picker-dial ${this.compact ? "compact" : ""}"
			@pointerdown=${this._start}
			@pointermove=${this._move}
			@pointerup=${this._finish}
			@pointercancel=${this._finish}
			@lostpointercapture=${this._finish}>
			${offsets.map(
				(offset) =>
					html`<span class="dial-tick ${offset === 0 ? "active" : ""}"
						>${this.compact && offset === 0
							? html`<em>LOCATION</em>`
							: ""}<i></i
						><b
							>${((((this.value + offset) % this.total) +
								this.total) %
								this.total) +
							1}</b
						></span
					>`,
			)}
		</div>`;
	}
}

customElements.define("cabinet-dial-picker", CabinetDialPicker);
