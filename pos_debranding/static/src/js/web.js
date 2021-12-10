odoo.define("pos_debranding.AbstractWebClient", function (require) {
    "use strict";
    var utils = require("web.utils");
    var AbstractWebClient = require("web.AbstractWebClient");

    AbstractWebClient.include({
        _title_changed: function () {
            // Had to override this to avoid Odoo title blinking
            var self = this;
            var parts = _.sortBy(_.keys(this.get("title_part")), function (x) {
                return x;
            });
            var tmp = "";
            _.each(
                parts,
                function (part) {
                    var str = this.get("title_part")[part];
                    if (str) {
                        tmp = tmp ? tmp + " - " + str : str;
                    }
                },
                this
            );
            self._rpc(
                {
                    model: "res.config.settings",
                    method: "get_pos_debranding_values",
                },
                {
                    shadow: true,
                }
            ).then(function (result) {
                if (result.pos_debranding_title) {
                    document.title = tmp.replace(/Odoo/gi, result.pos_debranding_title);
                    utils.set_cookie(
                        "pos_debranding_title",
                        result.pos_debranding_title
                    );
                } else {
                    document.title = tmp;
                }
            });
        },
    });
});
