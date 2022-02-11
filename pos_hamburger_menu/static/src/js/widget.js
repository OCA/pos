/**
Copyright (C) 2021 - Kmee (http://www.kmee.com.br)
@author: Luiz Felipe do Divino (luiz.divino@kmee.com.br)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
**/

odoo.define('pos_hamburger_menu.widgets', function (require) {
    "use strict";

    var PosBaseWidget = require('point_of_sale.BaseWidget');
    var core = require('web.core');
    var _t = core._t;

    var ShowHamburgerMenuWidget = PosBaseWidget.extend({
        template: 'ShowHamburgerMenuWidget',
        renderElement: function () {
            var self = this;
            this._super();
        },
        add_menu: function (name, text) {
            var menu = document.createElement('span');
            menu.id = name;
            menu.innerHTML = text;

            this.el.querySelector(".dropdown-content").appendChild(menu);
        },
        remove_menu: function (name) {
            this.el.querySelector(".dropdown-content").removeChild("#"+name);
        }
    });

    return {
        ShowHamburgerMenuWidget: ShowHamburgerMenuWidget,
    };

});
