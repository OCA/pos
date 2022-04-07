/*
    Copyright (C) 2004-Today Apertoso NV (<http://www.apertoso.be>)
    Copyright (C) 2016-Today La Louve (<http://www.lalouve.net/>)

    @author: Jos DE GRAEVE (<Jos.DeGraeve@apertoso.be>)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)

    The licence is in the file __manifest__.py
*/

odoo.define("pos_customer_required.screens", function(require) {
    "use strict";

    const screens = require("point_of_sale.screens");
    const core = require("web.core");
    const _t = core._t;

    screens.PaymentScreenWidget.include({
        validate_order: function(options) {
            if (
                this.pos.config.require_customer != "no" &&
                !this.pos.get_order().get_client()
            ) {
                this.gui.show_popup("error", {
                    title: _t("An anonymous order cannot be confirmed"),
                    body: _t("Please select a customer for this order."),
                });
                return;
            }
            return this._super(options);
        },
    });

    return screens;
});
