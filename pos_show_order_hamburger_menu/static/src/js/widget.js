/**
Copyright (C) 2021 - Kmee (http://www.kmee.com.br)
@author: Luiz Felipe do Divino (luiz.divino@kmee.com.br)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
**/

odoo.define('pos_order_show_list.widgets', function (require) {
    "use strict";

    var pos_hamburger_menu = require('pos_hamburger_menu.widgets');

    var ShowOrderHamburgerMenuWidget = pos_hamburger_menu.ShowHamburgerMenuWidget.include({
        renderElement: function () {
            var self = this;
            this._super();
            self.add_menu("order-list", "Order List");
            this.$('#order-list').click(function(){
                var orders = self.pos.orders;
                self.gui.show_screen('order_list',{orders: orders});
            });
            self.add_menu("reload-pos", "Reload POS");
            this.$('#reload-pos').click(function(){
                location.reload(true);
            });
        },
    });

});
