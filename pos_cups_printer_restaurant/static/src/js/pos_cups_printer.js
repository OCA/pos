odoo.define("pos_cups_printer_restaurant.multiprint", function (require) {
    "use strict";

    var models = require("point_of_sale.models");
    var {Printer} = require("point_of_sale.Printer");

    models.load_fields("restaurant.printer", ["cups_printer_name"]);

    var _super_posmodel = models.PosModel.prototype;

    models.PosModel = models.PosModel.extend({
        create_printer: function (config) {
            if (config.printer_type === "cups") {
                var url = config.proxy_ip || "";
                if (url.indexOf("//") < 0) {
                    url = window.location.protocol + "//" + url;
                }
                if (
                    url.indexOf(":", url.indexOf("//") + 2) < 0 &&
                    window.location.protocol !== "https:"
                ) {
                    url += ":8069";
                }
                return new Printer(
                    url,
                    this,
                    config.cups_printer_name,
                    config.printer_type
                );
            }
            return _super_posmodel.create_printer.apply(this, arguments);
        },
    });
});
