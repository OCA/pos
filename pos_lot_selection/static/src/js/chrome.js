/* Copyright 2018 Tecnativa - David Vidal
   Copyright 2019 Lambda IS DOOEL <https://www.lambda-is.com>
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

odoo.define("pos_lot_selection.chrome", function (require) {
    "use strict";

    var chrome = require("point_of_sale.chrome");

    chrome.Chrome.include({
        build_widgets: function () {
            var res = this._super.apply(this, arguments);
            var packlotline = this.gui.popup_instances.packlotline;
            // Add events over instanced popup
            var events = {
                "change .packlot-line-select": "lot_to_input",
            };
            packlotline.events = _.extend(
                packlotline.events, events
            );
            // Add methods over instanced popup
            // Write the value in the corresponding input
            packlotline.lot_to_input = function (event) {
                var $select = $(event.target);
                var $option = this.$("select.packlot-line-select option");
                var $input = this.$el.find("input");
                if ($input.length) {
                    $input[0].value = $select[0].value;
                    $input.blur();
                    $input.focus();
                }
                $option.prop('selected', function () {
                    return this.defaultSelected;
                });
            };
            this.gui.popup_instances.packlotline = packlotline;
            return res;
        },
    });

});
