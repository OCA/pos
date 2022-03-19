/** ***************************************************************************
    Copyright (C) 2022 - Today: GRAP (http://www.grap.coop)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
******************************************************************************/

odoo.define('pos_unavailable_product_friendly_error.model', function (require) {
    "use strict";

    var models = require('point_of_sale.models');
    var core = require('web.core');
    var session = require('web.session');
    var _t = core._t;

    var moduleOrderlineParent = models.Orderline;
    models.Orderline = models.Orderline.extend({

        init_from_JSON: function (json) {
            var product = this.pos.db.get_product_by_id(json.product_id);
            if (!product) {
                alert(_t(
                    "Unable to load the point of sale, because a product is not available." +
                    " When confirming this popup, you'll be redirected to the product form" +
                    " to make it again available." +
                    " Once done, you can resume the session of the Point of Sale."
                ));
                var url = "/web#action=point_of_sale.product_product_action&view_type=form&id=" + json.product_id;
                window.location = session.debug ? $.param.querystring(url, {debug: session.debug}) : url;
                // We raise an error to avoid to have other alert if other products are not available.
                throw new Error(
                    "ERROR: attempting to recover product ID " + json.product_id +
                    "not available in the point of sale. Correct the product or clean the browser cache."
                );
            }
            else {
                moduleOrderlineParent.prototype.init_from_JSON.apply(this, arguments);
            }
        },

    });

});
