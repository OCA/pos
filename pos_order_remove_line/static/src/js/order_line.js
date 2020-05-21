/*
 *  Copyright 2019 LevelPrime
 *  License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl)
 */

odoo.define("pos_order_remove_line.order_line", function(require) {
    "use strict";

    require("point_of_sale.screens").OrderWidget.include({
        render_orderline: function() {
            var node = this._super.apply(this, arguments);

            $(node)
                .find(".remove-line-button")
                .on("click", null, this.remove_line.bind(this));

            return node;
        },
        remove_line: function(ev) {
            ev.delegateTarget.parentElement.orderline.set_quantity("remove");
        },
    });
});
