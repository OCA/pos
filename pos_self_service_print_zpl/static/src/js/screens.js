odoo.define("pos_self_service_print_zpl.screens", function (require) {
    "use strict";

    var screens = require("pos_self_service_base.screens");
    var core = require("web.core");
    var _t = core._t;

    screens.SelfServiceScreenWidget.include({
        click_print: function () {
            this._super();
            var printer_name = this.pos.config.printer_name;
            if (printer_name) {
                if (this.scale_weight > 0) {
                    window.printZPL(printer_name, this.get_ZPL_barcode());
                }
            } else {
                this.gui.show_popup("error", {
                    title: _t("Missing Printer Name"),
                    body: _t("Please edit your printer name in POS configuration"),
                });
            }
        },
        get_ZPL_barcode: function () {
            return `~SD${this.pos.config.darkness}
            ^XA ^FX
            ^BY${this.pos.config.label_height},2,${this.pos.config.label_width}
            ^FO${this.pos.config.label_offset_x},${this.pos.config.label_offset_y}
            ^BE^FD${this.get_barcode()}^FS
            ^XZ`;
        },
    });
});
