const T = globalThis, D = T.ShadowRoot && (T.ShadyCSS === void 0 || T.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ie = /* @__PURE__ */ Symbol(), V = /* @__PURE__ */ new WeakMap();
let ue = class {
  constructor(e, i, a) {
    if (this._$cssResult$ = !0, a !== ie) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = i;
  }
  get styleSheet() {
    let e = this.o;
    const i = this.t;
    if (D && e === void 0) {
      const a = i !== void 0 && i.length === 1;
      a && (e = V.get(i)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), a && V.set(i, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const ae = (t) => new ue(typeof t == "string" ? t : t + "", void 0, ie), me = (t, e) => {
  if (D) t.adoptedStyleSheets = e.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of e) {
    const a = document.createElement("style"), r = T.litNonce;
    r !== void 0 && a.setAttribute("nonce", r), a.textContent = i.cssText, t.appendChild(a);
  }
}, j = D ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let i = "";
  for (const a of e.cssRules) i += a.cssText;
  return ae(i);
})(t) : t;
const { is: ge, defineProperty: ve, getOwnPropertyDescriptor: fe, getOwnPropertyNames: be, getOwnPropertySymbols: xe, getPrototypeOf: _e } = Object, z = globalThis, q = z.trustedTypes, ye = q ? q.emptyScript : "", $e = z.reactiveElementPolyfillSupport, M = (t, e) => t, P = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? ye : null;
      break;
    case Object:
    case Array:
      t = t == null ? t : JSON.stringify(t);
  }
  return t;
}, fromAttribute(t, e) {
  let i = t;
  switch (e) {
    case Boolean:
      i = t !== null;
      break;
    case Number:
      i = t === null ? null : Number(t);
      break;
    case Object:
    case Array:
      try {
        i = JSON.parse(t);
      } catch {
        i = null;
      }
  }
  return i;
} }, re = (t, e) => !ge(t, e), F = { attribute: !0, type: String, converter: P, reflect: !1, useDefault: !1, hasChanged: re };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), z.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let y = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, i = F) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(e, i), !i.noAccessor) {
      const a = /* @__PURE__ */ Symbol(), r = this.getPropertyDescriptor(e, a, i);
      r !== void 0 && ve(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, i, a) {
    const { get: r, set: o } = fe(this.prototype, e) ?? { get() {
      return this[i];
    }, set(n) {
      this[i] = n;
    } };
    return { get: r, set(n) {
      const s = r?.call(this);
      o?.call(this, n), this.requestUpdate(e, s, a);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? F;
  }
  static _$Ei() {
    if (this.hasOwnProperty(M("elementProperties"))) return;
    const e = _e(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(M("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(M("properties"))) {
      const i = this.properties, a = [...be(i), ...xe(i)];
      for (const r of a) this.createProperty(r, i[r]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const i = litPropertyMetadata.get(e);
      if (i !== void 0) for (const [a, r] of i) this.elementProperties.set(a, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [i, a] of this.elementProperties) {
      const r = this._$Eu(i, a);
      r !== void 0 && this._$Eh.set(r, i);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const i = [];
    if (Array.isArray(e)) {
      const a = new Set(e.flat(1 / 0).reverse());
      for (const r of a) i.unshift(j(r));
    } else e !== void 0 && i.push(j(e));
    return i;
  }
  static _$Eu(e, i) {
    const a = i.attribute;
    return a === !1 ? void 0 : typeof a == "string" ? a : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
  }
  addController(e) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
  }
  removeController(e) {
    this._$EO?.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), i = this.constructor.elementProperties;
    for (const a of i.keys()) this.hasOwnProperty(a) && (e.set(a, this[a]), delete this[a]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return me(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, i, a) {
    this._$AK(e, a);
  }
  _$ET(e, i) {
    const a = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, a);
    if (r !== void 0 && a.reflect === !0) {
      const o = (a.converter?.toAttribute !== void 0 ? a.converter : P).toAttribute(i, a.type);
      this._$Em = e, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(e, i) {
    const a = this.constructor, r = a._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const o = a.getPropertyOptions(r), n = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : P;
      this._$Em = r;
      const s = n.fromAttribute(i, o.type);
      this[r] = s ?? this._$Ej?.get(r) ?? s, this._$Em = null;
    }
  }
  requestUpdate(e, i, a, r = !1, o) {
    if (e !== void 0) {
      const n = this.constructor;
      if (r === !1 && (o = this[e]), a ??= n.getPropertyOptions(e), !((a.hasChanged ?? re)(o, i) || a.useDefault && a.reflect && o === this._$Ej?.get(e) && !this.hasAttribute(n._$Eu(e, a)))) return;
      this.C(e, i, a);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, i, { useDefault: a, reflect: r, wrapped: o }, n) {
    a && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, n ?? i ?? this[e]), o !== !0 || n !== void 0) || (this._$AL.has(e) || (this.hasUpdated || a || (i = void 0), this._$AL.set(e, i)), r === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (i) {
      Promise.reject(i);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
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
        const { wrapped: n } = o, s = this[r];
        n !== !0 || this._$AL.has(r) || s === void 0 || this.C(r, void 0, o, s);
      }
    }
    let e = !1;
    const i = this._$AL;
    try {
      e = this.shouldUpdate(i), e ? (this.willUpdate(i), this._$EO?.forEach((a) => a.hostUpdate?.()), this.update(i)) : this._$EM();
    } catch (a) {
      throw e = !1, this._$EM(), a;
    }
    e && this._$AE(i);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((i) => i.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
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
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq &&= this._$Eq.forEach((i) => this._$ET(i, this[i])), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[M("elementProperties")] = /* @__PURE__ */ new Map(), y[M("finalized")] = /* @__PURE__ */ new Map(), $e?.({ ReactiveElement: y }), (z.reactiveElementVersions ??= []).push("2.1.2");
const U = globalThis, W = (t) => t, L = U.trustedTypes, G = L ? L.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, oe = "$lit$", v = `lit$${Math.random().toFixed(9).slice(2)}$`, ne = "?" + v, we = `<${ne}>`, x = document, A = () => x.createComment(""), E = (t) => t === null || typeof t != "object" && typeof t != "function", R = Array.isArray, Se = (t) => R(t) || typeof t?.[Symbol.iterator] == "function", H = `[ 	
\f\r]`, k = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Z = /-->/g, Q = />/g, f = RegExp(`>|${H}(?:([^\\s"'>=/]+)(${H}*=${H}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), J = /'/g, X = /"/g, se = /^(?:script|style|textarea|title)$/i, ke = (t) => (e, ...i) => ({ _$litType$: t, strings: e, values: i }), d = ke(1), w = /* @__PURE__ */ Symbol.for("lit-noChange"), u = /* @__PURE__ */ Symbol.for("lit-nothing"), K = /* @__PURE__ */ new WeakMap(), b = x.createTreeWalker(x, 129);
function le(t, e) {
  if (!R(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return G !== void 0 ? G.createHTML(e) : e;
}
const Me = (t, e) => {
  const i = t.length - 1, a = [];
  let r, o = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", n = k;
  for (let s = 0; s < i; s++) {
    const l = t[s];
    let c, h, p = -1, m = 0;
    for (; m < l.length && (n.lastIndex = m, h = n.exec(l), h !== null); ) m = n.lastIndex, n === k ? h[1] === "!--" ? n = Z : h[1] !== void 0 ? n = Q : h[2] !== void 0 ? (se.test(h[2]) && (r = RegExp("</" + h[2], "g")), n = f) : h[3] !== void 0 && (n = f) : n === f ? h[0] === ">" ? (n = r ?? k, p = -1) : h[1] === void 0 ? p = -2 : (p = n.lastIndex - h[2].length, c = h[1], n = h[3] === void 0 ? f : h[3] === '"' ? X : J) : n === X || n === J ? n = f : n === Z || n === Q ? n = k : (n = f, r = void 0);
    const g = n === f && t[s + 1].startsWith("/>") ? " " : "";
    o += n === k ? l + we : p >= 0 ? (a.push(c), l.slice(0, p) + oe + l.slice(p) + v + g) : l + v + (p === -2 ? s : g);
  }
  return [le(t, o + (t[i] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), a];
};
class C {
  constructor({ strings: e, _$litType$: i }, a) {
    let r;
    this.parts = [];
    let o = 0, n = 0;
    const s = e.length - 1, l = this.parts, [c, h] = Me(e, i);
    if (this.el = C.createElement(c, a), b.currentNode = this.el.content, i === 2 || i === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (r = b.nextNode()) !== null && l.length < s; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const p of r.getAttributeNames()) if (p.endsWith(oe)) {
          const m = h[n++], g = r.getAttribute(p).split(v), _ = /([.?@])?(.*)/.exec(m);
          l.push({ type: 1, index: o, name: _[2], strings: g, ctor: _[1] === "." ? Ee : _[1] === "?" ? Ce : _[1] === "@" ? Ne : I }), r.removeAttribute(p);
        } else p.startsWith(v) && (l.push({ type: 6, index: o }), r.removeAttribute(p));
        if (se.test(r.tagName)) {
          const p = r.textContent.split(v), m = p.length - 1;
          if (m > 0) {
            r.textContent = L ? L.emptyScript : "";
            for (let g = 0; g < m; g++) r.append(p[g], A()), b.nextNode(), l.push({ type: 2, index: ++o });
            r.append(p[m], A());
          }
        }
      } else if (r.nodeType === 8) if (r.data === ne) l.push({ type: 2, index: o });
      else {
        let p = -1;
        for (; (p = r.data.indexOf(v, p + 1)) !== -1; ) l.push({ type: 7, index: o }), p += v.length - 1;
      }
      o++;
    }
  }
  static createElement(e, i) {
    const a = x.createElement("template");
    return a.innerHTML = e, a;
  }
}
function S(t, e, i = t, a) {
  if (e === w) return e;
  let r = a !== void 0 ? i._$Co?.[a] : i._$Cl;
  const o = E(e) ? void 0 : e._$litDirective$;
  return r?.constructor !== o && (r?._$AO?.(!1), o === void 0 ? r = void 0 : (r = new o(t), r._$AT(t, i, a)), a !== void 0 ? (i._$Co ??= [])[a] = r : i._$Cl = r), r !== void 0 && (e = S(t, r._$AS(t, e.values), r, a)), e;
}
class Ae {
  constructor(e, i) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = i;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: i }, parts: a } = this._$AD, r = (e?.creationScope ?? x).importNode(i, !0);
    b.currentNode = r;
    let o = b.nextNode(), n = 0, s = 0, l = a[0];
    for (; l !== void 0; ) {
      if (n === l.index) {
        let c;
        l.type === 2 ? c = new N(o, o.nextSibling, this, e) : l.type === 1 ? c = new l.ctor(o, l.name, l.strings, this, e) : l.type === 6 && (c = new Te(o, this, e)), this._$AV.push(c), l = a[++s];
      }
      n !== l?.index && (o = b.nextNode(), n++);
    }
    return b.currentNode = x, r;
  }
  p(e) {
    let i = 0;
    for (const a of this._$AV) a !== void 0 && (a.strings !== void 0 ? (a._$AI(e, a, i), i += a.strings.length - 2) : a._$AI(e[i])), i++;
  }
}
class N {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, i, a, r) {
    this.type = 2, this._$AH = u, this._$AN = void 0, this._$AA = e, this._$AB = i, this._$AM = a, this.options = r, this._$Cv = r?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const i = this._$AM;
    return i !== void 0 && e?.nodeType === 11 && (e = i.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, i = this) {
    e = S(this, e, i), E(e) ? e === u || e == null || e === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : e !== this._$AH && e !== w && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Se(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== u && E(this._$AH) ? this._$AA.nextSibling.data = e : this.T(x.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: i, _$litType$: a } = e, r = typeof a == "number" ? this._$AC(e) : (a.el === void 0 && (a.el = C.createElement(le(a.h, a.h[0]), this.options)), a);
    if (this._$AH?._$AD === r) this._$AH.p(i);
    else {
      const o = new Ae(r, this), n = o.u(this.options);
      o.p(i), this.T(n), this._$AH = o;
    }
  }
  _$AC(e) {
    let i = K.get(e.strings);
    return i === void 0 && K.set(e.strings, i = new C(e)), i;
  }
  k(e) {
    R(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let a, r = 0;
    for (const o of e) r === i.length ? i.push(a = new N(this.O(A()), this.O(A()), this, this.options)) : a = i[r], a._$AI(o), r++;
    r < i.length && (this._$AR(a && a._$AB.nextSibling, r), i.length = r);
  }
  _$AR(e = this._$AA.nextSibling, i) {
    for (this._$AP?.(!1, !0, i); e !== this._$AB; ) {
      const a = W(e).nextSibling;
      W(e).remove(), e = a;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class I {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, i, a, r, o) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = e, this.name = i, this._$AM = r, this.options = o, a.length > 2 || a[0] !== "" || a[1] !== "" ? (this._$AH = Array(a.length - 1).fill(new String()), this.strings = a) : this._$AH = u;
  }
  _$AI(e, i = this, a, r) {
    const o = this.strings;
    let n = !1;
    if (o === void 0) e = S(this, e, i, 0), n = !E(e) || e !== this._$AH && e !== w, n && (this._$AH = e);
    else {
      const s = e;
      let l, c;
      for (e = o[0], l = 0; l < o.length - 1; l++) c = S(this, s[a + l], i, l), c === w && (c = this._$AH[l]), n ||= !E(c) || c !== this._$AH[l], c === u ? e = u : e !== u && (e += (c ?? "") + o[l + 1]), this._$AH[l] = c;
    }
    n && !r && this.j(e);
  }
  j(e) {
    e === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Ee extends I {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === u ? void 0 : e;
  }
}
class Ce extends I {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== u);
  }
}
class Ne extends I {
  constructor(e, i, a, r, o) {
    super(e, i, a, r, o), this.type = 5;
  }
  _$AI(e, i = this) {
    if ((e = S(this, e, i, 0) ?? u) === w) return;
    const a = this._$AH, r = e === u && a !== u || e.capture !== a.capture || e.once !== a.once || e.passive !== a.passive, o = e !== u && (a === u || r);
    r && this.element.removeEventListener(this.name, this, a), o && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Te {
  constructor(e, i, a) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = a;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    S(this, e);
  }
}
const Le = U.litHtmlPolyfillSupport;
Le?.(C, N), (U.litHtmlVersions ??= []).push("3.3.3");
const ze = (t, e, i) => {
  const a = i?.renderBefore ?? e;
  let r = a._$litPart$;
  if (r === void 0) {
    const o = i?.renderBefore ?? null;
    a._$litPart$ = r = new N(e.insertBefore(A(), o), o, void 0, i ?? {});
  }
  return r._$AI(t), r;
};
const O = globalThis;
class $ extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const i = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ze(i, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return w;
  }
}
$._$litElement$ = !0, $.finalized = !0, O.litElementHydrateSupport?.({ LitElement: $ });
const Ie = O.litElementPolyfillSupport;
Ie?.({ LitElement: $ });
(O.litElementVersions ??= []).push("4.2.2");
class He extends $ {
  createRenderRoot() {
    return this;
  }
  render() {
    return d`<section class="panel-card ${this.className || ""}">
			<slot></slot>
		</section>`;
  }
}
customElements.define("cabinet-panel-card", He);
const Y = (t, e) => t.shadowRoot.querySelector(e)?.value, Pe = (t) => ({
  setHighlightColor: (e) => t._command({ action: "setHighlightColor", ...t._hexToRgb(e) }),
  selectShelf: (e) => {
    t._selectedShelf = e, t._selectedLocation = 1, t._render();
  },
  selectLocation: async (e) => {
    t._selectedLocation = e, await t._command({
      action: "highlightLocation",
      shelf: t._selectedShelf,
      location: e
    }), t._render();
  },
  insertShelf: (e) => t._command({ action: "insertShelf", position: e }),
  duplicateShelf: (e) => t._command({ action: "duplicateShelf", shelf: e }),
  deleteShelf: async (e) => {
    confirm(
      `Delete Shelf ${e}? Miniatures on it will become Unassigned.`
    ) && await t._command({ action: "deleteShelf", shelf: e });
  },
  moveShelf: async (e, i) => {
    await t._command({ action: "moveShelf", from: e, to: i }), t._selectedShelf = i;
  },
  saveShelf: () => t._command({
    action: "setShelfConfig",
    shelf: t._selectedShelf,
    total_leds: Number(Y(t, "#shelf-leds")),
    total_locations: Number(Y(t, "#shelf-locations"))
  }),
  autoMap: () => t._command({ action: "autoMapShelf", shelf: t._selectedShelf }),
  clearMap: async () => {
    confirm("Clear every location mapping on this shelf?") && await t._command({
      action: "clearShelfMapping",
      shelf: t._selectedShelf
    });
  },
  toggleDirection: () => {
    const e = t._layout.shelves?.[t._selectedShelf - 1];
    return t._command({
      action: "setShelfDirection",
      shelf: t._selectedShelf,
      mirrored: !e?.mirrored
    });
  },
  zoom: (e) => {
    t._ledZoom = Math.min(2, Math.max(0.5, t._ledZoom + e)), t._render();
  },
  setShowAllMappings: (e) => {
    t._showAllMappings = e, t._render();
  },
  selectMappingLocation: (e, i) => {
    t._selectedLocation = (e % i + i) % i + 1, t._mappingStart = null, t._mappingEnd = null, t._render(), t._scheduleMappingHighlight();
  },
  selectLed: async (e) => {
    if (t._mappingStart === null || t._mappingEnd !== null)
      t._mappingStart = e, t._mappingEnd = null;
    else {
      t._mappingEnd = e;
      const i = Math.min(t._mappingStart, t._mappingEnd);
      await t._command({
        action: "previewLocation",
        shelf: t._selectedShelf,
        location: t._selectedLocation,
        start_led: i,
        leds: Math.abs(t._mappingEnd - t._mappingStart) + 1
      });
    }
    t._render();
  },
  resetLedRange: async () => {
    t._mappingStart = null, t._mappingEnd = null, await t._command({
      action: "highlightLocation",
      shelf: t._selectedShelf,
      location: t._selectedLocation
    }), t._render();
  },
  saveLedRange: async () => {
    const e = Math.min(t._mappingStart, t._mappingEnd);
    await t._command({
      action: "setLocationConfig",
      shelf: t._selectedShelf,
      location: t._selectedLocation,
      start_led: e,
      leds: Math.abs(t._mappingEnd - t._mappingStart) + 1
    }), t._mappingStart = null, t._mappingEnd = null;
  },
  editMini: (e) => {
    t._editingMiniId = e, t._addingMini = !1, t._render();
  },
  addMini: () => {
    t._editingMiniId = null, t._addingMini = !0, t._render();
  },
  cancelMini: () => {
    t._editingMiniId = null, t._addingMini = !1, t._render();
  },
  saveMini: () => t._saveMini(),
  deleteMini: async (e) => {
    const i = t._miniatures.find((a) => a.id === e);
    confirm(`Delete ${i?.name || "this miniature"}?`) && await t._command({ action: "deleteMiniature", id: e });
  },
  highlightOne: (e) => {
    const i = t._miniatures.find((a) => a.id === e);
    return i?.shelf ? t._command({
      action: "highlightLocation",
      shelf: i.shelf,
      location: i.location
    }) : void 0;
  },
  setViewIndex: (e) => t._setViewIndex(e),
  clearViewHighlight: async () => {
    clearTimeout(t._viewTimer), await t._command({ action: "clearHighlight" });
  },
  applyScene: async (e) => {
    clearTimeout(t._viewTimer), await t._command({ action: "applyScene", scene: e });
  },
  setSearchQuery: (e) => {
    t._searchQuery = e, t._render(), t._scheduleSearch();
  },
  setSearchField: (e) => {
    t._searchField = e, t._render(), t._scheduleSearch();
  },
  setSort: (e, i) => {
    t[e] = i, t._render();
  },
  setCatalogueView: (e) => {
    t._catalogueView = e, t._render();
  }
}), ee = ':host{display:block;min-height:100%;background:var(--primary-background-color);color:var(--primary-text-color);font-family:var(--paper-font-body1_-_font-family, Roboto, sans-serif)}cabinet-dial-picker,cabinet-panel-card{display:block}*{box-sizing:border-box}button,input,select{font:inherit}button{cursor:pointer}button:disabled{cursor:not-allowed;opacity:.42}.app-shell{min-height:100vh;overflow-x:hidden;padding-bottom:env(safe-area-inset-bottom,0px)}.topbar{position:sticky;top:0;z-index:4;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:14px 28px;border-bottom:1px solid var(--divider-color);background:var( --app-header-background-color, var(--card-background-color) );box-shadow:0 1px 8px #0000000f}.topbar-main{display:flex;align-items:center;gap:10px;min-width:0}.ha-native-menu{flex:0 0 auto;margin-left:-6px}.brand{display:flex;align-items:center;gap:11px;min-width:190px}.brand-icon{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;background:var(--primary-color);color:var(--text-primary-color);font-weight:800;font-size:13px}.brand b,.brand span{display:block}.brand span{margin-top:2px;color:var(--secondary-text-color);font-size:12px}nav{display:flex;gap:4px;padding:4px;border-radius:12px;background:var(--secondary-background-color)}.nav-tab{display:grid;place-items:center;width:42px;height:38px;border:0;background:transparent;color:var(--secondary-text-color);padding:0;border-radius:9px}.nav-tab svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.nav-tab.active{background:var(--card-background-color);color:var(--primary-text-color);box-shadow:0 1px 4px #00000017}.page{max-width:1500px;margin:0 auto;overflow-x:hidden;padding:28px}.panel-card{border:1px solid var(--divider-color);background:var(--card-background-color);border-radius:18px;box-shadow:var(--ha-card-box-shadow, 0 2px 8px rgba(0, 0, 0, .04))}.general-card{display:flex;justify-content:space-between;align-items:center;gap:30px;padding:22px 24px;margin-bottom:18px}h2,h3,p{margin:0}h2{font-size:22px}h3{font-size:16px}p{margin-top:6px;color:var(--secondary-text-color);font-size:13px;line-height:1.5}.eyebrow{margin-bottom:5px;color:var(--primary-color);font-size:10px;letter-spacing:.12em;font-weight:800}.general-values{display:flex;align-items:center;gap:12px}.metric,.color-control{min-width:110px;padding:10px 13px;background:var(--secondary-background-color);border-radius:12px}.metric span,.color-control span{display:block;color:var(--secondary-text-color);font-size:11px;margin-bottom:5px}.metric b{font-size:20px}.color-control{display:grid;grid-template-columns:1fr auto;column-gap:12px;align-items:center;min-width:170px}.color-control span{margin:0}input[type=color]{width:34px;height:28px;border:0;padding:0;background:none}.configuration-grid{display:grid;grid-template-columns:300px minmax(0,1fr);min-width:0;gap:18px;align-items:start}.shelf-detail{min-width:0;overflow:hidden}.shelf-list,.shelf-detail,.mini-editor,.mini-list-card,.search-card{padding:20px}.section-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}.shelf-items{display:grid;gap:5px}.shelf-row{display:flex;align-items:center;border:1px solid transparent;border-radius:12px;background:var(--secondary-background-color)}.shelf-row.selected{border-color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 10%,var(--card-background-color))}.shelf-select{flex:1;display:flex;align-items:center;gap:10px;text-align:left;padding:10px;border:0;color:inherit;background:transparent}.shelf-select span:last-child{min-width:0}.shelf-select b,.shelf-select small{display:block}.shelf-select small{margin-top:2px;color:var(--secondary-text-color);font-size:10px}.shelf-number,.location-index{display:grid;place-items:center;flex:0 0 32px;height:32px;border-radius:9px;background:var(--card-background-color);font-weight:700;font-size:12px}.row-actions{display:flex;gap:4px;padding-right:7px}.icon-button{width:28px;height:28px;padding:0;border:0;border-radius:8px;background:var(--card-background-color);color:inherit}.insert-shelf{width:100%;border:0;background:transparent;color:var(--primary-color);padding:4px;font-size:10px;opacity:.65}.insert-shelf:hover{opacity:1}.form-grid{display:grid;gap:12px;margin-top:16px}.form-grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}label span{display:block;margin-bottom:6px;color:var(--secondary-text-color);font-size:11px;font-weight:600}input,select{width:100%;min-height:40px;border:1px solid var(--divider-color);border-radius:10px;padding:8px 10px;background:var(--primary-background-color);color:var(--primary-text-color);outline:none}input:focus,select:focus{border-color:var(--primary-color);box-shadow:0 0 0 2px color-mix(in srgb,var(--primary-color) 20%,transparent)}.button-row{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}.button-row.end{justify-content:flex-end}button:not(.nav-tab):not(.shelf-select):not(.icon-button):not(.insert-shelf):not(.location-row):not(.search-result):not(.summary-hex){min-height:38px;border:1px solid var(--divider-color);border-radius:10px;padding:0 13px;background:var(--secondary-background-color);color:var(--primary-text-color)}button.primary{border-color:var(--primary-color)!important;background:var(--primary-color)!important;color:var(--text-primary-color)!important}button.small{min-height:32px!important;font-size:11px}button.ghost{background:transparent!important}button.danger{color:var(--error-color)!important}button.full{width:100%;margin-top:14px}.divider{height:1px;background:var(--divider-color);margin:22px 0}.locations-layout{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(260px,.75fr);gap:18px}.legacy-mapping{display:none}.mapping-visual{min-width:0}.mapping-toggle{display:flex;align-items:center;gap:7px;color:var(--secondary-text-color);font-size:11px}.mapping-toggle input{width:auto;min-height:auto;accent-color:var(--primary-color)}.picker-dial.compact{margin:10px 0 14px;min-height:48px}.picker-dial.compact .dial-tick em{display:none}.picker-dial.compact .dial-tick.active b{font-size:22px}.mapping-dial-selected{display:grid;place-items:center;height:32px;margin:4px 0 2px;color:var(--primary-color);font-size:32px;font-weight:800;line-height:1}.picker-dial.compact .dial-tick.active b{visibility:hidden}.mapping-tools{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mapping-tools b{margin-left:auto;color:var(--secondary-text-color);font-size:11px}.mapping-range{margin-left:auto;padding:8px 10px;border:1px solid var(--divider-color);border-radius:9px;color:var(--primary-text-color);font-size:11px;font-weight:700}.mapping-range span{margin-left:6px;color:var(--secondary-text-color);font-weight:600}.led-runs{display:grid;gap:20px;max-width:100%;margin-top:16px;overflow-x:auto;padding:4px 0 20px}.led-run{display:grid;grid-auto-flow:column;grid-auto-columns:var(--led-size);width:max-content;min-height:calc(var(--led-size) + 18px)}.led-run.return{margin-left:0}.led-cell{position:relative;width:var(--led-size);height:var(--led-size);min-width:var(--led-size);padding:0;border:1px solid var(--divider-color);border-radius:1px;background:var(--secondary-background-color)}.led-cell.selected{background:#fff;border-color:#fff}.led-cell.assigned{background:color-mix(in srgb,var(--primary-color) 35%,var(--secondary-background-color))}.led-cell.range-start{background:#e83e8c;border-color:#e83e8c}.led-cell.range-end{background:#ff8a00;border-color:#ff8a00}.led-cell small{position:absolute;top:calc(var(--led-size) * 4 + 4px);left:50%;transform:translate(-50%);color:var(--secondary-text-color);font-size:8px;font-weight:600}.mapping-visual{min-width:0;max-width:100%;overflow:hidden}.led-runs{position:relative;contain:inline-size;min-width:0;max-width:100%;width:100%;gap:44px;overflow-x:auto;overflow-y:hidden;padding:8px 32px 24px 28px}.led-runs-content{display:grid;width:max-content;min-width:100%;gap:44px;justify-items:center}.led-run{gap:2px;position:relative}.led-cell{min-height:0!important;height:calc(var(--led-size) * 4)!important;min-width:var(--led-size)!important;width:var(--led-size)!important;padding:0!important;border-radius:1px!important}.led-cell.assigned{background:color-mix(in srgb,var(--primary-color) 35%,var(--secondary-background-color))!important}.led-cell.selected{background:#fff!important;border-color:#fff!important}.led-cell.range-start{background:#e83e8c!important;border-color:#e83e8c!important}.led-cell.range-end{background:#ff8a00!important;border-color:#ff8a00!important}.power-mark{position:absolute;top:4px;left:-20px;display:grid;place-items:center;width:1rem;height:1rem;border-radius:50%;background:var(--primary-color);color:var(--text-primary-color);font-size:10px;z-index:2}.led-runs.mirrored .power-mark{left:auto;right:-20px}.led-run:first-of-type:after{content:none}.strip-connector{position:absolute;z-index:3;top:50%;right:-20px;width:16px;height:calc(var(--led-size) * 4 + 44px);border:2px dashed var(--secondary-text-color);border-left:0;border-radius:0 10px 10px 0;opacity:.9;pointer-events:none}.led-runs.mirrored .strip-connector{right:auto;left:-20px;transform:scaleX(-1)}.led-run{width:max-content;grid-auto-columns:max-content;justify-content:start}.led-run .led-cell{width:auto!important;min-width:0!important;aspect-ratio:1 / 2}.mapping-toggle input{position:absolute;opacity:0;pointer-events:none}.mapping-toggle-icon{display:grid;place-items:center;width:28px;height:28px;border:1px solid var(--divider-color);border-radius:50%;background:var(--secondary-background-color)}.mapping-toggle-icon svg{width:15px;height:15px;fill:none;stroke:var(--secondary-text-color);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.mapping-toggle input:checked+.mapping-toggle-icon{border-color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 18%,var(--secondary-background-color))}.mapping-toggle input:checked+.mapping-toggle-icon svg{stroke:var(--primary-color);fill:color-mix(in srgb,var(--primary-color) 20%,transparent)}.location-list{display:grid;gap:5px;max-height:470px;overflow:auto;padding-right:4px}.location-row{display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:10px;width:100%;min-height:48px;border:1px solid var(--divider-color);border-radius:11px;padding:7px 10px;background:transparent;color:inherit;text-align:left}.location-row.selected{border-color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 9%,transparent)}.location-row.unmapped{opacity:.66}.location-range{font-size:12px}.location-count,.muted{color:var(--secondary-text-color);font-size:11px}.location-editor{align-self:start;padding:18px;border-radius:14px;background:var(--secondary-background-color)}.range-preview{display:flex;justify-content:space-between;gap:12px;margin-top:12px;padding:10px 12px;background:var(--card-background-color);border-radius:10px;font-size:11px}.range-preview span{color:var(--secondary-text-color)}.miniatures-grid{display:grid;grid-template-columns:330px minmax(0,1fr);gap:18px;align-items:start}.miniatures-grid.catalogue-only{grid-template-columns:minmax(0,1fr)}.mini-editor{position:sticky;top:90px}.mini-list{display:grid;gap:7px;max-height:min(65vh,620px);overflow-y:auto;padding-right:4px}.catalogue-toolbar,.view-toggle{display:flex;align-items:center;gap:7px}.view-toggle{gap:2px;padding:2px;border:1px solid var(--divider-color);border-radius:10px;background:var(--secondary-background-color)}.view-toggle .icon-button{background:transparent;color:var(--secondary-text-color)}.view-toggle .icon-button.active{background:var(--card-background-color);color:var(--primary-color)}.icon-button svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.mini-list.grid{grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;max-height:min(65vh,620px);overflow-y:auto;overflow-x:hidden;padding-right:0}.mini-row.mini-card{position:relative;grid-template-columns:38px minmax(0,1fr);align-content:start;min-height:0;padding:13px;gap:10px}.mini-row.mini-card .mini-artist,.mini-row.mini-card .position-badge{grid-column:1 / -1}.mini-row.mini-card .mini-main{padding-right:60px}.mini-row.mini-card .mini-artist{margin:0}.mini-row.mini-card .position-badge{justify-self:start}.mini-row.mini-card .row-actions{position:absolute;top:11px;right:11px;gap:2px;padding:2px;border:1px solid var(--divider-color);border-radius:9px;background:var(--secondary-background-color)}.mini-row.mini-card .row-actions .icon-button{background:transparent}.mini-row{display:grid;grid-template-columns:38px minmax(160px,1fr) minmax(120px,.7fr) auto auto;gap:11px;align-items:center;padding:10px;border:1px solid var(--divider-color);border-radius:12px}.mini-avatar{display:grid;place-items:center;width:36px;height:36px;border-radius:11px;background:color-mix(in srgb,var(--primary-color) 14%,var(--secondary-background-color));color:var(--primary-color);font-weight:800}.mini-main b,.mini-main span{display:block}.mini-main span,.mini-artist{color:var(--secondary-text-color);font-size:11px;margin-top:2px}.position-badge{white-space:nowrap;padding:5px 8px;border-radius:999px;background:color-mix(in srgb,var(--primary-color) 12%,transparent);color:var(--primary-color);font-size:10px;font-weight:700}.position-badge.unassigned{background:var(--secondary-background-color);color:var(--secondary-text-color)}.search-card{max-width:980px;margin:0 auto}.search-controls{display:grid;grid-template-columns:1fr 180px;gap:10px;margin-top:20px}.search-summary{margin:12px 2px}.sort-controls{display:flex;align-items:center;gap:7px;margin:0 2px 12px;color:var(--secondary-text-color);font-size:11px}.sort-button{min-height:30px!important;padding:0 9px!important;font-size:11px}.sort-button.active{border-color:var(--primary-color)!important;color:var(--primary-color)!important}.search-results{display:grid;gap:7px;max-height:min(55vh,520px);overflow-y:auto;padding-right:4px}.search-result{display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:12px;width:100%;padding:10px;border:1px solid var(--divider-color);border-radius:12px;background:transparent;color:inherit;text-align:left}.search-result:hover:not(:disabled){border-color:var(--primary-color)}.search-result-main b,.search-result-main span{display:block}.search-result-main span{margin-top:3px;color:var(--secondary-text-color);font-size:11px}.view-card{max-width:760px;margin:0 auto;padding:22px}.cabinet-summary{max-width:760px;margin:18px auto;padding:22px}.summary-actions{display:flex;align-items:center;gap:10px}.summary-shelves{display:grid;gap:12px}.summary-shelf{padding:14px;border-radius:13px;background:var(--secondary-background-color)}.summary-shelf-heading{display:flex;justify-content:space-between;gap:12px;margin-bottom:10px;font-size:12px}.summary-shelf-heading span{color:var(--secondary-text-color);font-size:11px}.summary-scroll{overflow:visible;padding:0}.summary-map{--summary-node-size: clamp(16px, 4vw, 24px);position:relative;width:100%;height:94px}.summary-run{position:absolute;left:12px;right:12px;height:2px;background:var(--secondary-text-color);opacity:.7}.summary-run.forward{top:31px}.summary-run.return{top:75px}.summary-connector{position:absolute;top:31px;right:calc(8px - var(--summary-node-size) / 2);width:calc(var(--summary-node-size) / 2 + 4px);height:44px;border:2px dashed var(--secondary-text-color);border-left:0;border-radius:0 8px 8px 0;opacity:.7;pointer-events:none}.summary-map.mirrored .summary-connector{right:auto;left:calc(8px - var(--summary-node-size) / 2);border-right:0;border-left:2px dashed var(--secondary-text-color);border-radius:8px 0 0 8px;transform:none}.summary-hex{position:absolute;left:calc(12px + (100% - 24px) * var(--anchor) / 100);z-index:1;display:grid;place-items:center;width:var(--summary-node-size);height:var(--summary-node-size);min-height:0!important;padding:0!important;border:0;border-radius:50%;background:var(--divider-color);color:var(--primary-text-color);text-align:center;transform:translate(-50%)}.summary-hex:before{content:"";position:absolute;inset:2px;z-index:-1;border-radius:inherit;background:var(--card-background-color)}.summary-hex.forward{top:calc(31px - var(--summary-node-size) / 2)}.summary-hex.return{top:calc(75px - var(--summary-node-size) / 2)}.summary-hex span{display:block;font-size:clamp(7px,1.7vw,10px);font-weight:800;line-height:1}.summary-hex.assigned{background:#8fd4e8;color:#786000}.summary-hex.assigned:before{background:#f1e6b2}.summary-hex.selected{background:var(--primary-color);color:var(--text-primary-color)}.summary-hex.selected:before{background:color-mix(in srgb,var(--primary-color) 30%,var(--card-background-color))}.summary-hex.moving{background:#f59e0b;color:#3b2600}.summary-hex.moving:before{background:#fef3c7}.summary-hex.target{background:#22c55e;color:#073b1a}.summary-hex.target:before{background:#dcfce7}.summary-hex:hover,.summary-hex:focus-visible{background:var(--primary-color);outline:none}.view-mini-card{display:flex;align-items:center;justify-content:flex-start;gap:13px;min-height:94px;padding:14px 32px 14px 14px;text-align:left;border-radius:14px;background:var(--secondary-background-color)}.view-mini-card h3{font-size:18px}.view-mini-card p{max-width:390px}.view-mini-content{min-width:0}.view-index{margin-bottom:3px;color:var(--primary-color);font-size:10px;font-weight:800;letter-spacing:.1em}.view-position{margin:12px 0 2px;text-align:center;color:var(--primary-color);font-size:11px;font-weight:800;letter-spacing:.11em}.view-position span{padding:0 5px;color:var(--secondary-text-color)}.picker-shell{position:relative;margin:24px auto 4px;padding:18px 20px 12px;overflow:hidden;border:1px solid var(--divider-color);border-radius:14px;background:var(--primary-background-color)}.picker-caption{margin-bottom:9px;color:var(--secondary-text-color);text-align:center;font-size:9px;font-weight:800;letter-spacing:.22em}.picker-dial{display:grid;grid-template-columns:repeat(7,1fr);align-items:end;min-height:58px;border-top:1px solid var(--divider-color);background:repeating-linear-gradient(90deg,transparent 0 7px,color-mix(in srgb,var(--divider-color) 70%,transparent) 7px 8px);cursor:grab;touch-action:pan-y;-webkit-user-select:none;user-select:none}.picker-dial.dragging{cursor:grabbing}.dial-tick{display:grid;justify-items:center;gap:4px;color:var(--secondary-text-color);font-size:12px;pointer-events:none}.dial-tick i{display:block;width:1px;height:12px;background:currentColor}.dial-tick b{font-size:14px}.dial-tick.active{color:var(--primary-color);transform:translateY(-4px)}.dial-tick.active i{width:2px;height:22px}.dial-tick.active b{font-size:19px}.view-actions{display:flex;justify-content:center;margin-top:13px}.view-controls-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;max-width:760px;margin:18px auto 0}.view-control-card{padding:20px}.scene-list{display:flex;gap:7px;margin-top:15px;flex-wrap:wrap}.scene-button.active{border-color:var(--primary-color)!important;color:var(--primary-color)!important}.strip-controls{display:grid;grid-template-columns:auto 1fr auto;align-items:end;gap:12px;margin-top:15px}.strip-controls label span{margin-bottom:5px}.strip-controls input[type=color]{width:38px;height:38px}.strip-controls input[type=range]{min-height:30px;padding:0;accent-color:var(--primary-color)}.strip-controls output{min-width:34px;padding-bottom:9px;color:var(--secondary-text-color);font-size:11px;font-weight:700}.empty-state{display:grid;gap:5px;place-items:center;padding:40px 18px;text-align:center;color:var(--secondary-text-color)}.empty-state b{color:var(--primary-text-color)}@media(max-width:900px){.configuration-grid,.miniatures-grid,.view-controls-grid{grid-template-columns:1fr}.mini-editor{position:static}.locations-layout{grid-template-columns:1fr}.topbar{align-items:flex-start;flex-direction:column;padding:calc(10px + env(safe-area-inset-top,0px)) 16px 12px}.topbar-main{width:100%}nav{width:100%;justify-content:space-between}.nav-tab{flex:0 0 42px}.page{padding:16px 16px calc(32px + env(safe-area-inset-bottom,0px))}}@media(max-width:600px){.brand-icon{width:36px;height:36px}.general-card{align-items:flex-start;flex-direction:column}.general-values{width:100%}.metric,.color-control{flex:1}.form-grid.two,.search-controls{grid-template-columns:1fr}.mini-row{grid-template-columns:38px 1fr auto}.mini-artist{grid-column:2}.mini-row .row-actions{grid-column:2 / -1}.position-badge{grid-column:3;grid-row:1 / span 2}.view-card{padding:16px}.picker-shell{padding-left:10px;padding-right:10px}.dial-tick b{font-size:11px}.dial-tick.active b{font-size:16px}}', De = [
  ["name", "Name"],
  ["location", "Location"],
  ["newest", "Newest"]
], ce = (t, e = "name") => [...t].sort((i, a) => {
  if (e === "location") {
    const r = Number(i.shelf) > 0 && Number(i.location) > 0, o = Number(a.shelf) > 0 && Number(a.location) > 0;
    return r !== o ? r ? -1 : 1 : Number(i.shelf) - Number(a.shelf) || Number(i.location) - Number(a.location) || String(i.name).localeCompare(String(a.name));
  }
  return e === "newest" && Number(new Date(a.date || 0)) - Number(new Date(i.date || 0)) || String(i.name).localeCompare(String(a.name));
}), de = (t, e) => d`<div class="sort-controls">
	<span>Sort by</span>
	${De.map(
  ([i, a]) => d`<button
			class="sort-button ${t === i ? "active" : ""}"
			@click=${() => e(i)}>
			${a}
		</button>`
)}
</div>`, B = (t) => d`<div class="mini-avatar">${t?.[0] || "?"}</div>`, he = (t, e, i, a, r) => {
  const o = Math.max(1, Number(i) || 1), n = Number(e) || 0;
  return d`<div
		class="picker-dial ${a ? "compact" : ""}"
		@pointerdown=${(l) => t._startDial(l, n)}
		@pointermove=${(l) => t._moveDial(l, o, r)}
		@pointerup=${(l) => t._finishDial(l)}
		@pointercancel=${(l) => t._finishDial(l)}
		@lostpointercapture=${(l) => t._finishDial(l)}>
		${[-3, -2, -1, 0, 1, 2, 3].map(
    (l) => d`<span class="dial-tick ${l === 0 ? "active" : ""}">
					${a && l === 0 ? d`<em>LOCATION</em>` : u}<i></i>
					<b
						>${((n + l) % o + o) % o + 1}</b
					>
				</span>`
  )}
	</div>`;
}, Ue = (t) => t._active === "configuration" ? Re(t) : t._active === "miniatures" ? Be(t) : t._active === "view" ? je(t) : Ve(t), Re = (t) => {
  const e = t._layout, i = e.shelves || [];
  if (!i.length)
    return d`<div class="empty-state">
			<b>Waiting for cabinet layout</b
			><span
				>The panel will populate when the ESP32 publishes its retained
				layout state.</span
			>
		</div>`;
  t._selectedShelf = Math.min(t._selectedShelf, i.length);
  const a = i[t._selectedShelf - 1] || i[0];
  t._selectedLocation = Math.min(
    t._selectedLocation,
    a.total_locations || 1
  );
  const r = a.locations?.[t._selectedLocation - 1];
  return d` <section class="general-card panel-card">
			<div>
				<div class="eyebrow">GENERAL</div>
				<h2>Cabinet configuration</h2>
				<p>
					Physical structure and the color used to identify miniature
					locations.
				</p>
			</div>
			<div class="general-values">
				<div class="metric">
					<span>Shelves</span
					><b>${e.shelf_count || i.length}</b>
				</div>
				<label class="color-control"
					><span>Highlight color</span
					><input
						id="highlight-color"
						type="color"
						@change=${(o) => t.actions.setHighlightColor(o.target.value)}
						.value=${t._rgbToHex(
    e.highlight_color || { r: 156, g: 39, b: 176 }
  )}
				/></label>
			</div>
		</section>
		<div class="configuration-grid">
			<aside class="panel-card shelf-list">
				<div class="section-heading">
					<div>
						<div class="eyebrow">SHELVES</div>
						<h3>Physical order</h3>
					</div>
					<button
						class="primary small"
						@click=${() => t.actions.insertShelf(i.length + 1)}>
						＋ Add shelf
					</button>
				</div>
				<div class="shelf-items">
					${i.map(
    (o, n) => d`<div
									class="shelf-row ${o.shelf === t._selectedShelf ? "selected" : ""}">
									<button
										class="shelf-select"
										@click=${() => t.actions.selectShelf(o.shelf)}>
										<span class="shelf-number"
											>${String(o.shelf).padStart(
      2,
      "0"
    )}</span
										><span
											><b>Shelf ${o.shelf}</b
											><small
												>${o.total_locations}
												locations · ${o.total_leds}
												LEDs</small
											></span
										>
									</button>
									<div class="row-actions">
										<button
											class="icon-button"
											@click=${() => t.actions.moveShelf(
      o.shelf,
      Math.max(
        1,
        o.shelf - 1
      )
    )}
											?disabled=${n === 0}>
											↑</button
										><button
											class="icon-button"
											@click=${() => t.actions.moveShelf(
      o.shelf,
      Math.min(
        i.length,
        o.shelf + 1
      )
    )}
											?disabled=${n === i.length - 1}>
											↓
										</button>
									</div>
								</div>
								<button
									class="insert-shelf"
									@click=${() => t.actions.insertShelf(o.shelf + 1)}>
									＋ Insert shelf here
								</button>`
  )}
				</div>
			</aside>
			<main class="panel-card shelf-detail">
				<div class="section-heading detail-heading">
					<div>
						<div class="eyebrow">SELECTED SHELF</div>
						<h2>Shelf ${a.shelf}</h2>
					</div>
					<button
						class="danger ghost"
						@click=${() => t.actions.deleteShelf(a.shelf)}
						?disabled=${i.length <= 1}>
						Delete shelf
					</button>
				</div>
				<div class="form-grid two">
					<label
						><span>Total LEDs</span
						><input
							id="shelf-leds"
							type="number"
							min="1"
							.value=${String(a.total_leds)} /></label
					><label
						><span>Total locations</span
						><input
							id="shelf-locations"
							type="number"
							min="1"
							.value=${String(a.total_locations)}
					/></label>
				</div>
				<div class="button-row">
					<button
						class="primary"
						@click=${t.actions.saveShelf}>
						Save shelf</button
					><button
						@click=${() => t.actions.duplicateShelf(a.shelf)}>
						Duplicate shelf</button
					><button @click=${t.actions.autoMap}>Auto map</button
					><button @click=${t.actions.clearMap}>Clear mapping</button>
				</div>
				<div class="divider"></div>
				${Oe(t, a, r)}
			</main>
		</div>`;
}, Oe = (t, e, i) => {
  const a = t._mappingStart ?? (i?.mapped ? i.start_led : null), r = t._mappingEnd ?? (i?.mapped ? i.start_led + i.leds - 1 : null), o = Array.from({ length: e.total_leds }, (l, c) => {
    const h = a !== null && r !== null && c >= Math.min(a, r) && c <= Math.max(a, r), p = t._showAllMappings && e.locations.some(
      (m) => m.mapped && c >= m.start_led && c < m.start_led + m.leds
    );
    return d`<button
			class="led-cell ${p ? "assigned" : ""} ${h ? "selected" : ""} ${c === a ? "range-start" : ""} ${c === r ? "range-end" : ""}"
			@click=${() => t.actions.selectLed(c)}
			title="LED ${c + 1}">
			${c % 5 === 0 ? d`<small>${c + 1}</small>` : u}
		</button>`;
  }), n = Math.ceil(e.total_leds / 2), s = e.mirrored ? [o.slice(0, n).reverse(), o.slice(n)] : [o.slice(0, n), o.slice(n).reverse()];
  return d`<section class="mapping-visual">
		<div class="section-heading">
			<div>
				<div class="eyebrow">LOCATIONS</div>
				<h3>LED mapping</h3>
			</div>
			<label class="mapping-toggle"
				><input
					id="show-all-mappings"
					type="checkbox"
					.checked=${t._showAllMappings}
					@change=${(l) => t.actions.setShowAllMappings(
    l.target.checked
  )} /><span
					class="mapping-toggle-icon"
					aria-hidden="true"
					><svg viewBox="0 0 24 24">
						<path
							d="M9 18h6M10 22h4M8.5 15.5C7.6 14.5 7 13.1 7 11.5a5 5 0 0 1 10 0c0 1.6-.6 3-1.5 4" /></svg></span
				><span>Show all assigned</span></label
			>
		</div>
		<div
			class="mapping-dial-selected"
			aria-label="Selected location">
			${t._selectedLocation}
		</div>
		${he(
    t,
    t._selectedLocation - 1,
    e.total_locations,
    !0,
    (l) => t.actions.selectMappingLocation(l, e.total_locations)
  )}
		<div class="mapping-tools">
			<button @click=${t.actions.toggleDirection}>
				${e.mirrored ? "Start at right" : "Start at left"}</button
			><button
				class="icon-button"
				@click=${() => t.actions.zoom(-0.25)}>
				−</button
			><button
				class="icon-button"
				@click=${() => t.actions.zoom(0.25)}>
				＋
			</button>
			${a !== null && r !== null ? d`<div class="mapping-range">
						LED ${Math.min(a, r) + 1} →
						${Math.max(a, r) + 1}
						<span>${Math.abs(r - a) + 1} LEDs</span>
					</div>` : u}
		</div>
		<p>
			Selected location: <b>${t._selectedLocation}</b>. Tap first and last
			LED to preview; save commits the range.
		</p>
		<div
			class="led-runs ${e.mirrored ? "mirrored" : ""}"
			style=${`--led-size:${t._ledZoom * 9}px`}>
			<div class="led-runs-content">
				<div class="led-run">
					<div
						class="power-mark"
						aria-label="Strip power">
						⚡
					</div>
					${s[0]}<span
						class="strip-connector"
						aria-hidden="true"></span>
				</div>
				<div class="led-run return">${s[1]}</div>
			</div>
		</div>
		<div class="button-row end">
			<button @click=${t.actions.resetLedRange}>Go back</button
			><button
				class="primary"
				@click=${t.actions.saveLedRange}
				?disabled=${a === null || r === null}>
				Save location
			</button>
		</div>
	</section>`;
}, Be = (t) => {
  const e = t._miniatures, i = e.find((s) => s.id === t._editingMiniId), a = !!(i || t._addingMini), r = e.filter(
    (s) => s.name || s.collection || s.artist || Number(s.shelf) > 0 || Number(s.location) > 0
  ), o = ce(r, t._catalogueSort), n = t._catalogueView === "grid";
  return d`<div class="miniatures-grid ${a ? "" : "catalogue-only"}">
		${a ? d`<section class="panel-card mini-editor">
			<div class="eyebrow">
				${i ? "EDIT MINIATURE" : "NEW MINIATURE"}
			</div>
			<h2>${i?.name || "Add to catalogue"}</h2>
			<div class="form-grid">
				<label
					><span>Name</span
					><input
						id="mini-name"
						maxlength="80"
						.value=${i?.name || ""} /></label
				><label
					><span>Collection</span
					><input
						id="mini-collection"
						maxlength="80"
						.value=${i?.collection || ""} /></label
				><label
					><span>Artist</span
					><input
						id="mini-artist"
						maxlength="80"
						.value=${i?.artist || ""}
				/></label>
			</div>
			<div class="button-row end">
				<button @click=${t.actions.cancelMini}>Cancel</button><button
					class="primary"
					@click=${t.actions.saveMini}>
					${i ? "Save changes" : "Add miniature"}
				</button>
			</div>
		</section>` : u}
		<section class="panel-card mini-list-card">
			<div class="section-heading">
				<div>
					<div class="eyebrow">CATALOGUE</div>
					<h2>${r.length} miniatures</h2>
				</div>
				<div class="catalogue-toolbar">
					<div class="view-toggle" role="group" aria-label="Catalogue view">
						<button class="icon-button ${n ? "" : "active"}" aria-label="List view" title="List view" aria-pressed=${String(!n)} @click=${() => t.actions.setCatalogueView("list")}><svg viewBox="0 0 24 24"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></svg></button>
						<button class="icon-button ${n ? "active" : ""}" aria-label="Grid view" title="Grid view" aria-pressed=${String(n)} @click=${() => t.actions.setCatalogueView("grid")}><svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg></button>
					</div>
					<button class="primary small" @click=${t.actions.addMini}>Add new mini</button>
				</div>
			</div>
			${de(
    t._catalogueSort,
    (s) => t.actions.setSort("_catalogueSort", s)
  )}
			<div class="mini-list ${n ? "grid" : ""}">
				${o.map(
    (s) => d`<div class="mini-row ${n ? "mini-card" : ""}">
							${B(s.name)}
							<div class="mini-main">
								<b>${s.name}</b
								><span
									>${s.collection || "No collection"}</span
								>
							</div>
							<div class="mini-artist">
								${s.artist || "Unknown artist"}
							</div>
							<div
								class="position-badge ${s.shelf ? "" : "unassigned"}">
								${s.shelf ? `S${s.shelf} · L${s.location}` : "Unassigned"}
							</div>
							<div class="row-actions">
								${n ? d`<button class="icon-button" aria-label="Edit ${s.name}" title="Edit ${s.name}" @click=${() => t.actions.editMini(s.id)}><svg viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg></button><button class="icon-button danger" aria-label="Delete ${s.name}" title="Delete ${s.name}" @click=${() => t.actions.deleteMini(s.id)}><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v4M14 11v4" /></svg></button>` : d`<button
									class="ghost"
									@click=${() => t.actions.editMini(s.id)}>
									Edit</button
								><button
									class="danger ghost"
									@click=${() => t.actions.deleteMini(s.id)}>
									Delete
								</button>`}
							</div>
						</div>`
  )}
			</div>
		</section>
	</div>`;
}, Ve = (t) => {
  const e = t._searchQuery.trim().toLocaleLowerCase(), i = t._searchField === "all" ? ["name", "collection", "artist"] : [t._searchField], a = e ? t._miniatures.filter(
    (n) => i.some(
      (s) => String(n[s] || "").toLocaleLowerCase().includes(e)
    )
  ) : [], r = ce(a, t._searchSort), o = a.filter(
    (n) => n.shelf > 0 && n.location > 0
  );
  return d`<section class="panel-card search-card">
		<div class="eyebrow">FIND & HIGHLIGHT</div>
		<h2>Find a miniature in the cabinet</h2>
		<div class="search-controls">
			<input
				id="search-query"
				type="search"
				@input=${(n) => t.actions.setSearchQuery(n.target.value)}
				placeholder="Search miniatures…"
				autocomplete="off"
				.value=${t._searchQuery} /><select
				id="search-field"
				@change=${(n) => t.actions.setSearchField(n.target.value)}
				.value=${t._searchField}>
				<option value="all">All fields</option>
				<option value="name">Name</option>
				<option value="collection">Collection</option>
				<option value="artist">Artist</option>
			</select>
		</div>
		<div
			id="search-summary"
			class="search-summary muted">
			${e ? `${a.length} result${a.length === 1 ? "" : "s"} · ${o.length} assigned` : "Start typing to search."}
		</div>
		${e ? de(
    t._searchSort,
    (n) => t.actions.setSort("_searchSort", n)
  ) : u}
		<div
			id="search-results"
			class="search-results">
			${e ? r.length ? r.map(
    (n) => d`<button
									class="search-result"
									@click=${() => t.actions.highlightOne(n.id)}
									?disabled=${!n.shelf}>
									${B(n.name)}
									<div class="search-result-main">
										<b>${n.name}</b
										><span
											>${n.collection || "No collection"}
											·
											${n.artist || "Unknown artist"}</span
										>
									</div>
									<span
										class="position-badge ${n.shelf ? "" : "unassigned"}"
										>${n.shelf ? `Shelf ${n.shelf} · Location ${n.location}` : "Unassigned"}</span
									>
								</button>`
  ) : d`<div class="empty-state">
							<b>No matches</b
							><span>Try another term or field.</span>
						</div>` : u}
		</div>
	</section>`;
}, je = (t) => {
  const e = t._viewItem(t._viewIndex), i = t._miniatures.filter(
    (a) => Number(a.shelf) <= 0 || Number(a.location) <= 0
  ).length;
  return d`${e ? d`<section class="panel-card view-card">
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
					${B(e.name)}
					<div class="view-mini-content">
						<div class="view-index">
							${t._viewIndex + 1} /
							${t._assignedMiniatures.length}
						</div>
						<h3>${e.name}</h3>
						<p>
							${e.collection || "No collection"} ·
							${e.artist || "Unknown artist"}
						</p>
					</div>
				</div>
				<div class="view-position">
					SHELF ${e.shelf} · LOCATION ${e.location}
				</div>
				<div class="picker-shell">
					<div class="picker-caption">Swipe or drag to locate</div>
					${he(
    t,
    t._viewIndex,
    t._assignedMiniatures.length,
    !1,
    (a) => t.actions.setViewIndex(a)
  )}
				</div>
				<div class="view-actions">
					<button @click=${t.actions.clearViewHighlight}>
						Stop locating
					</button>
				</div>
	</section>` : d`<cabinet-panel-card class="view-card empty-state">
				<b>No assigned miniatures</b>
			</cabinet-panel-card>`}${qe(t)}${Fe(t)}`;
}, qe = (t) => {
  const e = t._hass?.states?.[t._config.scene_entity]?.state || "Off", i = String(e).toLocaleLowerCase();
  return d`<div class="view-controls-grid">
		<section class="panel-card view-control-card">
			<div class="eyebrow">SCENES</div>
			<h3>Current: ${e}</h3>
			<p>Choosing a scene stops locating and restores the full strip output.</p>
			<div class="scene-list">
				${["off", "display", "showcase"].map(
    (a) => d`<button
						class="scene-button ${i === a ? "active" : ""}"
						@click=${() => t.actions.applyScene(a)}>
						${a[0].toUpperCase() + a.slice(1)}
					</button>`
  )}
			</div>
		</section>
		<section class="panel-card view-control-card">
			<div class="eyebrow">MINIATURE STRIP</div>
			<h3>All miniatures</h3>
			<p>Colour or brightness stops locating and applies to the complete strip.</p>
			<div class="strip-controls">
				<label><span>Colour</span><input
					type="color"
					.value=${t._miniatureColor}
					@change=${(a) => t._setMiniatureLights({ color: a.target.value })} /></label>
				<label><span>Brightness</span><input
					type="range"
					min="0"
					max="100"
					.value=${t._miniatureBrightness}
					@input=${(a) => t._setMiniatureLights({ brightness: a.target.value })} /></label>
				<output>${t._miniatureBrightness}%</output>
			</div>
		</section>
	</div>`;
}, Fe = (t) => {
  const e = t._layout.shelves || [], i = t._summarySelected, a = t._summaryMoveSource, r = t._summaryMoveTarget, o = i && t._miniatures.find(
    (s) => Number(s.shelf) === i.shelf && Number(s.location) === i.location
  ), n = new Map(
    t._assignedMiniatures.map((s) => [
      `${s.shelf}:${s.location}`,
      s
    ])
  );
  return d`<section class="panel-card cabinet-summary" @click=${(s) => s.stopPropagation()}>
		<div class="section-heading">
			<div>
				<div class="eyebrow">CABINET SUMMARY</div>
				<h2>All shelves</h2>
			</div>
			<div class="summary-actions">
				<span class="muted">${a ? "Choose a target location." : "Tap a location to locate it."}</span>
				<button class="small" ?disabled=${!o || !!a} @click=${() => t._startSummaryMove()}>Move</button>
			</div>
		</div>
		${e.length ? d`<div class="summary-shelves">
					${e.map((s) => {
    const l = (s.locations || []).filter(
      (h) => h.mapped
    ), c = l.filter(
      (h) => n.has(
        `${s.shelf}:${h.location}`
      )
    ).length;
    return d`<section class="summary-shelf">
							<header class="summary-shelf-heading">
								<b>Shelf ${s.shelf}</b>
								<span
									>${l.length} mapped · ${c}
									assigned</span
								>
							</header>
							<div class="summary-scroll">
								<div
									class="summary-map ${s.mirrored ? "mirrored" : ""}">
									<div class="summary-run forward"></div>
									<div class="summary-run return"></div>
									<div
										class="summary-connector"
										aria-hidden="true"></div>
									${l.map((h) => {
      const p = t._summaryLocationAnchor(
        s,
        h
      ), m = n.get(
        `${s.shelf}:${h.location}`
      ), g = a && a.shelf === Number(s.shelf) && a.location === Number(h.location), _ = r && r.shelf === Number(s.shelf) && r.location === Number(h.location), pe = i && i.shelf === Number(s.shelf) && i.location === Number(h.location);
      return d`<button
											class="summary-hex ${p.run} ${m ? "assigned" : ""} ${pe ? "selected" : ""} ${g ? "moving" : ""} ${_ ? "target" : ""}"
											style=${`--anchor:${p.percent}`}
											@click=${() => t._selectSummaryLocation(
        s.shelf,
        h.location
      )}
											title=${m ? `Location ${h.location}: ${m.name}` : `Location ${h.location}: no miniature assigned`}>
											<span>${h.location}</span>
										</button>`;
    })}
								</div>
							</div>
						</section>`;
  })}
				</div>` : d`<div class="empty-state">
					<b>Waiting for cabinet layout</b>
				</div>`}
	</section>`;
}, te = async (t, e, i) => {
  t && await t.callService("mqtt", "publish", {
    topic: e,
    payload: JSON.stringify(i),
    qos: 0,
    retain: !1
  });
}, We = {
  command_topic: "smartcabinet/cabinet01/api/command",
  layout_entity: "sensor.smart_cabinet_layout",
  miniatures_entity: "sensor.smart_cabinet_miniatures",
  scene_entity: "sensor.smart_cabinet_scene",
  mini_lights_command_topic: "smartcabinet/cabinet01/ha/mini_lights/set"
};
class Ge extends $ {
  static styles = ae(ee);
  _hass = null;
  _panel = null;
  _narrow = !1;
  _active = "configuration";
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
  actions;
  constructor() {
    super(), this._hass = null, this._panel = null, this._narrow = !1, this._active = "configuration", this._selectedShelf = 1, this._selectedLocation = 1, this._editingMiniId = null, this._addingMini = !1, this._searchTimer = null, this._dataSignature = null, this._searchQuery = "", this._searchField = "all", this._searchSort = "name", this._catalogueSort = "name", this._catalogueView = "list", this._summarySelected = null, this._summaryMoveSource = null, this._summaryMoveTarget = null, this._viewIndex = 0, this._viewTimer = null, this._mappingStart = null, this._mappingEnd = null, this._mappingTimer = null, this._showAllMappings = !1, this._ledZoom = 1, this._dialDrag = null, this._miniatureBrightness = 45, this._miniatureColor = "#03a9e6", this.actions = Pe(this);
  }
  set narrow(e) {
    const i = !!e;
    i !== this._narrow && (this._narrow = i, this._render());
  }
  set panel(e) {
    this._panel = e, this._render();
  }
  set hass(e) {
    this._hass = e;
    const i = e?.states?.[this._config.layout_entity], a = e?.states?.[this._config.miniatures_entity], r = e?.states?.[this._config.scene_entity], o = `${i?.last_updated || ""}|${a?.last_updated || ""}|${r?.last_updated || ""}`;
    o !== this._dataSignature && (this._dataSignature = o, this._render());
  }
  get _config() {
    return { ...We, ...this._panel?.config || {} };
  }
  get _layout() {
    return this._hass?.states?.[this._config.layout_entity]?.attributes || {
      shelves: [],
      shelf_count: 0
    };
  }
  get _miniatures() {
    return this._hass?.states?.[this._config.miniatures_entity]?.attributes?.items || [];
  }
  get _assignedMiniatures() {
    return this._miniatures.filter(
      (e) => Number(e.shelf) > 0 && Number(e.location) > 0
    );
  }
  _viewItem(e) {
    const i = this._assignedMiniatures;
    return i.length ? i[(e % i.length + i.length) % i.length] : null;
  }
  _summaryLocationAnchor(e, i) {
    const a = Number(e.total_leds) || 0, r = Math.ceil(a / 2), o = a - r, n = Number(i.start_led) + (Number(i.leds) - 1) / 2;
    return n < r ? e.mirrored ? { run: "forward", percent: (r - n - 0.5) / r * 100 } : { run: "forward", percent: (n + 0.5) / r * 100 } : e.mirrored ? {
      run: "return",
      percent: o ? (n - r + 0.5) / o * 100 : 50
    } : {
      run: "return",
      percent: o ? (a - n - 0.5) / o * 100 : 50
    };
  }
  _selectSummaryLocation(e, i) {
    if (this._summaryMoveSource) {
      this._selectSummaryMoveTarget(e, i);
      return;
    }
    this._summarySelected = { shelf: Number(e), location: Number(i) };
    const a = this._assignedMiniatures.findIndex(
      (r) => Number(r.shelf) === Number(e) && Number(r.location) === Number(i)
    );
    a >= 0 && (this._viewIndex = a), this._command({ action: "highlightLocation", shelf: Number(e), location: Number(i) }), this._render();
  }
  _startSummaryMove() {
    const e = this._summarySelected, i = e && this._miniatures.find(
      (a) => Number(a.shelf) === e.shelf && Number(a.location) === e.location
    );
    !e || !i || (this._summaryMoveSource = e, this._summaryMoveTarget = null, this._render());
  }
  _cancelSummaryMove(e = !1) {
    !this._summaryMoveSource && (!e || !this._summarySelected) || (e && (this._summarySelected = null), this._summaryMoveSource = null, this._summaryMoveTarget = null, e && this._command({ action: "clearHighlight" }), this._render());
  }
  async _selectSummaryMoveTarget(e, i) {
    const a = this._summaryMoveSource, r = { shelf: Number(e), location: Number(i) };
    if (!a || a.shelf === r.shelf && a.location === r.location) return;
    const o = this._miniatures.find(
      (c) => Number(c.shelf) === a.shelf && Number(c.location) === a.location
    );
    if (!o) return this._cancelSummaryMove();
    const n = this._miniatures.find(
      (c) => Number(c.shelf) === r.shelf && Number(c.location) === r.location
    );
    this._summaryMoveTarget = r, this._render(), await new Promise((c) => requestAnimationFrame(() => c()));
    const s = n ? `Move ${o.name} to Shelf ${r.shelf}, Location ${r.location}?

${n.name} will become Unassigned.` : `Move ${o.name} to Shelf ${r.shelf}, Location ${r.location}?`;
    if (!confirm(s)) return this._cancelSummaryMove();
    const l = (c, h, p) => this._command({
      action: "updateMiniature",
      id: c.id,
      name: c.name || "",
      collection: c.collection || "",
      artist: c.artist || "",
      date: c.date || "",
      shelf: h,
      location: p,
      notes: c.notes || ""
    });
    n && await l(n, 0, 0), await l(o, r.shelf, r.location), this._summarySelected = r, this._summaryMoveSource = null, this._summaryMoveTarget = null, this._render();
  }
  _startDial(e, i) {
    e.button === 0 && (this._dialDrag = { pointerId: e.pointerId, x: e.clientX, value: i, steps: 0 }, e.currentTarget.setPointerCapture(e.pointerId), e.currentTarget.classList.add("dragging"));
  }
  _moveDial(e, i, a) {
    if (!this._dialDrag || e.pointerId !== this._dialDrag.pointerId) return;
    const r = Math.trunc((this._dialDrag.x - e.clientX) / 36);
    r !== this._dialDrag.steps && (this._dialDrag.steps = r, a(((this._dialDrag.value + r) % i + i) % i));
  }
  _finishDial(e) {
    e && e.pointerId !== this._dialDrag?.pointerId || (this._dialDrag = null, e?.currentTarget?.classList.remove("dragging"));
  }
  _command(e) {
    return te(this._hass, this._config.command_topic, e);
  }
  _setMiniatureLights({ brightness: e, color: i }) {
    return e !== void 0 && (this._miniatureBrightness = Math.max(0, Math.min(100, Number(e) || 0))), i && (this._miniatureColor = i), this._render(), te(this._hass, this._config.mini_lights_command_topic, {
      state: "ON",
      brightness: this._miniatureBrightness,
      color: this._hexToRgb(this._miniatureColor)
    });
  }
  _hexToRgb(e) {
    const i = e.replace("#", "");
    return {
      r: parseInt(i.slice(0, 2), 16),
      g: parseInt(i.slice(2, 4), 16),
      b: parseInt(i.slice(4, 6), 16)
    };
  }
  _rgbToHex(e = {}) {
    const i = (a) => Number(a || 0).toString(16).padStart(2, "0");
    return `#${i(e.r)}${i(e.g)}${i(e.b)}`;
  }
  render() {
    const e = [
      [
        "view",
        "View",
        d`<svg viewBox="0 0 24 24">
					<path d="M4 19V5m5 14V9m5 10V4m5 15v-8" />
				</svg>`
      ],
      [
        "configuration",
        "Configuration",
        d`<svg viewBox="0 0 24 24">
					<path d="M4 4h16v5H4zm0 11h16v5H4zm4-6v6m8-6v6" />
				</svg>`
      ],
      [
        "miniatures",
        "Miniatures",
        d`<svg viewBox="0 0 24 24">
					<path
						d="M7 20v-2a5 5 0 0 1 10 0v2M12 4a4 4 0 1 1 0 8 4 4 0 0" />
				</svg>`
      ],
      [
        "search",
        "Search",
        d`<svg viewBox="0 0 24 24">
					<circle
						cx="10.5"
						cy="10.5"
						r="5.5" />
					<path d="m15 15 5 5" />
				</svg>`
      ]
    ];
    return d`<style>
				${ee}
			</style>
			<div class="app-shell" @click=${() => this._cancelSummaryMove(!0)}>
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
						${e.map(
      ([i, a, r]) => d`<button
									class="nav-tab ${this._active === i ? "active" : ""}"
									@click=${() => this._selectTab(i)}
									aria-label=${a}
									title=${a}>
									${r}
								</button>`
    )}
					</nav>
				</header>
				<div class="page">${Ue(this)}</div>
			</div>`;
  }
  _render() {
    this.requestUpdate();
  }
  _selectTab(e) {
    this._active = e, this._render(), e === "view" && this._scheduleViewHighlight();
  }
  _setViewIndex(e) {
    const i = this._assignedMiniatures;
    i.length && (this._viewIndex = (e % i.length + i.length) % i.length, this._render(), this._scheduleViewHighlight());
  }
  _scheduleMappingHighlight() {
    clearTimeout(this._mappingTimer), this._mappingTimer = setTimeout(
      () => this._command({
        action: "highlightLocation",
        shelf: this._selectedShelf,
        location: this._selectedLocation
      }),
      220
    );
  }
  _scheduleViewHighlight() {
    const e = this._viewItem(this._viewIndex);
    e && (clearTimeout(this._viewTimer), this._viewTimer = setTimeout(
      () => this._command({
        action: "highlightLocation",
        shelf: Number(e.shelf),
        location: Number(e.location)
      }),
      220
    ));
  }
  async _saveMini() {
    const e = this.shadowRoot.querySelector("#mini-name").value.trim(), i = this.shadowRoot.querySelector("#mini-collection").value.trim(), a = this.shadowRoot.querySelector("#mini-artist").value.trim();
    if (!e) return;
    const r = this._miniatures.find(
      (o) => o.id === this._editingMiniId
    );
    await this._command(
      r ? {
        action: "updateMiniature",
        id: r.id,
        name: e,
        collection: i,
        artist: a,
        date: r.date || "",
        shelf: r.shelf || 0,
        location: r.location || 0,
        notes: r.notes || ""
      } : {
        action: "createMiniature",
        name: e,
        collection: i,
        artist: a,
        date: "",
        shelf: 0,
        location: 0,
        notes: ""
      }
    ), this._editingMiniId = null, this._addingMini = !1, this._render();
  }
  _scheduleSearch() {
    clearTimeout(this._searchTimer), this._searchTimer = setTimeout(() => this._highlightSearch(), 220);
  }
  async _highlightSearch() {
    const e = this._searchQuery.trim().toLocaleLowerCase();
    if (!e) return this._command({ action: "clearHighlight" });
    const i = this._searchField === "all" ? ["name", "collection", "artist"] : [this._searchField], a = this._miniatures.filter(
      (r) => Number(r.shelf) > 0 && Number(r.location) > 0 && i.some(
        (o) => String(r[o] || "").toLocaleLowerCase().includes(e)
      )
    );
    return this._command(
      a.length ? {
        action: "highlightLocations",
        locations: a.map((r) => ({
          shelf: r.shelf,
          location: r.location
        }))
      } : { action: "clearHighlight" }
    );
  }
}
customElements.define("ha-panel-smart-cabinet", Ge);
