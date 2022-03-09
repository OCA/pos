(function () {
    function r(e, n, t) {
        function o(i, f) {
            if (!n[i]) {
                if (!e[i]) {
                    var c = typeof require === "function" && require;
                    if (!f && c) return c(i, !0);
                    if (u) return u(i, !0);
                    var a = new Error("Cannot find module '" + i + "'");
                    throw ((a.code = "MODULE_NOT_FOUND"), a);
                }
                var p = (n[i] = {exports: {}});
                e[i][0].call(
                    p.exports,
                    function (r) {
                        var n = e[i][1][r];
                        return o(n || r);
                    },
                    p,
                    p.exports,
                    r,
                    e,
                    n,
                    t
                );
            }
            return n[i].exports;
        }
        for (var u = typeof require === "function" && require, i = 0; i < t.length; i++)
            o(t[i]);
        return o;
    }
    return r;
})()(
    {
        1: [
            function (require, module, exports) {
                (function (Buffer) {
                    (function () {
                        const ipp = require("../lib/ipp");

                        window.printZPL = (printerName, zplString) => {
                            console.log("Sending print job");
                            var printer = ipp.Printer(
                                "http://localhost:8631/printers/" + printerName
                            );

                            printer.execute(
                                "Print-Job",
                                {
                                    "operation-attributes-tag": {
                                        "document-format": "text/plain",
                                    },
                                    data: Buffer.from(zplString),
                                },
                                function (err, res) {
                                    console.log(res);
                                }
                            );
                        };
                    }.call(this));
                }.call(this, require("buffer").Buffer));
            },
            {"../lib/ipp": 2, buffer: 16},
        ],
        2: [
            function (require, module, exports) {
                var util = require("./lib/ipputil");

                module.exports = {
                    parse: require("./lib/parser"),
                    serialize: require("./lib/serializer"),
                    request: require("./lib/request"),
                    Printer: require("./lib/printer"),
                    versions: require("./lib/versions"),
                    attributes: require("./lib/attributes"),
                    keywords: require("./lib/keywords"),
                    enums: require("./lib/enums"),
                    tags: require("./lib/tags"),
                    statusCodes: require("./lib/status-codes"),
                };
                module.exports.operations =
                    module.exports.enums["operations-supported"];
                module.exports.attribute = {
                    // http://www.iana.org/assignments/ipp-registrations/ipp-registrations.xml#ipp-registrations-7
                    groups: util.xref(module.exports.tags.lookup.slice(0x00, 0x0f)),
                    // http://www.iana.org/assignments/ipp-registrations/ipp-registrations.xml#ipp-registrations-8
                    values: util.xref(module.exports.tags.lookup.slice(0x10, 0x1f)),
                    // http://www.iana.org/assignments/ipp-registrations/ipp-registrations.xml#ipp-registrations-9
                    syntaxes: util.xref(module.exports.tags.lookup.slice(0x20)),
                };
            },
            {
                "./lib/attributes": 3,
                "./lib/enums": 4,
                "./lib/ipputil": 5,
                "./lib/keywords": 6,
                "./lib/parser": 7,
                "./lib/printer": 8,
                "./lib/request": 9,
                "./lib/serializer": 10,
                "./lib/status-codes": 11,
                "./lib/tags": 12,
                "./lib/versions": 13,
            },
        ],
        3: [
            function (require, module, exports) {
                /*

The attributes and their syntaxes are complicated. The functions in this
file serve as syntactic sugar that allow the attribute definitions to remain
close to what you will see in the spec. A bit of processing is done at the end
to convert it to one big object tree. If you want to understand what is going on,
uncomment the console.log() at the end of this file.

 */
                var tags = require("./tags");

                function text(max) {
                    if (!max) max = 1023;
                    return {type: "text", max: max};
                }
                function integer(min, max) {
                    if (max == MAX || max === undefined) max = 2147483647;
                    if (min === undefined) min = -2147483648;
                    return {type: "integer", tag: tags.integer, min: min, max: max};
                }
                function rangeOfInteger(min, max) {
                    if (max == MAX || max === undefined) max = 2147483647;
                    if (min === undefined) min = -2147483648;
                    return {
                        type: "rangeOfInteger",
                        tag: tags.rangeOfInteger,
                        min: min,
                        max: max,
                    };
                }
                function boolean() {
                    return {type: "boolean", tag: tags.boolean};
                }
                function charset() {
                    return {type: "charset", tag: tags.charset, max: 63};
                }
                function keyword() {
                    return {type: "keyword", tag: tags.keyword, min: 1, max: 1023};
                }
                function naturalLanguage() {
                    return {
                        type: "naturalLanguage",
                        tag: tags.naturalLanguage,
                        max: 63,
                    };
                }
                function dateTime() {
                    return {type: "dateTime", tag: tags.dateTime};
                }
                function mimeMediaType() {
                    return {
                        type: "mimeMediaType",
                        tag: tags.mimeMediaType,
                        max: 255,
                    };
                }
                function uri(max) {
                    return {type: "uri", tag: tags.uri, max: max || 1023};
                }
                function uriScheme() {
                    return {type: "uriScheme", tag: tags.uriScheme, max: 63};
                }
                function enumeration() {
                    return {type: "enumeration", tag: tags.enum};
                }
                function resolution() {
                    return {type: "resolution", tag: tags.resolution};
                }
                function unknown() {
                    return {type: "unknown", tag: tags.unknown};
                }
                function name(max) {
                    return {type: "name", max: max || 1023};
                }
                function novalue() {
                    return {type: "novalue", tag: tags["no-value"]};
                }
                function octetString(max) {
                    return {
                        type: "octetString",
                        tag: tags.octetString,
                        max: max || 1023,
                    };
                }

                // Some attributes allow alternate value syntaxes.
                // I want to keep the look and feel of the code close to
                // that of the RFCs. So, this _ (underscore) function is
                // used to group alternates and not be intrusive visually.
                function _(arg1, arg2, arg3) {
                    var args = Array.prototype.slice.call(arguments);
                    args.lookup = {};
                    const deferred = createDeferred(function () {
                        args.forEach(function (a, i) {
                            if (typeof a === "function") args[i] = a();
                            args.lookup[args[i].type] = args[i];
                        });
                        args.alts = Object.keys(args.lookup).sort().join();
                        return args;
                    });
                    return args.some(function (a) {
                        return isDeferred(a);
                    })
                        ? deferred
                        : deferred();
                }
                const createDeferred = function (deferred) {
                    deferred.isDeferred = true;
                    return deferred;
                };

                const isDeferred = function (type) {
                    return typeof type === "function" && type.isDeferred;
                };

                // In IPP, "1setOf" just means "Array"... but it must 1 or more items
                // In javascript, functions can't start with a number- so let's just use...
                function setof(type) {
                    if (isDeferred(type)) {
                        return createDeferred(function () {
                            type = type();
                            type.setof = true;
                            return type;
                        });
                    }
                    if (typeof type === "function" && !isDeferred(type)) {
                        type = type();
                    }
                    type.setof = true;
                    return type;
                }

                // In IPP, a "collection" is an set of name-value
                // pairs. In javascript, we call them "Objects".
                function collection(group, name) {
                    if (!arguments.length)
                        return {type: "collection", tag: tags.begCollection};

                    if (typeof group === "string") {
                        return createDeferred(function () {
                            return {
                                type: "collection",
                                tag: tags.begCollection,
                                members: attributes[group][name].members,
                            };
                        });
                    }
                    var defer = Object.keys(group).some(function (key) {
                        return isDeferred(group[key]);
                    });
                    const deferred = createDeferred(function () {
                        return {
                            type: "collection",
                            tag: tags.begCollection,
                            members: resolve(group),
                        };
                    });
                    return defer ? deferred : deferred();
                }

                var MAX = {};

                var attributes = {};
                attributes["Document Description"] = {
                    "attributes-charset": charset,
                    "attributes-natural-language": naturalLanguage,
                    compression: keyword,
                    "copies-actual": setof(integer(1, MAX)),
                    "cover-back-actual": setof(
                        collection("Job Template", "cover-back")
                    ),
                    "cover-front-actual": setof(
                        collection("Job Template", "cover-front")
                    ),
                    "current-page-order": keyword,
                    "date-time-at-completed": _(dateTime, novalue),
                    "date-time-at-creation": dateTime,
                    "date-time-at-processing": _(dateTime, novalue),
                    "detailed-status-messages": setof(text),
                    "document-access-errors": setof(text),
                    "document-charset": charset,
                    "document-digital-signature": keyword,
                    "document-format": mimeMediaType,
                    "document-format-details": setof(
                        collection("Operation", "document-format-details")
                    ),
                    "document-format-details-detected": setof(
                        collection("Operation", "document-format-details")
                    ),
                    "document-format-detected": mimeMediaType,
                    "document-format-version": text(127),
                    "document-format-version-detected": text(127),
                    "document-job-id": integer(1, MAX),
                    "document-job-uri": uri,
                    "document-message": text,
                    "document-metadata": setof(octetString),
                    "document-name": name,
                    "document-natural-language": naturalLanguage,
                    "document-number": integer(1, MAX),
                    "document-printer-uri": uri,
                    "document-state": enumeration,
                    "document-state-message": text,
                    "document-state-reasons": setof(keyword),
                    "document-uri": uri,
                    "document-uuid": uri(45),
                    "errors-count": integer(0, MAX),
                    "finishings-actual": setof(enumeration),
                    "finishings-col-actual": setof(
                        collection("Job Template", "finishings-col")
                    ),
                    "force-front-side-actual": setof(integer(1, MAX)),
                    "imposition-template-actual": setof(_(keyword, name)),
                    impressions: integer(0, MAX),
                    "impressions-completed": integer(0, MAX),
                    "impressions-completed-current-copy": integer(0, MAX),
                    "insert-sheet-actual": setof(
                        collection("Job Template", "insert-sheet")
                    ),
                    "k-octets": integer(0, MAX),
                    "k-octets-processed": integer(0, MAX),
                    "last-document": boolean,
                    "media-actual": setof(_(keyword, name)),
                    "media-col-actual": setof(collection("Job Template", "media-col")),
                    "media-input-tray-check-actual": setof(_(keyword, name)),
                    "media-sheets": integer(0, MAX),
                    "media-sheets-completed": integer(0, MAX),
                    "more-info": uri,
                    "number-up-actual": setof(integer),
                    "orientation-requested-actual": setof(enumeration),
                    "output-bin-actual": setof(name),
                    "output-device-assigned": name(127),
                    "overrides-actual": setof(
                        collection("Document Template", "overrides")
                    ),
                    "page-delivery-actual": setof(keyword),
                    "page-order-received-actual": setof(keyword),
                    "page-ranges-actual": setof(rangeOfInteger(1, MAX)),
                    pages: integer(0, MAX),
                    "pages-completed": integer(0, MAX),
                    "pages-completed-current-copy": integer(0, MAX),
                    "presentation-direction-number-up-actual": setof(keyword),
                    "print-content-optimize-actual": setof(keyword),
                    "print-quality-actual": setof(enumeration),
                    "printer-resolution-actual": setof(resolution),
                    "printer-up-time": integer(1, MAX),
                    "separator-sheets-actual": setof(
                        collection("Job Template", "separator-sheets")
                    ),
                    "sheet-completed-copy-number": integer(0, MAX),
                    "sides-actual": setof(keyword),
                    "time-at-completed": _(integer, novalue),
                    "time-at-creation": integer,
                    "time-at-processing": _(integer, novalue),
                    "x-image-position-actual": setof(keyword),
                    "x-image-shift-actual": setof(integer),
                    "x-side1-image-shift-actual": setof(integer),
                    "x-side2-image-shift-actual": setof(integer),
                    "y-image-position-actual": setof(keyword),
                    "y-image-shift-actual": setof(integer),
                    "y-side1-image-shift-actual": setof(integer),
                    "y-side2-image-shift-actual": setof(integer),
                };
                attributes["Document Template"] = {
                    copies: integer(1, MAX),
                    "cover-back": collection("Job Template", "cover-back"),
                    "cover-front": collection("Job Template", "cover-front"),
                    "feed-orientation": keyword,
                    finishings: setof(enumeration),
                    "finishings-col": collection("Job Template", "finishings-col"),
                    "font-name-requested": name,
                    "font-size-requested": integer(1, MAX),
                    "force-front-side": setof(integer(1, MAX)),
                    "imposition-template": _(keyword, name),
                    "insert-sheet": setof(collection("Job Template", "insert-sheet")),
                    media: _(keyword, name),
                    "media-col": collection("Job Template", "media-col"),
                    "media-input-tray-check": _(keyword, name),
                    "number-up": integer(1, MAX),
                    "orientation-requested": enumeration,
                    overrides: setof(
                        collection({
                            // Any Document Template attribute (TODO)
                            "document-copies": setof(rangeOfInteger),
                            "document-numbers": setof(rangeOfInteger),
                            pages: setof(rangeOfInteger),
                        })
                    ),
                    "page-delivery": keyword,
                    "page-order-received": keyword,
                    "page-ranges": setof(rangeOfInteger(1, MAX)),
                    "pdl-init-file": setof(collection("Job Template", "pdl-init-file")),
                    "presentation-direction-number-up": keyword,
                    "print-color-mode": keyword,
                    "print-content-optimize": keyword,
                    "print-quality": enumeration,
                    "print-rendering-intent": keyword,
                    "printer-resolution": resolution,
                    "separator-sheets": collection("Job Template", "separator-sheets"),
                    "sheet-collate": keyword,
                    sides: keyword,
                    "x-image-position": keyword,
                    "x-image-shift": integer,
                    "x-side1-image-shift": integer,
                    "x-side2-image-shift": integer,
                    "y-image-position": keyword,
                    "y-image-shift": integer,
                    "y-side1-image-shift": integer,
                    "y-side2-image-shift": integer,
                };
                attributes["Event Notifications"] = {
                    "notify-subscribed-event": keyword,
                    "notify-text": text,
                };
                attributes["Job Description"] = {
                    "attributes-charset": charset,
                    "attributes-natural-language": naturalLanguage,
                    "compression-supplied": keyword,
                    "copies-actual": setof(integer(1, MAX)),
                    "cover-back-actual": setof(
                        collection("Job Template", "cover-back")
                    ),
                    "cover-front-actual": setof(
                        collection("Job Template", "cover-front")
                    ),
                    "current-page-order": keyword,
                    "date-time-at-completed": _(dateTime, novalue),
                    "date-time-at-creation": dateTime,
                    "date-time-at-processing": _(dateTime, novalue),
                    "document-charset-supplied": charset,
                    "document-digital-signature-supplied": keyword,
                    "document-format-details-supplied": setof(
                        collection("Operation", "document-format-details")
                    ),
                    "document-format-supplied": mimeMediaType,
                    "document-format-version-supplied": text(127),
                    "document-message-supplied": text,
                    "document-metadata": setof(octetString),
                    "document-name-supplied": name,
                    "document-natural-language-supplied": naturalLanguage,
                    "document-overrides-actual": setof(collection),
                    "errors-count": integer(0, MAX),
                    "finishings-actual": setof(enumeration),
                    "finishings-col-actual": setof(
                        collection("Job Template", "finishings-col")
                    ),
                    "force-front-side-actual": setof(setof(integer(1, MAX))),
                    "imposition-template-actual": setof(_(keyword, name)),
                    "impressions-completed-current-copy": integer(0, MAX),
                    "insert-sheet-actual": setof(
                        collection("Job Template", "insert-sheet")
                    ),
                    "job-account-id-actual": setof(name),
                    "job-accounting-sheets-actual": setof(
                        collection("Job Template", "job-accounting-sheets")
                    ),
                    "job-accounting-user-id-actual": setof(name),
                    "job-attribute-fidelity": boolean,
                    "job-collation-type": enumeration,
                    "job-collation-type-actual": setof(keyword),
                    "job-copies-actual": setof(integer(1, MAX)),
                    "job-cover-back-actual": setof(
                        collection("Job Template", "cover-back")
                    ),
                    "job-cover-front-actual": setof(
                        collection("Job Template", "cover-front")
                    ),
                    "job-detailed-status-messages": setof(text),
                    "job-document-access-errors": setof(text),
                    "job-error-sheet-actual": setof(
                        collection("Job Template", "job-error-sheet")
                    ),
                    "job-finishings-actual": setof(enumeration),
                    "job-finishings-col-actual": setof(
                        collection("Job Template", "media-col")
                    ),
                    "job-hold-until-actual": setof(_(keyword, name)),
                    "job-id": integer(1, MAX),
                    "job-impressions": integer(0, MAX),
                    "job-impressions-completed": integer(0, MAX),
                    "job-k-octets": integer(0, MAX),
                    "job-k-octets-processed": integer(0, MAX),
                    "job-mandatory-attributes": setof(keyword),
                    "job-media-sheets": integer(0, MAX),
                    "job-media-sheets-completed": integer(0, MAX),
                    "job-message-from-operator": text(127),
                    "job-message-to-operator-actual": setof(text),
                    "job-more-info": uri,
                    "job-name": name,
                    "job-originating-user-name": name,
                    "job-originating-user-uri": uri,
                    "job-pages": integer(0, MAX),
                    "job-pages-completed": integer(0, MAX),
                    "job-pages-completed-current-copy": integer(0, MAX),
                    "job-printer-up-time": integer(1, MAX),
                    "job-printer-uri": uri,
                    "job-priority-actual": setof(integer(1, 100)),
                    "job-save-printer-make-and-model": text(127),
                    "job-sheet-message-actual": setof(text),
                    "job-sheets-actual": setof(_(keyword, name)),
                    "job-sheets-col-actual": setof(
                        collection("Job Template", "job-sheets-col")
                    ),
                    "job-state": _(enumeration, unknown),
                    "job-state-message": text,
                    "job-state-reasons": setof(keyword),
                    "job-uri": uri,
                    "job-uuid": uri(45),
                    "media-actual": setof(_(keyword, name)),
                    "media-col-actual": setof(collection("Job Template", "media-col")),
                    "media-input-tray-check-actual": setof(_(keyword, name)),
                    "multiple-document-handling-actual": setof(keyword),
                    "number-of-documents": integer(0, MAX),
                    "number-of-intervening-jobs": integer(0, MAX),
                    "number-up-actual": setof(integer(1, MAX)),
                    "orientation-requested-actual": setof(enumeration),
                    "original-requesting-user-name": name,
                    "output-bin-actual": setof(_(keyword, name)),
                    "output-device-actual": setof(name(127)),
                    "output-device-assigned": name(127),
                    "overrides-actual": setof(collection("Job Template", "overrides")),
                    "page-delivery-actual": setof(keyword),
                    "page-order-received-actual": setof(keyword),
                    "page-ranges-actual": setof(rangeOfInteger(1, MAX)),
                    "presentation-direction-number-up-actual": setof(keyword),
                    "print-content-optimize-actual": setof(keyword),
                    "print-quality-actual": setof(enumeration),
                    "printer-resolution-actual": setof(resolution),
                    "separator-sheets-actual": setof(
                        collection("Job Template", "separator-sheets")
                    ),
                    "sheet-collate-actual": setof(keyword),
                    "sheet-completed-copy-number": integer(0, MAX),
                    "sheet-completed-document-number": integer(0, MAX),
                    "sides-actual": setof(keyword),
                    "time-at-completed": _(integer, novalue),
                    "time-at-creation": integer,
                    "time-at-processing": _(integer, novalue),
                    "warnings-count": integer(0, MAX),
                    "x-image-position-actual": setof(keyword),
                    "x-image-shift-actual": setof(integer),
                    "x-side1-image-shift-actual": setof(integer),
                    "x-side2-image-shift-actual": setof(integer),
                    "y-image-position-actual": setof(keyword),
                    "y-image-shift-actual": setof(integer),
                    "y-side1-image-shift-actual": setof(integer),
                    "y-side2-image-shift-actual": setof(integer),
                };
                attributes["Job Template"] = {
                    copies: integer(1, MAX),
                    "cover-back": collection({
                        "cover-type": keyword,
                        media: _(keyword, name),
                        "media-col": collection("Job Template", "media-col"),
                    }),
                    "cover-front": collection({
                        "cover-type": keyword,
                        media: _(keyword, name),
                        "media-col": collection("Job Template", "media-col"),
                    }),
                    "feed-orientation": keyword,
                    finishings: setof(enumeration),
                    "finishings-col": collection({
                        "finishing-template": name,
                        stitching: collection({
                            "stitching-locations": setof(integer(0, MAX)),
                            "stitching-offset": integer(0, MAX),
                            "stitching-reference-edge": keyword,
                        }),
                    }),
                    "font-name-requested": name,
                    "font-size-requested": integer(1, MAX),
                    "force-front-side": setof(integer(1, MAX)),
                    "imposition-template": _(keyword, name),
                    "insert-sheet": setof(
                        collection({
                            "insert-after-page-number": integer(0, MAX),
                            "insert-count": integer(0, MAX),
                            media: _(keyword, name),
                            "media-col": collection("Job Template", "media-col"),
                        })
                    ),
                    "job-account-id": name,
                    "job-accounting-sheets": collection({
                        "job-accounting-output-bin": _(keyword, name),
                        "job-accounting-sheets-type": _(keyword, name),
                        media: _(keyword, name),
                        "media-col": collection("Job Template", "media-col"),
                    }),
                    "job-accounting-user-id": name,
                    "job-copies": integer(1, MAX),
                    "job-cover-back": collection("Job Template", "cover-back"),
                    "job-cover-front": collection("Job Template", "cover-front"),
                    "job-delay-output-until": _(keyword, name),
                    "job-delay-output-until-time": dateTime,
                    "job-error-action": keyword,
                    "job-error-sheet": collection({
                        "job-error-sheet-type": _(keyword, name),
                        "job-error-sheet-when": keyword,
                        media: _(keyword, name),
                        "media-col": collection("Job Template", "media-col"),
                    }),
                    "job-finishings": setof(enumeration),
                    "job-finishings-col": collection("Job Template", "finishings-col"),
                    "job-hold-until": _(keyword, name),
                    "job-hold-until-time": dateTime,
                    "job-message-to-operator": text,
                    "job-phone-number": uri,
                    "job-priority": integer(1, 100),
                    "job-recipient-name": name,
                    "job-save-disposition": collection({
                        "save-disposition": keyword,
                        "save-info": setof(
                            collection({
                                "save-document-format": mimeMediaType,
                                "save-location": uri,
                                "save-name": name,
                            })
                        ),
                    }),
                    "job-sheet-message": text,
                    "job-sheets": _(keyword, name),
                    "job-sheets-col": collection({
                        "job-sheets": _(keyword, name),
                        media: _(keyword, name),
                        "media-col": collection("Job Template", "media-col"),
                    }),
                    media: _(keyword, name),
                    "media-col": collection({
                        "media-back-coating": _(keyword, name),
                        "media-bottom-margin": integer(0, MAX),
                        "media-color": _(keyword, name),
                        "media-front-coating": _(keyword, name),
                        "media-grain": _(keyword, name),
                        "media-hole-count": integer(0, MAX),
                        "media-info": text(255),
                        "media-key": _(keyword, name),
                        "media-left-margin": integer(0, MAX),
                        "media-order-count": integer(1, MAX),
                        "media-pre-printed": _(keyword, name),
                        "media-recycled": _(keyword, name),
                        "media-right-margin": integer(0, MAX),
                        "media-size": collection({
                            "x-dimension": integer(0, MAX),
                            "y-dimension": integer(0, MAX),
                        }),
                        "media-size-name": _(keyword, name),
                        "media-source": _(keyword, name),
                        "media-thickness": integer(1, MAX),
                        "media-tooth": _(keyword, name),
                        "media-top-margin": integer(0, MAX),
                        "media-type": _(keyword, name),
                        "media-weight-metric": integer(0, MAX),
                    }),
                    "media-input-tray-check": _(keyword, name),
                    "multiple-document-handling": keyword,
                    "number-up": integer(1, MAX),
                    "orientation-requested": enumeration,
                    "output-bin": _(keyword, name),
                    "output-device": name(127),
                    overrides: setof(
                        collection({
                            // Any Job Template attribute (TODO)
                            "document-copies": setof(rangeOfInteger),
                            "document-numbers": setof(rangeOfInteger),
                            pages: setof(rangeOfInteger),
                        })
                    ),
                    "page-delivery": keyword,
                    "page-order-received": keyword,
                    "page-ranges": setof(rangeOfInteger(1, MAX)),
                    "pages-per-subset": setof(integer(1, MAX)),
                    "pdl-init-file": collection({
                        "pdl-init-file-entry": name,
                        "pdl-init-file-location": uri,
                        "pdl-init-file-name": name,
                    }),
                    "presentation-direction-number-up": keyword,
                    "print-color-mode": keyword,
                    "print-content-optimize": keyword,
                    "print-quality": enumeration,
                    "print-rendering-intent": keyword,
                    "printer-resolution": resolution,
                    "proof-print": collection({
                        media: _(keyword, name),
                        "media-col": collection("Job Template", "media-col"),
                        "proof-print-copies": integer(0, MAX),
                    }),
                    "separator-sheets": collection({
                        media: _(keyword, name),
                        "media-col": collection("Job Template", "media-col"),
                        "separator-sheets-type": setof(keyword),
                    }),
                    "sheet-collate": keyword,
                    sides: keyword,
                    "x-image-position": keyword,
                    "x-image-shift": integer,
                    "x-side1-image-shift": integer,
                    "x-side2-image-shift": integer,
                    "y-image-position": keyword,
                    "y-image-shift": integer,
                    "y-side1-image-shift": integer,
                    "y-side2-image-shift": integer,
                };
                attributes.Operation = {
                    "attributes-charset": charset,
                    "attributes-natural-language": naturalLanguage,
                    compression: keyword,
                    "detailed-status-message": text,
                    "document-access-error": text,
                    "document-charset": charset,
                    "document-digital-signature": keyword,
                    "document-format": mimeMediaType,
                    "document-format-details": setof(
                        collection({
                            "document-format": mimeMediaType,
                            "document-format-device-id": text(127),
                            "document-format-version": text(127),
                            "document-natural-language": setof(naturalLanguage),
                            "document-source-application-name": name,
                            "document-source-application-version": text(127),
                            "document-source-os-name": name(40),
                            "document-source-os-version": text(40),
                        })
                    ),
                    "document-message": text,
                    "document-metadata": setof(octetString),
                    "document-name": name,
                    "document-natural-language": naturalLanguage,
                    "document-password": octetString,
                    "document-uri": uri,
                    "first-index": integer(1, MAX),
                    "identify-actions": setof(keyword),
                    "ipp-attribute-fidelity": boolean,
                    "job-hold-until": _(keyword, name),
                    "job-id": integer(1, MAX),
                    "job-ids": setof(integer(1, MAX)),
                    "job-impressions": integer(0, MAX),
                    "job-k-octets": integer(0, MAX),
                    "job-mandatory-attributes": setof(keyword),
                    "job-media-sheets": integer(0, MAX),
                    "job-message-from-operator": text(127),
                    "job-name": name,
                    "job-password": octetString(255),
                    "job-password-encryption": _(keyword, name),
                    "job-state": enumeration,
                    "job-state-message": text,
                    "job-state-reasons": setof(keyword),
                    "job-uri": uri,
                    "last-document": boolean,
                    limit: integer(1, MAX),
                    message: text(127),
                    "my-jobs": boolean,
                    "original-requesting-user-name": name,
                    "preferred-attributes": collection,
                    "printer-message-from-operator": text(127),
                    "printer-uri": uri,
                    "requested-attributes": setof(keyword),
                    "requesting-user-name": name,
                    "requesting-user-uri": uri,
                    "status-message": text(255),
                    "which-jobs": keyword,
                };
                attributes["Printer Description"] = {
                    "charset-configured": charset,
                    "charset-supported": setof(charset),
                    "color-supported": boolean,
                    "compression-supported": setof(keyword),
                    "copies-default": integer(1, MAX),
                    "copies-supported": rangeOfInteger(1, MAX),
                    "cover-back-default": collection("Job Template", "cover-back"),
                    "cover-back-supported": setof(keyword),
                    "cover-front-default": collection("Job Template", "cover-front"),
                    "cover-front-supported": setof(keyword),
                    "device-service-count": integer(1, MAX),
                    "device-uuid": uri(45),
                    "document-charset-default": charset,
                    "document-charset-supported": setof(charset),
                    "document-creation-attributes-supported": setof(keyword),
                    "document-digital-signature-default": keyword,
                    "document-digital-signature-supported": setof(keyword),
                    "document-format-default": mimeMediaType,
                    "document-format-details-default": collection(
                        "Operation",
                        "document-format-details"
                    ),
                    "document-format-details-supported": setof(keyword),
                    "document-format-supported": setof(mimeMediaType),
                    "document-format-varying-attributes": setof(keyword),
                    "document-format-version-default": text(127),
                    "document-format-version-supported": setof(text(127)),
                    "document-natural-language-default": naturalLanguage,
                    "document-natural-language-supported": setof(naturalLanguage),
                    "document-password-supported": integer(0, 1023),
                    "feed-orientation-default": keyword,
                    "feed-orientation-supported": keyword,
                    "finishings-col-default": collection(
                        "Job Template",
                        "finishings-col"
                    ),
                    "finishings-col-ready": setof(
                        collection("Job Template", "finishings-col")
                    ),
                    "finishings-col-supported": setof(keyword),
                    "finishings-default": setof(enumeration),
                    "finishings-ready": setof(enumeration),
                    "finishings-supported": setof(enumeration),
                    "font-name-requested-default": name,
                    "font-name-requested-supported": setof(name),
                    "font-size-requested-default": integer(1, MAX),
                    "font-size-requested-supported": setof(rangeOfInteger(1, MAX)),
                    "force-front-side-default (under review)": setof(integer(1, MAX)),
                    "force-front-side-supported (under review)": rangeOfInteger(1, MAX),
                    "generated-natural-language-supported": setof(naturalLanguage),
                    "identify-actions-default": setof(keyword),
                    "identify-actions-supported": setof(keyword),
                    "imposition-template-default": _(keyword, name),
                    "imposition-template-supported": setof(_(keyword, name)),
                    "insert-after-page-number-supported": rangeOfInteger(0, MAX),
                    "insert-count-supported": rangeOfInteger(0, MAX),
                    "insert-sheet-default": setof(
                        collection("Job Template", "insert-sheet")
                    ),
                    "insert-sheet-supported": setof(keyword),
                    "ipp-features-supported": setof(keyword),
                    "ipp-versions-supported": setof(keyword),
                    "ippget-event-life": integer(15, MAX),
                    "job-account-id-default": _(name, novalue),
                    "job-account-id-supported": boolean,
                    "job-accounting-sheets-default": _(
                        collection("Job Template", "job-accounting-sheets"),
                        novalue
                    ),
                    "job-accounting-sheets-supported": setof(keyword),
                    "job-accounting-user-id-default": _(name, novalue),
                    "job-accounting-user-id-supported": boolean,
                    "job-constraints-supported": setof(collection),
                    "job-copies-default": integer(1, MAX),
                    "job-copies-supported": rangeOfInteger(1, MAX),
                    "job-cover-back-default": collection("Job Template", "cover-back"),
                    "job-cover-back-supported": setof(keyword),
                    "job-cover-front-default": collection(
                        "Job Template",
                        "cover-front"
                    ),
                    "job-cover-front-supported": setof(keyword),
                    "job-creation-attributes-supported": setof(keyword),
                    "job-delay-output-until-default": _(keyword, name),
                    "job-delay-output-until-supported": setof(_(keyword, name)),
                    "job-delay-output-until-time-supported": rangeOfInteger(0, MAX),
                    "job-error-action-default": keyword,
                    "job-error-action-supported": setof(keyword),
                    "job-error-sheet-default": _(
                        collection("Job Template", "job-error-sheet"),
                        novalue
                    ),
                    "job-error-sheet-supported": setof(keyword),
                    "job-finishings-col-default": collection(
                        "Job Template",
                        "finishings-col"
                    ),
                    "job-finishings-col-ready": setof(
                        collection("Job Template", "finishings-col")
                    ),
                    "job-finishings-col-supported": setof(keyword),
                    "job-finishings-default": setof(enumeration),
                    "job-finishings-ready": setof(enumeration),
                    "job-finishings-supported": setof(enumeration),
                    "job-hold-until-default": _(keyword, name),
                    "job-hold-until-supported": setof(_(keyword, name)),
                    "job-hold-until-time-supported": rangeOfInteger(0, MAX),
                    "job-ids-supported": boolean,
                    "job-impressions-supported": rangeOfInteger(0, MAX),
                    "job-k-octets-supported": rangeOfInteger(0, MAX),
                    "job-media-sheets-supported": rangeOfInteger(0, MAX),
                    "job-message-to-operator-default": text,
                    "job-message-to-operator-supported": boolean,
                    "job-password-encryption-supported": setof(_(keyword, name)),
                    "job-password-supported": integer(0, 255),
                    "job-phone-number-default": _(uri, novalue),
                    "job-phone-number-supported": boolean,
                    "job-priority-default": integer(1, 100),
                    "job-priority-supported": integer(1, 100),
                    "job-recipient-name-default": _(name, novalue),
                    "job-recipient-name-supported": boolean,
                    "job-resolvers-supported": setof(
                        collection({
                            "resolver-name": name,
                        })
                    ),
                    "job-settable-attributes-supported": setof(keyword),
                    "job-sheet-message-default": text,
                    "job-sheet-message-supported": boolean,
                    "job-sheets-col-default": collection(
                        "Job Template",
                        "job-sheets-col"
                    ),
                    "job-sheets-col-supported": setof(keyword),
                    "job-sheets-default": _(keyword, name),
                    "job-sheets-supported": setof(_(keyword, name)),
                    "job-spooling-supported": keyword,
                    "max-save-info-supported": integer(1, MAX),
                    "max-stitching-locations-supported": integer(1, MAX),
                    "media-back-coating-supported": setof(_(keyword, name)),
                    "media-bottom-margin-supported": setof(integer(0, MAX)),
                    "media-col-database": setof(
                        collection({
                            // TODO: Member attributes are the same as the
                            // "media-col" Job Template attribute
                            "media-source-properties": collection({
                                "media-source-feed-direction": keyword,
                                "media-source-feed-orientation": enumeration,
                            }),
                        })
                    ),
                    "media-col-default": collection("Job Template", "media-col"),
                    "media-col-ready": setof(
                        collection({
                            // TODO: Member attributes are the same as the
                            // "media-col" Job Template attribute
                            "media-source-properties": collection({
                                "media-source-feed-direction": keyword,
                                "media-source-feed-orientation": enumeration,
                            }),
                        })
                    ),
                    "media-col-supported": setof(keyword),
                    "media-color-supported": setof(_(keyword, name)),
                    "media-default": _(keyword, name, novalue),
                    "media-front-coating-supported": setof(_(keyword, name)),
                    "media-grain-supported": setof(_(keyword, name)),
                    "media-hole-count-supported": setof(rangeOfInteger(0, MAX)),
                    "media-info-supported": boolean,
                    "media-input-tray-check-default": _(keyword, name, novalue),
                    "media-input-tray-check-supported": setof(_(keyword, name)),
                    "media-key-supported": setof(_(keyword, name)),
                    "media-left-margin-supported": setof(integer(0, MAX)),
                    "media-order-count-supported": setof(rangeOfInteger(1, MAX)),
                    "media-pre-printed-supported": setof(_(keyword, name)),
                    "media-ready": setof(_(keyword, name)),
                    "media-recycled-supported": setof(_(keyword, name)),
                    "media-right-margin-supported": setof(integer(0, MAX)),
                    "media-size-supported": setof(
                        collection({
                            "x-dimension": _(integer(1, MAX), rangeOfInteger(1, MAX)),
                            "y-dimension": _(integer(1, MAX), rangeOfInteger(1, MAX)),
                        })
                    ),
                    "media-source-supported": setof(_(keyword, name)),
                    "media-supported": setof(_(keyword, name)),
                    "media-thickness-supported": rangeOfInteger(1, MAX),
                    "media-tooth-supported": setof(_(keyword, name)),
                    "media-top-margin-supported": setof(integer(0, MAX)),
                    "media-type-supported": setof(_(keyword, name)),
                    "media-weight-metric-supported": setof(rangeOfInteger(0, MAX)),
                    "multiple-document-handling-default": keyword,
                    "multiple-document-handling-supported": setof(keyword),
                    "multiple-document-jobs-supported": boolean,
                    "multiple-operation-time-out": integer(1, MAX),
                    "multiple-operation-timeout-action": keyword,
                    "natural-language-configured": naturalLanguage,
                    "number-up-default": integer(1, MAX),
                    "number-up-supported": _(integer(1, MAX), rangeOfInteger(1, MAX)),
                    "operations-supported": setof(enumeration),
                    "orientation-requested-default": _(novalue, enumeration),
                    "orientation-requested-supported": setof(enumeration),
                    "output-bin-default": _(keyword, name),
                    "output-bin-supported": setof(_(keyword, name)),
                    "output-device-supported": setof(name(127)),
                    "overrides-supported": setof(keyword),
                    "page-delivery-default": keyword,
                    "page-delivery-supported": setof(keyword),
                    "page-order-received-default": keyword,
                    "page-order-received-supported": setof(keyword),
                    "page-ranges-supported": boolean,
                    "pages-per-minute": integer(0, MAX),
                    "pages-per-minute-color": integer(0, MAX),
                    "pages-per-subset-supported": boolean,
                    "parent-printers-supported": setof(uri),
                    "pdl-init-file-default": _(
                        collection("Job Template", "pdl-init-file"),
                        novalue
                    ),
                    "pdl-init-file-entry-supported": setof(name),
                    "pdl-init-file-location-supported": setof(uri),
                    "pdl-init-file-name-subdirectory-supported": boolean,
                    "pdl-init-file-name-supported": setof(name),
                    "pdl-init-file-supported": setof(keyword),
                    "pdl-override-supported": keyword,
                    "preferred-attributes-supported": boolean,
                    "presentation-direction-number-up-default": keyword,
                    "presentation-direction-number-up-supported": setof(keyword),
                    "print-color-mode-default": keyword,
                    "print-color-mode-supported": setof(keyword),
                    "print-content-optimize-default": keyword,
                    "print-content-optimize-supported": setof(keyword),
                    "print-quality-default": enumeration,
                    "print-quality-supported": setof(enumeration),
                    "print-rendering-intent-default": keyword,
                    "print-rendering-intent-supported": setof(keyword),
                    "printer-alert": setof(octetString),
                    "printer-alert-description": setof(text),
                    "printer-charge-info": text,
                    "printer-charge-info-uri": uri,
                    "printer-current-time": dateTime,
                    "printer-detailed-status-messages": setof(text),
                    "printer-device-id": text(1023),
                    "printer-driver-installer": uri,
                    "printer-geo-location": uri,
                    "printer-get-attributes-supported": setof(keyword),
                    "printer-icc-profiles": setof(
                        collection({
                            "xri-authentication": name,
                            "profile-url": uri,
                        })
                    ),
                    "printer-icons": setof(uri),
                    "printer-info": text(127),
                    "printer-is-accepting-jobs": boolean,
                    "printer-location": text(127),
                    "printer-make-and-model": text(127),
                    "printer-mandatory-job-attributes": setof(keyword),
                    "printer-message-date-time": dateTime,
                    "printer-message-from-operator": text(127),
                    "printer-message-time": integer,
                    "printer-more-info": uri,
                    "printer-more-info-manufacturer": uri,
                    "printer-name": name(127),
                    "printer-organization": setof(text),
                    "printer-organizational-unit": setof(text),
                    "printer-resolution-default": resolution,
                    "printer-resolution-supported": resolution,
                    "printer-settable-attributes-supported": setof(keyword),
                    "printer-state": enumeration,
                    "printer-state-change-date-time": dateTime,
                    "printer-state-change-time": integer(1, MAX),
                    "printer-state-message": text,
                    "printer-state-reasons": setof(keyword),
                    "printer-supply": setof(octetString),
                    "printer-supply-description": setof(text),
                    "printer-supply-info-uri": uri,
                    "printer-up-time": integer(1, MAX),
                    "printer-uri-supported": setof(uri),
                    "printer-uuid": uri(45),
                    "printer-xri-supported": setof(
                        collection({
                            "xri-authentication": keyword,
                            "xri-security": keyword,
                            "xri-uri": uri,
                        })
                    ),
                    "proof-print-default": _(
                        collection("Job Template", "proof-print"),
                        novalue
                    ),
                    "proof-print-supported": setof(keyword),
                    "pwg-raster-document-resolution-supported": setof(resolution),
                    "pwg-raster-document-sheet-back": keyword,
                    "pwg-raster-document-type-supported": setof(keyword),
                    "queued-job-count": integer(0, MAX),
                    "reference-uri-schemes-supported": setof(uriScheme),
                    "repertoire-supported": setof(_(keyword, name)),
                    "requesting-user-uri-supported": boolean,
                    "save-disposition-supported": setof(keyword),
                    "save-document-format-default": mimeMediaType,
                    "save-document-format-supported": setof(mimeMediaType),
                    "save-location-default": uri,
                    "save-location-supported": setof(uri),
                    "save-name-subdirectory-supported": boolean,
                    "save-name-supported": boolean,
                    "separator-sheets-default": collection(
                        "Job Template",
                        "separator-sheets"
                    ),
                    "separator-sheets-supported": setof(keyword),
                    "sheet-collate-default": keyword,
                    "sheet-collate-supported": setof(keyword),
                    "sides-default": keyword,
                    "sides-supported": setof(keyword),
                    "stitching-locations-supported": setof(
                        _(integer(0, MAX), rangeOfInteger(0, MAX))
                    ),
                    "stitching-offset-supported": setof(
                        _(integer(0, MAX), rangeOfInteger(0, MAX))
                    ),
                    "subordinate-printers-supported": setof(uri),
                    "uri-authentication-supported": setof(keyword),
                    "uri-security-supported": setof(keyword),
                    "user-defined-values-supported": setof(keyword),
                    "which-jobs-supported": setof(keyword),
                    "x-image-position-default": keyword,
                    "x-image-position-supported": setof(keyword),
                    "x-image-shift-default": integer,
                    "x-image-shift-supported": rangeOfInteger,
                    "x-side1-image-shift-default": integer,
                    "x-side1-image-shift-supported": rangeOfInteger,
                    "x-side2-image-shift-default": integer,
                    "x-side2-image-shift-supported": rangeOfInteger,
                    "xri-authentication-supported": setof(keyword),
                    "xri-security-supported": setof(keyword),
                    "xri-uri-scheme-supported": setof(uriScheme),
                    "y-image-position-default": keyword,
                    "y-image-position-supported": setof(keyword),
                    "y-image-shift-default": integer,
                    "y-image-shift-supported": rangeOfInteger,
                    "y-side1-image-shift-default": integer,
                    "y-side1-image-shift-supported": rangeOfInteger,
                    "y-side2-image-shift-default": integer,
                    "y-side2-image-shift-supported": rangeOfInteger,
                };
                attributes["Subscription Description"] = {
                    "notify-job-id": integer(1, MAX),
                    "notify-lease-expiration-time": integer(0, MAX),
                    "notify-printer-up-time": integer(1, MAX),
                    "notify-printer-uri": uri,
                    "notify-sequence-number": integer(0, MAX),
                    "notify-subscriber-user-name": name,
                    "notify-subscriber-user-uri": uri,
                    "notify-subscription-id": integer(1, MAX),
                    "subscription-uuid": uri,
                };
                attributes["Subscription Template"] = {
                    "notify-attributes": setof(keyword),
                    "notify-attributes-supported": setof(keyword),
                    "notify-charset": charset,
                    "notify-events": setof(keyword),
                    "notify-events-default": setof(keyword),
                    "notify-events-supported": setof(keyword),
                    "notify-lease-duration": integer(0, 67108863),
                    "notify-lease-duration-default": integer(0, 67108863),
                    "notify-lease-duration-supported": setof(
                        _(integer(0, 67108863), rangeOfInteger(0, 67108863))
                    ),
                    "notify-max-events-supported": integer(2, MAX),
                    "notify-natural-language": naturalLanguage,
                    "notify-pull-method": keyword,
                    "notify-pull-method-supported": setof(keyword),
                    "notify-recipient-uri": uri,
                    "notify-schemes-supported": setof(uriScheme),
                    "notify-time-interval": integer(0, MAX),
                    "notify-user-data": octetString(63),
                };

                // Convert all the syntactical sugar to an object tree
                function resolve(obj) {
                    if (obj.type) return obj;
                    Object.keys(obj).forEach(function (name) {
                        var item = obj[name];
                        if (typeof item === "function") obj[name] = item();
                        else if (typeof item === "object" && !item.type)
                            obj[name] = resolve(item);
                    });
                    return obj;
                }
                resolve(attributes);

                module.exports = attributes;
                // Console.log("var x = ",JSON.stringify(attributes, null, '\t'));
            },
            {"./tags": 12},
        ],
        4: [
            function (require, module, exports) {
                var xref = require("./ipputil").xref;
                var enums = {
                    "document-state": xref([
                        ,
                        ,
                        ,
                        // ftp://ftp.pwg.org/pub/pwg/candidates/cs-ippdocobject10-20031031-5100.5.pdf
                        // 0x00-0x02
                        "pending", // 0x03 // 0x04
                        ,
                        "processing", // 0x05 // 0x06
                        ,
                        "canceled", // 0x07
                        "aborted", // 0x08
                        "completed", // 0x09
                    ]),
                    finishings: xref([
                        ,
                        ,
                        ,
                        // 0x00 - 0x02
                        "none", // 0x03 http://tools.ietf.org/html/rfc2911#section-4.2.6
                        "staple", // 0x04 http://tools.ietf.org/html/rfc2911#section-4.2.6
                        "punch", // 0x05 http://tools.ietf.org/html/rfc2911#section-4.2.6
                        "cover", // 0x06 http://tools.ietf.org/html/rfc2911#section-4.2.6
                        "bind", // 0x07 http://tools.ietf.org/html/rfc2911#section-4.2.6
                        "saddle-stitch", // 0x08 http://tools.ietf.org/html/rfc2911#section-4.2.6
                        "edge-stitch", // 0x09 http://tools.ietf.org/html/rfc2911#section-4.2.6
                        "fold", // 0x0A http://tools.ietf.org/html/rfc2911#section-4.2.6
                        "trim", // 0x0B ftp://ftp.pwg.org/pub/pwg/ipp/new_VAL/pwg5100.1.pdf
                        "bale", // 0x0C ftp://ftp.pwg.org/pub/pwg/ipp/new_VAL/pwg5100.1.pdf
                        "booklet-maker", // 0x0D ftp://ftp.pwg.org/pub/pwg/ipp/new_VAL/pwg5100.1.pdf
                        "jog-offset", // 0x0E ftp://ftp.pwg.org/pub/pwg/ipp/new_VAL/pwg5100.1.pdf // 0x0F - 0x13 reserved for future generic finishing enum values.
                        ,
                        ,
                        ,
                        ,
                        ,
                        "staple-top-left", // 0x14 http://tools.ietf.org/html/rfc2911#section-4.2.6
                        "staple-bottom-left", // 0x15 http://tools.ietf.org/html/rfc2911#section-4.2.6
                        "staple-top-right", // 0x16 http://tools.ietf.org/html/rfc2911#section-4.2.6
                        "staple-bottom-right", // 0x17 http://tools.ietf.org/html/rfc2911#section-4.2.6
                        "edge-stitch-left", // 0x18 http://tools.ietf.org/html/rfc2911#section-4.2.6
                        "edge-stitch-top", // 0x19 http://tools.ietf.org/html/rfc2911#section-4.2.6
                        "edge-stitch-right", // 0x1A http://tools.ietf.org/html/rfc2911#section-4.2.6
                        "edge-stitch-bottom", // 0x1B http://tools.ietf.org/html/rfc2911#section-4.2.6
                        "staple-dual-left", // 0x1C http://tools.ietf.org/html/rfc2911#section-4.2.6
                        "staple-dual-top", // 0x1D http://tools.ietf.org/html/rfc2911#section-4.2.6
                        "staple-dual-right", // 0x1E http://tools.ietf.org/html/rfc2911#section-4.2.6
                        "staple-dual-bottom", // 0x1F http://tools.ietf.org/html/rfc2911#section-4.2.6 // 0x20 - 0x31 reserved for future specific stapling and stitching enum values.
                        ,
                        ,
                        ,
                        ,
                        ,
                        ,
                        ,
                        ,
                        ,
                        ,
                        ,
                        ,
                        ,
                        ,
                        ,
                        ,
                        ,
                        ,
                        "bind-left", // 0x32 ftp://ftp.pwg.org/pub/pwg/ipp/new_VAL/pwg5100.1.pdf
                        "bind-top", // 0x33 ftp://ftp.pwg.org/pub/pwg/ipp/new_VAL/pwg5100.1.pdf
                        "bind-right", // 0x34 ftp://ftp.pwg.org/pub/pwg/ipp/new_VAL/pwg5100.1.pdf
                        "bind-bottom", // 0x35 ftp://ftp.pwg.org/pub/pwg/ipp/new_VAL/pwg5100.1.pdf // 0x36 - 0x3B
                        ,
                        ,
                        ,
                        ,
                        ,
                        ,
                        "trim-after-pages", // 0x3C ftp://ftp.pwg.org/pub/pwg/candidates/cs-ippjobprinterext3v10-20120727-5100.13.pdf (IPP Everywhere)
                        "trim-after-documents", // 0x3D ftp://ftp.pwg.org/pub/pwg/candidates/cs-ippjobprinterext3v10-20120727-5100.13.pdf (IPP Everywhere)
                        "trim-after-copies", // 0x3E ftp://ftp.pwg.org/pub/pwg/candidates/cs-ippjobprinterext3v10-20120727-5100.13.pdf (IPP Everywhere)
                        "trim-after-job", // 0x3F ftp://ftp.pwg.org/pub/pwg/candidates/cs-ippjobprinterext3v10-20120727-5100.13.pdf (IPP Everywhere)
                    ]),
                    "operations-supported": xref([
                        ,
                        ,
                        // 0x00
                        // 0x01
                        "Print-Job", // 0x02 http://tools.ietf.org/html/rfc2911#section-3.2.1
                        "Print-URI", // 0x03 http://tools.ietf.org/html/rfc2911#section-3.2.2
                        "Validate-Job", // 0x04 http://tools.ietf.org/html/rfc2911#section-3.2.3
                        "Create-Job", // 0x05 http://tools.ietf.org/html/rfc2911#section-3.2.4
                        "Send-Document", // 0x06 http://tools.ietf.org/html/rfc2911#section-3.3.1
                        "Send-URI", // 0x07 http://tools.ietf.org/html/rfc2911#section-3.3.2
                        "Cancel-Job", // 0x08 http://tools.ietf.org/html/rfc2911#section-3.3.3
                        "Get-Job-Attributes", // 0x09 http://tools.ietf.org/html/rfc2911#section-3.3.4
                        "Get-Jobs", // 0x0A http://tools.ietf.org/html/rfc2911#section-3.2.6
                        "Get-Printer-Attributes", // 0x0B http://tools.ietf.org/html/rfc2911#section-3.2.5
                        "Hold-Job", // 0x0C http://tools.ietf.org/html/rfc2911#section-3.3.5
                        "Release-Job", // 0x0D http://tools.ietf.org/html/rfc2911#section-3.3.6
                        "Restart-Job", // 0x0E http://tools.ietf.org/html/rfc2911#section-3.3.7 // 0x0F
                        ,
                        "Pause-Printer", // 0x10 http://tools.ietf.org/html/rfc2911#section-3.2.7
                        "Resume-Printer", // 0x11 http://tools.ietf.org/html/rfc2911#section-3.2.8
                        "Purge-Jobs", // 0x12 http://tools.ietf.org/html/rfc2911#section-3.2.9
                        "Set-Printer-Attributes", // 0x13 IPP2.1 http://tools.ietf.org/html/rfc3380#section-4.1
                        "Set-Job-Attributes", // 0x14 IPP2.1 http://tools.ietf.org/html/rfc3380#section-4.2
                        "Get-Printer-Supported-Values", // 0x15 IPP2.1 http://tools.ietf.org/html/rfc3380#section-4.3
                        "Create-Printer-Subscriptions", // 0x16 IPP2.1 http://tools.ietf.org/html/rfc3995#section-7.1 && http://tools.ietf.org/html/rfc3995#section-11.1.2
                        "Create-Job-Subscription", // 0x17 IPP2.1 http://tools.ietf.org/html/rfc3995#section-7.1 && http://tools.ietf.org/html/rfc3995#section-11.1.1
                        "Get-Subscription-Attributes", // 0x18 IPP2.1 http://tools.ietf.org/html/rfc3995#section-7.1 && http://tools.ietf.org/html/rfc3995#section-11.2.4
                        "Get-Subscriptions", // 0x19 IPP2.1 http://tools.ietf.org/html/rfc3995#section-7.1 && http://tools.ietf.org/html/rfc3995#section-11.2.5
                        "Renew-Subscription", // 0x1A IPP2.1 http://tools.ietf.org/html/rfc3995#section-7.1 && http://tools.ietf.org/html/rfc3995#section-11.2.6
                        "Cancel-Subscription", // 0x1B IPP2.1 http://tools.ietf.org/html/rfc3995#section-7.1 && http://tools.ietf.org/html/rfc3995#section-11.2.7
                        "Get-Notifications", // 0x1C IPP2.1 IPP2.1 http://tools.ietf.org/html/rfc3996#section-9.2 && http://tools.ietf.org/html/rfc3996#section-5
                        "ipp-indp-method", // 0x1D did not get standardized
                        "Get-Resource-Attributes", // 0x1E http://tools.ietf.org/html/draft-ietf-ipp-get-resource-00#section-4.1 did not get standardized
                        "Get-Resource-Data", // 0x1F http://tools.ietf.org/html/draft-ietf-ipp-get-resource-00#section-4.2 did not get standardized
                        "Get-Resources", // 0x20 http://tools.ietf.org/html/draft-ietf-ipp-get-resource-00#section-4.3 did not get standardized
                        "ipp-install", // 0x21 did not get standardized
                        "Enable-Printer", // 0x22 http://tools.ietf.org/html/rfc3998#section-3.1.1
                        "Disable-Printer", // 0x23 http://tools.ietf.org/html/rfc3998#section-3.1.2
                        "Pause-Printer-After-Current-Job", // 0x24 http://tools.ietf.org/html/rfc3998#section-3.2.1
                        "Hold-New-Jobs", // 0x25 http://tools.ietf.org/html/rfc3998#section-3.3.1
                        "Release-Held-New-Jobs", // 0x26 http://tools.ietf.org/html/rfc3998#section-3.3.2
                        "Deactivate-Printer", // 0x27 http://tools.ietf.org/html/rfc3998#section-3.4.1
                        "Activate-Printer", // 0x28 http://tools.ietf.org/html/rfc3998#section-3.4.2
                        "Restart-Printer", // 0x29 http://tools.ietf.org/html/rfc3998#section-3.5.1
                        "Shutdown-Printer", // 0x2A http://tools.ietf.org/html/rfc3998#section-3.5.2
                        "Startup-Printer", // 0x2B http://tools.ietf.org/html/rfc3998#section-3.5.3
                        "Reprocess-Job", // 0x2C http://tools.ietf.org/html/rfc3998#section-4.1
                        "Cancel-Current-Job", // 0x2D http://tools.ietf.org/html/rfc3998#section-4.2
                        "Suspend-Current-Job", // 0x2E http://tools.ietf.org/html/rfc3998#section-4.3.1
                        "Resume-Job", // 0x2F http://tools.ietf.org/html/rfc3998#section-4.3.2
                        "Promote-Job", // 0x30 http://tools.ietf.org/html/rfc3998#section-4.4.1
                        "Schedule-Job-After", // 0x31 http://tools.ietf.org/html/rfc3998#section-4.4.2 // 0x32
                        ,
                        "Cancel-Document", // 0x33 ftp://ftp.pwg.org/pub/pwg/candidates/cs-ippdocobject10-20031031-5100.5.pdf
                        "Get-Document-Attributes", // 0x34 ftp://ftp.pwg.org/pub/pwg/candidates/cs-ippdocobject10-20031031-5100.5.pdf
                        "Get-Documents", // 0x35 ftp://ftp.pwg.org/pub/pwg/candidates/cs-ippdocobject10-20031031-5100.5.pdf
                        "Delete-Document", // 0x36 ftp://ftp.pwg.org/pub/pwg/candidates/cs-ippdocobject10-20031031-5100.5.pdf
                        "Set-Document-Attributes", // 0x37 ftp://ftp.pwg.org/pub/pwg/candidates/cs-ippdocobject10-20031031-5100.5.pdf
                        "Cancel-Jobs", // 0x38 ftp://ftp.pwg.org/pub/pwg/candidates/cs-ippjobprinterext10-20101030-5100.11.pdf
                        "Cancel-My-Jobs", // 0x39 ftp://ftp.pwg.org/pub/pwg/candidates/cs-ippjobprinterext10-20101030-5100.11.pdf
                        "Resubmit-Job", // 0x3A ftp://ftp.pwg.org/pub/pwg/candidates/cs-ippjobprinterext10-20101030-5100.11.pdf
                        "Close-Job", // 0x3B ftp://ftp.pwg.org/pub/pwg/candidates/cs-ippjobprinterext10-20101030-5100.11.pdf
                        "Identify-Printer", // 0x3C ftp://ftp.pwg.org/pub/pwg/candidates/cs-ippjobprinterext3v10-20120727-5100.13.pdf
                        "Validate-Document", // 0x3D ftp://ftp.pwg.org/pub/pwg/candidates/cs-ippjobprinterext3v10-20120727-5100.13.pdf
                    ]),
                    "job-collation-type": xref([
                        // IPP2.1 http://tools.ietf.org/html/rfc3381#section-6.3
                        "other", // 0x01
                        "unknown", // 0x02
                        "uncollated-documents", // 0x03
                        "collated-documents", // 0x04
                        "uncollated-documents", // 0x05
                    ]),
                    "job-state": xref([
                        ,
                        ,
                        ,
                        // http://tools.ietf.org/html/rfc2911#section-4.3.7
                        // 0x00-0x02
                        "pending", // 0x03
                        "pending-held", // 0x04
                        "processing", // 0x05
                        "processing-stopped", // 0x06
                        "canceled", // 0x07
                        "aborted", // 0x08
                        "completed", // 0x09
                    ]),
                    "orientation-requested": xref([
                        ,
                        ,
                        ,
                        // http://tools.ietf.org/html/rfc2911#section-4.2.10
                        // 0x00-0x02
                        "portrait", // 0x03
                        "landscape", // 0x04
                        "reverse-landscape", // 0x05
                        "reverse-portrait", // 0x06
                        "none", // 0x07 ftp://ftp.pwg.org/pub/pwg/candidates/cs-ippjobprinterext3v10-20120727-5100.13.pdf
                    ]),
                    "print-quality": xref([
                        ,
                        ,
                        ,
                        // http://tools.ietf.org/html/rfc2911#section-4.2.13
                        // 0x00-0x02
                        "draft", // 0x03
                        "normal", // 0x04
                        "high", // 0x05
                    ]),
                    "printer-state": xref([
                        ,
                        ,
                        ,
                        // http://tools.ietf.org/html/rfc2911#section-4.4.11
                        // 0x00-0x02
                        "idle", // 0x03
                        "processing", // 0x04
                        "stopped", // 0x05
                    ]),
                };
                enums["finishings-default"] = enums.finishings;
                enums["finishings-ready"] = enums.finishings;
                enums["finishings-supported"] = enums.finishings;
                enums["media-source-feed-orientation"] = enums["orientation-requested"];
                enums["orientation-requested-default"] = enums["orientation-requested"];
                enums["orientation-requested-supported"] =
                    enums["orientation-requested"]; // 1setOf
                enums["print-quality-default"] = enums["print-quality"];
                enums["print-quality-supported"] = enums["print-quality"]; // 1setOf

                module.exports = enums;
            },
            {"./ipputil": 5},
        ],
        5: [
            function (require, module, exports) {
                //  To serialize and deserialize, we need to be able to look
                //  things up by key or by value. This little helper just
                //  converts the arrays to objects and tacks on a 'lookup' property.
                function xref(arr) {
                    var obj = {};
                    arr.forEach(function (item, index) {
                        obj[item] = index;
                    });
                    obj.lookup = arr;
                    return obj;
                }

                exports.xref = xref;

                exports.extend = function extend(destination, source) {
                    for (var property in source) {
                        if (
                            source[property] &&
                            source[property].constructor === Object
                        ) {
                            destination[property] = destination[property] || {};
                            extend(destination[property], source[property]);
                        } else {
                            destination[property] = source[property];
                        }
                    }
                    return destination;
                };
            },
            {},
        ],
        6: [
            function (require, module, exports) {
                var attributes = require("./attributes");

                // The only possible values for the keyword
                function keyword(arr) {
                    arr = arr.slice(0);
                    arr.type = "keyword";
                    return arr;
                }
                // Some values for the keyword- but can include other 'name's
                function keyword_name(arr) {
                    arr = arr.slice(0);
                    arr.type = "keyword | name";
                    return arr;
                }
                // A keyword, name, or empty value
                function keyword_name_novalue(arr) {
                    arr = arr.slice(0);
                    arr.type = "keyword | name | no-value";
                    return arr;
                }
                // A keyword that groups another keyword's values together
                function setof_keyword(arr) {
                    arr = arr.slice(0);
                    arr.type = "1setOf keyword";
                    return arr;
                }
                // A keyword that groups [another keyword's values] or [names] together
                function setof_keyword_name(arr) {
                    arr = arr.slice(0);
                    arr.type = "1setOf keyword | name";
                    return arr;
                }

                // Media is different from the others because it has sub-groups
                var media = {
                    "size name": [
                        "a",
                        "arch-a",
                        "arch-b",
                        "arch-c",
                        "arch-d",
                        "arch-e",
                        "asme_f_28x40in",
                        "b",
                        "c",
                        "choice_iso_a4_210x297mm_na_letter_8.5x11in",
                        "d",
                        "e",
                        "executive",
                        "f",
                        "folio",
                        "invoice",
                        "iso-a0",
                        "iso-a1",
                        "iso-a2",
                        "iso-a3",
                        "iso-a4",
                        "iso-a5",
                        "iso-a6",
                        "iso-a7",
                        "iso-a8",
                        "iso-a9",
                        "iso-a10",
                        "iso-b0",
                        "iso-b1",
                        "iso-b2",
                        "iso-b3",
                        "iso-b4",
                        "iso-b5",
                        "iso-b6",
                        "iso-b7",
                        "iso-b8",
                        "iso-b9",
                        "iso-b10",
                        "iso-c3",
                        "iso-c4",
                        "iso-c5",
                        "iso-c6",
                        "iso-designated-long",
                        "iso_2a0_1189x1682mm",
                        "iso_a0_841x1189mm",
                        "iso_a1_594x841mm",
                        "iso_a1x3_841x1783mm",
                        "iso_a1x4_841x2378mm",
                        "iso_a2_420x594mm",
                        "iso_a2x3_594x1261mm",
                        "iso_a2x4_594x1682mm",
                        "iso_a2x5_594x2102mm",
                        "iso_a3-extra_322x445mm",
                        "iso_a3_297x420mm",
                        "iso_a0x3_1189x2523mm",
                        "iso_a3x3_420x891mm",
                        "iso_a3x4_420x1189mm",
                        "iso_a3x5_420x1486mm",
                        "iso_a3x6_420x1783mm",
                        "iso_a3x7_420x2080mm",
                        "iso_a4-extra_235.5x322.3mm",
                        "iso_a4-tab_225x297mm",
                        "iso_a4_210x297mm",
                        "iso_a4x3_297x630mm",
                        "iso_a4x4_297x841mm",
                        "iso_a4x5_297x1051mm",
                        "iso_a4x6_297x1261mm",
                        "iso_a4x7_297x1471mm",
                        "iso_a4x8_297x1682mm",
                        "iso_a4x9_297x1892mm",
                        "iso_a5-extra_174x235mm",
                        "iso_a5_148x210mm",
                        "iso_a6_105x148mm",
                        "iso_a7_74x105mm",
                        "iso_a8_52x74mm",
                        "iso_a9_37x52mm",
                        "iso_a10_26x37mm",
                        "iso_b0_1000x1414mm",
                        "iso_b1_707x1000mm",
                        "iso_b2_500x707mm",
                        "iso_b3_353x500mm",
                        "iso_b4_250x353mm",
                        "iso_b5-extra_201x276mm",
                        "iso_b5_176x250mm",
                        "iso_b6_125x176mm",
                        "iso_b6c4_125x324mm",
                        "iso_b7_88x125mm",
                        "iso_b8_62x88mm",
                        "iso_b9_44x62mm",
                        "iso_b10_31x44mm",
                        "iso_c0_917x1297mm",
                        "iso_c1_648x917mm",
                        "iso_c2_458x648mm",
                        "iso_c3_324x458mm",
                        "iso_c4_229x324mm",
                        "iso_c5_162x229mm",
                        "iso_c6_114x162mm",
                        "iso_c6c5_114x229mm",
                        "iso_c7_81x114mm",
                        "iso_c7c6_81x162mm",
                        "iso_c8_57x81mm",
                        "iso_c9_40x57mm",
                        "iso_c10_28x40mm",
                        "iso_dl_110x220mm",
                        "iso_ra0_860x1220mm",
                        "iso_ra1_610x860mm",
                        "iso_ra2_430x610mm",
                        "iso_sra0_900x1280mm",
                        "iso_sra1_640x900mm",
                        "iso_sra2_450x640mm",
                        "jis-b0",
                        "jis-b1",
                        "jis-b2",
                        "jis-b3",
                        "jis-b4",
                        "jis-b5",
                        "jis-b6",
                        "jis-b7",
                        "jis-b8",
                        "jis-b9",
                        "jis-b10",
                        "jis_b0_1030x1456mm",
                        "jis_b1_728x1030mm",
                        "jis_b2_515x728mm",
                        "jis_b3_364x515mm",
                        "jis_b4_257x364mm",
                        "jis_b5_182x257mm",
                        "jis_b6_128x182mm",
                        "jis_b7_91x128mm",
                        "jis_b8_64x91mm",
                        "jis_b9_45x64mm",
                        "jis_b10_32x45mm",
                        "jis_exec_216x330mm",
                        "jpn_chou2_111.1x146mm",
                        "jpn_chou3_120x235mm",
                        "jpn_chou4_90x205mm",
                        "jpn_hagaki_100x148mm",
                        "jpn_kahu_240x322.1mm",
                        "jpn_kaku2_240x332mm",
                        "jpn_oufuku_148x200mm",
                        "jpn_you4_105x235mm",
                        "ledger",
                        "monarch",
                        "na-5x7",
                        "na-6x9",
                        "na-7x9",
                        "na-8x10",
                        "na-9x11",
                        "na-9x12",
                        "na-10x13",
                        "na-10x14",
                        "na-10x15",
                        "na-legal",
                        "na-letter",
                        "na-number-9",
                        "na-number-10",
                        "na_5x7_5x7in",
                        "na_6x9_6x9in",
                        "na_7x9_7x9in",
                        "na_9x11_9x11in",
                        "na_10x11_10x11in",
                        "na_10x13_10x13in",
                        "na_10x14_10x14in",
                        "na_10x15_10x15in",
                        "na_11x12_11x12in",
                        "na_11x15_11x15in",
                        "na_12x19_12x19in",
                        "na_a2_4.375x5.75in",
                        "na_arch-a_9x12in",
                        "na_arch-b_12x18in",
                        "na_arch-c_18x24in",
                        "na_arch-d_24x36in",
                        "na_arch-e_36x48in",
                        "na_b-plus_12x19.17in",
                        "na_c5_6.5x9.5in",
                        "na_c_17x22in",
                        "na_d_22x34in",
                        "na_e_34x44in",
                        "na_edp_11x14in",
                        "na_eur-edp_12x14in",
                        "na_executive_7.25x10.5in",
                        "na_f_44x68in",
                        "na_fanfold-eur_8.5x12in",
                        "na_fanfold-us_11x14.875in",
                        "na_foolscap_8.5x13in",
                        "na_govt-legal_8x13in",
                        "na_govt-letter_8x10in",
                        "na_index-3x5_3x5in",
                        "na_index-4x6-ext_6x8in",
                        "na_index-4x6_4x6in",
                        "na_index-5x8_5x8in",
                        "na_invoice_5.5x8.5in",
                        "na_ledger_11x17in",
                        "na_legal-extra_9.5x15in",
                        "na_legal_8.5x14in",
                        "na_letter-extra_9.5x12in",
                        "na_letter-plus_8.5x12.69in",
                        "na_letter_8.5x11in",
                        "na_monarch_3.875x7.5in",
                        "na_number-9_3.875x8.875in",
                        "na_number-10_4.125x9.5in",
                        "na_number-11_4.5x10.375in",
                        "na_number-12_4.75x11in",
                        "na_number-14_5x11.5in",
                        "na_personal_3.625x6.5in",
                        "na_quarto_8.5x10.83in",
                        "na_super-a_8.94x14in",
                        "na_super-b_13x19in",
                        "na_wide-format_30x42in",
                        "om_dai-pa-kai_275x395mm",
                        "om_folio-sp_215x315mm",
                        "om_folio_210x330mm",
                        "om_invite_220x220mm",
                        "om_italian_110x230mm",
                        "om_juuro-ku-kai_198x275mm",
                        "om_large-photo_200x300",
                        "om_pa-kai_267x389mm",
                        "om_postfix_114x229mm",
                        "om_small-photo_100x150mm",
                        "prc_1_102x165mm",
                        "prc_2_102x176mm",
                        "prc_3_125x176mm",
                        "prc_4_110x208mm",
                        "prc_5_110x220mm",
                        "prc_6_120x320mm",
                        "prc_7_160x230mm",
                        "prc_8_120x309mm",
                        "prc_10_324x458mm",
                        "prc_16k_146x215mm",
                        "prc_32k_97x151mm",
                        "quarto",
                        "roc_8k_10.75x15.5in",
                        "roc_16k_7.75x10.75in",
                        "super-b",
                        "tabloid",
                    ],
                    "media name": [
                        "a-translucent",
                        "a-transparent",
                        "a-white",
                        "arch-a-translucent",
                        "arch-a-transparent",
                        "arch-a-white",
                        "arch-axsynchro-translucent",
                        "arch-axsynchro-transparent",
                        "arch-axsynchro-white",
                        "arch-b-translucent",
                        "arch-b-transparent",
                        "arch-b-white",
                        "arch-bxsynchro-translucent",
                        "arch-bxsynchro-transparent",
                        "arch-bxsynchro-white",
                        "arch-c-translucent",
                        "arch-c-transparent",
                        "arch-c-white",
                        "arch-cxsynchro-translucent",
                        "arch-cxsynchro-transparent",
                        "arch-cxsynchro-white",
                        "arch-d-translucent",
                        "arch-d-transparent",
                        "arch-d-white",
                        "arch-dxsynchro-translucent",
                        "arch-dxsynchro-transparent",
                        "arch-dxsynchro-white",
                        "arch-e-translucent",
                        "arch-e-transparent",
                        "arch-e-white",
                        "arch-exsynchro-translucent",
                        "arch-exsynchro-transparent",
                        "arch-exsynchro-white",
                        "auto-fixed-size-translucent",
                        "auto-fixed-size-transparent",
                        "auto-fixed-size-white",
                        "auto-synchro-translucent",
                        "auto-synchro-transparent",
                        "auto-synchro-white",
                        "auto-translucent",
                        "auto-transparent",
                        "auto-white",
                        "axsynchro-translucent",
                        "axsynchro-transparent",
                        "axsynchro-white",
                        "b-translucent",
                        "b-transparent",
                        "b-white",
                        "bxsynchro-translucent",
                        "bxsynchro-transparent",
                        "bxsynchro-white",
                        "c-translucent",
                        "c-transparent",
                        "c-white",
                        "custom1",
                        "custom2",
                        "custom3",
                        "custom4",
                        "custom5",
                        "custom6",
                        "custom7",
                        "custom8",
                        "custom9",
                        "custom10",
                        "cxsynchro-translucent",
                        "cxsynchro-transparent",
                        "cxsynchro-white",
                        "d-translucent",
                        "d-transparent",
                        "d-white",
                        "default",
                        "dxsynchro-translucent",
                        "dxsynchro-transparent",
                        "dxsynchro-white",
                        "e-translucent",
                        "e-transparent",
                        "e-white",
                        "executive-white",
                        "exsynchro-translucent",
                        "exsynchro-transparent",
                        "exsynchro-white",
                        "folio-white",
                        "invoice-white",
                        "iso-a0-translucent",
                        "iso-a0-transparent",
                        "iso-a0-white",
                        "iso-a0xsynchro-translucent",
                        "iso-a0xsynchro-transparent",
                        "iso-a0xsynchro-white",
                        "iso-a1-translucent",
                        "iso-a1-transparent",
                        "iso-a1-white",
                        "iso-a1x3-translucent",
                        "iso-a1x3-transparent",
                        "iso-a1x3-white",
                        "iso-a1x4- translucent",
                        "iso-a1x4-transparent",
                        "iso-a1x4-white",
                        "iso-a1xsynchro-translucent",
                        "iso-a1xsynchro-transparent",
                        "iso-a1xsynchro-white",
                        "iso-a2-translucent",
                        "iso-a2-transparent",
                        "iso-a2-white",
                        "iso-a2x3-translucent",
                        "iso-a2x3-transparent",
                        "iso-a2x3-white",
                        "iso-a2x4-translucent",
                        "iso-a2x4-transparent",
                        "iso-a2x4-white",
                        "iso-a2x5-translucent",
                        "iso-a2x5-transparent",
                        "iso-a2x5-white",
                        "iso-a2xsynchro-translucent",
                        "iso-a2xsynchro-transparent",
                        "iso-a2xsynchro-white",
                        "iso-a3-colored",
                        "iso-a3-translucent",
                        "iso-a3-transparent",
                        "iso-a3-white",
                        "iso-a3x3-translucent",
                        "iso-a3x3-transparent",
                        "iso-a3x3-white",
                        "iso-a3x4-translucent",
                        "iso-a3x4-transparent",
                        "iso-a3x4-white",
                        "iso-a3x5-translucent",
                        "iso-a3x5-transparent",
                        "iso-a3x5-white",
                        "iso-a3x6-translucent",
                        "iso-a3x6-transparent",
                        "iso-a3x6-white",
                        "iso-a3x7-translucent",
                        "iso-a3x7-transparent",
                        "iso-a3x7-white",
                        "iso-a3xsynchro-translucent",
                        "iso-a3xsynchro-transparent",
                        "iso-a3xsynchro-white",
                        "iso-a4-colored",
                        "iso-a4-translucent",
                        "iso-a4-transparent",
                        "iso-a4-white",
                        "iso-a4x3-translucent",
                        "iso-a4x3-transparent",
                        "iso-a4x3-white",
                        "iso-a4x4-translucent",
                        "iso-a4x4-transparent",
                        "iso-a4x4-white",
                        "iso-a4x5-translucent",
                        "iso-a4x5-transparent",
                        "iso-a4x5-white",
                        "iso-a4x6-translucent",
                        "iso-a4x6-transparent",
                        "iso-a4x6-white",
                        "iso-a4x7-translucent",
                        "iso-a4x7-transparent",
                        "iso-a4x7-white",
                        "iso-a4x8-translucent",
                        "iso-a4x8-transparent",
                        "iso-a4x8-white",
                        "iso-a4x9-translucent",
                        "iso-a4x9-transparent",
                        "iso-a4x9-white",
                        "iso-a4xsynchro-translucent",
                        "iso-a4xsynchro-transparent",
                        "iso-a4xsynchro-white",
                        "iso-a5-colored",
                        "iso-a5-translucent",
                        "iso-a5-transparent",
                        "iso-a5-white",
                        "iso-a6-white",
                        "iso-a7-white",
                        "iso-a8-white",
                        "iso-a9-white",
                        "iso-a10-white",
                        "iso-b0-white",
                        "iso-b1-white",
                        "iso-b2-white",
                        "iso-b3-white",
                        "iso-b4-colored",
                        "iso-b4-white",
                        "iso-b5-colored",
                        "iso-b5-white",
                        "iso-b6-white",
                        "iso-b7-white",
                        "iso-b8-white",
                        "iso-b9-white",
                        "iso-b10-white",
                        "jis-b0-translucent",
                        "jis-b0-transparent",
                        "jis-b0-white",
                        "jis-b1-translucent",
                        "jis-b1-transparent",
                        "jis-b1-white",
                        "jis-b2-translucent",
                        "jis-b2-transparent",
                        "jis-b2-white",
                        "jis-b3-translucent",
                        "jis-b3-transparent",
                        "jis-b3-white",
                        "jis-b4-colored",
                        "jis-b4-translucent",
                        "jis-b4-transparent",
                        "jis-b4-white",
                        "jis-b5-colored",
                        "jis-b5-translucent",
                        "jis-b5-transparent",
                        "jis-b5-white",
                        "jis-b6-white",
                        "jis-b7-white",
                        "jis-b8-white",
                        "jis-b9-white",
                        "jis-b10-white",
                        "ledger-white",
                        "na-legal-colored",
                        "na-legal-white",
                        "na-letter-colored",
                        "na-letter-transparent",
                        "na-letter-white",
                        "quarto-white",
                    ],
                    "media type": [
                        "bond",
                        "heavyweight",
                        "labels",
                        "letterhead",
                        "plain",
                        "pre-printed",
                        "pre-punched",
                        "recycled",
                        "transparency",
                    ],
                    "input tray": [
                        "bottom",
                        "by-pass-tray",
                        "envelope",
                        "large-capacity",
                        "main",
                        "manual",
                        "middle",
                        "side",
                        "top",
                        "tray-1",
                        "tray-2",
                        "tray-3",
                        "tray-4",
                        "tray-5",
                        "tray-6",
                        "tray-7",
                        "tray-8",
                        "tray-9",
                        "tray-10",
                    ],
                    "envelope name": [
                        "iso-b4-envelope",
                        "iso-b5-envelope",
                        "iso-c3-envelope",
                        "iso-c4-envelope",
                        "iso-c5-envelope",
                        "iso-c6-envelope",
                        "iso-designated-long-envelope",
                        "monarch-envelope",
                        "na-6x9-envelope",
                        "na-7x9-envelope",
                        "na-9x11-envelope",
                        "na-9x12-envelope",
                        "na-10x13-envelope",
                        "na-10x14-envelope",
                        "na-10x15-envelope",
                        "na-number-9-envelope",
                        "na-number-10-envelope",
                    ],
                };

                var Job_Template_attribute_names = Object.keys(
                    attributes["Job Template"]
                );
                var Job_Template_and_Operation_attribute_names =
                    Job_Template_attribute_names.concat(
                        Object.keys(attributes.Operation)
                    );
                var Printer_attribute_names = Object.keys(
                    attributes["Job Template"]
                ).concat(["none"]);
                var media_name_or_size = media["media name"].concat(media["size name"]);

                var keywords = {};
                keywords.compression = keyword(["compress", "deflate", "gzip", "none"]);
                keywords["compression-supported"] = setof_keyword(keywords.compression);
                keywords["cover-back-supported"] = setof_keyword([
                    "cover-type",
                    "media",
                    "media-col",
                ]);
                keywords["cover-front-supported"] = setof_keyword(
                    keywords["cover-back-supported"]
                );
                keywords["cover-type"] = keyword([
                    "no-cover",
                    "print-back",
                    "print-both",
                    "print-front",
                    "print-none",
                ]);
                keywords["document-digital-signature"] = keyword([
                    "dss",
                    "none",
                    "pgp",
                    "smime",
                    "xmldsig",
                ]);
                keywords["document-digital-signature-default"] = keyword(
                    keywords["document-digital-signature"]
                );
                keywords["document-digital-signature-supported"] = setof_keyword(
                    keywords["document-digital-signature"]
                );
                keywords["document-format-details-supported"] = setof_keyword([
                    "document-format",
                    "document-format-device-id",
                    "document-format-version",
                    "document-natural-language",
                    "document-source-application-name",
                    "document-source-application-version",
                    "document-source-os-name",
                    "document-source-os-version",
                ]);
                keywords["document-format-varying-attributes"] = setof_keyword(
                    // Any Printer attribute keyword name
                    Printer_attribute_names
                );
                keywords["document-state-reasons"] = setof_keyword([
                    "aborted-by-system",
                    "canceled-at-device",
                    "canceled-by-operator",
                    "canceled-by-user",
                    "completed-successfully",
                    "completed-with-errors",
                    "completed-with-warnings",
                    "compression-error",
                    "data-insufficient",
                    "digital-signature-did-not-verify",
                    "digital-signature-type-not-supported",
                    "digital-signature-wait",
                    "document-access-error",
                    "document-format-error",
                    "document-password-error",
                    "document-permission-error",
                    "document-security-error",
                    "document-unprintable-error",
                    "errors-detected",
                    "incoming",
                    "interpreting",
                    "none",
                    "outgoing",
                    "printing",
                    "processing-to-stop-point",
                    "queued",
                    "queued-for-marker",
                    "queued-in-device",
                    "resources-are-not-ready",
                    "resources-are-not-supported",
                    "submission-interrupted",
                    "transforming",
                    "unsupported-compression",
                    "unsupported-document-format",
                    "warnings-detected",
                ]);
                keywords["feed-orientation"] = keyword([
                    "long-edge-first",
                    "short-edge-first",
                ]);
                keywords["feed-orientation-supported"] = setof_keyword(
                    keywords["feed-orientation"]
                );
                keywords["finishings-col-supported"] = setof_keyword([
                    "finishing-template",
                    "stitching",
                ]);
                keywords["identify-actions"] = setof_keyword([
                    "display",
                    "flash",
                    "sound",
                    "speak",
                ]);
                keywords["identify-actions-default"] = setof_keyword(
                    keywords["identify-actions"]
                );
                keywords["identify-actions-supported"] = setof_keyword(
                    keywords["identify-actions"]
                );
                keywords["imposition-template"] = keyword_name(["none", "signature"]);
                keywords["ipp-features-supported"] = setof_keyword([
                    "document-object",
                    "ipp-everywhere",
                    "job-save",
                    "none",
                    "page-overrides",
                    "proof-print",
                    "subscription-object",
                ]);
                keywords["ipp-versions-supported"] = setof_keyword([
                    "1.0",
                    "1.1",
                    "2.0",
                    "2.1",
                    "2.2",
                ]);
                keywords["job-accounting-sheets-type"] = keyword_name([
                    "none",
                    "standard",
                ]);
                keywords["job-cover-back-supported"] = setof_keyword(
                    keywords["cover-back-supported"]
                );
                keywords["job-cover-front-supported"] = setof_keyword(
                    keywords["cover-front-supported"]
                );
                keywords["job-creation-attributes-supported"] = setof_keyword(
                    //  Any Job Template attribute
                    //  Any job creation Operation attribute keyword name
                    Job_Template_and_Operation_attribute_names
                );
                keywords["job-error-action"] = keyword([
                    "abort-job",
                    "cancel-job",
                    "continue-job",
                    "suspend-job",
                ]);
                keywords["job-error-action-default"] = keyword(
                    keywords["job-error-action"]
                );
                keywords["job-error-action-supported"] = setof_keyword(
                    keywords["job-error-action"]
                );
                keywords["job-error-sheet-type"] = keyword_name(["none", "standard"]);
                keywords["job-error-sheet-when"] = keyword(["always", "on-error"]);
                keywords["job-finishings-col-supported"] = setof_keyword(
                    keywords["finishings-col-supported"]
                );
                keywords["job-hold-until"] = keyword_name([
                    "day-time",
                    "evening",
                    "indefinite",
                    "night",
                    "no-hold",
                    "second-shift",
                    "third-shift",
                    "weekend",
                ]);
                keywords["job-hold-until-default"] = keyword_name(
                    keywords["job-hold-until"]
                );
                keywords["job-hold-until-supported"] = setof_keyword_name(
                    keywords["job-hold-until"]
                );
                keywords["job-mandatory-attributes"] = setof_keyword(
                    //  Any Job Template attribute
                    Job_Template_attribute_names
                );
                keywords["job-password-encryption"] = keyword_name([
                    "md2",
                    "md4",
                    "md5",
                    "none",
                    "sha",
                ]);
                keywords["job-password-encryption-supported"] = setof_keyword_name(
                    keywords["job-password-encryption"]
                );
                keywords["job-save-disposition-supported"] = setof_keyword([
                    "save-disposition",
                    "save-info",
                ]);
                keywords["job-settable-attributes-supported"] = setof_keyword(
                    //  Any Job Template attribute
                    Job_Template_attribute_names
                );
                keywords["job-sheets"] = keyword_name([
                    "first-print-stream-page",
                    "job-both-sheet",
                    "job-end-sheet",
                    "job-start-sheet",
                    "none",
                    "standard",
                ]);
                keywords["job-sheets-default"] = keyword_name(keywords["job-sheets"]);
                keywords["job-sheets-supported"] = setof_keyword_name(
                    keywords["job-sheets"]
                );
                keywords["job-spooling-supported"] = keyword([
                    "automatic",
                    "spool",
                    "stream",
                ]);
                keywords["job-state-reasons"] = setof_keyword([
                    "aborted-by-system",
                    "compression-error",
                    "digital-signature-did-not-verify",
                    "digital-signature-type-not-supported",
                    "document-access-error",
                    "document-format-error",
                    "document-password-error",
                    "document-permission-error",
                    "document-security-error",
                    "document-unprintable-error",
                    "errors-detected",
                    "job-canceled-at-device",
                    "job-canceled-by-operator",
                    "job-canceled-by-user",
                    "job-completed-successfully",
                    "job-completed-with-errors",
                    "job-completed-with-warnings",
                    "job-data-insufficient",
                    "job-delay-output-until-specified",
                    "job-digital-signature-wait",
                    "job-hold-until-specified",
                    "job-incoming",
                    "job-interpreting",
                    "job-outgoing",
                    "job-password-wait",
                    "job-printed-successfully",
                    "job-printed-with-errors",
                    "job-printed-with-warnings",
                    "job-printing",
                    "job-queued",
                    "job-queued-for-marker",
                    "job-restartable",
                    "job-resuming",
                    "job-saved-successfully",
                    "job-saved-with-errors",
                    "job-saved-with-warnings",
                    "job-saving",
                    "job-spooling",
                    "job-streaming",
                    "job-suspended",
                    "job-suspended-by-operator",
                    "job-suspended-by-system",
                    "job-suspended-by-user",
                    "job-suspending",
                    "job-transforming",
                    "none",
                    "printer-stopped",
                    "printer-stopped-partly",
                    "processing-to-stop-point",
                    "queued-in-device",
                    "resources-are-not-ready",
                    "resources-are-not-supported",
                    "service-off-line",
                    "submission-interrupted",
                    "unsupported-compression",
                    "unsupported-document-format",
                    "warnings-detected",
                ]);
                keywords.media = keyword_name(
                    [].concat(
                        media["size name"],
                        media["media name"],
                        media["media type"],
                        media["input tray"],
                        media["envelope name"]
                    )
                );
                keywords["media-back-coating"] = keyword_name([
                    "glossy",
                    "high-gloss",
                    "matte",
                    "none",
                    "satin",
                    "semi-gloss",
                ]);
                keywords["media-back-coating-supported"] = setof_keyword_name(
                    keywords["media-back-coating"]
                );
                keywords["media-col-supported"] = setof_keyword([
                    "media-bottom-margin",
                    "media-left-margin",
                    "media-right-margin",
                    "media-size-name",
                    "media-source",
                    "media-top-margin",
                ]);
                keywords["media-color"] = keyword_name([
                    "blue",
                    "buff",
                    "goldenrod",
                    "gray",
                    "green",
                    "ivory",
                    "no-color",
                    "orange",
                    "pink",
                    "red",
                    "white",
                    "yellow",
                ]);
                keywords["media-color-supported"] = setof_keyword_name(
                    keywords["media-color"]
                );
                keywords["media-default"] = keyword_name_novalue(keywords.media);
                keywords["media-front-coating"] = keyword_name(
                    keywords["media-back-coating"]
                );
                keywords["media-front-coating-supported"] = setof_keyword_name(
                    keywords["media-back-coating"]
                );
                keywords["media-grain"] = keyword_name(["x-direction", "y-direction"]);
                keywords["media-grain-supported"] = setof_keyword_name(
                    keywords["media-grain"]
                );
                keywords["media-input-tray-check"] = keyword_name([
                    media["input tray"],
                ]);
                keywords["media-input-tray-check-default"] = keyword_name([
                    media["input tray"],
                ]);
                keywords["media-input-tray-check-supported"] = setof_keyword_name(
                    media["input tray"]
                );
                keywords["media-key"] = keyword_name(
                    //  Any "media" media or size keyword value
                    media_name_or_size
                );
                keywords["media-key-supported"] = setof_keyword_name([
                    //  Any "media" media or size keyword value
                    media_name_or_size,
                ]);
                keywords["media-pre-printed"] = keyword_name([
                    "blank",
                    "letter-head",
                    "pre-printed",
                ]);
                keywords["media-pre-printed-supported"] = keyword_name(
                    keywords["media-pre-printed"]
                );
                keywords["media-ready"] = setof_keyword_name([
                    //  Any "media" media or size keyword value
                    media_name_or_size,
                ]);
                keywords["media-recycled"] = keyword_name(["none", "standard"]);
                keywords["media-recycled-supported"] = keyword_name(
                    keywords["media-recycled"]
                );
                keywords["media-source"] = keyword_name([
                    "alternate",
                    "alternate-roll",
                    "auto",
                    "bottom",
                    "by-pass-tray",
                    "center",
                    "disc",
                    "envelope",
                    "hagaki",
                    "large-capacity",
                    "left",
                    "main",
                    "main-roll",
                    "manual",
                    "middle",
                    "photo",
                    "rear",
                    "right",
                    "roll-1",
                    "roll-2",
                    "roll-3",
                    "roll-4",
                    "roll-5",
                    "roll-6",
                    "roll-7",
                    "roll-8",
                    "roll-9",
                    "roll-10",
                    "side",
                    "top",
                    "tray-1",
                    "tray-2",
                    "tray-3",
                    "tray-4",
                    "tray-5",
                    "tray-6",
                    "tray-7",
                    "tray-8",
                    "tray-9",
                    "tray-10",
                    "tray-11",
                    "tray-12",
                    "tray-13",
                    "tray-14",
                    "tray-15",
                    "tray-16",
                    "tray-17",
                    "tray-18",
                    "tray-19",
                    "tray-20",
                ]);
                keywords["media-source-feed-direction"] = keyword(
                    keywords["feed-orientation"]
                );
                keywords["media-source-supported"] = setof_keyword_name(
                    keywords["media-source"]
                );
                keywords["media-supported"] = setof_keyword_name(keywords.media);
                keywords["media-tooth"] = keyword_name([
                    "antique",
                    "calendared",
                    "coarse",
                    "fine",
                    "linen",
                    "medium",
                    "smooth",
                    "stipple",
                    "uncalendared",
                    "vellum",
                ]);
                keywords["media-tooth-supported"] = setof_keyword_name(
                    keywords["media-tooth"]
                );
                keywords["media-type"] = keyword_name([
                    "aluminum",
                    "back-print-film",
                    "cardboard",
                    "cardstock",
                    "cd",
                    "continuous",
                    "continuous-long",
                    "continuous-short",
                    "corrugated-board",
                    "disc",
                    "double-wall",
                    "dry-film",
                    "dvd",
                    "embossing-foil",
                    "end-board",
                    "envelope",
                    "envelope-plain",
                    "envelope-window",
                    "film",
                    "flexo-base",
                    "flexo-photo-polymer",
                    "flute",
                    "foil",
                    "full-cut-tabs",
                    "gravure-cylinder",
                    "image-setter-paper",
                    "imaging-cylinder",
                    "labels",
                    "laminating-foil",
                    "letterhead",
                    "mounting-tape",
                    "multi-layer",
                    "multi-part-form",
                    "other",
                    "paper",
                    "photographic",
                    "photographic-film",
                    "photographic-glossy",
                    "photographic-high-gloss",
                    "photographic-matte",
                    "photographic-satin",
                    "photographic-semi-gloss",
                    "plate",
                    "polyester",
                    "pre-cut-tabs",
                    "roll",
                    "screen",
                    "screen-paged",
                    "self-adhesive",
                    "shrink-foil",
                    "single-face",
                    "single-wall",
                    "sleeve",
                    "stationery",
                    "stationery-coated",
                    "stationery-fine",
                    "stationery-heavyweight",
                    "stationery-inkjet",
                    "stationery-letterhead",
                    "stationery-lightweight",
                    "stationery-preprinted",
                    "stationery-prepunched",
                    "tab-stock",
                    "tractor",
                    "transparency",
                    "triple-wall",
                    "wet-film",
                ]);
                keywords["media-type-supported"] = setof_keyword_name(
                    keywords["media-type"]
                );
                keywords["multiple-document-handling"] = keyword([
                    "separate-documents-collated-copies",
                    "separate-documents-uncollated-copies",
                    "single-document",
                    "single-document-new-sheet",
                ]);
                keywords["multiple-document-handling-default"] = keyword(
                    keywords["multiple-document-handling"]
                );
                keywords["multiple-document-handling-supported"] = setof_keyword(
                    keywords["multiple-document-handling"]
                );
                keywords["multiple-operation-timeout-action"] = keyword([
                    "abort-job",
                    "hold-job",
                    "process-job",
                ]);
                keywords["notify-events"] = setof_keyword([
                    "job-completed",
                    "job-config-changed",
                    "job-created",
                    "job-progress",
                    "job-state-changed",
                    "job-stopped",
                    "none",
                    "printer-config-changed",
                    "printer-finishings-changed",
                    "printer-media-changed",
                    "printer-queue-order-changed",
                    "printer-restarted",
                    "printer-shutdown",
                    "printer-state-changed",
                    "printer-stopped",
                ]);
                keywords["notify-events-default"] = setof_keyword(
                    keywords["notify-events"]
                );
                keywords["notify-events-supported"] = setof_keyword(
                    keywords["notify-events"]
                );
                keywords["notify-pull-method"] = keyword(["ippget"]);
                keywords["notify-pull-method-supported"] = setof_keyword(
                    keywords["notify-pull-method"]
                );
                keywords["notify-subscribed-event"] = keyword(
                    keywords["notify-events"]
                );
                keywords["output-bin"] = keyword_name([
                    "bottom",
                    "center",
                    "face-down",
                    "face-up",
                    "large-capacity",
                    "left",
                    "mailbox-1",
                    "mailbox-2",
                    "mailbox-3",
                    "mailbox-4",
                    "mailbox-5",
                    "mailbox-6",
                    "mailbox-7",
                    "mailbox-8",
                    "mailbox-9",
                    "mailbox-10",
                    "middle",
                    "my-mailbox",
                    "rear",
                    "right",
                    "side",
                    "stacker-1",
                    "stacker-2",
                    "stacker-3",
                    "stacker-4",
                    "stacker-5",
                    "stacker-6",
                    "stacker-7",
                    "stacker-8",
                    "stacker-9",
                    "stacker-10",
                    "top",
                    "tray-1",
                    "tray-2",
                    "tray-3",
                    "tray-4",
                    "tray-5",
                    "tray-6",
                    "tray-7",
                    "tray-8",
                    "tray-9",
                    "tray-10",
                ]);
                keywords["job-accounting-output-bin"] = keyword_name(
                    keywords["output-bin"]
                );
                keywords["output-bin-default"] = keyword_name(keywords["output-bin"]);
                keywords["output-bin-supported"] = setof_keyword_name(
                    keywords["output-bin"]
                );
                keywords["page-delivery"] = keyword([
                    "reverse-order-face-down",
                    "reverse-order-face-up",
                    "same-order-face-down",
                    "same-order-face-up",
                    "system-specified",
                ]);
                keywords["page-delivery-default"] = keyword(keywords["page-delivery"]);
                keywords["page-delivery-supported"] = setof_keyword(
                    keywords["page-delivery"]
                );
                keywords["page-order-received"] = keyword([
                    "1-to-n-order",
                    "n-to-1-order",
                ]);
                keywords["page-order-received-default"] = keyword(
                    keywords["page-order-received"]
                );
                keywords["page-order-received-supported"] = setof_keyword(
                    keywords["page-order-received"]
                );
                keywords["current-page-order"] = keyword(
                    keywords["page-order-received"]
                );
                keywords["pdl-init-file-supported"] = setof_keyword([
                    "pdl-init-file-entry",
                    "pdl-init-file-location",
                    "pdl-init-file-name",
                ]);
                keywords["pdl-override-supported"] = keyword([
                    "attempted",
                    "guaranteed",
                    "not-attempted",
                ]);
                keywords["presentation-direction-number-up"] = keyword([
                    "tobottom-toleft",
                    "tobottom-toright",
                    "toleft-tobottom",
                    "toleft-totop",
                    "toright-tobottom",
                    "toright-totop",
                    "totop-toleft",
                    "totop-toright",
                ]);
                keywords["presentation-direction-number-up-default"] = keyword(
                    keywords["presentation-direction-number-up"]
                );
                keywords["presentation-direction-number-up-supported"] = setof_keyword(
                    keywords["presentation-direction-number-up"]
                );
                keywords["print-color-mode"] = keyword([
                    "auto",
                    "bi-level",
                    "color",
                    "highlight",
                    "monochrome",
                    "process-bi-level",
                    "process-monochrome",
                ]);
                keywords["print-color-mode-default"] = keyword(
                    keywords["print-color-mode"]
                );
                keywords["print-color-mode-supported"] = setof_keyword(
                    keywords["print-color-mode"]
                );
                keywords["print-content-optimize"] = keyword([
                    "auto",
                    "graphic",
                    "photo",
                    "text",
                    "text-and-graphic",
                ]);
                keywords["print-content-optimize-default"] = keyword(
                    keywords["print-content-optimize"]
                );
                keywords["print-content-optimize-supported"] = setof_keyword(
                    keywords["print-content-optimize"]
                );
                keywords["print-rendering-intent"] = keyword([
                    "absolute",
                    "auto",
                    "perceptual",
                    "relative",
                    "relative-bpc",
                    "saturation",
                ]);
                keywords["print-rendering-intent-default"] = keyword(
                    keywords["print-rendering-intent"]
                );
                keywords["print-rendering-intent-supported"] = setof_keyword(
                    keywords["print-rendering-intent"]
                );
                keywords["printer-get-attributes-supported"] = setof_keyword(
                    //  Any Job Template attribute
                    //  Any job creation Operation attribute keyword name
                    Job_Template_and_Operation_attribute_names
                );
                keywords["printer-mandatory-job-attributes"] = setof_keyword(
                    //	Any Job Template attribute
                    //	Any Operation attribute at the job level
                    // this probably isn't quite right...
                    Job_Template_and_Operation_attribute_names
                );
                keywords["printer-settable-attributes-supported"] = setof_keyword(
                    //  Any read-write Printer attribute keyword name
                    Printer_attribute_names
                );
                keywords["printer-state-reasons"] = setof_keyword([
                    "alert-removal-of-binary-change-entry",
                    "bander-added",
                    "bander-almost-empty",
                    "bander-almost-full",
                    "bander-at-limit",
                    "bander-closed",
                    "bander-configuration-change",
                    "bander-cover-closed",
                    "bander-cover-open",
                    "bander-empty",
                    "bander-full",
                    "bander-interlock-closed",
                    "bander-interlock-open",
                    "bander-jam",
                    "bander-life-almost-over",
                    "bander-life-over",
                    "bander-memory-exhausted",
                    "bander-missing",
                    "bander-motor-failure",
                    "bander-near-limit",
                    "bander-offline",
                    "bander-opened",
                    "bander-over-temperature",
                    "bander-power-saver",
                    "bander-recoverable-failure",
                    "bander-recoverable-storage-error",
                    "bander-removed",
                    "bander-resource-added",
                    "bander-resource-removed",
                    "bander-thermistor-failure",
                    "bander-timing-failure",
                    "bander-turned-off",
                    "bander-turned-on",
                    "bander-under-temperature",
                    "bander-unrecoverable-failure",
                    "bander-unrecoverable-storage-error",
                    "bander-warming-up",
                    "binder-added",
                    "binder-almost-empty",
                    "binder-almost-full",
                    "binder-at-limit",
                    "binder-closed",
                    "binder-configuration-change",
                    "binder-cover-closed",
                    "binder-cover-open",
                    "binder-empty",
                    "binder-full",
                    "binder-interlock-closed",
                    "binder-interlock-open",
                    "binder-jam",
                    "binder-life-almost-over",
                    "binder-life-over",
                    "binder-memory-exhausted",
                    "binder-missing",
                    "binder-motor-failure",
                    "binder-near-limit",
                    "binder-offline",
                    "binder-opened",
                    "binder-over-temperature",
                    "binder-power-saver",
                    "binder-recoverable-failure",
                    "binder-recoverable-storage-error",
                    "binder-removed",
                    "binder-resource-added",
                    "binder-resource-removed",
                    "binder-thermistor-failure",
                    "binder-timing-failure",
                    "binder-turned-off",
                    "binder-turned-on",
                    "binder-under-temperature",
                    "binder-unrecoverable-failure",
                    "binder-unrecoverable-storage-error",
                    "binder-warming-up",
                    "cleaner-life-almost-over",
                    "cleaner-life-over",
                    "configuration-change",
                    "connecting-to-device",
                    "cover-open",
                    "deactivated",
                    "developer-empty",
                    "developer-low",
                    "die-cutter-added",
                    "die-cutter-almost-empty",
                    "die-cutter-almost-full",
                    "die-cutter-at-limit",
                    "die-cutter-closed",
                    "die-cutter-configuration-change",
                    "die-cutter-cover-closed",
                    "die-cutter-cover-open",
                    "die-cutter-empty",
                    "die-cutter-full",
                    "die-cutter-interlock-closed",
                    "die-cutter-interlock-open",
                    "die-cutter-jam",
                    "die-cutter-life-almost-over",
                    "die-cutter-life-over",
                    "die-cutter-memory-exhausted",
                    "die-cutter-missing",
                    "die-cutter-motor-failure",
                    "die-cutter-near-limit",
                    "die-cutter-offline",
                    "die-cutter-opened",
                    "die-cutter-over-temperature",
                    "die-cutter-power-saver",
                    "die-cutter-recoverable-failure",
                    "die-cutter-recoverable-storage-error",
                    "die-cutter-removed",
                    "die-cutter-resource-added",
                    "die-cutter-resource-removed",
                    "die-cutter-thermistor-failure",
                    "die-cutter-timing-failure",
                    "die-cutter-turned-off",
                    "die-cutter-turned-on",
                    "die-cutter-under-temperature",
                    "die-cutter-unrecoverable-failure",
                    "die-cutter-unrecoverable-storage-error",
                    "die-cutter-warming-up",
                    "door-open",
                    "folder-added",
                    "folder-almost-empty",
                    "folder-almost-full",
                    "folder-at-limit",
                    "folder-closed",
                    "folder-configuration-change",
                    "folder-cover-closed",
                    "folder-cover-open",
                    "folder-empty",
                    "folder-full",
                    "folder-interlock-closed",
                    "folder-interlock-open",
                    "folder-jam",
                    "folder-life-almost-over",
                    "folder-life-over",
                    "folder-memory-exhausted",
                    "folder-missing",
                    "folder-motor-failure",
                    "folder-near-limit",
                    "folder-offline",
                    "folder-opened",
                    "folder-over-temperature",
                    "folder-power-saver",
                    "folder-recoverable-failure",
                    "folder-recoverable-storage-error",
                    "folder-removed",
                    "folder-resource-added",
                    "folder-resource-removed",
                    "folder-thermistor-failure",
                    "folder-timing-failure",
                    "folder-turned-off",
                    "folder-turned-on",
                    "folder-under-temperature",
                    "folder-unrecoverable-failure",
                    "folder-unrecoverable-storage-error",
                    "folder-warming-up",
                    "fuser-over-temp",
                    "fuser-under-temp",
                    "imprinter-added",
                    "imprinter-almost-empty",
                    "imprinter-almost-full",
                    "imprinter-at-limit",
                    "imprinter-closed",
                    "imprinter-configuration-change",
                    "imprinter-cover-closed",
                    "imprinter-cover-open",
                    "imprinter-empty",
                    "imprinter-full",
                    "imprinter-interlock-closed",
                    "imprinter-interlock-open",
                    "imprinter-jam",
                    "imprinter-life-almost-over",
                    "imprinter-life-over",
                    "imprinter-memory-exhausted",
                    "imprinter-missing",
                    "imprinter-motor-failure",
                    "imprinter-near-limit",
                    "imprinter-offline",
                    "imprinter-opened",
                    "imprinter-over-temperature",
                    "imprinter-power-saver",
                    "imprinter-recoverable-failure",
                    "imprinter-recoverable-storage-error",
                    "imprinter-removed",
                    "imprinter-resource-added",
                    "imprinter-resource-removed",
                    "imprinter-thermistor-failure",
                    "imprinter-timing-failure",
                    "imprinter-turned-off",
                    "imprinter-turned-on",
                    "imprinter-under-temperature",
                    "imprinter-unrecoverable-failure",
                    "imprinter-unrecoverable-storage-error",
                    "imprinter-warming-up",
                    "input-cannot-feed-size-selected",
                    "input-manual-input-request",
                    "input-media-color-change",
                    "input-media-form-parts-change",
                    "input-media-size-change",
                    "input-media-type-change",
                    "input-media-weight-change",
                    "input-tray-elevation-failure",
                    "input-tray-missing",
                    "input-tray-position-failure",
                    "inserter-added",
                    "inserter-almost-empty",
                    "inserter-almost-full",
                    "inserter-at-limit",
                    "inserter-closed",
                    "inserter-configuration-change",
                    "inserter-cover-closed",
                    "inserter-cover-open",
                    "inserter-empty",
                    "inserter-full",
                    "inserter-interlock-closed",
                    "inserter-interlock-open",
                    "inserter-jam",
                    "inserter-life-almost-over",
                    "inserter-life-over",
                    "inserter-memory-exhausted",
                    "inserter-missing",
                    "inserter-motor-failure",
                    "inserter-near-limit",
                    "inserter-offline",
                    "inserter-opened",
                    "inserter-over-temperature",
                    "inserter-power-saver",
                    "inserter-recoverable-failure",
                    "inserter-recoverable-storage-error",
                    "inserter-removed",
                    "inserter-resource-added",
                    "inserter-resource-removed",
                    "inserter-thermistor-failure",
                    "inserter-timing-failure",
                    "inserter-turned-off",
                    "inserter-turned-on",
                    "inserter-under-temperature",
                    "inserter-unrecoverable-failure",
                    "inserter-unrecoverable-storage-error",
                    "inserter-warming-up",
                    "interlock-closed",
                    "interlock-open",
                    "interpreter-cartridge-added",
                    "interpreter-cartridge-deleted",
                    "interpreter-complex-page-encountered",
                    "interpreter-memory-decrease",
                    "interpreter-memory-increase",
                    "interpreter-resource-added",
                    "interpreter-resource-deleted",
                    "interpreter-resource-unavailable",
                    "make-envelope-added",
                    "make-envelope-almost-empty",
                    "make-envelope-almost-full",
                    "make-envelope-at-limit",
                    "make-envelope-closed",
                    "make-envelope-configuration-change",
                    "make-envelope-cover-closed",
                    "make-envelope-cover-open",
                    "make-envelope-empty",
                    "make-envelope-full",
                    "make-envelope-interlock-closed",
                    "make-envelope-interlock-open",
                    "make-envelope-jam",
                    "make-envelope-life-almost-over",
                    "make-envelope-life-over",
                    "make-envelope-memory-exhausted",
                    "make-envelope-missing",
                    "make-envelope-motor-failure",
                    "make-envelope-near-limit",
                    "make-envelope-offline",
                    "make-envelope-opened",
                    "make-envelope-over-temperature",
                    "make-envelope-power-saver",
                    "make-envelope-recoverable-failure",
                    "make-envelope-recoverable-storage-error",
                    "make-envelope-removed",
                    "make-envelope-resource-added",
                    "make-envelope-resource-removed",
                    "make-envelope-thermistor-failure",
                    "make-envelope-timing-failure",
                    "make-envelope-turned-off",
                    "make-envelope-turned-on",
                    "make-envelope-under-temperature",
                    "make-envelope-unrecoverable-failure",
                    "make-envelope-unrecoverable-storage-error",
                    "make-envelope-warming-up",
                    "marker-adjusting-print-quality",
                    "marker-developer-almost-empty",
                    "marker-developer-empty",
                    "marker-fuser-thermistor-failure",
                    "marker-fuser-timing-failure",
                    "marker-ink-almost-empty",
                    "marker-ink-empty",
                    "marker-print-ribbon-almost-empty",
                    "marker-print-ribbon-empty",
                    "marker-supply-empty",
                    "marker-supply-low",
                    "marker-toner-cartridge-missing",
                    "marker-waste-almost-full",
                    "marker-waste-full",
                    "marker-waste-ink-receptacle-almost-full",
                    "marker-waste-ink-receptacle-full",
                    "marker-waste-toner-receptacle-almost-full",
                    "marker-waste-toner-receptacle-full",
                    "media-empty",
                    "media-jam",
                    "media-low",
                    "media-needed",
                    "media-path-cannot-duplex-media-selected",
                    "media-path-media-tray-almost-full",
                    "media-path-media-tray-full",
                    "media-path-media-tray-missing",
                    "moving-to-paused",
                    "none",
                    "opc-life-over",
                    "opc-near-eol",
                    "other",
                    "output-area-almost-full",
                    "output-area-full",
                    "output-mailbox-select-failure",
                    "output-tray-missing",
                    "paused",
                    "perforater-added",
                    "perforater-almost-empty",
                    "perforater-almost-full",
                    "perforater-at-limit",
                    "perforater-closed",
                    "perforater-configuration-change",
                    "perforater-cover-closed",
                    "perforater-cover-open",
                    "perforater-empty",
                    "perforater-full",
                    "perforater-interlock-closed",
                    "perforater-interlock-open",
                    "perforater-jam",
                    "perforater-life-almost-over",
                    "perforater-life-over",
                    "perforater-memory-exhausted",
                    "perforater-missing",
                    "perforater-motor-failure",
                    "perforater-near-limit",
                    "perforater-offline",
                    "perforater-opened",
                    "perforater-over-temperature",
                    "perforater-power-saver",
                    "perforater-recoverable-failure",
                    "perforater-recoverable-storage-error",
                    "perforater-removed",
                    "perforater-resource-added",
                    "perforater-resource-removed",
                    "perforater-thermistor-failure",
                    "perforater-timing-failure",
                    "perforater-turned-off",
                    "perforater-turned-on",
                    "perforater-under-temperature",
                    "perforater-unrecoverable-failure",
                    "perforater-unrecoverable-storage-error",
                    "perforater-warming-up",
                    "power-down",
                    "power-up",
                    "printer-manual-reset",
                    "printer-nms-reset",
                    "printer-ready-to-print",
                    "puncher-added",
                    "puncher-almost-empty",
                    "puncher-almost-full",
                    "puncher-at-limit",
                    "puncher-closed",
                    "puncher-configuration-change",
                    "puncher-cover-closed",
                    "puncher-cover-open",
                    "puncher-empty",
                    "puncher-full",
                    "puncher-interlock-closed",
                    "puncher-interlock-open",
                    "puncher-jam",
                    "puncher-life-almost-over",
                    "puncher-life-over",
                    "puncher-memory-exhausted",
                    "puncher-missing",
                    "puncher-motor-failure",
                    "puncher-near-limit",
                    "puncher-offline",
                    "puncher-opened",
                    "puncher-over-temperature",
                    "puncher-power-saver",
                    "puncher-recoverable-failure",
                    "puncher-recoverable-storage-error",
                    "puncher-removed",
                    "puncher-resource-added",
                    "puncher-resource-removed",
                    "puncher-thermistor-failure",
                    "puncher-timing-failure",
                    "puncher-turned-off",
                    "puncher-turned-on",
                    "puncher-under-temperature",
                    "puncher-unrecoverable-failure",
                    "puncher-unrecoverable-storage-error",
                    "puncher-warming-up",
                    "separation-cutter-added",
                    "separation-cutter-almost-empty",
                    "separation-cutter-almost-full",
                    "separation-cutter-at-limit",
                    "separation-cutter-closed",
                    "separation-cutter-configuration-change",
                    "separation-cutter-cover-closed",
                    "separation-cutter-cover-open",
                    "separation-cutter-empty",
                    "separation-cutter-full",
                    "separation-cutter-interlock-closed",
                    "separation-cutter-interlock-open",
                    "separation-cutter-jam",
                    "separation-cutter-life-almost-over",
                    "separation-cutter-life-over",
                    "separation-cutter-memory-exhausted",
                    "separation-cutter-missing",
                    "separation-cutter-motor-failure",
                    "separation-cutter-near-limit",
                    "separation-cutter-offline",
                    "separation-cutter-opened",
                    "separation-cutter-over-temperature",
                    "separation-cutter-power-saver",
                    "separation-cutter-recoverable-failure",
                    "separation-cutter-recoverable-storage-error",
                    "separation-cutter-removed",
                    "separation-cutter-resource-added",
                    "separation-cutter-resource-removed",
                    "separation-cutter-thermistor-failure",
                    "separation-cutter-timing-failure",
                    "separation-cutter-turned-off",
                    "separation-cutter-turned-on",
                    "separation-cutter-under-temperature",
                    "separation-cutter-unrecoverable-failure",
                    "separation-cutter-unrecoverable-storage-error",
                    "separation-cutter-warming-up",
                    "sheet-rotator-added",
                    "sheet-rotator-almost-empty",
                    "sheet-rotator-almost-full",
                    "sheet-rotator-at-limit",
                    "sheet-rotator-closed",
                    "sheet-rotator-configuration-change",
                    "sheet-rotator-cover-closed",
                    "sheet-rotator-cover-open",
                    "sheet-rotator-empty",
                    "sheet-rotator-full",
                    "sheet-rotator-interlock-closed",
                    "sheet-rotator-interlock-open",
                    "sheet-rotator-jam",
                    "sheet-rotator-life-almost-over",
                    "sheet-rotator-life-over",
                    "sheet-rotator-memory-exhausted",
                    "sheet-rotator-missing",
                    "sheet-rotator-motor-failure",
                    "sheet-rotator-near-limit",
                    "sheet-rotator-offline",
                    "sheet-rotator-opened",
                    "sheet-rotator-over-temperature",
                    "sheet-rotator-power-saver",
                    "sheet-rotator-recoverable-failure",
                    "sheet-rotator-recoverable-storage-error",
                    "sheet-rotator-removed",
                    "sheet-rotator-resource-added",
                    "sheet-rotator-resource-removed",
                    "sheet-rotator-thermistor-failure",
                    "sheet-rotator-timing-failure",
                    "sheet-rotator-turned-off",
                    "sheet-rotator-turned-on",
                    "sheet-rotator-under-temperature",
                    "sheet-rotator-unrecoverable-failure",
                    "sheet-rotator-unrecoverable-storage-error",
                    "sheet-rotator-warming-up",
                    "shutdown",
                    "slitter-added",
                    "slitter-almost-empty",
                    "slitter-almost-full",
                    "slitter-at-limit",
                    "slitter-closed",
                    "slitter-configuration-change",
                    "slitter-cover-closed",
                    "slitter-cover-open",
                    "slitter-empty",
                    "slitter-full",
                    "slitter-interlock-closed",
                    "slitter-interlock-open",
                    "slitter-jam",
                    "slitter-life-almost-over",
                    "slitter-life-over",
                    "slitter-memory-exhausted",
                    "slitter-missing",
                    "slitter-motor-failure",
                    "slitter-near-limit",
                    "slitter-offline",
                    "slitter-opened",
                    "slitter-over-temperature",
                    "slitter-power-saver",
                    "slitter-recoverable-failure",
                    "slitter-recoverable-storage-error",
                    "slitter-removed",
                    "slitter-resource-added",
                    "slitter-resource-removed",
                    "slitter-thermistor-failure",
                    "slitter-timing-failure",
                    "slitter-turned-off",
                    "slitter-turned-on",
                    "slitter-under-temperature",
                    "slitter-unrecoverable-failure",
                    "slitter-unrecoverable-storage-error",
                    "slitter-warming-up",
                    "spool-area-full",
                    "stacker-added",
                    "stacker-almost-empty",
                    "stacker-almost-full",
                    "stacker-at-limit",
                    "stacker-closed",
                    "stacker-configuration-change",
                    "stacker-cover-closed",
                    "stacker-cover-open",
                    "stacker-empty",
                    "stacker-full",
                    "stacker-interlock-closed",
                    "stacker-interlock-open",
                    "stacker-jam",
                    "stacker-life-almost-over",
                    "stacker-life-over",
                    "stacker-memory-exhausted",
                    "stacker-missing",
                    "stacker-motor-failure",
                    "stacker-near-limit",
                    "stacker-offline",
                    "stacker-opened",
                    "stacker-over-temperature",
                    "stacker-power-saver",
                    "stacker-recoverable-failure",
                    "stacker-recoverable-storage-error",
                    "stacker-removed",
                    "stacker-resource-added",
                    "stacker-resource-removed",
                    "stacker-thermistor-failure",
                    "stacker-timing-failure",
                    "stacker-turned-off",
                    "stacker-turned-on",
                    "stacker-under-temperature",
                    "stacker-unrecoverable-failure",
                    "stacker-unrecoverable-storage-error",
                    "stacker-warming-up",
                    "stapler-added",
                    "stapler-almost-empty",
                    "stapler-almost-full",
                    "stapler-at-limit",
                    "stapler-closed",
                    "stapler-configuration-change",
                    "stapler-cover-closed",
                    "stapler-cover-open",
                    "stapler-empty",
                    "stapler-full",
                    "stapler-interlock-closed",
                    "stapler-interlock-open",
                    "stapler-jam",
                    "stapler-life-almost-over",
                    "stapler-life-over",
                    "stapler-memory-exhausted",
                    "stapler-missing",
                    "stapler-motor-failure",
                    "stapler-near-limit",
                    "stapler-offline",
                    "stapler-opened",
                    "stapler-over-temperature",
                    "stapler-power-saver",
                    "stapler-recoverable-failure",
                    "stapler-recoverable-storage-error",
                    "stapler-removed",
                    "stapler-resource-added",
                    "stapler-resource-removed",
                    "stapler-thermistor-failure",
                    "stapler-timing-failure",
                    "stapler-turned-off",
                    "stapler-turned-on",
                    "stapler-under-temperature",
                    "stapler-unrecoverable-failure",
                    "stapler-unrecoverable-storage-error",
                    "stapler-warming-up",
                    "stitcher-added",
                    "stitcher-almost-empty",
                    "stitcher-almost-full",
                    "stitcher-at-limit",
                    "stitcher-closed",
                    "stitcher-configuration-change",
                    "stitcher-cover-closed",
                    "stitcher-cover-open",
                    "stitcher-empty",
                    "stitcher-full",
                    "stitcher-interlock-closed",
                    "stitcher-interlock-open",
                    "stitcher-jam",
                    "stitcher-life-almost-over",
                    "stitcher-life-over",
                    "stitcher-memory-exhausted",
                    "stitcher-missing",
                    "stitcher-motor-failure",
                    "stitcher-near-limit",
                    "stitcher-offline",
                    "stitcher-opened",
                    "stitcher-over-temperature",
                    "stitcher-power-saver",
                    "stitcher-recoverable-failure",
                    "stitcher-recoverable-storage-error",
                    "stitcher-removed",
                    "stitcher-resource-added",
                    "stitcher-resource-removed",
                    "stitcher-thermistor-failure",
                    "stitcher-timing-failure",
                    "stitcher-turned-off",
                    "stitcher-turned-on",
                    "stitcher-under-temperature",
                    "stitcher-unrecoverable-failure",
                    "stitcher-unrecoverable-storage-error",
                    "stitcher-warming-up",
                    "stopped-partly",
                    "stopping",
                    "subunit-added",
                    "subunit-almost-empty",
                    "subunit-almost-full",
                    "subunit-at-limit",
                    "subunit-closed",
                    "subunit-empty",
                    "subunit-full",
                    "subunit-life-almost-over",
                    "subunit-life-over",
                    "subunit-memory-exhausted",
                    "subunit-missing",
                    "subunit-motor-failure",
                    "subunit-near-limit",
                    "subunit-offline",
                    "subunit-opened",
                    "subunit-over-temperature",
                    "subunit-power-saver",
                    "subunit-recoverable-failure",
                    "subunit-recoverable-storage-error",
                    "subunit-removed",
                    "subunit-resource-added",
                    "subunit-resource-removed",
                    "subunit-thermistor-failure",
                    "subunit-timing-Failure",
                    "subunit-turned-off",
                    "subunit-turned-on",
                    "subunit-under-temperature",
                    "subunit-unrecoverable-failure",
                    "subunit-unrecoverable-storage-error",
                    "subunit-warming-up",
                    "timed-out",
                    "toner-empty",
                    "toner-low",
                    "trimmer-added",
                    "trimmer-added",
                    "trimmer-almost-empty",
                    "trimmer-almost-empty",
                    "trimmer-almost-full",
                    "trimmer-almost-full",
                    "trimmer-at-limit",
                    "trimmer-at-limit",
                    "trimmer-closed",
                    "trimmer-closed",
                    "trimmer-configuration-change",
                    "trimmer-configuration-change",
                    "trimmer-cover-closed",
                    "trimmer-cover-closed",
                    "trimmer-cover-open",
                    "trimmer-cover-open",
                    "trimmer-empty",
                    "trimmer-empty",
                    "trimmer-full",
                    "trimmer-full",
                    "trimmer-interlock-closed",
                    "trimmer-interlock-closed",
                    "trimmer-interlock-open",
                    "trimmer-interlock-open",
                    "trimmer-jam",
                    "trimmer-jam",
                    "trimmer-life-almost-over",
                    "trimmer-life-almost-over",
                    "trimmer-life-over",
                    "trimmer-life-over",
                    "trimmer-memory-exhausted",
                    "trimmer-memory-exhausted",
                    "trimmer-missing",
                    "trimmer-missing",
                    "trimmer-motor-failure",
                    "trimmer-motor-failure",
                    "trimmer-near-limit",
                    "trimmer-near-limit",
                    "trimmer-offline",
                    "trimmer-offline",
                    "trimmer-opened",
                    "trimmer-opened",
                    "trimmer-over-temperature",
                    "trimmer-over-temperature",
                    "trimmer-power-saver",
                    "trimmer-power-saver",
                    "trimmer-recoverable-failure",
                    "trimmer-recoverable-failure",
                    "trimmer-recoverable-storage-error",
                    "trimmer-removed",
                    "trimmer-resource-added",
                    "trimmer-resource-removed",
                    "trimmer-thermistor-failure",
                    "trimmer-timing-failure",
                    "trimmer-turned-off",
                    "trimmer-turned-on",
                    "trimmer-under-temperature",
                    "trimmer-unrecoverable-failure",
                    "trimmer-unrecoverable-storage-error",
                    "trimmer-warming-up",
                    "unknown",
                    "wrapper-added",
                    "wrapper-almost-empty",
                    "wrapper-almost-full",
                    "wrapper-at-limit",
                    "wrapper-closed",
                    "wrapper-configuration-change",
                    "wrapper-cover-closed",
                    "wrapper-cover-open",
                    "wrapper-empty",
                    "wrapper-full",
                    "wrapper-interlock-closed",
                    "wrapper-interlock-open",
                    "wrapper-jam",
                    "wrapper-life-almost-over",
                    "wrapper-life-over",
                    "wrapper-memory-exhausted",
                    "wrapper-missing",
                    "wrapper-motor-failure",
                    "wrapper-near-limit",
                    "wrapper-offline",
                    "wrapper-opened",
                    "wrapper-over-temperature",
                    "wrapper-power-saver",
                    "wrapper-recoverable-failure",
                    "wrapper-recoverable-storage-error",
                    "wrapper-removed",
                    "wrapper-resource-added",
                    "wrapper-resource-removed",
                    "wrapper-thermistor-failure",
                    "wrapper-timing-failure",
                    "wrapper-turned-off",
                    "wrapper-turned-on",
                    "wrapper-under-temperature",
                    "wrapper-unrecoverable-failure",
                    "wrapper-unrecoverable-storage-error",
                    "wrapper-warming-up",
                ]);
                keywords["proof-print-supported"] = setof_keyword([
                    "media",
                    "media-col",
                    "proof-print-copies",
                ]);
                keywords["pwg-raster-document-sheet-back"] = keyword([
                    "flipped",
                    "manual-tumble",
                    "normal",
                    "rotated",
                ]);
                keywords["pwg-raster-document-type-supported"] = setof_keyword([
                    "adobe-rgb_8",
                    "adobe-rgb_16",
                    "black_1",
                    "black_8",
                    "black_16",
                    "cmyk_8",
                    "cmyk_16",
                    "device1_8",
                    "device1_16",
                    "device2_8",
                    "device2_16",
                    "device3_8",
                    "device3_16",
                    "device4_8",
                    "device4_16",
                    "device5_8",
                    "device5_16",
                    "device6_8",
                    "device6_16",
                    "device7_8",
                    "device7_16",
                    "device8_8",
                    "device8_16",
                    "device9_8",
                    "device9_16",
                    "device10_8",
                    "device10_16",
                    "device11_8",
                    "device11_16",
                    "device12_8",
                    "device12_16",
                    "device13_8",
                    "device13_16",
                    "device14_8",
                    "device14_16",
                    "device15_8",
                    "device15_16",
                    "rgb_8",
                    "rgb_16",
                    "sgray_1",
                    "sgray_8",
                    "sgray_16",
                    "srgb_8",
                    "srgb_16",
                ]);
                keywords["requested-attributes"] = keyword([
                    "all",
                    "document-description",
                    "document-template",
                    "job-description",
                    "job-template",
                    "printer-description",
                    "subscription-description",
                    "subscription-template",
                ]);
                keywords["save-disposition"] = keyword([
                    "none",
                    "print-save",
                    "save-only",
                ]);
                keywords["save-disposition-supported"] = setof_keyword(
                    keywords["save-disposition"]
                );
                keywords["save-info-supported"] = setof_keyword([
                    "save-document-format",
                    "save-location",
                    "save-name",
                ]);
                keywords["separator-sheets-type"] = keyword_name([
                    "both-sheets",
                    "end-sheet",
                    "none",
                    "slip-sheets",
                    "start-sheet",
                ]);
                keywords["separator-sheets-type-supported"] = setof_keyword_name(
                    keywords["separator-sheets-type"]
                );
                keywords["sheet-collate"] = keyword(["collated", "uncollated"]);
                keywords["sheet-collate-default"] = keyword(keywords["sheet-collate"]);
                keywords["sheet-collate-supported"] = setof_keyword(
                    keywords["sheet-collate"]
                );
                keywords.sides = keyword([
                    "one-sided",
                    "two-sided-long-edge",
                    "two-sided-short-edge",
                ]);
                keywords["sides-default"] = keyword(keywords.sides);
                keywords["sides-supported"] = setof_keyword(keywords.sides);
                keywords["stitching-reference-edge"] = keyword([
                    "bottom",
                    "left",
                    "right",
                    "top",
                ]);
                keywords["stitching-reference-edge-supported"] = setof_keyword(
                    keywords["stitching-reference-edge"]
                );
                keywords["stitching-supported"] = setof_keyword([
                    "stitching-locations",
                    "stitching-offset",
                    "stitching-reference-edge",
                ]);
                keywords["uri-authentication-supported"] = setof_keyword([
                    "basic",
                    "certificate",
                    "digest",
                    "negotiate",
                    "none",
                    "requesting-user-name",
                ]);
                keywords["uri-security-supported"] = setof_keyword([
                    "none",
                    "ssl3",
                    "tls",
                ]);
                keywords["which-jobs"] = keyword([
                    "aborted",
                    "all",
                    "canceled",
                    "completed",
                    "not-completed",
                    "pending",
                    "pending-held",
                    "processing",
                    "processing-stopped",
                    "proof-print",
                    "saved",
                ]);
                keywords["which-jobs-supported"] = setof_keyword(
                    keywords["which-jobs"]
                );
                keywords["x-image-position"] = keyword([
                    "center",
                    "left",
                    "none",
                    "right",
                ]);
                keywords["x-image-position-default"] = keyword(
                    keywords["x-image-position"]
                );
                keywords["x-image-position-supported"] = setof_keyword(
                    keywords["x-image-position"]
                );
                keywords["xri-authentication-supported"] = setof_keyword([
                    "basic",
                    "certificate",
                    "digest",
                    "none",
                    "requesting-user-name",
                ]);
                keywords["xri-security-supported"] = setof_keyword([
                    "none",
                    "ssl3",
                    "tls",
                ]);
                keywords["y-image-position"] = keyword([
                    "bottom",
                    "center",
                    "none",
                    "top",
                ]);
                keywords["y-image-position-default"] = keyword(
                    keywords["y-image-position"]
                );
                keywords["y-image-position-supported"] = setof_keyword(
                    keywords["y-image-position"]
                );

                module.exports = keywords;
            },
            {"./attributes": 3},
        ],
        7: [
            function (require, module, exports) {
                var enums = require("./enums"),
                    operations = enums["operations-supported"],
                    statusCodes = require("./status-codes"),
                    tags = require("./tags"),
                    RS = "\u001e";
                module.exports = function (buf) {
                    var obj = {};
                    var position = 0;
                    var encoding = "utf8";
                    function read1() {
                        return buf[position++];
                    }
                    function read2() {
                        var val = buf.readInt16BE(position, true);
                        position += 2;
                        return val;
                    }
                    function read4() {
                        var val = buf.readInt32BE(position, true);
                        position += 4;
                        return val;
                    }
                    function read(length, enc) {
                        if (length == 0) return "";
                        return buf.toString(
                            enc || encoding,
                            position,
                            (position += length)
                        );
                    }
                    function readGroups() {
                        var group;
                        while (position < buf.length && (group = read1()) !== 0x03) {
                            // End-of-attributes-tag
                            readGroup(group);
                        }
                    }
                    function readGroup(group) {
                        var name = tags.lookup[group];
                        group = {};
                        if (obj[name]) {
                            if (!Array.isArray(obj[name])) obj[name] = [obj[name]];
                            obj[name].push(group);
                        } else obj[name] = group;

                        while (buf[position] >= 0x0f) {
                            // Delimiters are between 0x00 to 0x0F
                            readAttr(group);
                        }
                    }
                    function readAttr(group) {
                        var tag = read1();
                        // TODO: find a test for this
                        if (tag === 0x7f) {
                            // Tags.extension
                            tag = read4();
                        }
                        var name = read(read2());
                        group[name] = readValues(tag, name);
                    }
                    function hasAdditionalValue() {
                        var current = buf[position];
                        return (
                            current !== 0x4a && // Tags.memberAttrName
                            current !== 0x37 && // Tags.endCollection
                            current !== 0x03 && // Tags.end-of-attributes-tag
                            buf[position + 1] === 0x00 &&
                            buf[position + 2] === 0x00
                        );
                    }
                    function readValues(type, name) {
                        var value = readValue(type, name);
                        if (hasAdditionalValue()) {
                            value = [value];
                            do {
                                type = read1();
                                read2(); // Empty name
                                value.push(readValue(type, name));
                            } while (hasAdditionalValue());
                        }
                        return value;
                    }
                    function readValue(tag, name) {
                        var length = read2();
                        // http://tools.ietf.org/html/rfc2910#section-3.9
                        switch (tag) {
                            case tags.enum:
                                var val = read4();
                                return (enums[name] && enums[name].lookup[val]) || val;
                            case tags.integer:
                                return read4();

                            case tags.boolean:
                                return Boolean(read1());

                            case tags.rangeOfInteger:
                                return [read4(), read4()];

                            case tags.resolution:
                                return [
                                    read4(),
                                    read4(),
                                    read1() === 0x03 ? "dpi" : "dpcm",
                                ];

                            case tags.dateTime:
                                // http://tools.ietf.org/html/rfc1903 page 17
                                var date = new Date(
                                    read2(),
                                    read1(),
                                    read1(),
                                    read1(),
                                    read1(),
                                    read1(),
                                    read1()
                                );
                                // Silly way to add on the timezone
                                return new Date(
                                    date.toISOString().substr(0, 23).replace("T", ",") +
                                        "," +
                                        String.fromCharCode(read(1)) +
                                        read(1) +
                                        ":" +
                                        read(1)
                                );

                            case tags.textWithLanguage:
                            case tags.nameWithLanguage:
                                var lang = read(read2());
                                var subval = read(read2());
                                return lang + RS + subval;

                            case tags.nameWithoutLanguage:
                            case tags.textWithoutLanguage:
                            case tags.octetString:
                            case tags.memberAttrName:
                                return read(length);

                            case tags.keyword:
                            case tags.uri:
                            case tags.uriScheme:
                            case tags.charset:
                            case tags.naturalLanguage:
                            case tags.mimeMediaType:
                                return read(length, "ascii");

                            case tags.begCollection:
                                // The spec says a value could be present- but can be ignored
                                read(length);
                                return readCollection();

                            case tags["no-value"]:
                            default:
                                debugger;
                                return module.exports.handleUnknownTag(
                                    tag,
                                    name,
                                    length,
                                    read
                                );
                        }
                    }
                    function readCollection() {
                        var tag;
                        var collection = {};

                        while ((tag = read1()) !== 0x37) {
                            // Tags.endCollection
                            if (tag !== 0x4a) {
                                console.log("unexpected:", tags.lookup[tag]);
                                return;
                            }
                            // Read nametag name and discard it
                            read(read2());
                            var name = readValue(0x4a);
                            var values = readCollectionItemValue();
                            collection[name] = values;
                        }
                        // Read endCollection name & value and discard it.
                        // The spec says that they MAY have contents in the
                        // future- so we can't assume they are empty.
                        read(read2());
                        read(read2());

                        return collection;
                    }
                    function readCollectionItemValue(name) {
                        var tag = read1();
                        // TODO: find a test for this
                        if (tag === 0x7f) {
                            // Tags.extension
                            tag = read4();
                        }
                        // Read valuetag name and discard it
                        read(read2());

                        return readValues(tag, name);
                    }

                    obj.version = read1() + "." + read1();
                    var bytes2and3 = read2();
                    // Byte[2] and byte[3] are used to define the 'operation' on
                    // requests, but used to hold the statusCode on responses. We
                    // can almost detect if it is a req or a res- but sadly, six
                    // values overlap. In these cases, the parser will give both and
                    // the consumer can ignore (or delete) whichever they don't want.
                    if (bytes2and3 >= 0x02 || bytes2and3 <= 0x3d)
                        obj.operation = operations.lookup[bytes2and3];

                    if (bytes2and3 <= 0x0007 || bytes2and3 >= 0x0400)
                        obj.statusCode = statusCodes.lookup[bytes2and3];
                    obj.id = read4();
                    readGroups();

                    if (position < buf.length)
                        obj.data = buf.toString(encoding, position);

                    return obj;
                };
                module.exports.handleUnknownTag = function log(
                    tag,
                    name,
                    length,
                    read
                ) {
                    var value = length ? read(length) : undefined;
                    console.log(
                        "The spec is not clear on how to handle tag " +
                            tag +
                            ": " +
                            name +
                            "=" +
                            String(value) +
                            ". " +
                            "Please open a github issue to help find a solution!"
                    );
                    return value;
                };
            },
            {"./enums": 4, "./status-codes": 11, "./tags": 12},
        ],
        8: [
            function (require, module, exports) {
                var request = require("./request"),
                    serialize = require("./serializer"),
                    extend = require("./ipputil").extend,
                    parseurl = require("url").parse;
                function Printer(url, opts) {
                    if (!(this instanceof Printer)) return new Printer(url, opts);
                    opts = opts || {};
                    this.url = typeof url === "string" ? parseurl(url) : url;
                    this.version = opts.version || "2.0";
                    this.uri = opts.uri || "ipp://" + this.url.host + this.url.path;
                    this.charset = opts.charset || "utf-8";
                    this.language = opts.language || "en-us";
                }
                Printer.prototype = {
                    _message: function (operation, msg) {
                        if (typeof operation === "undefined")
                            operation = "Get-Printer-Attributes";

                        var base = {
                            version: this.version,
                            operation: operation,
                            id: null, // Will get added by serializer if one isn't given
                            "operation-attributes-tag": {
                                // These are required to be in this order
                                "attributes-charset": this.charset,
                                "attributes-natural-language": this.language,
                                "printer-uri": this.uri,
                            },
                        };
                        // These are required to be in this order
                        if (msg && msg["operation-attributes-tag"]["job-id"])
                            base["operation-attributes-tag"]["job-id"] =
                                msg["operation-attributes-tag"]["job-id"];
                        // Yes, this gets done in extend()- however, by doing this now, we define the position in the result object.
                        else if (msg && msg["operation-attributes-tag"]["job-uri"])
                            base["operation-attributes-tag"]["job-uri"] =
                                msg["operation-attributes-tag"]["job-uri"];

                        msg = extend(base, msg);
                        if (msg["operation-attributes-tag"]["job-uri"])
                            delete msg["operation-attributes-tag"]["printer-uri"];
                        return msg;
                    },
                    execute: function (operation, msg, cb) {
                        msg = this._message(operation, msg);
                        var buf = serialize(msg);
                        //		Console.log(buf.toString('hex'));
                        //		console.log(JSON.stringify(
                        //			require('./parser')(buf), null, 2
                        //		));
                        request(this.url, buf, cb);
                    },
                };

                module.exports = Printer;
            },
            {"./ipputil": 5, "./request": 9, "./serializer": 10, url: 48},
        ],
        9: [
            function (require, module, exports) {
                (function (Buffer) {
                    (function () {
                        var http = require("http"),
                            https = require("https"),
                            url = require("url"),
                            parse = require("./parser");

                        module.exports = function (opts, buffer, cb) {
                            var streamed = typeof buffer === "function";
                            // All IPP requires are POSTs- so we must have some data.
                            //  10 is just a number I picked- this probably should have something more meaningful
                            if (!Buffer.isBuffer(buffer) || buffer.length < 10) {
                                return cb(new Error("Data required"));
                            }
                            if (typeof opts === "string") opts = url.parse(opts);
                            if (!opts.port) opts.port = 631;

                            if (!opts.headers) opts.headers = {};
                            opts.headers["Content-Type"] = "application/ipp";
                            opts.method = "POST";

                            if (opts.protocol === "ipp:") opts.protocol = "http:";

                            if (opts.protocol === "ipps:") opts.protocol = "https:";

                            var req = (
                                opts.protocol === "https:" ? https : http
                            ).request(opts, function (res) {
                                //		Console.log('STATUS: ' + res.statusCode);
                                //		console.log('HEADERS: ' + JSON.stringify(res.headers));
                                switch (res.statusCode) {
                                    case 100:
                                        if (
                                            opts.headers.Expect !== "100-Continue" ||
                                            typeof opts.continue !== "function"
                                        ) {
                                            cb(new IppResponseError(res.statusCode));
                                        }
                                        return console.log("100 Continue");
                                    case 200:
                                        return readResponse(res, cb);
                                    default:
                                        cb(new IppResponseError(res.statusCode));
                                        return console.log(res.statusCode, "response");
                                }
                            });
                            req.on("error", function (err) {
                                cb(err);
                            });
                            if (
                                opts.headers.Expect === "100-Continue" &&
                                typeof opts.continue === "function"
                            ) {
                                req.on("continue", function () {
                                    opts.continue(req);
                                });
                            }
                            req.write(buffer);
                            req.end();
                        };
                        function readResponse(res, cb) {
                            var chunks = [],
                                length = 0;
                            res.on("data", function (chunk) {
                                length += chunk.length;
                                chunks.push(chunk);
                            });
                            res.on("end", function () {
                                var response = parse(Buffer.concat(chunks, length));
                                delete response.operation;
                                cb(null, response);
                            });
                        }

                        function IppResponseError(statusCode, message) {
                            this.name = "IppResponseError";
                            this.statusCode = statusCode;
                            this.message =
                                message ||
                                "Received unexpected response status " +
                                    statusCode +
                                    " from the printer";
                            this.stack = new Error().stack;
                        }
                        IppResponseError.prototype = Object.create(Error.prototype);
                        IppResponseError.prototype.constructor = IppResponseError;
                    }.call(this));
                }.call(this, require("buffer").Buffer));
            },
            {"./parser": 7, buffer: 16, http: 28, https: 19, url: 48},
        ],
        10: [
            function (require, module, exports) {
                (function (Buffer) {
                    (function () {
                        var operations = require("./enums")["operations-supported"],
                            tags = require("./tags"),
                            versions = require("./versions"),
                            attributes = require("./attributes"),
                            enums = require("./enums"),
                            keywords = require("./keywords"),
                            statusCodes = require("./status-codes"),
                            RS = "\u001e";
                        function random() {
                            return Number(Math.random().toString().substr(-8));
                        }

                        module.exports = function serializer(msg) {
                            var buf = new Buffer(10240);
                            var position = 0;
                            function write1(val) {
                                checkBufferSize(1);
                                buf.writeUInt8(val, position);
                                position += 1;
                            }
                            function write2(val) {
                                checkBufferSize(2);
                                buf.writeUInt16BE(val, position);
                                position += 2;
                            }
                            function write4(val) {
                                checkBufferSize(4);
                                buf.writeUInt32BE(val, position);
                                position += 4;
                            }
                            function write(str, enc) {
                                var length = Buffer.byteLength(str);
                                write2(length);
                                checkBufferSize(length);
                                buf.write(str, position, length, enc || "utf8");
                                position += length;
                            }
                            function checkBufferSize(length) {
                                if (position + length > buf.length) {
                                    buf = Buffer.concat([buf], 2 * buf.length);
                                }
                            }
                            var special = {
                                "attributes-charset": 1,
                                "attributes-natural-language": 2,
                            };
                            var groupmap = {
                                "job-attributes-tag": [
                                    "Job Template",
                                    "Job Description",
                                ],
                                "operation-attributes-tag": "Operation",
                                "printer-attributes-tag": "Printer Description",
                                "unsupported-attributes-tag": "", // ??
                                "subscription-attributes-tag":
                                    "Subscription Description",
                                "event-notification-attributes-tag":
                                    "Event Notifications",
                                "resource-attributes-tag": "", // ??
                                "document-attributes-tag": "Document Description",
                            };
                            function writeGroup(tag) {
                                var attrs = msg[tag];
                                if (!attrs) return;
                                var keys = Object.keys(attrs);
                                // 'attributes-charset' and 'attributes-natural-language' need to come first- so we sort them to the front
                                if (tag == tags["operation-attributes-tag"])
                                    keys = keys.sort(function (a, b) {
                                        return (special[a] || 3) - (special[b] || 3);
                                    });
                                var groupname = groupmap[tag];
                                write1(tags[tag]);
                                keys.forEach(function (name) {
                                    attr(groupname, name, attrs);
                                });
                            }
                            function attr(group, name, obj) {
                                var groupName = Array.isArray(group)
                                    ? group.find(function (grp) {
                                          return attributes[grp][name];
                                      })
                                    : group;
                                if (!groupName) throw "Unknown attribute: " + name;

                                var syntax = attributes[groupName][name];

                                if (!syntax) throw "Unknown attribute: " + name;

                                var value = obj[name];
                                if (!Array.isArray(value)) value = [value];

                                value.forEach(function (value, i) {
                                    // We need to re-evaluate the alternates every time
                                    var syntax2 = Array.isArray(syntax)
                                        ? resolveAlternates(syntax, name, value)
                                        : syntax;
                                    var tag = getTag(syntax2, name, value);
                                    if (tag === tags.enum) value = enums[name][value];

                                    write1(tag);
                                    if (i == 0) {
                                        write(name);
                                    } else {
                                        write2(0x0000); // Empty name
                                    }

                                    writeValue(tag, value, syntax2.members);
                                });
                            }
                            function getTag(syntax, name, value) {
                                var tag = syntax.tag;
                                if (!tag) {
                                    var hasRS = Boolean(~value.indexOf(RS));
                                    tag =
                                        tags[
                                            syntax.type +
                                                (hasRS ? "With" : "Without") +
                                                "Language"
                                        ];
                                }
                                return tag;
                            }
                            function resolveAlternates(array, name, value) {
                                switch (array.alts) {
                                    case "keyword,name":
                                    case "keyword,name,novalue":
                                        if (value === null && array.lookup.novalue)
                                            return array.lookup.novalue;
                                        return ~keywords[name].indexOf(value)
                                            ? array.lookup.keyword
                                            : array.lookup.name;
                                    case "integer,rangeOfInteger":
                                        return Array.isArray(value)
                                            ? array.lookup.rangeOfInteger
                                            : array.lookup.integer;
                                    case "dateTime,novalue":
                                        return !IsNaN(date.parse(value))
                                            ? array.lookup.dateTime
                                            : array.lookup.novalue;
                                    case "integer,novalue":
                                        return !IsNaN(value)
                                            ? array.lookup.integer
                                            : array.lookup.novalue;
                                    case "name,novalue":
                                        return value !== null
                                            ? array.lookup.name
                                            : array.lookup.novalue;
                                    case "novalue,uri":
                                        return value !== null
                                            ? array.lookup.uri
                                            : array.lookup.novalue;
                                    case "enumeration,unknown":
                                        return enums[name][value]
                                            ? array.lookup.enumeration
                                            : array.lookup.unknown;
                                    case "enumeration,novalue":
                                        return value !== null
                                            ? array.lookup.enumeration
                                            : array.lookup.novalue;
                                    case "collection,novalue":
                                        return value !== null
                                            ? array.lookup.enumeration
                                            : array.lookup.novalue;
                                    default:
                                        throw "Unknown atlernates";
                                }
                            }
                            function writeValue(tag, value, submembers) {
                                switch (tag) {
                                    case tags.enum:
                                        write2(0x0004);
                                        return write4(value);
                                    case tags.integer:
                                        write2(0x0004);
                                        return write4(value);

                                    case tags.boolean:
                                        write2(0x0001);
                                        return write1(Number(value));

                                    case tags.rangeOfInteger:
                                        write2(0x0008);
                                        write4(value[0]);
                                        write4(value[1]);
                                        return;

                                    case tags.resolution:
                                        write2(0x0009);
                                        write4(value[0]);
                                        write4(value[1]);
                                        write1(value[2] === "dpi" ? 0x03 : 0x04);
                                        return;

                                    case tags.dateTime:
                                        write2(0x000b);
                                        write2(value.getFullYear());
                                        write1(value.getMonth());
                                        write1(value.getDate());
                                        write1(value.getHours());
                                        write1(value.getMinutes());
                                        write1(value.getSeconds());
                                        write1(value.getMilliseconds());
                                        var tz = timezone(value);
                                        write1(tz[0]); // + or -
                                        write1(tz[1]); // Hours
                                        write1(tz[2]); // Minutes
                                        return;

                                    case tags.textWithLanguage:
                                    case tags.nameWithLanguage:
                                        write2(parts[0].length);
                                        write2(parts[0]);
                                        write2(parts[1].length);
                                        write2(parts[1]);
                                        return;

                                    case tags.nameWithoutLanguage:
                                    case tags.textWithoutLanguage:
                                    case tags.octetString:
                                    case tags.memberAttrName:
                                        return write(value);

                                    case tags.keyword:
                                    case tags.uri:
                                    case tags.uriScheme:
                                    case tags.charset:
                                    case tags.naturalLanguage:
                                    case tags.mimeMediaType:
                                        return write(value, "ascii");

                                    case tags.begCollection:
                                        write2(0); // Empty value
                                        return writeCollection(value, submembers);

                                    case tags["no-value"]:
                                        // Empty value? I can't find where this is defined in any spec.
                                        return write2(0);

                                    default:
                                        debugger;
                                        console.error(tag, "not handled");
                                }
                            }
                            function writeCollection(value, members) {
                                Object.keys(value).forEach(function (key) {
                                    var subvalue = value[key];
                                    var subsyntax = members[key];

                                    if (Array.isArray(subsyntax))
                                        subsyntax = resolveAlternates(
                                            subsyntax,
                                            key,
                                            subvalue
                                        );

                                    var tag = getTag(subsyntax, key, subvalue);
                                    if (tag === tags.enum)
                                        subvalue = enums[key][subvalue];

                                    write1(tags.memberAttrName);
                                    write2(0); // Empty name
                                    writeValue(tags.memberAttrName, key);
                                    write1(tag);
                                    write2(0); // Empty name
                                    writeValue(tag, subvalue, subsyntax.members);
                                });
                                write1(tags.endCollection);
                                write2(0); // Empty name
                                write2(0); // Empty value
                            }

                            write2(versions[msg.version || "2.0"]);
                            write2(
                                msg.operation
                                    ? operations[msg.operation]
                                    : statusCodes[msg.statusCode]
                            );
                            write4(msg.id || random()); // Request-id

                            writeGroup("operation-attributes-tag");
                            writeGroup("job-attributes-tag");
                            writeGroup("printer-attributes-tag");
                            writeGroup("document-attributes-tag");
                            // TODO... add the others

                            write1(0x03); // End

                            if (!msg.data) return buf.slice(0, position);

                            if (!Buffer.isBuffer(msg.data))
                                throw "data must be a Buffer";

                            var buf2 = new Buffer(position + msg.data.length);
                            buf.copy(buf2, 0, 0, position);
                            msg.data.copy(buf2, position, 0);
                            return buf2;
                        };
                        function timezone(d) {
                            var z = d.getTimezoneOffset();
                            return [
                                z > 0 ? "-" : "+",
                                ~~(Math.abs(z) / 60),
                                Math.abs(z) % 60,
                            ];
                        }
                    }.call(this));
                }.call(this, require("buffer").Buffer));
            },
            {
                "./attributes": 3,
                "./enums": 4,
                "./keywords": 6,
                "./status-codes": 11,
                "./tags": 12,
                "./versions": 13,
                buffer: 16,
            },
        ],
        11: [
            function (require, module, exports) {
                var xref = require("./ipputil").xref;

                var status = [];
                /* Success 0x0000 - 0x00FF */
                status[0x0000] = "successful-ok"; // http://tools.ietf.org/html/rfc2911#section-13.1.2.1
                status[0x0001] = "successful-ok-ignored-or-substituted-attributes"; // http://tools.ietf.org/html/rfc2911#section-13.1.2.2 & http://tools.ietf.org/html/rfc3995#section-13.5
                status[0x0002] = "successful-ok-conflicting-attributes"; // http://tools.ietf.org/html/rfc2911#section-13.1.2.3
                status[0x0003] = "successful-ok-ignored-subscriptions"; // http://tools.ietf.org/html/rfc3995#section-12.1
                status[0x0004] = "successful-ok-ignored-notifications"; // http://tools.ietf.org/html/draft-ietf-ipp-indp-method-05#section-9.1.1    did not get standardized
                status[0x0005] = "successful-ok-too-many-events"; // http://tools.ietf.org/html/rfc3995#section-13.4
                status[0x0006] = "successful-ok-but-cancel-subscription"; // http://tools.ietf.org/html/draft-ietf-ipp-indp-method-05#section-9.2.2    did not get standardized
                status[0x0007] = "successful-ok-events-complete"; // http://tools.ietf.org/html/rfc3996#section-10.1

                status[0x0400] = "client-error-bad-request"; // http://tools.ietf.org/html/rfc2911#section-13.1.4.1
                status[0x0401] = "client-error-forbidden"; // http://tools.ietf.org/html/rfc2911#section-13.1.4.2
                status[0x0402] = "client-error-not-authenticated"; // http://tools.ietf.org/html/rfc2911#section-13.1.4.3
                status[0x0403] = "client-error-not-authorized"; // http://tools.ietf.org/html/rfc2911#section-13.1.4.4
                status[0x0404] = "client-error-not-possible"; // http://tools.ietf.org/html/rfc2911#section-13.1.4.5
                status[0x0405] = "client-error-timeout"; // http://tools.ietf.org/html/rfc2911#section-13.1.4.6
                status[0x0406] = "client-error-not-found"; // http://tools.ietf.org/html/rfc2911#section-13.1.4.7
                status[0x0407] = "client-error-gone"; // http://tools.ietf.org/html/rfc2911#section-13.1.4.8
                status[0x0408] = "client-error-request-entity-too-large"; // http://tools.ietf.org/html/rfc2911#section-13.1.4.9
                status[0x0409] = "client-error-request-value-too-long"; // http://tools.ietf.org/html/rfc2911#section-13.1.4.1
                status[0x040a] = "client-error-document-format-not-supported"; // http://tools.ietf.org/html/rfc2911#section-13.1.4.11
                status[0x040b] = "client-error-attributes-or-values-not-supported"; // http://tools.ietf.org/html/rfc2911#section-13.1.4.12 & http://tools.ietf.org/html/rfc3995#section-13.2
                status[0x040c] = "client-error-uri-scheme-not-supported"; // http://tools.ietf.org/html/rfc2911#section-13.1.4.13 & http://tools.ietf.org/html/rfc3995#section-13.1
                status[0x040d] = "client-error-charset-not-supported"; // http://tools.ietf.org/html/rfc2911#section-13.1.4.14
                status[0x040e] = "client-error-conflicting-attributes"; // http://tools.ietf.org/html/rfc2911#section-13.1.4.15
                status[0x040f] = "client-error-compression-not-supported"; // http://tools.ietf.org/html/rfc2911#section-13.1.4.16
                status[0x0410] = "client-error-compression-error"; // http://tools.ietf.org/html/rfc2911#section-13.1.4.17
                status[0x0411] = "client-error-document-format-error"; // http://tools.ietf.org/html/rfc2911#section-13.1.4.18
                status[0x0412] = "client-error-document-access-error"; // http://tools.ietf.org/html/rfc2911#section-13.1.4.19
                status[0x0413] = "client-error-attributes-not-settable"; // http://tools.ietf.org/html/rfc3380#section-7.1
                status[0x0414] = "client-error-ignored-all-subscriptions"; // http://tools.ietf.org/html/rfc3995#section-12.2
                status[0x0415] = "client-error-too-many-subscriptions"; // http://tools.ietf.org/html/rfc3995#section-13.2
                status[0x0416] = "client-error-ignored-all-notifications"; // http://tools.ietf.org/html/draft-ietf-ipp-indp-method-06#section-9.1.2    did not get standardized
                status[0x0417] = "client-error-client-print-support-file-not-found"; // http://tools.ietf.org/html/draft-ietf-ipp-install-04#section-10.1         did not get standardized
                status[0x0418] = "client-error-document-password-error"; // ftp://ftp.pwg.org/pub/pwg/ipp/wd/wd-ippjobprinterext3v10-20120420.pdf     did not get standardized
                status[0x0419] = "client-error-document-permission-error"; // ftp://ftp.pwg.org/pub/pwg/ipp/wd/wd-ippjobprinterext3v10-20120420.pdf     did not get standardized
                status[0x041a] = "client-error-document-security-error"; // ftp://ftp.pwg.org/pub/pwg/ipp/wd/wd-ippjobprinterext3v10-20120420.pdf     did not get standardized
                status[0x041b] = "client-error-document-unprintable-error"; // ftp://ftp.pwg.org/pub/pwg/ipp/wd/wd-ippjobprinterext3v10-20120420.pdf     did not get standardized
                /* Server error 0x0500 - 0x05FF */
                status[0x0500] = "server-error-internal-error"; // http://tools.ietf.org/html/rfc2911#section-13.1.5.1
                status[0x0501] = "server-error-operation-not-supported"; // http://tools.ietf.org/html/rfc2911#section-13.1.5.2
                status[0x0502] = "server-error-service-unavailable"; // http://tools.ietf.org/html/rfc2911#section-13.1.5.3
                status[0x0503] = "server-error-version-not-supported"; // http://tools.ietf.org/html/rfc2911#section-13.1.5.4
                status[0x0504] = "server-error-device-error"; // http://tools.ietf.org/html/rfc2911#section-13.1.5.5
                status[0x0505] = "server-error-temporary-error"; // http://tools.ietf.org/html/rfc2911#section-13.1.5.6
                status[0x0506] = "server-error-not-accepting-jobs"; // http://tools.ietf.org/html/rfc2911#section-13.1.5.7
                status[0x0507] = "server-error-busy"; // http://tools.ietf.org/html/rfc2911#section-13.1.5.8
                status[0x0508] = "server-error-job-canceled"; // http://tools.ietf.org/html/rfc2911#section-13.1.5.9
                status[0x0509] = "server-error-multiple-document-jobs-not-supported"; // http://tools.ietf.org/html/rfc2911#section-13.1.5.10
                status[0x050a] = "server-error-printer-is-deactivated"; // http://tools.ietf.org/html/rfc3998#section-5.1
                status[0x050b] = "server-error-too-many-jobs"; // ftp://ftp.pwg.org/pub/pwg/candidates/cs-ippjobext10-20031031-5100.7.pdf
                status[0x050c] = "server-error-too-many-documents"; // ftp://ftp.pwg.org/pub/pwg/candidates/cs-ippjobext10-20031031-5100.7.pdf

                module.exports = xref(status);
            },
            {"./ipputil": 5},
        ],
        12: [
            function (require, module, exports) {
                var xref = require("./ipputil").xref;

                // http://www.iana.org/assignments/ipp-registrations/ipp-registrations.xml#ipp-registrations-7
                // http://www.iana.org/assignments/ipp-registrations/ipp-registrations.xml#ipp-registrations-8
                // http://www.iana.org/assignments/ipp-registrations/ipp-registrations.xml#ipp-registrations-9
                var tags = [
                    ,
                    // 0x00 http://tools.ietf.org/html/rfc2910#section-3.5.1
                    "operation-attributes-tag", // 0x01 http://tools.ietf.org/html/rfc2910#section-3.5.1
                    "job-attributes-tag", // 0x02 http://tools.ietf.org/html/rfc2910#section-3.5.1
                    "end-of-attributes-tag", // 0x03 http://tools.ietf.org/html/rfc2910#section-3.5.1
                    "printer-attributes-tag", // 0x04 http://tools.ietf.org/html/rfc2910#section-3.5.1
                    "unsupported-attributes-tag", // 0x05 http://tools.ietf.org/html/rfc2910#section-3.5.1
                    "subscription-attributes-tag", // 0x06 http://tools.ietf.org/html/rfc3995#section-14
                    "event-notification-attributes-tag", // 0x07 http://tools.ietf.org/html/rfc3995#section-14
                    "resource-attributes-tag", // 0x08 http://tools.ietf.org/html/draft-ietf-ipp-get-resource-00#section-11    did not get standardized
                    "document-attributes-tag", // 0x09 ftp://ftp.pwg.org/pub/pwg/candidates/cs-ippdocobject10-20031031-5100.5.pdf // 0x0A - 0x0F
                    ,
                    ,
                    ,
                    ,
                    ,
                    ,
                    "unsupported", // 0x10 http://tools.ietf.org/html/rfc2910#section-3.5.2
                    "default", // 0x11 http://tools.ietf.org/html/rfc2910#section-3.5.2
                    "unknown", // 0x12 http://tools.ietf.org/html/rfc2910#section-3.5.2
                    "no-value", // 0x13 http://tools.ietf.org/html/rfc2910#section-3.5.2 // 0x14
                    ,
                    "not-settable", // 0x15 http://tools.ietf.org/html/rfc3380#section-8.1
                    "delete-attribute", // 0x16 http://tools.ietf.org/html/rfc3380#section-8.2
                    "admin-define", // 0x17 http://tools.ietf.org/html/rfc3380#section-8.3 // 0x18 - 0x20
                    ,
                    ,
                    ,
                    ,
                    ,
                    ,
                    ,
                    ,
                    ,
                    "integer", // 0x21 http://tools.ietf.org/html/rfc2910#section-3.5.2
                    "boolean", // 0x22 http://tools.ietf.org/html/rfc2910#section-3.5.2
                    "enum", // 0x23 http://tools.ietf.org/html/rfc2910#section-3.5.2 // 0x24 - 0x2F
                    ,
                    ,
                    ,
                    ,
                    ,
                    ,
                    ,
                    ,
                    ,
                    ,
                    ,
                    ,
                    "octetString", // 0x30 http://tools.ietf.org/html/rfc2910#section-3.5.2
                    "dateTime", // 0x31 http://tools.ietf.org/html/rfc2910#section-3.5.2
                    "resolution", // 0x32 http://tools.ietf.org/html/rfc2910#section-3.5.2
                    "rangeOfInteger", // 0x33 http://tools.ietf.org/html/rfc2910#section-3.5.2
                    "begCollection", // 0x34 http://tools.ietf.org/html/rfc3382#section-7.1
                    "textWithLanguage", // 0x35 http://tools.ietf.org/html/rfc2910#section-3.5.2
                    "nameWithLanguage", // 0x36 http://tools.ietf.org/html/rfc2910#section-3.5.2
                    "endCollection", // 0x37 http://tools.ietf.org/html/rfc3382#section-7.1 // 0x38 - 0x40
                    ,
                    ,
                    ,
                    ,
                    ,
                    ,
                    ,
                    ,
                    ,
                    "textWithoutLanguage", // 0x41 http://tools.ietf.org/html/rfc2910#section-3.5.2
                    "nameWithoutLanguage", // 0x42 http://tools.ietf.org/html/rfc2910#section-3.5.2 // 0x43
                    ,
                    "keyword", // 0x44 http://tools.ietf.org/html/rfc2910#section-3.5.2
                    "uri", // 0x45 http://tools.ietf.org/html/rfc2910#section-3.5.2
                    "uriScheme", // 0x46 http://tools.ietf.org/html/rfc2910#section-3.5.2
                    "charset", // 0x47 http://tools.ietf.org/html/rfc2910#section-3.5.2
                    "naturalLanguage", // 0x48 http://tools.ietf.org/html/rfc2910#section-3.5.2
                    "mimeMediaType", // 0x49 http://tools.ietf.org/html/rfc2910#section-3.5.2
                    "memberAttrName", // 0x4A http://tools.ietf.org/html/rfc3382#section-7.1
                ];
                tags[0x7f] = "extension"; // http://tools.ietf.org/html/rfc2910#section-3.5.2
                module.exports = xref(tags);
            },
            {"./ipputil": 5},
        ],
        13: [
            function (require, module, exports) {
                var versions = [];
                versions[0x0100] = "1.0";
                versions[0x0101] = "1.1";
                versions[0x0200] = "2.0";
                versions[0x0201] = "2.1";

                module.exports = require("./ipputil").xref(versions);
            },
            {"./ipputil": 5},
        ],
        14: [
            function (require, module, exports) {
                "use strict";

                exports.byteLength = byteLength;
                exports.toByteArray = toByteArray;
                exports.fromByteArray = fromByteArray;

                var lookup = [];
                var revLookup = [];
                var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;

                var code =
                    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                for (var i = 0, len = code.length; i < len; ++i) {
                    lookup[i] = code[i];
                    revLookup[code.charCodeAt(i)] = i;
                }

                // Support decoding URL-safe base64 strings, as Node.js does.
                // See: https://en.wikipedia.org/wiki/Base64#URL_applications
                revLookup["-".charCodeAt(0)] = 62;
                revLookup["_".charCodeAt(0)] = 63;

                function getLens(b64) {
                    var len = b64.length;

                    if (len % 4 > 0) {
                        throw new Error(
                            "Invalid string. Length must be a multiple of 4"
                        );
                    }

                    // Trim off extra bytes after placeholder bytes are found
                    // See: https://github.com/beatgammit/base64-js/issues/42
                    var validLen = b64.indexOf("=");
                    if (validLen === -1) validLen = len;

                    var placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4);

                    return [validLen, placeHoldersLen];
                }

                // Base64 is 4/3 + up to two characters of the original data
                function byteLength(b64) {
                    var lens = getLens(b64);
                    var validLen = lens[0];
                    var placeHoldersLen = lens[1];
                    return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen;
                }

                function _byteLength(b64, validLen, placeHoldersLen) {
                    return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen;
                }

                function toByteArray(b64) {
                    var tmp;
                    var lens = getLens(b64);
                    var validLen = lens[0];
                    var placeHoldersLen = lens[1];

                    var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));

                    var curByte = 0;

                    // If there are placeholders, only get up to the last complete 4 chars
                    var len = placeHoldersLen > 0 ? validLen - 4 : validLen;

                    var i;
                    for (i = 0; i < len; i += 4) {
                        tmp =
                            (revLookup[b64.charCodeAt(i)] << 18) |
                            (revLookup[b64.charCodeAt(i + 1)] << 12) |
                            (revLookup[b64.charCodeAt(i + 2)] << 6) |
                            revLookup[b64.charCodeAt(i + 3)];
                        arr[curByte++] = (tmp >> 16) & 0xff;
                        arr[curByte++] = (tmp >> 8) & 0xff;
                        arr[curByte++] = tmp & 0xff;
                    }

                    if (placeHoldersLen === 2) {
                        tmp =
                            (revLookup[b64.charCodeAt(i)] << 2) |
                            (revLookup[b64.charCodeAt(i + 1)] >> 4);
                        arr[curByte++] = tmp & 0xff;
                    }

                    if (placeHoldersLen === 1) {
                        tmp =
                            (revLookup[b64.charCodeAt(i)] << 10) |
                            (revLookup[b64.charCodeAt(i + 1)] << 4) |
                            (revLookup[b64.charCodeAt(i + 2)] >> 2);
                        arr[curByte++] = (tmp >> 8) & 0xff;
                        arr[curByte++] = tmp & 0xff;
                    }

                    return arr;
                }

                function tripletToBase64(num) {
                    return (
                        lookup[(num >> 18) & 0x3f] +
                        lookup[(num >> 12) & 0x3f] +
                        lookup[(num >> 6) & 0x3f] +
                        lookup[num & 0x3f]
                    );
                }

                function encodeChunk(uint8, start, end) {
                    var tmp;
                    var output = [];
                    for (var i = start; i < end; i += 3) {
                        tmp =
                            ((uint8[i] << 16) & 0xff0000) +
                            ((uint8[i + 1] << 8) & 0xff00) +
                            (uint8[i + 2] & 0xff);
                        output.push(tripletToBase64(tmp));
                    }
                    return output.join("");
                }

                function fromByteArray(uint8) {
                    var tmp;
                    var len = uint8.length;
                    var extraBytes = len % 3; // If we have 1 byte left, pad 2 bytes
                    var parts = [];
                    var maxChunkLength = 16383; // Must be multiple of 3

                    // go through the array every three bytes, we'll deal with trailing stuff later
                    for (
                        var i = 0, len2 = len - extraBytes;
                        i < len2;
                        i += maxChunkLength
                    ) {
                        parts.push(
                            encodeChunk(
                                uint8,
                                i,
                                i + maxChunkLength > len2 ? len2 : i + maxChunkLength
                            )
                        );
                    }

                    // Pad the end with zeros, but make sure to not forget the extra bytes
                    if (extraBytes === 1) {
                        tmp = uint8[len - 1];
                        parts.push(lookup[tmp >> 2] + lookup[(tmp << 4) & 0x3f] + "==");
                    } else if (extraBytes === 2) {
                        tmp = (uint8[len - 2] << 8) + uint8[len - 1];
                        parts.push(
                            lookup[tmp >> 10] +
                                lookup[(tmp >> 4) & 0x3f] +
                                lookup[(tmp << 2) & 0x3f] +
                                "="
                        );
                    }

                    return parts.join("");
                }
            },
            {},
        ],
        15: [function (require, module, exports) {}, {}],
        16: [
            function (require, module, exports) {
                (function (Buffer) {
                    (function () {
                        /* !
                         * The buffer module from node.js, for the browser.
                         *
                         * @author   Feross Aboukhadijeh <https://feross.org>
                         * @license  MIT
                         */
                        /* eslint-disable no-proto */

                        "use strict";

                        var base64 = require("base64-js");
                        var ieee754 = require("ieee754");

                        exports.Buffer = Buffer;
                        exports.SlowBuffer = SlowBuffer;
                        exports.INSPECT_MAX_BYTES = 50;

                        var K_MAX_LENGTH = 0x7fffffff;
                        exports.kMaxLength = K_MAX_LENGTH;

                        /**
                         * If `Buffer.TYPED_ARRAY_SUPPORT`:
                         *   === true    Use Uint8Array implementation (fastest)
                         *   === false   Print warning and recommend using `buffer` v4.x which has an Object
                         *               implementation (most compatible, even IE6)
                         *
                         * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
                         * Opera 11.6+, iOS 4.2+.
                         *
                         * We report that the browser does not support typed arrays if the are not subclassable
                         * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
                         * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
                         * for __proto__ and has a buggy typed array implementation.
                         */
                        Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();

                        if (
                            !Buffer.TYPED_ARRAY_SUPPORT &&
                            typeof console !== "undefined" &&
                            typeof console.error === "function"
                        ) {
                            console.error(
                                "This browser lacks typed array (Uint8Array) support which is required by " +
                                    "`buffer` v5.x. Use `buffer` v4.x if you require old browser support."
                            );
                        }

                        function typedArraySupport() {
                            // Can typed array instances can be augmented?
                            try {
                                var arr = new Uint8Array(1);
                                arr.__proto__ = {
                                    __proto__: Uint8Array.prototype,
                                    foo: function () {
                                        return 42;
                                    },
                                };
                                return arr.foo() === 42;
                            } catch (e) {
                                return false;
                            }
                        }

                        Object.defineProperty(Buffer.prototype, "parent", {
                            enumerable: true,
                            get: function () {
                                if (!Buffer.isBuffer(this)) return undefined;
                                return this.buffer;
                            },
                        });

                        Object.defineProperty(Buffer.prototype, "offset", {
                            enumerable: true,
                            get: function () {
                                if (!Buffer.isBuffer(this)) return undefined;
                                return this.byteOffset;
                            },
                        });

                        function createBuffer(length) {
                            if (length > K_MAX_LENGTH) {
                                throw new RangeError(
                                    'The value "' +
                                        length +
                                        '" is invalid for option "size"'
                                );
                            }
                            // Return an augmented `Uint8Array` instance
                            var buf = new Uint8Array(length);
                            buf.__proto__ = Buffer.prototype;
                            return buf;
                        }

                        /**
                         * The Buffer constructor returns instances of `Uint8Array` that have their
                         * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
                         * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
                         * and the `Uint8Array` methods. Square bracket notation works as expected -- it
                         * returns a single octet.
                         *
                         * The `Uint8Array` prototype remains unmodified.
                         */

                        function Buffer(arg, encodingOrOffset, length) {
                            // Common case.
                            if (typeof arg === "number") {
                                if (typeof encodingOrOffset === "string") {
                                    throw new TypeError(
                                        'The "string" argument must be of type string. Received type number'
                                    );
                                }
                                return allocUnsafe(arg);
                            }
                            return from(arg, encodingOrOffset, length);
                        }

                        // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
                        if (
                            typeof Symbol !== "undefined" &&
                            Symbol.species != null &&
                            Buffer[Symbol.species] === Buffer
                        ) {
                            Object.defineProperty(Buffer, Symbol.species, {
                                value: null,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                        }

                        Buffer.poolSize = 8192; // Not used by this implementation

                        function from(value, encodingOrOffset, length) {
                            if (typeof value === "string") {
                                return fromString(value, encodingOrOffset);
                            }

                            if (ArrayBuffer.isView(value)) {
                                return fromArrayLike(value);
                            }

                            if (value == null) {
                                throw TypeError(
                                    "The first argument must be one of type string, Buffer, ArrayBuffer, Array, " +
                                        "or Array-like Object. Received type " +
                                        typeof value
                                );
                            }

                            if (
                                isInstance(value, ArrayBuffer) ||
                                (value && isInstance(value.buffer, ArrayBuffer))
                            ) {
                                return fromArrayBuffer(value, encodingOrOffset, length);
                            }

                            if (typeof value === "number") {
                                throw new TypeError(
                                    'The "value" argument must not be of type number. Received type number'
                                );
                            }

                            var valueOf = value.valueOf && value.valueOf();
                            if (valueOf != null && valueOf !== value) {
                                return Buffer.from(valueOf, encodingOrOffset, length);
                            }

                            var b = fromObject(value);
                            if (b) return b;

                            if (
                                typeof Symbol !== "undefined" &&
                                Symbol.toPrimitive != null &&
                                typeof value[Symbol.toPrimitive] === "function"
                            ) {
                                return Buffer.from(
                                    value[Symbol.toPrimitive]("string"),
                                    encodingOrOffset,
                                    length
                                );
                            }

                            throw new TypeError(
                                "The first argument must be one of type string, Buffer, ArrayBuffer, Array, " +
                                    "or Array-like Object. Received type " +
                                    typeof value
                            );
                        }

                        /**
                         * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
                         * if value is a number.
                         * Buffer.from(str[, encoding])
                         * Buffer.from(array)
                         * Buffer.from(buffer)
                         * Buffer.from(arrayBuffer[, byteOffset[, length]])
                         **/
                        Buffer.from = function (value, encodingOrOffset, length) {
                            return from(value, encodingOrOffset, length);
                        };

                        // Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
                        // https://github.com/feross/buffer/pull/148
                        Buffer.prototype.__proto__ = Uint8Array.prototype;
                        Buffer.__proto__ = Uint8Array;

                        function assertSize(size) {
                            if (typeof size !== "number") {
                                throw new TypeError(
                                    '"size" argument must be of type number'
                                );
                            } else if (size < 0) {
                                throw new RangeError(
                                    'The value "' +
                                        size +
                                        '" is invalid for option "size"'
                                );
                            }
                        }

                        function alloc(size, fill, encoding) {
                            assertSize(size);
                            if (size <= 0) {
                                return createBuffer(size);
                            }
                            if (fill !== undefined) {
                                // Only pay attention to encoding if it's a string. This
                                // prevents accidentally sending in a number that would
                                // be interpretted as a start offset.
                                return typeof encoding === "string"
                                    ? createBuffer(size).fill(fill, encoding)
                                    : createBuffer(size).fill(fill);
                            }
                            return createBuffer(size);
                        }

                        /**
                         * Creates a new filled Buffer instance.
                         * alloc(size[, fill[, encoding]])
                         **/
                        Buffer.alloc = function (size, fill, encoding) {
                            return alloc(size, fill, encoding);
                        };

                        function allocUnsafe(size) {
                            assertSize(size);
                            return createBuffer(size < 0 ? 0 : checked(size) | 0);
                        }

                        /**
                         * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
                         * */
                        Buffer.allocUnsafe = function (size) {
                            return allocUnsafe(size);
                        };
                        /**
                         * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
                         */
                        Buffer.allocUnsafeSlow = function (size) {
                            return allocUnsafe(size);
                        };

                        function fromString(string, encoding) {
                            if (typeof encoding !== "string" || encoding === "") {
                                encoding = "utf8";
                            }

                            if (!Buffer.isEncoding(encoding)) {
                                throw new TypeError("Unknown encoding: " + encoding);
                            }

                            var length = byteLength(string, encoding) | 0;
                            var buf = createBuffer(length);

                            var actual = buf.write(string, encoding);

                            if (actual !== length) {
                                // Writing a hex string, for example, that contains invalid characters will
                                // cause everything after the first invalid character to be ignored. (e.g.
                                // 'abxxcd' will be treated as 'ab')
                                buf = buf.slice(0, actual);
                            }

                            return buf;
                        }

                        function fromArrayLike(array) {
                            var length =
                                array.length < 0 ? 0 : checked(array.length) | 0;
                            var buf = createBuffer(length);
                            for (var i = 0; i < length; i += 1) {
                                buf[i] = array[i] & 255;
                            }
                            return buf;
                        }

                        function fromArrayBuffer(array, byteOffset, length) {
                            if (byteOffset < 0 || array.byteLength < byteOffset) {
                                throw new RangeError(
                                    '"offset" is outside of buffer bounds'
                                );
                            }

                            if (array.byteLength < byteOffset + (length || 0)) {
                                throw new RangeError(
                                    '"length" is outside of buffer bounds'
                                );
                            }

                            var buf;
                            if (byteOffset === undefined && length === undefined) {
                                buf = new Uint8Array(array);
                            } else if (length === undefined) {
                                buf = new Uint8Array(array, byteOffset);
                            } else {
                                buf = new Uint8Array(array, byteOffset, length);
                            }

                            // Return an augmented `Uint8Array` instance
                            buf.__proto__ = Buffer.prototype;
                            return buf;
                        }

                        function fromObject(obj) {
                            if (Buffer.isBuffer(obj)) {
                                var len = checked(obj.length) | 0;
                                var buf = createBuffer(len);

                                if (buf.length === 0) {
                                    return buf;
                                }

                                obj.copy(buf, 0, 0, len);
                                return buf;
                            }

                            if (obj.length !== undefined) {
                                if (
                                    typeof obj.length !== "number" ||
                                    numberIsNaN(obj.length)
                                ) {
                                    return createBuffer(0);
                                }
                                return fromArrayLike(obj);
                            }

                            if (obj.type === "Buffer" && Array.isArray(obj.data)) {
                                return fromArrayLike(obj.data);
                            }
                        }

                        function checked(length) {
                            // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
                            // length is NaN (which is otherwise coerced to zero.)
                            if (length >= K_MAX_LENGTH) {
                                throw new RangeError(
                                    "Attempt to allocate Buffer larger than maximum " +
                                        "size: 0x" +
                                        K_MAX_LENGTH.toString(16) +
                                        " bytes"
                                );
                            }
                            return length | 0;
                        }

                        function SlowBuffer(length) {
                            if (Number(length) != length) {
                                // eslint-disable-line eqeqeq
                                length = 0;
                            }
                            return Buffer.alloc(Number(length));
                        }

                        Buffer.isBuffer = function isBuffer(b) {
                            return (
                                b != null &&
                                b._isBuffer === true &&
                                b !== Buffer.prototype
                            ); // So Buffer.isBuffer(Buffer.prototype) will be false
                        };

                        Buffer.compare = function compare(a, b) {
                            if (isInstance(a, Uint8Array))
                                a = Buffer.from(a, a.offset, a.byteLength);
                            if (isInstance(b, Uint8Array))
                                b = Buffer.from(b, b.offset, b.byteLength);
                            if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
                                throw new TypeError(
                                    'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
                                );
                            }

                            if (a === b) return 0;

                            var x = a.length;
                            var y = b.length;

                            for (var i = 0, len = Math.min(x, y); i < len; ++i) {
                                if (a[i] !== b[i]) {
                                    x = a[i];
                                    y = b[i];
                                    break;
                                }
                            }

                            if (x < y) return -1;
                            if (y < x) return 1;
                            return 0;
                        };

                        Buffer.isEncoding = function isEncoding(encoding) {
                            switch (String(encoding).toLowerCase()) {
                                case "hex":
                                case "utf8":
                                case "utf-8":
                                case "ascii":
                                case "latin1":
                                case "binary":
                                case "base64":
                                case "ucs2":
                                case "ucs-2":
                                case "utf16le":
                                case "utf-16le":
                                    return true;
                                default:
                                    return false;
                            }
                        };

                        Buffer.concat = function concat(list, length) {
                            if (!Array.isArray(list)) {
                                throw new TypeError(
                                    '"list" argument must be an Array of Buffers'
                                );
                            }

                            if (list.length === 0) {
                                return Buffer.alloc(0);
                            }

                            var i;
                            if (length === undefined) {
                                length = 0;
                                for (i = 0; i < list.length; ++i) {
                                    length += list[i].length;
                                }
                            }

                            var buffer = Buffer.allocUnsafe(length);
                            var pos = 0;
                            for (i = 0; i < list.length; ++i) {
                                var buf = list[i];
                                if (isInstance(buf, Uint8Array)) {
                                    buf = Buffer.from(buf);
                                }
                                if (!Buffer.isBuffer(buf)) {
                                    throw new TypeError(
                                        '"list" argument must be an Array of Buffers'
                                    );
                                }
                                buf.copy(buffer, pos);
                                pos += buf.length;
                            }
                            return buffer;
                        };

                        function byteLength(string, encoding) {
                            if (Buffer.isBuffer(string)) {
                                return string.length;
                            }
                            if (
                                ArrayBuffer.isView(string) ||
                                isInstance(string, ArrayBuffer)
                            ) {
                                return string.byteLength;
                            }
                            if (typeof string !== "string") {
                                throw new TypeError(
                                    'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
                                        "Received type " +
                                        typeof string
                                );
                            }

                            var len = string.length;
                            var mustMatch =
                                arguments.length > 2 && arguments[2] === true;
                            if (!mustMatch && len === 0) return 0;

                            // Use a for loop to avoid recursion
                            var loweredCase = false;
                            for (;;) {
                                switch (encoding) {
                                    case "ascii":
                                    case "latin1":
                                    case "binary":
                                        return len;
                                    case "utf8":
                                    case "utf-8":
                                        return utf8ToBytes(string).length;
                                    case "ucs2":
                                    case "ucs-2":
                                    case "utf16le":
                                    case "utf-16le":
                                        return len * 2;
                                    case "hex":
                                        return len >>> 1;
                                    case "base64":
                                        return base64ToBytes(string).length;
                                    default:
                                        if (loweredCase) {
                                            return mustMatch
                                                ? -1
                                                : utf8ToBytes(string).length; // Assume utf8
                                        }
                                        encoding = String(encoding).toLowerCase();
                                        loweredCase = true;
                                }
                            }
                        }
                        Buffer.byteLength = byteLength;

                        function slowToString(encoding, start, end) {
                            var loweredCase = false;

                            // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
                            // property of a typed array.

                            // This behaves neither like String nor Uint8Array in that we set start/end
                            // to their upper/lower bounds if the value passed is out of range.
                            // undefined is handled specially as per ECMA-262 6th Edition,
                            // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
                            if (start === undefined || start < 0) {
                                start = 0;
                            }
                            // Return early if start > this.length. Done here to prevent potential uint32
                            // coercion fail below.
                            if (start > this.length) {
                                return "";
                            }

                            if (end === undefined || end > this.length) {
                                end = this.length;
                            }

                            if (end <= 0) {
                                return "";
                            }

                            // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
                            end >>>= 0;
                            start >>>= 0;

                            if (end <= start) {
                                return "";
                            }

                            if (!encoding) encoding = "utf8";

                            while (true) {
                                switch (encoding) {
                                    case "hex":
                                        return hexSlice(this, start, end);

                                    case "utf8":
                                    case "utf-8":
                                        return utf8Slice(this, start, end);

                                    case "ascii":
                                        return asciiSlice(this, start, end);

                                    case "latin1":
                                    case "binary":
                                        return latin1Slice(this, start, end);

                                    case "base64":
                                        return base64Slice(this, start, end);

                                    case "ucs2":
                                    case "ucs-2":
                                    case "utf16le":
                                    case "utf-16le":
                                        return utf16leSlice(this, start, end);

                                    default:
                                        if (loweredCase)
                                            throw new TypeError(
                                                "Unknown encoding: " + encoding
                                            );
                                        encoding = String(encoding).toLowerCase();
                                        loweredCase = true;
                                }
                            }
                        }

                        // This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
                        // to detect a Buffer instance. It's not possible to use `instanceof Buffer`
                        // reliably in a browserify context because there could be multiple different
                        // copies of the 'buffer' package in use. This method works even for Buffer
                        // instances that were created from another copy of the `buffer` package.
                        // See: https://github.com/feross/buffer/issues/154
                        Buffer.prototype._isBuffer = true;

                        function swap(b, n, m) {
                            var i = b[n];
                            b[n] = b[m];
                            b[m] = i;
                        }

                        Buffer.prototype.swap16 = function swap16() {
                            var len = this.length;
                            if (len % 2 !== 0) {
                                throw new RangeError(
                                    "Buffer size must be a multiple of 16-bits"
                                );
                            }
                            for (var i = 0; i < len; i += 2) {
                                swap(this, i, i + 1);
                            }
                            return this;
                        };

                        Buffer.prototype.swap32 = function swap32() {
                            var len = this.length;
                            if (len % 4 !== 0) {
                                throw new RangeError(
                                    "Buffer size must be a multiple of 32-bits"
                                );
                            }
                            for (var i = 0; i < len; i += 4) {
                                swap(this, i, i + 3);
                                swap(this, i + 1, i + 2);
                            }
                            return this;
                        };

                        Buffer.prototype.swap64 = function swap64() {
                            var len = this.length;
                            if (len % 8 !== 0) {
                                throw new RangeError(
                                    "Buffer size must be a multiple of 64-bits"
                                );
                            }
                            for (var i = 0; i < len; i += 8) {
                                swap(this, i, i + 7);
                                swap(this, i + 1, i + 6);
                                swap(this, i + 2, i + 5);
                                swap(this, i + 3, i + 4);
                            }
                            return this;
                        };

                        Buffer.prototype.toString = function toString() {
                            var length = this.length;
                            if (length === 0) return "";
                            if (arguments.length === 0)
                                return utf8Slice(this, 0, length);
                            return slowToString.apply(this, arguments);
                        };

                        Buffer.prototype.toLocaleString = Buffer.prototype.toString;

                        Buffer.prototype.equals = function equals(b) {
                            if (!Buffer.isBuffer(b))
                                throw new TypeError("Argument must be a Buffer");
                            if (this === b) return true;
                            return Buffer.compare(this, b) === 0;
                        };

                        Buffer.prototype.inspect = function inspect() {
                            var str = "";
                            var max = exports.INSPECT_MAX_BYTES;
                            str = this.toString("hex", 0, max)
                                .replace(/(.{2})/g, "$1 ")
                                .trim();
                            if (this.length > max) str += " ... ";
                            return "<Buffer " + str + ">";
                        };

                        Buffer.prototype.compare = function compare(
                            target,
                            start,
                            end,
                            thisStart,
                            thisEnd
                        ) {
                            if (isInstance(target, Uint8Array)) {
                                target = Buffer.from(
                                    target,
                                    target.offset,
                                    target.byteLength
                                );
                            }
                            if (!Buffer.isBuffer(target)) {
                                throw new TypeError(
                                    'The "target" argument must be one of type Buffer or Uint8Array. ' +
                                        "Received type " +
                                        typeof target
                                );
                            }

                            if (start === undefined) {
                                start = 0;
                            }
                            if (end === undefined) {
                                end = target ? target.length : 0;
                            }
                            if (thisStart === undefined) {
                                thisStart = 0;
                            }
                            if (thisEnd === undefined) {
                                thisEnd = this.length;
                            }

                            if (
                                start < 0 ||
                                end > target.length ||
                                thisStart < 0 ||
                                thisEnd > this.length
                            ) {
                                throw new RangeError("out of range index");
                            }

                            if (thisStart >= thisEnd && start >= end) {
                                return 0;
                            }
                            if (thisStart >= thisEnd) {
                                return -1;
                            }
                            if (start >= end) {
                                return 1;
                            }

                            start >>>= 0;
                            end >>>= 0;
                            thisStart >>>= 0;
                            thisEnd >>>= 0;

                            if (this === target) return 0;

                            var x = thisEnd - thisStart;
                            var y = end - start;
                            var len = Math.min(x, y);

                            var thisCopy = this.slice(thisStart, thisEnd);
                            var targetCopy = target.slice(start, end);

                            for (var i = 0; i < len; ++i) {
                                if (thisCopy[i] !== targetCopy[i]) {
                                    x = thisCopy[i];
                                    y = targetCopy[i];
                                    break;
                                }
                            }

                            if (x < y) return -1;
                            if (y < x) return 1;
                            return 0;
                        };

                        // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
                        // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
                        //
                        // Arguments:
                        // - buffer - a Buffer to search
                        // - val - a string, Buffer, or number
                        // - byteOffset - an index into `buffer`; will be clamped to an int32
                        // - encoding - an optional encoding, relevant is val is a string
                        // - dir - true for indexOf, false for lastIndexOf
                        function bidirectionalIndexOf(
                            buffer,
                            val,
                            byteOffset,
                            encoding,
                            dir
                        ) {
                            // Empty buffer means no match
                            if (buffer.length === 0) return -1;

                            // Normalize byteOffset
                            if (typeof byteOffset === "string") {
                                encoding = byteOffset;
                                byteOffset = 0;
                            } else if (byteOffset > 0x7fffffff) {
                                byteOffset = 0x7fffffff;
                            } else if (byteOffset < -0x80000000) {
                                byteOffset = -0x80000000;
                            }
                            byteOffset = Number(byteOffset); // Coerce to Number.
                            if (numberIsNaN(byteOffset)) {
                                // ByteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
                                byteOffset = dir ? 0 : buffer.length - 1;
                            }

                            // Normalize byteOffset: negative offsets start from the end of the buffer
                            if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
                            if (byteOffset >= buffer.length) {
                                if (dir) return -1;
                                byteOffset = buffer.length - 1;
                            } else if (byteOffset < 0) {
                                if (dir) byteOffset = 0;
                                else return -1;
                            }

                            // Normalize val
                            if (typeof val === "string") {
                                val = Buffer.from(val, encoding);
                            }

                            // Finally, search either indexOf (if dir is true) or lastIndexOf
                            if (Buffer.isBuffer(val)) {
                                // Special case: looking for empty string/buffer always fails
                                if (val.length === 0) {
                                    return -1;
                                }
                                return arrayIndexOf(
                                    buffer,
                                    val,
                                    byteOffset,
                                    encoding,
                                    dir
                                );
                            } else if (typeof val === "number") {
                                val &= 0xff; // Search for a byte value [0-255]
                                if (
                                    typeof Uint8Array.prototype.indexOf === "function"
                                ) {
                                    if (dir) {
                                        return Uint8Array.prototype.indexOf.call(
                                            buffer,
                                            val,
                                            byteOffset
                                        );
                                    }
                                    return Uint8Array.prototype.lastIndexOf.call(
                                        buffer,
                                        val,
                                        byteOffset
                                    );
                                }
                                return arrayIndexOf(
                                    buffer,
                                    [val],
                                    byteOffset,
                                    encoding,
                                    dir
                                );
                            }

                            throw new TypeError("val must be string, number or Buffer");
                        }

                        function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
                            var indexSize = 1;
                            var arrLength = arr.length;
                            var valLength = val.length;

                            if (encoding !== undefined) {
                                encoding = String(encoding).toLowerCase();
                                if (
                                    encoding === "ucs2" ||
                                    encoding === "ucs-2" ||
                                    encoding === "utf16le" ||
                                    encoding === "utf-16le"
                                ) {
                                    if (arr.length < 2 || val.length < 2) {
                                        return -1;
                                    }
                                    indexSize = 2;
                                    arrLength /= 2;
                                    valLength /= 2;
                                    byteOffset /= 2;
                                }
                            }

                            function read(buf, i) {
                                if (indexSize === 1) {
                                    return buf[i];
                                }
                                return buf.readUInt16BE(i * indexSize);
                            }

                            var i;
                            if (dir) {
                                var foundIndex = -1;
                                for (i = byteOffset; i < arrLength; i++) {
                                    if (
                                        read(arr, i) ===
                                        read(
                                            val,
                                            foundIndex === -1 ? 0 : i - foundIndex
                                        )
                                    ) {
                                        if (foundIndex === -1) foundIndex = i;
                                        if (i - foundIndex + 1 === valLength)
                                            return foundIndex * indexSize;
                                    } else {
                                        if (foundIndex !== -1) i -= i - foundIndex;
                                        foundIndex = -1;
                                    }
                                }
                            } else {
                                if (byteOffset + valLength > arrLength)
                                    byteOffset = arrLength - valLength;
                                for (i = byteOffset; i >= 0; i--) {
                                    var found = true;
                                    for (var j = 0; j < valLength; j++) {
                                        if (read(arr, i + j) !== read(val, j)) {
                                            found = false;
                                            break;
                                        }
                                    }
                                    if (found) return i;
                                }
                            }

                            return -1;
                        }

                        Buffer.prototype.includes = function includes(
                            val,
                            byteOffset,
                            encoding
                        ) {
                            return this.indexOf(val, byteOffset, encoding) !== -1;
                        };

                        Buffer.prototype.indexOf = function indexOf(
                            val,
                            byteOffset,
                            encoding
                        ) {
                            return bidirectionalIndexOf(
                                this,
                                val,
                                byteOffset,
                                encoding,
                                true
                            );
                        };

                        Buffer.prototype.lastIndexOf = function lastIndexOf(
                            val,
                            byteOffset,
                            encoding
                        ) {
                            return bidirectionalIndexOf(
                                this,
                                val,
                                byteOffset,
                                encoding,
                                false
                            );
                        };

                        function hexWrite(buf, string, offset, length) {
                            offset = Number(offset) || 0;
                            var remaining = buf.length - offset;
                            if (!length) {
                                length = remaining;
                            } else {
                                length = Number(length);
                                if (length > remaining) {
                                    length = remaining;
                                }
                            }

                            var strLen = string.length;

                            if (length > strLen / 2) {
                                length = strLen / 2;
                            }
                            for (var i = 0; i < length; ++i) {
                                var parsed = parseInt(string.substr(i * 2, 2), 16);
                                if (numberIsNaN(parsed)) return i;
                                buf[offset + i] = parsed;
                            }
                            return i;
                        }

                        function utf8Write(buf, string, offset, length) {
                            return blitBuffer(
                                utf8ToBytes(string, buf.length - offset),
                                buf,
                                offset,
                                length
                            );
                        }

                        function asciiWrite(buf, string, offset, length) {
                            return blitBuffer(
                                asciiToBytes(string),
                                buf,
                                offset,
                                length
                            );
                        }

                        function latin1Write(buf, string, offset, length) {
                            return asciiWrite(buf, string, offset, length);
                        }

                        function base64Write(buf, string, offset, length) {
                            return blitBuffer(
                                base64ToBytes(string),
                                buf,
                                offset,
                                length
                            );
                        }

                        function ucs2Write(buf, string, offset, length) {
                            return blitBuffer(
                                utf16leToBytes(string, buf.length - offset),
                                buf,
                                offset,
                                length
                            );
                        }

                        Buffer.prototype.write = function write(
                            string,
                            offset,
                            length,
                            encoding
                        ) {
                            // Buffer#write(string)
                            if (offset === undefined) {
                                encoding = "utf8";
                                length = this.length;
                                offset = 0;
                                // Buffer#write(string, encoding)
                            } else if (
                                length === undefined &&
                                typeof offset === "string"
                            ) {
                                encoding = offset;
                                length = this.length;
                                offset = 0;
                                // Buffer#write(string, offset[, length][, encoding])
                            } else if (isFinite(offset)) {
                                offset >>>= 0;
                                if (isFinite(length)) {
                                    length >>>= 0;
                                    if (encoding === undefined) encoding = "utf8";
                                } else {
                                    encoding = length;
                                    length = undefined;
                                }
                            } else {
                                throw new Error(
                                    "Buffer.write(string, encoding, offset[, length]) is no longer supported"
                                );
                            }

                            var remaining = this.length - offset;
                            if (length === undefined || length > remaining)
                                length = remaining;

                            if (
                                (string.length > 0 && (length < 0 || offset < 0)) ||
                                offset > this.length
                            ) {
                                throw new RangeError(
                                    "Attempt to write outside buffer bounds"
                                );
                            }

                            if (!encoding) encoding = "utf8";

                            var loweredCase = false;
                            for (;;) {
                                switch (encoding) {
                                    case "hex":
                                        return hexWrite(this, string, offset, length);

                                    case "utf8":
                                    case "utf-8":
                                        return utf8Write(this, string, offset, length);

                                    case "ascii":
                                        return asciiWrite(this, string, offset, length);

                                    case "latin1":
                                    case "binary":
                                        return latin1Write(
                                            this,
                                            string,
                                            offset,
                                            length
                                        );

                                    case "base64":
                                        // Warning: maxLength not taken into account in base64Write
                                        return base64Write(
                                            this,
                                            string,
                                            offset,
                                            length
                                        );

                                    case "ucs2":
                                    case "ucs-2":
                                    case "utf16le":
                                    case "utf-16le":
                                        return ucs2Write(this, string, offset, length);

                                    default:
                                        if (loweredCase)
                                            throw new TypeError(
                                                "Unknown encoding: " + encoding
                                            );
                                        encoding = String(encoding).toLowerCase();
                                        loweredCase = true;
                                }
                            }
                        };

                        Buffer.prototype.toJSON = function toJSON() {
                            return {
                                type: "Buffer",
                                data: Array.prototype.slice.call(this._arr || this, 0),
                            };
                        };

                        function base64Slice(buf, start, end) {
                            if (start === 0 && end === buf.length) {
                                return base64.fromByteArray(buf);
                            }
                            return base64.fromByteArray(buf.slice(start, end));
                        }

                        function utf8Slice(buf, start, end) {
                            end = Math.min(buf.length, end);
                            var res = [];

                            var i = start;
                            while (i < end) {
                                var firstByte = buf[i];
                                var codePoint = null;
                                var bytesPerSequence =
                                    firstByte > 0xef
                                        ? 4
                                        : firstByte > 0xdf
                                        ? 3
                                        : firstByte > 0xbf
                                        ? 2
                                        : 1;

                                if (i + bytesPerSequence <= end) {
                                    var secondByte,
                                        thirdByte,
                                        fourthByte,
                                        tempCodePoint;

                                    switch (bytesPerSequence) {
                                        case 1:
                                            if (firstByte < 0x80) {
                                                codePoint = firstByte;
                                            }
                                            break;
                                        case 2:
                                            secondByte = buf[i + 1];
                                            if ((secondByte & 0xc0) === 0x80) {
                                                tempCodePoint =
                                                    ((firstByte & 0x1f) << 0x6) |
                                                    (secondByte & 0x3f);
                                                if (tempCodePoint > 0x7f) {
                                                    codePoint = tempCodePoint;
                                                }
                                            }
                                            break;
                                        case 3:
                                            secondByte = buf[i + 1];
                                            thirdByte = buf[i + 2];
                                            if (
                                                (secondByte & 0xc0) === 0x80 &&
                                                (thirdByte & 0xc0) === 0x80
                                            ) {
                                                tempCodePoint =
                                                    ((firstByte & 0xf) << 0xc) |
                                                    ((secondByte & 0x3f) << 0x6) |
                                                    (thirdByte & 0x3f);
                                                if (
                                                    tempCodePoint > 0x7ff &&
                                                    (tempCodePoint < 0xd800 ||
                                                        tempCodePoint > 0xdfff)
                                                ) {
                                                    codePoint = tempCodePoint;
                                                }
                                            }
                                            break;
                                        case 4:
                                            secondByte = buf[i + 1];
                                            thirdByte = buf[i + 2];
                                            fourthByte = buf[i + 3];
                                            if (
                                                (secondByte & 0xc0) === 0x80 &&
                                                (thirdByte & 0xc0) === 0x80 &&
                                                (fourthByte & 0xc0) === 0x80
                                            ) {
                                                tempCodePoint =
                                                    ((firstByte & 0xf) << 0x12) |
                                                    ((secondByte & 0x3f) << 0xc) |
                                                    ((thirdByte & 0x3f) << 0x6) |
                                                    (fourthByte & 0x3f);
                                                if (
                                                    tempCodePoint > 0xffff &&
                                                    tempCodePoint < 0x110000
                                                ) {
                                                    codePoint = tempCodePoint;
                                                }
                                            }
                                    }
                                }

                                if (codePoint === null) {
                                    // We did not generate a valid codePoint so insert a
                                    // replacement char (U+FFFD) and advance only 1 byte
                                    codePoint = 0xfffd;
                                    bytesPerSequence = 1;
                                } else if (codePoint > 0xffff) {
                                    // Encode to utf16 (surrogate pair dance)
                                    codePoint -= 0x10000;
                                    res.push(((codePoint >>> 10) & 0x3ff) | 0xd800);
                                    codePoint = 0xdc00 | (codePoint & 0x3ff);
                                }

                                res.push(codePoint);
                                i += bytesPerSequence;
                            }

                            return decodeCodePointsArray(res);
                        }

                        // Based on http://stackoverflow.com/a/22747272/680742, the browser with
                        // the lowest limit is Chrome, with 0x10000 args.
                        // We go 1 magnitude less, for safety
                        var MAX_ARGUMENTS_LENGTH = 0x1000;

                        function decodeCodePointsArray(codePoints) {
                            var len = codePoints.length;
                            if (len <= MAX_ARGUMENTS_LENGTH) {
                                return String.fromCharCode.apply(String, codePoints); // Avoid extra slice()
                            }

                            // Decode in chunks to avoid "call stack size exceeded".
                            var res = "";
                            var i = 0;
                            while (i < len) {
                                res += String.fromCharCode.apply(
                                    String,
                                    codePoints.slice(i, (i += MAX_ARGUMENTS_LENGTH))
                                );
                            }
                            return res;
                        }

                        function asciiSlice(buf, start, end) {
                            var ret = "";
                            end = Math.min(buf.length, end);

                            for (var i = start; i < end; ++i) {
                                ret += String.fromCharCode(buf[i] & 0x7f);
                            }
                            return ret;
                        }

                        function latin1Slice(buf, start, end) {
                            var ret = "";
                            end = Math.min(buf.length, end);

                            for (var i = start; i < end; ++i) {
                                ret += String.fromCharCode(buf[i]);
                            }
                            return ret;
                        }

                        function hexSlice(buf, start, end) {
                            var len = buf.length;

                            if (!start || start < 0) start = 0;
                            if (!end || end < 0 || end > len) end = len;

                            var out = "";
                            for (var i = start; i < end; ++i) {
                                out += toHex(buf[i]);
                            }
                            return out;
                        }

                        function utf16leSlice(buf, start, end) {
                            var bytes = buf.slice(start, end);
                            var res = "";
                            for (var i = 0; i < bytes.length; i += 2) {
                                res += String.fromCharCode(
                                    bytes[i] + bytes[i + 1] * 256
                                );
                            }
                            return res;
                        }

                        Buffer.prototype.slice = function slice(start, end) {
                            var len = this.length;
                            start = ~~start;
                            end = end === undefined ? len : ~~end;

                            if (start < 0) {
                                start += len;
                                if (start < 0) start = 0;
                            } else if (start > len) {
                                start = len;
                            }

                            if (end < 0) {
                                end += len;
                                if (end < 0) end = 0;
                            } else if (end > len) {
                                end = len;
                            }

                            if (end < start) end = start;

                            var newBuf = this.subarray(start, end);
                            // Return an augmented `Uint8Array` instance
                            newBuf.__proto__ = Buffer.prototype;
                            return newBuf;
                        };

                        /*
                         * Need to make sure that buffer isn't trying to write out of bounds.
                         */
                        function checkOffset(offset, ext, length) {
                            if (offset % 1 !== 0 || offset < 0)
                                throw new RangeError("offset is not uint");
                            if (offset + ext > length)
                                throw new RangeError(
                                    "Trying to access beyond buffer length"
                                );
                        }

                        Buffer.prototype.readUIntLE = function readUIntLE(
                            offset,
                            byteLength,
                            noAssert
                        ) {
                            offset >>>= 0;
                            byteLength >>>= 0;
                            if (!noAssert) checkOffset(offset, byteLength, this.length);

                            var val = this[offset];
                            var mul = 1;
                            var i = 0;
                            while (++i < byteLength && (mul *= 0x100)) {
                                val += this[offset + i] * mul;
                            }

                            return val;
                        };

                        Buffer.prototype.readUIntBE = function readUIntBE(
                            offset,
                            byteLength,
                            noAssert
                        ) {
                            offset >>>= 0;
                            byteLength >>>= 0;
                            if (!noAssert) {
                                checkOffset(offset, byteLength, this.length);
                            }

                            var val = this[offset + --byteLength];
                            var mul = 1;
                            while (byteLength > 0 && (mul *= 0x100)) {
                                val += this[offset + --byteLength] * mul;
                            }

                            return val;
                        };

                        Buffer.prototype.readUInt8 = function readUInt8(
                            offset,
                            noAssert
                        ) {
                            offset >>>= 0;
                            if (!noAssert) checkOffset(offset, 1, this.length);
                            return this[offset];
                        };

                        Buffer.prototype.readUInt16LE = function readUInt16LE(
                            offset,
                            noAssert
                        ) {
                            offset >>>= 0;
                            if (!noAssert) checkOffset(offset, 2, this.length);
                            return this[offset] | (this[offset + 1] << 8);
                        };

                        Buffer.prototype.readUInt16BE = function readUInt16BE(
                            offset,
                            noAssert
                        ) {
                            offset >>>= 0;
                            if (!noAssert) checkOffset(offset, 2, this.length);
                            return (this[offset] << 8) | this[offset + 1];
                        };

                        Buffer.prototype.readUInt32LE = function readUInt32LE(
                            offset,
                            noAssert
                        ) {
                            offset >>>= 0;
                            if (!noAssert) checkOffset(offset, 4, this.length);

                            return (
                                (this[offset] |
                                    (this[offset + 1] << 8) |
                                    (this[offset + 2] << 16)) +
                                this[offset + 3] * 0x1000000
                            );
                        };

                        Buffer.prototype.readUInt32BE = function readUInt32BE(
                            offset,
                            noAssert
                        ) {
                            offset >>>= 0;
                            if (!noAssert) checkOffset(offset, 4, this.length);

                            return (
                                this[offset] * 0x1000000 +
                                ((this[offset + 1] << 16) |
                                    (this[offset + 2] << 8) |
                                    this[offset + 3])
                            );
                        };

                        Buffer.prototype.readIntLE = function readIntLE(
                            offset,
                            byteLength,
                            noAssert
                        ) {
                            offset >>>= 0;
                            byteLength >>>= 0;
                            if (!noAssert) checkOffset(offset, byteLength, this.length);

                            var val = this[offset];
                            var mul = 1;
                            var i = 0;
                            while (++i < byteLength && (mul *= 0x100)) {
                                val += this[offset + i] * mul;
                            }
                            mul *= 0x80;

                            if (val >= mul) val -= Math.pow(2, 8 * byteLength);

                            return val;
                        };

                        Buffer.prototype.readIntBE = function readIntBE(
                            offset,
                            byteLength,
                            noAssert
                        ) {
                            offset >>>= 0;
                            byteLength >>>= 0;
                            if (!noAssert) checkOffset(offset, byteLength, this.length);

                            var i = byteLength;
                            var mul = 1;
                            var val = this[offset + --i];
                            while (i > 0 && (mul *= 0x100)) {
                                val += this[offset + --i] * mul;
                            }
                            mul *= 0x80;

                            if (val >= mul) val -= Math.pow(2, 8 * byteLength);

                            return val;
                        };

                        Buffer.prototype.readInt8 = function readInt8(
                            offset,
                            noAssert
                        ) {
                            offset >>>= 0;
                            if (!noAssert) checkOffset(offset, 1, this.length);
                            if (!(this[offset] & 0x80)) return this[offset];
                            return (0xff - this[offset] + 1) * -1;
                        };

                        Buffer.prototype.readInt16LE = function readInt16LE(
                            offset,
                            noAssert
                        ) {
                            offset >>>= 0;
                            if (!noAssert) checkOffset(offset, 2, this.length);
                            var val = this[offset] | (this[offset + 1] << 8);
                            return val & 0x8000 ? val | 0xffff0000 : val;
                        };

                        Buffer.prototype.readInt16BE = function readInt16BE(
                            offset,
                            noAssert
                        ) {
                            offset >>>= 0;
                            if (!noAssert) checkOffset(offset, 2, this.length);
                            var val = this[offset + 1] | (this[offset] << 8);
                            return val & 0x8000 ? val | 0xffff0000 : val;
                        };

                        Buffer.prototype.readInt32LE = function readInt32LE(
                            offset,
                            noAssert
                        ) {
                            offset >>>= 0;
                            if (!noAssert) checkOffset(offset, 4, this.length);

                            return (
                                this[offset] |
                                (this[offset + 1] << 8) |
                                (this[offset + 2] << 16) |
                                (this[offset + 3] << 24)
                            );
                        };

                        Buffer.prototype.readInt32BE = function readInt32BE(
                            offset,
                            noAssert
                        ) {
                            offset >>>= 0;
                            if (!noAssert) checkOffset(offset, 4, this.length);

                            return (
                                (this[offset] << 24) |
                                (this[offset + 1] << 16) |
                                (this[offset + 2] << 8) |
                                this[offset + 3]
                            );
                        };

                        Buffer.prototype.readFloatLE = function readFloatLE(
                            offset,
                            noAssert
                        ) {
                            offset >>>= 0;
                            if (!noAssert) checkOffset(offset, 4, this.length);
                            return ieee754.read(this, offset, true, 23, 4);
                        };

                        Buffer.prototype.readFloatBE = function readFloatBE(
                            offset,
                            noAssert
                        ) {
                            offset >>>= 0;
                            if (!noAssert) checkOffset(offset, 4, this.length);
                            return ieee754.read(this, offset, false, 23, 4);
                        };

                        Buffer.prototype.readDoubleLE = function readDoubleLE(
                            offset,
                            noAssert
                        ) {
                            offset >>>= 0;
                            if (!noAssert) checkOffset(offset, 8, this.length);
                            return ieee754.read(this, offset, true, 52, 8);
                        };

                        Buffer.prototype.readDoubleBE = function readDoubleBE(
                            offset,
                            noAssert
                        ) {
                            offset >>>= 0;
                            if (!noAssert) checkOffset(offset, 8, this.length);
                            return ieee754.read(this, offset, false, 52, 8);
                        };

                        function checkInt(buf, value, offset, ext, max, min) {
                            if (!Buffer.isBuffer(buf))
                                throw new TypeError(
                                    '"buffer" argument must be a Buffer instance'
                                );
                            if (value > max || value < min)
                                throw new RangeError(
                                    '"value" argument is out of bounds'
                                );
                            if (offset + ext > buf.length)
                                throw new RangeError("Index out of range");
                        }

                        Buffer.prototype.writeUIntLE = function writeUIntLE(
                            value,
                            offset,
                            byteLength,
                            noAssert
                        ) {
                            value = Number(value);
                            offset >>>= 0;
                            byteLength >>>= 0;
                            if (!noAssert) {
                                var maxBytes = Math.pow(2, 8 * byteLength) - 1;
                                checkInt(this, value, offset, byteLength, maxBytes, 0);
                            }

                            var mul = 1;
                            var i = 0;
                            this[offset] = value & 0xff;
                            while (++i < byteLength && (mul *= 0x100)) {
                                this[offset + i] = (value / mul) & 0xff;
                            }

                            return offset + byteLength;
                        };

                        Buffer.prototype.writeUIntBE = function writeUIntBE(
                            value,
                            offset,
                            byteLength,
                            noAssert
                        ) {
                            value = Number(value);
                            offset >>>= 0;
                            byteLength >>>= 0;
                            if (!noAssert) {
                                var maxBytes = Math.pow(2, 8 * byteLength) - 1;
                                checkInt(this, value, offset, byteLength, maxBytes, 0);
                            }

                            var i = byteLength - 1;
                            var mul = 1;
                            this[offset + i] = value & 0xff;
                            while (--i >= 0 && (mul *= 0x100)) {
                                this[offset + i] = (value / mul) & 0xff;
                            }

                            return offset + byteLength;
                        };

                        Buffer.prototype.writeUInt8 = function writeUInt8(
                            value,
                            offset,
                            noAssert
                        ) {
                            value = Number(value);
                            offset >>>= 0;
                            if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
                            this[offset] = value & 0xff;
                            return offset + 1;
                        };

                        Buffer.prototype.writeUInt16LE = function writeUInt16LE(
                            value,
                            offset,
                            noAssert
                        ) {
                            value = Number(value);
                            offset >>>= 0;
                            if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
                            this[offset] = value & 0xff;
                            this[offset + 1] = value >>> 8;
                            return offset + 2;
                        };

                        Buffer.prototype.writeUInt16BE = function writeUInt16BE(
                            value,
                            offset,
                            noAssert
                        ) {
                            value = Number(value);
                            offset >>>= 0;
                            if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
                            this[offset] = value >>> 8;
                            this[offset + 1] = value & 0xff;
                            return offset + 2;
                        };

                        Buffer.prototype.writeUInt32LE = function writeUInt32LE(
                            value,
                            offset,
                            noAssert
                        ) {
                            value = Number(value);
                            offset >>>= 0;
                            if (!noAssert)
                                checkInt(this, value, offset, 4, 0xffffffff, 0);
                            this[offset + 3] = value >>> 24;
                            this[offset + 2] = value >>> 16;
                            this[offset + 1] = value >>> 8;
                            this[offset] = value & 0xff;
                            return offset + 4;
                        };

                        Buffer.prototype.writeUInt32BE = function writeUInt32BE(
                            value,
                            offset,
                            noAssert
                        ) {
                            value = Number(value);
                            offset >>>= 0;
                            if (!noAssert)
                                checkInt(this, value, offset, 4, 0xffffffff, 0);
                            this[offset] = value >>> 24;
                            this[offset + 1] = value >>> 16;
                            this[offset + 2] = value >>> 8;
                            this[offset + 3] = value & 0xff;
                            return offset + 4;
                        };

                        Buffer.prototype.writeIntLE = function writeIntLE(
                            value,
                            offset,
                            byteLength,
                            noAssert
                        ) {
                            value = Number(value);
                            offset >>>= 0;
                            if (!noAssert) {
                                var limit = Math.pow(2, 8 * byteLength - 1);

                                checkInt(
                                    this,
                                    value,
                                    offset,
                                    byteLength,
                                    limit - 1,
                                    -limit
                                );
                            }

                            var i = 0;
                            var mul = 1;
                            var sub = 0;
                            this[offset] = value & 0xff;
                            while (++i < byteLength && (mul *= 0x100)) {
                                if (
                                    value < 0 &&
                                    sub === 0 &&
                                    this[offset + i - 1] !== 0
                                ) {
                                    sub = 1;
                                }
                                this[offset + i] = (((value / mul) >> 0) - sub) & 0xff;
                            }

                            return offset + byteLength;
                        };

                        Buffer.prototype.writeIntBE = function writeIntBE(
                            value,
                            offset,
                            byteLength,
                            noAssert
                        ) {
                            value = Number(value);
                            offset >>>= 0;
                            if (!noAssert) {
                                var limit = Math.pow(2, 8 * byteLength - 1);

                                checkInt(
                                    this,
                                    value,
                                    offset,
                                    byteLength,
                                    limit - 1,
                                    -limit
                                );
                            }

                            var i = byteLength - 1;
                            var mul = 1;
                            var sub = 0;
                            this[offset + i] = value & 0xff;
                            while (--i >= 0 && (mul *= 0x100)) {
                                if (
                                    value < 0 &&
                                    sub === 0 &&
                                    this[offset + i + 1] !== 0
                                ) {
                                    sub = 1;
                                }
                                this[offset + i] = (((value / mul) >> 0) - sub) & 0xff;
                            }

                            return offset + byteLength;
                        };

                        Buffer.prototype.writeInt8 = function writeInt8(
                            value,
                            offset,
                            noAssert
                        ) {
                            value = Number(value);
                            offset >>>= 0;
                            if (!noAssert)
                                checkInt(this, value, offset, 1, 0x7f, -0x80);
                            if (value < 0) value = 0xff + value + 1;
                            this[offset] = value & 0xff;
                            return offset + 1;
                        };

                        Buffer.prototype.writeInt16LE = function writeInt16LE(
                            value,
                            offset,
                            noAssert
                        ) {
                            value = Number(value);
                            offset >>>= 0;
                            if (!noAssert)
                                checkInt(this, value, offset, 2, 0x7fff, -0x8000);
                            this[offset] = value & 0xff;
                            this[offset + 1] = value >>> 8;
                            return offset + 2;
                        };

                        Buffer.prototype.writeInt16BE = function writeInt16BE(
                            value,
                            offset,
                            noAssert
                        ) {
                            value = Number(value);
                            offset >>>= 0;
                            if (!noAssert)
                                checkInt(this, value, offset, 2, 0x7fff, -0x8000);
                            this[offset] = value >>> 8;
                            this[offset + 1] = value & 0xff;
                            return offset + 2;
                        };

                        Buffer.prototype.writeInt32LE = function writeInt32LE(
                            value,
                            offset,
                            noAssert
                        ) {
                            value = Number(value);
                            offset >>>= 0;
                            if (!noAssert)
                                checkInt(
                                    this,
                                    value,
                                    offset,
                                    4,
                                    0x7fffffff,
                                    -0x80000000
                                );
                            this[offset] = value & 0xff;
                            this[offset + 1] = value >>> 8;
                            this[offset + 2] = value >>> 16;
                            this[offset + 3] = value >>> 24;
                            return offset + 4;
                        };

                        Buffer.prototype.writeInt32BE = function writeInt32BE(
                            value,
                            offset,
                            noAssert
                        ) {
                            value = Number(value);
                            offset >>>= 0;
                            if (!noAssert)
                                checkInt(
                                    this,
                                    value,
                                    offset,
                                    4,
                                    0x7fffffff,
                                    -0x80000000
                                );
                            if (value < 0) value = 0xffffffff + value + 1;
                            this[offset] = value >>> 24;
                            this[offset + 1] = value >>> 16;
                            this[offset + 2] = value >>> 8;
                            this[offset + 3] = value & 0xff;
                            return offset + 4;
                        };

                        function checkIEEE754(buf, value, offset, ext, max, min) {
                            if (offset + ext > buf.length)
                                throw new RangeError("Index out of range");
                            if (offset < 0) throw new RangeError("Index out of range");
                        }

                        function writeFloat(
                            buf,
                            value,
                            offset,
                            littleEndian,
                            noAssert
                        ) {
                            value = Number(value);
                            offset >>>= 0;
                            if (!noAssert) {
                                checkIEEE754(
                                    buf,
                                    value,
                                    offset,
                                    4,
                                    3.4028234663852886e38,
                                    -3.4028234663852886e38
                                );
                            }
                            ieee754.write(buf, value, offset, littleEndian, 23, 4);
                            return offset + 4;
                        }

                        Buffer.prototype.writeFloatLE = function writeFloatLE(
                            value,
                            offset,
                            noAssert
                        ) {
                            return writeFloat(this, value, offset, true, noAssert);
                        };

                        Buffer.prototype.writeFloatBE = function writeFloatBE(
                            value,
                            offset,
                            noAssert
                        ) {
                            return writeFloat(this, value, offset, false, noAssert);
                        };

                        function writeDouble(
                            buf,
                            value,
                            offset,
                            littleEndian,
                            noAssert
                        ) {
                            value = Number(value);
                            offset >>>= 0;
                            if (!noAssert) {
                                checkIEEE754(
                                    buf,
                                    value,
                                    offset,
                                    8,
                                    1.7976931348623157e308,
                                    -1.7976931348623157e308
                                );
                            }
                            ieee754.write(buf, value, offset, littleEndian, 52, 8);
                            return offset + 8;
                        }

                        Buffer.prototype.writeDoubleLE = function writeDoubleLE(
                            value,
                            offset,
                            noAssert
                        ) {
                            return writeDouble(this, value, offset, true, noAssert);
                        };

                        Buffer.prototype.writeDoubleBE = function writeDoubleBE(
                            value,
                            offset,
                            noAssert
                        ) {
                            return writeDouble(this, value, offset, false, noAssert);
                        };

                        // Copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
                        Buffer.prototype.copy = function copy(
                            target,
                            targetStart,
                            start,
                            end
                        ) {
                            if (!Buffer.isBuffer(target))
                                throw new TypeError("argument should be a Buffer");
                            if (!start) start = 0;
                            if (!end && end !== 0) end = this.length;
                            if (targetStart >= target.length)
                                targetStart = target.length;
                            if (!targetStart) targetStart = 0;
                            if (end > 0 && end < start) end = start;

                            // Copy 0 bytes; we're done
                            if (end === start) return 0;
                            if (target.length === 0 || this.length === 0) return 0;

                            // Fatal error conditions
                            if (targetStart < 0) {
                                throw new RangeError("targetStart out of bounds");
                            }
                            if (start < 0 || start >= this.length)
                                throw new RangeError("Index out of range");
                            if (end < 0)
                                throw new RangeError("sourceEnd out of bounds");

                            // Are we oob?
                            if (end > this.length) end = this.length;
                            if (target.length - targetStart < end - start) {
                                end = target.length - targetStart + start;
                            }

                            var len = end - start;

                            if (
                                this === target &&
                                typeof Uint8Array.prototype.copyWithin === "function"
                            ) {
                                // Use built-in when available, missing from IE11
                                this.copyWithin(targetStart, start, end);
                            } else if (
                                this === target &&
                                start < targetStart &&
                                targetStart < end
                            ) {
                                // Descending copy from end
                                for (var i = len - 1; i >= 0; --i) {
                                    target[i + targetStart] = this[i + start];
                                }
                            } else {
                                Uint8Array.prototype.set.call(
                                    target,
                                    this.subarray(start, end),
                                    targetStart
                                );
                            }

                            return len;
                        };

                        // Usage:
                        //    buffer.fill(number[, offset[, end]])
                        //    buffer.fill(buffer[, offset[, end]])
                        //    buffer.fill(string[, offset[, end]][, encoding])
                        Buffer.prototype.fill = function fill(
                            val,
                            start,
                            end,
                            encoding
                        ) {
                            // Handle string cases:
                            if (typeof val === "string") {
                                if (typeof start === "string") {
                                    encoding = start;
                                    start = 0;
                                    end = this.length;
                                } else if (typeof end === "string") {
                                    encoding = end;
                                    end = this.length;
                                }
                                if (
                                    encoding !== undefined &&
                                    typeof encoding !== "string"
                                ) {
                                    throw new TypeError("encoding must be a string");
                                }
                                if (
                                    typeof encoding === "string" &&
                                    !Buffer.isEncoding(encoding)
                                ) {
                                    throw new TypeError(
                                        "Unknown encoding: " + encoding
                                    );
                                }
                                if (val.length === 1) {
                                    var code = val.charCodeAt(0);
                                    if (
                                        (encoding === "utf8" && code < 128) ||
                                        encoding === "latin1"
                                    ) {
                                        // Fast path: If `val` fits into a single byte, use that numeric value.
                                        val = code;
                                    }
                                }
                            } else if (typeof val === "number") {
                                val &= 255;
                            }

                            // Invalid ranges are not set to a default, so can range check early.
                            if (start < 0 || this.length < start || this.length < end) {
                                throw new RangeError("Out of range index");
                            }

                            if (end <= start) {
                                return this;
                            }

                            start >>>= 0;
                            end = end === undefined ? this.length : end >>> 0;

                            if (!val) val = 0;

                            var i;
                            if (typeof val === "number") {
                                for (i = start; i < end; ++i) {
                                    this[i] = val;
                                }
                            } else {
                                var bytes = Buffer.isBuffer(val)
                                    ? val
                                    : Buffer.from(val, encoding);
                                var len = bytes.length;
                                if (len === 0) {
                                    throw new TypeError(
                                        'The value "' +
                                            val +
                                            '" is invalid for argument "value"'
                                    );
                                }
                                for (i = 0; i < end - start; ++i) {
                                    this[i + start] = bytes[i % len];
                                }
                            }

                            return this;
                        };

                        // HELPER FUNCTIONS
                        // ================

                        var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;

                        function base64clean(str) {
                            // Node takes equal signs as end of the Base64 encoding
                            str = str.split("=")[0];
                            // Node strips out invalid characters like \n and \t from the string, base64-js does not
                            str = str.trim().replace(INVALID_BASE64_RE, "");
                            // Node converts strings with length < 2 to ''
                            if (str.length < 2) return "";
                            // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
                            while (str.length % 4 !== 0) {
                                str += "=";
                            }
                            return str;
                        }

                        function toHex(n) {
                            if (n < 16) return "0" + n.toString(16);
                            return n.toString(16);
                        }

                        function utf8ToBytes(string, units) {
                            units = units || Infinity;
                            var codePoint;
                            var length = string.length;
                            var leadSurrogate = null;
                            var bytes = [];

                            for (var i = 0; i < length; ++i) {
                                codePoint = string.charCodeAt(i);

                                // Is surrogate component
                                if (codePoint > 0xd7ff && codePoint < 0xe000) {
                                    // Last char was a lead
                                    if (!leadSurrogate) {
                                        // No lead yet
                                        if (codePoint > 0xdbff) {
                                            // Unexpected trail
                                            if ((units -= 3) > -1)
                                                bytes.push(0xef, 0xbf, 0xbd);
                                            continue;
                                        } else if (i + 1 === length) {
                                            // Unpaired lead
                                            if ((units -= 3) > -1)
                                                bytes.push(0xef, 0xbf, 0xbd);
                                            continue;
                                        }

                                        // Valid lead
                                        leadSurrogate = codePoint;

                                        continue;
                                    }

                                    // 2 leads in a row
                                    if (codePoint < 0xdc00) {
                                        if ((units -= 3) > -1)
                                            bytes.push(0xef, 0xbf, 0xbd);
                                        leadSurrogate = codePoint;
                                        continue;
                                    }

                                    // Valid surrogate pair
                                    codePoint =
                                        (((leadSurrogate - 0xd800) << 10) |
                                            (codePoint - 0xdc00)) +
                                        0x10000;
                                } else if (leadSurrogate) {
                                    // Valid bmp char, but last char was a lead
                                    if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
                                }

                                leadSurrogate = null;

                                // Encode utf8
                                if (codePoint < 0x80) {
                                    if ((units -= 1) < 0) break;
                                    bytes.push(codePoint);
                                } else if (codePoint < 0x800) {
                                    if ((units -= 2) < 0) break;
                                    bytes.push(
                                        (codePoint >> 0x6) | 0xc0,
                                        (codePoint & 0x3f) | 0x80
                                    );
                                } else if (codePoint < 0x10000) {
                                    if ((units -= 3) < 0) break;
                                    bytes.push(
                                        (codePoint >> 0xc) | 0xe0,
                                        ((codePoint >> 0x6) & 0x3f) | 0x80,
                                        (codePoint & 0x3f) | 0x80
                                    );
                                } else if (codePoint < 0x110000) {
                                    if ((units -= 4) < 0) break;
                                    bytes.push(
                                        (codePoint >> 0x12) | 0xf0,
                                        ((codePoint >> 0xc) & 0x3f) | 0x80,
                                        ((codePoint >> 0x6) & 0x3f) | 0x80,
                                        (codePoint & 0x3f) | 0x80
                                    );
                                } else {
                                    throw new Error("Invalid code point");
                                }
                            }

                            return bytes;
                        }

                        function asciiToBytes(str) {
                            var byteArray = [];
                            for (var i = 0; i < str.length; ++i) {
                                // Node's code seems to be doing this and not & 0x7F..
                                byteArray.push(str.charCodeAt(i) & 0xff);
                            }
                            return byteArray;
                        }

                        function utf16leToBytes(str, units) {
                            var c, hi, lo;
                            var byteArray = [];
                            for (var i = 0; i < str.length; ++i) {
                                if ((units -= 2) < 0) break;

                                c = str.charCodeAt(i);
                                hi = c >> 8;
                                lo = c % 256;
                                byteArray.push(lo);
                                byteArray.push(hi);
                            }

                            return byteArray;
                        }

                        function base64ToBytes(str) {
                            return base64.toByteArray(base64clean(str));
                        }

                        function blitBuffer(src, dst, offset, length) {
                            for (var i = 0; i < length; ++i) {
                                if (i + offset >= dst.length || i >= src.length) break;
                                dst[i + offset] = src[i];
                            }
                            return i;
                        }

                        // ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
                        // the `instanceof` check but they should be treated as of that type.
                        // See: https://github.com/feross/buffer/issues/166
                        function isInstance(obj, type) {
                            return (
                                obj instanceof type ||
                                (obj != null &&
                                    obj.constructor != null &&
                                    obj.constructor.name != null &&
                                    obj.constructor.name === type.name)
                            );
                        }
                        function numberIsNaN(obj) {
                            // For IE11 support
                            return obj !== obj; // eslint-disable-line no-self-compare
                        }
                    }.call(this));
                }.call(this, require("buffer").Buffer));
            },
            {"base64-js": 14, buffer: 16, ieee754: 20},
        ],
        17: [
            function (require, module, exports) {
                module.exports = {
                    100: "Continue",
                    101: "Switching Protocols",
                    102: "Processing",
                    200: "OK",
                    201: "Created",
                    202: "Accepted",
                    203: "Non-Authoritative Information",
                    204: "No Content",
                    205: "Reset Content",
                    206: "Partial Content",
                    207: "Multi-Status",
                    208: "Already Reported",
                    226: "IM Used",
                    300: "Multiple Choices",
                    301: "Moved Permanently",
                    302: "Found",
                    303: "See Other",
                    304: "Not Modified",
                    305: "Use Proxy",
                    307: "Temporary Redirect",
                    308: "Permanent Redirect",
                    400: "Bad Request",
                    401: "Unauthorized",
                    402: "Payment Required",
                    403: "Forbidden",
                    404: "Not Found",
                    405: "Method Not Allowed",
                    406: "Not Acceptable",
                    407: "Proxy Authentication Required",
                    408: "Request Timeout",
                    409: "Conflict",
                    410: "Gone",
                    411: "Length Required",
                    412: "Precondition Failed",
                    413: "Payload Too Large",
                    414: "URI Too Long",
                    415: "Unsupported Media Type",
                    416: "Range Not Satisfiable",
                    417: "Expectation Failed",
                    418: "I'm a teapot",
                    421: "Misdirected Request",
                    422: "Unprocessable Entity",
                    423: "Locked",
                    424: "Failed Dependency",
                    425: "Unordered Collection",
                    426: "Upgrade Required",
                    428: "Precondition Required",
                    429: "Too Many Requests",
                    431: "Request Header Fields Too Large",
                    451: "Unavailable For Legal Reasons",
                    500: "Internal Server Error",
                    501: "Not Implemented",
                    502: "Bad Gateway",
                    503: "Service Unavailable",
                    504: "Gateway Timeout",
                    505: "HTTP Version Not Supported",
                    506: "Variant Also Negotiates",
                    507: "Insufficient Storage",
                    508: "Loop Detected",
                    509: "Bandwidth Limit Exceeded",
                    510: "Not Extended",
                    511: "Network Authentication Required",
                };
            },
            {},
        ],
        18: [
            function (require, module, exports) {
                // Copyright Joyent, Inc. and other Node contributors.
                //
                // Permission is hereby granted, free of charge, to any person obtaining a
                // copy of this software and associated documentation files (the
                // "Software"), to deal in the Software without restriction, including
                // without limitation the rights to use, copy, modify, merge, publish,
                // distribute, sublicense, and/or sell copies of the Software, and to permit
                // persons to whom the Software is furnished to do so, subject to the
                // following conditions:
                //
                // The above copyright notice and this permission notice shall be included
                // in all copies or substantial portions of the Software.
                //
                // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
                // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
                // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
                // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
                // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
                // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
                // USE OR OTHER DEALINGS IN THE SOFTWARE.

                "use strict";

                var R = typeof Reflect === "object" ? Reflect : null;
                var ReflectApply =
                    R && typeof R.apply === "function"
                        ? R.apply
                        : function ReflectApply(target, receiver, args) {
                              return Function.prototype.apply.call(
                                  target,
                                  receiver,
                                  args
                              );
                          };

                var ReflectOwnKeys;
                if (R && typeof R.ownKeys === "function") {
                    ReflectOwnKeys = R.ownKeys;
                } else if (Object.getOwnPropertySymbols) {
                    ReflectOwnKeys = function ReflectOwnKeys(target) {
                        return Object.getOwnPropertyNames(target).concat(
                            Object.getOwnPropertySymbols(target)
                        );
                    };
                } else {
                    ReflectOwnKeys = function ReflectOwnKeys(target) {
                        return Object.getOwnPropertyNames(target);
                    };
                }

                function ProcessEmitWarning(warning) {
                    if (console && console.warn) console.warn(warning);
                }

                var NumberIsNaN =
                    Number.isNaN ||
                    function NumberIsNaN(value) {
                        return value !== value;
                    };

                function EventEmitter() {
                    EventEmitter.init.call(this);
                }
                module.exports = EventEmitter;
                module.exports.once = once;

                // Backwards-compat with node 0.10.x
                EventEmitter.EventEmitter = EventEmitter;

                EventEmitter.prototype._events = undefined;
                EventEmitter.prototype._eventsCount = 0;
                EventEmitter.prototype._maxListeners = undefined;

                // By default EventEmitters will print a warning if more than 10 listeners are
                // added to it. This is a useful default which helps finding memory leaks.
                var defaultMaxListeners = 10;

                function checkListener(listener) {
                    if (typeof listener !== "function") {
                        throw new TypeError(
                            'The "listener" argument must be of type Function. Received type ' +
                                typeof listener
                        );
                    }
                }

                Object.defineProperty(EventEmitter, "defaultMaxListeners", {
                    enumerable: true,
                    get: function () {
                        return defaultMaxListeners;
                    },
                    set: function (arg) {
                        if (typeof arg !== "number" || arg < 0 || NumberIsNaN(arg)) {
                            throw new RangeError(
                                'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' +
                                    arg +
                                    "."
                            );
                        }
                        defaultMaxListeners = arg;
                    },
                });

                EventEmitter.init = function () {
                    if (
                        this._events === undefined ||
                        this._events === Object.getPrototypeOf(this)._events
                    ) {
                        this._events = Object.create(null);
                        this._eventsCount = 0;
                    }

                    this._maxListeners = this._maxListeners || undefined;
                };

                // Obviously not all Emitters should be limited to 10. This function allows
                // that to be increased. Set to zero for unlimited.
                EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
                    if (typeof n !== "number" || n < 0 || NumberIsNaN(n)) {
                        throw new RangeError(
                            'The value of "n" is out of range. It must be a non-negative number. Received ' +
                                n +
                                "."
                        );
                    }
                    this._maxListeners = n;
                    return this;
                };

                function _getMaxListeners(that) {
                    if (that._maxListeners === undefined)
                        return EventEmitter.defaultMaxListeners;
                    return that._maxListeners;
                }

                EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
                    return _getMaxListeners(this);
                };

                EventEmitter.prototype.emit = function emit(type) {
                    var args = [];
                    for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
                    var doError = type === "error";

                    var events = this._events;
                    if (events !== undefined)
                        doError = doError && events.error === undefined;
                    else if (!doError) return false;

                    // If there is no 'error' event listener then throw.
                    if (doError) {
                        var er;
                        if (args.length > 0) er = args[0];
                        if (er instanceof Error) {
                            // Note: The comments on the `throw` lines are intentional, they show
                            // up in Node's output if this results in an unhandled exception.
                            throw er; // Unhandled 'error' event
                        }
                        // At least give some kind of context to the user
                        var err = new Error(
                            "Unhandled error." + (er ? " (" + er.message + ")" : "")
                        );
                        err.context = er;
                        throw err; // Unhandled 'error' event
                    }

                    var handler = events[type];

                    if (handler === undefined) return false;

                    if (typeof handler === "function") {
                        ReflectApply(handler, this, args);
                    } else {
                        var len = handler.length;
                        var listeners = arrayClone(handler, len);
                        for (var i = 0; i < len; ++i)
                            ReflectApply(listeners[i], this, args);
                    }

                    return true;
                };

                function _addListener(target, type, listener, prepend) {
                    var m;
                    var events;
                    var existing;

                    checkListener(listener);

                    events = target._events;
                    if (events === undefined) {
                        events = target._events = Object.create(null);
                        target._eventsCount = 0;
                    } else {
                        // To avoid recursion in the case that type === "newListener"! Before
                        // adding it to the listeners, first emit "newListener".
                        if (events.newListener !== undefined) {
                            target.emit(
                                "newListener",
                                type,
                                listener.listener ? listener.listener : listener
                            );

                            // Re-assign `events` because a newListener handler could have caused the
                            // this._events to be assigned to a new object
                            events = target._events;
                        }
                        existing = events[type];
                    }

                    if (existing === undefined) {
                        // Optimize the case of one listener. Don't need the extra array object.
                        existing = events[type] = listener;
                        ++target._eventsCount;
                    } else {
                        if (typeof existing === "function") {
                            // Adding the second element, need to change to array.
                            existing = events[type] = prepend
                                ? [listener, existing]
                                : [existing, listener];
                            // If we've already got an array, just append.
                        } else if (prepend) {
                            existing.unshift(listener);
                        } else {
                            existing.push(listener);
                        }

                        // Check for listener leak
                        m = _getMaxListeners(target);
                        if (m > 0 && existing.length > m && !existing.warned) {
                            existing.warned = true;
                            // No error code for this since it is a Warning
                            // eslint-disable-next-line no-restricted-syntax
                            var w = new Error(
                                "Possible EventEmitter memory leak detected. " +
                                    existing.length +
                                    " " +
                                    String(type) +
                                    " listeners " +
                                    "added. Use emitter.setMaxListeners() to " +
                                    "increase limit"
                            );
                            w.name = "MaxListenersExceededWarning";
                            w.emitter = target;
                            w.type = type;
                            w.count = existing.length;
                            ProcessEmitWarning(w);
                        }
                    }

                    return target;
                }

                EventEmitter.prototype.addListener = function addListener(
                    type,
                    listener
                ) {
                    return _addListener(this, type, listener, false);
                };

                EventEmitter.prototype.on = EventEmitter.prototype.addListener;

                EventEmitter.prototype.prependListener = function prependListener(
                    type,
                    listener
                ) {
                    return _addListener(this, type, listener, true);
                };

                function onceWrapper() {
                    if (!this.fired) {
                        this.target.removeListener(this.type, this.wrapFn);
                        this.fired = true;
                        if (arguments.length === 0)
                            return this.listener.call(this.target);
                        return this.listener.apply(this.target, arguments);
                    }
                }

                function _onceWrap(target, type, listener) {
                    var state = {
                        fired: false,
                        wrapFn: undefined,
                        target: target,
                        type: type,
                        listener: listener,
                    };
                    var wrapped = onceWrapper.bind(state);
                    wrapped.listener = listener;
                    state.wrapFn = wrapped;
                    return wrapped;
                }

                EventEmitter.prototype.once = function once(type, listener) {
                    checkListener(listener);
                    this.on(type, _onceWrap(this, type, listener));
                    return this;
                };

                EventEmitter.prototype.prependOnceListener =
                    function prependOnceListener(type, listener) {
                        checkListener(listener);
                        this.prependListener(type, _onceWrap(this, type, listener));
                        return this;
                    };

                // Emits a 'removeListener' event if and only if the listener was removed.
                EventEmitter.prototype.removeListener = function removeListener(
                    type,
                    listener
                ) {
                    var list, events, position, i, originalListener;

                    checkListener(listener);

                    events = this._events;
                    if (events === undefined) return this;

                    list = events[type];
                    if (list === undefined) return this;

                    if (list === listener || list.listener === listener) {
                        if (--this._eventsCount === 0)
                            this._events = Object.create(null);
                        else {
                            delete events[type];
                            if (events.removeListener)
                                this.emit(
                                    "removeListener",
                                    type,
                                    list.listener || listener
                                );
                        }
                    } else if (typeof list !== "function") {
                        position = -1;

                        for (i = list.length - 1; i >= 0; i--) {
                            if (list[i] === listener || list[i].listener === listener) {
                                originalListener = list[i].listener;
                                position = i;
                                break;
                            }
                        }

                        if (position < 0) return this;

                        if (position === 0) list.shift();
                        else {
                            spliceOne(list, position);
                        }

                        if (list.length === 1) events[type] = list[0];

                        if (events.removeListener !== undefined)
                            this.emit(
                                "removeListener",
                                type,
                                originalListener || listener
                            );
                    }

                    return this;
                };

                EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

                EventEmitter.prototype.removeAllListeners = function removeAllListeners(
                    type
                ) {
                    var listeners, events, i;

                    events = this._events;
                    if (events === undefined) return this;

                    // Not listening for removeListener, no need to emit
                    if (events.removeListener === undefined) {
                        if (arguments.length === 0) {
                            this._events = Object.create(null);
                            this._eventsCount = 0;
                        } else if (events[type] !== undefined) {
                            if (--this._eventsCount === 0)
                                this._events = Object.create(null);
                            else delete events[type];
                        }
                        return this;
                    }

                    // Emit removeListener for all listeners on all events
                    if (arguments.length === 0) {
                        var keys = Object.keys(events);
                        var key;
                        for (i = 0; i < keys.length; ++i) {
                            key = keys[i];
                            if (key === "removeListener") continue;
                            this.removeAllListeners(key);
                        }
                        this.removeAllListeners("removeListener");
                        this._events = Object.create(null);
                        this._eventsCount = 0;
                        return this;
                    }

                    listeners = events[type];

                    if (typeof listeners === "function") {
                        this.removeListener(type, listeners);
                    } else if (listeners !== undefined) {
                        // LIFO order
                        for (i = listeners.length - 1; i >= 0; i--) {
                            this.removeListener(type, listeners[i]);
                        }
                    }

                    return this;
                };

                function _listeners(target, type, unwrap) {
                    var events = target._events;

                    if (events === undefined) return [];

                    var evlistener = events[type];
                    if (evlistener === undefined) return [];

                    if (typeof evlistener === "function")
                        return unwrap
                            ? [evlistener.listener || evlistener]
                            : [evlistener];

                    return unwrap
                        ? unwrapListeners(evlistener)
                        : arrayClone(evlistener, evlistener.length);
                }

                EventEmitter.prototype.listeners = function listeners(type) {
                    return _listeners(this, type, true);
                };

                EventEmitter.prototype.rawListeners = function rawListeners(type) {
                    return _listeners(this, type, false);
                };

                EventEmitter.listenerCount = function (emitter, type) {
                    if (typeof emitter.listenerCount === "function") {
                        return emitter.listenerCount(type);
                    }
                    return listenerCount.call(emitter, type);
                };

                EventEmitter.prototype.listenerCount = listenerCount;
                function listenerCount(type) {
                    var events = this._events;

                    if (events !== undefined) {
                        var evlistener = events[type];

                        if (typeof evlistener === "function") {
                            return 1;
                        } else if (evlistener !== undefined) {
                            return evlistener.length;
                        }
                    }

                    return 0;
                }

                EventEmitter.prototype.eventNames = function eventNames() {
                    return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
                };

                function arrayClone(arr, n) {
                    var copy = new Array(n);
                    for (var i = 0; i < n; ++i) copy[i] = arr[i];
                    return copy;
                }

                function spliceOne(list, index) {
                    for (; index + 1 < list.length; index++)
                        list[index] = list[index + 1];
                    list.pop();
                }

                function unwrapListeners(arr) {
                    var ret = new Array(arr.length);
                    for (var i = 0; i < ret.length; ++i) {
                        ret[i] = arr[i].listener || arr[i];
                    }
                    return ret;
                }

                function once(emitter, name) {
                    return new Promise(function (resolve, reject) {
                        function errorListener(err) {
                            emitter.removeListener(name, resolver);
                            reject(err);
                        }

                        function resolver() {
                            if (typeof emitter.removeListener === "function") {
                                emitter.removeListener("error", errorListener);
                            }
                            resolve([].slice.call(arguments));
                        }

                        eventTargetAgnosticAddListener(emitter, name, resolver, {
                            once: true,
                        });
                        if (name !== "error") {
                            addErrorHandlerIfEventEmitter(emitter, errorListener, {
                                once: true,
                            });
                        }
                    });
                }

                function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
                    if (typeof emitter.on === "function") {
                        eventTargetAgnosticAddListener(
                            emitter,
                            "error",
                            handler,
                            flags
                        );
                    }
                }

                function eventTargetAgnosticAddListener(
                    emitter,
                    name,
                    listener,
                    flags
                ) {
                    if (typeof emitter.on === "function") {
                        if (flags.once) {
                            emitter.once(name, listener);
                        } else {
                            emitter.on(name, listener);
                        }
                    } else if (typeof emitter.addEventListener === "function") {
                        // EventTarget does not have `error` event semantics like Node
                        // EventEmitters, we do not listen for `error` events here.
                        emitter.addEventListener(name, function wrapListener(arg) {
                            // IE does not have builtin `{ once: true }` support so we
                            // have to do it manually.
                            if (flags.once) {
                                emitter.removeEventListener(name, wrapListener);
                            }
                            listener(arg);
                        });
                    } else {
                        throw new TypeError(
                            'The "emitter" argument must be of type EventEmitter. Received type ' +
                                typeof emitter
                        );
                    }
                }
            },
            {},
        ],
        19: [
            function (require, module, exports) {
                var http = require("http");
                var url = require("url");

                var https = module.exports;

                for (var key in http) {
                    if (http.hasOwnProperty(key)) https[key] = http[key];
                }

                https.request = function (params, cb) {
                    params = validateParams(params);
                    return http.request.call(this, params, cb);
                };

                https.get = function (params, cb) {
                    params = validateParams(params);
                    return http.get.call(this, params, cb);
                };

                function validateParams(params) {
                    if (typeof params === "string") {
                        params = url.parse(params);
                    }
                    if (!params.protocol) {
                        params.protocol = "https:";
                    }
                    if (params.protocol !== "https:") {
                        throw new Error(
                            'Protocol "' +
                                params.protocol +
                                '" not supported. Expected "https:"'
                        );
                    }
                    return params;
                }
            },
            {http: 28, url: 48},
        ],
        20: [
            function (require, module, exports) {
                /* ! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
                exports.read = function (buffer, offset, isLE, mLen, nBytes) {
                    var e, m;
                    var eLen = nBytes * 8 - mLen - 1;
                    var eMax = (1 << eLen) - 1;
                    var eBias = eMax >> 1;
                    var nBits = -7;
                    var i = isLE ? nBytes - 1 : 0;
                    var d = isLE ? -1 : 1;
                    var s = buffer[offset + i];

                    i += d;

                    e = s & ((1 << -nBits) - 1);
                    s >>= -nBits;
                    nBits += eLen;
                    for (
                        ;
                        nBits > 0;
                        e = e * 256 + buffer[offset + i], i += d, nBits -= 8
                    ) {}

                    m = e & ((1 << -nBits) - 1);
                    e >>= -nBits;
                    nBits += mLen;
                    for (
                        ;
                        nBits > 0;
                        m = m * 256 + buffer[offset + i], i += d, nBits -= 8
                    ) {}

                    if (e === 0) {
                        e = 1 - eBias;
                    } else if (e === eMax) {
                        return m ? NaN : (s ? -1 : 1) * Infinity;
                    } else {
                        m += Math.pow(2, mLen);
                        e -= eBias;
                    }
                    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
                };

                exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
                    var e, m, c;
                    var eLen = nBytes * 8 - mLen - 1;
                    var eMax = (1 << eLen) - 1;
                    var eBias = eMax >> 1;
                    var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
                    var i = isLE ? 0 : nBytes - 1;
                    var d = isLE ? 1 : -1;
                    var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

                    value = Math.abs(value);

                    if (isNaN(value) || value === Infinity) {
                        m = isNaN(value) ? 1 : 0;
                        e = eMax;
                    } else {
                        e = Math.floor(Math.log(value) / Math.LN2);
                        if (value * (c = Math.pow(2, -e)) < 1) {
                            e--;
                            c *= 2;
                        }
                        if (e + eBias >= 1) {
                            value += rt / c;
                        } else {
                            value += rt * Math.pow(2, 1 - eBias);
                        }
                        if (value * c >= 2) {
                            e++;
                            c /= 2;
                        }

                        if (e + eBias >= eMax) {
                            m = 0;
                            e = eMax;
                        } else if (e + eBias >= 1) {
                            m = (value * c - 1) * Math.pow(2, mLen);
                            e += eBias;
                        } else {
                            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
                            e = 0;
                        }
                    }

                    for (
                        ;
                        mLen >= 8;
                        buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8
                    ) {}

                    e = (e << mLen) | m;
                    eLen += mLen;
                    for (
                        ;
                        eLen > 0;
                        buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8
                    ) {}

                    buffer[offset + i - d] |= s * 128;
                };
            },
            {},
        ],
        21: [
            function (require, module, exports) {
                if (typeof Object.create === "function") {
                    // Implementation from standard node.js 'util' module
                    module.exports = function inherits(ctor, superCtor) {
                        if (superCtor) {
                            ctor.super_ = superCtor;
                            ctor.prototype = Object.create(superCtor.prototype, {
                                constructor: {
                                    value: ctor,
                                    enumerable: false,
                                    writable: true,
                                    configurable: true,
                                },
                            });
                        }
                    };
                } else {
                    // Old school shim for old browsers
                    module.exports = function inherits(ctor, superCtor) {
                        if (superCtor) {
                            ctor.super_ = superCtor;
                            var TempCtor = function () {};
                            TempCtor.prototype = superCtor.prototype;
                            ctor.prototype = new TempCtor();
                            ctor.prototype.constructor = ctor;
                        }
                    };
                }
            },
            {},
        ],
        22: [
            function (require, module, exports) {
                // Shim for using process in browser
                var process = (module.exports = {});

                // Cached from whatever global is present so that test runners that stub it
                // don't break things.  But we need to wrap it in a try catch in case it is
                // wrapped in strict mode code which doesn't define any globals.  It's inside a
                // function because try/catches deoptimize in certain engines.

                var cachedSetTimeout;
                var cachedClearTimeout;

                function defaultSetTimout() {
                    throw new Error("setTimeout has not been defined");
                }
                function defaultClearTimeout() {
                    throw new Error("clearTimeout has not been defined");
                }
                (function () {
                    try {
                        if (typeof setTimeout === "function") {
                            cachedSetTimeout = setTimeout;
                        } else {
                            cachedSetTimeout = defaultSetTimout;
                        }
                    } catch (e) {
                        cachedSetTimeout = defaultSetTimout;
                    }
                    try {
                        if (typeof clearTimeout === "function") {
                            cachedClearTimeout = clearTimeout;
                        } else {
                            cachedClearTimeout = defaultClearTimeout;
                        }
                    } catch (e) {
                        cachedClearTimeout = defaultClearTimeout;
                    }
                })();
                function runTimeout(fun) {
                    if (cachedSetTimeout === setTimeout) {
                        // Normal enviroments in sane situations
                        return setTimeout(fun, 0);
                    }
                    // If setTimeout wasn't available but was latter defined
                    if (
                        (cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) &&
                        setTimeout
                    ) {
                        cachedSetTimeout = setTimeout;
                        return setTimeout(fun, 0);
                    }
                    try {
                        // When when somebody has screwed with setTimeout but no I.E. maddness
                        return cachedSetTimeout(fun, 0);
                    } catch (e) {
                        try {
                            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                            return cachedSetTimeout.call(null, fun, 0);
                        } catch (e) {
                            // Same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                            return cachedSetTimeout.call(this, fun, 0);
                        }
                    }
                }
                function runClearTimeout(marker) {
                    if (cachedClearTimeout === clearTimeout) {
                        // Normal enviroments in sane situations
                        return clearTimeout(marker);
                    }
                    // If clearTimeout wasn't available but was latter defined
                    if (
                        (cachedClearTimeout === defaultClearTimeout ||
                            !cachedClearTimeout) &&
                        clearTimeout
                    ) {
                        cachedClearTimeout = clearTimeout;
                        return clearTimeout(marker);
                    }
                    try {
                        // When when somebody has screwed with setTimeout but no I.E. maddness
                        return cachedClearTimeout(marker);
                    } catch (e) {
                        try {
                            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                            return cachedClearTimeout.call(null, marker);
                        } catch (e) {
                            // Same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                            return cachedClearTimeout.call(this, marker);
                        }
                    }
                }
                var queue = [];
                var draining = false;
                var currentQueue;
                var queueIndex = -1;

                function cleanUpNextTick() {
                    if (!draining || !currentQueue) {
                        return;
                    }
                    draining = false;
                    if (currentQueue.length) {
                        queue = currentQueue.concat(queue);
                    } else {
                        queueIndex = -1;
                    }
                    if (queue.length) {
                        drainQueue();
                    }
                }

                function drainQueue() {
                    if (draining) {
                        return;
                    }
                    var timeout = runTimeout(cleanUpNextTick);
                    draining = true;

                    var len = queue.length;
                    while (len) {
                        currentQueue = queue;
                        queue = [];
                        while (++queueIndex < len) {
                            if (currentQueue) {
                                currentQueue[queueIndex].run();
                            }
                        }
                        queueIndex = -1;
                        len = queue.length;
                    }
                    currentQueue = null;
                    draining = false;
                    runClearTimeout(timeout);
                }

                process.nextTick = function (fun) {
                    var args = new Array(arguments.length - 1);
                    if (arguments.length > 1) {
                        for (var i = 1; i < arguments.length; i++) {
                            args[i - 1] = arguments[i];
                        }
                    }
                    queue.push(new Item(fun, args));
                    if (queue.length === 1 && !draining) {
                        runTimeout(drainQueue);
                    }
                };

                // V8 likes predictible objects
                function Item(fun, array) {
                    this.fun = fun;
                    this.array = array;
                }
                Item.prototype.run = function () {
                    this.fun.apply(null, this.array);
                };
                process.title = "browser";
                process.browser = true;
                process.env = {};
                process.argv = [];
                process.version = ""; // Empty string to avoid regexp issues
                process.versions = {};

                function noop() {}

                process.on = noop;
                process.addListener = noop;
                process.once = noop;
                process.off = noop;
                process.removeListener = noop;
                process.removeAllListeners = noop;
                process.emit = noop;
                process.prependListener = noop;
                process.prependOnceListener = noop;

                process.listeners = function (name) {
                    return [];
                };

                process.binding = function (name) {
                    throw new Error("process.binding is not supported");
                };

                process.cwd = function () {
                    return "/";
                };
                process.chdir = function (dir) {
                    throw new Error("process.chdir is not supported");
                };
                process.umask = function () {
                    return 0;
                };
            },
            {},
        ],
        23: [
            function (require, module, exports) {
                (function (global) {
                    (function () {
                        /* ! https://mths.be/punycode v1.4.1 by @mathias */
                        (function (root) {
                            /** Detect free variables */
                            var freeExports =
                                typeof exports === "object" &&
                                exports &&
                                !exports.nodeType &&
                                exports;
                            var freeModule =
                                typeof module === "object" &&
                                module &&
                                !module.nodeType &&
                                module;
                            var freeGlobal = typeof global === "object" && global;
                            if (
                                freeGlobal.global === freeGlobal ||
                                freeGlobal.window === freeGlobal ||
                                freeGlobal.self === freeGlobal
                            ) {
                                root = freeGlobal;
                            }

                            /**
                             * The `punycode` object.
                             * @name punycode
                             * @type Object
                             */
                            var punycode,
                                /** Highest positive signed 32-bit float value */
                                maxInt = 2147483647, // Aka. 0x7FFFFFFF or 2^31-1
                                /** Bootstring parameters */
                                base = 36,
                                tMin = 1,
                                tMax = 26,
                                skew = 38,
                                damp = 700,
                                initialBias = 72,
                                initialN = 128, // 0x80
                                delimiter = "-", // '\x2D'
                                /** Regular expressions */
                                regexPunycode = /^xn--/,
                                regexNonASCII = /[^\x20-\x7E]/, // Unprintable ASCII chars + non-ASCII chars
                                regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators
                                /** Error messages */
                                errors = {
                                    overflow:
                                        "Overflow: input needs wider integers to process",
                                    "not-basic":
                                        "Illegal input >= 0x80 (not a basic code point)",
                                    "invalid-input": "Invalid input",
                                },
                                /** Convenience shortcuts */
                                baseMinusTMin = base - tMin,
                                floor = Math.floor,
                                stringFromCharCode = String.fromCharCode,
                                /** Temporary variable */
                                key;

                            /* --------------------------------------------------------------------------*/

                            /**
                             * A generic error utility function.
                             * @private
                             * @param {String} type The error type.
                             * @returns {Error} Throws a `RangeError` with the applicable error message.
                             */
                            function error(type) {
                                throw new RangeError(errors[type]);
                            }

                            /**
                             * A generic `Array#map` utility function.
                             * @private
                             * @param {Array} array The array to iterate over.
                             * @param {Function} callback The function that gets called for every array
                             * item.
                             * @returns {Array} A new array of values returned by the callback function.
                             */
                            function map(array, fn) {
                                var length = array.length;
                                var result = [];
                                while (length--) {
                                    result[length] = fn(array[length]);
                                }
                                return result;
                            }

                            /**
                             * A simple `Array#map`-like wrapper to work with domain name strings or email
                             * addresses.
                             * @private
                             * @param {String} domain The domain name or email address.
                             * @param {Function} callback The function that gets called for every
                             * character.
                             * @returns {Array} A new string of characters returned by the callback
                             * function.
                             */
                            function mapDomain(string, fn) {
                                var parts = string.split("@");
                                var result = "";
                                if (parts.length > 1) {
                                    // In email addresses, only the domain name should be punycoded. Leave
                                    // the local part (i.e. everything up to `@`) intact.
                                    result = parts[0] + "@";
                                    string = parts[1];
                                }
                                // Avoid `split(regex)` for IE8 compatibility. See #17.
                                string = string.replace(regexSeparators, "\x2E");
                                var labels = string.split(".");
                                var encoded = map(labels, fn).join(".");
                                return result + encoded;
                            }

                            /**
                             * Creates an array containing the numeric code points of each Unicode
                             * character in the string. While JavaScript uses UCS-2 internally,
                             * this function will convert a pair of surrogate halves (each of which
                             * UCS-2 exposes as separate characters) into a single code point,
                             * matching UTF-16.
                             * @see `punycode.ucs2.encode`
                             * @see <https://mathiasbynens.be/notes/javascript-encoding>
                             * @memberOf punycode.ucs2
                             * @name decode
                             * @param {String} string The Unicode input string (UCS-2).
                             * @returns {Array} The new array of code points.
                             */
                            function ucs2decode(string) {
                                var output = [],
                                    counter = 0,
                                    length = string.length,
                                    value,
                                    extra;
                                while (counter < length) {
                                    value = string.charCodeAt(counter++);
                                    if (
                                        value >= 0xd800 &&
                                        value <= 0xdbff &&
                                        counter < length
                                    ) {
                                        // High surrogate, and there is a next character
                                        extra = string.charCodeAt(counter++);
                                        if ((extra & 0xfc00) == 0xdc00) {
                                            // Low surrogate
                                            output.push(
                                                ((value & 0x3ff) << 10) +
                                                    (extra & 0x3ff) +
                                                    0x10000
                                            );
                                        } else {
                                            // Unmatched surrogate; only append this code unit, in case the next
                                            // code unit is the high surrogate of a surrogate pair
                                            output.push(value);
                                            counter--;
                                        }
                                    } else {
                                        output.push(value);
                                    }
                                }
                                return output;
                            }

                            /**
                             * Creates a string based on an array of numeric code points.
                             * @see `punycode.ucs2.decode`
                             * @memberOf punycode.ucs2
                             * @name encode
                             * @param {Array} codePoints The array of numeric code points.
                             * @returns {String} The new Unicode string (UCS-2).
                             */
                            function ucs2encode(array) {
                                return map(array, function (value) {
                                    var output = "";
                                    if (value > 0xffff) {
                                        value -= 0x10000;
                                        output += stringFromCharCode(
                                            ((value >>> 10) & 0x3ff) | 0xd800
                                        );
                                        value = 0xdc00 | (value & 0x3ff);
                                    }
                                    output += stringFromCharCode(value);
                                    return output;
                                }).join("");
                            }

                            /**
                             * Converts a basic code point into a digit/integer.
                             * @see `digitToBasic()`
                             * @private
                             * @param {Number} codePoint The basic numeric code point value.
                             * @returns {Number} The numeric value of a basic code point (for use in
                             * representing integers) in the range `0` to `base - 1`, or `base` if
                             * the code point does not represent a value.
                             */
                            function basicToDigit(codePoint) {
                                if (codePoint - 48 < 10) {
                                    return codePoint - 22;
                                }
                                if (codePoint - 65 < 26) {
                                    return codePoint - 65;
                                }
                                if (codePoint - 97 < 26) {
                                    return codePoint - 97;
                                }
                                return base;
                            }

                            /**
                             * Converts a digit/integer into a basic code point.
                             * @see `basicToDigit()`
                             * @private
                             * @param {Number} digit The numeric value of a basic code point.
                             * @returns {Number} The basic code point whose value (when used for
                             * representing integers) is `digit`, which needs to be in the range
                             * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
                             * used; else, the lowercase form is used. The behavior is undefined
                             * if `flag` is non-zero and `digit` has no uppercase form.
                             */
                            function digitToBasic(digit, flag) {
                                //  0..25 map to ASCII a..z or A..Z
                                // 26..35 map to ASCII 0..9
                                return (
                                    digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5)
                                );
                            }

                            /**
                             * Bias adaptation function as per section 3.4 of RFC 3492.
                             * https://tools.ietf.org/html/rfc3492#section-3.4
                             * @private
                             */
                            function adapt(delta, numPoints, firstTime) {
                                var k = 0;
                                delta = firstTime ? floor(delta / damp) : delta >> 1;
                                delta += floor(delta / numPoints);
                                for (
                                    ;
                                    /* No initialization */ delta >
                                    (baseMinusTMin * tMax) >> 1;
                                    k += base
                                ) {
                                    delta = floor(delta / baseMinusTMin);
                                }
                                return floor(
                                    k + ((baseMinusTMin + 1) * delta) / (delta + skew)
                                );
                            }

                            /**
                             * Converts a Punycode string of ASCII-only symbols to a string of Unicode
                             * symbols.
                             * @memberOf punycode
                             * @param {String} input The Punycode string of ASCII-only symbols.
                             * @returns {String} The resulting string of Unicode symbols.
                             */
                            function decode(input) {
                                // Don't use UCS-2
                                var output = [],
                                    inputLength = input.length,
                                    out,
                                    i = 0,
                                    n = initialN,
                                    bias = initialBias,
                                    basic,
                                    j,
                                    index,
                                    oldi,
                                    w,
                                    k,
                                    digit,
                                    t,
                                    /** Cached calculation results */
                                    baseMinusT;

                                // Handle the basic code points: let `basic` be the number of input code
                                // points before the last delimiter, or `0` if there is none, then copy
                                // the first basic code points to the output.

                                basic = input.lastIndexOf(delimiter);
                                if (basic < 0) {
                                    basic = 0;
                                }

                                for (j = 0; j < basic; ++j) {
                                    // If it's not a basic code point
                                    if (input.charCodeAt(j) >= 0x80) {
                                        error("not-basic");
                                    }
                                    output.push(input.charCodeAt(j));
                                }

                                // Main decoding loop: start just after the last delimiter if any basic code
                                // points were copied; start at the beginning otherwise.

                                for (
                                    index = basic > 0 ? basic + 1 : 0;
                                    index < inputLength /* no final expression */;

                                ) {
                                    // `index` is the index of the next character to be consumed.
                                    // Decode a generalized variable-length integer into `delta`,
                                    // which gets added to `i`. The overflow checking is easier
                                    // if we increase `i` as we go, then subtract off its starting
                                    // value at the end to obtain `delta`.
                                    for (
                                        oldi = i, w = 1, k = base /* no condition */;
                                        ;
                                        k += base
                                    ) {
                                        if (index >= inputLength) {
                                            error("invalid-input");
                                        }

                                        digit = basicToDigit(input.charCodeAt(index++));

                                        if (
                                            digit >= base ||
                                            digit > floor((maxInt - i) / w)
                                        ) {
                                            error("overflow");
                                        }

                                        i += digit * w;
                                        t =
                                            k <= bias
                                                ? tMin
                                                : k >= bias + tMax
                                                ? tMax
                                                : k - bias;

                                        if (digit < t) {
                                            break;
                                        }

                                        baseMinusT = base - t;
                                        if (w > floor(maxInt / baseMinusT)) {
                                            error("overflow");
                                        }

                                        w *= baseMinusT;
                                    }

                                    out = output.length + 1;
                                    bias = adapt(i - oldi, out, oldi == 0);

                                    // `i` was supposed to wrap around from `out` to `0`,
                                    // incrementing `n` each time, so we'll fix that now:
                                    if (floor(i / out) > maxInt - n) {
                                        error("overflow");
                                    }

                                    n += floor(i / out);
                                    i %= out;

                                    // Insert `n` at position `i` of the output
                                    output.splice(i++, 0, n);
                                }

                                return ucs2encode(output);
                            }

                            /**
                             * Converts a string of Unicode symbols (e.g. a domain name label) to a
                             * Punycode string of ASCII-only symbols.
                             * @memberOf punycode
                             * @param {String} input The string of Unicode symbols.
                             * @returns {String} The resulting Punycode string of ASCII-only symbols.
                             */
                            function encode(input) {
                                var n,
                                    delta,
                                    handledCPCount,
                                    basicLength,
                                    bias,
                                    j,
                                    m,
                                    q,
                                    k,
                                    t,
                                    currentValue,
                                    output = [],
                                    /** `inputLength` will hold the number of code points in `input`. */
                                    inputLength,
                                    /** Cached calculation results */
                                    handledCPCountPlusOne,
                                    baseMinusT,
                                    qMinusT;

                                // Convert the input in UCS-2 to Unicode
                                input = ucs2decode(input);

                                // Cache the length
                                inputLength = input.length;

                                // Initialize the state
                                n = initialN;
                                delta = 0;
                                bias = initialBias;

                                // Handle the basic code points
                                for (j = 0; j < inputLength; ++j) {
                                    currentValue = input[j];
                                    if (currentValue < 0x80) {
                                        output.push(stringFromCharCode(currentValue));
                                    }
                                }

                                handledCPCount = basicLength = output.length;

                                // `handledCPCount` is the number of code points that have been handled;
                                // `basicLength` is the number of basic code points.

                                // Finish the basic string - if it is not empty - with a delimiter
                                if (basicLength) {
                                    output.push(delimiter);
                                }

                                // Main encoding loop:
                                while (handledCPCount < inputLength) {
                                    // All non-basic code points < n have been handled already. Find the next
                                    // larger one:
                                    for (m = maxInt, j = 0; j < inputLength; ++j) {
                                        currentValue = input[j];
                                        if (currentValue >= n && currentValue < m) {
                                            m = currentValue;
                                        }
                                    }

                                    // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
                                    // but guard against overflow
                                    handledCPCountPlusOne = handledCPCount + 1;
                                    if (
                                        m - n >
                                        floor((maxInt - delta) / handledCPCountPlusOne)
                                    ) {
                                        error("overflow");
                                    }

                                    delta += (m - n) * handledCPCountPlusOne;
                                    n = m;

                                    for (j = 0; j < inputLength; ++j) {
                                        currentValue = input[j];

                                        if (currentValue < n && ++delta > maxInt) {
                                            error("overflow");
                                        }

                                        if (currentValue == n) {
                                            // Represent delta as a generalized variable-length integer
                                            for (
                                                q = delta, k = base /* no condition */;
                                                ;
                                                k += base
                                            ) {
                                                t =
                                                    k <= bias
                                                        ? tMin
                                                        : k >= bias + tMax
                                                        ? tMax
                                                        : k - bias;
                                                if (q < t) {
                                                    break;
                                                }
                                                qMinusT = q - t;
                                                baseMinusT = base - t;
                                                output.push(
                                                    stringFromCharCode(
                                                        digitToBasic(
                                                            t + (qMinusT % baseMinusT),
                                                            0
                                                        )
                                                    )
                                                );
                                                q = floor(qMinusT / baseMinusT);
                                            }

                                            output.push(
                                                stringFromCharCode(digitToBasic(q, 0))
                                            );
                                            bias = adapt(
                                                delta,
                                                handledCPCountPlusOne,
                                                handledCPCount == basicLength
                                            );
                                            delta = 0;
                                            ++handledCPCount;
                                        }
                                    }

                                    ++delta;
                                    ++n;
                                }
                                return output.join("");
                            }

                            /**
                             * Converts a Punycode string representing a domain name or an email address
                             * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
                             * it doesn't matter if you call it on a string that has already been
                             * converted to Unicode.
                             * @memberOf punycode
                             * @param {String} input The Punycoded domain name or email address to
                             * convert to Unicode.
                             * @returns {String} The Unicode representation of the given Punycode
                             * string.
                             */
                            function toUnicode(input) {
                                return mapDomain(input, function (string) {
                                    return regexPunycode.test(string)
                                        ? decode(string.slice(4).toLowerCase())
                                        : string;
                                });
                            }

                            /**
                             * Converts a Unicode string representing a domain name or an email address to
                             * Punycode. Only the non-ASCII parts of the domain name will be converted,
                             * i.e. it doesn't matter if you call it with a domain that's already in
                             * ASCII.
                             * @memberOf punycode
                             * @param {String} input The domain name or email address to convert, as a
                             * Unicode string.
                             * @returns {String} The Punycode representation of the given domain name or
                             * email address.
                             */
                            function toASCII(input) {
                                return mapDomain(input, function (string) {
                                    return regexNonASCII.test(string)
                                        ? "xn--" + encode(string)
                                        : string;
                                });
                            }

                            /* --------------------------------------------------------------------------*/

                            /** Define the public API */
                            punycode = {
                                /**
                                 * A string representing the current Punycode.js version number.
                                 * @memberOf punycode
                                 * @type String
                                 */
                                version: "1.4.1",
                                /**
                                 * An object of methods to convert from JavaScript's internal character
                                 * representation (UCS-2) to Unicode code points, and back.
                                 * @see <https://mathiasbynens.be/notes/javascript-encoding>
                                 * @memberOf punycode
                                 * @type Object
                                 */
                                ucs2: {
                                    decode: ucs2decode,
                                    encode: ucs2encode,
                                },
                                decode: decode,
                                encode: encode,
                                toASCII: toASCII,
                                toUnicode: toUnicode,
                            };

                            /** Expose `punycode` */
                            // Some AMD build optimizers, like r.js, check for specific condition patterns
                            // like the following:
                            if (
                                typeof define === "function" &&
                                typeof define.amd === "object" &&
                                define.amd
                            ) {
                                define("punycode", function () {
                                    return punycode;
                                });
                            } else if (freeExports && freeModule) {
                                if (module.exports == freeExports) {
                                    // In Node.js, io.js, or RingoJS v0.8.0+
                                    freeModule.exports = punycode;
                                } else {
                                    // In Narwhal or RingoJS v0.7.0-
                                    for (key in punycode) {
                                        punycode.hasOwnProperty(key) &&
                                            (freeExports[key] = punycode[key]);
                                    }
                                }
                            } else {
                                // In Rhino or a web browser
                                root.punycode = punycode;
                            }
                        })(this);
                    }.call(this));
                }.call(
                    this,
                    typeof global !== "undefined"
                        ? global
                        : typeof self !== "undefined"
                        ? self
                        : typeof window !== "undefined"
                        ? window
                        : {}
                ));
            },
            {},
        ],
        24: [
            function (require, module, exports) {
                // Copyright Joyent, Inc. and other Node contributors.
                //
                // Permission is hereby granted, free of charge, to any person obtaining a
                // copy of this software and associated documentation files (the
                // "Software"), to deal in the Software without restriction, including
                // without limitation the rights to use, copy, modify, merge, publish,
                // distribute, sublicense, and/or sell copies of the Software, and to permit
                // persons to whom the Software is furnished to do so, subject to the
                // following conditions:
                //
                // The above copyright notice and this permission notice shall be included
                // in all copies or substantial portions of the Software.
                //
                // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
                // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
                // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
                // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
                // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
                // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
                // USE OR OTHER DEALINGS IN THE SOFTWARE.

                "use strict";

                // If obj.hasOwnProperty has been overridden, then calling
                // obj.hasOwnProperty(prop) will break.
                // See: https://github.com/joyent/node/issues/1707
                function hasOwnProperty(obj, prop) {
                    return Object.prototype.hasOwnProperty.call(obj, prop);
                }

                module.exports = function (qs, sep, eq, options) {
                    sep = sep || "&";
                    eq = eq || "=";
                    var obj = {};

                    if (typeof qs !== "string" || qs.length === 0) {
                        return obj;
                    }

                    var regexp = /\+/g;
                    qs = qs.split(sep);

                    var maxKeys = 1000;
                    if (options && typeof options.maxKeys === "number") {
                        maxKeys = options.maxKeys;
                    }

                    var len = qs.length;
                    // MaxKeys <= 0 means that we should not limit keys count
                    if (maxKeys > 0 && len > maxKeys) {
                        len = maxKeys;
                    }

                    for (var i = 0; i < len; ++i) {
                        var x = qs[i].replace(regexp, "%20"),
                            idx = x.indexOf(eq),
                            kstr,
                            vstr,
                            k,
                            v;

                        if (idx >= 0) {
                            kstr = x.substr(0, idx);
                            vstr = x.substr(idx + 1);
                        } else {
                            kstr = x;
                            vstr = "";
                        }

                        k = decodeURIComponent(kstr);
                        v = decodeURIComponent(vstr);

                        if (!hasOwnProperty(obj, k)) {
                            obj[k] = v;
                        } else if (isArray(obj[k])) {
                            obj[k].push(v);
                        } else {
                            obj[k] = [obj[k], v];
                        }
                    }

                    return obj;
                };

                var isArray =
                    Array.isArray ||
                    function (xs) {
                        return Object.prototype.toString.call(xs) === "[object Array]";
                    };
            },
            {},
        ],
        25: [
            function (require, module, exports) {
                // Copyright Joyent, Inc. and other Node contributors.
                //
                // Permission is hereby granted, free of charge, to any person obtaining a
                // copy of this software and associated documentation files (the
                // "Software"), to deal in the Software without restriction, including
                // without limitation the rights to use, copy, modify, merge, publish,
                // distribute, sublicense, and/or sell copies of the Software, and to permit
                // persons to whom the Software is furnished to do so, subject to the
                // following conditions:
                //
                // The above copyright notice and this permission notice shall be included
                // in all copies or substantial portions of the Software.
                //
                // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
                // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
                // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
                // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
                // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
                // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
                // USE OR OTHER DEALINGS IN THE SOFTWARE.

                "use strict";

                var stringifyPrimitive = function (v) {
                    switch (typeof v) {
                        case "string":
                            return v;

                        case "boolean":
                            return v ? "true" : "false";

                        case "number":
                            return isFinite(v) ? v : "";

                        default:
                            return "";
                    }
                };

                module.exports = function (obj, sep, eq, name) {
                    sep = sep || "&";
                    eq = eq || "=";
                    if (obj === null) {
                        obj = undefined;
                    }

                    if (typeof obj === "object") {
                        return map(objectKeys(obj), function (k) {
                            var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
                            if (isArray(obj[k])) {
                                return map(obj[k], function (v) {
                                    return (
                                        ks + encodeURIComponent(stringifyPrimitive(v))
                                    );
                                }).join(sep);
                            }
                            return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
                        }).join(sep);
                    }

                    if (!name) return "";
                    return (
                        encodeURIComponent(stringifyPrimitive(name)) +
                        eq +
                        encodeURIComponent(stringifyPrimitive(obj))
                    );
                };

                var isArray =
                    Array.isArray ||
                    function (xs) {
                        return Object.prototype.toString.call(xs) === "[object Array]";
                    };

                function map(xs, f) {
                    if (xs.map) return xs.map(f);
                    var res = [];
                    for (var i = 0; i < xs.length; i++) {
                        res.push(f(xs[i], i));
                    }
                    return res;
                }

                var objectKeys =
                    Object.keys ||
                    function (obj) {
                        var res = [];
                        for (var key in obj) {
                            if (Object.prototype.hasOwnProperty.call(obj, key))
                                res.push(key);
                        }
                        return res;
                    };
            },
            {},
        ],
        26: [
            function (require, module, exports) {
                "use strict";

                exports.decode = exports.parse = require("./decode");
                exports.encode = exports.stringify = require("./encode");
            },
            {"./decode": 24, "./encode": 25},
        ],
        27: [
            function (require, module, exports) {
                /* ! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
                /* eslint-disable node/no-deprecated-api */
                var buffer = require("buffer");
                var Buffer = buffer.Buffer;

                // Alternative to using Object.keys for old browsers
                function copyProps(src, dst) {
                    for (var key in src) {
                        dst[key] = src[key];
                    }
                }
                if (
                    Buffer.from &&
                    Buffer.alloc &&
                    Buffer.allocUnsafe &&
                    Buffer.allocUnsafeSlow
                ) {
                    module.exports = buffer;
                } else {
                    // Copy properties from require('buffer')
                    copyProps(buffer, exports);
                    exports.Buffer = SafeBuffer;
                }

                function SafeBuffer(arg, encodingOrOffset, length) {
                    return Buffer(arg, encodingOrOffset, length);
                }

                SafeBuffer.prototype = Object.create(Buffer.prototype);

                // Copy static methods from Buffer
                copyProps(Buffer, SafeBuffer);

                SafeBuffer.from = function (arg, encodingOrOffset, length) {
                    if (typeof arg === "number") {
                        throw new TypeError("Argument must not be a number");
                    }
                    return Buffer(arg, encodingOrOffset, length);
                };

                SafeBuffer.alloc = function (size, fill, encoding) {
                    if (typeof size !== "number") {
                        throw new TypeError("Argument must be a number");
                    }
                    var buf = Buffer(size);
                    if (fill !== undefined) {
                        if (typeof encoding === "string") {
                            buf.fill(fill, encoding);
                        } else {
                            buf.fill(fill);
                        }
                    } else {
                        buf.fill(0);
                    }
                    return buf;
                };

                SafeBuffer.allocUnsafe = function (size) {
                    if (typeof size !== "number") {
                        throw new TypeError("Argument must be a number");
                    }
                    return Buffer(size);
                };

                SafeBuffer.allocUnsafeSlow = function (size) {
                    if (typeof size !== "number") {
                        throw new TypeError("Argument must be a number");
                    }
                    return buffer.SlowBuffer(size);
                };
            },
            {buffer: 16},
        ],
        28: [
            function (require, module, exports) {
                (function (global) {
                    (function () {
                        var ClientRequest = require("./lib/request");
                        var response = require("./lib/response");
                        var extend = require("xtend");
                        var statusCodes = require("builtin-status-codes");
                        var url = require("url");

                        var http = exports;

                        http.request = function (opts, cb) {
                            if (typeof opts === "string") opts = url.parse(opts);
                            else opts = extend(opts);

                            // Normally, the page is loaded from http or https, so not specifying a protocol
                            // will result in a (valid) protocol-relative url. However, this won't work if
                            // the protocol is something else, like 'file:'
                            var defaultProtocol =
                                global.location.protocol.search(/^https?:$/) === -1
                                    ? "http:"
                                    : "";

                            var protocol = opts.protocol || defaultProtocol;
                            var host = opts.hostname || opts.host;
                            var port = opts.port;
                            var path = opts.path || "/";

                            // Necessary for IPv6 addresses
                            if (host && host.indexOf(":") !== -1)
                                host = "[" + host + "]";

                            // This may be a relative url. The browser should always be able to interpret it correctly.
                            opts.url =
                                (host ? protocol + "//" + host : "") +
                                (port ? ":" + port : "") +
                                path;
                            opts.method = (opts.method || "GET").toUpperCase();
                            opts.headers = opts.headers || {};

                            // Also valid opts.auth, opts.mode

                            var req = new ClientRequest(opts);
                            if (cb) req.on("response", cb);
                            return req;
                        };

                        http.get = function get(opts, cb) {
                            var req = http.request(opts, cb);
                            req.end();
                            return req;
                        };

                        http.ClientRequest = ClientRequest;
                        http.IncomingMessage = response.IncomingMessage;

                        http.Agent = function () {};
                        http.Agent.defaultMaxSockets = 4;

                        http.globalAgent = new http.Agent();

                        http.STATUS_CODES = statusCodes;

                        http.METHODS = [
                            "CHECKOUT",
                            "CONNECT",
                            "COPY",
                            "DELETE",
                            "GET",
                            "HEAD",
                            "LOCK",
                            "M-SEARCH",
                            "MERGE",
                            "MKACTIVITY",
                            "MKCOL",
                            "MOVE",
                            "NOTIFY",
                            "OPTIONS",
                            "PATCH",
                            "POST",
                            "PROPFIND",
                            "PROPPATCH",
                            "PURGE",
                            "PUT",
                            "REPORT",
                            "SEARCH",
                            "SUBSCRIBE",
                            "TRACE",
                            "UNLOCK",
                            "UNSUBSCRIBE",
                        ];
                    }.call(this));
                }.call(
                    this,
                    typeof global !== "undefined"
                        ? global
                        : typeof self !== "undefined"
                        ? self
                        : typeof window !== "undefined"
                        ? window
                        : {}
                ));
            },
            {
                "./lib/request": 30,
                "./lib/response": 31,
                "builtin-status-codes": 17,
                url: 48,
                xtend: 51,
            },
        ],
        29: [
            function (require, module, exports) {
                (function (global) {
                    (function () {
                        exports.fetch =
                            isFunction(global.fetch) &&
                            isFunction(global.ReadableStream);

                        exports.writableStream = isFunction(global.WritableStream);

                        exports.abortController = isFunction(global.AbortController);

                        // The xhr request to example.com may violate some restrictive CSP configurations,
                        // so if we're running in a browser that supports `fetch`, avoid calling getXHR()
                        // and assume support for certain features below.
                        var xhr;
                        function getXHR() {
                            // Cache the xhr value
                            if (xhr !== undefined) return xhr;

                            if (global.XMLHttpRequest) {
                                xhr = new global.XMLHttpRequest();
                                // If XDomainRequest is available (ie only, where xhr might not work
                                // cross domain), use the page location. Otherwise use example.com
                                // Note: this doesn't actually make an http request.
                                try {
                                    xhr.open(
                                        "GET",
                                        global.XDomainRequest
                                            ? "/"
                                            : "https://example.com"
                                    );
                                } catch (e) {
                                    xhr = null;
                                }
                            } else {
                                // Service workers don't have XHR
                                xhr = null;
                            }
                            return xhr;
                        }

                        function checkTypeSupport(type) {
                            var xhr = getXHR();
                            if (!xhr) return false;
                            try {
                                xhr.responseType = type;
                                return xhr.responseType === type;
                            } catch (e) {}
                            return false;
                        }

                        // If fetch is supported, then arraybuffer will be supported too. Skip calling
                        // checkTypeSupport(), since that calls getXHR().
                        exports.arraybuffer =
                            exports.fetch || checkTypeSupport("arraybuffer");

                        // These next two tests unavoidably show warnings in Chrome. Since fetch will always
                        // be used if it's available, just return false for these to avoid the warnings.
                        exports.msstream =
                            !exports.fetch && checkTypeSupport("ms-stream");
                        exports.mozchunkedarraybuffer =
                            !exports.fetch &&
                            checkTypeSupport("moz-chunked-arraybuffer");

                        // If fetch is supported, then overrideMimeType will be supported too. Skip calling
                        // getXHR().
                        exports.overrideMimeType =
                            exports.fetch ||
                            (getXHR() ? isFunction(getXHR().overrideMimeType) : false);

                        function isFunction(value) {
                            return typeof value === "function";
                        }

                        xhr = null; // Help gc
                    }.call(this));
                }.call(
                    this,
                    typeof global !== "undefined"
                        ? global
                        : typeof self !== "undefined"
                        ? self
                        : typeof window !== "undefined"
                        ? window
                        : {}
                ));
            },
            {},
        ],
        30: [
            function (require, module, exports) {
                (function (process, global, Buffer) {
                    (function () {
                        var capability = require("./capability");
                        var inherits = require("inherits");
                        var response = require("./response");
                        var stream = require("readable-stream");

                        var IncomingMessage = response.IncomingMessage;
                        var rStates = response.readyStates;

                        function decideMode(preferBinary, useFetch) {
                            if (capability.fetch && useFetch) {
                                return "fetch";
                            } else if (capability.mozchunkedarraybuffer) {
                                return "moz-chunked-arraybuffer";
                            } else if (capability.msstream) {
                                return "ms-stream";
                            } else if (capability.arraybuffer && preferBinary) {
                                return "arraybuffer";
                            }
                            return "text";
                        }

                        var ClientRequest = (module.exports = function (opts) {
                            var self = this;
                            stream.Writable.call(self);

                            self._opts = opts;
                            self._body = [];
                            self._headers = {};
                            if (opts.auth)
                                self.setHeader(
                                    "Authorization",
                                    "Basic " + Buffer.from(opts.auth).toString("base64")
                                );
                            Object.keys(opts.headers).forEach(function (name) {
                                self.setHeader(name, opts.headers[name]);
                            });

                            var preferBinary;
                            var useFetch = true;
                            if (
                                opts.mode === "disable-fetch" ||
                                ("requestTimeout" in opts &&
                                    !capability.abortController)
                            ) {
                                // If the use of XHR should be preferred. Not typically needed.
                                useFetch = false;
                                preferBinary = true;
                            } else if (opts.mode === "prefer-streaming") {
                                // If streaming is a high priority but binary compatibility and
                                // the accuracy of the 'content-type' header aren't
                                preferBinary = false;
                            } else if (opts.mode === "allow-wrong-content-type") {
                                // If streaming is more important than preserving the 'content-type' header
                                preferBinary = !capability.overrideMimeType;
                            } else if (
                                !opts.mode ||
                                opts.mode === "default" ||
                                opts.mode === "prefer-fast"
                            ) {
                                // Use binary if text streaming may corrupt data or the content-type header, or for speed
                                preferBinary = true;
                            } else {
                                throw new Error("Invalid value for opts.mode");
                            }
                            self._mode = decideMode(preferBinary, useFetch);
                            self._fetchTimer = null;

                            self.on("finish", function () {
                                self._onFinish();
                            });
                        });

                        inherits(ClientRequest, stream.Writable);

                        ClientRequest.prototype.setHeader = function (name, value) {
                            var self = this;
                            var lowerName = name.toLowerCase();
                            // This check is not necessary, but it prevents warnings from browsers about setting unsafe
                            // headers. To be honest I'm not entirely sure hiding these warnings is a good thing, but
                            // http-browserify did it, so I will too.
                            if (unsafeHeaders.indexOf(lowerName) !== -1) return;

                            self._headers[lowerName] = {
                                name: name,
                                value: value,
                            };
                        };

                        ClientRequest.prototype.getHeader = function (name) {
                            var header = this._headers[name.toLowerCase()];
                            if (header) return header.value;
                            return null;
                        };

                        ClientRequest.prototype.removeHeader = function (name) {
                            var self = this;
                            delete self._headers[name.toLowerCase()];
                        };

                        ClientRequest.prototype._onFinish = function () {
                            var self = this;

                            if (self._destroyed) return;
                            var opts = self._opts;

                            var headersObj = self._headers;
                            var body = null;
                            if (opts.method !== "GET" && opts.method !== "HEAD") {
                                body = new Blob(self._body, {
                                    type:
                                        (headersObj["content-type"] || {}).value || "",
                                });
                            }

                            // Create flattened list of headers
                            var headersList = [];
                            Object.keys(headersObj).forEach(function (keyName) {
                                var name = headersObj[keyName].name;
                                var value = headersObj[keyName].value;
                                if (Array.isArray(value)) {
                                    value.forEach(function (v) {
                                        headersList.push([name, v]);
                                    });
                                } else {
                                    headersList.push([name, value]);
                                }
                            });

                            if (self._mode === "fetch") {
                                var signal = null;
                                if (capability.abortController) {
                                    var controller = new AbortController();
                                    signal = controller.signal;
                                    self._fetchAbortController = controller;

                                    if (
                                        "requestTimeout" in opts &&
                                        opts.requestTimeout !== 0
                                    ) {
                                        self._fetchTimer = global.setTimeout(
                                            function () {
                                                self.emit("requestTimeout");
                                                if (self._fetchAbortController)
                                                    self._fetchAbortController.abort();
                                            },
                                            opts.requestTimeout
                                        );
                                    }
                                }

                                global
                                    .fetch(self._opts.url, {
                                        method: self._opts.method,
                                        headers: headersList,
                                        body: body || undefined,
                                        mode: "cors",
                                        credentials: opts.withCredentials
                                            ? "include"
                                            : "same-origin",
                                        signal: signal,
                                    })
                                    .then(
                                        function (response) {
                                            self._fetchResponse = response;
                                            self._connect();
                                        },
                                        function (reason) {
                                            global.clearTimeout(self._fetchTimer);
                                            if (!self._destroyed)
                                                self.emit("error", reason);
                                        }
                                    );
                            } else {
                                var xhr = (self._xhr = new global.XMLHttpRequest());
                                try {
                                    xhr.open(self._opts.method, self._opts.url, true);
                                } catch (err) {
                                    process.nextTick(function () {
                                        self.emit("error", err);
                                    });
                                    return;
                                }

                                // Can't set responseType on really old browsers
                                if ("responseType" in xhr)
                                    xhr.responseType = self._mode;

                                if ("withCredentials" in xhr)
                                    xhr.withCredentials = Boolean(opts.withCredentials);

                                if (self._mode === "text" && "overrideMimeType" in xhr)
                                    xhr.overrideMimeType(
                                        "text/plain; charset=x-user-defined"
                                    );

                                if ("requestTimeout" in opts) {
                                    xhr.timeout = opts.requestTimeout;
                                    xhr.ontimeout = function () {
                                        self.emit("requestTimeout");
                                    };
                                }

                                headersList.forEach(function (header) {
                                    xhr.setRequestHeader(header[0], header[1]);
                                });

                                self._response = null;
                                xhr.onreadystatechange = function () {
                                    switch (xhr.readyState) {
                                        case rStates.LOADING:
                                        case rStates.DONE:
                                            self._onXHRProgress();
                                            break;
                                    }
                                };
                                // Necessary for streaming in Firefox, since xhr.response is ONLY defined
                                // in onprogress, not in onreadystatechange with xhr.readyState = 3
                                if (self._mode === "moz-chunked-arraybuffer") {
                                    xhr.onprogress = function () {
                                        self._onXHRProgress();
                                    };
                                }

                                xhr.onerror = function () {
                                    if (self._destroyed) return;
                                    self.emit("error", new Error("XHR error"));
                                };

                                try {
                                    xhr.send(body);
                                } catch (err) {
                                    process.nextTick(function () {
                                        self.emit("error", err);
                                    });
                                    return;
                                }
                            }
                        };

                        /**
                         * Checks if xhr.status is readable and non-zero, indicating no error.
                         * Even though the spec says it should be available in readyState 3,
                         * accessing it throws an exception in IE8
                         */
                        function statusValid(xhr) {
                            try {
                                var status = xhr.status;
                                return status !== null && status !== 0;
                            } catch (e) {
                                return false;
                            }
                        }

                        ClientRequest.prototype._onXHRProgress = function () {
                            var self = this;

                            if (!statusValid(self._xhr) || self._destroyed) return;

                            if (!self._response) self._connect();

                            self._response._onXHRProgress();
                        };

                        ClientRequest.prototype._connect = function () {
                            var self = this;

                            if (self._destroyed) return;

                            self._response = new IncomingMessage(
                                self._xhr,
                                self._fetchResponse,
                                self._mode,
                                self._fetchTimer
                            );
                            self._response.on("error", function (err) {
                                self.emit("error", err);
                            });

                            self.emit("response", self._response);
                        };

                        ClientRequest.prototype._write = function (
                            chunk,
                            encoding,
                            cb
                        ) {
                            var self = this;

                            self._body.push(chunk);
                            cb();
                        };

                        ClientRequest.prototype.abort =
                            ClientRequest.prototype.destroy = function () {
                                var self = this;
                                self._destroyed = true;
                                global.clearTimeout(self._fetchTimer);
                                if (self._response) self._response._destroyed = true;
                                if (self._xhr) self._xhr.abort();
                                else if (self._fetchAbortController)
                                    self._fetchAbortController.abort();
                            };

                        ClientRequest.prototype.end = function (data, encoding, cb) {
                            var self = this;
                            if (typeof data === "function") {
                                cb = data;
                                data = undefined;
                            }

                            stream.Writable.prototype.end.call(
                                self,
                                data,
                                encoding,
                                cb
                            );
                        };

                        ClientRequest.prototype.flushHeaders = function () {};
                        ClientRequest.prototype.setTimeout = function () {};
                        ClientRequest.prototype.setNoDelay = function () {};
                        ClientRequest.prototype.setSocketKeepAlive = function () {};

                        // Taken from http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader%28%29-method
                        var unsafeHeaders = [
                            "accept-charset",
                            "accept-encoding",
                            "access-control-request-headers",
                            "access-control-request-method",
                            "connection",
                            "content-length",
                            "cookie",
                            "cookie2",
                            "date",
                            "dnt",
                            "expect",
                            "host",
                            "keep-alive",
                            "origin",
                            "referer",
                            "te",
                            "trailer",
                            "transfer-encoding",
                            "upgrade",
                            "via",
                        ];
                    }.call(this));
                }.call(
                    this,
                    require("_process"),
                    typeof global !== "undefined"
                        ? global
                        : typeof self !== "undefined"
                        ? self
                        : typeof window !== "undefined"
                        ? window
                        : {},
                    require("buffer").Buffer
                ));
            },
            {
                "./capability": 29,
                "./response": 31,
                _process: 22,
                buffer: 16,
                inherits: 21,
                "readable-stream": 46,
            },
        ],
        31: [
            function (require, module, exports) {
                (function (process, global, Buffer) {
                    (function () {
                        var capability = require("./capability");
                        var inherits = require("inherits");
                        var stream = require("readable-stream");

                        var rStates = (exports.readyStates = {
                            UNSENT: 0,
                            OPENED: 1,
                            HEADERS_RECEIVED: 2,
                            LOADING: 3,
                            DONE: 4,
                        });

                        var IncomingMessage = (exports.IncomingMessage = function (
                            xhr,
                            response,
                            mode,
                            fetchTimer
                        ) {
                            var self = this;
                            stream.Readable.call(self);

                            self._mode = mode;
                            self.headers = {};
                            self.rawHeaders = [];
                            self.trailers = {};
                            self.rawTrailers = [];

                            // Fake the 'close' event, but only once 'end' fires
                            self.on("end", function () {
                                // The nextTick is necessary to prevent the 'request' module from causing an infinite loop
                                process.nextTick(function () {
                                    self.emit("close");
                                });
                            });

                            if (mode === "fetch") {
                                self._fetchResponse = response;

                                self.url = response.url;
                                self.statusCode = response.status;
                                self.statusMessage = response.statusText;

                                response.headers.forEach(function (header, key) {
                                    self.headers[key.toLowerCase()] = header;
                                    self.rawHeaders.push(key, header);
                                });

                                if (capability.writableStream) {
                                    var writable = new WritableStream({
                                        write: function (chunk) {
                                            return new Promise(function (
                                                resolve,
                                                reject
                                            ) {
                                                if (self._destroyed) {
                                                    reject();
                                                } else if (
                                                    self.push(Buffer.from(chunk))
                                                ) {
                                                    resolve();
                                                } else {
                                                    self._resumeFetch = resolve;
                                                }
                                            });
                                        },
                                        close: function () {
                                            global.clearTimeout(fetchTimer);
                                            if (!self._destroyed) self.push(null);
                                        },
                                        abort: function (err) {
                                            if (!self._destroyed)
                                                self.emit("error", err);
                                        },
                                    });

                                    try {
                                        response.body
                                            .pipeTo(writable)
                                            .catch(function (err) {
                                                global.clearTimeout(fetchTimer);
                                                if (!self._destroyed)
                                                    self.emit("error", err);
                                            });
                                        return;
                                    } catch (e) {} // PipeTo method isn't defined. Can't find a better way to feature test this
                                }
                                // Fallback for when writableStream or pipeTo aren't available
                                var reader = response.body.getReader();
                                function read() {
                                    reader
                                        .read()
                                        .then(function (result) {
                                            if (self._destroyed) return;
                                            if (result.done) {
                                                global.clearTimeout(fetchTimer);
                                                self.push(null);
                                                return;
                                            }
                                            self.push(Buffer.from(result.value));
                                            read();
                                        })
                                        .catch(function (err) {
                                            global.clearTimeout(fetchTimer);
                                            if (!self._destroyed)
                                                self.emit("error", err);
                                        });
                                }
                                read();
                            } else {
                                self._xhr = xhr;
                                self._pos = 0;

                                self.url = xhr.responseURL;
                                self.statusCode = xhr.status;
                                self.statusMessage = xhr.statusText;
                                var headers = xhr
                                    .getAllResponseHeaders()
                                    .split(/\r?\n/);
                                headers.forEach(function (header) {
                                    var matches = header.match(/^([^:]+):\s*(.*)/);
                                    if (matches) {
                                        var key = matches[1].toLowerCase();
                                        if (key === "set-cookie") {
                                            if (self.headers[key] === undefined) {
                                                self.headers[key] = [];
                                            }
                                            self.headers[key].push(matches[2]);
                                        } else if (self.headers[key] !== undefined) {
                                            self.headers[key] += ", " + matches[2];
                                        } else {
                                            self.headers[key] = matches[2];
                                        }
                                        self.rawHeaders.push(matches[1], matches[2]);
                                    }
                                });

                                self._charset = "x-user-defined";
                                if (!capability.overrideMimeType) {
                                    var mimeType = self.rawHeaders["mime-type"];
                                    if (mimeType) {
                                        var charsetMatch = mimeType.match(
                                            /;\s*charset=([^;])(;|$)/
                                        );
                                        if (charsetMatch) {
                                            self._charset =
                                                charsetMatch[1].toLowerCase();
                                        }
                                    }
                                    if (!self._charset) self._charset = "utf-8"; // Best guess
                                }
                            }
                        });

                        inherits(IncomingMessage, stream.Readable);

                        IncomingMessage.prototype._read = function () {
                            var self = this;

                            var resolve = self._resumeFetch;
                            if (resolve) {
                                self._resumeFetch = null;
                                resolve();
                            }
                        };

                        IncomingMessage.prototype._onXHRProgress = function () {
                            var self = this;

                            var xhr = self._xhr;

                            var response = null;
                            switch (self._mode) {
                                case "text":
                                    response = xhr.responseText;
                                    if (response.length > self._pos) {
                                        var newData = response.substr(self._pos);
                                        if (self._charset === "x-user-defined") {
                                            var buffer = Buffer.alloc(newData.length);
                                            for (var i = 0; i < newData.length; i++)
                                                buffer[i] =
                                                    newData.charCodeAt(i) & 0xff;

                                            self.push(buffer);
                                        } else {
                                            self.push(newData, self._charset);
                                        }
                                        self._pos = response.length;
                                    }
                                    break;
                                case "arraybuffer":
                                    if (
                                        xhr.readyState !== rStates.DONE ||
                                        !xhr.response
                                    )
                                        break;
                                    response = xhr.response;
                                    self.push(Buffer.from(new Uint8Array(response)));
                                    break;
                                case "moz-chunked-arraybuffer": // Take whole
                                    response = xhr.response;
                                    if (xhr.readyState !== rStates.LOADING || !response)
                                        break;
                                    self.push(Buffer.from(new Uint8Array(response)));
                                    break;
                                case "ms-stream":
                                    response = xhr.response;
                                    if (xhr.readyState !== rStates.LOADING) break;
                                    var reader = new global.MSStreamReader();
                                    reader.onprogress = function () {
                                        if (reader.result.byteLength > self._pos) {
                                            self.push(
                                                Buffer.from(
                                                    new Uint8Array(
                                                        reader.result.slice(self._pos)
                                                    )
                                                )
                                            );
                                            self._pos = reader.result.byteLength;
                                        }
                                    };
                                    reader.onload = function () {
                                        self.push(null);
                                    };
                                    // Reader.onerror = ??? // TODO: this
                                    reader.readAsArrayBuffer(response);
                                    break;
                            }

                            // The ms-stream case handles end separately in reader.onload()
                            if (
                                self._xhr.readyState === rStates.DONE &&
                                self._mode !== "ms-stream"
                            ) {
                                self.push(null);
                            }
                        };
                    }.call(this));
                }.call(
                    this,
                    require("_process"),
                    typeof global !== "undefined"
                        ? global
                        : typeof self !== "undefined"
                        ? self
                        : typeof window !== "undefined"
                        ? window
                        : {},
                    require("buffer").Buffer
                ));
            },
            {
                "./capability": 29,
                _process: 22,
                buffer: 16,
                inherits: 21,
                "readable-stream": 46,
            },
        ],
        32: [
            function (require, module, exports) {
                "use strict";

                function _inheritsLoose(subClass, superClass) {
                    subClass.prototype = Object.create(superClass.prototype);
                    subClass.prototype.constructor = subClass;
                    subClass.__proto__ = superClass;
                }

                var codes = {};

                function createErrorType(code, message, Base) {
                    if (!Base) {
                        Base = Error;
                    }

                    function getMessage(arg1, arg2, arg3) {
                        if (typeof message === "string") {
                            return message;
                        }
                        return message(arg1, arg2, arg3);
                    }

                    var NodeError =
                        /* #__PURE__*/
                        (function (_Base) {
                            _inheritsLoose(NodeError, _Base);

                            function NodeError(arg1, arg2, arg3) {
                                return (
                                    _Base.call(this, getMessage(arg1, arg2, arg3)) ||
                                    this
                                );
                            }

                            return NodeError;
                        })(Base);

                    NodeError.prototype.name = Base.name;
                    NodeError.prototype.code = code;
                    codes[code] = NodeError;
                } // https://github.com/nodejs/node/blob/v10.8.0/lib/internal/errors.js

                function oneOf(expected, thing) {
                    if (Array.isArray(expected)) {
                        var len = expected.length;
                        expected = expected.map(function (i) {
                            return String(i);
                        });

                        if (len > 2) {
                            return (
                                "one of "
                                    .concat(thing, " ")
                                    .concat(
                                        expected.slice(0, len - 1).join(", "),
                                        ", or "
                                    ) + expected[len - 1]
                            );
                        } else if (len === 2) {
                            return "one of "
                                .concat(thing, " ")
                                .concat(expected[0], " or ")
                                .concat(expected[1]);
                        }
                        return "of ".concat(thing, " ").concat(expected[0]);
                    }
                    return "of ".concat(thing, " ").concat(String(expected));
                } // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith

                function startsWith(str, search, pos) {
                    return (
                        str.substr(!pos || pos < 0 ? 0 : Number(pos), search.length) ===
                        search
                    );
                } // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith

                function endsWith(str, search, this_len) {
                    if (this_len === undefined || this_len > str.length) {
                        this_len = str.length;
                    }

                    return str.substring(this_len - search.length, this_len) === search;
                } // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes

                function includes(str, search, start) {
                    if (typeof start !== "number") {
                        start = 0;
                    }

                    if (start + search.length > str.length) {
                        return false;
                    }
                    return str.indexOf(search, start) !== -1;
                }

                createErrorType(
                    "ERR_INVALID_OPT_VALUE",
                    function (name, value) {
                        return (
                            'The value "' +
                            value +
                            '" is invalid for option "' +
                            name +
                            '"'
                        );
                    },
                    TypeError
                );
                createErrorType(
                    "ERR_INVALID_ARG_TYPE",
                    function (name, expected, actual) {
                        // Determiner: 'must be' or 'must not be'
                        var determiner;

                        if (
                            typeof expected === "string" &&
                            startsWith(expected, "not ")
                        ) {
                            determiner = "must not be";
                            expected = expected.replace(/^not /, "");
                        } else {
                            determiner = "must be";
                        }

                        var msg;

                        if (endsWith(name, " argument")) {
                            // For cases like 'first argument'
                            msg = "The "
                                .concat(name, " ")
                                .concat(determiner, " ")
                                .concat(oneOf(expected, "type"));
                        } else {
                            var type = includes(name, ".") ? "property" : "argument";
                            msg = 'The "'
                                .concat(name, '" ')
                                .concat(type, " ")
                                .concat(determiner, " ")
                                .concat(oneOf(expected, "type"));
                        }

                        msg += ". Received type ".concat(typeof actual);
                        return msg;
                    },
                    TypeError
                );
                createErrorType("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF");
                createErrorType("ERR_METHOD_NOT_IMPLEMENTED", function (name) {
                    return "The " + name + " method is not implemented";
                });
                createErrorType("ERR_STREAM_PREMATURE_CLOSE", "Premature close");
                createErrorType("ERR_STREAM_DESTROYED", function (name) {
                    return "Cannot call " + name + " after a stream was destroyed";
                });
                createErrorType(
                    "ERR_MULTIPLE_CALLBACK",
                    "Callback called multiple times"
                );
                createErrorType("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable");
                createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end");
                createErrorType(
                    "ERR_STREAM_NULL_VALUES",
                    "May not write null values to stream",
                    TypeError
                );
                createErrorType(
                    "ERR_UNKNOWN_ENCODING",
                    function (arg) {
                        return "Unknown encoding: " + arg;
                    },
                    TypeError
                );
                createErrorType(
                    "ERR_STREAM_UNSHIFT_AFTER_END_EVENT",
                    "stream.unshift() after end event"
                );
                module.exports.codes = codes;
            },
            {},
        ],
        33: [
            function (require, module, exports) {
                (function (process) {
                    (function () {
                        // Copyright Joyent, Inc. and other Node contributors.
                        //
                        // Permission is hereby granted, free of charge, to any person obtaining a
                        // copy of this software and associated documentation files (the
                        // "Software"), to deal in the Software without restriction, including
                        // without limitation the rights to use, copy, modify, merge, publish,
                        // distribute, sublicense, and/or sell copies of the Software, and to permit
                        // persons to whom the Software is furnished to do so, subject to the
                        // following conditions:
                        //
                        // The above copyright notice and this permission notice shall be included
                        // in all copies or substantial portions of the Software.
                        //
                        // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
                        // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
                        // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
                        // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
                        // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
                        // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
                        // USE OR OTHER DEALINGS IN THE SOFTWARE.
                        // a duplex stream is just a stream that is both readable and writable.
                        // Since JS doesn't have multiple prototypal inheritance, this class
                        // prototypally inherits from Readable, and then parasitically from
                        // Writable.
                        "use strict";
                        /* <replacement>*/

                        var objectKeys =
                            Object.keys ||
                            function (obj) {
                                var keys = [];

                                for (var key in obj) {
                                    keys.push(key);
                                }

                                return keys;
                            };
                        /* </replacement>*/

                        module.exports = Duplex;

                        var Readable = require("./_stream_readable");

                        var Writable = require("./_stream_writable");

                        require("inherits")(Duplex, Readable);

                        {
                            // Allow the keys array to be GC'ed.
                            var keys = objectKeys(Writable.prototype);

                            for (var v = 0; v < keys.length; v++) {
                                var method = keys[v];
                                if (!Duplex.prototype[method])
                                    Duplex.prototype[method] =
                                        Writable.prototype[method];
                            }
                        }

                        function Duplex(options) {
                            if (!(this instanceof Duplex)) return new Duplex(options);
                            Readable.call(this, options);
                            Writable.call(this, options);
                            this.allowHalfOpen = true;

                            if (options) {
                                if (options.readable === false) this.readable = false;
                                if (options.writable === false) this.writable = false;

                                if (options.allowHalfOpen === false) {
                                    this.allowHalfOpen = false;
                                    this.once("end", onend);
                                }
                            }
                        }

                        Object.defineProperty(
                            Duplex.prototype,
                            "writableHighWaterMark",
                            {
                                // Making it explicit this property is not enumerable
                                // because otherwise some prototype manipulation in
                                // userland will fail
                                enumerable: false,
                                get: function get() {
                                    return this._writableState.highWaterMark;
                                },
                            }
                        );
                        Object.defineProperty(Duplex.prototype, "writableBuffer", {
                            // Making it explicit this property is not enumerable
                            // because otherwise some prototype manipulation in
                            // userland will fail
                            enumerable: false,
                            get: function get() {
                                return (
                                    this._writableState &&
                                    this._writableState.getBuffer()
                                );
                            },
                        });
                        Object.defineProperty(Duplex.prototype, "writableLength", {
                            // Making it explicit this property is not enumerable
                            // because otherwise some prototype manipulation in
                            // userland will fail
                            enumerable: false,
                            get: function get() {
                                return this._writableState.length;
                            },
                        }); // The no-half-open enforcer

                        function onend() {
                            // If the writable side ended, then we're ok.
                            if (this._writableState.ended) return; // No more data can be written.
                            // But allow more writes to happen in this tick.

                            process.nextTick(onEndNT, this);
                        }

                        function onEndNT(self) {
                            self.end();
                        }

                        Object.defineProperty(Duplex.prototype, "destroyed", {
                            // Making it explicit this property is not enumerable
                            // because otherwise some prototype manipulation in
                            // userland will fail
                            enumerable: false,
                            get: function get() {
                                if (
                                    this._readableState === undefined ||
                                    this._writableState === undefined
                                ) {
                                    return false;
                                }

                                return (
                                    this._readableState.destroyed &&
                                    this._writableState.destroyed
                                );
                            },
                            set: function set(value) {
                                // We ignore the value if the stream
                                // has not been initialized yet
                                if (
                                    this._readableState === undefined ||
                                    this._writableState === undefined
                                ) {
                                    return;
                                } // Backward compatibility, the user is explicitly
                                // managing destroyed

                                this._readableState.destroyed = value;
                                this._writableState.destroyed = value;
                            },
                        });
                    }.call(this));
                }.call(this, require("_process")));
            },
            {
                "./_stream_readable": 35,
                "./_stream_writable": 37,
                _process: 22,
                inherits: 21,
            },
        ],
        34: [
            function (require, module, exports) {
                // Copyright Joyent, Inc. and other Node contributors.
                //
                // Permission is hereby granted, free of charge, to any person obtaining a
                // copy of this software and associated documentation files (the
                // "Software"), to deal in the Software without restriction, including
                // without limitation the rights to use, copy, modify, merge, publish,
                // distribute, sublicense, and/or sell copies of the Software, and to permit
                // persons to whom the Software is furnished to do so, subject to the
                // following conditions:
                //
                // The above copyright notice and this permission notice shall be included
                // in all copies or substantial portions of the Software.
                //
                // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
                // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
                // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
                // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
                // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
                // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
                // USE OR OTHER DEALINGS IN THE SOFTWARE.
                // a passthrough stream.
                // basically just the most minimal sort of Transform stream.
                // Every written chunk gets output as-is.
                "use strict";

                module.exports = PassThrough;

                var Transform = require("./_stream_transform");

                require("inherits")(PassThrough, Transform);

                function PassThrough(options) {
                    if (!(this instanceof PassThrough)) return new PassThrough(options);
                    Transform.call(this, options);
                }

                PassThrough.prototype._transform = function (chunk, encoding, cb) {
                    cb(null, chunk);
                };
            },
            {"./_stream_transform": 36, inherits: 21},
        ],
        35: [
            function (require, module, exports) {
                (function (process, global) {
                    (function () {
                        // Copyright Joyent, Inc. and other Node contributors.
                        //
                        // Permission is hereby granted, free of charge, to any person obtaining a
                        // copy of this software and associated documentation files (the
                        // "Software"), to deal in the Software without restriction, including
                        // without limitation the rights to use, copy, modify, merge, publish,
                        // distribute, sublicense, and/or sell copies of the Software, and to permit
                        // persons to whom the Software is furnished to do so, subject to the
                        // following conditions:
                        //
                        // The above copyright notice and this permission notice shall be included
                        // in all copies or substantial portions of the Software.
                        //
                        // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
                        // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
                        // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
                        // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
                        // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
                        // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
                        // USE OR OTHER DEALINGS IN THE SOFTWARE.
                        "use strict";

                        module.exports = Readable;
                        /* <replacement>*/

                        var Duplex;
                        /* </replacement>*/

                        Readable.ReadableState = ReadableState;
                        /* <replacement>*/

                        var EE = require("events").EventEmitter;

                        var EElistenerCount = function EElistenerCount(emitter, type) {
                            return emitter.listeners(type).length;
                        };
                        /* </replacement>*/

                        /* <replacement>*/

                        var Stream = require("./internal/streams/stream");
                        /* </replacement>*/

                        var Buffer = require("buffer").Buffer;

                        var OurUint8Array = global.Uint8Array || function () {};

                        function _uint8ArrayToBuffer(chunk) {
                            return Buffer.from(chunk);
                        }

                        function _isUint8Array(obj) {
                            return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
                        }
                        /* <replacement>*/

                        var debugUtil = require("util");

                        var debug;

                        if (debugUtil && debugUtil.debuglog) {
                            debug = debugUtil.debuglog("stream");
                        } else {
                            debug = function debug() {};
                        }
                        /* </replacement>*/

                        var BufferList = require("./internal/streams/buffer_list");

                        var destroyImpl = require("./internal/streams/destroy");

                        var _require = require("./internal/streams/state"),
                            getHighWaterMark = _require.getHighWaterMark;

                        var _require$codes = require("../errors").codes,
                            ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
                            ERR_STREAM_PUSH_AFTER_EOF =
                                _require$codes.ERR_STREAM_PUSH_AFTER_EOF,
                            ERR_METHOD_NOT_IMPLEMENTED =
                                _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
                            ERR_STREAM_UNSHIFT_AFTER_END_EVENT =
                                _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT; // Lazy loaded to improve the startup performance.

                        var StringDecoder;
                        var createReadableStreamAsyncIterator;
                        var from;

                        require("inherits")(Readable, Stream);

                        var errorOrDestroy = destroyImpl.errorOrDestroy;
                        var kProxyEvents = [
                            "error",
                            "close",
                            "destroy",
                            "pause",
                            "resume",
                        ];

                        function prependListener(emitter, event, fn) {
                            // Sadly this is not cacheable as some libraries bundle their own
                            // event emitter implementation with them.
                            if (typeof emitter.prependListener === "function")
                                return emitter.prependListener(event, fn); // This is a hack to make sure that our error handler is attached before any
                            // userland ones.  NEVER DO THIS. This is here only because this code needs
                            // to continue to work with older versions of Node.js that do not include
                            // the prependListener() method. The goal is to eventually remove this hack.

                            if (!emitter._events || !emitter._events[event])
                                emitter.on(event, fn);
                            else if (Array.isArray(emitter._events[event]))
                                emitter._events[event].unshift(fn);
                            else emitter._events[event] = [fn, emitter._events[event]];
                        }

                        function ReadableState(options, stream, isDuplex) {
                            Duplex = Duplex || require("./_stream_duplex");
                            options = options || {}; // Duplex streams are both readable and writable, but share
                            // the same options object.
                            // However, some cases require setting options to different
                            // values for the readable and the writable sides of the duplex stream.
                            // These options can be provided separately as readableXXX and writableXXX.

                            if (typeof isDuplex !== "boolean")
                                isDuplex = stream instanceof Duplex; // Object stream flag. Used to make read(n) ignore n and to
                            // make all the buffer merging and length checks go away

                            this.objectMode = Boolean(options.objectMode);
                            if (isDuplex)
                                this.objectMode =
                                    this.objectMode ||
                                    Boolean(options.readableObjectMode); // The point at which it stops calling _read() to fill the buffer
                            // Note: 0 is a valid value, means "don't call _read preemptively ever"

                            this.highWaterMark = getHighWaterMark(
                                this,
                                options,
                                "readableHighWaterMark",
                                isDuplex
                            ); // A linked list is used to store data chunks instead of an array because the
                            // linked list can remove elements from the beginning faster than
                            // array.shift()

                            this.buffer = new BufferList();
                            this.length = 0;
                            this.pipes = null;
                            this.pipesCount = 0;
                            this.flowing = null;
                            this.ended = false;
                            this.endEmitted = false;
                            this.reading = false; // A flag to be able to tell if the event 'readable'/'data' is emitted
                            // immediately, or on a later tick.  We set this to true at first, because
                            // any actions that shouldn't happen until "later" should generally also
                            // not happen before the first read call.

                            this.sync = true; // Whenever we return null, then we set a flag to say
                            // that we're awaiting a 'readable' event emission.

                            this.needReadable = false;
                            this.emittedReadable = false;
                            this.readableListening = false;
                            this.resumeScheduled = false;
                            this.paused = true; // Should close be emitted on destroy. Defaults to true.

                            this.emitClose = options.emitClose !== false; // Should .destroy() be called after 'end' (and potentially 'finish')

                            this.autoDestroy = Boolean(options.autoDestroy); // Has it been destroyed

                            this.destroyed = false; // Crypto is kind of old and crusty.  Historically, its default string
                            // encoding is 'binary' so we have to make this configurable.
                            // Everything else in the universe uses 'utf8', though.

                            this.defaultEncoding = options.defaultEncoding || "utf8"; // The number of writers that are awaiting a drain event in .pipe()s

                            this.awaitDrain = 0; // If true, a maybeReadMore has been scheduled

                            this.readingMore = false;
                            this.decoder = null;
                            this.encoding = null;

                            if (options.encoding) {
                                if (!StringDecoder)
                                    StringDecoder =
                                        require("string_decoder/").StringDecoder;
                                this.decoder = new StringDecoder(options.encoding);
                                this.encoding = options.encoding;
                            }
                        }

                        function Readable(options) {
                            Duplex = Duplex || require("./_stream_duplex");
                            if (!(this instanceof Readable))
                                return new Readable(options); // Checking for a Stream.Duplex instance is faster here instead of inside
                            // the ReadableState constructor, at least with V8 6.5

                            var isDuplex = this instanceof Duplex;
                            this._readableState = new ReadableState(
                                options,
                                this,
                                isDuplex
                            ); // Legacy

                            this.readable = true;

                            if (options) {
                                if (typeof options.read === "function")
                                    this._read = options.read;
                                if (typeof options.destroy === "function")
                                    this._destroy = options.destroy;
                            }

                            Stream.call(this);
                        }

                        Object.defineProperty(Readable.prototype, "destroyed", {
                            // Making it explicit this property is not enumerable
                            // because otherwise some prototype manipulation in
                            // userland will fail
                            enumerable: false,
                            get: function get() {
                                if (this._readableState === undefined) {
                                    return false;
                                }

                                return this._readableState.destroyed;
                            },
                            set: function set(value) {
                                // We ignore the value if the stream
                                // has not been initialized yet
                                if (!this._readableState) {
                                    return;
                                } // Backward compatibility, the user is explicitly
                                // managing destroyed

                                this._readableState.destroyed = value;
                            },
                        });
                        Readable.prototype.destroy = destroyImpl.destroy;
                        Readable.prototype._undestroy = destroyImpl.undestroy;

                        Readable.prototype._destroy = function (err, cb) {
                            cb(err);
                        }; // Manually shove something into the read() buffer.
                        // This returns true if the highWaterMark has not been hit yet,
                        // similar to how Writable.write() returns true if you should
                        // write() some more.

                        Readable.prototype.push = function (chunk, encoding) {
                            var state = this._readableState;
                            var skipChunkCheck;

                            if (!state.objectMode) {
                                if (typeof chunk === "string") {
                                    encoding = encoding || state.defaultEncoding;

                                    if (encoding !== state.encoding) {
                                        chunk = Buffer.from(chunk, encoding);
                                        encoding = "";
                                    }

                                    skipChunkCheck = true;
                                }
                            } else {
                                skipChunkCheck = true;
                            }

                            return readableAddChunk(
                                this,
                                chunk,
                                encoding,
                                false,
                                skipChunkCheck
                            );
                        }; // Unshift should *always* be something directly out of read()

                        Readable.prototype.unshift = function (chunk) {
                            return readableAddChunk(this, chunk, null, true, false);
                        };

                        function readableAddChunk(
                            stream,
                            chunk,
                            encoding,
                            addToFront,
                            skipChunkCheck
                        ) {
                            debug("readableAddChunk", chunk);
                            var state = stream._readableState;

                            if (chunk === null) {
                                state.reading = false;
                                onEofChunk(stream, state);
                            } else {
                                var er;
                                if (!skipChunkCheck) er = chunkInvalid(state, chunk);

                                if (er) {
                                    errorOrDestroy(stream, er);
                                } else if (
                                    state.objectMode ||
                                    (chunk && chunk.length > 0)
                                ) {
                                    if (
                                        typeof chunk !== "string" &&
                                        !state.objectMode &&
                                        Object.getPrototypeOf(chunk) !==
                                            Buffer.prototype
                                    ) {
                                        chunk = _uint8ArrayToBuffer(chunk);
                                    }

                                    if (addToFront) {
                                        if (state.endEmitted)
                                            errorOrDestroy(
                                                stream,
                                                new ERR_STREAM_UNSHIFT_AFTER_END_EVENT()
                                            );
                                        else addChunk(stream, state, chunk, true);
                                    } else if (state.ended) {
                                        errorOrDestroy(
                                            stream,
                                            new ERR_STREAM_PUSH_AFTER_EOF()
                                        );
                                    } else if (state.destroyed) {
                                        return false;
                                    } else {
                                        state.reading = false;

                                        if (state.decoder && !encoding) {
                                            chunk = state.decoder.write(chunk);
                                            if (state.objectMode || chunk.length !== 0)
                                                addChunk(stream, state, chunk, false);
                                            else maybeReadMore(stream, state);
                                        } else {
                                            addChunk(stream, state, chunk, false);
                                        }
                                    }
                                } else if (!addToFront) {
                                    state.reading = false;
                                    maybeReadMore(stream, state);
                                }
                            } // We can push more data if we are below the highWaterMark.
                            // Also, if we have no data yet, we can stand some more bytes.
                            // This is to work around cases where hwm=0, such as the repl.

                            return (
                                !state.ended &&
                                (state.length < state.highWaterMark ||
                                    state.length === 0)
                            );
                        }

                        function addChunk(stream, state, chunk, addToFront) {
                            if (state.flowing && state.length === 0 && !state.sync) {
                                state.awaitDrain = 0;
                                stream.emit("data", chunk);
                            } else {
                                // Update the buffer info.
                                state.length += state.objectMode ? 1 : chunk.length;
                                if (addToFront) state.buffer.unshift(chunk);
                                else state.buffer.push(chunk);
                                if (state.needReadable) emitReadable(stream);
                            }

                            maybeReadMore(stream, state);
                        }

                        function chunkInvalid(state, chunk) {
                            var er;

                            if (
                                !_isUint8Array(chunk) &&
                                typeof chunk !== "string" &&
                                chunk !== undefined &&
                                !state.objectMode
                            ) {
                                er = new ERR_INVALID_ARG_TYPE(
                                    "chunk",
                                    ["string", "Buffer", "Uint8Array"],
                                    chunk
                                );
                            }

                            return er;
                        }

                        Readable.prototype.isPaused = function () {
                            return this._readableState.flowing === false;
                        }; // Backwards compatibility.

                        Readable.prototype.setEncoding = function (enc) {
                            if (!StringDecoder)
                                StringDecoder =
                                    require("string_decoder/").StringDecoder;
                            var decoder = new StringDecoder(enc);
                            this._readableState.decoder = decoder; // If setEncoding(null), decoder.encoding equals utf8

                            this._readableState.encoding =
                                this._readableState.decoder.encoding; // Iterate over current buffer to convert already stored Buffers:

                            var p = this._readableState.buffer.head;
                            var content = "";

                            while (p !== null) {
                                content += decoder.write(p.data);
                                p = p.next;
                            }

                            this._readableState.buffer.clear();

                            if (content !== "")
                                this._readableState.buffer.push(content);
                            this._readableState.length = content.length;
                            return this;
                        }; // Don't raise the hwm > 1GB

                        var MAX_HWM = 0x40000000;

                        function computeNewHighWaterMark(n) {
                            if (n >= MAX_HWM) {
                                // TODO(ronag): Throw ERR_VALUE_OUT_OF_RANGE.
                                n = MAX_HWM;
                            } else {
                                // Get the next highest power of 2 to prevent increasing hwm excessively in
                                // tiny amounts
                                n--;
                                n |= n >>> 1;
                                n |= n >>> 2;
                                n |= n >>> 4;
                                n |= n >>> 8;
                                n |= n >>> 16;
                                n++;
                            }

                            return n;
                        } // This function is designed to be inlinable, so please take care when making
                        // changes to the function body.

                        function howMuchToRead(n, state) {
                            if (n <= 0 || (state.length === 0 && state.ended)) return 0;
                            if (state.objectMode) return 1;

                            if (n !== n) {
                                // Only flow one buffer at a time
                                if (state.flowing && state.length)
                                    return state.buffer.head.data.length;
                                return state.length;
                            } // If we're asking for more than the current hwm, then raise the hwm.

                            if (n > state.highWaterMark)
                                state.highWaterMark = computeNewHighWaterMark(n);
                            if (n <= state.length) return n; // Don't have enough

                            if (!state.ended) {
                                state.needReadable = true;
                                return 0;
                            }

                            return state.length;
                        } // You can override either this method, or the async _read(n) below.

                        Readable.prototype.read = function (n) {
                            debug("read", n);
                            n = parseInt(n, 10);
                            var state = this._readableState;
                            var nOrig = n;
                            if (n !== 0) state.emittedReadable = false; // If we're doing read(0) to trigger a readable event, but we
                            // already have a bunch of data in the buffer, then just trigger
                            // the 'readable' event and move on.

                            if (
                                n === 0 &&
                                state.needReadable &&
                                ((state.highWaterMark !== 0
                                    ? state.length >= state.highWaterMark
                                    : state.length > 0) ||
                                    state.ended)
                            ) {
                                debug("read: emitReadable", state.length, state.ended);
                                if (state.length === 0 && state.ended)
                                    endReadable(this);
                                else emitReadable(this);
                                return null;
                            }

                            n = howMuchToRead(n, state); // If we've ended, and we're now clear, then finish it up.

                            if (n === 0 && state.ended) {
                                if (state.length === 0) endReadable(this);
                                return null;
                            } // All the actual chunk generation logic needs to be
                            // *below* the call to _read.  The reason is that in certain
                            // synthetic stream cases, such as passthrough streams, _read
                            // may be a completely synchronous operation which may change
                            // the state of the read buffer, providing enough data when
                            // before there was *not* enough.
                            //
                            // So, the steps are:
                            // 1. Figure out what the state of things will be after we do
                            // a read from the buffer.
                            //
                            // 2. If that resulting state will trigger a _read, then call _read.
                            // Note that this may be asynchronous, or synchronous.  Yes, it is
                            // deeply ugly to write APIs this way, but that still doesn't mean
                            // that the Readable class should behave improperly, as streams are
                            // designed to be sync/async agnostic.
                            // Take note if the _read call is sync or async (ie, if the read call
                            // has returned yet), so that we know whether or not it's safe to emit
                            // 'readable' etc.
                            //
                            // 3. Actually pull the requested chunks out of the buffer and return.
                            // if we need a readable event, then we need to do some reading.

                            var doRead = state.needReadable;
                            debug("need readable", doRead); // If we currently have less than the highWaterMark, then also read some

                            if (
                                state.length === 0 ||
                                state.length - n < state.highWaterMark
                            ) {
                                doRead = true;
                                debug("length less than watermark", doRead);
                            } // However, if we've ended, then there's no point, and if we're already
                            // reading, then it's unnecessary.

                            if (state.ended || state.reading) {
                                doRead = false;
                                debug("reading or ended", doRead);
                            } else if (doRead) {
                                debug("do read");
                                state.reading = true;
                                state.sync = true; // If the length is currently zero, then we *need* a readable event.

                                if (state.length === 0) state.needReadable = true; // Call internal read method

                                this._read(state.highWaterMark);

                                state.sync = false; // If _read pushed data synchronously, then `reading` will be false,
                                // and we need to re-evaluate how much data we can return to the user.

                                if (!state.reading) n = howMuchToRead(nOrig, state);
                            }

                            var ret;
                            if (n > 0) ret = fromList(n, state);
                            else ret = null;

                            if (ret === null) {
                                state.needReadable =
                                    state.length <= state.highWaterMark;
                                n = 0;
                            } else {
                                state.length -= n;
                                state.awaitDrain = 0;
                            }

                            if (state.length === 0) {
                                // If we have nothing in the buffer, then we want to know
                                // as soon as we *do* get something into the buffer.
                                if (!state.ended) state.needReadable = true; // If we tried to read() past the EOF, then emit end on the next tick.

                                if (nOrig !== n && state.ended) endReadable(this);
                            }

                            if (ret !== null) this.emit("data", ret);
                            return ret;
                        };

                        function onEofChunk(stream, state) {
                            debug("onEofChunk");
                            if (state.ended) return;

                            if (state.decoder) {
                                var chunk = state.decoder.end();

                                if (chunk && chunk.length) {
                                    state.buffer.push(chunk);
                                    state.length += state.objectMode ? 1 : chunk.length;
                                }
                            }

                            state.ended = true;

                            if (state.sync) {
                                // If we are sync, wait until next tick to emit the data.
                                // Otherwise we risk emitting data in the flow()
                                // the readable code triggers during a read() call
                                emitReadable(stream);
                            } else {
                                // Emit 'readable' now to make sure it gets picked up.
                                state.needReadable = false;

                                if (!state.emittedReadable) {
                                    state.emittedReadable = true;
                                    emitReadable_(stream);
                                }
                            }
                        } // Don't emit readable right away in sync mode, because this can trigger
                        // another read() call => stack overflow.  This way, it might trigger
                        // a nextTick recursion warning, but that's not so bad.

                        function emitReadable(stream) {
                            var state = stream._readableState;
                            debug(
                                "emitReadable",
                                state.needReadable,
                                state.emittedReadable
                            );
                            state.needReadable = false;

                            if (!state.emittedReadable) {
                                debug("emitReadable", state.flowing);
                                state.emittedReadable = true;
                                process.nextTick(emitReadable_, stream);
                            }
                        }

                        function emitReadable_(stream) {
                            var state = stream._readableState;
                            debug(
                                "emitReadable_",
                                state.destroyed,
                                state.length,
                                state.ended
                            );

                            if (!state.destroyed && (state.length || state.ended)) {
                                stream.emit("readable");
                                state.emittedReadable = false;
                            } // The stream needs another readable event if
                            // 1. It is not flowing, as the flow mechanism will take
                            //    care of it.
                            // 2. It is not ended.
                            // 3. It is below the highWaterMark, so we can schedule
                            //    another readable later.

                            state.needReadable =
                                !state.flowing &&
                                !state.ended &&
                                state.length <= state.highWaterMark;
                            flow(stream);
                        } // At this point, the user has presumably seen the 'readable' event,
                        // and called read() to consume some data.  that may have triggered
                        // in turn another _read(n) call, in which case reading = true if
                        // it's in progress.
                        // However, if we're not ended, or reading, and the length < hwm,
                        // then go ahead and try to read some more preemptively.

                        function maybeReadMore(stream, state) {
                            if (!state.readingMore) {
                                state.readingMore = true;
                                process.nextTick(maybeReadMore_, stream, state);
                            }
                        }

                        function maybeReadMore_(stream, state) {
                            // Attempt to read more data if we should.
                            //
                            // The conditions for reading more data are (one of):
                            // - Not enough data buffered (state.length < state.highWaterMark). The loop
                            //   is responsible for filling the buffer with enough data if such data
                            //   is available. If highWaterMark is 0 and we are not in the flowing mode
                            //   we should _not_ attempt to buffer any extra data. We'll get more data
                            //   when the stream consumer calls read() instead.
                            // - No data in the buffer, and the stream is in flowing mode. In this mode
                            //   the loop below is responsible for ensuring read() is called. Failing to
                            //   call read here would abort the flow and there's no other mechanism for
                            //   continuing the flow if the stream consumer has just subscribed to the
                            //   'data' event.
                            //
                            // In addition to the above conditions to keep reading data, the following
                            // conditions prevent the data from being read:
                            // - The stream has ended (state.ended).
                            // - There is already a pending 'read' operation (state.reading). This is a
                            //   case where the the stream has called the implementation defined _read()
                            //   method, but they are processing the call asynchronously and have _not_
                            //   called push() with new data. In this case we skip performing more
                            //   read()s. The execution ends in this method again after the _read() ends
                            //   up calling push() with more data.
                            while (
                                !state.reading &&
                                !state.ended &&
                                (state.length < state.highWaterMark ||
                                    (state.flowing && state.length === 0))
                            ) {
                                var len = state.length;
                                debug("maybeReadMore read 0");
                                stream.read(0);
                                if (len === state.length)
                                    // Didn't get any data, stop spinning.
                                    break;
                            }

                            state.readingMore = false;
                        } // Abstract method.  to be overridden in specific implementation classes.
                        // call cb(er, data) where data is <= n in length.
                        // for virtual (non-string, non-buffer) streams, "length" is somewhat
                        // arbitrary, and perhaps not very meaningful.

                        Readable.prototype._read = function (n) {
                            errorOrDestroy(
                                this,
                                new ERR_METHOD_NOT_IMPLEMENTED("_read()")
                            );
                        };

                        Readable.prototype.pipe = function (dest, pipeOpts) {
                            var src = this;
                            var state = this._readableState;

                            switch (state.pipesCount) {
                                case 0:
                                    state.pipes = dest;
                                    break;

                                case 1:
                                    state.pipes = [state.pipes, dest];
                                    break;

                                default:
                                    state.pipes.push(dest);
                                    break;
                            }

                            state.pipesCount += 1;
                            debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
                            var doEnd =
                                (!pipeOpts || pipeOpts.end !== false) &&
                                dest !== process.stdout &&
                                dest !== process.stderr;
                            var endFn = doEnd ? onend : unpipe;
                            if (state.endEmitted) process.nextTick(endFn);
                            else src.once("end", endFn);
                            dest.on("unpipe", onunpipe);

                            function onunpipe(readable, unpipeInfo) {
                                debug("onunpipe");

                                if (readable === src) {
                                    if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
                                        unpipeInfo.hasUnpiped = true;
                                        cleanup();
                                    }
                                }
                            }

                            function onend() {
                                debug("onend");
                                dest.end();
                            } // When the dest drains, it reduces the awaitDrain counter
                            // on the source.  This would be more elegant with a .once()
                            // handler in flow(), but adding and removing repeatedly is
                            // too slow.

                            var ondrain = pipeOnDrain(src);
                            dest.on("drain", ondrain);
                            var cleanedUp = false;

                            function cleanup() {
                                debug("cleanup"); // Cleanup event handlers once the pipe is broken

                                dest.removeListener("close", onclose);
                                dest.removeListener("finish", onfinish);
                                dest.removeListener("drain", ondrain);
                                dest.removeListener("error", onerror);
                                dest.removeListener("unpipe", onunpipe);
                                src.removeListener("end", onend);
                                src.removeListener("end", unpipe);
                                src.removeListener("data", ondata);
                                cleanedUp = true; // If the reader is waiting for a drain event from this
                                // specific writer, then it would cause it to never start
                                // flowing again.
                                // So, if this is awaiting a drain, then we just call it now.
                                // If we don't know, then assume that we are waiting for one.

                                if (
                                    state.awaitDrain &&
                                    (!dest._writableState ||
                                        dest._writableState.needDrain)
                                )
                                    ondrain();
                            }

                            src.on("data", ondata);

                            function ondata(chunk) {
                                debug("ondata");
                                var ret = dest.write(chunk);
                                debug("dest.write", ret);

                                if (ret === false) {
                                    // If the user unpiped during `dest.write()`, it is possible
                                    // to get stuck in a permanently paused state if that write
                                    // also returned false.
                                    // => Check whether `dest` is still a piping destination.
                                    if (
                                        ((state.pipesCount === 1 &&
                                            state.pipes === dest) ||
                                            (state.pipesCount > 1 &&
                                                indexOf(state.pipes, dest) !== -1)) &&
                                        !cleanedUp
                                    ) {
                                        debug(
                                            "false write response, pause",
                                            state.awaitDrain
                                        );
                                        state.awaitDrain++;
                                    }

                                    src.pause();
                                }
                            } // If the dest has an error, then stop piping into it.
                            // however, don't suppress the throwing behavior for this.

                            function onerror(er) {
                                debug("onerror", er);
                                unpipe();
                                dest.removeListener("error", onerror);
                                if (EElistenerCount(dest, "error") === 0)
                                    errorOrDestroy(dest, er);
                            } // Make sure our error handler is attached before userland ones.

                            prependListener(dest, "error", onerror); // Both close and finish should trigger unpipe, but only once.

                            function onclose() {
                                dest.removeListener("finish", onfinish);
                                unpipe();
                            }

                            dest.once("close", onclose);

                            function onfinish() {
                                debug("onfinish");
                                dest.removeListener("close", onclose);
                                unpipe();
                            }

                            dest.once("finish", onfinish);

                            function unpipe() {
                                debug("unpipe");
                                src.unpipe(dest);
                            } // Tell the dest that it's being piped to

                            dest.emit("pipe", src); // Start the flow if it hasn't been started already.

                            if (!state.flowing) {
                                debug("pipe resume");
                                src.resume();
                            }

                            return dest;
                        };

                        function pipeOnDrain(src) {
                            return function pipeOnDrainFunctionResult() {
                                var state = src._readableState;
                                debug("pipeOnDrain", state.awaitDrain);
                                if (state.awaitDrain) state.awaitDrain--;

                                if (
                                    state.awaitDrain === 0 &&
                                    EElistenerCount(src, "data")
                                ) {
                                    state.flowing = true;
                                    flow(src);
                                }
                            };
                        }

                        Readable.prototype.unpipe = function (dest) {
                            var state = this._readableState;
                            var unpipeInfo = {
                                hasUnpiped: false,
                            }; // If we're not piping anywhere, then do nothing.

                            if (state.pipesCount === 0) return this; // Just one destination.  most common case.

                            if (state.pipesCount === 1) {
                                // Passed in one, but it's not the right one.
                                if (dest && dest !== state.pipes) return this;
                                if (!dest) dest = state.pipes; // Got a match.

                                state.pipes = null;
                                state.pipesCount = 0;
                                state.flowing = false;
                                if (dest) dest.emit("unpipe", this, unpipeInfo);
                                return this;
                            } // Slow case. multiple pipe destinations.

                            if (!dest) {
                                // Remove all.
                                var dests = state.pipes;
                                var len = state.pipesCount;
                                state.pipes = null;
                                state.pipesCount = 0;
                                state.flowing = false;

                                for (var i = 0; i < len; i++) {
                                    dests[i].emit("unpipe", this, {
                                        hasUnpiped: false,
                                    });
                                }

                                return this;
                            } // Try to find the right one.

                            var index = indexOf(state.pipes, dest);
                            if (index === -1) return this;
                            state.pipes.splice(index, 1);
                            state.pipesCount -= 1;
                            if (state.pipesCount === 1) state.pipes = state.pipes[0];
                            dest.emit("unpipe", this, unpipeInfo);
                            return this;
                        }; // Set up data events if they are asked for
                        // Ensure readable listeners eventually get something

                        Readable.prototype.on = function (ev, fn) {
                            var res = Stream.prototype.on.call(this, ev, fn);
                            var state = this._readableState;

                            if (ev === "data") {
                                // Update readableListening so that resume() may be a no-op
                                // a few lines down. This is needed to support once('readable').
                                state.readableListening =
                                    this.listenerCount("readable") > 0; // Try start flowing on next tick if stream isn't explicitly paused

                                if (state.flowing !== false) this.resume();
                            } else if (ev === "readable") {
                                if (!state.endEmitted && !state.readableListening) {
                                    state.readableListening = state.needReadable = true;
                                    state.flowing = false;
                                    state.emittedReadable = false;
                                    debug("on readable", state.length, state.reading);

                                    if (state.length) {
                                        emitReadable(this);
                                    } else if (!state.reading) {
                                        process.nextTick(nReadingNextTick, this);
                                    }
                                }
                            }

                            return res;
                        };

                        Readable.prototype.addListener = Readable.prototype.on;

                        Readable.prototype.removeListener = function (ev, fn) {
                            var res = Stream.prototype.removeListener.call(
                                this,
                                ev,
                                fn
                            );

                            if (ev === "readable") {
                                // We need to check if there is someone still listening to
                                // readable and reset the state. However this needs to happen
                                // after readable has been emitted but before I/O (nextTick) to
                                // support once('readable', fn) cycles. This means that calling
                                // resume within the same tick will have no
                                // effect.
                                process.nextTick(updateReadableListening, this);
                            }

                            return res;
                        };

                        Readable.prototype.removeAllListeners = function (ev) {
                            var res = Stream.prototype.removeAllListeners.apply(
                                this,
                                arguments
                            );

                            if (ev === "readable" || ev === undefined) {
                                // We need to check if there is someone still listening to
                                // readable and reset the state. However this needs to happen
                                // after readable has been emitted but before I/O (nextTick) to
                                // support once('readable', fn) cycles. This means that calling
                                // resume within the same tick will have no
                                // effect.
                                process.nextTick(updateReadableListening, this);
                            }

                            return res;
                        };

                        function updateReadableListening(self) {
                            var state = self._readableState;
                            state.readableListening =
                                self.listenerCount("readable") > 0;

                            if (state.resumeScheduled && !state.paused) {
                                // Flowing needs to be set to true now, otherwise
                                // the upcoming resume will not flow.
                                state.flowing = true; // Crude way to check if we should resume
                            } else if (self.listenerCount("data") > 0) {
                                self.resume();
                            }
                        }

                        function nReadingNextTick(self) {
                            debug("readable nexttick read 0");
                            self.read(0);
                        } // Pause() and resume() are remnants of the legacy readable stream API
                        // If the user uses them, then switch into old mode.

                        Readable.prototype.resume = function () {
                            var state = this._readableState;

                            if (!state.flowing) {
                                debug("resume"); // We flow only if there is no one listening
                                // for readable, but we still have to call
                                // resume()

                                state.flowing = !state.readableListening;
                                resume(this, state);
                            }

                            state.paused = false;
                            return this;
                        };

                        function resume(stream, state) {
                            if (!state.resumeScheduled) {
                                state.resumeScheduled = true;
                                process.nextTick(resume_, stream, state);
                            }
                        }

                        function resume_(stream, state) {
                            debug("resume", state.reading);

                            if (!state.reading) {
                                stream.read(0);
                            }

                            state.resumeScheduled = false;
                            stream.emit("resume");
                            flow(stream);
                            if (state.flowing && !state.reading) stream.read(0);
                        }

                        Readable.prototype.pause = function () {
                            debug("call pause flowing=%j", this._readableState.flowing);

                            if (this._readableState.flowing !== false) {
                                debug("pause");
                                this._readableState.flowing = false;
                                this.emit("pause");
                            }

                            this._readableState.paused = true;
                            return this;
                        };

                        function flow(stream) {
                            var state = stream._readableState;
                            debug("flow", state.flowing);

                            while (state.flowing && stream.read() !== null) {}
                        } // Wrap an old-style stream as the async data source.
                        // This is *not* part of the readable stream interface.
                        // It is an ugly unfortunate mess of history.

                        Readable.prototype.wrap = function (stream) {
                            var _this = this;

                            var state = this._readableState;
                            var paused = false;
                            stream.on("end", function () {
                                debug("wrapped end");

                                if (state.decoder && !state.ended) {
                                    var chunk = state.decoder.end();
                                    if (chunk && chunk.length) _this.push(chunk);
                                }

                                _this.push(null);
                            });
                            stream.on("data", function (chunk) {
                                debug("wrapped data");
                                if (state.decoder) chunk = state.decoder.write(chunk); // Don't skip over falsy values in objectMode

                                if (
                                    state.objectMode &&
                                    (chunk === null || chunk === undefined)
                                )
                                    return;
                                else if (!state.objectMode && (!chunk || !chunk.length))
                                    return;

                                var ret = _this.push(chunk);

                                if (!ret) {
                                    paused = true;
                                    stream.pause();
                                }
                            }); // Proxy all the other methods.
                            // important when wrapping filters and duplexes.

                            for (var i in stream) {
                                if (
                                    this[i] === undefined &&
                                    typeof stream[i] === "function"
                                ) {
                                    this[i] = (function methodWrap(method) {
                                        return function methodWrapReturnFunction() {
                                            return stream[method].apply(
                                                stream,
                                                arguments
                                            );
                                        };
                                    })(i);
                                }
                            } // Proxy certain important events.

                            for (var n = 0; n < kProxyEvents.length; n++) {
                                stream.on(
                                    kProxyEvents[n],
                                    this.emit.bind(this, kProxyEvents[n])
                                );
                            } // When we try to consume some more bytes, simply unpause the
                            // underlying stream.

                            this._read = function (n) {
                                debug("wrapped _read", n);

                                if (paused) {
                                    paused = false;
                                    stream.resume();
                                }
                            };

                            return this;
                        };

                        if (typeof Symbol === "function") {
                            Readable.prototype[Symbol.asyncIterator] = function () {
                                if (createReadableStreamAsyncIterator === undefined) {
                                    createReadableStreamAsyncIterator = require("./internal/streams/async_iterator");
                                }

                                return createReadableStreamAsyncIterator(this);
                            };
                        }

                        Object.defineProperty(
                            Readable.prototype,
                            "readableHighWaterMark",
                            {
                                // Making it explicit this property is not enumerable
                                // because otherwise some prototype manipulation in
                                // userland will fail
                                enumerable: false,
                                get: function get() {
                                    return this._readableState.highWaterMark;
                                },
                            }
                        );
                        Object.defineProperty(Readable.prototype, "readableBuffer", {
                            // Making it explicit this property is not enumerable
                            // because otherwise some prototype manipulation in
                            // userland will fail
                            enumerable: false,
                            get: function get() {
                                return (
                                    this._readableState && this._readableState.buffer
                                );
                            },
                        });
                        Object.defineProperty(Readable.prototype, "readableFlowing", {
                            // Making it explicit this property is not enumerable
                            // because otherwise some prototype manipulation in
                            // userland will fail
                            enumerable: false,
                            get: function get() {
                                return this._readableState.flowing;
                            },
                            set: function set(state) {
                                if (this._readableState) {
                                    this._readableState.flowing = state;
                                }
                            },
                        }); // Exposed for testing purposes only.

                        Readable._fromList = fromList;
                        Object.defineProperty(Readable.prototype, "readableLength", {
                            // Making it explicit this property is not enumerable
                            // because otherwise some prototype manipulation in
                            // userland will fail
                            enumerable: false,
                            get: function get() {
                                return this._readableState.length;
                            },
                        }); // Pluck off n bytes from an array of buffers.
                        // Length is the combined lengths of all the buffers in the list.
                        // This function is designed to be inlinable, so please take care when making
                        // changes to the function body.

                        function fromList(n, state) {
                            // Nothing buffered
                            if (state.length === 0) return null;
                            var ret;
                            if (state.objectMode) ret = state.buffer.shift();
                            else if (!n || n >= state.length) {
                                // Read it all, truncate the list
                                if (state.decoder) ret = state.buffer.join("");
                                else if (state.buffer.length === 1)
                                    ret = state.buffer.first();
                                else ret = state.buffer.concat(state.length);
                                state.buffer.clear();
                            } else {
                                // Read part of list
                                ret = state.buffer.consume(n, state.decoder);
                            }
                            return ret;
                        }

                        function endReadable(stream) {
                            var state = stream._readableState;
                            debug("endReadable", state.endEmitted);

                            if (!state.endEmitted) {
                                state.ended = true;
                                process.nextTick(endReadableNT, state, stream);
                            }
                        }

                        function endReadableNT(state, stream) {
                            debug("endReadableNT", state.endEmitted, state.length); // Check that we didn't get one last unshift.

                            if (!state.endEmitted && state.length === 0) {
                                state.endEmitted = true;
                                stream.readable = false;
                                stream.emit("end");

                                if (state.autoDestroy) {
                                    // In case of duplex streams we need a way to detect
                                    // if the writable side is ready for autoDestroy as well
                                    var wState = stream._writableState;

                                    if (
                                        !wState ||
                                        (wState.autoDestroy && wState.finished)
                                    ) {
                                        stream.destroy();
                                    }
                                }
                            }
                        }

                        if (typeof Symbol === "function") {
                            Readable.from = function (iterable, opts) {
                                if (from === undefined) {
                                    from = require("./internal/streams/from");
                                }

                                return from(Readable, iterable, opts);
                            };
                        }

                        function indexOf(xs, x) {
                            for (var i = 0, l = xs.length; i < l; i++) {
                                if (xs[i] === x) return i;
                            }

                            return -1;
                        }
                    }.call(this));
                }.call(
                    this,
                    require("_process"),
                    typeof global !== "undefined"
                        ? global
                        : typeof self !== "undefined"
                        ? self
                        : typeof window !== "undefined"
                        ? window
                        : {}
                ));
            },
            {
                "../errors": 32,
                "./_stream_duplex": 33,
                "./internal/streams/async_iterator": 38,
                "./internal/streams/buffer_list": 39,
                "./internal/streams/destroy": 40,
                "./internal/streams/from": 42,
                "./internal/streams/state": 44,
                "./internal/streams/stream": 45,
                _process: 22,
                buffer: 16,
                events: 18,
                inherits: 21,
                "string_decoder/": 47,
                util: 15,
            },
        ],
        36: [
            function (require, module, exports) {
                // Copyright Joyent, Inc. and other Node contributors.
                //
                // Permission is hereby granted, free of charge, to any person obtaining a
                // copy of this software and associated documentation files (the
                // "Software"), to deal in the Software without restriction, including
                // without limitation the rights to use, copy, modify, merge, publish,
                // distribute, sublicense, and/or sell copies of the Software, and to permit
                // persons to whom the Software is furnished to do so, subject to the
                // following conditions:
                //
                // The above copyright notice and this permission notice shall be included
                // in all copies or substantial portions of the Software.
                //
                // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
                // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
                // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
                // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
                // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
                // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
                // USE OR OTHER DEALINGS IN THE SOFTWARE.
                // a transform stream is a readable/writable stream where you do
                // something with the data.  Sometimes it's called a "filter",
                // but that's not a great name for it, since that implies a thing where
                // some bits pass through, and others are simply ignored.  (That would
                // be a valid example of a transform, of course.)
                //
                // While the output is causally related to the input, it's not a
                // necessarily symmetric or synchronous transformation.  For example,
                // a zlib stream might take multiple plain-text writes(), and then
                // emit a single compressed chunk some time in the future.
                //
                // Here's how this works:
                //
                // The Transform stream has all the aspects of the readable and writable
                // stream classes.  When you write(chunk), that calls _write(chunk,cb)
                // internally, and returns false if there's a lot of pending writes
                // buffered up.  When you call read(), that calls _read(n) until
                // there's enough pending readable data buffered up.
                //
                // In a transform stream, the written data is placed in a buffer.  When
                // _read(n) is called, it transforms the queued up data, calling the
                // buffered _write cb's as it consumes chunks.  If consuming a single
                // written chunk would result in multiple output chunks, then the first
                // outputted bit calls the readcb, and subsequent chunks just go into
                // the read buffer, and will cause it to emit 'readable' if necessary.
                //
                // This way, back-pressure is actually determined by the reading side,
                // since _read has to be called to start processing a new chunk.  However,
                // a pathological inflate type of transform can cause excessive buffering
                // here.  For example, imagine a stream where every byte of input is
                // interpreted as an integer from 0-255, and then results in that many
                // bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
                // 1kb of data being output.  In this case, you could write a very small
                // amount of input, and end up with a very large amount of output.  In
                // such a pathological inflating mechanism, there'd be no way to tell
                // the system to stop doing the transform.  A single 4MB write could
                // cause the system to run out of memory.
                //
                // However, even in such a pathological case, only a single written chunk
                // would be consumed, and then the rest would wait (un-transformed) until
                // the results of the previous transformed chunk were consumed.
                "use strict";

                module.exports = Transform;

                var _require$codes = require("../errors").codes,
                    ERR_METHOD_NOT_IMPLEMENTED =
                        _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
                    ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
                    ERR_TRANSFORM_ALREADY_TRANSFORMING =
                        _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING,
                    ERR_TRANSFORM_WITH_LENGTH_0 =
                        _require$codes.ERR_TRANSFORM_WITH_LENGTH_0;

                var Duplex = require("./_stream_duplex");

                require("inherits")(Transform, Duplex);

                function afterTransform(er, data) {
                    var ts = this._transformState;
                    ts.transforming = false;
                    var cb = ts.writecb;

                    if (cb === null) {
                        return this.emit("error", new ERR_MULTIPLE_CALLBACK());
                    }

                    ts.writechunk = null;
                    ts.writecb = null;
                    if (data != null)
                        // Single equals check for both `null` and `undefined`
                        this.push(data);
                    cb(er);
                    var rs = this._readableState;
                    rs.reading = false;

                    if (rs.needReadable || rs.length < rs.highWaterMark) {
                        this._read(rs.highWaterMark);
                    }
                }

                function Transform(options) {
                    if (!(this instanceof Transform)) return new Transform(options);
                    Duplex.call(this, options);
                    this._transformState = {
                        afterTransform: afterTransform.bind(this),
                        needTransform: false,
                        transforming: false,
                        writecb: null,
                        writechunk: null,
                        writeencoding: null,
                    }; // Start out asking for a readable event once data is transformed.

                    this._readableState.needReadable = true; // We have implemented the _read method, and done the other things
                    // that Readable wants before the first _read call, so unset the
                    // sync guard flag.

                    this._readableState.sync = false;

                    if (options) {
                        if (typeof options.transform === "function")
                            this._transform = options.transform;
                        if (typeof options.flush === "function")
                            this._flush = options.flush;
                    } // When the writable side finishes, then flush out anything remaining.

                    this.on("prefinish", prefinish);
                }

                function prefinish() {
                    var _this = this;

                    if (
                        typeof this._flush === "function" &&
                        !this._readableState.destroyed
                    ) {
                        this._flush(function (er, data) {
                            done(_this, er, data);
                        });
                    } else {
                        done(this, null, null);
                    }
                }

                Transform.prototype.push = function (chunk, encoding) {
                    this._transformState.needTransform = false;
                    return Duplex.prototype.push.call(this, chunk, encoding);
                }; // This is the part where you do stuff!
                // override this function in implementation classes.
                // 'chunk' is an input chunk.
                //
                // Call `push(newChunk)` to pass along transformed output
                // to the readable side.  You may call 'push' zero or more times.
                //
                // Call `cb(err)` when you are done with this chunk.  If you pass
                // an error, then that'll put the hurt on the whole operation.  If you
                // never call cb(), then you'll never get another chunk.

                Transform.prototype._transform = function (chunk, encoding, cb) {
                    cb(new ERR_METHOD_NOT_IMPLEMENTED("_transform()"));
                };

                Transform.prototype._write = function (chunk, encoding, cb) {
                    var ts = this._transformState;
                    ts.writecb = cb;
                    ts.writechunk = chunk;
                    ts.writeencoding = encoding;

                    if (!ts.transforming) {
                        var rs = this._readableState;
                        if (
                            ts.needTransform ||
                            rs.needReadable ||
                            rs.length < rs.highWaterMark
                        )
                            this._read(rs.highWaterMark);
                    }
                }; // Doesn't matter what the args are here.
                // _transform does all the work.
                // That we got here means that the readable side wants more data.

                Transform.prototype._read = function (n) {
                    var ts = this._transformState;

                    if (ts.writechunk !== null && !ts.transforming) {
                        ts.transforming = true;

                        this._transform(
                            ts.writechunk,
                            ts.writeencoding,
                            ts.afterTransform
                        );
                    } else {
                        // Mark that we need a transform, so that any data that comes in
                        // will get processed, now that we've asked for it.
                        ts.needTransform = true;
                    }
                };

                Transform.prototype._destroy = function (err, cb) {
                    Duplex.prototype._destroy.call(this, err, function (err2) {
                        cb(err2);
                    });
                };

                function done(stream, er, data) {
                    if (er) return stream.emit("error", er);
                    if (data != null)
                        // Single equals check for both `null` and `undefined`
                        stream.push(data); // TODO(BridgeAR): Write a test for these two error cases
                    // if there's nothing in the write buffer, then that means
                    // that nothing more will ever be provided

                    if (stream._writableState.length)
                        throw new ERR_TRANSFORM_WITH_LENGTH_0();
                    if (stream._transformState.transforming)
                        throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
                    return stream.push(null);
                }
            },
            {"../errors": 32, "./_stream_duplex": 33, inherits: 21},
        ],
        37: [
            function (require, module, exports) {
                (function (process, global) {
                    (function () {
                        // Copyright Joyent, Inc. and other Node contributors.
                        //
                        // Permission is hereby granted, free of charge, to any person obtaining a
                        // copy of this software and associated documentation files (the
                        // "Software"), to deal in the Software without restriction, including
                        // without limitation the rights to use, copy, modify, merge, publish,
                        // distribute, sublicense, and/or sell copies of the Software, and to permit
                        // persons to whom the Software is furnished to do so, subject to the
                        // following conditions:
                        //
                        // The above copyright notice and this permission notice shall be included
                        // in all copies or substantial portions of the Software.
                        //
                        // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
                        // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
                        // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
                        // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
                        // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
                        // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
                        // USE OR OTHER DEALINGS IN THE SOFTWARE.
                        // A bit simpler than readable streams.
                        // Implement an async ._write(chunk, encoding, cb), and it'll handle all
                        // the drain event emission and buffering.
                        "use strict";

                        module.exports = Writable;
                        /* <replacement> */

                        function WriteReq(chunk, encoding, cb) {
                            this.chunk = chunk;
                            this.encoding = encoding;
                            this.callback = cb;
                            this.next = null;
                        } // It seems a linked list but it is not
                        // there will be only 2 of these for each stream

                        function CorkedRequest(state) {
                            var _this = this;

                            this.next = null;
                            this.entry = null;

                            this.finish = function () {
                                onCorkedFinish(_this, state);
                            };
                        }
                        /* </replacement> */

                        /* <replacement>*/

                        var Duplex;
                        /* </replacement>*/

                        Writable.WritableState = WritableState;
                        /* <replacement>*/

                        var internalUtil = {
                            deprecate: require("util-deprecate"),
                        };
                        /* </replacement>*/

                        /* <replacement>*/

                        var Stream = require("./internal/streams/stream");
                        /* </replacement>*/

                        var Buffer = require("buffer").Buffer;

                        var OurUint8Array = global.Uint8Array || function () {};

                        function _uint8ArrayToBuffer(chunk) {
                            return Buffer.from(chunk);
                        }

                        function _isUint8Array(obj) {
                            return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
                        }

                        var destroyImpl = require("./internal/streams/destroy");

                        var _require = require("./internal/streams/state"),
                            getHighWaterMark = _require.getHighWaterMark;

                        var _require$codes = require("../errors").codes,
                            ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
                            ERR_METHOD_NOT_IMPLEMENTED =
                                _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
                            ERR_MULTIPLE_CALLBACK =
                                _require$codes.ERR_MULTIPLE_CALLBACK,
                            ERR_STREAM_CANNOT_PIPE =
                                _require$codes.ERR_STREAM_CANNOT_PIPE,
                            ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED,
                            ERR_STREAM_NULL_VALUES =
                                _require$codes.ERR_STREAM_NULL_VALUES,
                            ERR_STREAM_WRITE_AFTER_END =
                                _require$codes.ERR_STREAM_WRITE_AFTER_END,
                            ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;

                        var errorOrDestroy = destroyImpl.errorOrDestroy;

                        require("inherits")(Writable, Stream);

                        function nop() {}

                        function WritableState(options, stream, isDuplex) {
                            Duplex = Duplex || require("./_stream_duplex");
                            options = options || {}; // Duplex streams are both readable and writable, but share
                            // the same options object.
                            // However, some cases require setting options to different
                            // values for the readable and the writable sides of the duplex stream,
                            // e.g. options.readableObjectMode vs. options.writableObjectMode, etc.

                            if (typeof isDuplex !== "boolean")
                                isDuplex = stream instanceof Duplex; // Object stream flag to indicate whether or not this stream
                            // contains buffers or objects.

                            this.objectMode = Boolean(options.objectMode);
                            if (isDuplex)
                                this.objectMode =
                                    this.objectMode ||
                                    Boolean(options.writableObjectMode); // The point at which write() starts returning false
                            // Note: 0 is a valid value, means that we always return false if
                            // the entire buffer is not flushed immediately on write()

                            this.highWaterMark = getHighWaterMark(
                                this,
                                options,
                                "writableHighWaterMark",
                                isDuplex
                            ); // If _final has been called

                            this.finalCalled = false; // Drain event flag.

                            this.needDrain = false; // At the start of calling end()

                            this.ending = false; // When end() has been called, and returned

                            this.ended = false; // When 'finish' is emitted

                            this.finished = false; // Has it been destroyed

                            this.destroyed = false; // Should we decode strings into buffers before passing to _write?
                            // this is here so that some node-core streams can optimize string
                            // handling at a lower level.

                            var noDecode = options.decodeStrings === false;
                            this.decodeStrings = !noDecode; // Crypto is kind of old and crusty.  Historically, its default string
                            // encoding is 'binary' so we have to make this configurable.
                            // Everything else in the universe uses 'utf8', though.

                            this.defaultEncoding = options.defaultEncoding || "utf8"; // Not an actual buffer we keep track of, but a measurement
                            // of how much we're waiting to get pushed to some underlying
                            // socket or file.

                            this.length = 0; // A flag to see when we're in the middle of a write.

                            this.writing = false; // When true all writes will be buffered until .uncork() call

                            this.corked = 0; // A flag to be able to tell if the onwrite cb is called immediately,
                            // or on a later tick.  We set this to true at first, because any
                            // actions that shouldn't happen until "later" should generally also
                            // not happen before the first write call.

                            this.sync = true; // A flag to know if we're processing previously buffered items, which
                            // may call the _write() callback in the same tick, so that we don't
                            // end up in an overlapped onwrite situation.

                            this.bufferProcessing = false; // The callback that's passed to _write(chunk,cb)

                            this.onwrite = function (er) {
                                onwrite(stream, er);
                            }; // The callback that the user supplies to write(chunk,encoding,cb)

                            this.writecb = null; // The amount that is being written when _write is called.

                            this.writelen = 0;
                            this.bufferedRequest = null;
                            this.lastBufferedRequest = null; // Number of pending user-supplied write callbacks
                            // this must be 0 before 'finish' can be emitted

                            this.pendingcb = 0; // Emit prefinish if the only thing we're waiting for is _write cbs
                            // This is relevant for synchronous Transform streams

                            this.prefinished = false; // True if the error was already emitted and should not be thrown again

                            this.errorEmitted = false; // Should close be emitted on destroy. Defaults to true.

                            this.emitClose = options.emitClose !== false; // Should .destroy() be called after 'finish' (and potentially 'end')

                            this.autoDestroy = Boolean(options.autoDestroy); // Count buffered requests

                            this.bufferedRequestCount = 0; // Allocate the first CorkedRequest, there is always
                            // one allocated and free to use, and we maintain at most two

                            this.corkedRequestsFree = new CorkedRequest(this);
                        }

                        WritableState.prototype.getBuffer = function getBuffer() {
                            var current = this.bufferedRequest;
                            var out = [];

                            while (current) {
                                out.push(current);
                                current = current.next;
                            }

                            return out;
                        };

                        (function () {
                            try {
                                Object.defineProperty(
                                    WritableState.prototype,
                                    "buffer",
                                    {
                                        get: internalUtil.deprecate(
                                            function writableStateBufferGetter() {
                                                return this.getBuffer();
                                            },
                                            "_writableState.buffer is deprecated. Use _writableState.getBuffer " +
                                                "instead.",
                                            "DEP0003"
                                        ),
                                    }
                                );
                            } catch (_) {}
                        })(); // Test _writableState for inheritance to account for Duplex streams,
                        // whose prototype chain only points to Readable.

                        var realHasInstance;

                        if (
                            typeof Symbol === "function" &&
                            Symbol.hasInstance &&
                            typeof Function.prototype[Symbol.hasInstance] === "function"
                        ) {
                            realHasInstance = Function.prototype[Symbol.hasInstance];
                            Object.defineProperty(Writable, Symbol.hasInstance, {
                                value: function value(object) {
                                    if (realHasInstance.call(this, object)) return true;
                                    if (this !== Writable) return false;
                                    return (
                                        object &&
                                        object._writableState instanceof WritableState
                                    );
                                },
                            });
                        } else {
                            realHasInstance = function realHasInstance(object) {
                                return object instanceof this;
                            };
                        }

                        function Writable(options) {
                            Duplex = Duplex || require("./_stream_duplex"); // Writable ctor is applied to Duplexes, too.
                            // `realHasInstance` is necessary because using plain `instanceof`
                            // would return false, as no `_writableState` property is attached.
                            // Trying to use the custom `instanceof` for Writable here will also break the
                            // Node.js LazyTransform implementation, which has a non-trivial getter for
                            // `_writableState` that would lead to infinite recursion.
                            // Checking for a Stream.Duplex instance is faster here instead of inside
                            // the WritableState constructor, at least with V8 6.5

                            var isDuplex = this instanceof Duplex;
                            if (!isDuplex && !realHasInstance.call(Writable, this))
                                return new Writable(options);
                            this._writableState = new WritableState(
                                options,
                                this,
                                isDuplex
                            ); // Legacy.

                            this.writable = true;

                            if (options) {
                                if (typeof options.write === "function")
                                    this._write = options.write;
                                if (typeof options.writev === "function")
                                    this._writev = options.writev;
                                if (typeof options.destroy === "function")
                                    this._destroy = options.destroy;
                                if (typeof options.final === "function")
                                    this._final = options.final;
                            }

                            Stream.call(this);
                        } // Otherwise people can pipe Writable streams, which is just wrong.

                        Writable.prototype.pipe = function () {
                            errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
                        };

                        function writeAfterEnd(stream, cb) {
                            var er = new ERR_STREAM_WRITE_AFTER_END(); // TODO: defer error events consistently everywhere, not just the cb

                            errorOrDestroy(stream, er);
                            process.nextTick(cb, er);
                        } // Checks that a user-supplied chunk is valid, especially for the particular
                        // mode the stream is in. Currently this means that `null` is never accepted
                        // and undefined/non-string values are only allowed in object mode.

                        function validChunk(stream, state, chunk, cb) {
                            var er;

                            if (chunk === null) {
                                er = new ERR_STREAM_NULL_VALUES();
                            } else if (typeof chunk !== "string" && !state.objectMode) {
                                er = new ERR_INVALID_ARG_TYPE(
                                    "chunk",
                                    ["string", "Buffer"],
                                    chunk
                                );
                            }

                            if (er) {
                                errorOrDestroy(stream, er);
                                process.nextTick(cb, er);
                                return false;
                            }

                            return true;
                        }

                        Writable.prototype.write = function (chunk, encoding, cb) {
                            var state = this._writableState;
                            var ret = false;

                            var isBuf = !state.objectMode && _isUint8Array(chunk);

                            if (isBuf && !Buffer.isBuffer(chunk)) {
                                chunk = _uint8ArrayToBuffer(chunk);
                            }

                            if (typeof encoding === "function") {
                                cb = encoding;
                                encoding = null;
                            }

                            if (isBuf) encoding = "buffer";
                            else if (!encoding) encoding = state.defaultEncoding;
                            if (typeof cb !== "function") cb = nop;
                            if (state.ending) writeAfterEnd(this, cb);
                            else if (isBuf || validChunk(this, state, chunk, cb)) {
                                state.pendingcb++;
                                ret = writeOrBuffer(
                                    this,
                                    state,
                                    isBuf,
                                    chunk,
                                    encoding,
                                    cb
                                );
                            }
                            return ret;
                        };

                        Writable.prototype.cork = function () {
                            this._writableState.corked++;
                        };

                        Writable.prototype.uncork = function () {
                            var state = this._writableState;

                            if (state.corked) {
                                state.corked--;
                                if (
                                    !state.writing &&
                                    !state.corked &&
                                    !state.bufferProcessing &&
                                    state.bufferedRequest
                                )
                                    clearBuffer(this, state);
                            }
                        };

                        Writable.prototype.setDefaultEncoding =
                            function setDefaultEncoding(encoding) {
                                // Node::ParseEncoding() requires lower case.
                                if (typeof encoding === "string")
                                    encoding = encoding.toLowerCase();
                                if (
                                    !(
                                        [
                                            "hex",
                                            "utf8",
                                            "utf-8",
                                            "ascii",
                                            "binary",
                                            "base64",
                                            "ucs2",
                                            "ucs-2",
                                            "utf16le",
                                            "utf-16le",
                                            "raw",
                                        ].indexOf(String(encoding).toLowerCase()) > -1
                                    )
                                )
                                    throw new ERR_UNKNOWN_ENCODING(encoding);
                                this._writableState.defaultEncoding = encoding;
                                return this;
                            };

                        Object.defineProperty(Writable.prototype, "writableBuffer", {
                            // Making it explicit this property is not enumerable
                            // because otherwise some prototype manipulation in
                            // userland will fail
                            enumerable: false,
                            get: function get() {
                                return (
                                    this._writableState &&
                                    this._writableState.getBuffer()
                                );
                            },
                        });

                        function decodeChunk(state, chunk, encoding) {
                            if (
                                !state.objectMode &&
                                state.decodeStrings !== false &&
                                typeof chunk === "string"
                            ) {
                                chunk = Buffer.from(chunk, encoding);
                            }

                            return chunk;
                        }

                        Object.defineProperty(
                            Writable.prototype,
                            "writableHighWaterMark",
                            {
                                // Making it explicit this property is not enumerable
                                // because otherwise some prototype manipulation in
                                // userland will fail
                                enumerable: false,
                                get: function get() {
                                    return this._writableState.highWaterMark;
                                },
                            }
                        ); // If we're already writing something, then just put this
                        // in the queue, and wait our turn.  Otherwise, call _write
                        // If we return false, then we need a drain event, so set that flag.

                        function writeOrBuffer(
                            stream,
                            state,
                            isBuf,
                            chunk,
                            encoding,
                            cb
                        ) {
                            if (!isBuf) {
                                var newChunk = decodeChunk(state, chunk, encoding);

                                if (chunk !== newChunk) {
                                    isBuf = true;
                                    encoding = "buffer";
                                    chunk = newChunk;
                                }
                            }

                            var len = state.objectMode ? 1 : chunk.length;
                            state.length += len;
                            var ret = state.length < state.highWaterMark; // We must ensure that previous needDrain will not be reset to false.

                            if (!ret) state.needDrain = true;

                            if (state.writing || state.corked) {
                                var last = state.lastBufferedRequest;
                                state.lastBufferedRequest = {
                                    chunk: chunk,
                                    encoding: encoding,
                                    isBuf: isBuf,
                                    callback: cb,
                                    next: null,
                                };

                                if (last) {
                                    last.next = state.lastBufferedRequest;
                                } else {
                                    state.bufferedRequest = state.lastBufferedRequest;
                                }

                                state.bufferedRequestCount += 1;
                            } else {
                                doWrite(stream, state, false, len, chunk, encoding, cb);
                            }

                            return ret;
                        }

                        function doWrite(
                            stream,
                            state,
                            writev,
                            len,
                            chunk,
                            encoding,
                            cb
                        ) {
                            state.writelen = len;
                            state.writecb = cb;
                            state.writing = true;
                            state.sync = true;
                            if (state.destroyed)
                                state.onwrite(new ERR_STREAM_DESTROYED("write"));
                            else if (writev) stream._writev(chunk, state.onwrite);
                            else stream._write(chunk, encoding, state.onwrite);
                            state.sync = false;
                        }

                        function onwriteError(stream, state, sync, er, cb) {
                            --state.pendingcb;

                            if (sync) {
                                // Defer the callback if we are being called synchronously
                                // to avoid piling up things on the stack
                                process.nextTick(cb, er); // This can emit finish, and it will always happen
                                // after error

                                process.nextTick(finishMaybe, stream, state);
                                stream._writableState.errorEmitted = true;
                                errorOrDestroy(stream, er);
                            } else {
                                // The caller expect this to happen before if
                                // it is async
                                cb(er);
                                stream._writableState.errorEmitted = true;
                                errorOrDestroy(stream, er); // This can emit finish, but finish must
                                // always follow error

                                finishMaybe(stream, state);
                            }
                        }

                        function onwriteStateUpdate(state) {
                            state.writing = false;
                            state.writecb = null;
                            state.length -= state.writelen;
                            state.writelen = 0;
                        }

                        function onwrite(stream, er) {
                            var state = stream._writableState;
                            var sync = state.sync;
                            var cb = state.writecb;
                            if (typeof cb !== "function")
                                throw new ERR_MULTIPLE_CALLBACK();
                            onwriteStateUpdate(state);
                            if (er) onwriteError(stream, state, sync, er, cb);
                            else {
                                // Check if we're actually ready to finish, but don't emit yet
                                var finished = needFinish(state) || stream.destroyed;

                                if (
                                    !finished &&
                                    !state.corked &&
                                    !state.bufferProcessing &&
                                    state.bufferedRequest
                                ) {
                                    clearBuffer(stream, state);
                                }

                                if (sync) {
                                    process.nextTick(
                                        afterWrite,
                                        stream,
                                        state,
                                        finished,
                                        cb
                                    );
                                } else {
                                    afterWrite(stream, state, finished, cb);
                                }
                            }
                        }

                        function afterWrite(stream, state, finished, cb) {
                            if (!finished) onwriteDrain(stream, state);
                            state.pendingcb--;
                            cb();
                            finishMaybe(stream, state);
                        } // Must force callback to be called on nextTick, so that we don't
                        // emit 'drain' before the write() consumer gets the 'false' return
                        // value, and has a chance to attach a 'drain' listener.

                        function onwriteDrain(stream, state) {
                            if (state.length === 0 && state.needDrain) {
                                state.needDrain = false;
                                stream.emit("drain");
                            }
                        } // If there's something in the buffer waiting, then process it

                        function clearBuffer(stream, state) {
                            state.bufferProcessing = true;
                            var entry = state.bufferedRequest;

                            if (stream._writev && entry && entry.next) {
                                // Fast case, write everything using _writev()
                                var l = state.bufferedRequestCount;
                                var buffer = new Array(l);
                                var holder = state.corkedRequestsFree;
                                holder.entry = entry;
                                var count = 0;
                                var allBuffers = true;

                                while (entry) {
                                    buffer[count] = entry;
                                    if (!entry.isBuf) allBuffers = false;
                                    entry = entry.next;
                                    count += 1;
                                }

                                buffer.allBuffers = allBuffers;
                                doWrite(
                                    stream,
                                    state,
                                    true,
                                    state.length,
                                    buffer,
                                    "",
                                    holder.finish
                                ); // DoWrite is almost always async, defer these to save a bit of time
                                // as the hot path ends with doWrite

                                state.pendingcb++;
                                state.lastBufferedRequest = null;

                                if (holder.next) {
                                    state.corkedRequestsFree = holder.next;
                                    holder.next = null;
                                } else {
                                    state.corkedRequestsFree = new CorkedRequest(state);
                                }

                                state.bufferedRequestCount = 0;
                            } else {
                                // Slow case, write chunks one-by-one
                                while (entry) {
                                    var chunk = entry.chunk;
                                    var encoding = entry.encoding;
                                    var cb = entry.callback;
                                    var len = state.objectMode ? 1 : chunk.length;
                                    doWrite(
                                        stream,
                                        state,
                                        false,
                                        len,
                                        chunk,
                                        encoding,
                                        cb
                                    );
                                    entry = entry.next;
                                    state.bufferedRequestCount--; // If we didn't call the onwrite immediately, then
                                    // it means that we need to wait until it does.
                                    // also, that means that the chunk and cb are currently
                                    // being processed, so move the buffer counter past them.

                                    if (state.writing) {
                                        break;
                                    }
                                }

                                if (entry === null) state.lastBufferedRequest = null;
                            }

                            state.bufferedRequest = entry;
                            state.bufferProcessing = false;
                        }

                        Writable.prototype._write = function (chunk, encoding, cb) {
                            cb(new ERR_METHOD_NOT_IMPLEMENTED("_write()"));
                        };

                        Writable.prototype._writev = null;

                        Writable.prototype.end = function (chunk, encoding, cb) {
                            var state = this._writableState;

                            if (typeof chunk === "function") {
                                cb = chunk;
                                chunk = null;
                                encoding = null;
                            } else if (typeof encoding === "function") {
                                cb = encoding;
                                encoding = null;
                            }

                            if (chunk !== null && chunk !== undefined)
                                this.write(chunk, encoding); // .end() fully uncorks

                            if (state.corked) {
                                state.corked = 1;
                                this.uncork();
                            } // Ignore unnecessary end() calls.

                            if (!state.ending) endWritable(this, state, cb);
                            return this;
                        };

                        Object.defineProperty(Writable.prototype, "writableLength", {
                            // Making it explicit this property is not enumerable
                            // because otherwise some prototype manipulation in
                            // userland will fail
                            enumerable: false,
                            get: function get() {
                                return this._writableState.length;
                            },
                        });

                        function needFinish(state) {
                            return (
                                state.ending &&
                                state.length === 0 &&
                                state.bufferedRequest === null &&
                                !state.finished &&
                                !state.writing
                            );
                        }

                        function callFinal(stream, state) {
                            stream._final(function (err) {
                                state.pendingcb--;

                                if (err) {
                                    errorOrDestroy(stream, err);
                                }

                                state.prefinished = true;
                                stream.emit("prefinish");
                                finishMaybe(stream, state);
                            });
                        }

                        function prefinish(stream, state) {
                            if (!state.prefinished && !state.finalCalled) {
                                if (
                                    typeof stream._final === "function" &&
                                    !state.destroyed
                                ) {
                                    state.pendingcb++;
                                    state.finalCalled = true;
                                    process.nextTick(callFinal, stream, state);
                                } else {
                                    state.prefinished = true;
                                    stream.emit("prefinish");
                                }
                            }
                        }

                        function finishMaybe(stream, state) {
                            var need = needFinish(state);

                            if (need) {
                                prefinish(stream, state);

                                if (state.pendingcb === 0) {
                                    state.finished = true;
                                    stream.emit("finish");

                                    if (state.autoDestroy) {
                                        // In case of duplex streams we need a way to detect
                                        // if the readable side is ready for autoDestroy as well
                                        var rState = stream._readableState;

                                        if (
                                            !rState ||
                                            (rState.autoDestroy && rState.endEmitted)
                                        ) {
                                            stream.destroy();
                                        }
                                    }
                                }
                            }

                            return need;
                        }

                        function endWritable(stream, state, cb) {
                            state.ending = true;
                            finishMaybe(stream, state);

                            if (cb) {
                                if (state.finished) process.nextTick(cb);
                                else stream.once("finish", cb);
                            }

                            state.ended = true;
                            stream.writable = false;
                        }

                        function onCorkedFinish(corkReq, state, err) {
                            var entry = corkReq.entry;
                            corkReq.entry = null;

                            while (entry) {
                                var cb = entry.callback;
                                state.pendingcb--;
                                cb(err);
                                entry = entry.next;
                            } // Reuse the free corkReq.

                            state.corkedRequestsFree.next = corkReq;
                        }

                        Object.defineProperty(Writable.prototype, "destroyed", {
                            // Making it explicit this property is not enumerable
                            // because otherwise some prototype manipulation in
                            // userland will fail
                            enumerable: false,
                            get: function get() {
                                if (this._writableState === undefined) {
                                    return false;
                                }

                                return this._writableState.destroyed;
                            },
                            set: function set(value) {
                                // We ignore the value if the stream
                                // has not been initialized yet
                                if (!this._writableState) {
                                    return;
                                } // Backward compatibility, the user is explicitly
                                // managing destroyed

                                this._writableState.destroyed = value;
                            },
                        });
                        Writable.prototype.destroy = destroyImpl.destroy;
                        Writable.prototype._undestroy = destroyImpl.undestroy;

                        Writable.prototype._destroy = function (err, cb) {
                            cb(err);
                        };
                    }.call(this));
                }.call(
                    this,
                    require("_process"),
                    typeof global !== "undefined"
                        ? global
                        : typeof self !== "undefined"
                        ? self
                        : typeof window !== "undefined"
                        ? window
                        : {}
                ));
            },
            {
                "../errors": 32,
                "./_stream_duplex": 33,
                "./internal/streams/destroy": 40,
                "./internal/streams/state": 44,
                "./internal/streams/stream": 45,
                _process: 22,
                buffer: 16,
                inherits: 21,
                "util-deprecate": 50,
            },
        ],
        38: [
            function (require, module, exports) {
                (function (process) {
                    (function () {
                        "use strict";

                        var _Object$setPrototypeO;

                        function _defineProperty(obj, key, value) {
                            if (key in obj) {
                                Object.defineProperty(obj, key, {
                                    value: value,
                                    enumerable: true,
                                    configurable: true,
                                    writable: true,
                                });
                            } else {
                                obj[key] = value;
                            }
                            return obj;
                        }

                        var finished = require("./end-of-stream");

                        var kLastResolve = Symbol("lastResolve");
                        var kLastReject = Symbol("lastReject");
                        var kError = Symbol("error");
                        var kEnded = Symbol("ended");
                        var kLastPromise = Symbol("lastPromise");
                        var kHandlePromise = Symbol("handlePromise");
                        var kStream = Symbol("stream");

                        function createIterResult(value, done) {
                            return {
                                value: value,
                                done: done,
                            };
                        }

                        function readAndResolve(iter) {
                            var resolve = iter[kLastResolve];

                            if (resolve !== null) {
                                var data = iter[kStream].read(); // We defer if data is null
                                // we can be expecting either 'end' or
                                // 'error'

                                if (data !== null) {
                                    iter[kLastPromise] = null;
                                    iter[kLastResolve] = null;
                                    iter[kLastReject] = null;
                                    resolve(createIterResult(data, false));
                                }
                            }
                        }

                        function onReadable(iter) {
                            // We wait for the next tick, because it might
                            // emit an error with process.nextTick
                            process.nextTick(readAndResolve, iter);
                        }

                        function wrapForNext(lastPromise, iter) {
                            return function (resolve, reject) {
                                lastPromise.then(function () {
                                    if (iter[kEnded]) {
                                        resolve(createIterResult(undefined, true));
                                        return;
                                    }

                                    iter[kHandlePromise](resolve, reject);
                                }, reject);
                            };
                        }

                        var AsyncIteratorPrototype = Object.getPrototypeOf(
                            function () {}
                        );
                        var ReadableStreamAsyncIteratorPrototype =
                            Object.setPrototypeOf(
                                ((_Object$setPrototypeO = {
                                    get stream() {
                                        return this[kStream];
                                    },

                                    next: function next() {
                                        var _this = this;

                                        // If we have detected an error in the meanwhile
                                        // reject straight away
                                        var error = this[kError];

                                        if (error !== null) {
                                            return Promise.reject(error);
                                        }

                                        if (this[kEnded]) {
                                            return Promise.resolve(
                                                createIterResult(undefined, true)
                                            );
                                        }

                                        if (this[kStream].destroyed) {
                                            // We need to defer via nextTick because if .destroy(err) is
                                            // called, the error will be emitted via nextTick, and
                                            // we cannot guarantee that there is no error lingering around
                                            // waiting to be emitted.
                                            return new Promise(function (
                                                resolve,
                                                reject
                                            ) {
                                                process.nextTick(function () {
                                                    if (_this[kError]) {
                                                        reject(_this[kError]);
                                                    } else {
                                                        resolve(
                                                            createIterResult(
                                                                undefined,
                                                                true
                                                            )
                                                        );
                                                    }
                                                });
                                            });
                                        } // If we have multiple next() calls
                                        // we will wait for the previous Promise to finish
                                        // this logic is optimized to support for await loops,
                                        // where next() is only called once at a time

                                        var lastPromise = this[kLastPromise];
                                        var promise;

                                        if (lastPromise) {
                                            promise = new Promise(
                                                wrapForNext(lastPromise, this)
                                            );
                                        } else {
                                            // Fast path needed to support multiple this.push()
                                            // without triggering the next() queue
                                            var data = this[kStream].read();

                                            if (data !== null) {
                                                return Promise.resolve(
                                                    createIterResult(data, false)
                                                );
                                            }

                                            promise = new Promise(this[kHandlePromise]);
                                        }

                                        this[kLastPromise] = promise;
                                        return promise;
                                    },
                                }),
                                _defineProperty(
                                    _Object$setPrototypeO,
                                    Symbol.asyncIterator,
                                    function () {
                                        return this;
                                    }
                                ),
                                _defineProperty(
                                    _Object$setPrototypeO,
                                    "return",
                                    function _return() {
                                        var _this2 = this;

                                        // Destroy(err, cb) is a private API
                                        // we can guarantee we have that here, because we control the
                                        // Readable class this is attached to
                                        return new Promise(function (resolve, reject) {
                                            _this2[kStream].destroy(
                                                null,
                                                function (err) {
                                                    if (err) {
                                                        reject(err);
                                                        return;
                                                    }

                                                    resolve(
                                                        createIterResult(
                                                            undefined,
                                                            true
                                                        )
                                                    );
                                                }
                                            );
                                        });
                                    }
                                ),
                                _Object$setPrototypeO),
                                AsyncIteratorPrototype
                            );

                        var createReadableStreamAsyncIterator =
                            function createReadableStreamAsyncIterator(stream) {
                                var _Object$create;

                                var iterator = Object.create(
                                    ReadableStreamAsyncIteratorPrototype,
                                    ((_Object$create = {}),
                                    _defineProperty(_Object$create, kStream, {
                                        value: stream,
                                        writable: true,
                                    }),
                                    _defineProperty(_Object$create, kLastResolve, {
                                        value: null,
                                        writable: true,
                                    }),
                                    _defineProperty(_Object$create, kLastReject, {
                                        value: null,
                                        writable: true,
                                    }),
                                    _defineProperty(_Object$create, kError, {
                                        value: null,
                                        writable: true,
                                    }),
                                    _defineProperty(_Object$create, kEnded, {
                                        value: stream._readableState.endEmitted,
                                        writable: true,
                                    }),
                                    _defineProperty(_Object$create, kHandlePromise, {
                                        value: function value(resolve, reject) {
                                            var data = iterator[kStream].read();

                                            if (data) {
                                                iterator[kLastPromise] = null;
                                                iterator[kLastResolve] = null;
                                                iterator[kLastReject] = null;
                                                resolve(createIterResult(data, false));
                                            } else {
                                                iterator[kLastResolve] = resolve;
                                                iterator[kLastReject] = reject;
                                            }
                                        },
                                        writable: true,
                                    }),
                                    _Object$create)
                                );
                                iterator[kLastPromise] = null;
                                finished(stream, function (err) {
                                    if (
                                        err &&
                                        err.code !== "ERR_STREAM_PREMATURE_CLOSE"
                                    ) {
                                        var reject = iterator[kLastReject]; // Reject if we are waiting for data in the Promise
                                        // returned by next() and store the error

                                        if (reject !== null) {
                                            iterator[kLastPromise] = null;
                                            iterator[kLastResolve] = null;
                                            iterator[kLastReject] = null;
                                            reject(err);
                                        }

                                        iterator[kError] = err;
                                        return;
                                    }

                                    var resolve = iterator[kLastResolve];

                                    if (resolve !== null) {
                                        iterator[kLastPromise] = null;
                                        iterator[kLastResolve] = null;
                                        iterator[kLastReject] = null;
                                        resolve(createIterResult(undefined, true));
                                    }

                                    iterator[kEnded] = true;
                                });
                                stream.on("readable", onReadable.bind(null, iterator));
                                return iterator;
                            };

                        module.exports = createReadableStreamAsyncIterator;
                    }.call(this));
                }.call(this, require("_process")));
            },
            {"./end-of-stream": 41, _process: 22},
        ],
        39: [
            function (require, module, exports) {
                "use strict";

                function ownKeys(object, enumerableOnly) {
                    var keys = Object.keys(object);
                    if (Object.getOwnPropertySymbols) {
                        var symbols = Object.getOwnPropertySymbols(object);
                        if (enumerableOnly)
                            symbols = symbols.filter(function (sym) {
                                return Object.getOwnPropertyDescriptor(
                                    object,
                                    sym
                                ).enumerable;
                            });
                        keys.push.apply(keys, symbols);
                    }
                    return keys;
                }

                function _objectSpread(target) {
                    for (var i = 1; i < arguments.length; i++) {
                        var source = arguments[i] != null ? arguments[i] : {};
                        if (i % 2) {
                            ownKeys(Object(source), true).forEach(function (key) {
                                _defineProperty(target, key, source[key]);
                            });
                        } else if (Object.getOwnPropertyDescriptors) {
                            Object.defineProperties(
                                target,
                                Object.getOwnPropertyDescriptors(source)
                            );
                        } else {
                            ownKeys(Object(source)).forEach(function (key) {
                                Object.defineProperty(
                                    target,
                                    key,
                                    Object.getOwnPropertyDescriptor(source, key)
                                );
                            });
                        }
                    }
                    return target;
                }

                function _defineProperty(obj, key, value) {
                    if (key in obj) {
                        Object.defineProperty(obj, key, {
                            value: value,
                            enumerable: true,
                            configurable: true,
                            writable: true,
                        });
                    } else {
                        obj[key] = value;
                    }
                    return obj;
                }

                function _classCallCheck(instance, Constructor) {
                    if (!(instance instanceof Constructor)) {
                        throw new TypeError("Cannot call a class as a function");
                    }
                }

                function _defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ("value" in descriptor) descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }

                function _createClass(Constructor, protoProps, staticProps) {
                    if (protoProps)
                        _defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) _defineProperties(Constructor, staticProps);
                    return Constructor;
                }

                var _require = require("buffer"),
                    Buffer = _require.Buffer;

                var _require2 = require("util"),
                    inspect = _require2.inspect;

                var custom = (inspect && inspect.custom) || "inspect";

                function copyBuffer(src, target, offset) {
                    Buffer.prototype.copy.call(src, target, offset);
                }

                module.exports =
                    /* #__PURE__*/
                    (function () {
                        function BufferList() {
                            _classCallCheck(this, BufferList);

                            this.head = null;
                            this.tail = null;
                            this.length = 0;
                        }

                        _createClass(BufferList, [
                            {
                                key: "push",
                                value: function push(v) {
                                    var entry = {
                                        data: v,
                                        next: null,
                                    };
                                    if (this.length > 0) this.tail.next = entry;
                                    else this.head = entry;
                                    this.tail = entry;
                                    ++this.length;
                                },
                            },
                            {
                                key: "unshift",
                                value: function unshift(v) {
                                    var entry = {
                                        data: v,
                                        next: this.head,
                                    };
                                    if (this.length === 0) this.tail = entry;
                                    this.head = entry;
                                    ++this.length;
                                },
                            },
                            {
                                key: "shift",
                                value: function shift() {
                                    if (this.length === 0) return;
                                    var ret = this.head.data;
                                    if (this.length === 1) this.head = this.tail = null;
                                    else this.head = this.head.next;
                                    --this.length;
                                    return ret;
                                },
                            },
                            {
                                key: "clear",
                                value: function clear() {
                                    this.head = this.tail = null;
                                    this.length = 0;
                                },
                            },
                            {
                                key: "join",
                                value: function join(s) {
                                    if (this.length === 0) return "";
                                    var p = this.head;
                                    var ret = String(p.data);

                                    while ((p = p.next)) {
                                        ret += s + p.data;
                                    }

                                    return ret;
                                },
                            },
                            {
                                key: "concat",
                                value: function concat(n) {
                                    if (this.length === 0) return Buffer.alloc(0);
                                    var ret = Buffer.allocUnsafe(n >>> 0);
                                    var p = this.head;
                                    var i = 0;

                                    while (p) {
                                        copyBuffer(p.data, ret, i);
                                        i += p.data.length;
                                        p = p.next;
                                    }

                                    return ret;
                                }, // Consumes a specified amount of bytes or characters from the buffered data.
                            },
                            {
                                key: "consume",
                                value: function consume(n, hasStrings) {
                                    var ret;

                                    if (n < this.head.data.length) {
                                        // `slice` is the same for buffers and strings.
                                        ret = this.head.data.slice(0, n);
                                        this.head.data = this.head.data.slice(n);
                                    } else if (n === this.head.data.length) {
                                        // First chunk is a perfect match.
                                        ret = this.shift();
                                    } else {
                                        // Result spans more than one buffer.
                                        ret = hasStrings
                                            ? this._getString(n)
                                            : this._getBuffer(n);
                                    }

                                    return ret;
                                },
                            },
                            {
                                key: "first",
                                value: function first() {
                                    return this.head.data;
                                }, // Consumes a specified amount of characters from the buffered data.
                            },
                            {
                                key: "_getString",
                                value: function _getString(n) {
                                    var p = this.head;
                                    var c = 1;
                                    var ret = p.data;
                                    n -= ret.length;

                                    while ((p = p.next)) {
                                        var str = p.data;
                                        var nb = n > str.length ? str.length : n;
                                        if (nb === str.length) ret += str;
                                        else ret += str.slice(0, n);
                                        n -= nb;

                                        if (n === 0) {
                                            if (nb === str.length) {
                                                ++c;
                                                if (p.next) this.head = p.next;
                                                else this.head = this.tail = null;
                                            } else {
                                                this.head = p;
                                                p.data = str.slice(nb);
                                            }

                                            break;
                                        }

                                        ++c;
                                    }

                                    this.length -= c;
                                    return ret;
                                }, // Consumes a specified amount of bytes from the buffered data.
                            },
                            {
                                key: "_getBuffer",
                                value: function _getBuffer(n) {
                                    var ret = Buffer.allocUnsafe(n);
                                    var p = this.head;
                                    var c = 1;
                                    p.data.copy(ret);
                                    n -= p.data.length;

                                    while ((p = p.next)) {
                                        var buf = p.data;
                                        var nb = n > buf.length ? buf.length : n;
                                        buf.copy(ret, ret.length - n, 0, nb);
                                        n -= nb;

                                        if (n === 0) {
                                            if (nb === buf.length) {
                                                ++c;
                                                if (p.next) this.head = p.next;
                                                else this.head = this.tail = null;
                                            } else {
                                                this.head = p;
                                                p.data = buf.slice(nb);
                                            }

                                            break;
                                        }

                                        ++c;
                                    }

                                    this.length -= c;
                                    return ret;
                                }, // Make sure the linked list only shows the minimal necessary information.
                            },
                            {
                                key: custom,
                                value: function value(_, options) {
                                    return inspect(
                                        this,
                                        _objectSpread({}, options, {
                                            // Only inspect one level.
                                            depth: 0,
                                            // It should not recurse.
                                            customInspect: false,
                                        })
                                    );
                                },
                            },
                        ]);

                        return BufferList;
                    })();
            },
            {buffer: 16, util: 15},
        ],
        40: [
            function (require, module, exports) {
                (function (process) {
                    (function () {
                        "use strict"; // Undocumented cb() API, needed for core, not for public API

                        function destroy(err, cb) {
                            var _this = this;

                            var readableDestroyed =
                                this._readableState && this._readableState.destroyed;
                            var writableDestroyed =
                                this._writableState && this._writableState.destroyed;

                            if (readableDestroyed || writableDestroyed) {
                                if (cb) {
                                    cb(err);
                                } else if (err) {
                                    if (!this._writableState) {
                                        process.nextTick(emitErrorNT, this, err);
                                    } else if (!this._writableState.errorEmitted) {
                                        this._writableState.errorEmitted = true;
                                        process.nextTick(emitErrorNT, this, err);
                                    }
                                }

                                return this;
                            } // We set destroyed to true before firing error callbacks in order
                            // to make it re-entrance safe in case destroy() is called within callbacks

                            if (this._readableState) {
                                this._readableState.destroyed = true;
                            } // If this is a duplex stream mark the writable part as destroyed as well

                            if (this._writableState) {
                                this._writableState.destroyed = true;
                            }

                            this._destroy(err || null, function (err) {
                                if (!cb && err) {
                                    if (!_this._writableState) {
                                        process.nextTick(
                                            emitErrorAndCloseNT,
                                            _this,
                                            err
                                        );
                                    } else if (!_this._writableState.errorEmitted) {
                                        _this._writableState.errorEmitted = true;
                                        process.nextTick(
                                            emitErrorAndCloseNT,
                                            _this,
                                            err
                                        );
                                    } else {
                                        process.nextTick(emitCloseNT, _this);
                                    }
                                } else if (cb) {
                                    process.nextTick(emitCloseNT, _this);
                                    cb(err);
                                } else {
                                    process.nextTick(emitCloseNT, _this);
                                }
                            });

                            return this;
                        }

                        function emitErrorAndCloseNT(self, err) {
                            emitErrorNT(self, err);
                            emitCloseNT(self);
                        }

                        function emitCloseNT(self) {
                            if (self._writableState && !self._writableState.emitClose)
                                return;
                            if (self._readableState && !self._readableState.emitClose)
                                return;
                            self.emit("close");
                        }

                        function undestroy() {
                            if (this._readableState) {
                                this._readableState.destroyed = false;
                                this._readableState.reading = false;
                                this._readableState.ended = false;
                                this._readableState.endEmitted = false;
                            }

                            if (this._writableState) {
                                this._writableState.destroyed = false;
                                this._writableState.ended = false;
                                this._writableState.ending = false;
                                this._writableState.finalCalled = false;
                                this._writableState.prefinished = false;
                                this._writableState.finished = false;
                                this._writableState.errorEmitted = false;
                            }
                        }

                        function emitErrorNT(self, err) {
                            self.emit("error", err);
                        }

                        function errorOrDestroy(stream, err) {
                            // We have tests that rely on errors being emitted
                            // in the same tick, so changing this is semver major.
                            // For now when you opt-in to autoDestroy we allow
                            // the error to be emitted nextTick. In a future
                            // semver major update we should change the default to this.
                            var rState = stream._readableState;
                            var wState = stream._writableState;
                            if (
                                (rState && rState.autoDestroy) ||
                                (wState && wState.autoDestroy)
                            )
                                stream.destroy(err);
                            else stream.emit("error", err);
                        }

                        module.exports = {
                            destroy: destroy,
                            undestroy: undestroy,
                            errorOrDestroy: errorOrDestroy,
                        };
                    }.call(this));
                }.call(this, require("_process")));
            },
            {_process: 22},
        ],
        41: [
            function (require, module, exports) {
                // Ported from https://github.com/mafintosh/end-of-stream with
                // permission from the author, Mathias Buus (@mafintosh).
                "use strict";

                var ERR_STREAM_PREMATURE_CLOSE =
                    require("../../../errors").codes.ERR_STREAM_PREMATURE_CLOSE;

                function once(callback) {
                    var called = false;
                    return function () {
                        if (called) return;
                        called = true;

                        for (
                            var _len = arguments.length,
                                args = new Array(_len),
                                _key = 0;
                            _key < _len;
                            _key++
                        ) {
                            args[_key] = arguments[_key];
                        }

                        callback.apply(this, args);
                    };
                }

                function noop() {}

                function isRequest(stream) {
                    return stream.setHeader && typeof stream.abort === "function";
                }

                function eos(stream, opts, callback) {
                    if (typeof opts === "function") return eos(stream, null, opts);
                    if (!opts) opts = {};
                    callback = once(callback || noop);
                    var readable =
                        opts.readable || (opts.readable !== false && stream.readable);
                    var writable =
                        opts.writable || (opts.writable !== false && stream.writable);

                    var onlegacyfinish = function onlegacyfinish() {
                        if (!stream.writable) onfinish();
                    };

                    var writableEnded =
                        stream._writableState && stream._writableState.finished;

                    var onfinish = function onfinish() {
                        writable = false;
                        writableEnded = true;
                        if (!readable) callback.call(stream);
                    };

                    var readableEnded =
                        stream._readableState && stream._readableState.endEmitted;

                    var onend = function onend() {
                        readable = false;
                        readableEnded = true;
                        if (!writable) callback.call(stream);
                    };

                    var onerror = function onerror(err) {
                        callback.call(stream, err);
                    };

                    var onclose = function onclose() {
                        var err;

                        if (readable && !readableEnded) {
                            if (!stream._readableState || !stream._readableState.ended)
                                err = new ERR_STREAM_PREMATURE_CLOSE();
                            return callback.call(stream, err);
                        }

                        if (writable && !writableEnded) {
                            if (!stream._writableState || !stream._writableState.ended)
                                err = new ERR_STREAM_PREMATURE_CLOSE();
                            return callback.call(stream, err);
                        }
                    };

                    var onrequest = function onrequest() {
                        stream.req.on("finish", onfinish);
                    };

                    if (isRequest(stream)) {
                        stream.on("complete", onfinish);
                        stream.on("abort", onclose);
                        if (stream.req) onrequest();
                        else stream.on("request", onrequest);
                    } else if (writable && !stream._writableState) {
                        // Legacy streams
                        stream.on("end", onlegacyfinish);
                        stream.on("close", onlegacyfinish);
                    }

                    stream.on("end", onend);
                    stream.on("finish", onfinish);
                    if (opts.error !== false) stream.on("error", onerror);
                    stream.on("close", onclose);
                    return function () {
                        stream.removeListener("complete", onfinish);
                        stream.removeListener("abort", onclose);
                        stream.removeListener("request", onrequest);
                        if (stream.req) stream.req.removeListener("finish", onfinish);
                        stream.removeListener("end", onlegacyfinish);
                        stream.removeListener("close", onlegacyfinish);
                        stream.removeListener("finish", onfinish);
                        stream.removeListener("end", onend);
                        stream.removeListener("error", onerror);
                        stream.removeListener("close", onclose);
                    };
                }

                module.exports = eos;
            },
            {"../../../errors": 32},
        ],
        42: [
            function (require, module, exports) {
                module.exports = function () {
                    throw new Error("Readable.from is not available in the browser");
                };
            },
            {},
        ],
        43: [
            function (require, module, exports) {
                // Ported from https://github.com/mafintosh/pump with
                // permission from the author, Mathias Buus (@mafintosh).
                "use strict";

                var eos;

                function once(callback) {
                    var called = false;
                    return function () {
                        if (called) return;
                        called = true;
                        callback.apply(void 0, arguments);
                    };
                }

                var _require$codes = require("../../../errors").codes,
                    ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS,
                    ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;

                function noop(err) {
                    // Rethrow the error if it exists to avoid swallowing it
                    if (err) throw err;
                }

                function isRequest(stream) {
                    return stream.setHeader && typeof stream.abort === "function";
                }

                function destroyer(stream, reading, writing, callback) {
                    callback = once(callback);
                    var closed = false;
                    stream.on("close", function () {
                        closed = true;
                    });
                    if (eos === undefined) eos = require("./end-of-stream");
                    eos(
                        stream,
                        {
                            readable: reading,
                            writable: writing,
                        },
                        function (err) {
                            if (err) return callback(err);
                            closed = true;
                            callback();
                        }
                    );
                    var destroyed = false;
                    return function (err) {
                        if (closed) return;
                        if (destroyed) return;
                        destroyed = true; // Request.destroy just do .end - .abort is what we want

                        if (isRequest(stream)) return stream.abort();
                        if (typeof stream.destroy === "function")
                            return stream.destroy();
                        callback(err || new ERR_STREAM_DESTROYED("pipe"));
                    };
                }

                function call(fn) {
                    fn();
                }

                function pipe(from, to) {
                    return from.pipe(to);
                }

                function popCallback(streams) {
                    if (!streams.length) return noop;
                    if (typeof streams[streams.length - 1] !== "function") return noop;
                    return streams.pop();
                }

                function pipeline() {
                    for (
                        var _len = arguments.length,
                            streams = new Array(_len),
                            _key = 0;
                        _key < _len;
                        _key++
                    ) {
                        streams[_key] = arguments[_key];
                    }

                    var callback = popCallback(streams);
                    if (Array.isArray(streams[0])) streams = streams[0];

                    if (streams.length < 2) {
                        throw new ERR_MISSING_ARGS("streams");
                    }

                    var error;
                    var destroys = streams.map(function (stream, i) {
                        var reading = i < streams.length - 1;
                        var writing = i > 0;
                        return destroyer(stream, reading, writing, function (err) {
                            if (!error) error = err;
                            if (err) destroys.forEach(call);
                            if (reading) return;
                            destroys.forEach(call);
                            callback(error);
                        });
                    });
                    return streams.reduce(pipe);
                }

                module.exports = pipeline;
            },
            {"../../../errors": 32, "./end-of-stream": 41},
        ],
        44: [
            function (require, module, exports) {
                "use strict";

                var ERR_INVALID_OPT_VALUE =
                    require("../../../errors").codes.ERR_INVALID_OPT_VALUE;

                function highWaterMarkFrom(options, isDuplex, duplexKey) {
                    return options.highWaterMark != null
                        ? options.highWaterMark
                        : isDuplex
                        ? options[duplexKey]
                        : null;
                }

                function getHighWaterMark(state, options, duplexKey, isDuplex) {
                    var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);

                    if (hwm != null) {
                        if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
                            var name = isDuplex ? duplexKey : "highWaterMark";
                            throw new ERR_INVALID_OPT_VALUE(name, hwm);
                        }

                        return Math.floor(hwm);
                    } // Default value

                    return state.objectMode ? 16 : 16 * 1024;
                }

                module.exports = {
                    getHighWaterMark: getHighWaterMark,
                };
            },
            {"../../../errors": 32},
        ],
        45: [
            function (require, module, exports) {
                module.exports = require("events").EventEmitter;
            },
            {events: 18},
        ],
        46: [
            function (require, module, exports) {
                exports = module.exports = require("./lib/_stream_readable.js");
                exports.Stream = exports;
                exports.Readable = exports;
                exports.Writable = require("./lib/_stream_writable.js");
                exports.Duplex = require("./lib/_stream_duplex.js");
                exports.Transform = require("./lib/_stream_transform.js");
                exports.PassThrough = require("./lib/_stream_passthrough.js");
                exports.finished = require("./lib/internal/streams/end-of-stream.js");
                exports.pipeline = require("./lib/internal/streams/pipeline.js");
            },
            {
                "./lib/_stream_duplex.js": 33,
                "./lib/_stream_passthrough.js": 34,
                "./lib/_stream_readable.js": 35,
                "./lib/_stream_transform.js": 36,
                "./lib/_stream_writable.js": 37,
                "./lib/internal/streams/end-of-stream.js": 41,
                "./lib/internal/streams/pipeline.js": 43,
            },
        ],
        47: [
            function (require, module, exports) {
                // Copyright Joyent, Inc. and other Node contributors.
                //
                // Permission is hereby granted, free of charge, to any person obtaining a
                // copy of this software and associated documentation files (the
                // "Software"), to deal in the Software without restriction, including
                // without limitation the rights to use, copy, modify, merge, publish,
                // distribute, sublicense, and/or sell copies of the Software, and to permit
                // persons to whom the Software is furnished to do so, subject to the
                // following conditions:
                //
                // The above copyright notice and this permission notice shall be included
                // in all copies or substantial portions of the Software.
                //
                // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
                // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
                // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
                // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
                // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
                // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
                // USE OR OTHER DEALINGS IN THE SOFTWARE.

                "use strict";

                /* <replacement>*/

                var Buffer = require("safe-buffer").Buffer;
                /* </replacement>*/

                var isEncoding =
                    Buffer.isEncoding ||
                    function (encoding) {
                        encoding = String(encoding);
                        switch (encoding && encoding.toLowerCase()) {
                            case "hex":
                            case "utf8":
                            case "utf-8":
                            case "ascii":
                            case "binary":
                            case "base64":
                            case "ucs2":
                            case "ucs-2":
                            case "utf16le":
                            case "utf-16le":
                            case "raw":
                                return true;
                            default:
                                return false;
                        }
                    };

                function _normalizeEncoding(enc) {
                    if (!enc) return "utf8";
                    var retried;
                    while (true) {
                        switch (enc) {
                            case "utf8":
                            case "utf-8":
                                return "utf8";
                            case "ucs2":
                            case "ucs-2":
                            case "utf16le":
                            case "utf-16le":
                                return "utf16le";
                            case "latin1":
                            case "binary":
                                return "latin1";
                            case "base64":
                            case "ascii":
                            case "hex":
                                return enc;
                            default:
                                if (retried) return; // Undefined
                                enc = String(enc).toLowerCase();
                                retried = true;
                        }
                    }
                }

                // Do not cache `Buffer.isEncoding` when checking encoding names as some
                // modules monkey-patch it to support additional encodings
                function normalizeEncoding(enc) {
                    var nenc = _normalizeEncoding(enc);
                    if (
                        typeof nenc !== "string" &&
                        (Buffer.isEncoding === isEncoding || !isEncoding(enc))
                    )
                        throw new Error("Unknown encoding: " + enc);
                    return nenc || enc;
                }

                // StringDecoder provides an interface for efficiently splitting a series of
                // buffers into a series of JS strings without breaking apart multi-byte
                // characters.
                exports.StringDecoder = StringDecoder;
                function StringDecoder(encoding) {
                    this.encoding = normalizeEncoding(encoding);
                    var nb;
                    switch (this.encoding) {
                        case "utf16le":
                            this.text = utf16Text;
                            this.end = utf16End;
                            nb = 4;
                            break;
                        case "utf8":
                            this.fillLast = utf8FillLast;
                            nb = 4;
                            break;
                        case "base64":
                            this.text = base64Text;
                            this.end = base64End;
                            nb = 3;
                            break;
                        default:
                            this.write = simpleWrite;
                            this.end = simpleEnd;
                            return;
                    }
                    this.lastNeed = 0;
                    this.lastTotal = 0;
                    this.lastChar = Buffer.allocUnsafe(nb);
                }

                StringDecoder.prototype.write = function (buf) {
                    if (buf.length === 0) return "";
                    var r;
                    var i;
                    if (this.lastNeed) {
                        r = this.fillLast(buf);
                        if (r === undefined) return "";
                        i = this.lastNeed;
                        this.lastNeed = 0;
                    } else {
                        i = 0;
                    }
                    if (i < buf.length)
                        return r ? r + this.text(buf, i) : this.text(buf, i);
                    return r || "";
                };

                StringDecoder.prototype.end = utf8End;

                // Returns only complete characters in a Buffer
                StringDecoder.prototype.text = utf8Text;

                // Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
                StringDecoder.prototype.fillLast = function (buf) {
                    if (this.lastNeed <= buf.length) {
                        buf.copy(
                            this.lastChar,
                            this.lastTotal - this.lastNeed,
                            0,
                            this.lastNeed
                        );
                        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
                    }
                    buf.copy(
                        this.lastChar,
                        this.lastTotal - this.lastNeed,
                        0,
                        buf.length
                    );
                    this.lastNeed -= buf.length;
                };

                // Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
                // continuation byte. If an invalid byte is detected, -2 is returned.
                function utf8CheckByte(byte) {
                    if (byte <= 0x7f) return 0;
                    else if (byte >> 5 === 0x06) return 2;
                    else if (byte >> 4 === 0x0e) return 3;
                    else if (byte >> 3 === 0x1e) return 4;
                    return byte >> 6 === 0x02 ? -1 : -2;
                }

                // Checks at most 3 bytes at the end of a Buffer in order to detect an
                // incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
                // needed to complete the UTF-8 character (if applicable) are returned.
                function utf8CheckIncomplete(self, buf, i) {
                    var j = buf.length - 1;
                    if (j < i) return 0;
                    var nb = utf8CheckByte(buf[j]);
                    if (nb >= 0) {
                        if (nb > 0) self.lastNeed = nb - 1;
                        return nb;
                    }
                    if (--j < i || nb === -2) return 0;
                    nb = utf8CheckByte(buf[j]);
                    if (nb >= 0) {
                        if (nb > 0) self.lastNeed = nb - 2;
                        return nb;
                    }
                    if (--j < i || nb === -2) return 0;
                    nb = utf8CheckByte(buf[j]);
                    if (nb >= 0) {
                        if (nb > 0) {
                            if (nb === 2) nb = 0;
                            else self.lastNeed = nb - 3;
                        }
                        return nb;
                    }
                    return 0;
                }

                // Validates as many continuation bytes for a multi-byte UTF-8 character as
                // needed or are available. If we see a non-continuation byte where we expect
                // one, we "replace" the validated continuation bytes we've seen so far with
                // a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
                // behavior. The continuation byte check is included three times in the case
                // where all of the continuation bytes for a character exist in the same buffer.
                // It is also done this way as a slight performance increase instead of using a
                // loop.
                function utf8CheckExtraBytes(self, buf, p) {
                    if ((buf[0] & 0xc0) !== 0x80) {
                        self.lastNeed = 0;
                        return "\ufffd";
                    }
                    if (self.lastNeed > 1 && buf.length > 1) {
                        if ((buf[1] & 0xc0) !== 0x80) {
                            self.lastNeed = 1;
                            return "\ufffd";
                        }
                        if (self.lastNeed > 2 && buf.length > 2) {
                            if ((buf[2] & 0xc0) !== 0x80) {
                                self.lastNeed = 2;
                                return "\ufffd";
                            }
                        }
                    }
                }

                // Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
                function utf8FillLast(buf) {
                    var p = this.lastTotal - this.lastNeed;
                    var r = utf8CheckExtraBytes(this, buf, p);
                    if (r !== undefined) return r;
                    if (this.lastNeed <= buf.length) {
                        buf.copy(this.lastChar, p, 0, this.lastNeed);
                        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
                    }
                    buf.copy(this.lastChar, p, 0, buf.length);
                    this.lastNeed -= buf.length;
                }

                // Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
                // partial character, the character's bytes are buffered until the required
                // number of bytes are available.
                function utf8Text(buf, i) {
                    var total = utf8CheckIncomplete(this, buf, i);
                    if (!this.lastNeed) return buf.toString("utf8", i);
                    this.lastTotal = total;
                    var end = buf.length - (total - this.lastNeed);
                    buf.copy(this.lastChar, 0, end);
                    return buf.toString("utf8", i, end);
                }

                // For UTF-8, a replacement character is added when ending on a partial
                // character.
                function utf8End(buf) {
                    var r = buf && buf.length ? this.write(buf) : "";
                    if (this.lastNeed) return r + "\ufffd";
                    return r;
                }

                // UTF-16LE typically needs two bytes per character, but even if we have an even
                // number of bytes available, we need to check if we end on a leading/high
                // surrogate. In that case, we need to wait for the next two bytes in order to
                // decode the last character properly.
                function utf16Text(buf, i) {
                    if ((buf.length - i) % 2 === 0) {
                        var r = buf.toString("utf16le", i);
                        if (r) {
                            var c = r.charCodeAt(r.length - 1);
                            if (c >= 0xd800 && c <= 0xdbff) {
                                this.lastNeed = 2;
                                this.lastTotal = 4;
                                this.lastChar[0] = buf[buf.length - 2];
                                this.lastChar[1] = buf[buf.length - 1];
                                return r.slice(0, -1);
                            }
                        }
                        return r;
                    }
                    this.lastNeed = 1;
                    this.lastTotal = 2;
                    this.lastChar[0] = buf[buf.length - 1];
                    return buf.toString("utf16le", i, buf.length - 1);
                }

                // For UTF-16LE we do not explicitly append special replacement characters if we
                // end on a partial character, we simply let v8 handle that.
                function utf16End(buf) {
                    var r = buf && buf.length ? this.write(buf) : "";
                    if (this.lastNeed) {
                        var end = this.lastTotal - this.lastNeed;
                        return r + this.lastChar.toString("utf16le", 0, end);
                    }
                    return r;
                }

                function base64Text(buf, i) {
                    var n = (buf.length - i) % 3;
                    if (n === 0) return buf.toString("base64", i);
                    this.lastNeed = 3 - n;
                    this.lastTotal = 3;
                    if (n === 1) {
                        this.lastChar[0] = buf[buf.length - 1];
                    } else {
                        this.lastChar[0] = buf[buf.length - 2];
                        this.lastChar[1] = buf[buf.length - 1];
                    }
                    return buf.toString("base64", i, buf.length - n);
                }

                function base64End(buf) {
                    var r = buf && buf.length ? this.write(buf) : "";
                    if (this.lastNeed)
                        return (
                            r + this.lastChar.toString("base64", 0, 3 - this.lastNeed)
                        );
                    return r;
                }

                // Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
                function simpleWrite(buf) {
                    return buf.toString(this.encoding);
                }

                function simpleEnd(buf) {
                    return buf && buf.length ? this.write(buf) : "";
                }
            },
            {"safe-buffer": 27},
        ],
        48: [
            function (require, module, exports) {
                // Copyright Joyent, Inc. and other Node contributors.
                //
                // Permission is hereby granted, free of charge, to any person obtaining a
                // copy of this software and associated documentation files (the
                // "Software"), to deal in the Software without restriction, including
                // without limitation the rights to use, copy, modify, merge, publish,
                // distribute, sublicense, and/or sell copies of the Software, and to permit
                // persons to whom the Software is furnished to do so, subject to the
                // following conditions:
                //
                // The above copyright notice and this permission notice shall be included
                // in all copies or substantial portions of the Software.
                //
                // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
                // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
                // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
                // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
                // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
                // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
                // USE OR OTHER DEALINGS IN THE SOFTWARE.

                "use strict";

                var punycode = require("punycode");
                var util = require("./util");

                exports.parse = urlParse;
                exports.resolve = urlResolve;
                exports.resolveObject = urlResolveObject;
                exports.format = urlFormat;

                exports.Url = Url;

                function Url() {
                    this.protocol = null;
                    this.slashes = null;
                    this.auth = null;
                    this.host = null;
                    this.port = null;
                    this.hostname = null;
                    this.hash = null;
                    this.search = null;
                    this.query = null;
                    this.pathname = null;
                    this.path = null;
                    this.href = null;
                }

                // Reference: RFC 3986, RFC 1808, RFC 2396

                // define these here so at least they only have to be
                // compiled once on the first module load.
                var protocolPattern = /^([a-z0-9.+-]+:)/i,
                    portPattern = /:[0-9]*$/,
                    // Special case for a simple path URL
                    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,
                    // RFC 2396: characters reserved for delimiting URLs.
                    // We actually just auto-escape these.
                    delims = ["<", ">", '"', "`", " ", "\r", "\n", "\t"],
                    // RFC 2396: characters not allowed for various reasons.
                    unwise = ["{", "}", "|", "\\", "^", "`"].concat(delims),
                    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
                    autoEscape = ["'"].concat(unwise),
                    // Characters that are never ever allowed in a hostname.
                    // Note that any invalid chars are also handled, but these
                    // are the ones that are *expected* to be seen, so we fast-path
                    // them.
                    nonHostChars = ["%", "/", "?", ";", "#"].concat(autoEscape),
                    hostEndingChars = ["/", "?", "#"],
                    hostnameMaxLen = 255,
                    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
                    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
                    // Protocols that can allow "unsafe" and "unwise" chars.
                    unsafeProtocol = {
                        javascript: true,
                        "javascript:": true,
                    },
                    // Protocols that never have a hostname.
                    hostlessProtocol = {
                        javascript: true,
                        "javascript:": true,
                    },
                    // Protocols that always contain a // bit.
                    slashedProtocol = {
                        http: true,
                        https: true,
                        ftp: true,
                        gopher: true,
                        file: true,
                        "http:": true,
                        "https:": true,
                        "ftp:": true,
                        "gopher:": true,
                        "file:": true,
                    },
                    querystring = require("querystring");

                function urlParse(url, parseQueryString, slashesDenoteHost) {
                    if (url && util.isObject(url) && url instanceof Url) return url;

                    var u = new Url();
                    u.parse(url, parseQueryString, slashesDenoteHost);
                    return u;
                }

                Url.prototype.parse = function (
                    url,
                    parseQueryString,
                    slashesDenoteHost
                ) {
                    if (!util.isString(url)) {
                        throw new TypeError(
                            "Parameter 'url' must be a string, not " + typeof url
                        );
                    }

                    // Copy chrome, IE, opera backslash-handling behavior.
                    // Back slashes before the query string get converted to forward slashes
                    // See: https://code.google.com/p/chromium/issues/detail?id=25916
                    var queryIndex = url.indexOf("?"),
                        splitter =
                            queryIndex !== -1 && queryIndex < url.indexOf("#")
                                ? "?"
                                : "#",
                        uSplit = url.split(splitter),
                        slashRegex = /\\/g;
                    uSplit[0] = uSplit[0].replace(slashRegex, "/");
                    url = uSplit.join(splitter);

                    var rest = url;

                    // Trim before proceeding.
                    // This is to support parse stuff like "  http://foo.com  \n"
                    rest = rest.trim();

                    if (!slashesDenoteHost && url.split("#").length === 1) {
                        // Try fast path regexp
                        var simplePath = simplePathPattern.exec(rest);
                        if (simplePath) {
                            this.path = rest;
                            this.href = rest;
                            this.pathname = simplePath[1];
                            if (simplePath[2]) {
                                this.search = simplePath[2];
                                if (parseQueryString) {
                                    this.query = querystring.parse(
                                        this.search.substr(1)
                                    );
                                } else {
                                    this.query = this.search.substr(1);
                                }
                            } else if (parseQueryString) {
                                this.search = "";
                                this.query = {};
                            }
                            return this;
                        }
                    }

                    var proto = protocolPattern.exec(rest);
                    if (proto) {
                        proto = proto[0];
                        var lowerProto = proto.toLowerCase();
                        this.protocol = lowerProto;
                        rest = rest.substr(proto.length);
                    }

                    // Figure out if it's got a host
                    // user@server is *always* interpreted as a hostname, and url
                    // resolution will treat //foo/bar as host=foo,path=bar because that's
                    // how the browser resolves relative URLs.
                    if (
                        slashesDenoteHost ||
                        proto ||
                        rest.match(/^\/\/[^@\/]+@[^@\/]+/)
                    ) {
                        var slashes = rest.substr(0, 2) === "//";
                        if (slashes && !(proto && hostlessProtocol[proto])) {
                            rest = rest.substr(2);
                            this.slashes = true;
                        }
                    }

                    if (
                        !hostlessProtocol[proto] &&
                        (slashes || (proto && !slashedProtocol[proto]))
                    ) {
                        // There's a hostname.
                        // the first instance of /, ?, ;, or # ends the host.
                        //
                        // If there is an @ in the hostname, then non-host chars *are* allowed
                        // to the left of the last @ sign, unless some host-ending character
                        // comes *before* the @-sign.
                        // URLs are obnoxious.
                        //
                        // ex:
                        // http://a@b@c/ => user:a@b host:c
                        // http://a@b?@c => user:a host:c path:/?@c

                        // v0.12 TODO(isaacs): This is not quite how Chrome does things.
                        // Review our test case against browsers more comprehensively.

                        // find the first instance of any hostEndingChars
                        var hostEnd = -1;
                        for (var i = 0; i < hostEndingChars.length; i++) {
                            var hec = rest.indexOf(hostEndingChars[i]);
                            if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
                                hostEnd = hec;
                        }

                        // At this point, either we have an explicit point where the
                        // auth portion cannot go past, or the last @ char is the decider.
                        var auth, atSign;
                        if (hostEnd === -1) {
                            // AtSign can be anywhere.
                            atSign = rest.lastIndexOf("@");
                        } else {
                            // AtSign must be in auth portion.
                            // http://a@b/c@d => host:b auth:a path:/c@d
                            atSign = rest.lastIndexOf("@", hostEnd);
                        }

                        // Now we have a portion which is definitely the auth.
                        // Pull that off.
                        if (atSign !== -1) {
                            auth = rest.slice(0, atSign);
                            rest = rest.slice(atSign + 1);
                            this.auth = decodeURIComponent(auth);
                        }

                        // The host is the remaining to the left of the first non-host char
                        hostEnd = -1;
                        for (var i = 0; i < nonHostChars.length; i++) {
                            var hec = rest.indexOf(nonHostChars[i]);
                            if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
                                hostEnd = hec;
                        }
                        // If we still have not hit it, then the entire thing is a host.
                        if (hostEnd === -1) hostEnd = rest.length;

                        this.host = rest.slice(0, hostEnd);
                        rest = rest.slice(hostEnd);

                        // Pull out port.
                        this.parseHost();

                        // We've indicated that there is a hostname,
                        // so even if it's empty, it has to be present.
                        this.hostname = this.hostname || "";

                        // If hostname begins with [ and ends with ]
                        // assume that it's an IPv6 address.
                        var ipv6Hostname =
                            this.hostname[0] === "[" &&
                            this.hostname[this.hostname.length - 1] === "]";

                        // Validate a little.
                        if (!ipv6Hostname) {
                            var hostparts = this.hostname.split(/\./);
                            for (var i = 0, l = hostparts.length; i < l; i++) {
                                var part = hostparts[i];
                                if (!part) continue;
                                if (!part.match(hostnamePartPattern)) {
                                    var newpart = "";
                                    for (var j = 0, k = part.length; j < k; j++) {
                                        if (part.charCodeAt(j) > 127) {
                                            // We replace non-ASCII char with a temporary placeholder
                                            // we need this to make sure size of hostname is not
                                            // broken by replacing non-ASCII by nothing
                                            newpart += "x";
                                        } else {
                                            newpart += part[j];
                                        }
                                    }
                                    // We test again with ASCII char only
                                    if (!newpart.match(hostnamePartPattern)) {
                                        var validParts = hostparts.slice(0, i);
                                        var notHost = hostparts.slice(i + 1);
                                        var bit = part.match(hostnamePartStart);
                                        if (bit) {
                                            validParts.push(bit[1]);
                                            notHost.unshift(bit[2]);
                                        }
                                        if (notHost.length) {
                                            rest = "/" + notHost.join(".") + rest;
                                        }
                                        this.hostname = validParts.join(".");
                                        break;
                                    }
                                }
                            }
                        }

                        if (this.hostname.length > hostnameMaxLen) {
                            this.hostname = "";
                        } else {
                            // Hostnames are always lower case.
                            this.hostname = this.hostname.toLowerCase();
                        }

                        if (!ipv6Hostname) {
                            // IDNA Support: Returns a punycoded representation of "domain".
                            // It only converts parts of the domain name that
                            // have non-ASCII characters, i.e. it doesn't matter if
                            // you call it with a domain that already is ASCII-only.
                            this.hostname = punycode.toASCII(this.hostname);
                        }

                        var p = this.port ? ":" + this.port : "";
                        var h = this.hostname || "";
                        this.host = h + p;
                        this.href += this.host;

                        // Strip [ and ] from the hostname
                        // the host field still retains them, though
                        if (ipv6Hostname) {
                            this.hostname = this.hostname.substr(
                                1,
                                this.hostname.length - 2
                            );
                            if (rest[0] !== "/") {
                                rest = "/" + rest;
                            }
                        }
                    }

                    // Now rest is set to the post-host stuff.
                    // chop off any delim chars.
                    if (!unsafeProtocol[lowerProto]) {
                        // First, make 100% sure that any "autoEscape" chars get
                        // escaped, even if encodeURIComponent doesn't think they
                        // need to be.
                        for (var i = 0, l = autoEscape.length; i < l; i++) {
                            var ae = autoEscape[i];
                            if (rest.indexOf(ae) === -1) continue;
                            var esc = encodeURIComponent(ae);
                            if (esc === ae) {
                                esc = escape(ae);
                            }
                            rest = rest.split(ae).join(esc);
                        }
                    }

                    // Chop off from the tail first.
                    var hash = rest.indexOf("#");
                    if (hash !== -1) {
                        // Got a fragment string.
                        this.hash = rest.substr(hash);
                        rest = rest.slice(0, hash);
                    }
                    var qm = rest.indexOf("?");
                    if (qm !== -1) {
                        this.search = rest.substr(qm);
                        this.query = rest.substr(qm + 1);
                        if (parseQueryString) {
                            this.query = querystring.parse(this.query);
                        }
                        rest = rest.slice(0, qm);
                    } else if (parseQueryString) {
                        // No query string, but parseQueryString still requested
                        this.search = "";
                        this.query = {};
                    }
                    if (rest) this.pathname = rest;
                    if (
                        slashedProtocol[lowerProto] &&
                        this.hostname &&
                        !this.pathname
                    ) {
                        this.pathname = "/";
                    }

                    // To support http.request
                    if (this.pathname || this.search) {
                        var p = this.pathname || "";
                        var s = this.search || "";
                        this.path = p + s;
                    }

                    // Finally, reconstruct the href based on what has been validated.
                    this.href = this.format();
                    return this;
                };

                // Format a parsed object into a url string
                function urlFormat(obj) {
                    // Ensure it's an object, and not a string url.
                    // If it's an obj, this is a no-op.
                    // this way, you can call url_format() on strings
                    // to clean up potentially wonky urls.
                    if (util.isString(obj)) obj = urlParse(obj);
                    if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
                    return obj.format();
                }

                Url.prototype.format = function () {
                    var auth = this.auth || "";
                    if (auth) {
                        auth = encodeURIComponent(auth);
                        auth = auth.replace(/%3A/i, ":");
                        auth += "@";
                    }

                    var protocol = this.protocol || "",
                        pathname = this.pathname || "",
                        hash = this.hash || "",
                        host = false,
                        query = "";

                    if (this.host) {
                        host = auth + this.host;
                    } else if (this.hostname) {
                        host =
                            auth +
                            (this.hostname.indexOf(":") === -1
                                ? this.hostname
                                : "[" + this.hostname + "]");
                        if (this.port) {
                            host += ":" + this.port;
                        }
                    }

                    if (
                        this.query &&
                        util.isObject(this.query) &&
                        Object.keys(this.query).length
                    ) {
                        query = querystring.stringify(this.query);
                    }

                    var search = this.search || (query && "?" + query) || "";

                    if (protocol && protocol.substr(-1) !== ":") protocol += ":";

                    // Only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
                    // unless they had them to begin with.
                    if (
                        this.slashes ||
                        ((!protocol || slashedProtocol[protocol]) && host !== false)
                    ) {
                        host = "//" + (host || "");
                        if (pathname && pathname.charAt(0) !== "/")
                            pathname = "/" + pathname;
                    } else if (!host) {
                        host = "";
                    }

                    if (hash && hash.charAt(0) !== "#") hash = "#" + hash;
                    if (search && search.charAt(0) !== "?") search = "?" + search;

                    pathname = pathname.replace(/[?#]/g, function (match) {
                        return encodeURIComponent(match);
                    });
                    search = search.replace("#", "%23");

                    return protocol + host + pathname + search + hash;
                };

                function urlResolve(source, relative) {
                    return urlParse(source, false, true).resolve(relative);
                }

                Url.prototype.resolve = function (relative) {
                    return this.resolveObject(urlParse(relative, false, true)).format();
                };

                function urlResolveObject(source, relative) {
                    if (!source) return relative;
                    return urlParse(source, false, true).resolveObject(relative);
                }

                Url.prototype.resolveObject = function (relative) {
                    if (util.isString(relative)) {
                        var rel = new Url();
                        rel.parse(relative, false, true);
                        relative = rel;
                    }

                    var result = new Url();
                    var tkeys = Object.keys(this);
                    for (var tk = 0; tk < tkeys.length; tk++) {
                        var tkey = tkeys[tk];
                        result[tkey] = this[tkey];
                    }

                    // Hash is always overridden, no matter what.
                    // even href="" will remove it.
                    result.hash = relative.hash;

                    // If the relative url is empty, then there's nothing left to do here.
                    if (relative.href === "") {
                        result.href = result.format();
                        return result;
                    }

                    // Hrefs like //foo/bar always cut to the protocol.
                    if (relative.slashes && !relative.protocol) {
                        // Take everything except the protocol from relative
                        var rkeys = Object.keys(relative);
                        for (var rk = 0; rk < rkeys.length; rk++) {
                            var rkey = rkeys[rk];
                            if (rkey !== "protocol") result[rkey] = relative[rkey];
                        }

                        // UrlParse appends trailing / to urls like http://www.example.com
                        if (
                            slashedProtocol[result.protocol] &&
                            result.hostname &&
                            !result.pathname
                        ) {
                            result.path = result.pathname = "/";
                        }

                        result.href = result.format();
                        return result;
                    }

                    if (relative.protocol && relative.protocol !== result.protocol) {
                        // If it's a known url protocol, then changing
                        // the protocol does weird things
                        // first, if it's not file:, then we MUST have a host,
                        // and if there was a path
                        // to begin with, then we MUST have a path.
                        // if it is file:, then the host is dropped,
                        // because that's known to be hostless.
                        // anything else is assumed to be absolute.
                        if (!slashedProtocol[relative.protocol]) {
                            var keys = Object.keys(relative);
                            for (var v = 0; v < keys.length; v++) {
                                var k = keys[v];
                                result[k] = relative[k];
                            }
                            result.href = result.format();
                            return result;
                        }

                        result.protocol = relative.protocol;
                        if (!relative.host && !hostlessProtocol[relative.protocol]) {
                            var relPath = (relative.pathname || "").split("/");
                            while (
                                relPath.length &&
                                !(relative.host = relPath.shift())
                            );
                            if (!relative.host) relative.host = "";
                            if (!relative.hostname) relative.hostname = "";
                            if (relPath[0] !== "") relPath.unshift("");
                            if (relPath.length < 2) relPath.unshift("");
                            result.pathname = relPath.join("/");
                        } else {
                            result.pathname = relative.pathname;
                        }
                        result.search = relative.search;
                        result.query = relative.query;
                        result.host = relative.host || "";
                        result.auth = relative.auth;
                        result.hostname = relative.hostname || relative.host;
                        result.port = relative.port;
                        // To support http.request
                        if (result.pathname || result.search) {
                            var p = result.pathname || "";
                            var s = result.search || "";
                            result.path = p + s;
                        }
                        result.slashes = result.slashes || relative.slashes;
                        result.href = result.format();
                        return result;
                    }

                    var isSourceAbs =
                            result.pathname && result.pathname.charAt(0) === "/",
                        isRelAbs =
                            relative.host ||
                            (relative.pathname && relative.pathname.charAt(0) === "/"),
                        mustEndAbs =
                            isRelAbs ||
                            isSourceAbs ||
                            (result.host && relative.pathname),
                        removeAllDots = mustEndAbs,
                        srcPath = (result.pathname && result.pathname.split("/")) || [],
                        relPath =
                            (relative.pathname && relative.pathname.split("/")) || [],
                        psychotic =
                            result.protocol && !slashedProtocol[result.protocol];

                    // If the url is a non-slashed url, then relative
                    // links like ../.. should be able
                    // to crawl up to the hostname, as well.  This is strange.
                    // result.protocol has already been set by now.
                    // Later on, put the first path part into the host field.
                    if (psychotic) {
                        result.hostname = "";
                        result.port = null;
                        if (result.host) {
                            if (srcPath[0] === "") srcPath[0] = result.host;
                            else srcPath.unshift(result.host);
                        }
                        result.host = "";
                        if (relative.protocol) {
                            relative.hostname = null;
                            relative.port = null;
                            if (relative.host) {
                                if (relPath[0] === "") relPath[0] = relative.host;
                                else relPath.unshift(relative.host);
                            }
                            relative.host = null;
                        }
                        mustEndAbs =
                            mustEndAbs && (relPath[0] === "" || srcPath[0] === "");
                    }

                    if (isRelAbs) {
                        // It's absolute.
                        result.host =
                            relative.host || relative.host === ""
                                ? relative.host
                                : result.host;
                        result.hostname =
                            relative.hostname || relative.hostname === ""
                                ? relative.hostname
                                : result.hostname;
                        result.search = relative.search;
                        result.query = relative.query;
                        srcPath = relPath;
                        // Fall through to the dot-handling below.
                    } else if (relPath.length) {
                        // It's relative
                        // throw away the existing file, and take the new path instead.
                        if (!srcPath) srcPath = [];
                        srcPath.pop();
                        srcPath = srcPath.concat(relPath);
                        result.search = relative.search;
                        result.query = relative.query;
                    } else if (!util.isNullOrUndefined(relative.search)) {
                        // Just pull out the search.
                        // like href='?foo'.
                        // Put this after the other two cases because it simplifies the booleans
                        if (psychotic) {
                            result.hostname = result.host = srcPath.shift();
                            // Occationaly the auth can get stuck only in host
                            // this especially happens in cases like
                            // url.resolveObject('mailto:local1@domain1', 'local2@domain2')
                            var authInHost =
                                result.host && result.host.indexOf("@") > 0
                                    ? result.host.split("@")
                                    : false;
                            if (authInHost) {
                                result.auth = authInHost.shift();
                                result.host = result.hostname = authInHost.shift();
                            }
                        }
                        result.search = relative.search;
                        result.query = relative.query;
                        // To support http.request
                        if (
                            !util.isNull(result.pathname) ||
                            !util.isNull(result.search)
                        ) {
                            result.path =
                                (result.pathname ? result.pathname : "") +
                                (result.search ? result.search : "");
                        }
                        result.href = result.format();
                        return result;
                    }

                    if (!srcPath.length) {
                        // No path at all.  easy.
                        // we've already handled the other stuff above.
                        result.pathname = null;
                        // To support http.request
                        if (result.search) {
                            result.path = "/" + result.search;
                        } else {
                            result.path = null;
                        }
                        result.href = result.format();
                        return result;
                    }

                    // If a url ENDs in . or .., then it must get a trailing slash.
                    // however, if it ends in anything else non-slashy,
                    // then it must NOT get a trailing slash.
                    var last = srcPath.slice(-1)[0];
                    var hasTrailingSlash =
                        ((result.host || relative.host || srcPath.length > 1) &&
                            (last === "." || last === "..")) ||
                        last === "";

                    // Strip single dots, resolve double dots to parent dir
                    // if the path tries to go above the root, `up` ends up > 0
                    var up = 0;
                    for (var i = srcPath.length; i >= 0; i--) {
                        last = srcPath[i];
                        if (last === ".") {
                            srcPath.splice(i, 1);
                        } else if (last === "..") {
                            srcPath.splice(i, 1);
                            up++;
                        } else if (up) {
                            srcPath.splice(i, 1);
                            up--;
                        }
                    }

                    // If the path is allowed to go above the root, restore leading ..s
                    if (!mustEndAbs && !removeAllDots) {
                        for (; up--; up) {
                            srcPath.unshift("..");
                        }
                    }

                    if (
                        mustEndAbs &&
                        srcPath[0] !== "" &&
                        (!srcPath[0] || srcPath[0].charAt(0) !== "/")
                    ) {
                        srcPath.unshift("");
                    }

                    if (hasTrailingSlash && srcPath.join("/").substr(-1) !== "/") {
                        srcPath.push("");
                    }

                    var isAbsolute =
                        srcPath[0] === "" ||
                        (srcPath[0] && srcPath[0].charAt(0) === "/");

                    // Put the host back
                    if (psychotic) {
                        result.hostname = result.host = isAbsolute
                            ? ""
                            : srcPath.length
                            ? srcPath.shift()
                            : "";
                        // Occationaly the auth can get stuck only in host
                        // this especially happens in cases like
                        // url.resolveObject('mailto:local1@domain1', 'local2@domain2')
                        var authInHost =
                            result.host && result.host.indexOf("@") > 0
                                ? result.host.split("@")
                                : false;
                        if (authInHost) {
                            result.auth = authInHost.shift();
                            result.host = result.hostname = authInHost.shift();
                        }
                    }

                    mustEndAbs = mustEndAbs || (result.host && srcPath.length);

                    if (mustEndAbs && !isAbsolute) {
                        srcPath.unshift("");
                    }

                    if (!srcPath.length) {
                        result.pathname = null;
                        result.path = null;
                    } else {
                        result.pathname = srcPath.join("/");
                    }

                    // To support request.http
                    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
                        result.path =
                            (result.pathname ? result.pathname : "") +
                            (result.search ? result.search : "");
                    }
                    result.auth = relative.auth || result.auth;
                    result.slashes = result.slashes || relative.slashes;
                    result.href = result.format();
                    return result;
                };

                Url.prototype.parseHost = function () {
                    var host = this.host;
                    var port = portPattern.exec(host);
                    if (port) {
                        port = port[0];
                        if (port !== ":") {
                            this.port = port.substr(1);
                        }
                        host = host.substr(0, host.length - port.length);
                    }
                    if (host) this.hostname = host;
                };
            },
            {"./util": 49, punycode: 23, querystring: 26},
        ],
        49: [
            function (require, module, exports) {
                "use strict";

                module.exports = {
                    isString: function (arg) {
                        return typeof arg === "string";
                    },
                    isObject: function (arg) {
                        return typeof arg === "object" && arg !== null;
                    },
                    isNull: function (arg) {
                        return arg === null;
                    },
                    isNullOrUndefined: function (arg) {
                        return arg == null;
                    },
                };
            },
            {},
        ],
        50: [
            function (require, module, exports) {
                (function (global) {
                    (function () {
                        /**
                         * Module exports.
                         */

                        module.exports = deprecate;

                        /**
                         * Mark that a method should not be used.
                         * Returns a modified function which warns once by default.
                         *
                         * If `localStorage.noDeprecation = true` is set, then it is a no-op.
                         *
                         * If `localStorage.throwDeprecation = true` is set, then deprecated functions
                         * will throw an Error when invoked.
                         *
                         * If `localStorage.traceDeprecation = true` is set, then deprecated functions
                         * will invoke `console.trace()` instead of `console.error()`.
                         *
                         * @param {Function} fn - the function to deprecate
                         * @param {String} msg - the string to print to the console when `fn` is invoked
                         * @returns {Function} a new "deprecated" version of `fn`
                         * @api public
                         */

                        function deprecate(fn, msg) {
                            if (config("noDeprecation")) {
                                return fn;
                            }

                            var warned = false;
                            function deprecated() {
                                if (!warned) {
                                    if (config("throwDeprecation")) {
                                        throw new Error(msg);
                                    } else if (config("traceDeprecation")) {
                                        console.trace(msg);
                                    } else {
                                        console.warn(msg);
                                    }
                                    warned = true;
                                }
                                return fn.apply(this, arguments);
                            }

                            return deprecated;
                        }

                        /**
                         * Checks `localStorage` for boolean values for the given `name`.
                         *
                         * @param {String} name
                         * @returns {Boolean}
                         * @api private
                         */

                        function config(name) {
                            // Accessing global.localStorage can trigger a DOMException in sandboxed iframes
                            try {
                                if (!global.localStorage) return false;
                            } catch (_) {
                                return false;
                            }
                            var val = global.localStorage[name];
                            if (val == null) return false;
                            return String(val).toLowerCase() === "true";
                        }
                    }.call(this));
                }.call(
                    this,
                    typeof global !== "undefined"
                        ? global
                        : typeof self !== "undefined"
                        ? self
                        : typeof window !== "undefined"
                        ? window
                        : {}
                ));
            },
            {},
        ],
        51: [
            function (require, module, exports) {
                module.exports = extend;

                var hasOwnProperty = Object.prototype.hasOwnProperty;

                function extend() {
                    var target = {};

                    for (var i = 0; i < arguments.length; i++) {
                        var source = arguments[i];

                        for (var key in source) {
                            if (hasOwnProperty.call(source, key)) {
                                target[key] = source[key];
                            }
                        }
                    }

                    return target;
                }
            },
            {},
        ],
    },
    {},
    [1]
);
