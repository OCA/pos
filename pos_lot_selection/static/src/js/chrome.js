/* Copyright 2018 Tecnativa - David Vidal
   Copyright 2019 Lambda IS DOOEL <https://www.lambda-is.com>
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

odoo.define("pos_lot_selection.chrome", function(require) {
    "use strict";
    var PosModel = require("point_of_sale.models");
    var PosPopups = require("point_of_sale.popups");
    var gui = require("point_of_sale.gui");
    var PackLotLinePopupWidget = PosPopups.extend({
        template: "PackLotLinePopupWidget",
        events: _.extend({}, PosPopups.prototype.events, {
            "click .remove-lot": "remove_lot",
            keydown: "add_lot",
            "blur .packlot-line-input": "lose_input_focus",
            "change .packlot-line-select": "lot_to_input",
        }),

        show: function(options) {
            this._super(options);
            this.focus();
            this.renderElement();
        },

        click_confirm: function() {
            var pack_lot_lines = this.options.pack_lot_lines;
            this.$(".packlot-line-input").each(function(index, el) {
                var cid = $(el).attr("cid"),
                    lot_name = $(el).val();
                var pack_line = pack_lot_lines.get({cid: cid});
                pack_line.set_lot_name(lot_name);
            });
            pack_lot_lines.remove_empty_model();
            pack_lot_lines.set_quantity_by_lot();
            this.options.order.save_to_db();
            this.options.order_line.trigger("change", this.options.order_line);
            this.gui.close_popup();
        },

        add_lot: function(ev) {
            if (
                ev.keyCode === $.ui.keyCode.ENTER &&
                this.options.order_line.product.tracking == "serial"
            ) {
                var pack_lot_lines = this.options.pack_lot_lines,
                    $input = $(ev.target),
                    cid = $input.attr("cid"),
                    lot_name = $input.val();

                var lot_model = pack_lot_lines.get({cid: cid});
                lot_model.set_lot_name(lot_name); // First set current model then add new one
                if (!pack_lot_lines.get_empty_model()) {
                    var new_lot_model = lot_model.add();
                    this.focus_model = new_lot_model;
                }
                pack_lot_lines.set_quantity_by_lot();
                this.renderElement();
                this.focus();
            }
        },

        remove_lot: function(ev) {
            var pack_lot_lines = this.options.pack_lot_lines,
                $input = $(ev.target).prev(),
                cid = $input.attr("cid");
            var lot_model = pack_lot_lines.get({cid: cid});
            lot_model.remove();
            pack_lot_lines.set_quantity_by_lot();
            this.renderElement();
        },

        lose_input_focus: function(ev) {
            var $input = $(ev.target),
                cid = $input.attr("cid");
            var lot_model = this.options.pack_lot_lines.get({cid: cid});
            lot_model.set_lot_name($input.val());
        },

        focus: function() {
            this.$("input[autofocus]").focus();
            this.focus_model = false; // After focus clear focus_model on widget
        },

        // Add new function
        lot_to_input: function(ev) {
            var $select = $(ev.target);
            var $option = this.$("select.packlot-line-select option");
            var $input = this.$el.find("input");
            if ($input.length) {
                $input[0].value = $select[0].value;
                $input.blur();
                $input.focus();
            }
            $option.prop("selected", function() {
                return this.defaultSelected;
            });
        },
    });
    gui.define_popup({name: "packlotline", widget: PackLotLinePopupWidget});
});
