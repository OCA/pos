odoo.define("pos_openreplay.OpenReplay", function (require) {
    "use strict";

    var core = require("web.Core");
    var models = require("point_of_sale.models");

    const OpenReplay = core.Class.extend({
        init: function (options) {
            const initOpts = {
                projectKey: options.open_replay_project_key,
                ingestPoint: options.open_replay_ingest_point,
                defaultInputMode: options.open_replay_default_input_mode,
                obscureTextNumbers: options.open_replay_obscure_text_numbers,
                obscureTextEmails: options.open_replay_obscure_text_emails,
            };
            const startOpts = {
                userID: options.name,
                metadata: {
                    cashier: "",
                    session: "",
                    cashier_role: "",
                    cashier_id: "",
                    company_id: options.company_id[0],
                },
            };
            (function (A, s, a, y, e, r) {
                r = window.OpenReplay = [e, r, y, [s - 1, e]];
                s = document.createElement("script");
                s.src = A;
                s.async = !a;
                document.getElementsByTagName("head")[0].appendChild(s);
                r.start = function () {
                    r.push([0]);
                };
                r.stop = function () {
                    r.push([1]);
                };
                r.setUserID = function (id) {
                    r.push([2, id]);
                };
                r.setUserAnonymousID = function (id) {
                    r.push([3, id]);
                };
                r.setMetadata = function (k, v) {
                    r.push([4, k, v]);
                };
                r.event = function (k, p, i) {
                    r.push([5, k, p, i]);
                };
                r.issue = function (k, p) {
                    r.push([6, k, p]);
                };
                r.isActive = function () {
                    return false;
                };
                r.getSessionToken = function () {
                    return options.uuid;
                };
            })(
                "//static.openreplay.com/latest/openreplay.js",
                1,
                0,
                initOpts,
                startOpts
            );
        },
    });

    var _super_pos_model = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        after_load_server_data: function () {
            _super_pos_model.after_load_server_data.call(this);
            if (this.config.open_replay_active) {
                new OpenReplay(this.config);
                this.bind("change:cashier", () => {
                    window.OpenReplay.setMetadata(
                        "cashier",
                        this.env.pos.get_cashier().name
                    );
                    window.OpenReplay.setMetadata("session", this.env.session.name);
                    window.OpenReplay.setMetadata("cashier_id", this.get_cashier().id);
                });
            }
        },
    });
    return {
        OpenReplay: OpenReplay,
    };
});
