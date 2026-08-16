const L = globalThis, U = L.ShadowRoot && (L.ShadyCSS === void 0 || L.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, et = /* @__PURE__ */ Symbol(), V = /* @__PURE__ */ new WeakMap();
let lt = class {
  constructor(t, i, a) {
    if (this._$cssResult$ = !0, a !== et) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = i;
  }
  get styleSheet() {
    let t = this.o;
    const i = this.t;
    if (U && t === void 0) {
      const a = i !== void 0 && i.length === 1;
      a && (t = V.get(i)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), a && V.set(i, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const it = (e) => new lt(typeof e == "string" ? e : e + "", void 0, et), ct = (e, t) => {
  if (U) e.adoptedStyleSheets = t.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of t) {
    const a = document.createElement("style"), r = L.litNonce;
    r !== void 0 && a.setAttribute("nonce", r), a.textContent = i.cssText, e.appendChild(a);
  }
}, B = U ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let i = "";
  for (const a of t.cssRules) i += a.cssText;
  return it(i);
})(e) : e;
const { is: dt, defineProperty: pt, getOwnPropertyDescriptor: ht, getOwnPropertyNames: ut, getOwnPropertySymbols: gt, getPrototypeOf: mt } = Object, N = globalThis, q = N.trustedTypes, ft = q ? q.emptyScript : "", vt = N.reactiveElementPolyfillSupport, k = (e, t) => e, I = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? ft : null;
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
} }, at = (e, t) => !dt(e, t), F = { attribute: !0, type: String, converter: I, reflect: !1, useDefault: !1, hasChanged: at };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), N.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let y = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, i = F) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(t, i), !i.noAccessor) {
      const a = /* @__PURE__ */ Symbol(), r = this.getPropertyDescriptor(t, a, i);
      r !== void 0 && pt(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, i, a) {
    const { get: r, set: s } = ht(this.prototype, t) ?? { get() {
      return this[i];
    }, set(n) {
      this[i] = n;
    } };
    return { get: r, set(n) {
      const p = r?.call(this);
      s?.call(this, n), this.requestUpdate(t, p, a);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? F;
  }
  static _$Ei() {
    if (this.hasOwnProperty(k("elementProperties"))) return;
    const t = mt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(k("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(k("properties"))) {
      const i = this.properties, a = [...ut(i), ...gt(i)];
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
      for (const r of a) i.unshift(B(r));
    } else t !== void 0 && i.push(B(t));
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
    return ct(t, this.constructor.elementStyles), t;
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
      const s = (a.converter?.toAttribute !== void 0 ? a.converter : I).toAttribute(i, a.type);
      this._$Em = t, s == null ? this.removeAttribute(r) : this.setAttribute(r, s), this._$Em = null;
    }
  }
  _$AK(t, i) {
    const a = this.constructor, r = a._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const s = a.getPropertyOptions(r), n = typeof s.converter == "function" ? { fromAttribute: s.converter } : s.converter?.fromAttribute !== void 0 ? s.converter : I;
      this._$Em = r;
      const p = n.fromAttribute(i, s.type);
      this[r] = p ?? this._$Ej?.get(r) ?? p, this._$Em = null;
    }
  }
  requestUpdate(t, i, a, r = !1, s) {
    if (t !== void 0) {
      const n = this.constructor;
      if (r === !1 && (s = this[t]), a ??= n.getPropertyOptions(t), !((a.hasChanged ?? at)(s, i) || a.useDefault && a.reflect && s === this._$Ej?.get(t) && !this.hasAttribute(n._$Eu(t, a)))) return;
      this.C(t, i, a);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, i, { useDefault: a, reflect: r, wrapped: s }, n) {
    a && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, n ?? i ?? this[t]), s !== !0 || n !== void 0) || (this._$AL.has(t) || (this.hasUpdated || a || (i = void 0), this._$AL.set(t, i)), r === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
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
        for (const [r, s] of this._$Ep) this[r] = s;
        this._$Ep = void 0;
      }
      const a = this.constructor.elementProperties;
      if (a.size > 0) for (const [r, s] of a) {
        const { wrapped: n } = s, p = this[r];
        n !== !0 || this._$AL.has(r) || p === void 0 || this.C(r, void 0, s, p);
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
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[k("elementProperties")] = /* @__PURE__ */ new Map(), y[k("finalized")] = /* @__PURE__ */ new Map(), vt?.({ ReactiveElement: y }), (N.reactiveElementVersions ??= []).push("2.1.2");
const R = globalThis, W = (e) => e, z = R.trustedTypes, Q = z ? z.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, rt = "$lit$", f = `lit$${Math.random().toFixed(9).slice(2)}$`, st = "?" + f, bt = `<${st}>`, _ = document, A = () => _.createComment(""), E = (e) => e === null || typeof e != "object" && typeof e != "function", O = Array.isArray, xt = (e) => O(e) || typeof e?.[Symbol.iterator] == "function", P = `[ 	
\f\r]`, S = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Z = /-->/g, G = />/g, v = RegExp(`>|${P}(?:([^\\s"'>=/]+)(${P}*=${P}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), J = /'/g, X = /"/g, nt = /^(?:script|style|textarea|title)$/i, _t = (e) => (t, ...i) => ({ _$litType$: e, strings: t, values: i }), d = _t(1), $ = /* @__PURE__ */ Symbol.for("lit-noChange"), h = /* @__PURE__ */ Symbol.for("lit-nothing"), K = /* @__PURE__ */ new WeakMap(), b = _.createTreeWalker(_, 129);
function ot(e, t) {
  if (!O(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Q !== void 0 ? Q.createHTML(t) : t;
}
const yt = (e, t) => {
  const i = e.length - 1, a = [];
  let r, s = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = S;
  for (let p = 0; p < i; p++) {
    const o = e[p];
    let l, u, c = -1, g = 0;
    for (; g < o.length && (n.lastIndex = g, u = n.exec(o), u !== null); ) g = n.lastIndex, n === S ? u[1] === "!--" ? n = Z : u[1] !== void 0 ? n = G : u[2] !== void 0 ? (nt.test(u[2]) && (r = RegExp("</" + u[2], "g")), n = v) : u[3] !== void 0 && (n = v) : n === v ? u[0] === ">" ? (n = r ?? S, c = -1) : u[1] === void 0 ? c = -2 : (c = n.lastIndex - u[2].length, l = u[1], n = u[3] === void 0 ? v : u[3] === '"' ? X : J) : n === X || n === J ? n = v : n === Z || n === G ? n = S : (n = v, r = void 0);
    const m = n === v && e[p + 1].startsWith("/>") ? " " : "";
    s += n === S ? o + bt : c >= 0 ? (a.push(l), o.slice(0, c) + rt + o.slice(c) + f + m) : o + f + (c === -2 ? p : m);
  }
  return [ot(e, s + (e[i] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), a];
};
class M {
  constructor({ strings: t, _$litType$: i }, a) {
    let r;
    this.parts = [];
    let s = 0, n = 0;
    const p = t.length - 1, o = this.parts, [l, u] = yt(t, i);
    if (this.el = M.createElement(l, a), b.currentNode = this.el.content, i === 2 || i === 3) {
      const c = this.el.content.firstChild;
      c.replaceWith(...c.childNodes);
    }
    for (; (r = b.nextNode()) !== null && o.length < p; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const c of r.getAttributeNames()) if (c.endsWith(rt)) {
          const g = u[n++], m = r.getAttribute(c).split(f), T = /([.?@])?(.*)/.exec(g);
          o.push({ type: 1, index: s, name: T[2], strings: m, ctor: T[1] === "." ? wt : T[1] === "?" ? St : T[1] === "@" ? kt : H }), r.removeAttribute(c);
        } else c.startsWith(f) && (o.push({ type: 6, index: s }), r.removeAttribute(c));
        if (nt.test(r.tagName)) {
          const c = r.textContent.split(f), g = c.length - 1;
          if (g > 0) {
            r.textContent = z ? z.emptyScript : "";
            for (let m = 0; m < g; m++) r.append(c[m], A()), b.nextNode(), o.push({ type: 2, index: ++s });
            r.append(c[g], A());
          }
        }
      } else if (r.nodeType === 8) if (r.data === st) o.push({ type: 2, index: s });
      else {
        let c = -1;
        for (; (c = r.data.indexOf(f, c + 1)) !== -1; ) o.push({ type: 7, index: s }), c += f.length - 1;
      }
      s++;
    }
  }
  static createElement(t, i) {
    const a = _.createElement("template");
    return a.innerHTML = t, a;
  }
}
function w(e, t, i = e, a) {
  if (t === $) return t;
  let r = a !== void 0 ? i._$Co?.[a] : i._$Cl;
  const s = E(t) ? void 0 : t._$litDirective$;
  return r?.constructor !== s && (r?._$AO?.(!1), s === void 0 ? r = void 0 : (r = new s(e), r._$AT(e, i, a)), a !== void 0 ? (i._$Co ??= [])[a] = r : i._$Cl = r), r !== void 0 && (t = w(e, r._$AS(e, t.values), r, a)), t;
}
class $t {
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
    const { el: { content: i }, parts: a } = this._$AD, r = (t?.creationScope ?? _).importNode(i, !0);
    b.currentNode = r;
    let s = b.nextNode(), n = 0, p = 0, o = a[0];
    for (; o !== void 0; ) {
      if (n === o.index) {
        let l;
        o.type === 2 ? l = new C(s, s.nextSibling, this, t) : o.type === 1 ? l = new o.ctor(s, o.name, o.strings, this, t) : o.type === 6 && (l = new At(s, this, t)), this._$AV.push(l), o = a[++p];
      }
      n !== o?.index && (s = b.nextNode(), n++);
    }
    return b.currentNode = _, r;
  }
  p(t) {
    let i = 0;
    for (const a of this._$AV) a !== void 0 && (a.strings !== void 0 ? (a._$AI(t, a, i), i += a.strings.length - 2) : a._$AI(t[i])), i++;
  }
}
class C {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, i, a, r) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = t, this._$AB = i, this._$AM = a, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
    t = w(this, t, i), E(t) ? t === h || t == null || t === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : t !== this._$AH && t !== $ && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : xt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== h && E(this._$AH) ? this._$AA.nextSibling.data = t : this.T(_.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: i, _$litType$: a } = t, r = typeof a == "number" ? this._$AC(t) : (a.el === void 0 && (a.el = M.createElement(ot(a.h, a.h[0]), this.options)), a);
    if (this._$AH?._$AD === r) this._$AH.p(i);
    else {
      const s = new $t(r, this), n = s.u(this.options);
      s.p(i), this.T(n), this._$AH = s;
    }
  }
  _$AC(t) {
    let i = K.get(t.strings);
    return i === void 0 && K.set(t.strings, i = new M(t)), i;
  }
  k(t) {
    O(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let a, r = 0;
    for (const s of t) r === i.length ? i.push(a = new C(this.O(A()), this.O(A()), this, this.options)) : a = i[r], a._$AI(s), r++;
    r < i.length && (this._$AR(a && a._$AB.nextSibling, r), i.length = r);
  }
  _$AR(t = this._$AA.nextSibling, i) {
    for (this._$AP?.(!1, !0, i); t !== this._$AB; ) {
      const a = W(t).nextSibling;
      W(t).remove(), t = a;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class H {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, i, a, r, s) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = t, this.name = i, this._$AM = r, this.options = s, a.length > 2 || a[0] !== "" || a[1] !== "" ? (this._$AH = Array(a.length - 1).fill(new String()), this.strings = a) : this._$AH = h;
  }
  _$AI(t, i = this, a, r) {
    const s = this.strings;
    let n = !1;
    if (s === void 0) t = w(this, t, i, 0), n = !E(t) || t !== this._$AH && t !== $, n && (this._$AH = t);
    else {
      const p = t;
      let o, l;
      for (t = s[0], o = 0; o < s.length - 1; o++) l = w(this, p[a + o], i, o), l === $ && (l = this._$AH[o]), n ||= !E(l) || l !== this._$AH[o], l === h ? t = h : t !== h && (t += (l ?? "") + s[o + 1]), this._$AH[o] = l;
    }
    n && !r && this.j(t);
  }
  j(t) {
    t === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class wt extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === h ? void 0 : t;
  }
}
class St extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== h);
  }
}
class kt extends H {
  constructor(t, i, a, r, s) {
    super(t, i, a, r, s), this.type = 5;
  }
  _$AI(t, i = this) {
    if ((t = w(this, t, i, 0) ?? h) === $) return;
    const a = this._$AH, r = t === h && a !== h || t.capture !== a.capture || t.once !== a.once || t.passive !== a.passive, s = t !== h && (a === h || r);
    r && this.element.removeEventListener(this.name, this, a), s && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class At {
  constructor(t, i, a) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = a;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    w(this, t);
  }
}
const Et = R.litHtmlPolyfillSupport;
Et?.(M, C), (R.litHtmlVersions ??= []).push("3.3.3");
const Mt = (e, t, i) => {
  const a = i?.renderBefore ?? t;
  let r = a._$litPart$;
  if (r === void 0) {
    const s = i?.renderBefore ?? null;
    a._$litPart$ = r = new C(t.insertBefore(A(), s), s, void 0, i ?? {});
  }
  return r._$AI(e), r;
};
const D = globalThis;
class x extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const i = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Mt(i, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return $;
  }
}
x._$litElement$ = !0, x.finalized = !0, D.litElementHydrateSupport?.({ LitElement: x });
const Ct = D.litElementPolyfillSupport;
Ct?.({ LitElement: x });
(D.litElementVersions ??= []).push("4.2.2");
class Tt extends x {
  static properties = {
    value: { type: Number },
    total: { type: Number },
    ticks: { type: Number },
    compact: { type: Boolean }
  };
  constructor() {
    super(), this.value = 0, this.total = 1, this.ticks = 3, this.compact = !1, this._drag = null;
  }
  createRenderRoot() {
    return this;
  }
  _start(t) {
    t.button === 0 && (this._drag = {
      pointerId: t.pointerId,
      x: t.clientX,
      value: this.value,
      steps: 0
    }, t.currentTarget.setPointerCapture(t.pointerId), this.classList.add("dragging"));
  }
  _move(t) {
    if (!this._drag || t.pointerId !== this._drag.pointerId) return;
    const i = Math.trunc((this._drag.x - t.clientX) / 36);
    i !== this._drag.steps && (this._drag.steps = i, this.dispatchEvent(
      new CustomEvent("dial-change", {
        detail: { value: this._drag.value + i },
        bubbles: !0,
        composed: !0
      })
    ));
  }
  _finish(t) {
    t && t.pointerId !== this._drag?.pointerId || (this._drag = null, this.classList.remove("dragging"));
  }
  render() {
    const t = Array.from(
      { length: this.ticks * 2 + 1 },
      (i, a) => a - this.ticks
    );
    return d`<div
			class="picker-dial ${this.compact ? "compact" : ""}"
			@pointerdown=${this._start}
			@pointermove=${this._move}
			@pointerup=${this._finish}
			@pointercancel=${this._finish}
			@lostpointercapture=${this._finish}>
			${t.map(
      (i) => d`<span class="dial-tick ${i === 0 ? "active" : ""}"
						>${this.compact && i === 0 ? d`<em>LOCATION</em>` : ""}<i></i
						><b
							>${((this.value + i) % this.total + this.total) % this.total + 1}</b
						></span
					>`
    )}
		</div>`;
  }
}
customElements.define("cabinet-dial-picker", Tt);
class Lt extends x {
  createRenderRoot() {
    return this;
  }
  render() {
    return d`<section class="panel-card ${this.className || ""}">
			<slot></slot>
		</section>`;
  }
}
customElements.define("cabinet-panel-card", Lt);
const Y = (e, t) => e.shadowRoot.querySelector(t)?.value, zt = (e) => ({
  setHighlightColor: (t) => e._command({ action: "setHighlightColor", ...e._hexToRgb(t) }),
  selectShelf: (t) => {
    e._selectedShelf = t, e._selectedLocation = 1, e._render();
  },
  selectLocation: async (t) => {
    e._selectedLocation = t, await e._command({ action: "highlightLocation", shelf: e._selectedShelf, location: t }), e._render();
  },
  insertShelf: (t) => e._command({ action: "insertShelf", position: t }),
  duplicateShelf: (t) => e._command({ action: "duplicateShelf", shelf: t }),
  deleteShelf: async (t) => {
    confirm(`Delete Shelf ${t}? Miniatures on it will become Unassigned.`) && await e._command({ action: "deleteShelf", shelf: t });
  },
  moveShelf: async (t, i) => {
    await e._command({ action: "moveShelf", from: t, to: i }), e._selectedShelf = i;
  },
  saveShelf: () => e._command({
    action: "setShelfConfig",
    shelf: e._selectedShelf,
    total_leds: Number(Y(e, "#shelf-leds")),
    total_locations: Number(Y(e, "#shelf-locations"))
  }),
  autoMap: () => e._command({ action: "autoMapShelf", shelf: e._selectedShelf }),
  clearMap: async () => {
    confirm("Clear every location mapping on this shelf?") && await e._command({ action: "clearShelfMapping", shelf: e._selectedShelf });
  },
  toggleDirection: () => {
    const t = e._layout.shelves?.[e._selectedShelf - 1];
    return e._command({ action: "setShelfDirection", shelf: e._selectedShelf, mirrored: !t?.mirrored });
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
      await e._command({ action: "previewLocation", shelf: e._selectedShelf, location: e._selectedLocation, start_led: i, leds: Math.abs(e._mappingEnd - e._mappingStart) + 1 });
    }
    e._render();
  },
  resetLedRange: async () => {
    e._mappingStart = null, e._mappingEnd = null, await e._command({ action: "highlightLocation", shelf: e._selectedShelf, location: e._selectedLocation }), e._render();
  },
  saveLedRange: async () => {
    const t = Math.min(e._mappingStart, e._mappingEnd);
    await e._command({ action: "setLocationConfig", shelf: e._selectedShelf, location: e._selectedLocation, start_led: t, leds: Math.abs(e._mappingEnd - e._mappingStart) + 1 }), e._mappingStart = null, e._mappingEnd = null;
  },
  editMini: (t) => {
    e._editingMiniId = t, e._render();
  },
  cancelMini: () => {
    e._editingMiniId = null, e._render();
  },
  saveMini: () => e._saveMini(),
  deleteMini: async (t) => {
    const i = e._miniatures.find((a) => a.id === t);
    confirm(`Delete ${i?.name || "this miniature"}?`) && await e._command({ action: "deleteMiniature", id: t });
  },
  highlightOne: (t) => {
    const i = e._miniatures.find((a) => a.id === t);
    return i?.shelf ? e._command({ action: "highlightLocation", shelf: i.shelf, location: i.location }) : void 0;
  },
  setViewIndex: (t) => e._setViewIndex(t),
  clearViewHighlight: async () => {
    clearTimeout(e._viewTimer), await e._command({ action: "clearHighlight" });
  },
  applyScene: async (t) => {
    clearTimeout(e._viewTimer), await e._command({ action: "applyScene", scene: t });
  },
  setSearchQuery: (t) => {
    e._searchQuery = t, e._render(), e._scheduleSearch();
  },
  setSearchField: (t) => {
    e._searchField = t, e._render(), e._scheduleSearch();
  }
}), tt = ":host{display:block;min-height:100%;background:var(--primary-background-color);color:var(--primary-text-color);font-family:var(--paper-font-body1_-_font-family, Roboto, sans-serif)}cabinet-dial-picker,cabinet-panel-card{display:block}*{box-sizing:border-box}button,input,select{font:inherit}button{cursor:pointer}button:disabled{cursor:not-allowed;opacity:.42}.app-shell{min-height:100vh;overflow-x:hidden;padding-bottom:env(safe-area-inset-bottom,0px)}.topbar{position:sticky;top:0;z-index:4;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:14px 28px;border-bottom:1px solid var(--divider-color);background:var( --app-header-background-color, var(--card-background-color) );box-shadow:0 1px 8px #0000000f}.topbar-main{display:flex;align-items:center;gap:10px;min-width:0}.ha-native-menu{flex:0 0 auto;margin-left:-6px}.brand{display:flex;align-items:center;gap:11px;min-width:190px}.brand-icon{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;background:var(--primary-color);color:var(--text-primary-color);font-weight:800;font-size:13px}.brand b,.brand span{display:block}.brand span{margin-top:2px;color:var(--secondary-text-color);font-size:12px}nav{display:flex;gap:4px;padding:4px;border-radius:12px;background:var(--secondary-background-color)}.nav-tab{display:grid;place-items:center;width:42px;height:38px;border:0;background:transparent;color:var(--secondary-text-color);padding:0;border-radius:9px}.nav-tab svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.nav-tab.active{background:var(--card-background-color);color:var(--primary-text-color);box-shadow:0 1px 4px #00000017}.page{max-width:1500px;margin:0 auto;overflow-x:hidden;padding:28px}.panel-card{border:1px solid var(--divider-color);background:var(--card-background-color);border-radius:18px;box-shadow:var(--ha-card-box-shadow, 0 2px 8px rgba(0, 0, 0, .04))}.general-card{display:flex;justify-content:space-between;align-items:center;gap:30px;padding:22px 24px;margin-bottom:18px}h2,h3,p{margin:0}h2{font-size:22px}h3{font-size:16px}p{margin-top:6px;color:var(--secondary-text-color);font-size:13px;line-height:1.5}.eyebrow{margin-bottom:5px;color:var(--primary-color);font-size:10px;letter-spacing:.12em;font-weight:800}.general-values{display:flex;align-items:center;gap:12px}.metric,.color-control{min-width:110px;padding:10px 13px;background:var(--secondary-background-color);border-radius:12px}.metric span,.color-control span{display:block;color:var(--secondary-text-color);font-size:11px;margin-bottom:5px}.metric b{font-size:20px}.color-control{display:grid;grid-template-columns:1fr auto;column-gap:12px;align-items:center;min-width:170px}.color-control span{margin:0}input[type=color]{width:34px;height:28px;border:0;padding:0;background:none}.configuration-grid{display:grid;grid-template-columns:300px minmax(0,1fr);min-width:0;gap:18px;align-items:start}.shelf-detail{min-width:0;overflow:hidden}.shelf-list,.shelf-detail,.mini-editor,.mini-list-card,.search-card{padding:20px}.section-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}.shelf-items{display:grid;gap:5px}.shelf-row{display:flex;align-items:center;border:1px solid transparent;border-radius:12px;background:var(--secondary-background-color)}.shelf-row.selected{border-color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 10%,var(--card-background-color))}.shelf-select{flex:1;display:flex;align-items:center;gap:10px;text-align:left;padding:10px;border:0;color:inherit;background:transparent}.shelf-select span:last-child{min-width:0}.shelf-select b,.shelf-select small{display:block}.shelf-select small{margin-top:2px;color:var(--secondary-text-color);font-size:10px}.shelf-number,.location-index{display:grid;place-items:center;flex:0 0 32px;height:32px;border-radius:9px;background:var(--card-background-color);font-weight:700;font-size:12px}.row-actions{display:flex;gap:4px;padding-right:7px}.icon-button{width:28px;height:28px;padding:0;border:0;border-radius:8px;background:var(--card-background-color);color:inherit}.insert-shelf{width:100%;border:0;background:transparent;color:var(--primary-color);padding:4px;font-size:10px;opacity:.65}.insert-shelf:hover{opacity:1}.form-grid{display:grid;gap:12px;margin-top:16px}.form-grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}label span{display:block;margin-bottom:6px;color:var(--secondary-text-color);font-size:11px;font-weight:600}input,select{width:100%;min-height:40px;border:1px solid var(--divider-color);border-radius:10px;padding:8px 10px;background:var(--primary-background-color);color:var(--primary-text-color);outline:none}input:focus,select:focus{border-color:var(--primary-color);box-shadow:0 0 0 2px color-mix(in srgb,var(--primary-color) 20%,transparent)}.button-row{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}.button-row.end{justify-content:flex-end}button:not(.nav-tab):not(.shelf-select):not(.icon-button):not(.insert-shelf):not(.location-row):not(.search-result){min-height:38px;border:1px solid var(--divider-color);border-radius:10px;padding:0 13px;background:var(--secondary-background-color);color:var(--primary-text-color)}button.primary{border-color:var(--primary-color)!important;background:var(--primary-color)!important;color:var(--text-primary-color)!important}button.small{min-height:32px!important;font-size:11px}button.ghost{background:transparent!important}button.danger{color:var(--error-color)!important}button.full{width:100%;margin-top:14px}.divider{height:1px;background:var(--divider-color);margin:22px 0}.locations-layout{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(260px,.75fr);gap:18px}.legacy-mapping{display:none}.mapping-visual{min-width:0}.mapping-toggle{display:flex;align-items:center;gap:7px;color:var(--secondary-text-color);font-size:11px}.mapping-toggle input{width:auto;min-height:auto;accent-color:var(--primary-color)}.picker-dial.compact{margin:10px 0 14px;min-height:48px}.picker-dial.compact .dial-tick em{display:none}.picker-dial.compact .dial-tick.active b{font-size:22px}.mapping-tools{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mapping-tools b{margin-left:auto;color:var(--secondary-text-color);font-size:11px}.led-runs{display:grid;gap:20px;max-width:100%;margin-top:16px;overflow-x:auto;padding:4px 0 20px}.led-run{display:grid;grid-auto-flow:column;grid-auto-columns:var(--led-size);width:max-content;min-height:calc(var(--led-size) + 18px)}.led-run.return{margin-left:0}.led-cell{position:relative;width:var(--led-size);height:var(--led-size);min-width:var(--led-size);padding:0;border:1px solid var(--divider-color);border-radius:1px;background:var(--secondary-background-color)}.led-cell.selected{background:#fff;border-color:#fff}.led-cell.assigned{background:color-mix(in srgb,var(--primary-color) 35%,var(--secondary-background-color))}.led-cell.range-start{background:#e83e8c;border-color:#e83e8c}.led-cell.range-end{background:#ff8a00;border-color:#ff8a00}.led-cell small{position:absolute;top:calc(var(--led-size) * 4 + 4px);left:50%;transform:translate(-50%);color:var(--secondary-text-color);font-size:8px;font-weight:600}.mapping-visual{min-width:0;max-width:100%;overflow:hidden}.led-runs{position:relative;contain:inline-size;min-width:0;max-width:100%;width:100%;gap:44px;overflow-x:auto;overflow-y:hidden;padding:8px 32px 24px 28px}.led-runs-content{display:grid;width:max-content;min-width:100%;gap:44px;justify-items:center}.led-run{gap:2px;position:relative}.led-cell{min-height:0!important;height:calc(var(--led-size) * 4)!important;min-width:var(--led-size)!important;width:var(--led-size)!important;padding:0!important;border-radius:1px!important}.led-cell.assigned{background:color-mix(in srgb,var(--primary-color) 35%,var(--secondary-background-color))!important}.led-cell.selected{background:#fff!important;border-color:#fff!important}.led-cell.range-start{background:#e83e8c!important;border-color:#e83e8c!important}.led-cell.range-end{background:#ff8a00!important;border-color:#ff8a00!important}.power-mark{position:absolute;top:4px;left:-20px;display:grid;place-items:center;width:1rem;height:1rem;border-radius:50%;background:var(--primary-color);color:var(--text-primary-color);font-size:10px;z-index:2}.led-runs.mirrored .power-mark{left:auto;right:-20px}.led-run:first-of-type:after{content:none}.strip-connector{position:absolute;z-index:3;top:50%;right:-20px;width:16px;height:calc(var(--led-size) * 4 + 44px);border:2px dashed var(--secondary-text-color);border-left:0;border-radius:0 10px 10px 0;opacity:.9;pointer-events:none}.led-runs.mirrored .strip-connector{right:auto;left:-20px;transform:scaleX(-1)}.led-run{width:max-content;grid-auto-columns:max-content;justify-content:start}.led-run .led-cell{width:auto!important;min-width:0!important;aspect-ratio:1 / 2}.mapping-toggle input{position:absolute;opacity:0;pointer-events:none}.mapping-toggle-icon{display:grid;place-items:center;width:28px;height:28px;border:1px solid var(--divider-color);border-radius:50%;background:var(--secondary-background-color)}.mapping-toggle-icon svg{width:15px;height:15px;fill:none;stroke:var(--secondary-text-color);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.mapping-toggle input:checked+.mapping-toggle-icon{border-color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 18%,var(--secondary-background-color))}.mapping-toggle input:checked+.mapping-toggle-icon svg{stroke:var(--primary-color);fill:color-mix(in srgb,var(--primary-color) 20%,transparent)}.location-list{display:grid;gap:5px;max-height:470px;overflow:auto;padding-right:4px}.location-row{display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:10px;width:100%;min-height:48px;border:1px solid var(--divider-color);border-radius:11px;padding:7px 10px;background:transparent;color:inherit;text-align:left}.location-row.selected{border-color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 9%,transparent)}.location-row.unmapped{opacity:.66}.location-range{font-size:12px}.location-count,.muted{color:var(--secondary-text-color);font-size:11px}.location-editor{align-self:start;padding:18px;border-radius:14px;background:var(--secondary-background-color)}.range-preview{display:flex;justify-content:space-between;gap:12px;margin-top:12px;padding:10px 12px;background:var(--card-background-color);border-radius:10px;font-size:11px}.range-preview span{color:var(--secondary-text-color)}.miniatures-grid{display:grid;grid-template-columns:330px minmax(0,1fr);gap:18px;align-items:start}.mini-editor{position:sticky;top:90px}.mini-list{display:grid;gap:7px}.mini-row{display:grid;grid-template-columns:38px minmax(160px,1fr) minmax(120px,.7fr) auto auto;gap:11px;align-items:center;padding:10px;border:1px solid var(--divider-color);border-radius:12px}.mini-avatar{display:grid;place-items:center;width:36px;height:36px;border-radius:11px;background:color-mix(in srgb,var(--primary-color) 14%,var(--secondary-background-color));color:var(--primary-color);font-weight:800}.mini-main b,.mini-main span{display:block}.mini-main span,.mini-artist{color:var(--secondary-text-color);font-size:11px;margin-top:2px}.position-badge{white-space:nowrap;padding:5px 8px;border-radius:999px;background:color-mix(in srgb,var(--primary-color) 12%,transparent);color:var(--primary-color);font-size:10px;font-weight:700}.position-badge.unassigned{background:var(--secondary-background-color);color:var(--secondary-text-color)}.search-card{max-width:980px;margin:0 auto}.search-controls{display:grid;grid-template-columns:1fr 180px;gap:10px;margin-top:20px}.search-summary{margin:12px 2px}.search-results{display:grid;gap:7px}.search-result{display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:12px;width:100%;padding:10px;border:1px solid var(--divider-color);border-radius:12px;background:transparent;color:inherit;text-align:left}.search-result:hover:not(:disabled){border-color:var(--primary-color)}.search-result-main b,.search-result-main span{display:block}.search-result-main span{margin-top:3px;color:var(--secondary-text-color);font-size:11px}.view-card{max-width:760px;margin:0 auto;padding:22px}.view-mini-card{display:flex;align-items:center;justify-content:flex-start;gap:13px;min-height:94px;padding:14px 32px 14px 14px;text-align:left;border-radius:14px;background:var(--secondary-background-color)}.view-mini-card h3{font-size:18px}.view-mini-card p{max-width:390px}.view-position{margin:12px 0 2px;text-align:center;color:var(--primary-color);font-size:11px;font-weight:800;letter-spacing:.11em}.view-position span{padding:0 5px;color:var(--secondary-text-color)}.picker-shell{position:relative;margin:24px auto 4px;padding:18px 20px 12px;overflow:hidden;border:1px solid var(--divider-color);border-radius:14px;background:var(--primary-background-color)}.picker-caption{margin-bottom:9px;color:var(--secondary-text-color);text-align:center;font-size:9px;font-weight:800;letter-spacing:.22em}.picker-dial{display:grid;grid-template-columns:repeat(7,1fr);align-items:end;min-height:58px;border-top:1px solid var(--divider-color);background:repeating-linear-gradient(90deg,transparent 0 7px,color-mix(in srgb,var(--divider-color) 70%,transparent) 7px 8px);cursor:grab;touch-action:pan-y;-webkit-user-select:none;user-select:none}.picker-dial.dragging{cursor:grabbing}.dial-tick{display:grid;justify-items:center;gap:4px;color:var(--secondary-text-color);font-size:12px;pointer-events:none}.dial-tick i{display:block;width:1px;height:12px;background:currentColor}.dial-tick b{font-size:14px}.dial-tick.active{color:var(--primary-color);transform:translateY(-4px)}.dial-tick.active i{width:2px;height:22px}.dial-tick.active b{font-size:19px}.view-actions{display:flex;justify-content:center;margin-top:13px}.view-controls-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;max-width:760px;margin:18px auto 0}.view-control-card{padding:20px}.scene-list{display:flex;gap:7px;margin-top:15px;flex-wrap:wrap}.scene-button.active{border-color:var(--primary-color)!important;color:var(--primary-color)!important}.strip-controls{display:grid;grid-template-columns:auto 1fr auto;align-items:end;gap:12px;margin-top:15px}.strip-controls label span{margin-bottom:5px}.strip-controls input[type=color]{width:38px;height:38px}.strip-controls input[type=range]{min-height:30px;padding:0;accent-color:var(--primary-color)}.strip-controls output{min-width:34px;padding-bottom:9px;color:var(--secondary-text-color);font-size:11px;font-weight:700}.empty-state{display:grid;gap:5px;place-items:center;padding:40px 18px;text-align:center;color:var(--secondary-text-color)}.empty-state b{color:var(--primary-text-color)}@media(max-width:900px){.configuration-grid,.miniatures-grid,.view-controls-grid{grid-template-columns:1fr}.mini-editor{position:static}.locations-layout{grid-template-columns:1fr}.topbar{align-items:flex-start;flex-direction:column;padding:calc(10px + env(safe-area-inset-top,0px)) 16px 12px}.topbar-main{width:100%}nav{width:100%;justify-content:space-between}.nav-tab{flex:0 0 42px}.page{padding:16px 16px calc(32px + env(safe-area-inset-bottom,0px))}}@media(max-width:600px){.brand-icon{width:36px;height:36px}.general-card{align-items:flex-start;flex-direction:column}.general-values{width:100%}.metric,.color-control{flex:1}.form-grid.two,.search-controls{grid-template-columns:1fr}.mini-row{grid-template-columns:38px 1fr auto}.mini-artist{grid-column:2}.mini-row .row-actions{grid-column:2 / -1}.position-badge{grid-column:3;grid-row:1 / span 2}.view-card{padding:16px}.picker-shell{padding-left:10px;padding-right:10px}.dial-tick b{font-size:11px}.dial-tick.active b{font-size:16px}.picker-dial.compact{min-height:68px}.picker-dial.compact .dial-tick em{display:block;min-height:10px;color:var(--primary-color);font-size:8px;font-style:normal;font-weight:800;letter-spacing:.1em}}", j = (e) => d`<div class="mini-avatar">${e?.[0] || "?"}</div>`, Nt = (e) => e._active === "configuration" ? Ht(e) : e._active === "miniatures" ? It(e) : e._active === "view" ? Rt(e) : Ut(e), Ht = (e) => {
  const t = e._layout, i = t.shelves || [];
  if (!i.length)
    return d`<div class="empty-state">
			<b>Waiting for cabinet layout</b
			><span
				>The panel will populate when the ESP32 publishes its retained
				layout state.</span
			>
		</div>`;
  e._selectedShelf = Math.min(e._selectedShelf, i.length);
  const a = i[e._selectedShelf - 1] || i[0];
  e._selectedLocation = Math.min(
    e._selectedLocation,
    a.total_locations || 1
  );
  const r = a.locations?.[e._selectedLocation - 1];
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
					><b>${t.shelf_count || i.length}</b>
				</div>
				<label class="color-control"
					><span>Highlight color</span
					><input
							id="highlight-color"
							type="color"
							@change=${(s) => e.actions.setHighlightColor(s.target.value)}
						.value=${e._rgbToHex(
    t.highlight_color || { r: 156, g: 39, b: 176 }
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
						@click=${() => e.actions.insertShelf(i.length + 1)}>
						＋ Add shelf
					</button>
				</div>
				<div class="shelf-items">
					${i.map(
    (s, n) => d`<div
									class="shelf-row ${s.shelf === e._selectedShelf ? "selected" : ""}">
									<button
										class="shelf-select"
										@click=${() => e.actions.selectShelf(s.shelf)}>
										<span class="shelf-number"
											>${String(s.shelf).padStart(
      2,
      "0"
    )}</span
										><span
											><b>Shelf ${s.shelf}</b
											><small
												>${s.total_locations}
												locations · ${s.total_leds}
												LEDs</small
											></span
										>
									</button>
									<div class="row-actions">
										<button
											class="icon-button"
											@click=${() => e.actions.moveShelf(s.shelf, Math.max(1, s.shelf - 1))}
											?disabled=${n === 0}>
											↑</button
										><button
											class="icon-button"
											@click=${() => e.actions.moveShelf(s.shelf, Math.min(i.length, s.shelf + 1))}
											?disabled=${n === i.length - 1}>
											↓
										</button>
									</div>
								</div>
								<button
									class="insert-shelf"
									@click=${() => e.actions.insertShelf(s.shelf + 1)}>
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
						@click=${() => e.actions.deleteShelf(a.shelf)}
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
						@click=${e.actions.saveShelf}>
						Save shelf</button
					><button
						@click=${() => e.actions.duplicateShelf(a.shelf)}>
						Duplicate shelf</button
					><button @click=${e.actions.autoMap}>Auto map</button
					><button @click=${e.actions.clearMap}>Clear mapping</button>
				</div>
				<div class="divider"></div>
				${Pt(e, a, r)}
			</main>
		</div>`;
}, Pt = (e, t, i) => {
  const a = e._mappingStart ?? (i?.mapped ? i.start_led : null), r = e._mappingEnd ?? (i?.mapped ? i.start_led + i.leds - 1 : null), s = Array.from({ length: t.total_leds }, (o, l) => {
    const u = a !== null && r !== null && l >= Math.min(a, r) && l <= Math.max(a, r), c = e._showAllMappings && t.locations.some(
      (g) => g.mapped && l >= g.start_led && l < g.start_led + g.leds
    );
    return d`<button
			class="led-cell ${c ? "assigned" : ""} ${u ? "selected" : ""} ${l === a ? "range-start" : ""} ${l === r ? "range-end" : ""}"
			@click=${() => e.actions.selectLed(l)}
			title="LED ${l + 1}">
			${l % 5 === 0 ? d`<small>${l + 1}</small>` : h}
		</button>`;
  }), n = Math.ceil(t.total_leds / 2), p = t.mirrored ? [s.slice(0, n).reverse(), s.slice(n)] : [s.slice(0, n), s.slice(n).reverse()];
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
					.checked=${e._showAllMappings}
					@change=${(o) => e.actions.setShowAllMappings(o.target.checked)} /><span
					>Show all assigned</span
				></label
			>
		</div>
		<cabinet-dial-picker
			.compact=${!0}
			.value=${e._selectedLocation - 1}
			.total=${t.total_locations}
			.ticks=${3}
			@dial-change=${(o) => e.actions.selectMappingLocation(o.detail.value, t.total_locations)}>
		</cabinet-dial-picker>
		<div class="mapping-tools">
			<button @click=${e.actions.toggleDirection}>
				${t.mirrored ? "Start at right" : "Start at left"}</button
			><button
				class="icon-button"
				@click=${() => e.actions.zoom(-0.25)}>
				−</button
			><button
				class="icon-button"
				@click=${() => e.actions.zoom(0.25)}>
				＋
			</button>
		</div>
		<p>
			Selected location: <b>${e._selectedLocation}</b>. Tap first and last
			LED to preview; save commits the range.
		</p>
		<div
			class="led-runs ${t.mirrored ? "mirrored" : ""}"
			style=${`--led-size:${e._ledZoom * 9}px`}>
			<div class="led-runs-content">
				<div class="led-run"><div class="power-mark" aria-label="Strip power">⚡</div>${p[0]}<span class="strip-connector" aria-hidden="true"></span></div>
				<div class="led-run return">${p[1]}</div>
			</div>
		</div>
		<div class="button-row end">
			<button @click=${e.actions.resetLedRange}>Go back</button
			><button
				class="primary"
				@click=${e.actions.saveLedRange}
				?disabled=${a === null || r === null}>
				Save location
			</button>
		</div>
	</section>`;
}, It = (e) => {
  const t = e._miniatures, i = t.find((a) => a.id === e._editingMiniId);
  return d`<div class="miniatures-grid">
		<section class="panel-card mini-editor">
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
				${i ? d`<button @click=${e.actions.cancelMini}>Cancel</button>` : h}<button
					class="primary"
					@click=${e.actions.saveMini}>
					${i ? "Save changes" : "Add miniature"}
				</button>
			</div>
		</section>
		<section class="panel-card mini-list-card">
			<div class="section-heading">
				<div>
					<div class="eyebrow">CATALOGUE</div>
					<h2>${t.length} miniatures</h2>
				</div>
			</div>
			<div class="mini-list">
				${t.map(
    (a) => d`<div class="mini-row">
							${j(a.name)}
							<div class="mini-main">
								<b>${a.name}</b
								><span
									>${a.collection || "No collection"}</span
								>
							</div>
							<div class="mini-artist">
								${a.artist || "Unknown artist"}
							</div>
							<div
								class="position-badge ${a.shelf ? "" : "unassigned"}">
								${a.shelf ? `S${a.shelf} · L${a.location}` : "Unassigned"}
							</div>
							<div class="row-actions">
								<button
									class="ghost"
									@click=${() => e.actions.editMini(a.id)}>
									Edit</button
								><button
									class="danger ghost"
									@click=${() => e.actions.deleteMini(a.id)}>
									Delete
								</button>
							</div>
						</div>`
  )}
			</div>
		</section>
	</div>`;
}, Ut = (e) => {
  const t = e._searchQuery.trim().toLocaleLowerCase(), i = e._searchField === "all" ? ["name", "collection", "artist"] : [e._searchField], a = t ? e._miniatures.filter((s) => i.some((n) => String(s[n] || "").toLocaleLowerCase().includes(t))) : [], r = a.filter((s) => s.shelf > 0 && s.location > 0);
  return d`<section class="panel-card search-card">
		<div class="eyebrow">FIND & HIGHLIGHT</div>
		<h2>Find a miniature in the cabinet</h2>
		<div class="search-controls">
			<input
				id="search-query"
				type="search"
				@input=${(s) => e.actions.setSearchQuery(s.target.value)}
				placeholder="Search miniatures…"
				autocomplete="off"
				.value=${e._searchQuery} /><select
				id="search-field"
				@change=${(s) => e.actions.setSearchField(s.target.value)}
				.value=${e._searchField}>
				<option value="all">All fields</option>
				<option value="name">Name</option>
				<option value="collection">Collection</option>
				<option value="artist">Artist</option>
			</select>
		</div>
		<div
			id="search-summary"
			class="search-summary muted">
			${t ? `${a.length} result${a.length === 1 ? "" : "s"} · ${r.length} assigned` : "Start typing to search."}
		</div>
		<div
			id="search-results"
			class="search-results">${t ? a.length ? a.map((s) => d`<button class="search-result" @click=${() => e.actions.highlightOne(s.id)} ?disabled=${!s.shelf}>${j(s.name)}<div class="search-result-main"><b>${s.name}</b><span>${s.collection || "No collection"} · ${s.artist || "Unknown artist"}</span></div><span class="position-badge ${s.shelf ? "" : "unassigned"}">${s.shelf ? `Shelf ${s.shelf} · Location ${s.location}` : "Unassigned"}</span></button>`) : d`<div class="empty-state"><b>No matches</b><span>Try another term or field.</span></div>` : h}</div>
	</section>`;
}, Rt = (e) => {
  const t = e._viewItem(e._viewIndex);
  return t ? d`<section class="panel-card view-card">
		<div id="view-selection">
			${j(t.name)}
			<h3>${t.name}</h3>
			<p>
				${t.collection || "No collection"} ·
				${t.artist || "Unknown artist"}
			</p>
			<div class="view-position">
				SHELF ${t.shelf} · LOCATION ${t.location}
			</div>
		</div>
		<div class="picker-shell">
			<cabinet-dial-picker
				.value=${e._viewIndex}
				.total=${e._assignedMiniatures.length}
				.ticks=${3}
				@dial-change=${(i) => e.actions.setViewIndex(i.detail.value)}>
			</cabinet-dial-picker>
		</div>
		<div class="view-actions">
			<button @click=${e.actions.clearViewHighlight}>Stop locating</button>
		</div>
	</section>` : d`<cabinet-panel-card class="view-card empty-state">
			<b>No assigned miniatures</b>
		</cabinet-panel-card>`;
}, Ot = async (e, t, i) => {
  e && await e.callService("mqtt", "publish", {
    topic: t,
    payload: JSON.stringify(i),
    qos: 0,
    retain: !1
  });
}, Dt = {
  command_topic: "smartcabinet/cabinet01/api/command",
  layout_entity: "sensor.smart_cabinet_layout",
  miniatures_entity: "sensor.smart_cabinet_miniatures",
  scene_entity: "sensor.smart_cabinet_scene"
};
class jt extends x {
  static styles = it(tt);
  constructor() {
    super(), this._hass = null, this._panel = null, this._narrow = !1, this._active = "configuration", this._selectedShelf = 1, this._selectedLocation = 1, this._editingMiniId = null, this._searchTimer = null, this._dataSignature = null, this._searchQuery = "", this._searchField = "all", this._viewIndex = 0, this._viewTimer = null, this._mappingStart = null, this._mappingEnd = null, this._mappingTimer = null, this._showAllMappings = !1, this._ledZoom = 1, this.actions = zt(this);
  }
  set narrow(t) {
    const i = !!t;
    i !== this._narrow && (this._narrow = i, this._render());
  }
  set panel(t) {
    this._panel = t, this._render();
  }
  set hass(t) {
    this._hass = t;
    const i = t?.states?.[this._config.layout_entity], a = t?.states?.[this._config.miniatures_entity], r = t?.states?.[this._config.scene_entity], s = `${i?.last_updated || ""}|${a?.last_updated || ""}|${r?.last_updated || ""}`;
    s !== this._dataSignature && (this._dataSignature = s, this._render());
  }
  get _config() {
    return { ...Dt, ...this._panel?.config || {} };
  }
  get _layout() {
    return this._hass?.states?.[this._config.layout_entity]?.attributes || { shelves: [], shelf_count: 0 };
  }
  get _miniatures() {
    return this._hass?.states?.[this._config.miniatures_entity]?.attributes?.items || [];
  }
  get _assignedMiniatures() {
    return this._miniatures.filter((t) => Number(t.shelf) > 0 && Number(t.location) > 0);
  }
  _viewItem(t) {
    const i = this._assignedMiniatures;
    return i.length ? i[(t % i.length + i.length) % i.length] : null;
  }
  _command(t) {
    return Ot(this._hass, this._config.command_topic, t);
  }
  _hexToRgb(t) {
    const i = t.replace("#", "");
    return { r: parseInt(i.slice(0, 2), 16), g: parseInt(i.slice(2, 4), 16), b: parseInt(i.slice(4, 6), 16) };
  }
  _rgbToHex(t = {}) {
    const i = (a) => Number(a || 0).toString(16).padStart(2, "0");
    return `#${i(t.r)}${i(t.g)}${i(t.b)}`;
  }
  render() {
    const t = [
      ["view", "View", d`<svg viewBox="0 0 24 24"><path d="M4 19V5m5 14V9m5 10V4m5 15v-8"/></svg>`],
      ["configuration", "Configuration", d`<svg viewBox="0 0 24 24"><path d="M4 4h16v5H4zm0 11h16v5H4zm4-6v6m8-6v6"/></svg>`],
      ["miniatures", "Miniatures", d`<svg viewBox="0 0 24 24"><path d="M7 20v-2a5 5 0 0 1 10 0v2M12 4a4 4 0 1 1 0 8 4 4 0 0"/></svg>`],
      ["search", "Search", d`<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5"/></svg>`]
    ];
    return d`<style>${tt}</style><div class="app-shell"><header class="topbar"><div class="topbar-main"><ha-menu-button class="ha-native-menu"></ha-menu-button><div class="brand"><div class="brand-icon">SC</div><div><b>Smart Cabinet</b><span>Control & catalogue</span></div></div></div><nav>${t.map(([i, a, r]) => d`<button class="nav-tab ${this._active === i ? "active" : ""}" @click=${() => this._selectTab(i)} aria-label=${a} title=${a}>${r}</button>`)}</nav></header><div class="page">${Nt(this)}</div></div>`;
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
    clearTimeout(this._mappingTimer), this._mappingTimer = setTimeout(() => this._command({ action: "highlightLocation", shelf: this._selectedShelf, location: this._selectedLocation }), 220);
  }
  _scheduleViewHighlight() {
    const t = this._viewItem(this._viewIndex);
    t && (clearTimeout(this._viewTimer), this._viewTimer = setTimeout(() => this._command({ action: "highlightLocation", shelf: Number(t.shelf), location: Number(t.location) }), 220));
  }
  async _saveMini() {
    const t = this.shadowRoot.querySelector("#mini-name").value.trim(), i = this.shadowRoot.querySelector("#mini-collection").value.trim(), a = this.shadowRoot.querySelector("#mini-artist").value.trim();
    if (!t) return;
    const r = this._miniatures.find((s) => s.id === this._editingMiniId);
    await this._command(r ? { action: "updateMiniature", id: r.id, name: t, collection: i, artist: a, date: r.date || "", shelf: r.shelf || 0, location: r.location || 0, notes: r.notes || "" } : { action: "createMiniature", name: t, collection: i, artist: a, date: "", shelf: 0, location: 0, notes: "" }), this._editingMiniId = null, this._render();
  }
  _scheduleSearch() {
    clearTimeout(this._searchTimer), this._searchTimer = setTimeout(() => this._highlightSearch(), 220);
  }
  async _highlightSearch() {
    const t = this._searchQuery.trim().toLocaleLowerCase();
    if (!t) return this._command({ action: "clearHighlight" });
    const i = this._searchField === "all" ? ["name", "collection", "artist"] : [this._searchField], a = this._miniatures.filter((r) => Number(r.shelf) > 0 && Number(r.location) > 0 && i.some((s) => String(r[s] || "").toLocaleLowerCase().includes(t)));
    return this._command(a.length ? { action: "highlightLocations", locations: a.map((r) => ({ shelf: r.shelf, location: r.location })) } : { action: "clearHighlight" });
  }
}
customElements.define("ha-panel-smart-cabinet", jt);
