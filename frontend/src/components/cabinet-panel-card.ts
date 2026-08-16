import { LitElement, html } from "lit";

export class CabinetPanelCard extends LitElement {
	createRenderRoot() {
		return this;
	}
	render() {
		return html`<section class="panel-card ${this.className || ""}">
			<slot></slot>
		</section>`;
	}
}

customElements.define("cabinet-panel-card", CabinetPanelCard);
