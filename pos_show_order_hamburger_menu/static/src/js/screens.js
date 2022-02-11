odoo.define("pos_show_order_hamburger_menu.screens", function(require) {
    "use strict";

    var pos_order_screens = require("pos_order_show_list.screens");
    var screens = require('point_of_sale.screens');

    pos_order_screens.OrderListButton.include({
        renderElement: function () {
            this._super();
            this.$el.removeClass('pos_order_list_button');
            this.$el.removeClass('control-button');
            this.$el.html("");
        }
    });
});
