const N = globalThis, U = N.ShadowRoot && (N.ShadyCSS === void 0 || N.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, tt = /* @__PURE__ */ Symbol(), B = /* @__PURE__ */ new WeakMap();
let lt = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== tt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (U && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = B.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && B.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const et = (s) => new lt(typeof s == "string" ? s : s + "", void 0, tt), ct = (s, t) => {
  if (U) s.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const i = document.createElement("style"), a = N.litNonce;
    a !== void 0 && i.setAttribute("nonce", a), i.textContent = e.cssText, s.appendChild(i);
  }
}, V = U ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return et(e);
})(s) : s;
const { is: dt, defineProperty: ht, getOwnPropertyDescriptor: pt, getOwnPropertyNames: ut, getOwnPropertySymbols: mt, getPrototypeOf: gt } = Object, R = globalThis, F = R.trustedTypes, ft = F ? F.emptyScript : "", vt = R.reactiveElementPolyfillSupport, A = (s, t) => s, O = { toAttribute(s, t) {
  switch (t) {
    case Boolean:
      s = s ? ft : null;
      break;
    case Object:
    case Array:
      s = s == null ? s : JSON.stringify(s);
  }
  return s;
}, fromAttribute(s, t) {
  let e = s;
  switch (t) {
    case Boolean:
      e = s !== null;
      break;
    case Number:
      e = s === null ? null : Number(s);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(s);
      } catch {
        e = null;
      }
  }
  return e;
} }, it = (s, t) => !dt(s, t), Z = { attribute: !0, type: String, converter: O, reflect: !1, useDefault: !1, hasChanged: it };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), R.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let y = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = Z) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = /* @__PURE__ */ Symbol(), a = this.getPropertyDescriptor(t, i, e);
      a !== void 0 && ht(this.prototype, t, a);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: a, set: o } = pt(this.prototype, t) ?? { get() {
      return this[e];
    }, set(n) {
      this[e] = n;
    } };
    return { get: a, set(n) {
      const d = a?.call(this);
      o?.call(this, n), this.requestUpdate(t, d, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? Z;
  }
  static _$Ei() {
    if (this.hasOwnProperty(A("elementProperties"))) return;
    const t = gt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(A("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(A("properties"))) {
      const e = this.properties, i = [...ut(e), ...mt(e)];
      for (const a of i) this.createProperty(a, e[a]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [i, a] of e) this.elementProperties.set(i, a);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, i] of this.elementProperties) {
      const a = this._$Eu(e, i);
      a !== void 0 && this._$Eh.set(a, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const a of i) e.unshift(V(a));
    } else t !== void 0 && e.push(V(t));
    return e;
  }
  static _$Eu(t, e) {
    const i = e.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
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
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const i of e.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
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
  attributeChangedCallback(t, e, i) {
    this._$AK(t, i);
  }
  _$ET(t, e) {
    const i = this.constructor.elementProperties.get(t), a = this.constructor._$Eu(t, i);
    if (a !== void 0 && i.reflect === !0) {
      const o = (i.converter?.toAttribute !== void 0 ? i.converter : O).toAttribute(e, i.type);
      this._$Em = t, o == null ? this.removeAttribute(a) : this.setAttribute(a, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const i = this.constructor, a = i._$Eh.get(t);
    if (a !== void 0 && this._$Em !== a) {
      const o = i.getPropertyOptions(a), n = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : O;
      this._$Em = a;
      const d = n.fromAttribute(e, o.type);
      this[a] = d ?? this._$Ej?.get(a) ?? d, this._$Em = null;
    }
  }
  requestUpdate(t, e, i, a = !1, o) {
    if (t !== void 0) {
      const n = this.constructor;
      if (a === !1 && (o = this[t]), i ??= n.getPropertyOptions(t), !((i.hasChanged ?? it)(o, e) || i.useDefault && i.reflect && o === this._$Ej?.get(t) && !this.hasAttribute(n._$Eu(t, i)))) return;
      this.C(t, e, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: i, reflect: a, wrapped: o }, n) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, n ?? e ?? this[t]), o !== !0 || n !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (e = void 0), this._$AL.set(t, e)), a === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
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
        for (const [a, o] of this._$Ep) this[a] = o;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [a, o] of i) {
        const { wrapped: n } = o, d = this[a];
        n !== !0 || this._$AL.has(a) || d === void 0 || this.C(a, void 0, o, d);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(e)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
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
    this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[A("elementProperties")] = /* @__PURE__ */ new Map(), y[A("finalized")] = /* @__PURE__ */ new Map(), vt?.({ ReactiveElement: y }), (R.reactiveElementVersions ??= []).push("2.1.2");
const q = globalThis, W = (s) => s, z = q.trustedTypes, X = z ? z.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, at = "$lit$", f = `lit$${Math.random().toFixed(9).slice(2)}$`, st = "?" + f, _t = `<${st}>`, x = document, E = () => x.createComment(""), T = (s) => s === null || typeof s != "object" && typeof s != "function", D = Array.isArray, bt = (s) => D(s) || typeof s?.[Symbol.iterator] == "function", I = `[ 	
\f\r]`, k = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, G = /-->/g, J = />/g, v = RegExp(`>|${I}(?:([^\\s"'>=/]+)(${I}*=${I}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Q = /'/g, K = /"/g, ot = /^(?:script|style|textarea|title)$/i, xt = (s) => (t, ...e) => ({ _$litType$: s, strings: t, values: e }), m = xt(1), $ = /* @__PURE__ */ Symbol.for("lit-noChange"), u = /* @__PURE__ */ Symbol.for("lit-nothing"), Y = /* @__PURE__ */ new WeakMap(), _ = x.createTreeWalker(x, 129);
function nt(s, t) {
  if (!D(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return X !== void 0 ? X.createHTML(t) : t;
}
const yt = (s, t) => {
  const e = s.length - 1, i = [];
  let a, o = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = k;
  for (let d = 0; d < e; d++) {
    const c = s[d];
    let l, h, r = -1, p = 0;
    for (; p < c.length && (n.lastIndex = p, h = n.exec(c), h !== null); ) p = n.lastIndex, n === k ? h[1] === "!--" ? n = G : h[1] !== void 0 ? n = J : h[2] !== void 0 ? (ot.test(h[2]) && (a = RegExp("</" + h[2], "g")), n = v) : h[3] !== void 0 && (n = v) : n === v ? h[0] === ">" ? (n = a ?? k, r = -1) : h[1] === void 0 ? r = -2 : (r = n.lastIndex - h[2].length, l = h[1], n = h[3] === void 0 ? v : h[3] === '"' ? K : Q) : n === K || n === Q ? n = v : n === G || n === J ? n = k : (n = v, a = void 0);
    const g = n === v && s[d + 1].startsWith("/>") ? " " : "";
    o += n === k ? c + _t : r >= 0 ? (i.push(l), c.slice(0, r) + at + c.slice(r) + f + g) : c + f + (r === -2 ? d : g);
  }
  return [nt(s, o + (s[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class M {
  constructor({ strings: t, _$litType$: e }, i) {
    let a;
    this.parts = [];
    let o = 0, n = 0;
    const d = t.length - 1, c = this.parts, [l, h] = yt(t, e);
    if (this.el = M.createElement(l, i), _.currentNode = this.el.content, e === 2 || e === 3) {
      const r = this.el.content.firstChild;
      r.replaceWith(...r.childNodes);
    }
    for (; (a = _.nextNode()) !== null && c.length < d; ) {
      if (a.nodeType === 1) {
        if (a.hasAttributes()) for (const r of a.getAttributeNames()) if (r.endsWith(at)) {
          const p = h[n++], g = a.getAttribute(r).split(f), S = /([.?@])?(.*)/.exec(p);
          c.push({ type: 1, index: o, name: S[2], strings: g, ctor: S[1] === "." ? wt : S[1] === "?" ? St : S[1] === "@" ? kt : H }), a.removeAttribute(r);
        } else r.startsWith(f) && (c.push({ type: 6, index: o }), a.removeAttribute(r));
        if (ot.test(a.tagName)) {
          const r = a.textContent.split(f), p = r.length - 1;
          if (p > 0) {
            a.textContent = z ? z.emptyScript : "";
            for (let g = 0; g < p; g++) a.append(r[g], E()), _.nextNode(), c.push({ type: 2, index: ++o });
            a.append(r[p], E());
          }
        }
      } else if (a.nodeType === 8) if (a.data === st) c.push({ type: 2, index: o });
      else {
        let r = -1;
        for (; (r = a.data.indexOf(f, r + 1)) !== -1; ) c.push({ type: 7, index: o }), r += f.length - 1;
      }
      o++;
    }
  }
  static createElement(t, e) {
    const i = x.createElement("template");
    return i.innerHTML = t, i;
  }
}
function w(s, t, e = s, i) {
  if (t === $) return t;
  let a = i !== void 0 ? e._$Co?.[i] : e._$Cl;
  const o = T(t) ? void 0 : t._$litDirective$;
  return a?.constructor !== o && (a?._$AO?.(!1), o === void 0 ? a = void 0 : (a = new o(s), a._$AT(s, e, i)), i !== void 0 ? (e._$Co ??= [])[i] = a : e._$Cl = a), a !== void 0 && (t = w(s, a._$AS(s, t.values), a, i)), t;
}
class $t {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: i } = this._$AD, a = (t?.creationScope ?? x).importNode(e, !0);
    _.currentNode = a;
    let o = _.nextNode(), n = 0, d = 0, c = i[0];
    for (; c !== void 0; ) {
      if (n === c.index) {
        let l;
        c.type === 2 ? l = new C(o, o.nextSibling, this, t) : c.type === 1 ? l = new c.ctor(o, c.name, c.strings, this, t) : c.type === 6 && (l = new At(o, this, t)), this._$AV.push(l), c = i[++d];
      }
      n !== c?.index && (o = _.nextNode(), n++);
    }
    return _.currentNode = x, a;
  }
  p(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}
class C {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, i, a) {
    this.type = 2, this._$AH = u, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = a, this._$Cv = a?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && t?.nodeType === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = w(this, t, e), T(t) ? t === u || t == null || t === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : t !== this._$AH && t !== $ && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : bt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== u && T(this._$AH) ? this._$AA.nextSibling.data = t : this.T(x.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: i } = t, a = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = M.createElement(nt(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === a) this._$AH.p(e);
    else {
      const o = new $t(a, this), n = o.u(this.options);
      o.p(e), this.T(n), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = Y.get(t.strings);
    return e === void 0 && Y.set(t.strings, e = new M(t)), e;
  }
  k(t) {
    D(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, a = 0;
    for (const o of t) a === e.length ? e.push(i = new C(this.O(E()), this.O(E()), this, this.options)) : i = e[a], i._$AI(o), a++;
    a < e.length && (this._$AR(i && i._$AB.nextSibling, a), e.length = a);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const i = W(t).nextSibling;
      W(t).remove(), t = i;
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
  constructor(t, e, i, a, o) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = t, this.name = e, this._$AM = a, this.options = o, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = u;
  }
  _$AI(t, e = this, i, a) {
    const o = this.strings;
    let n = !1;
    if (o === void 0) t = w(this, t, e, 0), n = !T(t) || t !== this._$AH && t !== $, n && (this._$AH = t);
    else {
      const d = t;
      let c, l;
      for (t = o[0], c = 0; c < o.length - 1; c++) l = w(this, d[i + c], e, c), l === $ && (l = this._$AH[c]), n ||= !T(l) || l !== this._$AH[c], l === u ? t = u : t !== u && (t += (l ?? "") + o[c + 1]), this._$AH[c] = l;
    }
    n && !a && this.j(t);
  }
  j(t) {
    t === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class wt extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === u ? void 0 : t;
  }
}
class St extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== u);
  }
}
class kt extends H {
  constructor(t, e, i, a, o) {
    super(t, e, i, a, o), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = w(this, t, e, 0) ?? u) === $) return;
    const i = this._$AH, a = t === u && i !== u || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, o = t !== u && (i === u || a);
    a && this.element.removeEventListener(this.name, this, i), o && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class At {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    w(this, t);
  }
}
const Et = q.litHtmlPolyfillSupport;
Et?.(M, C), (q.litHtmlVersions ??= []).push("3.3.3");
const Tt = (s, t, e) => {
  const i = e?.renderBefore ?? t;
  let a = i._$litPart$;
  if (a === void 0) {
    const o = e?.renderBefore ?? null;
    i._$litPart$ = a = new C(t.insertBefore(E(), o), o, void 0, e ?? {});
  }
  return a._$AI(s), a;
};
const j = globalThis;
class b extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Tt(e, this.renderRoot, this.renderOptions);
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
b._$litElement$ = !0, b.finalized = !0, j.litElementHydrateSupport?.({ LitElement: b });
const Mt = j.litElementPolyfillSupport;
Mt?.({ LitElement: b });
(j.litElementVersions ??= []).push("4.2.2");
const rt = (s) => m`<div class="mini-avatar">${s?.[0] || "?"}</div>`, Ct = (s) => s._active === "configuration" ? Lt(s) : s._active === "miniatures" ? zt(s) : s._active === "view" ? Ht(s) : Rt(s), Lt = (s) => {
  const t = s._layout, e = t.shelves || [];
  if (!e.length)
    return m`<div class="empty-state">
			<b>Waiting for cabinet layout</b
			><span
				>The panel will populate when the ESP32 publishes its retained
				layout state.</span
			>
		</div>`;
  s._selectedShelf = Math.min(s._selectedShelf, e.length);
  const i = e[s._selectedShelf - 1] || e[0];
  s._selectedLocation = Math.min(
    s._selectedLocation,
    i.total_locations || 1
  );
  const a = i.locations?.[s._selectedLocation - 1];
  return m` <section class="general-card panel-card">
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
					><b>${t.shelf_count || e.length}</b>
				</div>
				<label class="color-control"
					><span>Highlight color</span
					><input
						id="highlight-color"
						type="color"
						.value=${s._rgbToHex(
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
						data-action="insert-shelf"
						data-position=${e.length + 1}>
						＋ Add shelf
					</button>
				</div>
				<div class="shelf-items">
					${e.map(
    (o, n) => m`<div
									class="shelf-row ${o.shelf === s._selectedShelf ? "selected" : ""}">
									<button
										class="shelf-select"
										data-action="select-shelf"
										data-shelf=${o.shelf}>
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
											data-action="move-shelf"
											data-from=${o.shelf}
											data-to=${Math.max(
      1,
      o.shelf - 1
    )}
											?disabled=${n === 0}>
											↑</button
										><button
											class="icon-button"
											data-action="move-shelf"
											data-from=${o.shelf}
											data-to=${Math.min(
      e.length,
      o.shelf + 1
    )}
											?disabled=${n === e.length - 1}>
											↓
										</button>
									</div>
								</div>
								<button
									class="insert-shelf"
									data-action="insert-shelf"
									data-position=${o.shelf + 1}>
									＋ Insert shelf here
								</button>`
  )}
				</div>
			</aside>
			<main class="panel-card shelf-detail">
				<div class="section-heading detail-heading">
					<div>
						<div class="eyebrow">SELECTED SHELF</div>
						<h2>Shelf ${i.shelf}</h2>
					</div>
					<button
						class="danger ghost"
						data-action="delete-shelf"
						data-shelf=${i.shelf}
						?disabled=${e.length <= 1}>
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
							.value=${String(i.total_leds)} /></label
					><label
						><span>Total locations</span
						><input
							id="shelf-locations"
							type="number"
							min="1"
							.value=${String(i.total_locations)}
					/></label>
				</div>
				<div class="button-row">
					<button
						class="primary"
						data-action="save-shelf">
						Save shelf</button
					><button
						data-action="duplicate-shelf"
						data-shelf=${i.shelf}>
						Duplicate shelf</button
					><button data-action="auto-map">Auto map</button
					><button data-action="clear-map">Clear mapping</button>
				</div>
				<div class="divider"></div>
				${Nt(s, i, a)}
			</main>
		</div>`;
}, Nt = (s, t, e) => {
  const i = s._mappingStart ?? (e?.mapped ? e.start_led : null), a = s._mappingEnd ?? (e?.mapped ? e.start_led + e.leds - 1 : null), o = Array.from({ length: t.total_leds }, (c, l) => {
    const h = i !== null && a !== null && l >= Math.min(i, a) && l <= Math.max(i, a), r = s._showAllMappings && t.locations.some(
      (p) => p.mapped && l >= p.start_led && l < p.start_led + p.leds
    );
    return m`<button
			class="led-cell ${r ? "assigned" : ""} ${h ? "selected" : ""} ${l === i ? "range-start" : ""} ${l === a ? "range-end" : ""}"
			data-action="select-led"
			data-led=${l}
			title="LED ${l + 1}">
			${l % 5 === 0 ? m`<small>${l + 1}</small>` : u}
		</button>`;
  }), n = Math.ceil(t.total_leds / 2), d = t.mirrored ? [o.slice(0, n).reverse(), o.slice(n)] : [o.slice(0, n), o.slice(n).reverse()];
  return m`<section class="mapping-visual">
		<div class="section-heading">
			<div>
				<div class="eyebrow">LOCATIONS</div>
				<h3>LED mapping</h3>
			</div>
			<label class="mapping-toggle"
				><input
					id="show-all-mappings"
					type="checkbox"
					.checked=${s._showAllMappings} /><span
					>Show all assigned</span
				></label
			>
		</div>
		<cabinet-dial-picker
			.compact=${!0}
			.value=${s._selectedLocation - 1}
			.total=${t.total_locations}
			.ticks=${3}
			@dial-change=${(c) => {
    s._selectedLocation = (c.detail.value % t.total_locations + t.total_locations) % t.total_locations + 1, s._mappingStart = null, s._mappingEnd = null, s._render(), s._scheduleMappingHighlight();
  }}>
		</cabinet-dial-picker>
		<div class="mapping-tools">
			<button data-action="toggle-direction">
				${t.mirrored ? "Start at right" : "Start at left"}</button
			><button
				class="icon-button"
				data-action="zoom-out">
				−</button
			><button
				class="icon-button"
				data-action="zoom-in">
				＋
			</button>
		</div>
		<p>
			Selected location: <b>${s._selectedLocation}</b>. Tap first and last
			LED to preview; save commits the range.
		</p>
		<div
			class="led-runs ${t.mirrored ? "mirrored" : ""}"
			style=${`--led-size:${s._ledZoom * 9}px`}>
			<div class="led-runs-content">
				<div class="led-run"><div class="power-mark" aria-label="Strip power">⚡</div>${d[0]}<span class="strip-connector" aria-hidden="true"></span></div>
				<div class="led-run return">${d[1]}</div>
			</div>
		</div>
		<div class="button-row end">
			<button data-action="reset-led-range">Go back</button
			><button
				class="primary"
				data-action="save-led-range"
				?disabled=${i === null || a === null}>
				Save location
			</button>
		</div>
	</section>`;
}, zt = (s) => {
  const t = s._miniatures, e = t.find((i) => i.id === s._editingMiniId);
  return m`<div class="miniatures-grid">
		<section class="panel-card mini-editor">
			<div class="eyebrow">
				${e ? "EDIT MINIATURE" : "NEW MINIATURE"}
			</div>
			<h2>${e?.name || "Add to catalogue"}</h2>
			<div class="form-grid">
				<label
					><span>Name</span
					><input
						id="mini-name"
						maxlength="80"
						.value=${e?.name || ""} /></label
				><label
					><span>Collection</span
					><input
						id="mini-collection"
						maxlength="80"
						.value=${e?.collection || ""} /></label
				><label
					><span>Artist</span
					><input
						id="mini-artist"
						maxlength="80"
						.value=${e?.artist || ""}
				/></label>
			</div>
			<div class="button-row end">
				${e ? m`<button data-action="cancel-mini">Cancel</button>` : u}<button
					class="primary"
					data-action="save-mini">
					${e ? "Save changes" : "Add miniature"}
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
    (i) => m`<div class="mini-row">
							${rt(i.name)}
							<div class="mini-main">
								<b>${i.name}</b
								><span
									>${i.collection || "No collection"}</span
								>
							</div>
							<div class="mini-artist">
								${i.artist || "Unknown artist"}
							</div>
							<div
								class="position-badge ${i.shelf ? "" : "unassigned"}">
								${i.shelf ? `S${i.shelf} · L${i.location}` : "Unassigned"}
							</div>
							<div class="row-actions">
								<button
									class="ghost"
									data-action="edit-mini"
									data-id=${i.id}>
									Edit</button
								><button
									class="danger ghost"
									data-action="delete-mini"
									data-id=${i.id}>
									Delete
								</button>
							</div>
						</div>`
  )}
			</div>
		</section>
	</div>`;
}, Rt = (s) => m`<section class="panel-card search-card">
		<div class="eyebrow">FIND & HIGHLIGHT</div>
		<h2>Find a miniature in the cabinet</h2>
		<div class="search-controls">
			<input
				id="search-query"
				type="search"
				placeholder="Search miniatures…"
				autocomplete="off"
				.value=${s._searchQuery} /><select
				id="search-field"
				.value=${s._searchField}>
				<option value="all">All fields</option>
				<option value="name">Name</option>
				<option value="collection">Collection</option>
				<option value="artist">Artist</option>
			</select>
		</div>
		<div
			id="search-summary"
			class="search-summary muted">
			Start typing to search.
		</div>
		<div
			id="search-results"
			class="search-results"></div>
	</section>`, Ht = (s) => {
  const t = s._viewItem(s._viewIndex);
  return t ? m`<section class="panel-card view-card">
		<div id="view-selection">
			${rt(t.name)}
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
				.value=${s._viewIndex}
				.total=${s._assignedMiniatures.length}
				.ticks=${3}
				@dial-change=${(e) => s._setViewIndex(e.detail.value)}>
			</cabinet-dial-picker>
		</div>
		<div class="view-actions">
			<button data-action="clear-view-highlight">Stop locating</button>
		</div>
	</section>` : m`<cabinet-panel-card class="view-card empty-state">
			<b>No assigned miniatures</b>
		</cabinet-panel-card>`;
};
class It extends b {
  createRenderRoot() {
    return this;
  }
  render() {
    return m`<section class="panel-card ${this.className || ""}">
			<slot></slot>
		</section>`;
  }
}
customElements.define("cabinet-panel-card", It);
class Pt extends b {
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
    const e = Math.trunc((this._drag.x - t.clientX) / 36);
    e !== this._drag.steps && (this._drag.steps = e, this.dispatchEvent(
      new CustomEvent("dial-change", {
        detail: { value: this._drag.value + e },
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
      (e, i) => i - this.ticks
    );
    return m`<div
			class="picker-dial ${this.compact ? "compact" : ""}"
			@pointerdown=${this._start}
			@pointermove=${this._move}
			@pointerup=${this._finish}
			@pointercancel=${this._finish}
			@lostpointercapture=${this._finish}>
			${t.map(
      (e) => m`<span class="dial-tick ${e === 0 ? "active" : ""}"
						>${this.compact && e === 0 ? m`<em>LOCATION</em>` : ""}<i></i
						><b
							>${((this.value + e) % this.total + this.total) % this.total + 1}</b
						></span
					>`
    )}
		</div>`;
  }
}
customElements.define("cabinet-dial-picker", Pt);
const P = ":host{display:block;min-height:100%;background:var(--primary-background-color);color:var(--primary-text-color);font-family:var(--paper-font-body1_-_font-family, Roboto, sans-serif)}cabinet-dial-picker,cabinet-panel-card{display:block}*{box-sizing:border-box}button,input,select{font:inherit}button{cursor:pointer}button:disabled{cursor:not-allowed;opacity:.42}.app-shell{min-height:100vh;overflow-x:hidden;padding-bottom:env(safe-area-inset-bottom,0px)}.topbar{position:sticky;top:0;z-index:4;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:14px 28px;border-bottom:1px solid var(--divider-color);background:var( --app-header-background-color, var(--card-background-color) );box-shadow:0 1px 8px #0000000f}.topbar-main{display:flex;align-items:center;gap:10px;min-width:0}.ha-native-menu{flex:0 0 auto;margin-left:-6px}.brand{display:flex;align-items:center;gap:11px;min-width:190px}.brand-icon{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;background:var(--primary-color);color:var(--text-primary-color);font-weight:800;font-size:13px}.brand b,.brand span{display:block}.brand span{margin-top:2px;color:var(--secondary-text-color);font-size:12px}nav{display:flex;gap:4px;padding:4px;border-radius:12px;background:var(--secondary-background-color)}.nav-tab{display:grid;place-items:center;width:42px;height:38px;border:0;background:transparent;color:var(--secondary-text-color);padding:0;border-radius:9px}.nav-tab svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.nav-tab.active{background:var(--card-background-color);color:var(--primary-text-color);box-shadow:0 1px 4px #00000017}.page{max-width:1500px;margin:0 auto;overflow-x:hidden;padding:28px}.panel-card{border:1px solid var(--divider-color);background:var(--card-background-color);border-radius:18px;box-shadow:var(--ha-card-box-shadow, 0 2px 8px rgba(0, 0, 0, .04))}.general-card{display:flex;justify-content:space-between;align-items:center;gap:30px;padding:22px 24px;margin-bottom:18px}h2,h3,p{margin:0}h2{font-size:22px}h3{font-size:16px}p{margin-top:6px;color:var(--secondary-text-color);font-size:13px;line-height:1.5}.eyebrow{margin-bottom:5px;color:var(--primary-color);font-size:10px;letter-spacing:.12em;font-weight:800}.general-values{display:flex;align-items:center;gap:12px}.metric,.color-control{min-width:110px;padding:10px 13px;background:var(--secondary-background-color);border-radius:12px}.metric span,.color-control span{display:block;color:var(--secondary-text-color);font-size:11px;margin-bottom:5px}.metric b{font-size:20px}.color-control{display:grid;grid-template-columns:1fr auto;column-gap:12px;align-items:center;min-width:170px}.color-control span{margin:0}input[type=color]{width:34px;height:28px;border:0;padding:0;background:none}.configuration-grid{display:grid;grid-template-columns:300px minmax(0,1fr);min-width:0;gap:18px;align-items:start}.shelf-detail{min-width:0;overflow:hidden}.shelf-list,.shelf-detail,.mini-editor,.mini-list-card,.search-card{padding:20px}.section-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}.shelf-items{display:grid;gap:5px}.shelf-row{display:flex;align-items:center;border:1px solid transparent;border-radius:12px;background:var(--secondary-background-color)}.shelf-row.selected{border-color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 10%,var(--card-background-color))}.shelf-select{flex:1;display:flex;align-items:center;gap:10px;text-align:left;padding:10px;border:0;color:inherit;background:transparent}.shelf-select span:last-child{min-width:0}.shelf-select b,.shelf-select small{display:block}.shelf-select small{margin-top:2px;color:var(--secondary-text-color);font-size:10px}.shelf-number,.location-index{display:grid;place-items:center;flex:0 0 32px;height:32px;border-radius:9px;background:var(--card-background-color);font-weight:700;font-size:12px}.row-actions{display:flex;gap:4px;padding-right:7px}.icon-button{width:28px;height:28px;padding:0;border:0;border-radius:8px;background:var(--card-background-color);color:inherit}.insert-shelf{width:100%;border:0;background:transparent;color:var(--primary-color);padding:4px;font-size:10px;opacity:.65}.insert-shelf:hover{opacity:1}.form-grid{display:grid;gap:12px;margin-top:16px}.form-grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}label span{display:block;margin-bottom:6px;color:var(--secondary-text-color);font-size:11px;font-weight:600}input,select{width:100%;min-height:40px;border:1px solid var(--divider-color);border-radius:10px;padding:8px 10px;background:var(--primary-background-color);color:var(--primary-text-color);outline:none}input:focus,select:focus{border-color:var(--primary-color);box-shadow:0 0 0 2px color-mix(in srgb,var(--primary-color) 20%,transparent)}.button-row{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}.button-row.end{justify-content:flex-end}button:not(.nav-tab):not(.shelf-select):not(.icon-button):not(.insert-shelf):not(.location-row):not(.search-result){min-height:38px;border:1px solid var(--divider-color);border-radius:10px;padding:0 13px;background:var(--secondary-background-color);color:var(--primary-text-color)}button.primary{border-color:var(--primary-color)!important;background:var(--primary-color)!important;color:var(--text-primary-color)!important}button.small{min-height:32px!important;font-size:11px}button.ghost{background:transparent!important}button.danger{color:var(--error-color)!important}button.full{width:100%;margin-top:14px}.divider{height:1px;background:var(--divider-color);margin:22px 0}.locations-layout{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(260px,.75fr);gap:18px}.legacy-mapping{display:none}.mapping-visual{min-width:0}.mapping-toggle{display:flex;align-items:center;gap:7px;color:var(--secondary-text-color);font-size:11px}.mapping-toggle input{width:auto;min-height:auto;accent-color:var(--primary-color)}.picker-dial.compact{margin:10px 0 14px;min-height:48px}.picker-dial.compact .dial-tick em{display:none}.picker-dial.compact .dial-tick.active b{font-size:22px}.mapping-tools{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mapping-tools b{margin-left:auto;color:var(--secondary-text-color);font-size:11px}.led-runs{display:grid;gap:20px;max-width:100%;margin-top:16px;overflow-x:auto;padding:4px 0 20px}.led-run{display:grid;grid-auto-flow:column;grid-auto-columns:var(--led-size);width:max-content;min-height:calc(var(--led-size) + 18px)}.led-run.return{margin-left:0}.led-cell{position:relative;width:var(--led-size);height:var(--led-size);min-width:var(--led-size);padding:0;border:1px solid var(--divider-color);border-radius:1px;background:var(--secondary-background-color)}.led-cell.selected{background:#fff;border-color:#fff}.led-cell.assigned{background:color-mix(in srgb,var(--primary-color) 35%,var(--secondary-background-color))}.led-cell.range-start{background:#e83e8c;border-color:#e83e8c}.led-cell.range-end{background:#ff8a00;border-color:#ff8a00}.led-cell small{position:absolute;top:calc(var(--led-size) * 4 + 4px);left:50%;transform:translate(-50%);color:var(--secondary-text-color);font-size:8px;font-weight:600}.mapping-visual{min-width:0;max-width:100%;overflow:hidden}.led-runs{position:relative;contain:inline-size;min-width:0;max-width:100%;width:100%;gap:44px;overflow-x:auto;overflow-y:hidden;padding:8px 32px 24px 28px}.led-runs-content{display:grid;width:max-content;min-width:100%;gap:44px;justify-items:center}.led-run{gap:2px;position:relative}.led-cell{min-height:0!important;height:calc(var(--led-size) * 4)!important;min-width:var(--led-size)!important;width:var(--led-size)!important;padding:0!important;border-radius:1px!important}.led-cell.assigned{background:color-mix(in srgb,var(--primary-color) 35%,var(--secondary-background-color))!important}.led-cell.selected{background:#fff!important;border-color:#fff!important}.led-cell.range-start{background:#e83e8c!important;border-color:#e83e8c!important}.led-cell.range-end{background:#ff8a00!important;border-color:#ff8a00!important}.power-mark{position:absolute;top:4px;left:-20px;display:grid;place-items:center;width:1rem;height:1rem;border-radius:50%;background:var(--primary-color);color:var(--text-primary-color);font-size:10px;z-index:2}.led-runs.mirrored .power-mark{left:auto;right:-20px}.led-run:first-of-type:after{content:none}.strip-connector{position:absolute;z-index:3;top:50%;right:-20px;width:16px;height:calc(var(--led-size) * 4 + 44px);border:2px dashed var(--secondary-text-color);border-left:0;border-radius:0 10px 10px 0;opacity:.9;pointer-events:none}.led-runs.mirrored .strip-connector{right:auto;left:-20px;transform:scaleX(-1)}.led-run{width:max-content;grid-auto-columns:max-content;justify-content:start}.led-run .led-cell{width:auto!important;min-width:0!important;aspect-ratio:1 / 2}.mapping-toggle input{position:absolute;opacity:0;pointer-events:none}.mapping-toggle-icon{display:grid;place-items:center;width:28px;height:28px;border:1px solid var(--divider-color);border-radius:50%;background:var(--secondary-background-color)}.mapping-toggle-icon svg{width:15px;height:15px;fill:none;stroke:var(--secondary-text-color);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.mapping-toggle input:checked+.mapping-toggle-icon{border-color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 18%,var(--secondary-background-color))}.mapping-toggle input:checked+.mapping-toggle-icon svg{stroke:var(--primary-color);fill:color-mix(in srgb,var(--primary-color) 20%,transparent)}.location-list{display:grid;gap:5px;max-height:470px;overflow:auto;padding-right:4px}.location-row{display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:10px;width:100%;min-height:48px;border:1px solid var(--divider-color);border-radius:11px;padding:7px 10px;background:transparent;color:inherit;text-align:left}.location-row.selected{border-color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 9%,transparent)}.location-row.unmapped{opacity:.66}.location-range{font-size:12px}.location-count,.muted{color:var(--secondary-text-color);font-size:11px}.location-editor{align-self:start;padding:18px;border-radius:14px;background:var(--secondary-background-color)}.range-preview{display:flex;justify-content:space-between;gap:12px;margin-top:12px;padding:10px 12px;background:var(--card-background-color);border-radius:10px;font-size:11px}.range-preview span{color:var(--secondary-text-color)}.miniatures-grid{display:grid;grid-template-columns:330px minmax(0,1fr);gap:18px;align-items:start}.mini-editor{position:sticky;top:90px}.mini-list{display:grid;gap:7px}.mini-row{display:grid;grid-template-columns:38px minmax(160px,1fr) minmax(120px,.7fr) auto auto;gap:11px;align-items:center;padding:10px;border:1px solid var(--divider-color);border-radius:12px}.mini-avatar{display:grid;place-items:center;width:36px;height:36px;border-radius:11px;background:color-mix(in srgb,var(--primary-color) 14%,var(--secondary-background-color));color:var(--primary-color);font-weight:800}.mini-main b,.mini-main span{display:block}.mini-main span,.mini-artist{color:var(--secondary-text-color);font-size:11px;margin-top:2px}.position-badge{white-space:nowrap;padding:5px 8px;border-radius:999px;background:color-mix(in srgb,var(--primary-color) 12%,transparent);color:var(--primary-color);font-size:10px;font-weight:700}.position-badge.unassigned{background:var(--secondary-background-color);color:var(--secondary-text-color)}.search-card{max-width:980px;margin:0 auto}.search-controls{display:grid;grid-template-columns:1fr 180px;gap:10px;margin-top:20px}.search-summary{margin:12px 2px}.search-results{display:grid;gap:7px}.search-result{display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:12px;width:100%;padding:10px;border:1px solid var(--divider-color);border-radius:12px;background:transparent;color:inherit;text-align:left}.search-result:hover:not(:disabled){border-color:var(--primary-color)}.search-result-main b,.search-result-main span{display:block}.search-result-main span{margin-top:3px;color:var(--secondary-text-color);font-size:11px}.view-card{max-width:760px;margin:0 auto;padding:22px}.view-mini-card{display:flex;align-items:center;justify-content:flex-start;gap:13px;min-height:94px;padding:14px 32px 14px 14px;text-align:left;border-radius:14px;background:var(--secondary-background-color)}.view-mini-card h3{font-size:18px}.view-mini-card p{max-width:390px}.view-position{margin:12px 0 2px;text-align:center;color:var(--primary-color);font-size:11px;font-weight:800;letter-spacing:.11em}.view-position span{padding:0 5px;color:var(--secondary-text-color)}.picker-shell{position:relative;margin:24px auto 4px;padding:18px 20px 12px;overflow:hidden;border:1px solid var(--divider-color);border-radius:14px;background:var(--primary-background-color)}.picker-caption{margin-bottom:9px;color:var(--secondary-text-color);text-align:center;font-size:9px;font-weight:800;letter-spacing:.22em}.picker-dial{display:grid;grid-template-columns:repeat(7,1fr);align-items:end;min-height:58px;border-top:1px solid var(--divider-color);background:repeating-linear-gradient(90deg,transparent 0 7px,color-mix(in srgb,var(--divider-color) 70%,transparent) 7px 8px);cursor:grab;touch-action:pan-y;-webkit-user-select:none;user-select:none}.picker-dial.dragging{cursor:grabbing}.dial-tick{display:grid;justify-items:center;gap:4px;color:var(--secondary-text-color);font-size:12px;pointer-events:none}.dial-tick i{display:block;width:1px;height:12px;background:currentColor}.dial-tick b{font-size:14px}.dial-tick.active{color:var(--primary-color);transform:translateY(-4px)}.dial-tick.active i{width:2px;height:22px}.dial-tick.active b{font-size:19px}.view-actions{display:flex;justify-content:center;margin-top:13px}.view-controls-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;max-width:760px;margin:18px auto 0}.view-control-card{padding:20px}.scene-list{display:flex;gap:7px;margin-top:15px;flex-wrap:wrap}.scene-button.active{border-color:var(--primary-color)!important;color:var(--primary-color)!important}.strip-controls{display:grid;grid-template-columns:auto 1fr auto;align-items:end;gap:12px;margin-top:15px}.strip-controls label span{margin-bottom:5px}.strip-controls input[type=color]{width:38px;height:38px}.strip-controls input[type=range]{min-height:30px;padding:0;accent-color:var(--primary-color)}.strip-controls output{min-width:34px;padding-bottom:9px;color:var(--secondary-text-color);font-size:11px;font-weight:700}.empty-state{display:grid;gap:5px;place-items:center;padding:40px 18px;text-align:center;color:var(--secondary-text-color)}.empty-state b{color:var(--primary-text-color)}@media(max-width:900px){.configuration-grid,.miniatures-grid,.view-controls-grid{grid-template-columns:1fr}.mini-editor{position:static}.locations-layout{grid-template-columns:1fr}.topbar{align-items:flex-start;flex-direction:column;padding:calc(10px + env(safe-area-inset-top,0px)) 16px 12px}.topbar-main{width:100%}nav{width:100%;justify-content:space-between}.nav-tab{flex:0 0 42px}.page{padding:16px 16px calc(32px + env(safe-area-inset-bottom,0px))}}@media(max-width:600px){.brand-icon{width:36px;height:36px}.general-card{align-items:flex-start;flex-direction:column}.general-values{width:100%}.metric,.color-control{flex:1}.form-grid.two,.search-controls{grid-template-columns:1fr}.mini-row{grid-template-columns:38px 1fr auto}.mini-artist{grid-column:2}.mini-row .row-actions{grid-column:2 / -1}.position-badge{grid-column:3;grid-row:1 / span 2}.view-card{padding:16px}.picker-shell{padding-left:10px;padding-right:10px}.dial-tick b{font-size:11px}.dial-tick.active b{font-size:16px}.picker-dial.compact{min-height:68px}.picker-dial.compact .dial-tick em{display:block;min-height:10px;color:var(--primary-color);font-size:8px;font-style:normal;font-weight:800;letter-spacing:.1em}}", Ot = {
  command_topic: "smartcabinet/cabinet01/api/command",
  layout_entity: "sensor.smart_cabinet_layout",
  miniatures_entity: "sensor.smart_cabinet_miniatures",
  scene_entity: "sensor.smart_cabinet_scene",
  mini_lights_command_topic: "smartcabinet/cabinet01/ha/mini_lights/set"
};
class Ut extends b {
  static styles = et(P);
  constructor() {
    super(), this._hass = null, this._panel = null, this._narrow = !1, this._active = "configuration", this._selectedShelf = 1, this._selectedLocation = 1, this._editingMiniId = null, this._previewTimer = null, this._searchTimer = null, this._dataSignature = null, this._searchQuery = "", this._searchField = "all", this._viewIndex = 0, this._viewTimer = null, this._mappingStart = null, this._mappingEnd = null, this._mappingTimer = null, this._showAllMappings = !1, this._ledZoom = 1;
  }
  set narrow(t) {
    const e = !!t;
    e !== this._narrow && (this._narrow = e, this._render());
  }
  set panel(t) {
    this._panel = t, this._render();
  }
  set hass(t) {
    this._hass = t;
    const e = t?.states?.[this._config.layout_entity], i = t?.states?.[this._config.miniatures_entity], a = t?.states?.[this._config.scene_entity], o = `${e?.last_updated || ""}|${i?.last_updated || ""}|${a?.last_updated || ""}`;
    o !== this._dataSignature && (this._dataSignature = o, this._render());
  }
  get _config() {
    return { ...Ot, ...this._panel?.config || {} };
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
      (t) => Number(t.shelf) > 0 && Number(t.location) > 0
    );
  }
  _viewItem(t) {
    const e = this._assignedMiniatures;
    return e.length ? e[(t % e.length + e.length) % e.length] : null;
  }
  async _command(t) {
    this._hass && await this._hass.callService("mqtt", "publish", {
      topic: this._config.command_topic,
      payload: JSON.stringify(t),
      qos: 0,
      retain: !1
    });
  }
  async _miniLightsCommand(t) {
    this._hass && await this._hass.callService("mqtt", "publish", {
      topic: this._config.mini_lights_command_topic,
      payload: JSON.stringify(t),
      qos: 0,
      retain: !1
    });
  }
  _escape(t = "") {
    return String(t).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  }
  _hexToRgb(t) {
    const e = t.replace("#", "");
    return {
      r: parseInt(e.slice(0, 2), 16),
      g: parseInt(e.slice(2, 4), 16),
      b: parseInt(e.slice(4, 6), 16)
    };
  }
  _rgbToHex(t = {}) {
    const e = (i) => Number(i || 0).toString(16).padStart(2, "0");
    return `#${e(t.r)}${e(t.g)}${e(t.b)}`;
  }
  render() {
    const t = Ct(this);
    return m`<style>${P}</style><div class="app-shell">
			<header class="topbar">
				<div class="topbar-main">
					<ha-menu-button class="ha-native-menu"></ha-menu-button>
					<div class="brand">
						<div class="brand-icon">SC</div>
						<div>
							<b>Smart Cabinet</b><span>Control & catalogue</span>
						</div>
					</div>
				</div>
				<nav>
					<button
						class="nav-tab ${this._active === "view" ? "active" : ""}"
						@click=${() => this._selectTab("view")}
						aria-label="View"
						title="View">
						<svg viewBox="0 0 24 24"><path d="M4 19V5m5 14V9m5 10V4m5 15v-8"/></svg></button
					><button
						class="nav-tab ${this._active === "configuration" ? "active" : ""}"
						@click=${() => this._selectTab("configuration")}
						aria-label="Configuration"
						title="Configuration">
						<svg viewBox="0 0 24 24"><path d="M4 4h16v5H4zm0 11h16v5H4zm4-6v6m8-6v6"/></svg></button
					><button
						class="nav-tab ${this._active === "miniatures" ? "active" : ""}"
						@click=${() => this._selectTab("miniatures")}
						aria-label="Miniatures"
						title="Miniatures">
						<svg viewBox="0 0 24 24"><path d="M7 20v-2a5 5 0 0 1 10 0v2M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/></svg></button
					><button
						class="nav-tab ${this._active === "search" ? "active" : ""}"
						@click=${() => this._selectTab("search")}
						aria-label="Search"
						title="Search">
						<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5"/></svg>
					</button>
				</nav>
			</header>
			<div class="page">${t}</div>
		</div>`;
  }
  _render() {
    this.requestUpdate();
  }
  _selectTab(t) {
    this._active = t, this.requestUpdate(), t === "view" && this._scheduleViewHighlight();
  }
  updated() {
    this._bind(), this._active === "search" && this._updateSearch(!1);
  }
  _bind() {
    this.shadowRoot.querySelectorAll("[data-tab]").forEach(
      (l) => l.onclick = () => {
        this._active = l.dataset.tab, this._render(), this._active === "view" && this._scheduleViewHighlight();
      }
    ), this.shadowRoot.querySelectorAll("[data-action]").forEach((l) => l.onclick = () => this._action(l));
    const t = this.shadowRoot.querySelector("#highlight-color");
    t && (t.onchange = () => this._command({
      action: "setHighlightColor",
      ...this._hexToRgb(t.value)
    }));
    const e = this.shadowRoot.querySelector("#location-start"), i = this.shadowRoot.querySelector("#location-leds");
    [e, i].filter(Boolean).forEach(
      (l) => l.oninput = () => this._previewLocation()
    );
    const a = this.shadowRoot.querySelector("#search-query"), o = this.shadowRoot.querySelector("#search-field");
    a && (a.oninput = () => {
      this._searchQuery = a.value, this._scheduleSearch();
    }), o && (o.onchange = () => {
      this._searchField = o.value, this._scheduleSearch();
    }), this._bindViewDial(), this._bindMappingLocationDial();
    const n = this.shadowRoot.querySelector("#show-all-mappings");
    n && (n.onchange = () => {
      this._showAllMappings = n.checked, this._render();
    });
    const d = this.shadowRoot.querySelector("#view-mini-color");
    d && (d.onchange = async () => {
      clearTimeout(this._viewTimer), await this._command({ action: "clearHighlight" }), await this._miniLightsCommand({
        state: "ON",
        color: this._hexToRgb(d.value)
      });
    });
    const c = this.shadowRoot.querySelector(
      "#view-mini-brightness"
    );
    c && (c.oninput = () => {
      const l = Number(c.value), h = this.shadowRoot.querySelector(
        "#view-mini-brightness-value"
      );
      h && (h.textContent = `${l}%`), clearTimeout(this._viewTimer), this._viewTimer = setTimeout(async () => {
        await this._command({ action: "clearHighlight" }), await this._miniLightsCommand({
          state: "ON",
          brightness: l
        });
      }, 180);
    });
  }
  async _action(t) {
    const e = t.dataset.action;
    if (e === "select-shelf")
      this._selectedShelf = Number(t.dataset.shelf), this._selectedLocation = 1, this._render();
    else if (e === "select-location")
      this._selectedLocation = Number(t.dataset.location), await this._command({
        action: "highlightLocation",
        shelf: this._selectedShelf,
        location: this._selectedLocation
      }), this._render();
    else if (e === "insert-shelf")
      await this._command({
        action: "insertShelf",
        position: Number(t.dataset.position)
      });
    else if (e === "duplicate-shelf")
      await this._command({
        action: "duplicateShelf",
        shelf: Number(t.dataset.shelf)
      });
    else if (e === "delete-shelf")
      confirm(
        `Delete Shelf ${t.dataset.shelf}? Miniatures on it will become Unassigned.`
      ) && await this._command({
        action: "deleteShelf",
        shelf: Number(t.dataset.shelf)
      });
    else if (e === "move-shelf")
      await this._command({
        action: "moveShelf",
        from: Number(t.dataset.from),
        to: Number(t.dataset.to)
      }), this._selectedShelf = Number(t.dataset.to);
    else if (e === "save-shelf")
      await this._command({
        action: "setShelfConfig",
        shelf: this._selectedShelf,
        total_leds: Number(
          this.shadowRoot.querySelector("#shelf-leds").value
        ),
        total_locations: Number(
          this.shadowRoot.querySelector("#shelf-locations").value
        )
      });
    else if (e === "auto-map")
      await this._command({
        action: "autoMapShelf",
        shelf: this._selectedShelf
      });
    else if (e === "clear-map")
      confirm("Clear every location mapping on this shelf?") && await this._command({
        action: "clearShelfMapping",
        shelf: this._selectedShelf
      });
    else if (e === "toggle-direction") {
      const i = this._layout.shelves?.[this._selectedShelf - 1];
      await this._command({
        action: "setShelfDirection",
        shelf: this._selectedShelf,
        mirrored: !i?.mirrored
      });
    } else if (e === "zoom-in")
      this._ledZoom = Math.min(2, this._ledZoom + 0.25), this._render();
    else if (e === "zoom-out")
      this._ledZoom = Math.max(0.5, this._ledZoom - 0.25), this._render();
    else if (e === "select-led") {
      const i = Number(t.dataset.led);
      if (this._mappingStart === null || this._mappingEnd !== null)
        this._mappingStart = i, this._mappingEnd = null;
      else {
        this._mappingEnd = i;
        const a = Math.min(this._mappingStart, this._mappingEnd);
        await this._command({
          action: "previewLocation",
          shelf: this._selectedShelf,
          location: this._selectedLocation,
          start_led: a,
          leds: Math.abs(this._mappingEnd - this._mappingStart) + 1
        });
      }
      this._render();
    } else if (e === "reset-led-range")
      this._mappingStart = null, this._mappingEnd = null, await this._command({
        action: "highlightLocation",
        shelf: this._selectedShelf,
        location: this._selectedLocation
      }), this._render();
    else if (e === "save-led-range") {
      const i = Math.min(this._mappingStart, this._mappingEnd);
      await this._command({
        action: "setLocationConfig",
        shelf: this._selectedShelf,
        location: this._selectedLocation,
        start_led: i,
        leds: Math.abs(this._mappingEnd - this._mappingStart) + 1
      }), this._mappingStart = null, this._mappingEnd = null;
    } else if (e === "save-location")
      await this._command({
        action: "setLocationConfig",
        shelf: this._selectedShelf,
        location: this._selectedLocation,
        start_led: Number(
          this.shadowRoot.querySelector("#location-start").value
        ),
        leds: Number(
          this.shadowRoot.querySelector("#location-leds").value
        )
      });
    else if (e === "edit-mini")
      this._editingMiniId = t.dataset.id, this._render();
    else if (e === "cancel-mini")
      this._editingMiniId = null, this._render();
    else if (e === "save-mini")
      await this._saveMini();
    else if (e === "delete-mini") {
      const i = this._miniatures.find(
        (a) => a.id === t.dataset.id
      );
      confirm(`Delete ${i?.name || "this miniature"}?`) && await this._command({
        action: "deleteMiniature",
        id: t.dataset.id
      });
    } else if (e === "highlight-one") {
      const i = this._miniatures.find(
        (a) => a.id === t.dataset.id
      );
      i?.shelf && await this._command({
        action: "highlightLocation",
        shelf: i.shelf,
        location: i.location
      });
    } else e === "clear-view-highlight" ? (clearTimeout(this._viewTimer), await this._command({ action: "clearHighlight" })) : e === "apply-scene" && (clearTimeout(this._viewTimer), await this._command({
      action: "applyScene",
      scene: t.dataset.scene
    }));
  }
  _setViewIndex(t) {
    const e = this._assignedMiniatures;
    e.length && (this._viewIndex = (t % e.length + e.length) % e.length, this.requestUpdate(), this._scheduleViewHighlight());
  }
  _ledMappingContent(t, e) {
    const i = t.total_leds, a = Math.ceil(i / 2), o = t.mirrored ? [
      [...Array(a).keys()].reverse(),
      [...Array(i - a).keys()].map(
        (r) => a + r
      )
    ] : [
      [...Array(a).keys()],
      [...Array(i - a).keys()].map(
        (r) => i - 1 - r
      )
    ], n = this._mappingStart ?? (e?.mapped ? e.start_led : null), d = this._mappingEnd ?? (e?.mapped ? e.start_led + e.leds - 1 : null), c = (r) => r.map((p) => {
      const g = n !== null && d !== null && p >= Math.min(n, d) && p <= Math.max(n, d);
      return `<button class="led-cell ${this._showAllMappings && (t.locations || []).some(
        (L) => L.mapped && p >= L.start_led && p < L.start_led + L.leds
      ) ? "assigned" : ""} ${g ? "selected" : ""}${p === n ? " range-start" : p === d ? " range-end" : ""}" data-action="select-led" data-led="${p}" title="LED ${p + 1}"><i></i>${p % 5 === 0 ? `<small>${p + 1}</small>` : ""}</button>`;
    }).join(""), l = n === null || d === null ? "Tap the start LED" : `LED ${Math.min(n, d) + 1} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ ${Math.max(n, d) + 1} ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· ${Math.abs(d - n) + 1} LEDs`, h = this._mappingDialTicks(t.total_locations);
    return `<section class="mapping-visual">
      <div class="section-heading"><div><div class="eyebrow">LOCATIONS</div><h3>LED mapping</h3></div><label class="mapping-toggle"><input id="show-all-mappings" type="checkbox" ${this._showAllMappings ? "checked" : ""}><span class="mapping-toggle-icon"><svg viewBox="0 0 24 24"><path d="M9 18h6m-5 3h4m-6.5-6.5a6 6 0 1 1 9 0c-.9.8-1.5 1.8-1.5 3.5h-6c0-1.7-.6-2.7-1.5-3.5Z"/></svg></span><span>Show all assigned</span></label></div>
      <div id="mapping-location-dial" class="picker-dial compact">${h}</div>
      <div class="mapping-tools"><button data-action="toggle-direction">${t.mirrored ? "Start at right" : "Start at left"}</button><button class="icon-button" data-action="zoom-out">ÃƒÆ’Ã‚Â¢Ãƒâ€¹Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢</button><button class="icon-button" data-action="zoom-in">ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¼ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹</button><b>${l}</b></div>
      <p>Selected location: <b id="mapping-selected-label">${this._selectedLocation}</b>. Tap first and last LED to preview; save commits the range. Overlaps are allowed.</p>
      <div class="led-runs ${t.mirrored ? "mirrored" : ""}" style="--led-size:${this._ledZoom * 9}px"><div class="led-run"><div class="power-mark" aria-label="Strip power">ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â¡</div>${c(o[0])}</div><span class="strip-connector" aria-hidden="true"></span><div class="led-run return">${c(o[1])}</div></div>
      <div class="button-row end"><button data-action="reset-led-range">Go back</button><button class="primary" data-action="save-led-range" ${n === null || d === null ? "disabled" : ""}>Save location</button></div>
    </section>`;
  }
  _mappingDialTicks(t) {
    return [-3, -2, -1, 0, 1, 2, 3].map((e) => {
      const i = (this._selectedLocation - 1 + e + t) % t + 1;
      return `<span class="dial-tick ${e === 0 ? "active" : ""}">${e === 0 ? "<em>LOCATION</em>" : ""}<i></i><b>${i}</b></span>`;
    }).join("");
  }
  _bindViewDial() {
    const t = this.shadowRoot.querySelector("#view-dial");
    if (!t) return;
    let e = 0, i = 0, a = 0, o = !1;
    const n = 36;
    t.onpointerdown = (c) => {
      o = !0, e = c.clientX, i = this._viewIndex, a = 0, t.setPointerCapture?.(c.pointerId), t.classList.add("dragging");
    }, t.onpointermove = (c) => {
      if (!o) return;
      const l = Math.trunc((e - c.clientX) / n);
      l !== a && (a = l, this._setViewIndex(i + l));
    };
    const d = () => {
      o = !1, t.classList.remove("dragging");
    };
    t.onpointerup = d, t.onpointercancel = d;
  }
  _bindMappingLocationDial() {
    const t = this.shadowRoot.querySelector("#mapping-location-dial"), e = this._layout.shelves?.[this._selectedShelf - 1];
    if (!t || !e) return;
    let i = 0, a = 0, o = 0, n = !1, d = !1;
    t.onpointerdown = (l) => {
      n = !0, d = !1, i = l.clientX, a = this._selectedLocation - 1, o = 0, t.setPointerCapture?.(l.pointerId), t.classList.add("dragging");
    }, t.onpointermove = (l) => {
      if (!n) return;
      const h = Math.trunc((i - l.clientX) / 36);
      if (h === o) return;
      o = h, this._selectedLocation = ((a + h) % e.total_locations + e.total_locations) % e.total_locations + 1, this._mappingStart = null, this._mappingEnd = null, t.innerHTML = this._mappingDialTicks(e.total_locations);
      const r = this.shadowRoot.querySelector(
        "#mapping-selected-label"
      );
      r && (r.textContent = this._selectedLocation), this._refreshMappingLeds(e), this._scheduleMappingHighlight(), d = !0;
    };
    const c = () => {
      n = !1, t.classList.remove("dragging"), d && this._render();
    };
    t.onpointerup = c, t.onpointercancel = c;
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
  _refreshMappingLeds(t) {
    const e = this.shadowRoot.querySelector(".led-runs"), i = t.locations?.[this._selectedLocation - 1];
    if (!e || !i) return;
    const a = document.createElement("div");
    a.innerHTML = this._ledMappingContent(t, i);
    const o = a.querySelector(".led-runs");
    o && (e.className = o.className, e.style.cssText = o.style.cssText, e.innerHTML = o.innerHTML);
  }
  _scheduleViewHighlight() {
    const t = this._viewItem(this._viewIndex);
    t && (clearTimeout(this._viewTimer), this._viewTimer = setTimeout(
      () => this._command({
        action: "highlightLocation",
        shelf: Number(t.shelf),
        location: Number(t.location)
      }),
      220
    ));
  }
  _previewLocation() {
    clearTimeout(this._previewTimer);
    const t = Number(
      this.shadowRoot.querySelector("#location-start")?.value
    ), e = Number(
      this.shadowRoot.querySelector("#location-leds")?.value
    ), i = this.shadowRoot.querySelector("#range-preview-text");
    i && (i.textContent = Number.isFinite(t) && e > 0 ? `${t} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ ${t + e - 1}` : "Invalid range"), !(!Number.isFinite(t) || t < 0 || !Number.isFinite(e) || e <= 0) && (this._previewTimer = setTimeout(
      () => this._command({
        action: "previewLocation",
        shelf: this._selectedShelf,
        location: this._selectedLocation,
        start_led: t,
        leds: e
      }),
      180
    ));
  }
  async _saveMini() {
    const t = this.shadowRoot.querySelector("#mini-name").value.trim(), e = this.shadowRoot.querySelector("#mini-collection").value.trim(), i = this.shadowRoot.querySelector("#mini-artist").value.trim();
    if (!t) return;
    const a = this._miniatures.find(
      (o) => o.id === this._editingMiniId
    );
    a ? (await this._command({
      action: "updateMiniature",
      id: a.id,
      name: t,
      collection: e,
      artist: i,
      date: a.date || "",
      shelf: a.shelf || 0,
      location: a.location || 0,
      notes: a.notes || ""
    }), this._editingMiniId = null) : await this._command({
      action: "createMiniature",
      name: t,
      collection: e,
      artist: i,
      date: "",
      shelf: 0,
      location: 0,
      notes: ""
    }), this._render();
  }
  _scheduleSearch() {
    clearTimeout(this._searchTimer), this._searchTimer = setTimeout(() => this._updateSearch(!0), 220);
  }
  async _updateSearch(t) {
    const e = this.shadowRoot.querySelector("#search-query"), i = this.shadowRoot.querySelector("#search-field"), a = this.shadowRoot.querySelector("#search-results"), o = this.shadowRoot.querySelector("#search-summary");
    if (!e || !a) return;
    const n = e.value.trim().toLocaleLowerCase(), d = i?.value || "all";
    if (!n) {
      a.innerHTML = "", o.textContent = "Start typing to search.", t && await this._command({ action: "clearHighlight" });
      return;
    }
    const c = d === "all" ? ["name", "collection", "artist"] : [d], l = this._miniatures.filter(
      (r) => c.some(
        (p) => String(r[p] || "").toLocaleLowerCase().includes(n)
      )
    ), h = l.filter(
      (r) => r.shelf > 0 && r.location > 0
    );
    o.textContent = `${l.length} result${l.length === 1 ? "" : "s"} ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· ${h.length} assigned`, a.innerHTML = l.map(
      (r) => `
      <button class="search-result" data-action="highlight-one" data-id="${this._escape(r.id)}" ${r.shelf ? "" : "disabled"}>
        <div class="mini-avatar">${this._escape(r.name?.[0] || "?")}</div>
        <div class="search-result-main"><b>${this._escape(r.name)}</b><span>${this._escape(r.collection || "No collection")} ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· ${this._escape(r.artist || "Unknown artist")}</span></div>
        <span class="position-badge ${r.shelf ? "" : "unassigned"}">${r.shelf ? `Shelf ${r.shelf} ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· Location ${r.location}` : "Unassigned"}</span>
      </button>`
    ).join("") || '<div class="empty-state"><b>No matches</b><span>Try another term or field.</span></div>', this.shadowRoot.querySelectorAll("[data-action='highlight-one']").forEach((r) => r.onclick = () => this._action(r)), t && (h.length ? await this._command({
      action: "highlightLocations",
      locations: h.map((r) => ({
        shelf: r.shelf,
        location: r.location
      }))
    }) : await this._command({ action: "clearHighlight" }));
  }
  _styles() {
    return P;
  }
}
customElements.define("ha-panel-smart-cabinet", Ut);
