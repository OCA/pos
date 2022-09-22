odoo.define("pos_cups_printer.printers", function (require) {
    "use strict";

    var Printer = require("point_of_sale.Printer").Printer;

    Printer = Printer.include({
        init: function (url, pos, cups_printer_name, printer_type) {
            var res = this._super(url, pos);
            if (printer_type === "cups" || pos.config.iot_printer_type === "cups") {
                this.cups_printer_name =
                    cups_printer_name || pos.config.cups_printer_name;
            } else {
                this.cups_printer_name = null;
            }
            return res;
        },
        open_cashbox: function () {
            var self = this;
            return this.connection
                .rpc("/hw_proxy/named_printer_action", {
                    data: {
                        action: "cashbox",
                        printer_name: this.cups_printer_name,
                    },
                })
                .then(self._onIoTActionResult.bind(self))
                .guardedCatch(self._onIoTActionFail.bind(self));
        },
        send_printing_job: function (img) {
            var data = {
                action: "print_receipt",
                receipt: img,
                printer_name: this.cups_printer_name,
            };
            return this.connection.rpc("/hw_proxy/named_printer_action", {
                data: data,
            });
        },
    });

    return Printer;
});
