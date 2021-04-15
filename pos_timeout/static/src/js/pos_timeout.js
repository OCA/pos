/** ****************************************************************************
    Copyright (C) 2018 - Today: GRAP (http://www.grap.coop)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 *****************************************************************************/

odoo.define("pos_timeout.models", function (require) {
    "use strict";
    var models = require("point_of_sale.models");

    /** ***********************************************************************
        Extend module.PosModel:
            Overload _save_to_server to alter the timeout
     */
    var PosModelParent = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        // eslint-disable-next-line no-unused-vars
        _save_to_server: function (orders, options) {
            // Get PoS Config Settings
            var timeout = this.config.pos_order_timeout;
            if (timeout > 0 && orders && orders.length) {
                arguments[1].timeout = timeout * 1000 * orders.length;
            }
            return PosModelParent._save_to_server.apply(this, arguments);
        },
    });
});
