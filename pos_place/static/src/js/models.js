/**
Copyright (C) 2015 - Today: GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
**/

odoo.define('pos_place.models', function (require) {
    "use strict";

    var models = require('point_of_sale.models');
    var _super_order = models.Order.prototype;

    // Load pos.place model
    models.load_models({
        model: 'pos.place',
        loaded: function (self, places) {
            self.places = [];
            for (var i = 0; i < places.length; i++) {
                self.places.push(places[i]);
            }
        },
    });

    // Make place persistent in the session
    models.PosModel = models.PosModel.extend({
        get_place: function () {
            return this.get('current_place') ||
                this.db.load('current_place');
        },
        set_place: function (place) {
            this.set('current_place', place);
            this.db.save('current_place', place || null);
        },
    });

    models.Order = models.Order.extend({
        export_for_printing: function () {
            var res = _super_order.export_for_printing.apply(this, arguments);
            res.place = this.pos.get_place();
            return res;
        },

        export_as_JSON: function () {
            var json = _super_order.export_as_JSON.apply(this, arguments);
            var place = this.pos.get_place();
            json.place_id = place ? place.id : false;
            return json;
        },
    });

});
