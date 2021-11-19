/**
Copyright (C) 2021 - Kmee (http://www.kmee.com.br)
@author: Luiz Felipe do Divino (luiz.divino@kmee.com.br)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
**/

odoo.define('pos_hamburger_menu.chrome', function (require) {
    "use strict";

    var chrome = require('point_of_sale.chrome');
    var pos_hamburger_menu_widget = require('pos_hamburger_menu.widgets');

    chrome.Chrome.include({
        init: function () {
            this.widgets.push({
                "name": "show-hamburger-menu",
                "widget": pos_hamburger_menu_widget.ShowHamburgerMenuWidget,
                "append": ".placeholder-ShowHamburgerMenuWidget",
            });
            return this._super(arguments[0], {});
        },

    });

});
