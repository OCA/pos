/* Copyright 2018 Tecnativa - David Vidal
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
                "click .lot-select-list": "show_lot_select",
                "change .packlot-line-select": "lot_to_input",
            };
            packlotline.events = Object.assign(
                packlotline.events, events
            );
            // Add methods over instanced popup
            // Show lot block with select control
            packlotline.show_lot_select = function (event) {
                var $input = $(event.target).prev().prev();
                this.$("div.packlot-select").removeClass("oe_hidden");
                var $select = this.$("select.packlot-line-select");
                this.active_cid = $input.attr("cid");
                $select.focus();
            };
            // Hide lot block
            packlotline.hide_lot_select = function () {
                this.$("div.packlot-select").addClass("oe_hidden");
            };
            // Write the value in the corresponding input
            packlotline.lot_to_input = function (event) {
                var $select = this.$("select.packlot-line-select");
                var $input = this.$el.find("input[cid='" + this.active_cid + "']");
                $input[0].value = $select[0].value;
                $input.focus();
                this.hide_lot_select();
            };
            this.gui.popup_instances.packlotline = packlotline;
            return res;
        },
    });

});
