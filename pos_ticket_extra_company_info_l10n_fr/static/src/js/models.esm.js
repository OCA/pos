/*
Copyright (C) 2024 - Today: GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define("pos_discount_all.models", function (require) {
    const {Order} = require("point_of_sale.models");
    const Registries = require("point_of_sale.Registries");

    const OrderTicketExtraInfo = (OriginalOrder) =>
        class extends OriginalOrder {
            export_for_printing() {
                var receipt = super.export_for_printing(...arguments);
                const company = this.pos.company;
                receipt.company.siret = company.siret;
                return receipt;
            }
        };

    Registries.Model.extend(Order, OrderTicketExtraInfo);
});
