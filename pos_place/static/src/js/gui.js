/**
Copyright (C) 2015 - Today: GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
**/

odoo.define('pos_place.gui', function (require) {
    "use strict";

    var gui = require('point_of_sale.gui');
    var core = require('web.core');
    var _t = core._t;


    gui.Gui.include({

        select_place: function () {
            var def = new $.Deferred();
            var current_place = this.pos.get_place();

            var list = [];
            for (var i = 0; i < this.pos.places.length; i++) {
                var item = this.pos.places[i];
                list.push({
                    'label': item.code + " - " + item.name,
                    'item':  item,
                });
            }

            this.show_popup('selection', {
                title: _t("Select a Place"),
                list: list,
                confirm: function (place) {
                    def.resolve(place);
                },
                cancel: function () {
                    def.resolve(null);
                },
                is_selected: function (place) {
                    if (current_place) {
                        return place.id === current_place.id;
                    }

                    return false;

                },
            });

            return def.then(function (place) {
                return place;
            });
        },

    });

});
