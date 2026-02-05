const It = {
  PaymentInitiated: "initiated",
  PaymentPending: "pending",
  PaymentSucceeded: "succeeded",
  PaymentFailed: "failed",
  PaymentCancelled: "cancelled",
  PaymentExpired: "expired"
}, kt = /* @__PURE__ */ new Set([
  "succeeded",
  "failed",
  "cancelled",
  "expired"
]);
function Dt(c) {
  return It[c] ?? null;
}
function Rt(c) {
  return kt.has(c);
}
function pt(c, A, z) {
  return { code: c, message: A, retryable: z };
}
function bt(c, A) {
  switch (c) {
    case 401:
      return pt("AUTH_ERROR", A ?? "Invalid client secret.", !1);
    case 404:
      return pt("NOT_FOUND", A ?? "Payment intent not found.", !1);
    case 429:
      return pt("RATE_LIMITED", A ?? "Rate limited. Retrying.", !0);
    default:
      return pt("UNKNOWN", A ?? `Unexpected status: ${c}`, !0);
  }
}
function St(c) {
  return pt("NETWORK_ERROR", c, !0);
}
const At = 3e3, Bt = 1.5, Pt = 3e4, Mt = 5, zt = 3e4;
class Nt {
  constructor(A) {
    this.interval = At, this.timer = null, this.destroyed = !1, this.consecutiveFailures = 0, this.currentStatus = "initiated", this.expiresAt = null, this.config = A, A.pollingInterval && (this.interval = A.pollingInterval);
  }
  start() {
    this.poll();
  }
  stop() {
    this.destroyed = !0, this.timer !== null && (clearTimeout(this.timer), this.timer = null);
  }
  getStatus() {
    return this.currentStatus;
  }
  async poll() {
    var A, z;
    if (!this.destroyed) {
      if ((z = (A = this.config).onPoll) == null || z.call(A), this.isExpired()) {
        this.emitStatus("expired");
        return;
      }
      try {
        const R = await this.fetchStatus();
        if (R.ok) {
          this.consecutiveFailures = 0, this.interval = At;
          const k = await R.json();
          this.expiresAt = new Date(k.expiresAt);
          const Q = Dt(k.status);
          if (Q && Q !== this.currentStatus && (this.emitStatus(Q), Rt(Q)))
            return;
        } else if (R.status === 429) {
          const k = R.headers.get("Retry-After");
          if (k) {
            const Q = parseInt(k, 10);
            isNaN(Q) || (this.interval = Q * 1e3);
          } else
            this.applyBackoff();
          this.config.onError(bt(429));
        } else if (R.status === 401 || R.status === 404) {
          this.config.onError(bt(R.status));
          return;
        } else if (this.consecutiveFailures++, this.applyBackoff(), this.config.onError(bt(R.status)), this.consecutiveFailures >= Mt) {
          this.config.onError(
            bt(R.status, "Max consecutive failures reached. Stopping.")
          );
          return;
        }
      } catch {
        if (this.consecutiveFailures++, this.applyBackoff(), this.config.onError(St("Network request failed.")), this.consecutiveFailures >= Mt) {
          this.config.onError(
            St("Max consecutive failures reached. Stopping.")
          );
          return;
        }
      }
      this.scheduleNext();
    }
  }
  async fetchStatus() {
    const A = this.config.queryString || "", z = `${this.config.apiBaseUrl}/payment-accounts/${this.config.paymentAccountId}/payment-intents/${this.config.paymentIntentId}/status${A}`;
    return fetch(z, {
      method: "GET",
      headers: {
        "client-secret": this.config.clientSecret
      }
    });
  }
  emitStatus(A) {
    this.currentStatus = A, this.config.onStatusChange(A);
  }
  applyBackoff() {
    this.interval = Math.min(this.interval * Bt, Pt);
  }
  isExpired() {
    return this.expiresAt ? Date.now() > this.expiresAt.getTime() + zt : !1;
  }
  scheduleNext() {
    this.destroyed || (this.timer = setTimeout(() => this.poll(), this.interval));
  }
}
function Tt(c) {
  return c && c.__esModule && Object.prototype.hasOwnProperty.call(c, "default") ? c.default : c;
}
var xt = { exports: {} }, qt = xt.exports, Ot;
function Lt() {
  return Ot || (Ot = 1, (function(c, A) {
    (function(z, R) {
      c.exports = R();
    })(qt, (() => (() => {
      var z = { 873: (S, x) => {
        var D, F, N = (function() {
          var U = function(p, l) {
            var d = p, e = st[l], t = null, n = 0, r = null, i = [], a = {}, w = function(o, h) {
              t = (function(s) {
                for (var u = new Array(s), g = 0; g < s; g += 1) {
                  u[g] = new Array(s);
                  for (var b = 0; b < s; b += 1) u[g][b] = null;
                }
                return u;
              })(n = 4 * d + 17), f(0, 0), f(n - 7, 0), f(0, n - 7), m(), _(), v(o, h), d >= 7 && y(o), r == null && (r = B(d, e, i)), C(r, h);
            }, f = function(o, h) {
              for (var s = -1; s <= 7; s += 1) if (!(o + s <= -1 || n <= o + s)) for (var u = -1; u <= 7; u += 1) h + u <= -1 || n <= h + u || (t[o + s][h + u] = 0 <= s && s <= 6 && (u == 0 || u == 6) || 0 <= u && u <= 6 && (s == 0 || s == 6) || 2 <= s && s <= 4 && 2 <= u && u <= 4);
            }, _ = function() {
              for (var o = 8; o < n - 8; o += 1) t[o][6] == null && (t[o][6] = o % 2 == 0);
              for (var h = 8; h < n - 8; h += 1) t[6][h] == null && (t[6][h] = h % 2 == 0);
            }, m = function() {
              for (var o = Y.getPatternPosition(d), h = 0; h < o.length; h += 1) for (var s = 0; s < o.length; s += 1) {
                var u = o[h], g = o[s];
                if (t[u][g] == null) for (var b = -2; b <= 2; b += 1) for (var $ = -2; $ <= 2; $ += 1) t[u + b][g + $] = b == -2 || b == 2 || $ == -2 || $ == 2 || b == 0 && $ == 0;
              }
            }, y = function(o) {
              for (var h = Y.getBCHTypeNumber(d), s = 0; s < 18; s += 1) {
                var u = !o && (h >> s & 1) == 1;
                t[Math.floor(s / 3)][s % 3 + n - 8 - 3] = u;
              }
              for (s = 0; s < 18; s += 1) u = !o && (h >> s & 1) == 1, t[s % 3 + n - 8 - 3][Math.floor(s / 3)] = u;
            }, v = function(o, h) {
              for (var s = e << 3 | h, u = Y.getBCHTypeInfo(s), g = 0; g < 15; g += 1) {
                var b = !o && (u >> g & 1) == 1;
                g < 6 ? t[g][8] = b : g < 8 ? t[g + 1][8] = b : t[n - 15 + g][8] = b;
              }
              for (g = 0; g < 15; g += 1) b = !o && (u >> g & 1) == 1, g < 8 ? t[8][n - g - 1] = b : g < 9 ? t[8][15 - g - 1 + 1] = b : t[8][15 - g - 1] = b;
              t[n - 8][8] = !o;
            }, C = function(o, h) {
              for (var s = -1, u = n - 1, g = 7, b = 0, $ = Y.getMaskFunction(h), I = n - 1; I > 0; I -= 2) for (I == 6 && (I -= 1); ; ) {
                for (var q = 0; q < 2; q += 1) if (t[u][I - q] == null) {
                  var L = !1;
                  b < o.length && (L = (o[b] >>> g & 1) == 1), $(u, I - q) && (L = !L), t[u][I - q] = L, (g -= 1) == -1 && (b += 1, g = 7);
                }
                if ((u += s) < 0 || n <= u) {
                  u -= s, s = -s;
                  break;
                }
              }
            }, B = function(o, h, s) {
              for (var u = ft.getRSBlocks(o, h), g = ut(), b = 0; b < s.length; b += 1) {
                var $ = s[b];
                g.put($.getMode(), 4), g.put($.getLength(), Y.getLengthInBits($.getMode(), o)), $.write(g);
              }
              var I = 0;
              for (b = 0; b < u.length; b += 1) I += u[b].dataCount;
              if (g.getLengthInBits() > 8 * I) throw "code length overflow. (" + g.getLengthInBits() + ">" + 8 * I + ")";
              for (g.getLengthInBits() + 4 <= 8 * I && g.put(0, 4); g.getLengthInBits() % 8 != 0; ) g.putBit(!1);
              for (; !(g.getLengthInBits() >= 8 * I || (g.put(236, 8), g.getLengthInBits() >= 8 * I)); ) g.put(17, 8);
              return (function(q, L) {
                for (var H = 0, tt = 0, X = 0, W = new Array(L.length), j = new Array(L.length), M = 0; M < L.length; M += 1) {
                  var K = L[M].dataCount, J = L[M].totalCount - K;
                  tt = Math.max(tt, K), X = Math.max(X, J), W[M] = new Array(K);
                  for (var E = 0; E < W[M].length; E += 1) W[M][E] = 255 & q.getBuffer()[E + H];
                  H += K;
                  var ot = Y.getErrorCorrectPolynomial(J), rt = dt(W[M], ot.getLength() - 1).mod(ot);
                  for (j[M] = new Array(ot.getLength() - 1), E = 0; E < j[M].length; E += 1) {
                    var et = E + rt.getLength() - j[M].length;
                    j[M][E] = et >= 0 ? rt.getAt(et) : 0;
                  }
                }
                var yt = 0;
                for (E = 0; E < L.length; E += 1) yt += L[E].totalCount;
                var gt = new Array(yt), at = 0;
                for (E = 0; E < tt; E += 1) for (M = 0; M < L.length; M += 1) E < W[M].length && (gt[at] = W[M][E], at += 1);
                for (E = 0; E < X; E += 1) for (M = 0; M < L.length; M += 1) E < j[M].length && (gt[at] = j[M][E], at += 1);
                return gt;
              })(g, u);
            };
            a.addData = function(o, h) {
              var s = null;
              switch (h = h || "Byte") {
                case "Numeric":
                  s = wt(o);
                  break;
                case "Alphanumeric":
                  s = mt(o);
                  break;
                case "Byte":
                  s = ct(o);
                  break;
                case "Kanji":
                  s = vt(o);
                  break;
                default:
                  throw "mode:" + h;
              }
              i.push(s), r = null;
            }, a.isDark = function(o, h) {
              if (o < 0 || n <= o || h < 0 || n <= h) throw o + "," + h;
              return t[o][h];
            }, a.getModuleCount = function() {
              return n;
            }, a.make = function() {
              if (d < 1) {
                for (var o = 1; o < 40; o++) {
                  for (var h = ft.getRSBlocks(o, e), s = ut(), u = 0; u < i.length; u++) {
                    var g = i[u];
                    s.put(g.getMode(), 4), s.put(g.getLength(), Y.getLengthInBits(g.getMode(), o)), g.write(s);
                  }
                  var b = 0;
                  for (u = 0; u < h.length; u++) b += h[u].dataCount;
                  if (s.getLengthInBits() <= 8 * b) break;
                }
                d = o;
              }
              w(!1, (function() {
                for (var $ = 0, I = 0, q = 0; q < 8; q += 1) {
                  w(!0, q);
                  var L = Y.getLostPoint(a);
                  (q == 0 || $ > L) && ($ = L, I = q);
                }
                return I;
              })());
            }, a.createTableTag = function(o, h) {
              o = o || 2;
              var s = "";
              s += '<table style="', s += " border-width: 0px; border-style: none;", s += " border-collapse: collapse;", s += " padding: 0px; margin: " + (h = h === void 0 ? 4 * o : h) + "px;", s += '">', s += "<tbody>";
              for (var u = 0; u < a.getModuleCount(); u += 1) {
                s += "<tr>";
                for (var g = 0; g < a.getModuleCount(); g += 1) s += '<td style="', s += " border-width: 0px; border-style: none;", s += " border-collapse: collapse;", s += " padding: 0px; margin: 0px;", s += " width: " + o + "px;", s += " height: " + o + "px;", s += " background-color: ", s += a.isDark(u, g) ? "#000000" : "#ffffff", s += ";", s += '"/>';
                s += "</tr>";
              }
              return (s += "</tbody>") + "</table>";
            }, a.createSvgTag = function(o, h, s, u) {
              var g = {};
              typeof arguments[0] == "object" && (o = (g = arguments[0]).cellSize, h = g.margin, s = g.alt, u = g.title), o = o || 2, h = h === void 0 ? 4 * o : h, (s = typeof s == "string" ? { text: s } : s || {}).text = s.text || null, s.id = s.text ? s.id || "qrcode-description" : null, (u = typeof u == "string" ? { text: u } : u || {}).text = u.text || null, u.id = u.text ? u.id || "qrcode-title" : null;
              var b, $, I, q, L = a.getModuleCount() * o + 2 * h, H = "";
              for (q = "l" + o + ",0 0," + o + " -" + o + ",0 0,-" + o + "z ", H += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"', H += g.scalable ? "" : ' width="' + L + 'px" height="' + L + 'px"', H += ' viewBox="0 0 ' + L + " " + L + '" ', H += ' preserveAspectRatio="xMinYMin meet"', H += u.text || s.text ? ' role="img" aria-labelledby="' + O([u.id, s.id].join(" ").trim()) + '"' : "", H += ">", H += u.text ? '<title id="' + O(u.id) + '">' + O(u.text) + "</title>" : "", H += s.text ? '<description id="' + O(s.id) + '">' + O(s.text) + "</description>" : "", H += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>', H += '<path d="', $ = 0; $ < a.getModuleCount(); $ += 1) for (I = $ * o + h, b = 0; b < a.getModuleCount(); b += 1) a.isDark($, b) && (H += "M" + (b * o + h) + "," + I + q);
              return (H += '" stroke="transparent" fill="black"/>') + "</svg>";
            }, a.createDataURL = function(o, h) {
              o = o || 2, h = h === void 0 ? 4 * o : h;
              var s = a.getModuleCount() * o + 2 * h, u = h, g = s - h;
              return lt(s, s, (function(b, $) {
                if (u <= b && b < g && u <= $ && $ < g) {
                  var I = Math.floor((b - u) / o), q = Math.floor(($ - u) / o);
                  return a.isDark(q, I) ? 0 : 1;
                }
                return 1;
              }));
            }, a.createImgTag = function(o, h, s) {
              o = o || 2, h = h === void 0 ? 4 * o : h;
              var u = a.getModuleCount() * o + 2 * h, g = "";
              return g += "<img", g += ' src="', g += a.createDataURL(o, h), g += '"', g += ' width="', g += u, g += '"', g += ' height="', g += u, g += '"', s && (g += ' alt="', g += O(s), g += '"'), g + "/>";
            };
            var O = function(o) {
              for (var h = "", s = 0; s < o.length; s += 1) {
                var u = o.charAt(s);
                switch (u) {
                  case "<":
                    h += "&lt;";
                    break;
                  case ">":
                    h += "&gt;";
                    break;
                  case "&":
                    h += "&amp;";
                    break;
                  case '"':
                    h += "&quot;";
                    break;
                  default:
                    h += u;
                }
              }
              return h;
            };
            return a.createASCII = function(o, h) {
              if ((o = o || 1) < 2) return (function(W) {
                W = W === void 0 ? 2 : W;
                var j, M, K, J, E, ot = 1 * a.getModuleCount() + 2 * W, rt = W, et = ot - W, yt = { "██": "█", "█ ": "▀", " █": "▄", "  ": " " }, gt = { "██": "▀", "█ ": "▀", " █": " ", "  ": " " }, at = "";
                for (j = 0; j < ot; j += 2) {
                  for (K = Math.floor((j - rt) / 1), J = Math.floor((j + 1 - rt) / 1), M = 0; M < ot; M += 1) E = "█", rt <= M && M < et && rt <= j && j < et && a.isDark(K, Math.floor((M - rt) / 1)) && (E = " "), rt <= M && M < et && rt <= j + 1 && j + 1 < et && a.isDark(J, Math.floor((M - rt) / 1)) ? E += " " : E += "█", at += W < 1 && j + 1 >= et ? gt[E] : yt[E];
                  at += `
`;
                }
                return ot % 2 && W > 0 ? at.substring(0, at.length - ot - 1) + Array(ot + 1).join("▀") : at.substring(0, at.length - 1);
              })(h);
              o -= 1, h = h === void 0 ? 2 * o : h;
              var s, u, g, b, $ = a.getModuleCount() * o + 2 * h, I = h, q = $ - h, L = Array(o + 1).join("██"), H = Array(o + 1).join("  "), tt = "", X = "";
              for (s = 0; s < $; s += 1) {
                for (g = Math.floor((s - I) / o), X = "", u = 0; u < $; u += 1) b = 1, I <= u && u < q && I <= s && s < q && a.isDark(g, Math.floor((u - I) / o)) && (b = 0), X += b ? L : H;
                for (g = 0; g < o; g += 1) tt += X + `
`;
              }
              return tt.substring(0, tt.length - 1);
            }, a.renderTo2dContext = function(o, h) {
              h = h || 2;
              for (var s = a.getModuleCount(), u = 0; u < s; u++) for (var g = 0; g < s; g++) o.fillStyle = a.isDark(u, g) ? "black" : "white", o.fillRect(u * h, g * h, h, h);
            }, a;
          };
          U.stringToBytes = (U.stringToBytesFuncs = { default: function(p) {
            for (var l = [], d = 0; d < p.length; d += 1) {
              var e = p.charCodeAt(d);
              l.push(255 & e);
            }
            return l;
          } }).default, U.createStringToBytes = function(p, l) {
            var d = (function() {
              for (var t = Ct(p), n = function() {
                var _ = t.read();
                if (_ == -1) throw "eof";
                return _;
              }, r = 0, i = {}; ; ) {
                var a = t.read();
                if (a == -1) break;
                var w = n(), f = n() << 8 | n();
                i[String.fromCharCode(a << 8 | w)] = f, r += 1;
              }
              if (r != l) throw r + " != " + l;
              return i;
            })(), e = 63;
            return function(t) {
              for (var n = [], r = 0; r < t.length; r += 1) {
                var i = t.charCodeAt(r);
                if (i < 128) n.push(i);
                else {
                  var a = d[t.charAt(r)];
                  typeof a == "number" ? (255 & a) == a ? n.push(a) : (n.push(a >>> 8), n.push(255 & a)) : n.push(e);
                }
              }
              return n;
            };
          };
          var Z, V, T, P, nt, st = { L: 1, M: 0, Q: 3, H: 2 }, Y = (Z = [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]], V = 1335, T = 7973, nt = function(p) {
            for (var l = 0; p != 0; ) l += 1, p >>>= 1;
            return l;
          }, (P = {}).getBCHTypeInfo = function(p) {
            for (var l = p << 10; nt(l) - nt(V) >= 0; ) l ^= V << nt(l) - nt(V);
            return 21522 ^ (p << 10 | l);
          }, P.getBCHTypeNumber = function(p) {
            for (var l = p << 12; nt(l) - nt(T) >= 0; ) l ^= T << nt(l) - nt(T);
            return p << 12 | l;
          }, P.getPatternPosition = function(p) {
            return Z[p - 1];
          }, P.getMaskFunction = function(p) {
            switch (p) {
              case 0:
                return function(l, d) {
                  return (l + d) % 2 == 0;
                };
              case 1:
                return function(l, d) {
                  return l % 2 == 0;
                };
              case 2:
                return function(l, d) {
                  return d % 3 == 0;
                };
              case 3:
                return function(l, d) {
                  return (l + d) % 3 == 0;
                };
              case 4:
                return function(l, d) {
                  return (Math.floor(l / 2) + Math.floor(d / 3)) % 2 == 0;
                };
              case 5:
                return function(l, d) {
                  return l * d % 2 + l * d % 3 == 0;
                };
              case 6:
                return function(l, d) {
                  return (l * d % 2 + l * d % 3) % 2 == 0;
                };
              case 7:
                return function(l, d) {
                  return (l * d % 3 + (l + d) % 2) % 2 == 0;
                };
              default:
                throw "bad maskPattern:" + p;
            }
          }, P.getErrorCorrectPolynomial = function(p) {
            for (var l = dt([1], 0), d = 0; d < p; d += 1) l = l.multiply(dt([1, G.gexp(d)], 0));
            return l;
          }, P.getLengthInBits = function(p, l) {
            if (1 <= l && l < 10) switch (p) {
              case 1:
                return 10;
              case 2:
                return 9;
              case 4:
              case 8:
                return 8;
              default:
                throw "mode:" + p;
            }
            else if (l < 27) switch (p) {
              case 1:
                return 12;
              case 2:
                return 11;
              case 4:
                return 16;
              case 8:
                return 10;
              default:
                throw "mode:" + p;
            }
            else {
              if (!(l < 41)) throw "type:" + l;
              switch (p) {
                case 1:
                  return 14;
                case 2:
                  return 13;
                case 4:
                  return 16;
                case 8:
                  return 12;
                default:
                  throw "mode:" + p;
              }
            }
          }, P.getLostPoint = function(p) {
            for (var l = p.getModuleCount(), d = 0, e = 0; e < l; e += 1) for (var t = 0; t < l; t += 1) {
              for (var n = 0, r = p.isDark(e, t), i = -1; i <= 1; i += 1) if (!(e + i < 0 || l <= e + i)) for (var a = -1; a <= 1; a += 1) t + a < 0 || l <= t + a || i == 0 && a == 0 || r == p.isDark(e + i, t + a) && (n += 1);
              n > 5 && (d += 3 + n - 5);
            }
            for (e = 0; e < l - 1; e += 1) for (t = 0; t < l - 1; t += 1) {
              var w = 0;
              p.isDark(e, t) && (w += 1), p.isDark(e + 1, t) && (w += 1), p.isDark(e, t + 1) && (w += 1), p.isDark(e + 1, t + 1) && (w += 1), w != 0 && w != 4 || (d += 3);
            }
            for (e = 0; e < l; e += 1) for (t = 0; t < l - 6; t += 1) p.isDark(e, t) && !p.isDark(e, t + 1) && p.isDark(e, t + 2) && p.isDark(e, t + 3) && p.isDark(e, t + 4) && !p.isDark(e, t + 5) && p.isDark(e, t + 6) && (d += 40);
            for (t = 0; t < l; t += 1) for (e = 0; e < l - 6; e += 1) p.isDark(e, t) && !p.isDark(e + 1, t) && p.isDark(e + 2, t) && p.isDark(e + 3, t) && p.isDark(e + 4, t) && !p.isDark(e + 5, t) && p.isDark(e + 6, t) && (d += 40);
            var f = 0;
            for (t = 0; t < l; t += 1) for (e = 0; e < l; e += 1) p.isDark(e, t) && (f += 1);
            return d + Math.abs(100 * f / l / l - 50) / 5 * 10;
          }, P), G = (function() {
            for (var p = new Array(256), l = new Array(256), d = 0; d < 8; d += 1) p[d] = 1 << d;
            for (d = 8; d < 256; d += 1) p[d] = p[d - 4] ^ p[d - 5] ^ p[d - 6] ^ p[d - 8];
            for (d = 0; d < 255; d += 1) l[p[d]] = d;
            return { glog: function(e) {
              if (e < 1) throw "glog(" + e + ")";
              return l[e];
            }, gexp: function(e) {
              for (; e < 0; ) e += 255;
              for (; e >= 256; ) e -= 255;
              return p[e];
            } };
          })();
          function dt(p, l) {
            if (p.length === void 0) throw p.length + "/" + l;
            var d = (function() {
              for (var t = 0; t < p.length && p[t] == 0; ) t += 1;
              for (var n = new Array(p.length - t + l), r = 0; r < p.length - t; r += 1) n[r] = p[r + t];
              return n;
            })(), e = { getAt: function(t) {
              return d[t];
            }, getLength: function() {
              return d.length;
            }, multiply: function(t) {
              for (var n = new Array(e.getLength() + t.getLength() - 1), r = 0; r < e.getLength(); r += 1) for (var i = 0; i < t.getLength(); i += 1) n[r + i] ^= G.gexp(G.glog(e.getAt(r)) + G.glog(t.getAt(i)));
              return dt(n, 0);
            }, mod: function(t) {
              if (e.getLength() - t.getLength() < 0) return e;
              for (var n = G.glog(e.getAt(0)) - G.glog(t.getAt(0)), r = new Array(e.getLength()), i = 0; i < e.getLength(); i += 1) r[i] = e.getAt(i);
              for (i = 0; i < t.getLength(); i += 1) r[i] ^= G.gexp(G.glog(t.getAt(i)) + n);
              return dt(r, 0).mod(t);
            } };
            return e;
          }
          var ft = /* @__PURE__ */ (function() {
            var p = [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16], [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13], [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15], [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12], [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13], [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12, 7, 37, 13], [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16], [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15], [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15], [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14], [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16], [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17], [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13], [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16], [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17], [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16], [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17], [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16], [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16], [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16], [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16], [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16], [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16], [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16], [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17], [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16], [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16], [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16], [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16], [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16], [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]], l = function(e, t) {
              var n = {};
              return n.totalCount = e, n.dataCount = t, n;
            }, d = { getRSBlocks: function(e, t) {
              var n = (function(y, v) {
                switch (v) {
                  case st.L:
                    return p[4 * (y - 1) + 0];
                  case st.M:
                    return p[4 * (y - 1) + 1];
                  case st.Q:
                    return p[4 * (y - 1) + 2];
                  case st.H:
                    return p[4 * (y - 1) + 3];
                  default:
                    return;
                }
              })(e, t);
              if (n === void 0) throw "bad rs block @ typeNumber:" + e + "/errorCorrectionLevel:" + t;
              for (var r = n.length / 3, i = [], a = 0; a < r; a += 1) for (var w = n[3 * a + 0], f = n[3 * a + 1], _ = n[3 * a + 2], m = 0; m < w; m += 1) i.push(l(f, _));
              return i;
            } };
            return d;
          })(), ut = function() {
            var p = [], l = 0, d = { getBuffer: function() {
              return p;
            }, getAt: function(e) {
              var t = Math.floor(e / 8);
              return (p[t] >>> 7 - e % 8 & 1) == 1;
            }, put: function(e, t) {
              for (var n = 0; n < t; n += 1) d.putBit((e >>> t - n - 1 & 1) == 1);
            }, getLengthInBits: function() {
              return l;
            }, putBit: function(e) {
              var t = Math.floor(l / 8);
              p.length <= t && p.push(0), e && (p[t] |= 128 >>> l % 8), l += 1;
            } };
            return d;
          }, wt = function(p) {
            var l = p, d = { getMode: function() {
              return 1;
            }, getLength: function(n) {
              return l.length;
            }, write: function(n) {
              for (var r = l, i = 0; i + 2 < r.length; ) n.put(e(r.substring(i, i + 3)), 10), i += 3;
              i < r.length && (r.length - i == 1 ? n.put(e(r.substring(i, i + 1)), 4) : r.length - i == 2 && n.put(e(r.substring(i, i + 2)), 7));
            } }, e = function(n) {
              for (var r = 0, i = 0; i < n.length; i += 1) r = 10 * r + t(n.charAt(i));
              return r;
            }, t = function(n) {
              if ("0" <= n && n <= "9") return n.charCodeAt(0) - 48;
              throw "illegal char :" + n;
            };
            return d;
          }, mt = function(p) {
            var l = p, d = { getMode: function() {
              return 2;
            }, getLength: function(t) {
              return l.length;
            }, write: function(t) {
              for (var n = l, r = 0; r + 1 < n.length; ) t.put(45 * e(n.charAt(r)) + e(n.charAt(r + 1)), 11), r += 2;
              r < n.length && t.put(e(n.charAt(r)), 6);
            } }, e = function(t) {
              if ("0" <= t && t <= "9") return t.charCodeAt(0) - 48;
              if ("A" <= t && t <= "Z") return t.charCodeAt(0) - 65 + 10;
              switch (t) {
                case " ":
                  return 36;
                case "$":
                  return 37;
                case "%":
                  return 38;
                case "*":
                  return 39;
                case "+":
                  return 40;
                case "-":
                  return 41;
                case ".":
                  return 42;
                case "/":
                  return 43;
                case ":":
                  return 44;
                default:
                  throw "illegal char :" + t;
              }
            };
            return d;
          }, ct = function(p) {
            var l = U.stringToBytes(p);
            return { getMode: function() {
              return 4;
            }, getLength: function(d) {
              return l.length;
            }, write: function(d) {
              for (var e = 0; e < l.length; e += 1) d.put(l[e], 8);
            } };
          }, vt = function(p) {
            var l = U.stringToBytesFuncs.SJIS;
            if (!l) throw "sjis not supported.";
            (function() {
              var t = l("友");
              if (t.length != 2 || (t[0] << 8 | t[1]) != 38726) throw "sjis not supported.";
            })();
            var d = l(p), e = { getMode: function() {
              return 8;
            }, getLength: function(t) {
              return ~~(d.length / 2);
            }, write: function(t) {
              for (var n = d, r = 0; r + 1 < n.length; ) {
                var i = (255 & n[r]) << 8 | 255 & n[r + 1];
                if (33088 <= i && i <= 40956) i -= 33088;
                else {
                  if (!(57408 <= i && i <= 60351)) throw "illegal char at " + (r + 1) + "/" + i;
                  i -= 49472;
                }
                i = 192 * (i >>> 8 & 255) + (255 & i), t.put(i, 13), r += 2;
              }
              if (r < n.length) throw "illegal char at " + (r + 1);
            } };
            return e;
          }, _t = function() {
            var p = [], l = { writeByte: function(d) {
              p.push(255 & d);
            }, writeShort: function(d) {
              l.writeByte(d), l.writeByte(d >>> 8);
            }, writeBytes: function(d, e, t) {
              e = e || 0, t = t || d.length;
              for (var n = 0; n < t; n += 1) l.writeByte(d[n + e]);
            }, writeString: function(d) {
              for (var e = 0; e < d.length; e += 1) l.writeByte(d.charCodeAt(e));
            }, toByteArray: function() {
              return p;
            }, toString: function() {
              var d = "";
              d += "[";
              for (var e = 0; e < p.length; e += 1) e > 0 && (d += ","), d += p[e];
              return d + "]";
            } };
            return l;
          }, Ct = function(p) {
            var l = p, d = 0, e = 0, t = 0, n = { read: function() {
              for (; t < 8; ) {
                if (d >= l.length) {
                  if (t == 0) return -1;
                  throw "unexpected end of file./" + t;
                }
                var i = l.charAt(d);
                if (d += 1, i == "=") return t = 0, -1;
                i.match(/^\s$/) || (e = e << 6 | r(i.charCodeAt(0)), t += 6);
              }
              var a = e >>> t - 8 & 255;
              return t -= 8, a;
            } }, r = function(i) {
              if (65 <= i && i <= 90) return i - 65;
              if (97 <= i && i <= 122) return i - 97 + 26;
              if (48 <= i && i <= 57) return i - 48 + 52;
              if (i == 43) return 62;
              if (i == 47) return 63;
              throw "c:" + i;
            };
            return n;
          }, lt = function(p, l, d) {
            for (var e = (function(f, _) {
              var m = f, y = _, v = new Array(f * _), C = { setPixel: function(o, h, s) {
                v[h * m + o] = s;
              }, write: function(o) {
                o.writeString("GIF87a"), o.writeShort(m), o.writeShort(y), o.writeByte(128), o.writeByte(0), o.writeByte(0), o.writeByte(0), o.writeByte(0), o.writeByte(0), o.writeByte(255), o.writeByte(255), o.writeByte(255), o.writeString(","), o.writeShort(0), o.writeShort(0), o.writeShort(m), o.writeShort(y), o.writeByte(0);
                var h = B(2);
                o.writeByte(2);
                for (var s = 0; h.length - s > 255; ) o.writeByte(255), o.writeBytes(h, s, 255), s += 255;
                o.writeByte(h.length - s), o.writeBytes(h, s, h.length - s), o.writeByte(0), o.writeString(";");
              } }, B = function(o) {
                for (var h = 1 << o, s = 1 + (1 << o), u = o + 1, g = O(), b = 0; b < h; b += 1) g.add(String.fromCharCode(b));
                g.add(String.fromCharCode(h)), g.add(String.fromCharCode(s));
                var $, I, q, L = _t(), H = ($ = L, I = 0, q = 0, { write: function(j, M) {
                  if (j >>> M) throw "length over";
                  for (; I + M >= 8; ) $.writeByte(255 & (j << I | q)), M -= 8 - I, j >>>= 8 - I, q = 0, I = 0;
                  q |= j << I, I += M;
                }, flush: function() {
                  I > 0 && $.writeByte(q);
                } });
                H.write(h, u);
                var tt = 0, X = String.fromCharCode(v[tt]);
                for (tt += 1; tt < v.length; ) {
                  var W = String.fromCharCode(v[tt]);
                  tt += 1, g.contains(X + W) ? X += W : (H.write(g.indexOf(X), u), g.size() < 4095 && (g.size() == 1 << u && (u += 1), g.add(X + W)), X = W);
                }
                return H.write(g.indexOf(X), u), H.write(s, u), H.flush(), L.toByteArray();
              }, O = function() {
                var o = {}, h = 0, s = { add: function(u) {
                  if (s.contains(u)) throw "dup key:" + u;
                  o[u] = h, h += 1;
                }, size: function() {
                  return h;
                }, indexOf: function(u) {
                  return o[u];
                }, contains: function(u) {
                  return o[u] !== void 0;
                } };
                return s;
              };
              return C;
            })(p, l), t = 0; t < l; t += 1) for (var n = 0; n < p; n += 1) e.setPixel(n, t, d(n, t));
            var r = _t();
            e.write(r);
            for (var i = (function() {
              var f = 0, _ = 0, m = 0, y = "", v = {}, C = function(O) {
                y += String.fromCharCode(B(63 & O));
              }, B = function(O) {
                if (!(O < 0)) {
                  if (O < 26) return 65 + O;
                  if (O < 52) return O - 26 + 97;
                  if (O < 62) return O - 52 + 48;
                  if (O == 62) return 43;
                  if (O == 63) return 47;
                }
                throw "n:" + O;
              };
              return v.writeByte = function(O) {
                for (f = f << 8 | 255 & O, _ += 8, m += 1; _ >= 6; ) C(f >>> _ - 6), _ -= 6;
              }, v.flush = function() {
                if (_ > 0 && (C(f << 6 - _), f = 0, _ = 0), m % 3 != 0) for (var O = 3 - m % 3, o = 0; o < O; o += 1) y += "=";
              }, v.toString = function() {
                return y;
              }, v;
            })(), a = r.toByteArray(), w = 0; w < a.length; w += 1) i.writeByte(a[w]);
            return i.flush(), "data:image/gif;base64," + i;
          };
          return U;
        })();
        N.stringToBytesFuncs["UTF-8"] = function(U) {
          return (function(Z) {
            for (var V = [], T = 0; T < Z.length; T++) {
              var P = Z.charCodeAt(T);
              P < 128 ? V.push(P) : P < 2048 ? V.push(192 | P >> 6, 128 | 63 & P) : P < 55296 || P >= 57344 ? V.push(224 | P >> 12, 128 | P >> 6 & 63, 128 | 63 & P) : (T++, P = 65536 + ((1023 & P) << 10 | 1023 & Z.charCodeAt(T)), V.push(240 | P >> 18, 128 | P >> 12 & 63, 128 | P >> 6 & 63, 128 | 63 & P));
            }
            return V;
          })(U);
        }, (F = typeof (D = function() {
          return N;
        }) == "function" ? D.apply(x, []) : D) === void 0 || (S.exports = F);
      } }, R = {};
      function k(S) {
        var x = R[S];
        if (x !== void 0) return x.exports;
        var D = R[S] = { exports: {} };
        return z[S](D, D.exports, k), D.exports;
      }
      k.n = (S) => {
        var x = S && S.__esModule ? () => S.default : () => S;
        return k.d(x, { a: x }), x;
      }, k.d = (S, x) => {
        for (var D in x) k.o(x, D) && !k.o(S, D) && Object.defineProperty(S, D, { enumerable: !0, get: x[D] });
      }, k.o = (S, x) => Object.prototype.hasOwnProperty.call(S, x);
      var Q = {};
      return (() => {
        k.d(Q, { default: () => l });
        const S = (d) => !!d && typeof d == "object" && !Array.isArray(d);
        function x(d, ...e) {
          if (!e.length) return d;
          const t = e.shift();
          return t !== void 0 && S(d) && S(t) ? (d = Object.assign({}, d), Object.keys(t).forEach(((n) => {
            const r = d[n], i = t[n];
            Array.isArray(r) && Array.isArray(i) ? d[n] = i : S(r) && S(i) ? d[n] = x(Object.assign({}, r), i) : d[n] = i;
          })), x(d, ...e)) : d;
        }
        function D(d, e) {
          const t = document.createElement("a");
          t.download = e, t.href = d, document.body.appendChild(t), t.click(), document.body.removeChild(t);
        }
        const F = { L: 0.07, M: 0.15, Q: 0.25, H: 0.3 };
        class N {
          constructor({ svg: e, type: t, window: n }) {
            this._svg = e, this._type = t, this._window = n;
          }
          draw(e, t, n, r) {
            let i;
            switch (this._type) {
              case "dots":
                i = this._drawDot;
                break;
              case "classy":
                i = this._drawClassy;
                break;
              case "classy-rounded":
                i = this._drawClassyRounded;
                break;
              case "rounded":
                i = this._drawRounded;
                break;
              case "extra-rounded":
                i = this._drawExtraRounded;
                break;
              default:
                i = this._drawSquare;
            }
            i.call(this, { x: e, y: t, size: n, getNeighbor: r });
          }
          _rotateFigure({ x: e, y: t, size: n, rotation: r = 0, draw: i }) {
            var a;
            const w = e + n / 2, f = t + n / 2;
            i(), (a = this._element) === null || a === void 0 || a.setAttribute("transform", `rotate(${180 * r / Math.PI},${w},${f})`);
          }
          _basicDot(e) {
            const { size: t, x: n, y: r } = e;
            this._rotateFigure(Object.assign(Object.assign({}, e), { draw: () => {
              this._element = this._window.document.createElementNS("http://www.w3.org/2000/svg", "circle"), this._element.setAttribute("cx", String(n + t / 2)), this._element.setAttribute("cy", String(r + t / 2)), this._element.setAttribute("r", String(t / 2));
            } }));
          }
          _basicSquare(e) {
            const { size: t, x: n, y: r } = e;
            this._rotateFigure(Object.assign(Object.assign({}, e), { draw: () => {
              this._element = this._window.document.createElementNS("http://www.w3.org/2000/svg", "rect"), this._element.setAttribute("x", String(n)), this._element.setAttribute("y", String(r)), this._element.setAttribute("width", String(t)), this._element.setAttribute("height", String(t));
            } }));
          }
          _basicSideRounded(e) {
            const { size: t, x: n, y: r } = e;
            this._rotateFigure(Object.assign(Object.assign({}, e), { draw: () => {
              this._element = this._window.document.createElementNS("http://www.w3.org/2000/svg", "path"), this._element.setAttribute("d", `M ${n} ${r}v ${t}h ` + t / 2 + `a ${t / 2} ${t / 2}, 0, 0, 0, 0 ${-t}`);
            } }));
          }
          _basicCornerRounded(e) {
            const { size: t, x: n, y: r } = e;
            this._rotateFigure(Object.assign(Object.assign({}, e), { draw: () => {
              this._element = this._window.document.createElementNS("http://www.w3.org/2000/svg", "path"), this._element.setAttribute("d", `M ${n} ${r}v ${t}h ${t}v ` + -t / 2 + `a ${t / 2} ${t / 2}, 0, 0, 0, ${-t / 2} ${-t / 2}`);
            } }));
          }
          _basicCornerExtraRounded(e) {
            const { size: t, x: n, y: r } = e;
            this._rotateFigure(Object.assign(Object.assign({}, e), { draw: () => {
              this._element = this._window.document.createElementNS("http://www.w3.org/2000/svg", "path"), this._element.setAttribute("d", `M ${n} ${r}v ${t}h ${t}a ${t} ${t}, 0, 0, 0, ${-t} ${-t}`);
            } }));
          }
          _basicCornersRounded(e) {
            const { size: t, x: n, y: r } = e;
            this._rotateFigure(Object.assign(Object.assign({}, e), { draw: () => {
              this._element = this._window.document.createElementNS("http://www.w3.org/2000/svg", "path"), this._element.setAttribute("d", `M ${n} ${r}v ` + t / 2 + `a ${t / 2} ${t / 2}, 0, 0, 0, ${t / 2} ${t / 2}h ` + t / 2 + "v " + -t / 2 + `a ${t / 2} ${t / 2}, 0, 0, 0, ${-t / 2} ${-t / 2}`);
            } }));
          }
          _drawDot({ x: e, y: t, size: n }) {
            this._basicDot({ x: e, y: t, size: n, rotation: 0 });
          }
          _drawSquare({ x: e, y: t, size: n }) {
            this._basicSquare({ x: e, y: t, size: n, rotation: 0 });
          }
          _drawRounded({ x: e, y: t, size: n, getNeighbor: r }) {
            const i = r ? +r(-1, 0) : 0, a = r ? +r(1, 0) : 0, w = r ? +r(0, -1) : 0, f = r ? +r(0, 1) : 0, _ = i + a + w + f;
            if (_ !== 0) if (_ > 2 || i && a || w && f) this._basicSquare({ x: e, y: t, size: n, rotation: 0 });
            else {
              if (_ === 2) {
                let m = 0;
                return i && w ? m = Math.PI / 2 : w && a ? m = Math.PI : a && f && (m = -Math.PI / 2), void this._basicCornerRounded({ x: e, y: t, size: n, rotation: m });
              }
              if (_ === 1) {
                let m = 0;
                return w ? m = Math.PI / 2 : a ? m = Math.PI : f && (m = -Math.PI / 2), void this._basicSideRounded({ x: e, y: t, size: n, rotation: m });
              }
            }
            else this._basicDot({ x: e, y: t, size: n, rotation: 0 });
          }
          _drawExtraRounded({ x: e, y: t, size: n, getNeighbor: r }) {
            const i = r ? +r(-1, 0) : 0, a = r ? +r(1, 0) : 0, w = r ? +r(0, -1) : 0, f = r ? +r(0, 1) : 0, _ = i + a + w + f;
            if (_ !== 0) if (_ > 2 || i && a || w && f) this._basicSquare({ x: e, y: t, size: n, rotation: 0 });
            else {
              if (_ === 2) {
                let m = 0;
                return i && w ? m = Math.PI / 2 : w && a ? m = Math.PI : a && f && (m = -Math.PI / 2), void this._basicCornerExtraRounded({ x: e, y: t, size: n, rotation: m });
              }
              if (_ === 1) {
                let m = 0;
                return w ? m = Math.PI / 2 : a ? m = Math.PI : f && (m = -Math.PI / 2), void this._basicSideRounded({ x: e, y: t, size: n, rotation: m });
              }
            }
            else this._basicDot({ x: e, y: t, size: n, rotation: 0 });
          }
          _drawClassy({ x: e, y: t, size: n, getNeighbor: r }) {
            const i = r ? +r(-1, 0) : 0, a = r ? +r(1, 0) : 0, w = r ? +r(0, -1) : 0, f = r ? +r(0, 1) : 0;
            i + a + w + f !== 0 ? i || w ? a || f ? this._basicSquare({ x: e, y: t, size: n, rotation: 0 }) : this._basicCornerRounded({ x: e, y: t, size: n, rotation: Math.PI / 2 }) : this._basicCornerRounded({ x: e, y: t, size: n, rotation: -Math.PI / 2 }) : this._basicCornersRounded({ x: e, y: t, size: n, rotation: Math.PI / 2 });
          }
          _drawClassyRounded({ x: e, y: t, size: n, getNeighbor: r }) {
            const i = r ? +r(-1, 0) : 0, a = r ? +r(1, 0) : 0, w = r ? +r(0, -1) : 0, f = r ? +r(0, 1) : 0;
            i + a + w + f !== 0 ? i || w ? a || f ? this._basicSquare({ x: e, y: t, size: n, rotation: 0 }) : this._basicCornerExtraRounded({ x: e, y: t, size: n, rotation: Math.PI / 2 }) : this._basicCornerExtraRounded({ x: e, y: t, size: n, rotation: -Math.PI / 2 }) : this._basicCornersRounded({ x: e, y: t, size: n, rotation: Math.PI / 2 });
          }
        }
        const U = { dot: "dot", square: "square", extraRounded: "extra-rounded" }, Z = Object.values(U);
        class V {
          constructor({ svg: e, type: t, window: n }) {
            this._svg = e, this._type = t, this._window = n;
          }
          draw(e, t, n, r) {
            let i;
            switch (this._type) {
              case U.square:
                i = this._drawSquare;
                break;
              case U.extraRounded:
                i = this._drawExtraRounded;
                break;
              default:
                i = this._drawDot;
            }
            i.call(this, { x: e, y: t, size: n, rotation: r });
          }
          _rotateFigure({ x: e, y: t, size: n, rotation: r = 0, draw: i }) {
            var a;
            const w = e + n / 2, f = t + n / 2;
            i(), (a = this._element) === null || a === void 0 || a.setAttribute("transform", `rotate(${180 * r / Math.PI},${w},${f})`);
          }
          _basicDot(e) {
            const { size: t, x: n, y: r } = e, i = t / 7;
            this._rotateFigure(Object.assign(Object.assign({}, e), { draw: () => {
              this._element = this._window.document.createElementNS("http://www.w3.org/2000/svg", "path"), this._element.setAttribute("clip-rule", "evenodd"), this._element.setAttribute("d", `M ${n + t / 2} ${r}a ${t / 2} ${t / 2} 0 1 0 0.1 0zm 0 ${i}a ${t / 2 - i} ${t / 2 - i} 0 1 1 -0.1 0Z`);
            } }));
          }
          _basicSquare(e) {
            const { size: t, x: n, y: r } = e, i = t / 7;
            this._rotateFigure(Object.assign(Object.assign({}, e), { draw: () => {
              this._element = this._window.document.createElementNS("http://www.w3.org/2000/svg", "path"), this._element.setAttribute("clip-rule", "evenodd"), this._element.setAttribute("d", `M ${n} ${r}v ${t}h ${t}v ` + -t + `zM ${n + i} ${r + i}h ` + (t - 2 * i) + "v " + (t - 2 * i) + "h " + (2 * i - t) + "z");
            } }));
          }
          _basicExtraRounded(e) {
            const { size: t, x: n, y: r } = e, i = t / 7;
            this._rotateFigure(Object.assign(Object.assign({}, e), { draw: () => {
              this._element = this._window.document.createElementNS("http://www.w3.org/2000/svg", "path"), this._element.setAttribute("clip-rule", "evenodd"), this._element.setAttribute("d", `M ${n} ${r + 2.5 * i}v ` + 2 * i + `a ${2.5 * i} ${2.5 * i}, 0, 0, 0, ${2.5 * i} ${2.5 * i}h ` + 2 * i + `a ${2.5 * i} ${2.5 * i}, 0, 0, 0, ${2.5 * i} ${2.5 * -i}v ` + -2 * i + `a ${2.5 * i} ${2.5 * i}, 0, 0, 0, ${2.5 * -i} ${2.5 * -i}h ` + -2 * i + `a ${2.5 * i} ${2.5 * i}, 0, 0, 0, ${2.5 * -i} ${2.5 * i}M ${n + 2.5 * i} ${r + i}h ` + 2 * i + `a ${1.5 * i} ${1.5 * i}, 0, 0, 1, ${1.5 * i} ${1.5 * i}v ` + 2 * i + `a ${1.5 * i} ${1.5 * i}, 0, 0, 1, ${1.5 * -i} ${1.5 * i}h ` + -2 * i + `a ${1.5 * i} ${1.5 * i}, 0, 0, 1, ${1.5 * -i} ${1.5 * -i}v ` + -2 * i + `a ${1.5 * i} ${1.5 * i}, 0, 0, 1, ${1.5 * i} ${1.5 * -i}`);
            } }));
          }
          _drawDot({ x: e, y: t, size: n, rotation: r }) {
            this._basicDot({ x: e, y: t, size: n, rotation: r });
          }
          _drawSquare({ x: e, y: t, size: n, rotation: r }) {
            this._basicSquare({ x: e, y: t, size: n, rotation: r });
          }
          _drawExtraRounded({ x: e, y: t, size: n, rotation: r }) {
            this._basicExtraRounded({ x: e, y: t, size: n, rotation: r });
          }
        }
        const T = { dot: "dot", square: "square" }, P = Object.values(T);
        class nt {
          constructor({ svg: e, type: t, window: n }) {
            this._svg = e, this._type = t, this._window = n;
          }
          draw(e, t, n, r) {
            let i;
            i = this._type === T.square ? this._drawSquare : this._drawDot, i.call(this, { x: e, y: t, size: n, rotation: r });
          }
          _rotateFigure({ x: e, y: t, size: n, rotation: r = 0, draw: i }) {
            var a;
            const w = e + n / 2, f = t + n / 2;
            i(), (a = this._element) === null || a === void 0 || a.setAttribute("transform", `rotate(${180 * r / Math.PI},${w},${f})`);
          }
          _basicDot(e) {
            const { size: t, x: n, y: r } = e;
            this._rotateFigure(Object.assign(Object.assign({}, e), { draw: () => {
              this._element = this._window.document.createElementNS("http://www.w3.org/2000/svg", "circle"), this._element.setAttribute("cx", String(n + t / 2)), this._element.setAttribute("cy", String(r + t / 2)), this._element.setAttribute("r", String(t / 2));
            } }));
          }
          _basicSquare(e) {
            const { size: t, x: n, y: r } = e;
            this._rotateFigure(Object.assign(Object.assign({}, e), { draw: () => {
              this._element = this._window.document.createElementNS("http://www.w3.org/2000/svg", "rect"), this._element.setAttribute("x", String(n)), this._element.setAttribute("y", String(r)), this._element.setAttribute("width", String(t)), this._element.setAttribute("height", String(t));
            } }));
          }
          _drawDot({ x: e, y: t, size: n, rotation: r }) {
            this._basicDot({ x: e, y: t, size: n, rotation: r });
          }
          _drawSquare({ x: e, y: t, size: n, rotation: r }) {
            this._basicSquare({ x: e, y: t, size: n, rotation: r });
          }
        }
        const st = "circle", Y = [[1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1]], G = [[0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 1, 1, 0, 0], [0, 0, 1, 1, 1, 0, 0], [0, 0, 1, 1, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]];
        class dt {
          constructor(e, t) {
            this._roundSize = (n) => this._options.dotsOptions.roundSize ? Math.floor(n) : n, this._window = t, this._element = this._window.document.createElementNS("http://www.w3.org/2000/svg", "svg"), this._element.setAttribute("width", String(e.width)), this._element.setAttribute("height", String(e.height)), this._element.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink"), e.dotsOptions.roundSize || this._element.setAttribute("shape-rendering", "crispEdges"), this._element.setAttribute("viewBox", `0 0 ${e.width} ${e.height}`), this._defs = this._window.document.createElementNS("http://www.w3.org/2000/svg", "defs"), this._element.appendChild(this._defs), this._imageUri = e.image, this._instanceId = dt.instanceCount++, this._options = e;
          }
          get width() {
            return this._options.width;
          }
          get height() {
            return this._options.height;
          }
          getElement() {
            return this._element;
          }
          async drawQR(e) {
            const t = e.getModuleCount(), n = Math.min(this._options.width, this._options.height) - 2 * this._options.margin, r = this._options.shape === st ? n / Math.sqrt(2) : n, i = this._roundSize(r / t);
            let a = { hideXDots: 0, hideYDots: 0, width: 0, height: 0 };
            if (this._qr = e, this._options.image) {
              if (await this.loadImage(), !this._image) return;
              const { imageOptions: w, qrOptions: f } = this._options, _ = w.imageSize * F[f.errorCorrectionLevel], m = Math.floor(_ * t * t);
              a = (function({ originalHeight: y, originalWidth: v, maxHiddenDots: C, maxHiddenAxisDots: B, dotSize: O }) {
                const o = { x: 0, y: 0 }, h = { x: 0, y: 0 };
                if (y <= 0 || v <= 0 || C <= 0 || O <= 0) return { height: 0, width: 0, hideYDots: 0, hideXDots: 0 };
                const s = y / v;
                return o.x = Math.floor(Math.sqrt(C / s)), o.x <= 0 && (o.x = 1), B && B < o.x && (o.x = B), o.x % 2 == 0 && o.x--, h.x = o.x * O, o.y = 1 + 2 * Math.ceil((o.x * s - 1) / 2), h.y = Math.round(h.x * s), (o.y * o.x > C || B && B < o.y) && (B && B < o.y ? (o.y = B, o.y % 2 == 0 && o.x--) : o.y -= 2, h.y = o.y * O, o.x = 1 + 2 * Math.ceil((o.y / s - 1) / 2), h.x = Math.round(h.y / s)), { height: h.y, width: h.x, hideYDots: o.y, hideXDots: o.x };
              })({ originalWidth: this._image.width, originalHeight: this._image.height, maxHiddenDots: m, maxHiddenAxisDots: t - 14, dotSize: i });
            }
            this.drawBackground(), this.drawDots(((w, f) => {
              var _, m, y, v, C, B;
              return !(this._options.imageOptions.hideBackgroundDots && w >= (t - a.hideYDots) / 2 && w < (t + a.hideYDots) / 2 && f >= (t - a.hideXDots) / 2 && f < (t + a.hideXDots) / 2 || !((_ = Y[w]) === null || _ === void 0) && _[f] || !((m = Y[w - t + 7]) === null || m === void 0) && m[f] || !((y = Y[w]) === null || y === void 0) && y[f - t + 7] || !((v = G[w]) === null || v === void 0) && v[f] || !((C = G[w - t + 7]) === null || C === void 0) && C[f] || !((B = G[w]) === null || B === void 0) && B[f - t + 7]);
            })), this.drawCorners(), this._options.image && await this.drawImage({ width: a.width, height: a.height, count: t, dotSize: i });
          }
          drawBackground() {
            var e, t, n;
            const r = this._element, i = this._options;
            if (r) {
              const a = (e = i.backgroundOptions) === null || e === void 0 ? void 0 : e.gradient, w = (t = i.backgroundOptions) === null || t === void 0 ? void 0 : t.color;
              let f = i.height, _ = i.width;
              if (a || w) {
                const m = this._window.document.createElementNS("http://www.w3.org/2000/svg", "rect");
                this._backgroundClipPath = this._window.document.createElementNS("http://www.w3.org/2000/svg", "clipPath"), this._backgroundClipPath.setAttribute("id", `clip-path-background-color-${this._instanceId}`), this._defs.appendChild(this._backgroundClipPath), !((n = i.backgroundOptions) === null || n === void 0) && n.round && (f = _ = Math.min(i.width, i.height), m.setAttribute("rx", String(f / 2 * i.backgroundOptions.round))), m.setAttribute("x", String(this._roundSize((i.width - _) / 2))), m.setAttribute("y", String(this._roundSize((i.height - f) / 2))), m.setAttribute("width", String(_)), m.setAttribute("height", String(f)), this._backgroundClipPath.appendChild(m), this._createColor({ options: a, color: w, additionalRotation: 0, x: 0, y: 0, height: i.height, width: i.width, name: `background-color-${this._instanceId}` });
              }
            }
          }
          drawDots(e) {
            var t, n;
            if (!this._qr) throw "QR code is not defined";
            const r = this._options, i = this._qr.getModuleCount();
            if (i > r.width || i > r.height) throw "The canvas is too small.";
            const a = Math.min(r.width, r.height) - 2 * r.margin, w = r.shape === st ? a / Math.sqrt(2) : a, f = this._roundSize(w / i), _ = this._roundSize((r.width - i * f) / 2), m = this._roundSize((r.height - i * f) / 2), y = new N({ svg: this._element, type: r.dotsOptions.type, window: this._window });
            this._dotsClipPath = this._window.document.createElementNS("http://www.w3.org/2000/svg", "clipPath"), this._dotsClipPath.setAttribute("id", `clip-path-dot-color-${this._instanceId}`), this._defs.appendChild(this._dotsClipPath), this._createColor({ options: (t = r.dotsOptions) === null || t === void 0 ? void 0 : t.gradient, color: r.dotsOptions.color, additionalRotation: 0, x: 0, y: 0, height: r.height, width: r.width, name: `dot-color-${this._instanceId}` });
            for (let v = 0; v < i; v++) for (let C = 0; C < i; C++) e && !e(v, C) || !((n = this._qr) === null || n === void 0) && n.isDark(v, C) && (y.draw(_ + C * f, m + v * f, f, ((B, O) => !(C + B < 0 || v + O < 0 || C + B >= i || v + O >= i) && !(e && !e(v + O, C + B)) && !!this._qr && this._qr.isDark(v + O, C + B))), y._element && this._dotsClipPath && this._dotsClipPath.appendChild(y._element));
            if (r.shape === st) {
              const v = this._roundSize((a / f - i) / 2), C = i + 2 * v, B = _ - v * f, O = m - v * f, o = [], h = this._roundSize(C / 2);
              for (let s = 0; s < C; s++) {
                o[s] = [];
                for (let u = 0; u < C; u++) s >= v - 1 && s <= C - v && u >= v - 1 && u <= C - v || Math.sqrt((s - h) * (s - h) + (u - h) * (u - h)) > h ? o[s][u] = 0 : o[s][u] = this._qr.isDark(u - 2 * v < 0 ? u : u >= i ? u - 2 * v : u - v, s - 2 * v < 0 ? s : s >= i ? s - 2 * v : s - v) ? 1 : 0;
              }
              for (let s = 0; s < C; s++) for (let u = 0; u < C; u++) o[s][u] && (y.draw(B + u * f, O + s * f, f, ((g, b) => {
                var $;
                return !!(!(($ = o[s + b]) === null || $ === void 0) && $[u + g]);
              })), y._element && this._dotsClipPath && this._dotsClipPath.appendChild(y._element));
            }
          }
          drawCorners() {
            if (!this._qr) throw "QR code is not defined";
            const e = this._element, t = this._options;
            if (!e) throw "Element code is not defined";
            const n = this._qr.getModuleCount(), r = Math.min(t.width, t.height) - 2 * t.margin, i = t.shape === st ? r / Math.sqrt(2) : r, a = this._roundSize(i / n), w = 7 * a, f = 3 * a, _ = this._roundSize((t.width - n * a) / 2), m = this._roundSize((t.height - n * a) / 2);
            [[0, 0, 0], [1, 0, Math.PI / 2], [0, 1, -Math.PI / 2]].forEach((([y, v, C]) => {
              var B, O, o, h, s, u, g, b, $, I, q, L, H, tt;
              const X = _ + y * a * (n - 7), W = m + v * a * (n - 7);
              let j = this._dotsClipPath, M = this._dotsClipPath;
              if ((!((B = t.cornersSquareOptions) === null || B === void 0) && B.gradient || !((O = t.cornersSquareOptions) === null || O === void 0) && O.color) && (j = this._window.document.createElementNS("http://www.w3.org/2000/svg", "clipPath"), j.setAttribute("id", `clip-path-corners-square-color-${y}-${v}-${this._instanceId}`), this._defs.appendChild(j), this._cornersSquareClipPath = this._cornersDotClipPath = M = j, this._createColor({ options: (o = t.cornersSquareOptions) === null || o === void 0 ? void 0 : o.gradient, color: (h = t.cornersSquareOptions) === null || h === void 0 ? void 0 : h.color, additionalRotation: C, x: X, y: W, height: w, width: w, name: `corners-square-color-${y}-${v}-${this._instanceId}` })), ((s = t.cornersSquareOptions) === null || s === void 0 ? void 0 : s.type) && Z.includes(t.cornersSquareOptions.type)) {
                const K = new V({ svg: this._element, type: t.cornersSquareOptions.type, window: this._window });
                K.draw(X, W, w, C), K._element && j && j.appendChild(K._element);
              } else {
                const K = new N({ svg: this._element, type: ((u = t.cornersSquareOptions) === null || u === void 0 ? void 0 : u.type) || t.dotsOptions.type, window: this._window });
                for (let J = 0; J < Y.length; J++) for (let E = 0; E < Y[J].length; E++) !((g = Y[J]) === null || g === void 0) && g[E] && (K.draw(X + E * a, W + J * a, a, ((ot, rt) => {
                  var et;
                  return !!(!((et = Y[J + rt]) === null || et === void 0) && et[E + ot]);
                })), K._element && j && j.appendChild(K._element));
              }
              if ((!((b = t.cornersDotOptions) === null || b === void 0) && b.gradient || !(($ = t.cornersDotOptions) === null || $ === void 0) && $.color) && (M = this._window.document.createElementNS("http://www.w3.org/2000/svg", "clipPath"), M.setAttribute("id", `clip-path-corners-dot-color-${y}-${v}-${this._instanceId}`), this._defs.appendChild(M), this._cornersDotClipPath = M, this._createColor({ options: (I = t.cornersDotOptions) === null || I === void 0 ? void 0 : I.gradient, color: (q = t.cornersDotOptions) === null || q === void 0 ? void 0 : q.color, additionalRotation: C, x: X + 2 * a, y: W + 2 * a, height: f, width: f, name: `corners-dot-color-${y}-${v}-${this._instanceId}` })), ((L = t.cornersDotOptions) === null || L === void 0 ? void 0 : L.type) && P.includes(t.cornersDotOptions.type)) {
                const K = new nt({ svg: this._element, type: t.cornersDotOptions.type, window: this._window });
                K.draw(X + 2 * a, W + 2 * a, f, C), K._element && M && M.appendChild(K._element);
              } else {
                const K = new N({ svg: this._element, type: ((H = t.cornersDotOptions) === null || H === void 0 ? void 0 : H.type) || t.dotsOptions.type, window: this._window });
                for (let J = 0; J < G.length; J++) for (let E = 0; E < G[J].length; E++) !((tt = G[J]) === null || tt === void 0) && tt[E] && (K.draw(X + E * a, W + J * a, a, ((ot, rt) => {
                  var et;
                  return !!(!((et = G[J + rt]) === null || et === void 0) && et[E + ot]);
                })), K._element && M && M.appendChild(K._element));
              }
            }));
          }
          loadImage() {
            return new Promise(((e, t) => {
              var n;
              const r = this._options;
              if (!r.image) return t("Image is not defined");
              if (!((n = r.nodeCanvas) === null || n === void 0) && n.loadImage) r.nodeCanvas.loadImage(r.image).then(((i) => {
                var a, w;
                if (this._image = i, this._options.imageOptions.saveAsBlob) {
                  const f = (a = r.nodeCanvas) === null || a === void 0 ? void 0 : a.createCanvas(this._image.width, this._image.height);
                  (w = f == null ? void 0 : f.getContext("2d")) === null || w === void 0 || w.drawImage(i, 0, 0), this._imageUri = f == null ? void 0 : f.toDataURL();
                }
                e();
              })).catch(t);
              else {
                const i = new this._window.Image();
                typeof r.imageOptions.crossOrigin == "string" && (i.crossOrigin = r.imageOptions.crossOrigin), this._image = i, i.onload = async () => {
                  this._options.imageOptions.saveAsBlob && (this._imageUri = await (async function(a, w) {
                    return new Promise(((f) => {
                      const _ = new w.XMLHttpRequest();
                      _.onload = function() {
                        const m = new w.FileReader();
                        m.onloadend = function() {
                          f(m.result);
                        }, m.readAsDataURL(_.response);
                      }, _.open("GET", a), _.responseType = "blob", _.send();
                    }));
                  })(r.image || "", this._window)), e();
                }, i.src = r.image;
              }
            }));
          }
          async drawImage({ width: e, height: t, count: n, dotSize: r }) {
            const i = this._options, a = this._roundSize((i.width - n * r) / 2), w = this._roundSize((i.height - n * r) / 2), f = a + this._roundSize(i.imageOptions.margin + (n * r - e) / 2), _ = w + this._roundSize(i.imageOptions.margin + (n * r - t) / 2), m = e - 2 * i.imageOptions.margin, y = t - 2 * i.imageOptions.margin, v = this._window.document.createElementNS("http://www.w3.org/2000/svg", "image");
            v.setAttribute("href", this._imageUri || ""), v.setAttribute("xlink:href", this._imageUri || ""), v.setAttribute("x", String(f)), v.setAttribute("y", String(_)), v.setAttribute("width", `${m}px`), v.setAttribute("height", `${y}px`), this._element.appendChild(v);
          }
          _createColor({ options: e, color: t, additionalRotation: n, x: r, y: i, height: a, width: w, name: f }) {
            const _ = w > a ? w : a, m = this._window.document.createElementNS("http://www.w3.org/2000/svg", "rect");
            if (m.setAttribute("x", String(r)), m.setAttribute("y", String(i)), m.setAttribute("height", String(a)), m.setAttribute("width", String(w)), m.setAttribute("clip-path", `url('#clip-path-${f}')`), e) {
              let y;
              if (e.type === "radial") y = this._window.document.createElementNS("http://www.w3.org/2000/svg", "radialGradient"), y.setAttribute("id", f), y.setAttribute("gradientUnits", "userSpaceOnUse"), y.setAttribute("fx", String(r + w / 2)), y.setAttribute("fy", String(i + a / 2)), y.setAttribute("cx", String(r + w / 2)), y.setAttribute("cy", String(i + a / 2)), y.setAttribute("r", String(_ / 2));
              else {
                const v = ((e.rotation || 0) + n) % (2 * Math.PI), C = (v + 2 * Math.PI) % (2 * Math.PI);
                let B = r + w / 2, O = i + a / 2, o = r + w / 2, h = i + a / 2;
                C >= 0 && C <= 0.25 * Math.PI || C > 1.75 * Math.PI && C <= 2 * Math.PI ? (B -= w / 2, O -= a / 2 * Math.tan(v), o += w / 2, h += a / 2 * Math.tan(v)) : C > 0.25 * Math.PI && C <= 0.75 * Math.PI ? (O -= a / 2, B -= w / 2 / Math.tan(v), h += a / 2, o += w / 2 / Math.tan(v)) : C > 0.75 * Math.PI && C <= 1.25 * Math.PI ? (B += w / 2, O += a / 2 * Math.tan(v), o -= w / 2, h -= a / 2 * Math.tan(v)) : C > 1.25 * Math.PI && C <= 1.75 * Math.PI && (O += a / 2, B += w / 2 / Math.tan(v), h -= a / 2, o -= w / 2 / Math.tan(v)), y = this._window.document.createElementNS("http://www.w3.org/2000/svg", "linearGradient"), y.setAttribute("id", f), y.setAttribute("gradientUnits", "userSpaceOnUse"), y.setAttribute("x1", String(Math.round(B))), y.setAttribute("y1", String(Math.round(O))), y.setAttribute("x2", String(Math.round(o))), y.setAttribute("y2", String(Math.round(h)));
              }
              e.colorStops.forEach((({ offset: v, color: C }) => {
                const B = this._window.document.createElementNS("http://www.w3.org/2000/svg", "stop");
                B.setAttribute("offset", 100 * v + "%"), B.setAttribute("stop-color", C), y.appendChild(B);
              })), m.setAttribute("fill", `url('#${f}')`), this._defs.appendChild(y);
            } else t && m.setAttribute("fill", t);
            this._element.appendChild(m);
          }
        }
        dt.instanceCount = 0;
        const ft = dt, ut = "canvas", wt = {};
        for (let d = 0; d <= 40; d++) wt[d] = d;
        const mt = { type: ut, shape: "square", width: 300, height: 300, data: "", margin: 0, qrOptions: { typeNumber: wt[0], mode: void 0, errorCorrectionLevel: "Q" }, imageOptions: { saveAsBlob: !0, hideBackgroundDots: !0, imageSize: 0.4, crossOrigin: void 0, margin: 0 }, dotsOptions: { type: "square", color: "#000", roundSize: !0 }, backgroundOptions: { round: 0, color: "#fff" } };
        function ct(d) {
          const e = Object.assign({}, d);
          if (!e.colorStops || !e.colorStops.length) throw "Field 'colorStops' is required in gradient";
          return e.rotation ? e.rotation = Number(e.rotation) : e.rotation = 0, e.colorStops = e.colorStops.map(((t) => Object.assign(Object.assign({}, t), { offset: Number(t.offset) }))), e;
        }
        function vt(d) {
          const e = Object.assign({}, d);
          return e.width = Number(e.width), e.height = Number(e.height), e.margin = Number(e.margin), e.imageOptions = Object.assign(Object.assign({}, e.imageOptions), { hideBackgroundDots: !!e.imageOptions.hideBackgroundDots, imageSize: Number(e.imageOptions.imageSize), margin: Number(e.imageOptions.margin) }), e.margin > Math.min(e.width, e.height) && (e.margin = Math.min(e.width, e.height)), e.dotsOptions = Object.assign({}, e.dotsOptions), e.dotsOptions.gradient && (e.dotsOptions.gradient = ct(e.dotsOptions.gradient)), e.cornersSquareOptions && (e.cornersSquareOptions = Object.assign({}, e.cornersSquareOptions), e.cornersSquareOptions.gradient && (e.cornersSquareOptions.gradient = ct(e.cornersSquareOptions.gradient))), e.cornersDotOptions && (e.cornersDotOptions = Object.assign({}, e.cornersDotOptions), e.cornersDotOptions.gradient && (e.cornersDotOptions.gradient = ct(e.cornersDotOptions.gradient))), e.backgroundOptions && (e.backgroundOptions = Object.assign({}, e.backgroundOptions), e.backgroundOptions.gradient && (e.backgroundOptions.gradient = ct(e.backgroundOptions.gradient))), e;
        }
        var _t = k(873), Ct = k.n(_t);
        function lt(d) {
          if (!d) throw new Error("Extension must be defined");
          d[0] === "." && (d = d.substring(1));
          const e = { bmp: "image/bmp", gif: "image/gif", ico: "image/vnd.microsoft.icon", jpeg: "image/jpeg", jpg: "image/jpeg", png: "image/png", svg: "image/svg+xml", tif: "image/tiff", tiff: "image/tiff", webp: "image/webp", pdf: "application/pdf" }[d.toLowerCase()];
          if (!e) throw new Error(`Extension "${d}" is not supported`);
          return e;
        }
        class p {
          constructor(e) {
            e != null && e.jsdom ? this._window = new e.jsdom("", { resources: "usable" }).window : this._window = window, this._options = e ? vt(x(mt, e)) : mt, this.update();
          }
          static _clearContainer(e) {
            e && (e.innerHTML = "");
          }
          _setupSvg() {
            if (!this._qr) return;
            const e = new ft(this._options, this._window);
            this._svg = e.getElement(), this._svgDrawingPromise = e.drawQR(this._qr).then((() => {
              var t;
              this._svg && ((t = this._extension) === null || t === void 0 || t.call(this, e.getElement(), this._options));
            }));
          }
          _setupCanvas() {
            var e, t;
            this._qr && (!((e = this._options.nodeCanvas) === null || e === void 0) && e.createCanvas ? (this._nodeCanvas = this._options.nodeCanvas.createCanvas(this._options.width, this._options.height), this._nodeCanvas.width = this._options.width, this._nodeCanvas.height = this._options.height) : (this._domCanvas = document.createElement("canvas"), this._domCanvas.width = this._options.width, this._domCanvas.height = this._options.height), this._setupSvg(), this._canvasDrawingPromise = (t = this._svgDrawingPromise) === null || t === void 0 ? void 0 : t.then((() => {
              var n;
              if (!this._svg) return;
              const r = this._svg, i = new this._window.XMLSerializer().serializeToString(r), a = btoa(i), w = `data:${lt("svg")};base64,${a}`;
              if (!((n = this._options.nodeCanvas) === null || n === void 0) && n.loadImage) return this._options.nodeCanvas.loadImage(w).then(((f) => {
                var _, m;
                f.width = this._options.width, f.height = this._options.height, (m = (_ = this._nodeCanvas) === null || _ === void 0 ? void 0 : _.getContext("2d")) === null || m === void 0 || m.drawImage(f, 0, 0);
              }));
              {
                const f = new this._window.Image();
                return new Promise(((_) => {
                  f.onload = () => {
                    var m, y;
                    (y = (m = this._domCanvas) === null || m === void 0 ? void 0 : m.getContext("2d")) === null || y === void 0 || y.drawImage(f, 0, 0), _();
                  }, f.src = w;
                }));
              }
            })));
          }
          async _getElement(e = "png") {
            if (!this._qr) throw "QR code is empty";
            return e.toLowerCase() === "svg" ? (this._svg && this._svgDrawingPromise || this._setupSvg(), await this._svgDrawingPromise, this._svg) : ((this._domCanvas || this._nodeCanvas) && this._canvasDrawingPromise || this._setupCanvas(), await this._canvasDrawingPromise, this._domCanvas || this._nodeCanvas);
          }
          update(e) {
            p._clearContainer(this._container), this._options = e ? vt(x(this._options, e)) : this._options, this._options.data && (this._qr = Ct()(this._options.qrOptions.typeNumber, this._options.qrOptions.errorCorrectionLevel), this._qr.addData(this._options.data, this._options.qrOptions.mode || (function(t) {
              switch (!0) {
                case /^[0-9]*$/.test(t):
                  return "Numeric";
                case /^[0-9A-Z $%*+\-./:]*$/.test(t):
                  return "Alphanumeric";
                default:
                  return "Byte";
              }
            })(this._options.data)), this._qr.make(), this._options.type === ut ? this._setupCanvas() : this._setupSvg(), this.append(this._container));
          }
          append(e) {
            if (e) {
              if (typeof e.appendChild != "function") throw "Container should be a single DOM node";
              this._options.type === ut ? this._domCanvas && e.appendChild(this._domCanvas) : this._svg && e.appendChild(this._svg), this._container = e;
            }
          }
          applyExtension(e) {
            if (!e) throw "Extension function should be defined.";
            this._extension = e, this.update();
          }
          deleteExtension() {
            this._extension = void 0, this.update();
          }
          async getRawData(e = "png") {
            if (!this._qr) throw "QR code is empty";
            const t = await this._getElement(e), n = lt(e);
            if (!t) return null;
            if (e.toLowerCase() === "svg") {
              const r = `<?xml version="1.0" standalone="no"?>\r
${new this._window.XMLSerializer().serializeToString(t)}`;
              return typeof Blob > "u" || this._options.jsdom ? Buffer.from(r) : new Blob([r], { type: n });
            }
            return new Promise(((r) => {
              const i = t;
              if ("toBuffer" in i) if (n === "image/png") r(i.toBuffer(n));
              else if (n === "image/jpeg") r(i.toBuffer(n));
              else {
                if (n !== "application/pdf") throw Error("Unsupported extension");
                r(i.toBuffer(n));
              }
              else "toBlob" in i && i.toBlob(r, n, 1);
            }));
          }
          async download(e) {
            if (!this._qr) throw "QR code is empty";
            if (typeof Blob > "u") throw "Cannot download in Node.js, call getRawData instead.";
            let t = "png", n = "qr";
            typeof e == "string" ? (t = e, console.warn("Extension is deprecated as argument for 'download' method, please pass object { name: '...', extension: '...' } as argument")) : typeof e == "object" && e !== null && (e.name && (n = e.name), e.extension && (t = e.extension));
            const r = await this._getElement(t);
            if (r) if (t.toLowerCase() === "svg") {
              let i = new XMLSerializer().serializeToString(r);
              i = `<?xml version="1.0" standalone="no"?>\r
` + i, D(`data:${lt(t)};charset=utf-8,${encodeURIComponent(i)}`, `${n}.svg`);
            } else D(r.toDataURL(lt(t)), `${n}.${t}`);
          }
        }
        const l = p;
      })(), Q.default;
    })()));
  })(xt)), xt.exports;
}
var jt = Lt();
const Ft = /* @__PURE__ */ Tt(jt), Ut = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4BAMAAABaqCYtAAAAMFBMVEUKfmT+//8Bd1tSpJAginI7l4OgzcNxl0BjrZyQxbl6uas6ilTr9fOz18/R5+KbojH3wCiYAAAACXBIWXMAAAsTAAALEwEAmpwYAAABYklEQVR42mNgGKZACY+UggsTTqmIaWkZOGQjpmWZMHilKjCwBmHIuWWZKCkwKIVNUVJdhC7HNAMoBTLcdmnnBQydE0AyQAUKna2TFdB1TlVQUnBdZQQ0WSkSQzI2JGJazuJpDkA2pwO6sapps0yslJRTgEwtIwwXKSgpdSiAvak6CZtX3SBBoDQFm6TyVQVQSAU/VsAiyQQMAmAgZnVik+QusF0xbVaIkhY2Y+u3K3SFKClgDXrucu4CHFJAye8bCnBGNnt1QTVOye3/8Uiy19fjMXb79g04Jbm/45ZkUir/jlPONTTYBEg7YJNkEwSCJgaWd9g0JoIkLzHoCmKmTAYtkJxgEtNCLJIuNkCpM2eMlAVlMeRUzwDl5FwclHwEj2AEvTLITKAelouCRgxYJQXPvXsjKKmAQxIELjDglpRxwiMprIBHchEDbklZrMFubGxs0dHRYYC9RIAABYZRQAoAAMPFUF7XIspMAAAAAElFTkSuQmCC";
function ht(c, A) {
  Object.entries(A).forEach(([z, R]) => {
    c.style[z] = R;
  });
}
function $t(c) {
  if (c.startsWith("#"))
    return c;
  if (c.startsWith("rgb")) {
    const A = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (A) {
      const z = parseInt(A[1]).toString(16).padStart(2, "0"), R = parseInt(A[2]).toString(16).padStart(2, "0"), k = parseInt(A[3]).toString(16).padStart(2, "0");
      return `#${z}${R}${k}`;
    }
  }
  if (c.startsWith("hsl")) {
    const A = c.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%/);
    if (A) {
      const z = parseInt(A[1]) / 360, R = parseInt(A[2]) / 100, k = parseInt(A[3]) / 100;
      let Q, S, x;
      if (R === 0)
        Q = S = x = k;
      else {
        const F = (Z, V, T) => (T < 0 && (T += 1), T > 1 && (T -= 1), T < 0.16666666666666666 ? Z + (V - Z) * 6 * T : T < 0.5 ? V : T < 0.6666666666666666 ? Z + (V - Z) * (0.6666666666666666 - T) * 6 : Z), N = k < 0.5 ? k * (1 + R) : k + R - k * R, U = 2 * k - N;
        Q = F(U, N, z + 1 / 3), S = F(U, N, z), x = F(U, N, z - 1 / 3);
      }
      const D = (F) => Math.round(F * 255).toString(16).padStart(2, "0");
      return `#${D(Q)}${D(S)}${D(x)}`;
    }
  }
  return c;
}
function Qt(c, A, z) {
  const R = document.createElement("div");
  R.className = "drop-payment-link", ht(R, {
    marginTop: "16px",
    width: `${A}px`
  });
  const k = document.createElement("label");
  k.className = "drop-link-label", k.textContent = z, ht(k, {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "hsl(160, 65%, 25%)",
    marginBottom: "8px",
    fontFamily: "system-ui, -apple-system, sans-serif"
  });
  const Q = document.createElement("div");
  Q.className = "drop-link-input-wrapper", ht(Q, {
    position: "relative"
  });
  const S = document.createElement("input");
  S.type = "text", S.readOnly = !0, S.value = c, S.className = "drop-link-input", S.setAttribute("aria-label", "Payment link");
  const x = document.createElement("p");
  x.className = "drop-link-hint", x.textContent = "Tap to copy", ht(x, {
    fontSize: "12px",
    color: "hsl(160, 30%, 40%)",
    marginTop: "6px",
    marginBottom: "0",
    fontFamily: "system-ui, -apple-system, sans-serif"
  });
  const D = async () => {
    S.select();
    try {
      navigator.clipboard && navigator.clipboard.writeText ? (await navigator.clipboard.writeText(c), F()) : document.execCommand("copy") && F();
    } catch {
      document.execCommand("copy"), F();
    }
  }, F = () => {
    const N = x.textContent;
    x.textContent = "✓ Copied to clipboard!", ht(x, {
      color: "hsl(160, 65%, 35%)",
      fontWeight: "500"
    }), setTimeout(() => {
      x.textContent = N, ht(x, {
        color: "hsl(160, 30%, 40%)",
        fontWeight: "normal"
      });
    }, 2e3);
  };
  return S.addEventListener("click", D), S.addEventListener("keydown", (N) => {
    (N.key === "Enter" || N.key === " ") && (N.preventDefault(), D());
  }), ht(S, {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    fontFamily: "monospace",
    border: "2px solid hsl(160, 65%, 25%)",
    borderRadius: "8px",
    backgroundColor: "hsl(0, 0%, 98%)",
    color: "hsl(160, 65%, 25%)",
    boxSizing: "border-box",
    cursor: "pointer",
    outline: "none"
  }), S.addEventListener("focus", () => {
    ht(S, {
      borderColor: "hsl(160, 65%, 35%)",
      backgroundColor: "hsl(160, 80%, 98%)"
    });
  }), S.addEventListener("blur", () => {
    ht(S, {
      borderColor: "hsl(160, 65%, 25%)",
      backgroundColor: "hsl(0, 0%, 98%)"
    });
  }), Q.appendChild(S), R.appendChild(k), R.appendChild(Q), R.appendChild(x), R;
}
async function Ht(c, A, z, R = {}) {
  const {
    moduleColor: k = "hsl(160, 65%, 25%)",
    backgroundColor: Q = "hsl(0, 0%, 98%)",
    cornerRadius: S = 0,
    showCopyableLink: x = !0,
    linkText: D = "Or paste this link:"
  } = R, F = $t(k), N = $t(Q), U = Math.sqrt(0.18), Z = Math.round(z * 0.03), V = new Ft({
    width: z,
    height: z,
    type: "svg",
    data: A,
    image: Ut,
    qrOptions: {
      errorCorrectionLevel: "H"
    },
    dotsOptions: {
      color: F,
      type: S > 0 ? "rounded" : "square"
    },
    backgroundOptions: {
      color: N
    },
    imageOptions: {
      hideBackgroundDots: !0,
      imageSize: U,
      margin: Z
    }
  }), T = document.createElement("div");
  T.className = "drop-payment-widget", V.append(T);
  const P = T.querySelector("svg");
  if (P && (P.setAttribute("role", "img"), P.setAttribute("aria-label", "Payment QR Code")), x) {
    const nt = Qt(A, z, D);
    T.appendChild(nt);
  }
  c.innerHTML = "", c.appendChild(T);
}
class it extends Error {
  constructor(A) {
    super(A), this.name = "ValidationError";
  }
}
function Wt(c) {
  Kt(c.clientSecret), c.qrSize !== void 0 && Xt(c.qrSize), c.pollingInterval !== void 0 && Vt(c.pollingInterval), c.qrOptions && Yt(c.qrOptions), c.linkText !== void 0 && Jt(c.linkText), Zt(c);
}
function Kt(c) {
  if (!c || c.trim() === "")
    throw new it("clientSecret is required and cannot be empty");
  if (c.length < 10)
    throw new it(
      `clientSecret must be at least 10 characters long. Received length: ${c.length}`
    );
  if (!c.startsWith("pi_secret_"))
    throw new it(
      "clientSecret must start with 'pi_secret_'. Received: " + c.substring(0, 10) + "..."
    );
}
function Xt(c) {
  if (typeof c != "number" || isNaN(c) || !isFinite(c))
    throw new it(`qrSize must be a valid number. Received: ${c}`);
  if (c < 128 || c > 1024)
    throw new it(
      `QR size must be between 128 and 1024 pixels. Received: ${c}`
    );
}
function Vt(c) {
  if (typeof c != "number" || isNaN(c) || !isFinite(c))
    throw new it(`pollingInterval must be a valid number. Received: ${c}`);
  if (c < 1e3 || c > 6e4)
    throw new it(
      `pollingInterval must be between 1000 and 60000 milliseconds. Received: ${c}`
    );
}
function Yt(c) {
  c && (c.cornerRadius !== void 0 && Gt(c.cornerRadius), c.moduleColor !== void 0 && Et(c.moduleColor, "moduleColor"), c.backgroundColor !== void 0 && Et(c.backgroundColor, "backgroundColor"));
}
function Gt(c) {
  if (typeof c != "number" || isNaN(c) || !isFinite(c))
    throw new it(`cornerRadius must be a valid number. Received: ${c}`);
  if (c < 0 || c > 1)
    throw new it(
      `cornerRadius must be between 0 and 1. Received: ${c}`
    );
}
function Et(c, A) {
  if (typeof c != "string")
    throw new it(`${A} must be a string. Received: ${typeof c}`);
  const z = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, R = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/, k = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/, Q = /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/, S = /^hsla\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(0|1|0?\.\d+)\s*\)$/;
  let x = z.test(c);
  if (!x) {
    const D = c.match(R);
    if (D) {
      const [, F, N, U] = D;
      x = parseInt(F) <= 255 && parseInt(N) <= 255 && parseInt(U) <= 255;
    }
  }
  if (!x) {
    const D = c.match(k);
    if (D) {
      const [, F, N, U] = D;
      x = parseInt(F) <= 255 && parseInt(N) <= 255 && parseInt(U) <= 255;
    }
  }
  if (!x) {
    const D = c.match(Q);
    if (D) {
      const [, F, N, U] = D;
      x = parseInt(F) <= 360 && parseInt(N) <= 100 && parseInt(U) <= 100;
    }
  }
  if (!x) {
    const D = c.match(S);
    if (D) {
      const [, F, N, U] = D;
      x = parseInt(F) <= 360 && parseInt(N) <= 100 && parseInt(U) <= 100;
    }
  }
  if (!x)
    throw new it(
      `${A} must be a valid color format (hex, rgb, rgba, hsl, or hsla). Received: ${c}`
    );
}
function Jt(c) {
  if (typeof c != "string")
    throw new it(`linkText must be a string. Received: ${typeof c}`);
  if (c.length > 100)
    throw new it(
      `linkText must be 100 characters or less. Received length: ${c.length}`
    );
}
function Zt(c) {
  if (c.onStatusChange !== void 0 && typeof c.onStatusChange != "function")
    throw new it(
      `onStatusChange must be a function if provided. Received: ${typeof c.onStatusChange}`
    );
  if (c.onError !== void 0 && typeof c.onError != "function")
    throw new it(
      `onError must be a function if provided. Received: ${typeof c.onError}`
    );
  if (c.onPoll !== void 0 && typeof c.onPoll != "function")
    throw new it(
      `onPoll must be a function if provided. Received: ${typeof c.onPoll}`
    );
}
const ie = {
  INITIATED: "initiated",
  PENDING: "pending",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
  CANCELLED: "cancelled",
  EXPIRED: "expired"
}, ne = {
  NETWORK_ERROR: "NETWORK_ERROR",
  AUTH_ERROR: "AUTH_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNKNOWN: "UNKNOWN"
}, te = 256;
function ee(c) {
  const A = c.split("?")[0].split("#")[0], z = c.includes("?") ? c.substring(c.indexOf("?")) : "", R = /\/payment-accounts\/([^/]+)\/payment-intents\/([^/]+)/, k = A.match(R);
  if (!k)
    throw new Error(
      "Invalid instanceUrl format. Expected: .../payment-accounts/{id}/payment-intents/{id}"
    );
  const Q = k[1], S = k[2], x = A.substring(
    0,
    A.indexOf("/payment-accounts/")
  );
  return { paymentAccountId: Q, paymentIntentId: S, apiBaseUrl: x, queryString: z };
}
const re = {
  async create(c) {
    Wt(c);
    const {
      clientSecret: A,
      instanceUrl: z,
      containerId: R,
      qrSize: k = te,
      pollingInterval: Q,
      onStatusChange: S,
      onError: x,
      onPoll: D
    } = c, F = document.getElementById(R);
    if (!F)
      throw new Error(`Element with id "${R}" not found.`);
    const { paymentAccountId: N, paymentIntentId: U, apiBaseUrl: Z, queryString: V } = ee(z), T = c.apiBaseUrl || Z, { qrOptions: P, showCopyableLink: nt, linkText: st } = c;
    await Ht(F, z, k, {
      ...P,
      showCopyableLink: nt,
      linkText: st
    });
    const Y = new Nt({
      apiBaseUrl: T,
      paymentAccountId: N,
      paymentIntentId: U,
      clientSecret: A,
      queryString: V,
      pollingInterval: Q,
      onStatusChange: (G) => {
        S == null || S(G);
      },
      onError: (G) => {
        x == null || x(G);
      },
      onPoll: () => {
        D == null || D();
      }
    });
    return Y.start(), {
      destroy() {
        Y.stop(), F.innerHTML = "";
      },
      getStatus() {
        return Y.getStatus();
      }
    };
  }
};
export {
  re as Drop,
  ne as ErrorCodes,
  ie as PaymentStatuses,
  it as ValidationError,
  Ht as renderQR
};
//# sourceMappingURL=drop.js.map
