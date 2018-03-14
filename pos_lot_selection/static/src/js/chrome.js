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
                "change .packlot-line-select": "lot_to_input",
                "click .lot-clone": "clone_input",
            };
            packlotline.events = Object.assign(
                packlotline.events, events
            );
            // Add methods over instanced popup
            // Write the value in the corresponding input
            packlotline.lot_to_input = function (event) {
                var $select = this.$("select.packlot-line-select");
                var $option = this.$("select.packlot-line-select option");
                var $input = this.$el.find("input[cid='" + this.active_cid + "']");
                if ($input.length) {
                    $input[0].value = $select[0].value;
                    $input.focus();
                }
                $option.prop('selected', function () {
                    return this.defaultSelected;
                });
            };
            // Tracks the last selected input
            packlotline.lose_input_focus = function (event) {
                var $input = $(event.target),
                    cid = $input.attr('cid');
                this.active_cid = cid;
                var lot_model = this.options.pack_lot_lines.get({cid: cid});
                lot_model.set_lot_name($input.val());
            };
            // Clones content of input to all the others
            packlotline.clone_input = function (event) {
                var $input = $(event.target).prev().prev(),
                    cid = $input.attr('cid');
                var $clone_input = this.$el.find("input");
                if ($clone_input.length > 1) {
                    for (var i = 0; i < $clone_input.length; i++) {
                        if ($clone_input[i].getAttribute('cid') != cid) {
                            $clone_input[i].value = $input.val();
                            $clone_input[i].blur();
                        }
                    }
                }
            }
            this.gui.popup_instances.packlotline = packlotline;
            return res;
        },
    });

});
