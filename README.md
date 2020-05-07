## Code snippet

[./bam-nr.js](./bam-nr.js)

```javascript

18: [function(t, n, e) {
    function r(t, n) {
        var e = t.getEntries();
        e.forEach(function(t) {
            "first-paint" === t.name ? c("timing", ["fp", Math.floor(t.startTime)]) : "first-contentful-paint" === t.name && c("timing", ["fcp", Math.floor(t.startTime)])
        })
    }

    function o(t, n) {
        var e = t.getEntries();
        e.length > 0 && c("lcp", [e[e.length - 1]])
    }

    function i(t) {
        if (t instanceof u && !l) {
            var n, e = Math.round(t.timeStamp);
            n = e > 1e12 ? Date.now() - e : f.now() - e, l = !0, c("timing", ["fi", e, {
                type: t.type,
                fid: n
            }])
        }
    }
    if (!("init" in NREUM && "page_view_timing" in NREUM.init && "enabled" in NREUM.init.page_view_timing && NREUM.init.page_view_timing.enabled === !1)) {
        var a, s, c = t("handle"),
            f = t("loader"),
            u = NREUM.o.EV;
        if ("PerformanceObserver" in window && "function" == typeof window.PerformanceObserver) {
            a = new PerformanceObserver(r), s = new PerformanceObserver(o);
            try {
                a.observe({
                    entryTypes: ["paint"]
                }), s.observe({
                    entryTypes: ["largest-contentful-paint"]
                })
            } catch (d) {}
        }
        if ("addEventListener" in document) {
            var l = !1,
                p = ["click", "keydown", "mousedown", "pointerdown", "touchstart"];
            p.forEach(function(t) {
                document.addEventListener(t, i, !1)
            })
        }
    }
}, {}],

```

[./nr-min.js](./nr-min.js)

```javascript

9: [function(n, e, t) {
    function r(n) {
        if (n.info.beacon) {
            n.info.queueTime && x.store("measures", "qt", {
                value: n.info.queueTime
            }), n.info.applicationTime && x.store("measures", "ap", {
                value: n.info.applicationTime
            }), k.measure("be", "starttime", "firstbyte"), k.measure("fe", "firstbyte", "onload"), k.measure("dc", "firstbyte", "domContent");
            var e = x.get("measures"),
                t = v(e, function(n, e) {
                    return "&" + n + "=" + e.params.value
                }).join("");
            if (t) {
                var r = "1",
                    o = [d(n)];
                if (o.push(t), o.push(g.param("tt", n.info.ttGuid)), o.push(g.param("us", n.info.user)), o.push(g.param("ac", n.info.account)), o.push(g.param("pr", n.info.product)), o.push(g.param("af", v(n.features, function(n) {
                        return n
                    }).join(","))), window.performance && "undefined" != typeof window.performance.timing) {
                    var i = {
                        timing: h.addPT(window.performance.timing, {}),
                        navigation: h.addPN(window.performance.navigation, {})
                    };
                    o.push(g.param("perf", y(i)))
                }
                if (window.performance && window.performance.getEntriesByType) {
                    var a = window.performance.getEntriesByType("paint");
                    a.forEach(function(n) {
                        !n.startTime || n.startTime <= 0 || ("first-paint" === n.name ? o.push(g.param("fp", String(Math.floor(n.startTime)))) : "first-contentful-paint" === n.name && o.push(g.param("fcp", String(Math.floor(n.startTime)))), I(n.name, Math.floor(n.startTime)))
                    })
                }
                o.push(g.param("xx", n.info.extra)), o.push(g.param("ua", n.info.userAttributes)), o.push(g.param("at", n.info.atts));
                var s = y(n.info.jsAttributes);
                o.push(g.param("ja", "{}" === s ? null : s));
                var u = g.fromArray(o, n.maxBytes);
                w.jsonp("https://" + n.info.beacon + "/" + r + "/" + n.info.licenseKey + u, A)
            }
        }
    }

    ...

    var m = n(18),
        v = n(35),
        h = n(14),
        g = n(7),
        y = n(21),
        w = n(22),
        b = n(38),
        x = n(2),
        k = n(20),
        j = n("loader"),
        E = n(13),
        S = n(5),
        T = "1167.2a4546b",
        A = "NREUM.setToken",
        _ = {},
        N = !!navigator.sendBeacon;
    n(10);
    var q = j.ieVersion > 9 || 0 === j.ieVersion,
        I = n(15).addMetric;
    e.exports = {
        sendRUM: m(r),
        sendFinal: o,
        pingErrors: c,
        sendX: s,
        send: u,
        on: l,
        xhrUsable: q
    }
}, {}],

```