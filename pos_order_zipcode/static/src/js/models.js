/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Pierre Verkest <pierreverkest84@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
 */

odoo.define('pos_order_zipcode.models', function (require) {
    "use strict";

    var models = require('point_of_sale.models');
    var OrderSuper = models.Order.prototype;
    models.Order = models.Order.extend({
        init_from_JSON: function (json) {
            OrderSuper.init_from_JSON.apply(this, arguments);
            this.set_zipcode(json.zip)
        },
        get_zipcode: function(){
            return this.get("zipcode");
        },
        set_zipcode: function(zipcode){
            this.set("zipcode", typeof zipcode === 'string' ? zipcode.trim(): zipcode)
        },
        set_client: function(client){
            OrderSuper.set_client.apply(this, arguments);
            this.set('zipcode', client && client.zip || null);
        },
        export_as_JSON: function(){
            var res = OrderSuper.export_as_JSON.apply(this, arguments);
            res.zipcode = this.get_zipcode();
            return res;
        },
    });

    
});
