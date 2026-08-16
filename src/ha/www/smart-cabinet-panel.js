const D = globalThis, q = D.ShadowRoot && (D.ShadyCSS === void 0 || D.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ut = /* @__PURE__ */ Symbol(), J = /* @__PURE__ */ new WeakMap();
let St = class {
  constructor(t, i, a) {
    if (this._$cssResult$ = !0, a !== ut) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = i;
  }
  get styleSheet() {
    let t = this.o;
    const i = this.t;
    if (q && t === void 0) {
      const a = i !== void 0 && i.length === 1;
      a && (t = J.get(i)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), a && J.set(i, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const mt = (e) => new St(typeof e == "string" ? e : e + "", void 0, ut), kt = (e, t) => {
  if (q) e.adoptedStyleSheets = t.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of t) {
    const a = document.createElement("style"), r = D.litNonce;
    r !== void 0 && a.setAttribute("nonce", r), a.textContent = i.cssText, e.appendChild(a);
  }
}, G = q ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let i = "";
  for (const a of t.cssRules) i += a.cssText;
  return mt(i);
})(e) : e;
const { is: Mt, defineProperty: At, getOwnPropertyDescriptor: Ct, getOwnPropertyNames: Pt, getOwnPropertySymbols: Et, getPrototypeOf: Tt } = Object, O = globalThis, tt = O.trustedTypes, Lt = tt ? tt.emptyScript : "", zt = O.reactiveElementPolyfillSupport, C = (e, t) => e, V = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? Lt : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let i = e;
  switch (t) {
    case Boolean:
      i = e !== null;
      break;
    case Number:
      i = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        i = JSON.parse(e);
      } catch {
        i = null;
      }
  }
  return i;
} }, gt = (e, t) => !Mt(e, t), et = { attribute: !0, type: String, converter: V, reflect: !1, useDefault: !1, hasChanged: gt };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), O.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let w = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, i = et) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(t, i), !i.noAccessor) {
      const a = /* @__PURE__ */ Symbol(), r = this.getPropertyDescriptor(t, a, i);
      r !== void 0 && At(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, i, a) {
    const { get: r, set: o } = Ct(this.prototype, t) ?? { get() {
      return this[i];
    }, set(s) {
      this[i] = s;
    } };
    return { get: r, set(s) {
      const c = r?.call(this);
      o?.call(this, s), this.requestUpdate(t, c, a);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? et;
  }
  static _$Ei() {
    if (this.hasOwnProperty(C("elementProperties"))) return;
    const t = Tt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(C("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(C("properties"))) {
      const i = this.properties, a = [...Pt(i), ...Et(i)];
      for (const r of a) this.createProperty(r, i[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const i = litPropertyMetadata.get(t);
      if (i !== void 0) for (const [a, r] of i) this.elementProperties.set(a, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [i, a] of this.elementProperties) {
      const r = this._$Eu(i, a);
      r !== void 0 && this._$Eh.set(r, i);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const i = [];
    if (Array.isArray(t)) {
      const a = new Set(t.flat(1 / 0).reverse());
      for (const r of a) i.unshift(G(r));
    } else t !== void 0 && i.push(G(t));
    return i;
  }
  static _$Eu(t, i) {
    const a = i.attribute;
    return a === !1 ? void 0 : typeof a == "string" ? a : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), i = this.constructor.elementProperties;
    for (const a of i.keys()) this.hasOwnProperty(a) && (t.set(a, this[a]), delete this[a]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return kt(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, i, a) {
    this._$AK(t, a);
  }
  _$ET(t, i) {
    const a = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, a);
    if (r !== void 0 && a.reflect === !0) {
      const o = (a.converter?.toAttribute !== void 0 ? a.converter : V).toAttribute(i, a.type);
      this._$Em = t, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(t, i) {
    const a = this.constructor, r = a._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const o = a.getPropertyOptions(r), s = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : V;
      this._$Em = r;
      const c = s.fromAttribute(i, o.type);
      this[r] = c ?? this._$Ej?.get(r) ?? c, this._$Em = null;
    }
  }
  requestUpdate(t, i, a, r = !1, o) {
    if (t !== void 0) {
      const s = this.constructor;
      if (r === !1 && (o = this[t]), a ??= s.getPropertyOptions(t), !((a.hasChanged ?? gt)(o, i) || a.useDefault && a.reflect && o === this._$Ej?.get(t) && !this.hasAttribute(s._$Eu(t, a)))) return;
      this.C(t, i, a);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, i, { useDefault: a, reflect: r, wrapped: o }, s) {
    a && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, s ?? i ?? this[t]), o !== !0 || s !== void 0) || (this._$AL.has(t) || (this.hasUpdated || a || (i = void 0), this._$AL.set(t, i)), r === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (i) {
      Promise.reject(i);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [r, o] of this._$Ep) this[r] = o;
        this._$Ep = void 0;
      }
      const a = this.constructor.elementProperties;
      if (a.size > 0) for (const [r, o] of a) {
        const { wrapped: s } = o, c = this[r];
        s !== !0 || this._$AL.has(r) || c === void 0 || this.C(r, void 0, o, c);
      }
    }
    let t = !1;
    const i = this._$AL;
    try {
      t = this.shouldUpdate(i), t ? (this.willUpdate(i), this._$EO?.forEach((a) => a.hostUpdate?.()), this.update(i)) : this._$EM();
    } catch (a) {
      throw t = !1, this._$EM(), a;
    }
    t && this._$AE(i);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((i) => i.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((i) => this._$ET(i, this[i])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
w.elementStyles = [], w.shadowRootOptions = { mode: "open" }, w[C("elementProperties")] = /* @__PURE__ */ new Map(), w[C("finalized")] = /* @__PURE__ */ new Map(), zt?.({ ReactiveElement: w }), (O.reactiveElementVersions ??= []).push("2.1.2");
const K = globalThis, it = (e) => e, N = K.trustedTypes, at = N ? N.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, bt = "$lit$", f = `lit$${Math.random().toFixed(9).slice(2)}$`, ft = "?" + f, It = `<${ft}>`, y = document, P = () => y.createComment(""), E = (e) => e === null || typeof e != "object" && typeof e != "function", Z = Array.isArray, Dt = (e) => Z(e) || typeof e?.[Symbol.iterator] == "function", U = `[ 	
\f\r]`, A = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, rt = /-->/g, ot = />/g, x = RegExp(`>|${U}(?:([^\\s"'>=/]+)(${U}*=${U}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), st = /'/g, nt = /"/g, vt = /^(?:script|style|textarea|title)$/i, Nt = (e) => (t, ...i) => ({ _$litType$: e, strings: t, values: i }), l = Nt(1), S = /* @__PURE__ */ Symbol.for("lit-noChange"), u = /* @__PURE__ */ Symbol.for("lit-nothing"), lt = /* @__PURE__ */ new WeakMap(), _ = y.createTreeWalker(y, 129);
function xt(e, t) {
  if (!Z(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return at !== void 0 ? at.createHTML(t) : t;
}
const Ht = (e, t) => {
  const i = e.length - 1, a = [];
  let r, o = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", s = A;
  for (let c = 0; c < i; c++) {
    const n = e[c];
    let d, h, p = -1, g = 0;
    for (; g < n.length && (s.lastIndex = g, h = s.exec(n), h !== null); ) g = s.lastIndex, s === A ? h[1] === "!--" ? s = rt : h[1] !== void 0 ? s = ot : h[2] !== void 0 ? (vt.test(h[2]) && (r = RegExp("</" + h[2], "g")), s = x) : h[3] !== void 0 && (s = x) : s === x ? h[0] === ">" ? (s = r ?? A, p = -1) : h[1] === void 0 ? p = -2 : (p = s.lastIndex - h[2].length, d = h[1], s = h[3] === void 0 ? x : h[3] === '"' ? nt : st) : s === nt || s === st ? s = x : s === rt || s === ot ? s = A : (s = x, r = void 0);
    const b = s === x && e[c + 1].startsWith("/>") ? " " : "";
    o += s === A ? n + It : p >= 0 ? (a.push(d), n.slice(0, p) + bt + n.slice(p) + f + b) : n + f + (p === -2 ? c : b);
  }
  return [xt(e, o + (e[i] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), a];
};
class T {
  constructor({ strings: t, _$litType$: i }, a) {
    let r;
    this.parts = [];
    let o = 0, s = 0;
    const c = t.length - 1, n = this.parts, [d, h] = Ht(t, i);
    if (this.el = T.createElement(d, a), _.currentNode = this.el.content, i === 2 || i === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (r = _.nextNode()) !== null && n.length < c; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const p of r.getAttributeNames()) if (p.endsWith(bt)) {
          const g = h[s++], b = r.getAttribute(p).split(f), z = /([.?@])?(.*)/.exec(g);
          n.push({ type: 1, index: o, name: z[2], strings: b, ctor: z[1] === "." ? Ot : z[1] === "?" ? Rt : z[1] === "@" ? Ut : R }), r.removeAttribute(p);
        } else p.startsWith(f) && (n.push({ type: 6, index: o }), r.removeAttribute(p));
        if (vt.test(r.tagName)) {
          const p = r.textContent.split(f), g = p.length - 1;
          if (g > 0) {
            r.textContent = N ? N.emptyScript : "";
            for (let b = 0; b < g; b++) r.append(p[b], P()), _.nextNode(), n.push({ type: 2, index: ++o });
            r.append(p[g], P());
          }
        }
      } else if (r.nodeType === 8) if (r.data === ft) n.push({ type: 2, index: o });
      else {
        let p = -1;
        for (; (p = r.data.indexOf(f, p + 1)) !== -1; ) n.push({ type: 7, index: o }), p += f.length - 1;
      }
      o++;
    }
  }
  static createElement(t, i) {
    const a = y.createElement("template");
    return a.innerHTML = t, a;
  }
}
function k(e, t, i = e, a) {
  if (t === S) return t;
  let r = a !== void 0 ? i._$Co?.[a] : i._$Cl;
  const o = E(t) ? void 0 : t._$litDirective$;
  return r?.constructor !== o && (r?._$AO?.(!1), o === void 0 ? r = void 0 : (r = new o(e), r._$AT(e, i, a)), a !== void 0 ? (i._$Co ??= [])[a] = r : i._$Cl = r), r !== void 0 && (t = k(e, r._$AS(e, t.values), r, a)), t;
}
class Bt {
  constructor(t, i) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = i;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: i }, parts: a } = this._$AD, r = (t?.creationScope ?? y).importNode(i, !0);
    _.currentNode = r;
    let o = _.nextNode(), s = 0, c = 0, n = a[0];
    for (; n !== void 0; ) {
      if (s === n.index) {
        let d;
        n.type === 2 ? d = new L(o, o.nextSibling, this, t) : n.type === 1 ? d = new n.ctor(o, n.name, n.strings, this, t) : n.type === 6 && (d = new jt(o, this, t)), this._$AV.push(d), n = a[++c];
      }
      s !== n?.index && (o = _.nextNode(), s++);
    }
    return _.currentNode = y, r;
  }
  p(t) {
    let i = 0;
    for (const a of this._$AV) a !== void 0 && (a.strings !== void 0 ? (a._$AI(t, a, i), i += a.strings.length - 2) : a._$AI(t[i])), i++;
  }
}
class L {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, i, a, r) {
    this.type = 2, this._$AH = u, this._$AN = void 0, this._$AA = t, this._$AB = i, this._$AM = a, this.options = r, this._$Cv = r?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const i = this._$AM;
    return i !== void 0 && t?.nodeType === 11 && (t = i.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, i = this) {
    t = k(this, t, i), E(t) ? t === u || t == null || t === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : t !== this._$AH && t !== S && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Dt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== u && E(this._$AH) ? this._$AA.nextSibling.data = t : this.T(y.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: i, _$litType$: a } = t, r = typeof a == "number" ? this._$AC(t) : (a.el === void 0 && (a.el = T.createElement(xt(a.h, a.h[0]), this.options)), a);
    if (this._$AH?._$AD === r) this._$AH.p(i);
    else {
      const o = new Bt(r, this), s = o.u(this.options);
      o.p(i), this.T(s), this._$AH = o;
    }
  }
  _$AC(t) {
    let i = lt.get(t.strings);
    return i === void 0 && lt.set(t.strings, i = new T(t)), i;
  }
  k(t) {
    Z(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let a, r = 0;
    for (const o of t) r === i.length ? i.push(a = new L(this.O(P()), this.O(P()), this, this.options)) : a = i[r], a._$AI(o), r++;
    r < i.length && (this._$AR(a && a._$AB.nextSibling, r), i.length = r);
  }
  _$AR(t = this._$AA.nextSibling, i) {
    for (this._$AP?.(!1, !0, i); t !== this._$AB; ) {
      const a = it(t).nextSibling;
      it(t).remove(), t = a;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class R {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, i, a, r, o) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = t, this.name = i, this._$AM = r, this.options = o, a.length > 2 || a[0] !== "" || a[1] !== "" ? (this._$AH = Array(a.length - 1).fill(new String()), this.strings = a) : this._$AH = u;
  }
  _$AI(t, i = this, a, r) {
    const o = this.strings;
    let s = !1;
    if (o === void 0) t = k(this, t, i, 0), s = !E(t) || t !== this._$AH && t !== S, s && (this._$AH = t);
    else {
      const c = t;
      let n, d;
      for (t = o[0], n = 0; n < o.length - 1; n++) d = k(this, c[a + n], i, n), d === S && (d = this._$AH[n]), s ||= !E(d) || d !== this._$AH[n], d === u ? t = u : t !== u && (t += (d ?? "") + o[n + 1]), this._$AH[n] = d;
    }
    s && !r && this.j(t);
  }
  j(t) {
    t === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Ot extends R {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === u ? void 0 : t;
  }
}
class Rt extends R {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== u);
  }
}
class Ut extends R {
  constructor(t, i, a, r, o) {
    super(t, i, a, r, o), this.type = 5;
  }
  _$AI(t, i = this) {
    if ((t = k(this, t, i, 0) ?? u) === S) return;
    const a = this._$AH, r = t === u && a !== u || t.capture !== a.capture || t.once !== a.once || t.passive !== a.passive, o = t !== u && (a === u || r);
    r && this.element.removeEventListener(this.name, this, a), o && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class jt {
  constructor(t, i, a) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = a;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    k(this, t);
  }
}
const Vt = K.litHtmlPolyfillSupport;
Vt?.(T, L), (K.litHtmlVersions ??= []).push("3.3.3");
const Ft = (e, t, i) => {
  const a = i?.renderBefore ?? t;
  let r = a._$litPart$;
  if (r === void 0) {
    const o = i?.renderBefore ?? null;
    a._$litPart$ = r = new L(t.insertBefore(P(), o), o, void 0, i ?? {});
  }
  return r._$AI(e), r;
};
const W = globalThis;
class $ extends w {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const i = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Ft(i, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return S;
  }
}
$._$litElement$ = !0, $.finalized = !0, W.litElementHydrateSupport?.({ LitElement: $ });
const qt = W.litElementPolyfillSupport;
qt?.({ LitElement: $ });
(W.litElementVersions ??= []).push("4.2.2");
class Kt extends $ {
  createRenderRoot() {
    return this;
  }
  render() {
    return l`<section class="panel-card ${this.className || ""}">
			<slot></slot>
		</section>`;
  }
}
customElements.define("cabinet-panel-card", Kt);
const ct = (e, t) => e.shadowRoot?.querySelector(t)?.value, Zt = (e) => ({
  setHighlightColor: (t) => e._command({ action: "setHighlightColor", ...e._hexToRgb(t) }),
  selectShelf: (t) => {
    e._selectedShelf = t, e._selectedLocation = 1, e._render();
  },
  selectLocation: async (t) => {
    e._selectedLocation = t, await e._command({
      action: "highlightLocation",
      shelf: e._selectedShelf,
      location: t
    }), e._render();
  },
  insertShelf: (t) => e._command({ action: "insertShelf", position: t }),
  duplicateShelf: (t) => e._command({ action: "duplicateShelf", shelf: t }),
  deleteShelf: async (t) => {
    confirm(
      `Delete Shelf ${t}? Miniatures on it will become Unassigned.`
    ) && await e._command({ action: "deleteShelf", shelf: t });
  },
  moveShelf: async (t, i) => {
    await e._command({ action: "moveShelf", from: t, to: i }), e._selectedShelf = i;
  },
  saveShelf: () => e._command({
    action: "setShelfConfig",
    shelf: e._selectedShelf,
    total_leds: Number(ct(e, "#shelf-leds")),
    total_locations: Number(ct(e, "#shelf-locations"))
  }),
  autoMap: () => e._command({ action: "autoMapShelf", shelf: e._selectedShelf }),
  clearMap: async () => {
    confirm("Clear every location mapping on this shelf?") && await e._command({
      action: "clearShelfMapping",
      shelf: e._selectedShelf
    });
  },
  toggleDirection: () => {
    const t = e._layout.shelves?.[e._selectedShelf - 1];
    return e._command({
      action: "setShelfDirection",
      shelf: e._selectedShelf,
      mirrored: !t?.mirrored
    });
  },
  zoom: (t) => {
    e._ledZoom = Math.min(2, Math.max(0.5, e._ledZoom + t)), e._render();
  },
  setShowAllMappings: (t) => {
    e._showAllMappings = t, e._render();
  },
  selectMappingLocation: (t, i) => {
    e._selectedLocation = (t % i + i) % i + 1, e._mappingStart = null, e._mappingEnd = null, e._render(), e._scheduleMappingHighlight();
  },
  selectLed: async (t) => {
    if (e._mappingStart === null || e._mappingEnd !== null)
      e._mappingStart = t, e._mappingEnd = null;
    else {
      e._mappingEnd = t;
      const i = Math.min(e._mappingStart, e._mappingEnd);
      await e._command({
        action: "previewLocation",
        shelf: e._selectedShelf,
        location: e._selectedLocation,
        start_led: i,
        leds: Math.abs(e._mappingEnd - e._mappingStart) + 1
      });
    }
    e._render();
  },
  resetLedRange: async () => {
    e._mappingStart = null, e._mappingEnd = null, await e._command({
      action: "highlightLocation",
      shelf: e._selectedShelf,
      location: e._selectedLocation
    }), e._render();
  },
  saveLedRange: async () => {
    const t = e._mappingStart, i = e._mappingEnd;
    if (t === null || i === null) return;
    const a = Math.min(t, i);
    await e._command({
      action: "setLocationConfig",
      shelf: e._selectedShelf,
      location: e._selectedLocation,
      start_led: a,
      leds: Math.abs(i - t) + 1
    }), e._mappingStart = null, e._mappingEnd = null;
  },
  editMini: (t) => {
    e._editingMiniId = t, e._addingMini = !1, e._render();
  },
  addMini: () => {
    e._editingMiniId = null, e._addingMini = !0, e._render();
  },
  cancelMini: () => {
    e._editingMiniId = null, e._addingMini = !1, e._render();
  },
  saveMini: () => e._saveMini(),
  deleteMini: async (t) => {
    const i = e._miniatures.find((a) => a.id === t);
    confirm(`Delete ${i?.name || "this miniature"}?`) && await e._command({ action: "deleteMiniature", id: t });
  },
  highlightOne: (t) => {
    const i = e._miniatures.find((a) => a.id === t);
    return i?.shelf ? e._command({
      action: "highlightLocation",
      shelf: i.shelf,
      location: i.location
    }) : void 0;
  },
  setViewIndex: (t) => e._setViewIndex(t),
  clearViewHighlight: async () => {
    e._viewTimer !== null && clearTimeout(e._viewTimer), await e._command({ action: "clearHighlight" });
  },
  applyScene: async (t) => {
    e._viewTimer !== null && clearTimeout(e._viewTimer), await e._command({ action: "applyScene", scene: t });
  },
  setCabinetPower: (t) => e._setCabinetPower(t),
  setCabinetBrightness: (t) => e._setCabinetBrightness(t),
  setMiniatureLights: (t) => e._setMiniatureLights(t),
  openPaletteEditor: () => e._openPaletteEditor(),
  closePaletteEditor: () => e._closePaletteEditor(),
  selectPaletteColor: (t) => e._selectPaletteColor(t),
  setPaletteColor: (t) => e._setPaletteColor(t),
  addPaletteColor: () => e._addPaletteColor(),
  removePaletteColor: (t) => e._removePaletteColor(t),
  startPaletteDrag: (t, i) => e._startPaletteDrag(t, i),
  dropPaletteColor: (t, i) => e._dropPaletteColor(t, i),
  finishPaletteDrag: () => e._finishPaletteDrag(),
  setSearchQuery: (t) => {
    e._searchQuery = t, e._render(), e._scheduleSearch();
  },
  setSearchField: (t) => {
    e._searchField = t, e._render(), e._scheduleSearch();
  },
  setSort: (t, i) => {
    e[t] = i, e._render();
  },
  setCatalogueView: (t) => {
    e._catalogueView = t, e._render();
  },
  selectSummaryLocation: (t, i) => e._selectSummaryLocation(t, i),
  startSummaryMove: () => e._startSummaryMove()
}), M = (e) => e !== null && typeof e == "object" ? e : {}, Q = (e) => Array.isArray(e) ? e : [], Wt = (e, t = 0) => {
  const i = Number(e);
  return Number.isFinite(i) ? i : t;
}, m = (e, t = 0) => Math.trunc(Wt(e, t)), F = (e, t = "") => typeof e == "string" ? e : t, I = (e) => F(e) || void 0, Qt = (e) => {
  const t = M(e);
  if (!(!("r" in t) || !("g" in t) || !("b" in t)))
    return {
      r: m(t.r),
      g: m(t.g),
      b: m(t.b)
    };
}, Yt = (e, t) => {
  const i = M(e);
  return {
    location: m(i.location, t + 1),
    start_led: m(i.start_led),
    leds: Math.max(0, m(i.leds)),
    mapped: !!i.mapped
  };
}, Xt = (e, t) => {
  const i = M(e);
  return {
    shelf: m(i.shelf, t + 1),
    total_leds: Math.max(0, m(i.total_leds)),
    total_locations: Math.max(0, m(i.total_locations)),
    mirrored: !!i.mirrored,
    locations: Q(i.locations).map(Yt)
  };
}, Jt = (e) => {
  const t = M(e), i = Q(t.shelves).map(Xt);
  return {
    shelf_count: m(t.shelf_count, i.length),
    highlight_color: Qt(t.highlight_color),
    shelves: i
  };
}, Gt = (e) => {
  const t = M(e);
  return {
    id: F(t.id),
    name: F(t.name),
    collection: I(t.collection),
    artist: I(t.artist),
    date: I(t.date),
    shelf: m(t.shelf),
    location: m(t.location),
    notes: I(t.notes)
  };
}, te = (e) => {
  const t = M(e);
  return Q(t.items).map(Gt);
}, j = [
  "#ff8a00",
  "#ffbd89",
  "#ffe1ca",
  "#ffffff",
  "#7ca6f8",
  "#c87ded",
  "#ef8fe1",
  "#ff6e5d"
], ee = (e, t) => {
  const i = (e % 360 + 360) % 360, r = Math.max(0, Math.min(1, t)), o = r * (1 - Math.abs(i / 60 % 2 - 1)), s = 1 - r, [c, n, d] = i < 60 ? [r, o, 0] : i < 120 ? [o, r, 0] : i < 180 ? [0, r, o] : i < 240 ? [0, o, r] : i < 300 ? [o, 0, r] : [r, 0, o], h = (p) => Math.round(p * 255).toString(16).padStart(2, "0");
  return `#${h(c + s)}${h(n + s)}${h(d + s)}`;
}, v = (e) => e.shelf > 0 && e.location > 0, ie = (e) => e.filter(
  (t) => t.name || t.collection || t.artist || v(t)
), _t = (e, t, i) => {
  const a = t.trim().toLocaleLowerCase();
  if (!a) return [];
  const r = i === "all" ? ["name", "collection", "artist"] : [i];
  return e.filter(
    (o) => r.some(
      (s) => String(o[s] || "").toLocaleLowerCase().includes(a)
    )
  );
}, Y = (e, t) => `${e}:${t}`, ae = (e) => new Map(
  e.map((t) => [Y(t.shelf, t.location), t])
), re = (e) => e.locations.filter((t) => t.mapped), oe = (e) => {
  const t = /* @__PURE__ */ new Set();
  for (const i of e.locations)
    if (i.mapped)
      for (let a = 0; a < i.leds; a += 1)
        t.add(i.start_led + a);
  return t;
}, dt = ':host{display:block;min-height:100%;background:var(--primary-background-color);color:var(--primary-text-color);font-family:var(--paper-font-body1_-_font-family, Roboto, sans-serif)}cabinet-dial-picker,cabinet-panel-card{display:block}*{box-sizing:border-box}button,input,select{font:inherit}button{cursor:pointer}button:disabled{cursor:not-allowed;opacity:.42}.app-shell{min-height:100vh;overflow-x:hidden;padding-bottom:env(safe-area-inset-bottom,0px)}.topbar{position:sticky;top:0;z-index:4;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:14px 28px;border-bottom:1px solid var(--divider-color);background:var( --app-header-background-color, var(--card-background-color) );box-shadow:0 1px 8px #0000000f}.topbar-main{display:flex;align-items:center;gap:10px;min-width:0}.ha-native-menu{flex:0 0 auto;margin-left:-6px}.brand{display:flex;align-items:center;gap:11px;min-width:190px}.brand-icon{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;background:var(--primary-color);color:var(--text-primary-color);font-weight:800;font-size:13px}.brand b,.brand span{display:block}.brand span{margin-top:2px;color:var(--secondary-text-color);font-size:12px}nav{display:flex;gap:4px;padding:4px;border-radius:12px;background:var(--secondary-background-color)}.nav-tab{display:grid;place-items:center;width:42px;height:38px;border:0;background:transparent;color:var(--secondary-text-color);padding:0;border-radius:9px}.nav-tab svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.nav-tab.active{background:var(--card-background-color);color:var(--primary-text-color);box-shadow:0 1px 4px #00000017}.page{max-width:1500px;margin:0 auto;overflow-x:hidden;padding:28px}.panel-card{border:1px solid var(--divider-color);background:var(--card-background-color);border-radius:18px;box-shadow:var(--ha-card-box-shadow, 0 2px 8px rgba(0, 0, 0, .04))}.general-card{display:flex;justify-content:space-between;align-items:center;gap:30px;padding:22px 24px;margin-bottom:18px}h2,h3,p{margin:0}h2{font-size:22px}h3{font-size:16px}p{margin-top:6px;color:var(--secondary-text-color);font-size:13px;line-height:1.5}.eyebrow{margin-bottom:5px;color:var(--primary-color);font-size:10px;letter-spacing:.12em;font-weight:800}.general-values{display:flex;align-items:center;gap:12px}.metric,.color-control{min-width:110px;padding:10px 13px;background:var(--secondary-background-color);border-radius:12px}.metric span,.color-control span{display:block;color:var(--secondary-text-color);font-size:11px;margin-bottom:5px}.metric b{font-size:20px}.color-control{display:grid;grid-template-columns:1fr auto;column-gap:12px;align-items:center;min-width:170px}.color-control span{margin:0}input[type=color]{width:34px;height:28px;border:0;padding:0;background:none}.configuration-grid{display:grid;grid-template-columns:300px minmax(0,1fr);min-width:0;gap:18px;align-items:start}.shelf-detail{min-width:0;overflow:hidden}.shelf-list,.shelf-detail,.mini-editor,.mini-list-card,.search-card{padding:20px}.section-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}.shelf-items{display:grid;gap:5px}.shelf-row{display:flex;align-items:center;border:1px solid transparent;border-radius:12px;background:var(--secondary-background-color)}.shelf-row.selected{border-color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 10%,var(--card-background-color))}.shelf-select{flex:1;display:flex;align-items:center;gap:10px;text-align:left;padding:10px;border:0;color:inherit;background:transparent}.shelf-select span:last-child{min-width:0}.shelf-select b,.shelf-select small{display:block}.shelf-select small{margin-top:2px;color:var(--secondary-text-color);font-size:10px}.shelf-number,.location-index{display:grid;place-items:center;flex:0 0 32px;height:32px;border-radius:9px;background:var(--card-background-color);font-weight:700;font-size:12px}.row-actions{display:flex;gap:4px;padding-right:7px}.icon-button{width:28px;height:28px;padding:0;border:0;border-radius:8px;background:var(--card-background-color);color:inherit}.insert-shelf{width:100%;border:0;background:transparent;color:var(--primary-color);padding:4px;font-size:10px;opacity:.65}.insert-shelf:hover{opacity:1}.form-grid{display:grid;gap:12px;margin-top:16px}.form-grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}label span{display:block;margin-bottom:6px;color:var(--secondary-text-color);font-size:11px;font-weight:600}input,select{width:100%;min-height:40px;border:1px solid var(--divider-color);border-radius:10px;padding:8px 10px;background:var(--primary-background-color);color:var(--primary-text-color);outline:none}input:focus,select:focus{border-color:var(--primary-color);box-shadow:0 0 0 2px color-mix(in srgb,var(--primary-color) 20%,transparent)}.button-row{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}.button-row.end{justify-content:flex-end}button:not(.nav-tab):not(.shelf-select):not(.icon-button):not(.insert-shelf):not(.location-row):not(.search-result):not(.summary-hex):not(.pwm-bulb):not(.ha-power-toggle):not(.color-swatch):not(.palette-editor-swatch):not(.palette-remove){min-height:38px;border:1px solid var(--divider-color);border-radius:10px;padding:0 13px;background:var(--secondary-background-color);color:var(--primary-text-color)}button.primary{border-color:var(--primary-color)!important;background:var(--primary-color)!important;color:var(--text-primary-color)!important}button.small{min-height:32px!important;font-size:11px}button.ghost{background:transparent!important}button.danger{color:var(--error-color)!important}button.full{width:100%;margin-top:14px}.divider{height:1px;background:var(--divider-color);margin:22px 0}.locations-layout{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(260px,.75fr);gap:18px}.legacy-mapping{display:none}.mapping-visual{min-width:0}.mapping-toggle{display:flex;align-items:center;gap:7px;color:var(--secondary-text-color);font-size:11px}.mapping-toggle input{width:auto;min-height:auto;accent-color:var(--primary-color)}.picker-dial.compact{margin:10px 0 14px;min-height:48px}.picker-dial.compact .dial-tick em{display:none}.picker-dial.compact .dial-tick.active b{font-size:22px}.mapping-dial-selected{display:grid;place-items:center;height:32px;margin:4px 0 2px;color:var(--primary-color);font-size:32px;font-weight:800;line-height:1}.picker-dial.compact .dial-tick.active b{visibility:hidden}.mapping-tools{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mapping-tools b{margin-left:auto;color:var(--secondary-text-color);font-size:11px}.mapping-range{margin-left:auto;padding:8px 10px;border:1px solid var(--divider-color);border-radius:9px;color:var(--primary-text-color);font-size:11px;font-weight:700}.mapping-range span{margin-left:6px;color:var(--secondary-text-color);font-weight:600}.led-runs{display:grid;gap:20px;max-width:100%;margin-top:16px;overflow-x:auto;padding:4px 0 20px}.led-run{display:grid;grid-auto-flow:column;grid-auto-columns:var(--led-size);width:max-content;min-height:calc(var(--led-size) + 18px)}.led-run.return{margin-left:0}.led-cell{position:relative;width:var(--led-size);height:var(--led-size);min-width:var(--led-size);padding:0;border:1px solid var(--divider-color);border-radius:1px;background:var(--secondary-background-color)}.led-cell.selected{background:#fff;border-color:#fff}.led-cell.assigned{background:color-mix(in srgb,var(--primary-color) 35%,var(--secondary-background-color))}.led-cell.range-start{background:#e83e8c;border-color:#e83e8c}.led-cell.range-end{background:#ff8a00;border-color:#ff8a00}.led-cell small{position:absolute;top:calc(var(--led-size) * 4 + 4px);left:50%;transform:translate(-50%);color:var(--secondary-text-color);font-size:8px;font-weight:600}.mapping-visual{min-width:0;max-width:100%;overflow:hidden}.led-runs{position:relative;contain:inline-size;min-width:0;max-width:100%;width:100%;gap:44px;overflow-x:auto;overflow-y:hidden;padding:8px 32px 24px 28px}.led-runs-content{display:grid;width:max-content;min-width:100%;gap:44px;justify-items:center}.led-run{gap:2px;position:relative}.led-cell{min-height:0!important;height:calc(var(--led-size) * 4)!important;min-width:var(--led-size)!important;width:var(--led-size)!important;padding:0!important;border-radius:1px!important}.led-cell.assigned{background:color-mix(in srgb,var(--primary-color) 35%,var(--secondary-background-color))!important}.led-cell.selected{background:#fff!important;border-color:#fff!important}.led-cell.range-start{background:#e83e8c!important;border-color:#e83e8c!important}.led-cell.range-end{background:#ff8a00!important;border-color:#ff8a00!important}.power-mark{position:absolute;top:4px;left:-20px;display:grid;place-items:center;width:1rem;height:1rem;border-radius:50%;background:var(--primary-color);color:var(--text-primary-color);font-size:10px;z-index:2}.led-runs.mirrored .power-mark{left:auto;right:-20px}.led-run:first-of-type:after{content:none}.strip-connector{position:absolute;z-index:3;top:50%;right:-20px;width:16px;height:calc(var(--led-size) * 4 + 44px);border:2px dashed var(--secondary-text-color);border-left:0;border-radius:0 10px 10px 0;opacity:.9;pointer-events:none}.led-runs.mirrored .strip-connector{right:auto;left:-20px;transform:scaleX(-1)}.led-run{width:max-content;grid-auto-columns:max-content;justify-content:start}.led-run .led-cell{width:auto!important;min-width:0!important;aspect-ratio:1 / 2}.mapping-toggle input{position:absolute;opacity:0;pointer-events:none}.mapping-toggle-icon{display:grid;place-items:center;width:28px;height:28px;border:1px solid var(--divider-color);border-radius:50%;background:var(--secondary-background-color)}.mapping-toggle-icon svg{width:15px;height:15px;fill:none;stroke:var(--secondary-text-color);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.mapping-toggle input:checked+.mapping-toggle-icon{border-color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 18%,var(--secondary-background-color))}.mapping-toggle input:checked+.mapping-toggle-icon svg{stroke:var(--primary-color);fill:color-mix(in srgb,var(--primary-color) 20%,transparent)}.location-list{display:grid;gap:5px;max-height:470px;overflow:auto;padding-right:4px}.location-row{display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:10px;width:100%;min-height:48px;border:1px solid var(--divider-color);border-radius:11px;padding:7px 10px;background:transparent;color:inherit;text-align:left}.location-row.selected{border-color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 9%,transparent)}.location-row.unmapped{opacity:.66}.location-range{font-size:12px}.location-count,.muted{color:var(--secondary-text-color);font-size:11px}.location-editor{align-self:start;padding:18px;border-radius:14px;background:var(--secondary-background-color)}.range-preview{display:flex;justify-content:space-between;gap:12px;margin-top:12px;padding:10px 12px;background:var(--card-background-color);border-radius:10px;font-size:11px}.range-preview span{color:var(--secondary-text-color)}.miniatures-grid{display:grid;grid-template-columns:330px minmax(0,1fr);gap:18px;align-items:start}.miniatures-grid.catalogue-only{grid-template-columns:minmax(0,1fr)}.mini-editor{position:sticky;top:90px}.mini-list{display:grid;gap:7px;max-height:min(65vh,620px);overflow-y:auto;padding-right:4px}.catalogue-toolbar,.view-toggle{display:flex;align-items:center;gap:7px}.view-toggle{gap:2px;padding:2px;border:1px solid var(--divider-color);border-radius:10px;background:var(--secondary-background-color)}.view-toggle .icon-button{background:transparent;color:var(--secondary-text-color)}.view-toggle .icon-button.active{background:var(--card-background-color);color:var(--primary-color)}.icon-button svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.mini-list.grid{grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;max-height:min(65vh,620px);overflow-y:auto;overflow-x:hidden;padding-right:0}.mini-row.mini-card{position:relative;grid-template-columns:38px minmax(0,1fr);align-content:start;min-height:0;padding:13px;gap:10px}.mini-row.mini-card .mini-artist,.mini-row.mini-card .position-badge{grid-column:1 / -1}.mini-row.mini-card .mini-main{padding-right:60px}.mini-row.mini-card .mini-artist{margin:0}.mini-row.mini-card .position-badge{justify-self:start}.mini-row.mini-card .row-actions{position:absolute;top:11px;right:11px;gap:2px;padding:2px;border:1px solid var(--divider-color);border-radius:9px;background:var(--secondary-background-color)}.mini-row.mini-card .row-actions .icon-button{background:transparent}.mini-row{display:grid;grid-template-columns:38px minmax(160px,1fr) minmax(120px,.7fr) auto auto;gap:11px;align-items:center;padding:10px;border:1px solid var(--divider-color);border-radius:12px}.mini-avatar{display:grid;place-items:center;width:36px;height:36px;border-radius:11px;background:color-mix(in srgb,var(--primary-color) 14%,var(--secondary-background-color));color:var(--primary-color);font-weight:800}.mini-main b,.mini-main span{display:block}.mini-main span,.mini-artist{color:var(--secondary-text-color);font-size:11px;margin-top:2px}.position-badge{white-space:nowrap;padding:5px 8px;border-radius:999px;background:color-mix(in srgb,var(--primary-color) 12%,transparent);color:var(--primary-color);font-size:10px;font-weight:700}.position-badge.unassigned{background:var(--secondary-background-color);color:var(--secondary-text-color)}.search-card{max-width:980px;margin:0 auto}.search-controls{display:grid;grid-template-columns:1fr 180px;gap:10px;margin-top:20px}.search-summary{margin:12px 2px}.sort-controls{display:flex;align-items:center;gap:7px;margin:0 2px 12px;color:var(--secondary-text-color);font-size:11px}.sort-button{min-height:30px!important;padding:0 9px!important;font-size:11px}.sort-button.active{border-color:var(--primary-color)!important;color:var(--primary-color)!important}.search-results{display:grid;gap:7px;max-height:min(55vh,520px);overflow-y:auto;padding-right:4px}.search-result{display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:12px;width:100%;padding:10px;border:1px solid var(--divider-color);border-radius:12px;background:transparent;color:inherit;text-align:left}.search-result:hover:not(:disabled){border-color:var(--primary-color)}.search-result-main b,.search-result-main span{display:block}.search-result-main span{margin-top:3px;color:var(--secondary-text-color);font-size:11px}.view-card{max-width:760px;margin:18px auto 0;padding:22px}.cabinet-summary{max-width:760px;margin:18px auto;padding:22px}.summary-actions{display:flex;align-items:center;gap:10px}.summary-shelves{display:grid;gap:12px}.summary-shelf{padding:14px;border-radius:13px;background:var(--secondary-background-color)}.summary-shelf-heading{display:flex;justify-content:space-between;gap:12px;margin-bottom:10px;font-size:12px}.summary-shelf-heading span{color:var(--secondary-text-color);font-size:11px}.summary-scroll{overflow:visible;padding:0}.summary-map{--summary-node-size: clamp(16px, 4vw, 24px);position:relative;width:100%;height:94px}.summary-run{position:absolute;left:12px;right:12px;height:2px;background:var(--secondary-text-color);opacity:.7}.summary-run.forward{top:31px}.summary-run.return{top:75px}.summary-connector{position:absolute;top:31px;right:calc(8px - var(--summary-node-size) / 2);width:calc(var(--summary-node-size) / 2 + 4px);height:44px;border:2px dashed var(--secondary-text-color);border-left:0;border-radius:0 8px 8px 0;opacity:.7;pointer-events:none}.summary-map.mirrored .summary-connector{right:auto;left:calc(8px - var(--summary-node-size) / 2);border-right:0;border-left:2px dashed var(--secondary-text-color);border-radius:8px 0 0 8px;transform:none}.summary-hex{position:absolute;left:calc(12px + (100% - 24px) * var(--anchor) / 100);z-index:1;display:grid;place-items:center;width:var(--summary-node-size);height:var(--summary-node-size);min-height:0!important;padding:0!important;border:0;border-radius:50%;background:var(--divider-color);color:var(--primary-text-color);text-align:center;transform:translate(-50%)}.summary-hex:before{content:"";position:absolute;inset:2px;z-index:-1;border-radius:inherit;background:var(--card-background-color)}.summary-hex.forward{top:calc(31px - var(--summary-node-size) / 2)}.summary-hex.return{top:calc(75px - var(--summary-node-size) / 2)}.summary-hex span{display:block;font-size:clamp(7px,1.7vw,10px);font-weight:800;line-height:1}.summary-hex.assigned{background:#8fd4e8;color:#786000}.summary-hex.assigned:before{background:#f1e6b2}.summary-hex.selected{background:var(--primary-color);color:var(--text-primary-color)}.summary-hex.selected:before{background:color-mix(in srgb,var(--primary-color) 30%,var(--card-background-color))}.summary-hex.moving{background:#f59e0b;color:#3b2600}.summary-hex.moving:before{background:#fef3c7}.summary-hex.target{background:#22c55e;color:#073b1a}.summary-hex.target:before{background:#dcfce7}.summary-hex:hover,.summary-hex:focus-visible{background:var(--primary-color);outline:none}.view-mini-card{display:flex;align-items:center;justify-content:flex-start;gap:13px;min-height:94px;padding:14px 32px 14px 14px;text-align:left;border-radius:14px;background:var(--secondary-background-color)}.view-mini-card h3{font-size:18px}.view-mini-card p{max-width:390px}.view-mini-content{min-width:0}.view-index{margin-bottom:3px;color:var(--primary-color);font-size:10px;font-weight:800;letter-spacing:.1em}.view-position{margin:12px 0 2px;text-align:center;color:var(--primary-color);font-size:11px;font-weight:800;letter-spacing:.11em}.view-position span{padding:0 5px;color:var(--secondary-text-color)}.picker-shell{position:relative;margin:24px auto 4px;padding:18px 20px 12px;overflow:hidden;border:1px solid var(--divider-color);border-radius:14px;background:var(--primary-background-color)}.picker-caption{margin-bottom:9px;color:var(--secondary-text-color);text-align:center;font-size:9px;font-weight:800;letter-spacing:.22em}.picker-dial{display:grid;grid-template-columns:repeat(7,1fr);align-items:end;min-height:58px;border-top:1px solid var(--divider-color);background:repeating-linear-gradient(90deg,transparent 0 7px,color-mix(in srgb,var(--divider-color) 70%,transparent) 7px 8px);cursor:grab;touch-action:pan-y;-webkit-user-select:none;user-select:none}.picker-dial.dragging{cursor:grabbing}.dial-tick{display:grid;justify-items:center;gap:4px;color:var(--secondary-text-color);font-size:12px;pointer-events:none}.dial-tick i{display:block;width:1px;height:12px;background:currentColor}.dial-tick b{font-size:14px}.dial-tick.active{color:var(--primary-color);transform:translateY(-4px)}.dial-tick.active i{width:2px;height:22px}.dial-tick.active b{font-size:19px}.view-actions{display:flex;justify-content:center;margin-top:13px}.view-controls-grid{max-width:760px;margin:18px auto 0}.view-control-card{padding:20px}.light-controls-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;max-width:760px;margin:18px auto 0}.pwm-light-card{position:relative;display:grid;place-items:start center;width:100%;max-width:370px;aspect-ratio:1;min-height:0;justify-self:center;overflow:hidden;padding:24px}.pwm-light-menu{position:absolute;top:12px;right:14px;z-index:3;color:var(--secondary-text-color);font-size:24px;font-weight:800;line-height:1}.pwm-arc{position:absolute;top:22px;left:50%;width:206px;height:206px;transform:translate(-50%);cursor:pointer;touch-action:none}.pwm-arc:focus-visible{border-radius:50%;outline:2px solid var(--primary-color);outline-offset:4px}.pwm-arc svg{width:100%;height:100%;fill:none;stroke:var(--secondary-text-color);stroke-width:3;stroke-linecap:round;opacity:.9}.pwm-arc svg .pwm-arc-progress{stroke:var(--primary-color);stroke-width:7;stroke-linecap:round;filter:drop-shadow(0 0 3px color-mix(in srgb,var(--primary-color) 45%,transparent))}.pwm-arc-dot{position:absolute;top:var(--arc-dot-y);left:var(--arc-dot-x);width:11px;height:11px;border-radius:50%;background:var(--primary-color);box-shadow:0 0 0 3px var(--card-background-color);transform:translate(-50%,-50%)}.pwm-bulb{position:absolute;top:125px;left:50%;z-index:1;display:grid;place-items:center;width:clamp(114px,22vw,140px);height:clamp(114px,22vw,140px);margin:0;transform:translate(-50%,-50%);border:0;border-radius:50%;background:transparent;color:var(--secondary-text-color);box-shadow:none}.pwm-bulb.on{color:#ffd54a;background:#ffd54a21;box-shadow:0 0 0 18px #ffd54a12}.pwm-bulb.off{color:#497da9}.pwm-bulb svg{width:clamp(92px,18vw,112px);height:clamp(92px,18vw,112px);fill:currentColor;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.pwm-bulb-slash{fill:none;stroke:var(--card-background-color)!important;stroke-width:6!important}.pwm-light-label{position:absolute;bottom:22px;left:0;right:0;display:grid;justify-items:center;gap:2px}.pwm-light-label b{font-size:15px}.pwm-light-label span{color:var(--secondary-text-color);font-size:11px}.miniature-light-widgets{display:grid;align-content:start;gap:10px}.miniature-widget-card{padding:12px}.miniature-widget-heading{display:flex;align-items:center;gap:10px}.miniature-widget-heading b,.miniature-widget-heading span{display:block}.miniature-widget-heading b{font-size:13px}.miniature-widget-heading span{margin-top:2px;color:var(--secondary-text-color);font-size:11px}.mini-widget-icon{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:color-mix(in srgb,#d6ae00 24%,var(--secondary-background-color));color:#d6ae00;font-size:20px;transform:rotate(-28deg)}.mini-widget-icon.sliders{background:color-mix(in srgb,var(--primary-color) 15%,var(--secondary-background-color));color:var(--primary-color);font-size:23px;transform:none}.mini-widget-icon.colour{background:color-mix(in srgb,#ed8bdc 25%,var(--secondary-background-color));color:#ed8bdc}.ha-power-toggle{position:relative;display:block;width:100%;height:42px;margin-top:11px;padding:0!important;border:0;border-radius:12px;background:var(--secondary-background-color)}.ha-power-toggle span{position:absolute;top:0;bottom:0;left:0;width:50%;border-radius:12px;background:#aaa;transition:transform .16s ease,background .16s ease,width .16s ease}.ha-power-toggle span:after{content:"";position:absolute;top:50%;left:50%;width:14px;height:14px;border:2px solid #fff;border-radius:50%;transform:translate(-50%,-50%)}.ha-power-toggle.on span{transform:translate(100%);background:var(--primary-color)}.ha-brightness-slider{width:100%;height:42px;margin-top:11px;padding:0!important;border:0;border-radius:12px;appearance:none;background:linear-gradient(90deg,#4d84b9 var(--brightness),#22303e var(--brightness));accent-color:var(--primary-color)}.ha-brightness-slider::-webkit-slider-thumb{width:8px;height:26px;border:0;border-radius:6px;appearance:none;background:#fff}.ha-brightness-slider::-moz-range-thumb{width:8px;height:26px;border:0;border-radius:6px;background:#fff}.color-swatches{display:flex;gap:8px;flex-wrap:wrap;margin-top:11px}.color-swatch,.custom-color{width:36px;height:36px;padding:0;border:2px solid transparent;border-radius:10px;background:var(--swatch)}.color-swatch.selected{border-color:var(--primary-text-color);box-shadow:0 0 0 2px var(--primary-color)}.custom-color{position:relative;overflow:hidden;background:conic-gradient(red,#ff0,#0f0,#0ff,#00f,#f0f,red)}.custom-color input[type=color]{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}.scene-list{display:flex;gap:7px;margin-top:15px;flex-wrap:wrap}.scene-button.active{border-color:var(--primary-color)!important;color:var(--primary-color)!important}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.palette-sheet-backdrop{position:fixed;inset:0;z-index:30;display:grid;align-items:end;background:#00000094;animation:palette-backdrop-in .16s ease-out}.palette-sheet{width:min(620px,100%);max-height:min(88dvh,760px);margin:0 auto;overflow:auto;padding:10px 22px calc(20px + env(safe-area-inset-bottom,0px));border:1px solid var(--divider-color);border-bottom:0;border-radius:24px 24px 0 0;background:var(--card-background-color);box-shadow:0 -10px 36px #0000004d;animation:palette-sheet-in .18s ease-out}.palette-sheet-handle{width:42px;height:4px;margin:0 auto 12px;border-radius:999px;background:var(--secondary-text-color);opacity:.55}.palette-sheet-header{display:flex;align-items:center;justify-content:space-between;gap:12px}.palette-sheet-header h2{font-size:21px}.palette-sheet-close{font-size:24px}.palette-current-colour{margin:32px 0 10px;text-align:center;color:var(--primary-color);font-size:14px;font-weight:800;letter-spacing:.08em}.palette-colour-wheel{position:relative;width:min(62vw,278px);aspect-ratio:1;margin:0 auto;border-radius:50%;background:radial-gradient(circle,#fff 0%,transparent 58%),conic-gradient(from -90deg,red,#ff0,#0f0,#0ff,#00f,#f0f,red);box-shadow:inset 0 0 0 1px #fff3;cursor:crosshair;touch-action:none}.palette-colour-wheel:focus-visible{outline:3px solid var(--primary-color);outline-offset:4px}.palette-colour-wheel-marker{position:absolute;top:50%;left:50%;width:24px;height:24px;border:3px solid #fff;border-radius:50%;background:var(--selected-colour);box-shadow:0 1px 5px #0000007f;transform:translate(-50%,-50%);pointer-events:none}.palette-editor-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(48px,1fr));gap:13px 10px;padding:48px 4px}.palette-editor-item{position:relative;display:grid;justify-items:center}.palette-editor-swatch{width:44px;height:44px;padding:0;border:2px solid transparent;border-radius:50%;background:var(--swatch);box-shadow:inset 0 0 0 1px #0000001a;cursor:grab}.palette-editor-swatch.dragging{opacity:.45;cursor:grabbing}.palette-editor-swatch.selected{border-color:#fff;box-shadow:0 0 0 3px var(--primary-color)}.palette-remove{position:absolute;top:-7px;right:calc(50% - 29px);width:20px;height:20px;padding:0;border:0;border-radius:50%;background:var(--secondary-background-color);color:var(--secondary-text-color);font-size:15px;line-height:1}.palette-remove:disabled{display:none}.palette-sheet-footer{display:flex;justify-content:center;gap:10px;margin-top:14px}.palette-add{border-style:dashed!important}@keyframes palette-backdrop-in{0%{opacity:0}to{opacity:1}}@keyframes palette-sheet-in{0%{transform:translateY(100%)}to{transform:translateY(0)}}.empty-state{display:grid;gap:5px;place-items:center;padding:40px 18px;text-align:center;color:var(--secondary-text-color)}.empty-state b{color:var(--primary-text-color)}@media(max-width:900px){.configuration-grid,.miniatures-grid,.view-controls-grid{grid-template-columns:1fr}.mini-editor{position:static}.locations-layout{grid-template-columns:1fr}.topbar{align-items:flex-start;flex-direction:column;padding:calc(10px + env(safe-area-inset-top,0px)) 16px 12px}.topbar-main{width:100%}nav{width:100%;justify-content:space-between}.nav-tab{flex:0 0 42px}.page{padding:16px 16px calc(32px + env(safe-area-inset-bottom,0px))}}@media(max-width:600px){.light-controls-grid{grid-template-columns:1fr}.brand-icon{width:36px;height:36px}.general-card{align-items:flex-start;flex-direction:column}.general-values{width:100%}.metric,.color-control{flex:1}.form-grid.two,.search-controls{grid-template-columns:1fr}.mini-row{grid-template-columns:38px 1fr auto}.mini-artist{grid-column:2}.mini-row .row-actions{grid-column:2 / -1}.position-badge{grid-column:3;grid-row:1 / span 2}.view-card{padding:16px}.picker-shell{padding-left:10px;padding-right:10px}.dial-tick b{font-size:11px}.dial-tick.active b{font-size:16px}}', se = (e) => {
  switch (e) {
    case "edit":
      return l`<svg viewBox="0 0 24 24">
				<path d="M12 20h9" />
				<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
			</svg>`;
    case "delete":
      return l`<svg viewBox="0 0 24 24">
				<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v4M14 11v4" />
			</svg>`;
    case "grid":
      return l`<svg viewBox="0 0 24 24">
				<rect x="4" y="4" width="6" height="6" rx="1" />
				<rect x="14" y="4" width="6" height="6" rx="1" />
				<rect x="4" y="14" width="6" height="6" rx="1" />
				<rect x="14" y="14" width="6" height="6" rx="1" />
			</svg>`;
    case "list":
      return l`<svg viewBox="0 0 24 24">
				<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
			</svg>`;
  }
}, H = ({
  label: e,
  icon: t,
  onClick: i,
  className: a = "",
  disabled: r = !1,
  pressed: o
}) => l`<button
	type="button"
	class="icon-button ${a}"
	aria-label=${e}
	title=${e}
	aria-pressed=${o === void 0 ? u : String(o)}
	?disabled=${r}
	@click=${i}>
	${se(t)}
</button>`, X = (e) => l`<div class="mini-avatar" aria-hidden="true">${e?.[0] || "?"}</div>`, B = (e) => e.currentTarget.value, ne = (e) => e.currentTarget.checked, le = (e, t, i, a) => {
  let r = null;
  (e.key === "ArrowLeft" || e.key === "ArrowDown") && (r = t - 1), (e.key === "ArrowRight" || e.key === "ArrowUp") && (r = t + 1), e.key === "Home" && (r = 0), e.key === "End" && (r = i - 1), r !== null && (e.preventDefault(), a((r % i + i) % i));
}, yt = (e, t, i, a, r) => {
  const o = Math.max(1, i), s = t || 0, c = [-3, -2, -1, 0, 1, 2, 3];
  return l`<div
		class="picker-dial ${a ? "compact" : ""}"
		role="slider"
		tabindex="0"
		aria-label=${a ? "Location" : "Miniature"}
		aria-valuemin="1"
		aria-valuemax=${o}
		aria-valuenow=${s + 1}
		@keydown=${(n) => le(n, s, o, r)}
		@pointerdown=${(n) => e._startDial(n, s)}
		@pointermove=${(n) => e._moveDial(n, o, r)}
		@pointerup=${(n) => e._finishDial(n)}
		@pointercancel=${(n) => e._finishDial(n)}
		@lostpointercapture=${(n) => e._finishDial(n)}>
		${c.map(
    (n) => l`<span class="dial-tick ${n === 0 ? "active" : ""}">
				${a && n === 0 ? l`<em>LOCATION</em>` : u}<i></i>
				<b>${((s + n) % o + o) % o + 1}</b>
			</span>`
  )}
	</div>`;
}, ce = (e, t, i) => {
  const a = e._mappingStart ?? (i?.mapped ? i.start_led : null), r = e._mappingEnd ?? (i?.mapped ? i.start_led + i.leds - 1 : null), o = e._showAllMappings ? oe(t) : /* @__PURE__ */ new Set(), s = Array.from({ length: t.total_leds }, (d, h) => {
    const p = a !== null && r !== null && h >= Math.min(a, r) && h <= Math.max(a, r);
    return l`<button
			type="button"
			class="led-cell ${o.has(h) ? "assigned" : ""} ${p ? "selected" : ""} ${h === a ? "range-start" : ""} ${h === r ? "range-end" : ""}"
			aria-label="LED ${h + 1}"
			aria-pressed=${String(p)}
			@click=${() => e.actions.selectLed(h)}>
			${h % 5 === 0 ? l`<small>${h + 1}</small>` : u}
		</button>`;
  }), c = Math.ceil(t.total_leds / 2), n = t.mirrored ? [s.slice(0, c).reverse(), s.slice(c)] : [s.slice(0, c), s.slice(c).reverse()];
  return l`<section class="mapping-visual">
		<div class="section-heading">
			<div><div class="eyebrow">LOCATIONS</div><h3>LED mapping</h3></div>
			<label class="mapping-toggle">
				<input
					id="show-all-mappings"
					type="checkbox"
					.checked=${e._showAllMappings}
					@change=${(d) => e.actions.setShowAllMappings(ne(d))} />
				<span class="mapping-toggle-icon" aria-hidden="true"><svg viewBox="0 0 24 24">
					<path d="M9 18h6M10 22h4M8.5 15.5C7.6 14.5 7 13.1 7 11.5a5 5 0 0 1 10 0c0 1.6-.6 3-1.5 4" />
				</svg></span>
				<span>Show all assigned</span>
			</label>
		</div>
		<div class="mapping-dial-selected" role="status" aria-live="polite">
			${e._selectedLocation}
		</div>
		${yt(
    e,
    e._selectedLocation - 1,
    t.total_locations,
    !0,
    (d) => e.actions.selectMappingLocation(d, t.total_locations)
  )}
		<div class="mapping-tools">
			<button type="button" @click=${e.actions.toggleDirection}>
				${t.mirrored ? "Start at right" : "Start at left"}
			</button>
			<button
				type="button"
				class="icon-button"
				aria-label="Zoom out"
				title="Zoom out"
				@click=${() => e.actions.zoom(-0.25)}>
				−
			</button>
			<button
				type="button"
				class="icon-button"
				aria-label="Zoom in"
				title="Zoom in"
				@click=${() => e.actions.zoom(0.25)}>
				＋
			</button>
			${a !== null && r !== null ? l`<div class="mapping-range">
						LED ${Math.min(a, r) + 1} → ${Math.max(a, r) + 1}
						<span>${Math.abs(r - a) + 1} LEDs</span>
					</div>` : u}
		</div>
		<p>
			Selected location: <b>${e._selectedLocation}</b>. Tap first and last
			LED to preview; save commits the range.
		</p>
		<div
			class="led-runs ${t.mirrored ? "mirrored" : ""}"
			style=${`--led-size:${e._ledZoom * 9}px`}>
			<div class="led-runs-content">
				<div class="led-run">
					<div class="power-mark" role="img" aria-label="Strip power">⚡</div>
					${n[0]}<span class="strip-connector" aria-hidden="true"></span>
				</div>
				<div class="led-run return">${n[1]}</div>
			</div>
		</div>
		<div class="button-row end">
			<button type="button" @click=${e.actions.resetLedRange}>Go back</button>
			<button
				type="button"
				class="primary"
				@click=${e.actions.saveLedRange}
				?disabled=${a === null || r === null}>
				Save location
			</button>
		</div>
	</section>`;
}, de = (e, t) => l`<aside class="panel-card shelf-list">
	<div class="section-heading">
		<div><div class="eyebrow">SHELVES</div><h3>Physical order</h3></div>
		<button
			type="button"
			class="primary small"
			@click=${() => e.actions.insertShelf(t.length + 1)}>
			＋ Add shelf
		</button>
	</div>
	<div class="shelf-items">
		${t.map(
  (i, a) => l`<div
					class="shelf-row ${i.shelf === e._selectedShelf ? "selected" : ""}">
					<button
						type="button"
						class="shelf-select"
						aria-current=${i.shelf === e._selectedShelf ? "true" : "false"}
						@click=${() => e.actions.selectShelf(i.shelf)}>
						<span class="shelf-number">${String(i.shelf).padStart(2, "0")}</span>
						<span><b>Shelf ${i.shelf}</b><small
							>${i.total_locations} locations · ${i.total_leds}
							LEDs</small
						></span>
					</button>
					<div class="row-actions">
						<button
							type="button"
							class="icon-button"
							aria-label="Move Shelf ${i.shelf} up"
							title="Move Shelf ${i.shelf} up"
							@click=${() => e.actions.moveShelf(
    i.shelf,
    Math.max(1, i.shelf - 1)
  )}
							?disabled=${a === 0}>
							↑
						</button>
						<button
							type="button"
							class="icon-button"
							aria-label="Move Shelf ${i.shelf} down"
							title="Move Shelf ${i.shelf} down"
							@click=${() => e.actions.moveShelf(
    i.shelf,
    Math.min(t.length, i.shelf + 1)
  )}
							?disabled=${a === t.length - 1}>
							↓
						</button>
					</div>
				</div>
				<button
					type="button"
					class="insert-shelf"
					@click=${() => e.actions.insertShelf(i.shelf + 1)}>
					＋ Insert shelf here
				</button>`
)}
	</div>
</aside>`, he = (e, t, i) => {
  const a = t.locations[e._selectedLocation - 1];
  return l`<main class="panel-card shelf-detail">
		<div class="section-heading detail-heading">
			<div><div class="eyebrow">SELECTED SHELF</div><h2>Shelf ${t.shelf}</h2></div>
			<button
				type="button"
				class="danger ghost"
				@click=${() => e.actions.deleteShelf(t.shelf)}
				?disabled=${i <= 1}>
				Delete shelf
			</button>
		</div>
		<div class="form-grid two">
			<label><span>Total LEDs</span><input
				id="shelf-leds"
				type="number"
				min="1"
				.value=${String(t.total_leds)} /></label>
			<label><span>Total locations</span><input
				id="shelf-locations"
				type="number"
				min="1"
				.value=${String(t.total_locations)} /></label>
		</div>
		<div class="button-row">
			<button type="button" class="primary" @click=${e.actions.saveShelf}>Save shelf</button>
			<button type="button" @click=${() => e.actions.duplicateShelf(t.shelf)}>Duplicate shelf</button>
			<button type="button" @click=${e.actions.autoMap}>Auto map</button>
			<button type="button" @click=${e.actions.clearMap}>Clear mapping</button>
		</div>
		<div class="divider"></div>
		${ce(e, t, a)}
	</main>`;
}, pe = (e) => {
  const { _layout: t } = e, { shelves: i } = t;
  if (!i.length)
    return l`<div class="empty-state">
			<b>Waiting for cabinet layout</b>
			<span>The panel will populate when the ESP32 publishes its retained layout state.</span>
		</div>`;
  const a = i[e._selectedShelf - 1] ?? i[0];
  return l`<section class="general-card panel-card">
		<div>
			<div class="eyebrow">GENERAL</div>
			<h2>Cabinet configuration</h2>
			<p>Physical structure and the color used to identify miniature locations.</p>
		</div>
		<div class="general-values">
			<div class="metric"><span>Shelves</span><b>${t.shelf_count || i.length}</b></div>
			<label class="color-control">
				<span>Highlight color</span>
				<input
					id="highlight-color"
					type="color"
					@change=${(r) => e.actions.setHighlightColor(B(r))}
					.value=${e._rgbToHex(
    t.highlight_color || { r: 156, g: 39, b: 176 }
  )} />
			</label>
		</div>
	</section>
	<div class="configuration-grid">
		${de(e, i)}
		${he(e, a, i.length)}
	</div>`;
}, ue = [
  ["name", "Name"],
  ["location", "Location"],
  ["newest", "Newest"]
], wt = (e, t = "name") => [...e].sort((i, a) => {
  if (t === "location") {
    const r = Number(i.shelf) > 0 && Number(i.location) > 0, o = Number(a.shelf) > 0 && Number(a.location) > 0;
    return r !== o ? r ? -1 : 1 : Number(i.shelf) - Number(a.shelf) || Number(i.location) - Number(a.location) || String(i.name).localeCompare(String(a.name));
  }
  return t === "newest" && Number(new Date(a.date || 0)) - Number(new Date(i.date || 0)) || String(i.name).localeCompare(String(a.name));
}), $t = (e, t) => l`<div class="sort-controls">
	<span>Sort by</span>
	${ue.map(
  ([i, a]) => l`<button
			class="sort-button ${e === i ? "active" : ""}"
			@click=${() => t(i)}>
			${a}
		</button>`
)}
</div>`, me = (e, t) => l`<section class="panel-card mini-editor">
	<div class="eyebrow">${t ? "EDIT MINIATURE" : "NEW MINIATURE"}</div>
	<h2>${t?.name || "Add to catalogue"}</h2>
	<div class="form-grid">
		<label><span>Name</span><input id="mini-name" maxlength="80" .value=${t?.name || ""} /></label>
		<label><span>Collection</span><input
			id="mini-collection"
			maxlength="80"
			.value=${t?.collection || ""} /></label>
		<label><span>Artist</span><input id="mini-artist" maxlength="80" .value=${t?.artist || ""} /></label>
	</div>
	<div class="button-row end">
		<button type="button" @click=${e.actions.cancelMini}>Cancel</button>
		<button type="button" class="primary" @click=${e.actions.saveMini}>
			${t ? "Save changes" : "Add miniature"}
		</button>
	</div>
</section>`, ge = (e, t, i) => i ? l`${H({
  label: `Edit ${t.name}`,
  icon: "edit",
  onClick: () => e.actions.editMini(t.id)
})}${H({
  label: `Delete ${t.name}`,
  icon: "delete",
  className: "danger",
  onClick: () => e.actions.deleteMini(t.id)
})}` : l`<button type="button" class="ghost" @click=${() => e.actions.editMini(t.id)}>Edit</button>
		<button type="button" class="danger ghost" @click=${() => e.actions.deleteMini(t.id)}>Delete</button>`, be = (e, t, i) => l`<div class="mini-row ${i ? "mini-card" : ""}">
	${X(t.name)}
	<div class="mini-main"><b>${t.name}</b><span>${t.collection || "No collection"}</span></div>
	<div class="mini-artist">${t.artist || "Unknown artist"}</div>
	<div class="position-badge ${t.shelf ? "" : "unassigned"}">
		${t.shelf ? `S${t.shelf} · L${t.location}` : "Unassigned"}
	</div>
	<div class="row-actions">${ge(e, t, i)}</div>
</div>`, fe = (e, t) => l`<div class="view-toggle" role="group" aria-label="Catalogue view">
	${H({
  label: "List view",
  icon: "list",
  className: t ? "" : "active",
  pressed: !t,
  onClick: () => e.actions.setCatalogueView("list")
})}
	${H({
  label: "Grid view",
  icon: "grid",
  className: t ? "active" : "",
  pressed: t,
  onClick: () => e.actions.setCatalogueView("grid")
})}
</div>`, ve = (e) => {
  const t = e._miniatures.find(
    (s) => s.id === e._editingMiniId
  ), i = !!(t || e._addingMini), a = ie(e._miniatures), r = wt(a, e._catalogueSort), o = e._catalogueView === "grid";
  return l`<div class="miniatures-grid ${i ? "" : "catalogue-only"}">
		${i ? me(e, t) : u}
		<section class="panel-card mini-list-card">
			<div class="section-heading">
				<div><div class="eyebrow">CATALOGUE</div><h2>${a.length} miniatures</h2></div>
				<div class="catalogue-toolbar">
					${fe(e, o)}
					<button type="button" class="primary small" @click=${e.actions.addMini}>Add new mini</button>
				</div>
			</div>
			${$t(
    e._catalogueSort,
    (s) => e.actions.setSort("_catalogueSort", s)
  )}
			<div class="mini-list ${o ? "grid" : ""}">
				${r.map((s) => be(e, s, o))}
			</div>
		</section>
	</div>`;
}, xe = (e, t) => l`<button
	type="button"
	class="search-result"
	@click=${() => e.actions.highlightOne(t.id)}
	?disabled=${!v(t)}>
	${X(t.name)}
	<div class="search-result-main">
		<b>${t.name}</b>
		<span>${t.collection || "No collection"} · ${t.artist || "Unknown artist"}</span>
	</div>
	<span class="position-badge ${v(t) ? "" : "unassigned"}">
		${v(t) ? `Shelf ${t.shelf} · Location ${t.location}` : "Unassigned"}
	</span>
</button>`, _e = (e) => {
  const t = e._searchQuery.trim().toLocaleLowerCase(), i = _t(
    e._miniatures,
    t,
    e._searchField
  ), a = wt(i, e._searchSort), r = i.filter(v).length;
  return l`<section class="panel-card search-card">
		<div class="eyebrow">FIND & HIGHLIGHT</div>
		<h2>Find a miniature in the cabinet</h2>
		<div class="search-controls">
			<input
				id="search-query"
				type="search"
				@input=${(o) => e.actions.setSearchQuery(B(o))}
				placeholder="Search miniatures…"
				autocomplete="off"
				.value=${e._searchQuery} />
			<select
				id="search-field"
				aria-label="Search field"
				@change=${(o) => e.actions.setSearchField(
    B(o)
  )}
				.value=${e._searchField}>
				<option value="all">All fields</option>
				<option value="name">Name</option>
				<option value="collection">Collection</option>
				<option value="artist">Artist</option>
			</select>
		</div>
		<div id="search-summary" class="search-summary muted" aria-live="polite">
			${t ? `${i.length} result${i.length === 1 ? "" : "s"} · ${r} assigned` : "Start typing to search."}
		</div>
		${t ? $t(
    e._searchSort,
    (o) => e.actions.setSort("_searchSort", o)
  ) : u}
		<div id="search-results" class="search-results">
			${t ? a.length ? a.map((o) => xe(e, o)) : l`<div class="empty-state"><b>No matches</b><span>Try another term or field.</span></div>` : u}
		</div>
	</section>`;
}, ye = (e, t, i) => {
  const a = re(t), r = a.filter(
    (o) => i.has(Y(t.shelf, o.location))
  ).length;
  return l`<section class="summary-shelf">
		<header class="summary-shelf-heading">
			<b>Shelf ${t.shelf}</b>
			<span>${a.length} mapped · ${r} assigned</span>
		</header>
		<div class="summary-scroll">
			<div class="summary-map ${t.mirrored ? "mirrored" : ""}">
				<div class="summary-run forward"></div>
				<div class="summary-run return"></div>
				<div class="summary-connector" aria-hidden="true"></div>
				${a.map(
    (o) => we(e, t, o, i)
  )}
			</div>
		</div>
	</section>`;
}, we = (e, t, i, a) => {
  const r = e._summaryLocationAnchor(t, i), o = a.get(
    Y(t.shelf, i.location)
  ), s = e._summaryMoveSource?.shelf === t.shelf && e._summaryMoveSource.location === i.location, c = e._summaryMoveTarget?.shelf === t.shelf && e._summaryMoveTarget.location === i.location, n = e._summarySelected?.shelf === t.shelf && e._summarySelected.location === i.location, d = o ? `Location ${i.location}: ${o.name}` : `Location ${i.location}: no miniature assigned`;
  return l`<button
		type="button"
		class="summary-hex ${r.run} ${o ? "assigned" : ""} ${n ? "selected" : ""} ${s ? "moving" : ""} ${c ? "target" : ""}"
		style=${`--anchor:${r.percent}`}
		aria-label=${d}
		aria-pressed=${String(n)}
		@click=${() => e.actions.selectSummaryLocation(t.shelf, i.location)}
		title=${d}>
		<span>${i.location}</span>
	</button>`;
}, $e = (e) => {
  const { shelves: t } = e._layout, i = e._summarySelected && e._miniatures.find(
    (r) => r.shelf === e._summarySelected?.shelf && r.location === e._summarySelected.location
  ), a = ae(
    e._assignedMiniatures
  );
  return l`<section
		class="panel-card cabinet-summary"
		@click=${(r) => r.stopPropagation()}>
		<div class="section-heading">
			<div><div class="eyebrow">CABINET SUMMARY</div><h2>All shelves</h2></div>
			<div class="summary-actions">
				<span class="muted">${e._summaryMoveSource ? "Choose a target location." : "Tap a location to locate it."}</span>
				<button
					type="button"
					class="small"
					?disabled=${!i || !!e._summaryMoveSource}
					@click=${e.actions.startSummaryMove}>
					Move
				</button>
			</div>
		</div>
		${t.length ? l`<div class="summary-shelves">
					${t.map(
    (r) => ye(e, r, a)
  )}
				</div>` : l`<div class="empty-state"><b>Waiting for cabinet layout</b></div>`}
	</section>`;
}, Se = ["off", "display", "showcase"], ht = (e, t) => {
  const a = t.currentTarget.getBoundingClientRect(), r = t.clientX - a.left - a.width / 2, o = t.clientY - a.top - a.height / 2;
  let s = Math.atan2(o, r) * 180 / Math.PI;
  s < 135 && (s += 360);
  const c = Math.max(135, Math.min(405, s));
  e.actions.setCabinetBrightness(
    Math.round((c - 135) / 270 * 100)
  );
}, ke = (e, t) => {
  const i = t.shiftKey ? 10 : 5;
  let a = null;
  (t.key === "ArrowLeft" || t.key === "ArrowDown") && (a = e._cabinetBrightness - i), (t.key === "ArrowRight" || t.key === "ArrowUp") && (a = e._cabinetBrightness + i), t.key === "Home" && (a = 0), t.key === "End" && (a = 100), a !== null && (t.preventDefault(), e.actions.setCabinetBrightness(Math.max(0, Math.min(100, a))));
}, Me = (e, t) => {
  const a = t.currentTarget.getBoundingClientRect(), r = t.clientX - a.left - a.width / 2, o = t.clientY - a.top - a.height / 2, s = Math.min(a.width, a.height) / 2, c = Math.min(1, Math.hypot(r, o) / s), n = Math.atan2(o, r) * 180 / Math.PI + 180;
  e.actions.setPaletteColor(ee(n, c));
}, Ae = (e) => {
  const i = (135 + e._cabinetBrightness * 2.7) * Math.PI / 180, a = 50 + 43 * Math.cos(i), r = 50 + 43 * Math.sin(i);
  return l`<section class="panel-card pwm-light-card">
		<span class="pwm-light-menu" aria-hidden="true">⋮</span>
		<div
			class="pwm-arc"
			role="slider"
			tabindex="0"
			aria-label="Cabinet brightness"
			aria-valuemin="0"
			aria-valuemax="100"
			aria-valuenow=${e._cabinetBrightness}
			@keydown=${(o) => ke(e, o)}
			@pointerdown=${(o) => {
    o.currentTarget.setPointerCapture(o.pointerId), ht(e, o);
  }}
			@pointermove=${(o) => {
    o.buttons === 1 && ht(e, o);
  }}>
			<svg viewBox="0 0 200 200" aria-hidden="true">
				<path d="M39 161 A86 86 0 1 1 161 161" />
				<path
					class="pwm-arc-progress"
					d="M39 161 A86 86 0 1 1 161 161"
					pathLength="100"
					style=${`stroke-dasharray:${e._cabinetBrightness} 100`}/>
			</svg>
			<span
				class="pwm-arc-dot"
				style=${`--arc-dot-x:${a}%;--arc-dot-y:${r}%`}></span>
		</div>
		<button
			type="button"
			class="pwm-bulb ${e._cabinetPower ? "on" : "off"}"
			role="switch"
			aria-checked=${String(e._cabinetPower)}
			aria-label="Cabinet power"
			@click=${() => e.actions.setCabinetPower(!e._cabinetPower)}>
			<svg viewBox="0 0 64 64" aria-hidden="true">
				<path d="M22 37a17 17 0 1 1 20 0c-3 2-4 5-4 8H26c0-3-1-6-4-8Z" />
				<path d="M27 51h10M29 56h6" />
				${e._cabinetPower ? null : l`<path class="pwm-bulb-slash" d="m15 15 34 34" />`}
			</svg>
		</button>
		<div class="pwm-light-label">
			<b>Cabinet light</b>
			<span>${e._cabinetPower ? `${e._cabinetBrightness}%` : "Off"}</span>
		</div>
	</section>`;
}, Ce = (e) => l`<div class="miniature-light-widgets">
	<section class="panel-card miniature-widget-card">
		<div class="miniature-widget-heading">
			<div class="mini-widget-icon" aria-hidden="true">▰</div>
			<div><b>Miniature Lights Power</b><span>${e._miniaturePower ? "On" : "Off"}</span></div>
		</div>
		<button
			type="button"
			class="ha-power-toggle ${e._miniaturePower ? "on" : ""}"
			role="switch"
			aria-checked=${String(e._miniaturePower)}
			aria-label="Miniature lights power"
			@click=${() => e.actions.setMiniatureLights({ power: !e._miniaturePower })}>
			<span></span>
		</button>
	</section>
	<section class="panel-card miniature-widget-card">
		<div class="miniature-widget-heading">
			<div class="mini-widget-icon sliders" aria-hidden="true">⌁</div>
			<div><b>Miniature Lights Brightness</b><span>${e._miniatureBrightness}%</span></div>
		</div>
		<input
			class="ha-brightness-slider"
			style=${`--brightness:${e._miniatureBrightness}%`}
			aria-label="Miniature lights brightness"
			type="range"
			min="0"
			max="100"
			.value=${String(e._miniatureBrightness)}
			@input=${(t) => e.actions.setMiniatureLights({ brightness: B(t) })} />
	</section>
	<section
		class="panel-card miniature-widget-card miniature-colour-widget"
		role="button"
		tabindex="0"
		aria-label="Edit miniature light palette"
		@click=${e.actions.openPaletteEditor}
		@keydown=${(t) => {
  (t.key === "Enter" || t.key === " ") && (t.preventDefault(), e.actions.openPaletteEditor());
}}>
		<div class="miniature-widget-heading">
			<div class="mini-widget-icon colour" aria-hidden="true">▰</div>
			<div><b>Miniature Lights Colour</b><span>Preset or custom colour</span></div>
		</div>
		<div class="color-swatches" role="group" aria-label="Miniature light colour">
			${e._miniaturePalette.map(
  (t) => l`<button
					type="button"
					class="color-swatch ${e._miniatureColor.toLocaleLowerCase() === t ? "selected" : ""}"
					style=${`--swatch:${t}`}
					aria-label=${`Set colour to ${t}`}
					aria-pressed=${String(
    e._miniatureColor.toLocaleLowerCase() === t
  )}
					@click=${(i) => {
    i.stopPropagation(), e.actions.setMiniatureLights({ color: t });
  }}></button>`
)}
		</div>
	</section>
</div>`, Pe = (e) => {
  if (!e._paletteEditorOpen) return l``;
  const t = e._miniaturePalette[e._paletteSelectedIndex] || e._miniatureColor;
  return l`<div
		class="palette-sheet-backdrop"
		@click=${e.actions.closePaletteEditor}>
		<section
			class="palette-sheet"
			role="dialog"
			aria-modal="true"
			aria-label="Edit miniature light palette"
			@click=${(i) => i.stopPropagation()}>
			<div class="palette-sheet-handle" aria-hidden="true"></div>
			<header class="palette-sheet-header">
				<div>
					<div class="eyebrow">SMART CABINET</div>
					<h2>Miniature Lights</h2>
				</div>
				<button
					type="button"
					class="icon-button palette-sheet-close"
					aria-label="Close palette editor"
					@click=${e.actions.closePaletteEditor}>
					×
				</button>
			</header>
			<div class="palette-current-colour" aria-live="polite">
				${t.toLocaleUpperCase()}
			</div>
			<div
				class="palette-colour-wheel"
				role="button"
				tabindex="0"
				aria-label="Choose a replacement colour for the selected preset"
				@pointerdown=${(i) => Me(e, i)}
				@keydown=${(i) => {
    (i.key === "Enter" || i.key === " ") && (i.preventDefault(), i.currentTarget.click());
  }}>
				<span
					class="palette-colour-wheel-marker"
					style=${`--selected-colour:${t}`}></span>
			</div>
			<div class="palette-editor-list" role="list" aria-label="Palette presets">
				${e._miniaturePalette.map(
    (i, a) => l`<div class="palette-editor-item" role="listitem">
						<button
							type="button"
							class="palette-editor-swatch ${a === e._paletteSelectedIndex ? "selected" : ""}"
							style=${`--swatch:${i}`}
							draggable="true"
							aria-label=${`Select ${i}; drag to reorder`}
							aria-pressed=${String(a === e._paletteSelectedIndex)}
							@click=${() => e.actions.selectPaletteColor(a)}
							@dragstart=${(r) => e.actions.startPaletteDrag(a, r)}
							@dragover=${(r) => r.preventDefault()}
							@drop=${(r) => e.actions.dropPaletteColor(a, r)}
							@dragend=${e.actions.finishPaletteDrag}></button>
						<button
							type="button"
							class="palette-remove"
							aria-label=${`Remove ${i}`}
							?disabled=${e._miniaturePalette.length <= 1}
							@click=${() => e.actions.removePaletteColor(a)}>
							−
						</button>
					</div>`
  )}
			</div>
			<footer class="palette-sheet-footer">
				<button type="button" class="palette-add" @click=${e.actions.addPaletteColor}>
					＋ Add colour
				</button>
				<button type="button" class="primary" @click=${e.actions.closePaletteEditor}>
					Done
				</button>
			</footer>
		</section>
	</div>`;
}, Ee = (e) => l`<section class="light-controls-grid">
	${Ae(e)}${Ce(e)}
</section>`, Te = (e) => {
  const t = e._hass?.states?.[e._config.scene_entity]?.state || "Off", i = t.toLocaleLowerCase();
  return l`${Ee(e)}<div class="view-controls-grid">
		<section class="panel-card view-control-card">
			<div class="eyebrow">SCENES</div>
			<h3>Current: ${t}</h3>
			<p>
				Choosing a scene stops locating and restores the full strip
				output.
			</p>
			<div class="scene-list">
				${Se.map(
    (a) => l`<button
							type="button"
							class="scene-button ${i === a ? "active" : ""}"
							aria-pressed=${String(i === a)}
							@click=${() => e.actions.applyScene(a)}>
							${a[0].toUpperCase() + a.slice(1)}
						</button>`
  )}
			</div>
		</section>
	</div>${Pe(e)}`;
}, Le = (e) => {
  const t = e._viewItem(e._viewIndex);
  if (!t)
    return l`<cabinet-panel-card class="view-card empty-state">
			<b>No assigned miniatures</b>
		</cabinet-panel-card>`;
  const i = e._miniatures.filter(
    (a) => !v(a)
  ).length;
  return l`<section class="panel-card view-card">
		<div class="section-heading view-heading">
			<div>
				<div class="eyebrow">CABINET VIEW</div>
				<h2>Browse miniatures</h2>
			</div>
			<span class="position-badge unassigned"
				>${i} unassigned</span
			>
		</div>
		<div
			id="view-selection"
			class="view-mini-card">
			${X(t.name)}
			<div class="view-mini-content">
				<div class="view-index">
					${e._viewIndex + 1} /
					${e._assignedMiniatures.length}
				</div>
				<h3>${t.name}</h3>
				<p>
					${t.collection || "No collection"} ·
					${t.artist || "Unknown artist"}
				</p>
			</div>
		</div>
		<div class="view-position">
			SHELF ${t.shelf} · LOCATION ${t.location}
		</div>
		<div class="picker-shell">
			<div class="picker-caption">Swipe or drag to locate</div>
			${yt(
    e,
    e._viewIndex,
    e._assignedMiniatures.length,
    !1,
    (a) => e.actions.setViewIndex(a)
  )}
		</div>
		<div class="view-actions">
			<button
				type="button"
				@click=${e.actions.clearViewHighlight}>
				Stop locating
			</button>
		</div>
	</section>`;
}, ze = (e) => l`${Te(e)}${Le(
  e
)}${$e(e)}`, Ie = {
  configuration: pe,
  miniatures: ve,
  search: _e,
  view: ze
}, De = (e) => Ie[e._active](e), pt = async (e, t, i) => {
  e && await e.callService("mqtt", "publish", {
    topic: t,
    payload: JSON.stringify(i),
    qos: 0,
    retain: !1
  });
}, Ne = {
  command_topic: "smartcabinet/cabinet01/api/command",
  layout_entity: "sensor.smart_cabinet_layout",
  miniatures_entity: "sensor.smart_cabinet_miniatures",
  scene_entity: "sensor.smart_cabinet_scene",
  mini_lights_command_topic: "smartcabinet/cabinet01/ha/mini_lights/set",
  power_entity: "switch.smart_cabinet_power",
  brightness_entity: "number.smart_cabinet_brightness",
  mini_lights_entity: "light.miniature_lights"
};
class He extends $ {
  static styles = mt(dt);
  _hass = null;
  _panel = null;
  _narrow = !1;
  _active = "view";
  _selectedShelf = 1;
  _selectedLocation = 1;
  _editingMiniId = null;
  _addingMini = !1;
  _searchTimer = null;
  _dataSignature = null;
  _searchQuery = "";
  _searchField = "all";
  _searchSort = "name";
  _catalogueSort = "name";
  _catalogueView = "list";
  _summarySelected = null;
  _summaryMoveSource = null;
  _summaryMoveTarget = null;
  _viewIndex = 0;
  _viewTimer = null;
  _mappingStart = null;
  _mappingEnd = null;
  _mappingTimer = null;
  _showAllMappings = !1;
  _ledZoom = 1;
  _dialDrag = null;
  _miniatureBrightness = 45;
  _miniatureColor = "#03a9e6";
  _miniaturePower = !0;
  _miniaturePalette = [...j];
  _paletteEditorOpen = !1;
  _paletteSelectedIndex = 0;
  _paletteDragIndex = null;
  _loadedPaletteStorageKey = null;
  _cabinetBrightness = 0;
  _cabinetPower = !1;
  _layoutData = { shelf_count: 0, shelves: [] };
  _miniaturesData = [];
  actions;
  constructor() {
    super(), this._hass = null, this._panel = null, this._narrow = !1, this._active = "view", this._selectedShelf = 1, this._selectedLocation = 1, this._editingMiniId = null, this._addingMini = !1, this._searchTimer = null, this._dataSignature = null, this._searchQuery = "", this._searchField = "all", this._searchSort = "name", this._catalogueSort = "name", this._catalogueView = "list", this._summarySelected = null, this._summaryMoveSource = null, this._summaryMoveTarget = null, this._viewIndex = 0, this._viewTimer = null, this._mappingStart = null, this._mappingEnd = null, this._mappingTimer = null, this._showAllMappings = !1, this._ledZoom = 1, this._dialDrag = null, this._miniatureBrightness = 45, this._miniatureColor = "#03a9e6", this._miniaturePower = !0, this._miniaturePalette = [...j], this._paletteEditorOpen = !1, this._paletteSelectedIndex = 0, this._paletteDragIndex = null, this._loadedPaletteStorageKey = null, this._cabinetBrightness = 0, this._cabinetPower = !1, this.actions = Zt(this);
  }
  set narrow(t) {
    const i = !!t;
    i !== this._narrow && (this._narrow = i, this._render());
  }
  set panel(t) {
    this._panel = t, this._loadPalette(), this._syncStateData(), this._render();
  }
  set hass(t) {
    this._hass = t, this._syncStateData();
    const i = t?.states?.[this._config.layout_entity], a = t?.states?.[this._config.miniatures_entity], r = t?.states?.[this._config.scene_entity], o = `${i?.last_updated || ""}|${a?.last_updated || ""}|${r?.last_updated || ""}`;
    o !== this._dataSignature && (this._dataSignature = o, this._render());
  }
  get _config() {
    return { ...Ne, ...this._panel?.config || {} };
  }
  get _paletteStorageKey() {
    return `smart-cabinet:miniature-palette:${this._config.mini_lights_entity}`;
  }
  get _layout() {
    return this._layoutData;
  }
  get _miniatures() {
    return this._miniaturesData;
  }
  get _assignedMiniatures() {
    return this._miniatures.filter(v);
  }
  _syncStateData() {
    const t = this._hass?.states?.[this._config.layout_entity], i = this._hass?.states?.[this._config.miniatures_entity];
    this._layoutData = Jt(t?.attributes), this._miniaturesData = te(i?.attributes);
    const a = this._hass?.states?.[this._config.power_entity]?.state;
    a !== void 0 && (this._cabinetPower = a.toLocaleLowerCase() === "on");
    const r = this._hass?.states?.[this._config.brightness_entity]?.state;
    r !== void 0 && Number.isFinite(Number(r)) && (this._cabinetBrightness = Math.max(
      0,
      Math.min(100, Number(r))
    ));
    const o = this._hass?.states?.[this._config.mini_lights_entity];
    if (o) {
      this._miniaturePower = o.state.toLocaleLowerCase() === "on";
      const s = Number(o.attributes.brightness);
      Number.isFinite(s) && (this._miniatureBrightness = s);
      const c = o.attributes.rgb_color;
      Array.isArray(c) && c.length >= 3 && (this._miniatureColor = this._rgbToHex({
        r: Number(c[0]),
        g: Number(c[1]),
        b: Number(c[2])
      }));
    }
    this._normalizeSelection();
  }
  _normalizeSelection() {
    const t = this._assignedMiniatures.length;
    this._viewIndex = t ? (this._viewIndex % t + t) % t : 0;
    const i = this._layout.shelves;
    if (!i.length) {
      this._selectedShelf = 1, this._selectedLocation = 1;
      return;
    }
    this._selectedShelf = Math.min(
      Math.max(1, this._selectedShelf),
      i.length
    );
    const a = i[this._selectedShelf - 1];
    this._selectedLocation = Math.min(
      Math.max(1, this._selectedLocation),
      Math.max(1, a.total_locations)
    );
  }
  _viewItem(t) {
    const i = this._assignedMiniatures;
    return i.length ? i[(t % i.length + i.length) % i.length] : null;
  }
  _summaryLocationAnchor(t, i) {
    const a = t.total_leds, r = Math.ceil(a / 2), o = a - r, s = i.start_led + (i.leds - 1) / 2;
    return s < r ? t.mirrored ? {
      run: "forward",
      percent: (r - s - 0.5) / r * 100
    } : {
      run: "forward",
      percent: (s + 0.5) / r * 100
    } : t.mirrored ? {
      run: "return",
      percent: o ? (s - r + 0.5) / o * 100 : 50
    } : {
      run: "return",
      percent: o ? (a - s - 0.5) / o * 100 : 50
    };
  }
  _selectSummaryLocation(t, i) {
    if (this._summaryMoveSource) {
      this._selectSummaryMoveTarget(t, i);
      return;
    }
    this._summarySelected = { shelf: t, location: i };
    const a = this._assignedMiniatures.findIndex(
      (r) => r.shelf === t && r.location === i
    );
    a >= 0 && (this._viewIndex = a), this._command({ action: "highlightLocation", shelf: t, location: i }), this._render();
  }
  _startSummaryMove() {
    const t = this._summarySelected, i = t && this._miniatures.find(
      (a) => a.shelf === t.shelf && a.location === t.location
    );
    !t || !i || (this._summaryMoveSource = t, this._summaryMoveTarget = null, this._render());
  }
  _cancelSummaryMove(t = !1) {
    !this._summaryMoveSource && (!t || !this._summarySelected) || (t && (this._summarySelected = null), this._summaryMoveSource = null, this._summaryMoveTarget = null, t && this._command({ action: "clearHighlight" }), this._render());
  }
  async _selectSummaryMoveTarget(t, i) {
    const a = this._summaryMoveSource, r = { shelf: t, location: i };
    if (!a || a.shelf === r.shelf && a.location === r.location)
      return;
    const o = this._miniatures.find(
      (d) => d.shelf === a.shelf && d.location === a.location
    );
    if (!o) return this._cancelSummaryMove();
    const s = this._miniatures.find(
      (d) => d.shelf === r.shelf && d.location === r.location
    );
    this._summaryMoveTarget = r, this._render(), await new Promise(
      (d) => requestAnimationFrame(() => d())
    );
    const c = s ? `Move ${o.name} to Shelf ${r.shelf}, Location ${r.location}?

${s.name} will become Unassigned.` : `Move ${o.name} to Shelf ${r.shelf}, Location ${r.location}?`;
    if (!confirm(c)) return this._cancelSummaryMove();
    const n = (d, h, p) => this._command({
      action: "updateMiniature",
      id: d.id,
      name: d.name || "",
      collection: d.collection || "",
      artist: d.artist || "",
      date: d.date || "",
      shelf: h,
      location: p,
      notes: d.notes || ""
    });
    s && await n(s, 0, 0), await n(o, r.shelf, r.location), this._summarySelected = r, this._summaryMoveSource = null, this._summaryMoveTarget = null, this._render();
  }
  _startDial(t, i) {
    t.button === 0 && (this._dialDrag = {
      pointerId: t.pointerId,
      x: t.clientX,
      value: i,
      steps: 0
    }, t.currentTarget.setPointerCapture(t.pointerId), t.currentTarget.classList.add("dragging"));
  }
  _moveDial(t, i, a) {
    if (!this._dialDrag || t.pointerId !== this._dialDrag.pointerId)
      return;
    const r = Math.trunc((this._dialDrag.x - t.clientX) / 36);
    r !== this._dialDrag.steps && (this._dialDrag.steps = r, a(((this._dialDrag.value + r) % i + i) % i));
  }
  _finishDial(t) {
    t && t.pointerId !== this._dialDrag?.pointerId || (this._dialDrag = null, t?.currentTarget?.classList.remove(
      "dragging"
    ));
  }
  _command(t) {
    return pt(this._hass, this._config.command_topic, t);
  }
  _setMiniatureLights({
    power: t,
    brightness: i,
    color: a
  }) {
    return t !== void 0 && (this._miniaturePower = t), t === void 0 && (i !== void 0 || a) && (this._miniaturePower = !0), i !== void 0 && (this._miniatureBrightness = Math.max(
      0,
      Math.min(100, Number(i) || 0)
    )), a && (this._miniatureColor = a), this._render(), pt(this._hass, this._config.mini_lights_command_topic, {
      state: this._miniaturePower ? "ON" : "OFF",
      brightness: this._miniatureBrightness,
      color: this._hexToRgb(this._miniatureColor)
    });
  }
  _loadPalette() {
    const t = this._paletteStorageKey;
    if (t !== this._loadedPaletteStorageKey) {
      this._loadedPaletteStorageKey = t, this._miniaturePalette = [...j], this._paletteSelectedIndex = 0;
      try {
        const i = localStorage.getItem(t);
        if (!i) return;
        const a = JSON.parse(i);
        if (!Array.isArray(a)) return;
        const r = a.filter(
          (o) => typeof o == "string" && /^#[0-9a-f]{6}$/i.test(o)
        );
        r.length && (this._miniaturePalette = r.map((o) => o.toLowerCase()));
      } catch {
      }
    }
  }
  _savePalette() {
    try {
      localStorage.setItem(
        this._paletteStorageKey,
        JSON.stringify(this._miniaturePalette)
      );
    } catch {
    }
  }
  _openPaletteEditor() {
    const t = this._miniaturePalette.findIndex(
      (i) => i.toLocaleLowerCase() === this._miniatureColor.toLocaleLowerCase()
    );
    this._paletteSelectedIndex = t >= 0 ? t : 0, this._paletteEditorOpen = !0, this._render();
  }
  _closePaletteEditor() {
    this._paletteEditorOpen = !1, this._paletteDragIndex = null, this._render();
  }
  _selectPaletteColor(t) {
    this._miniaturePalette[t] && (this._paletteSelectedIndex = t, this._render());
  }
  _setPaletteColor(t) {
    return this._miniaturePalette[this._paletteSelectedIndex] ? this._miniaturePalette[this._paletteSelectedIndex] = t : (this._miniaturePalette.push(t), this._paletteSelectedIndex = this._miniaturePalette.length - 1), this._savePalette(), this._setMiniatureLights({ color: t });
  }
  _addPaletteColor() {
    this._miniaturePalette.push(this._miniatureColor), this._paletteSelectedIndex = this._miniaturePalette.length - 1, this._savePalette(), this._render();
  }
  _removePaletteColor(t) {
    this._miniaturePalette.length <= 1 || !this._miniaturePalette[t] || (this._miniaturePalette.splice(t, 1), this._paletteSelectedIndex = Math.min(
      this._paletteSelectedIndex,
      this._miniaturePalette.length - 1
    ), this._savePalette(), this._render());
  }
  _startPaletteDrag(t, i) {
    this._paletteDragIndex = t, i.dataTransfer?.setData("text/plain", String(t)), i.dataTransfer && (i.dataTransfer.effectAllowed = "move"), i.currentTarget.classList.add("dragging");
  }
  _dropPaletteColor(t, i) {
    i.preventDefault();
    const a = this._paletteDragIndex ?? Number(i.dataTransfer?.getData("text/plain"));
    if (!Number.isInteger(a) || a < 0 || a === t) {
      this._finishPaletteDrag();
      return;
    }
    const [r] = this._miniaturePalette.splice(a, 1);
    this._miniaturePalette.splice(t, 0, r), this._paletteSelectedIndex === a ? this._paletteSelectedIndex = t : a < this._paletteSelectedIndex && t >= this._paletteSelectedIndex ? this._paletteSelectedIndex -= 1 : a > this._paletteSelectedIndex && t <= this._paletteSelectedIndex && (this._paletteSelectedIndex += 1), this._savePalette(), this._finishPaletteDrag();
  }
  _finishPaletteDrag() {
    this._paletteDragIndex = null, this._render();
  }
  _setCabinetPower(t) {
    return this._cabinetPower = t, this._render(), this._hass?.callService("switch", t ? "turn_on" : "turn_off", {
      entity_id: this._config.power_entity
    }) ?? Promise.resolve();
  }
  _setCabinetBrightness(t) {
    return this._cabinetBrightness = Math.max(
      0,
      Math.min(100, Number(t) || 0)
    ), this._render(), this._hass?.callService("number", "set_value", {
      entity_id: this._config.brightness_entity,
      value: this._cabinetBrightness
    }) ?? Promise.resolve();
  }
  _hexToRgb(t) {
    const i = t.replace("#", "");
    return {
      r: parseInt(i.slice(0, 2), 16),
      g: parseInt(i.slice(2, 4), 16),
      b: parseInt(i.slice(4, 6), 16)
    };
  }
  _rgbToHex(t = {}) {
    const i = (a) => Number(a || 0).toString(16).padStart(2, "0");
    return `#${i(t.r)}${i(t.g)}${i(t.b)}`;
  }
  render() {
    const t = [
      [
        "view",
        "View",
        l`<svg viewBox="0 0 24 24">
					<path d="M4 19V5m5 14V9m5 10V4m5 15v-8" />
				</svg>`
      ],
      [
        "configuration",
        "Configuration",
        l`<svg viewBox="0 0 24 24">
					<path d="M4 4h16v5H4zm0 11h16v5H4zm4-6v6m8-6v6" />
				</svg>`
      ],
      [
        "miniatures",
        "Miniatures",
        l`<svg viewBox="0 0 24 24">
					<path
						d="M7 20v-2a5 5 0 0 1 10 0v2M12 4a4 4 0 1 1 0 8 4 4 0 0" />
				</svg>`
      ],
      [
        "search",
        "Search",
        l`<svg viewBox="0 0 24 24">
					<circle
						cx="10.5"
						cy="10.5"
						r="5.5" />
					<path d="m15 15 5 5" />
				</svg>`
      ]
    ];
    return l`<style>
				${dt}
			</style>
			<div
				class="app-shell"
				@click=${() => this._cancelSummaryMove(!0)}>
				<header class="topbar">
					<div class="topbar-main">
						<ha-menu-button class="ha-native-menu"></ha-menu-button>
						<div class="brand">
							<div class="brand-icon">SC</div>
							<div>
								<b>Smart Cabinet</b
								><span>Control & catalogue</span>
							</div>
						</div>
					</div>
					<nav>
						${t.map(
      ([i, a, r]) => l`<button
									class="nav-tab ${this._active === i ? "active" : ""}"
									@click=${() => this._selectTab(i)}
									aria-label=${a}
									title=${a}>
									${r}
								</button>`
    )}
					</nav>
				</header>
				<div class="page">${De(this)}</div>
			</div>`;
  }
  _render() {
    this.requestUpdate();
  }
  _selectTab(t) {
    this._active = t, this._render(), t === "view" && this._scheduleViewHighlight();
  }
  _setViewIndex(t) {
    const i = this._assignedMiniatures;
    i.length && (this._viewIndex = (t % i.length + i.length) % i.length, this._render(), this._scheduleViewHighlight());
  }
  _scheduleMappingHighlight() {
    this._mappingTimer !== null && clearTimeout(this._mappingTimer), this._mappingTimer = setTimeout(
      () => this._command({
        action: "highlightLocation",
        shelf: this._selectedShelf,
        location: this._selectedLocation
      }),
      220
    );
  }
  _scheduleViewHighlight() {
    const t = this._viewItem(this._viewIndex);
    t && (this._viewTimer !== null && clearTimeout(this._viewTimer), this._viewTimer = setTimeout(
      () => this._command({
        action: "highlightLocation",
        shelf: Number(t.shelf),
        location: Number(t.location)
      }),
      220
    ));
  }
  async _saveMini() {
    const t = this.shadowRoot?.querySelector("#mini-name"), i = this.shadowRoot?.querySelector(
      "#mini-collection"
    ), a = this.shadowRoot?.querySelector("#mini-artist");
    if (!t || !i || !a) return;
    const r = t.value.trim(), o = i.value.trim(), s = a.value.trim();
    if (!r) return;
    const c = this._miniatures.find(
      (n) => n.id === this._editingMiniId
    );
    await this._command(
      c ? {
        action: "updateMiniature",
        id: c.id,
        name: r,
        collection: o,
        artist: s,
        date: c.date || "",
        shelf: c.shelf || 0,
        location: c.location || 0,
        notes: c.notes || ""
      } : {
        action: "createMiniature",
        name: r,
        collection: o,
        artist: s,
        date: "",
        shelf: 0,
        location: 0,
        notes: ""
      }
    ), this._editingMiniId = null, this._addingMini = !1, this._render();
  }
  _scheduleSearch() {
    this._searchTimer !== null && clearTimeout(this._searchTimer), this._searchTimer = setTimeout(() => this._highlightSearch(), 220);
  }
  async _highlightSearch() {
    const t = this._searchQuery.trim().toLocaleLowerCase();
    if (!t) return this._command({ action: "clearHighlight" });
    const i = _t(
      this._miniatures,
      t,
      this._searchField
    ).filter(v);
    return this._command(
      i.length ? {
        action: "highlightLocations",
        locations: i.map((a) => ({
          shelf: a.shelf,
          location: a.location
        }))
      } : { action: "clearHighlight" }
    );
  }
}
customElements.define("ha-panel-smart-cabinet", He);
