/*
    Copyright 2023 Braintec (https://www.braintec.com).
    @author David Moreno <david.moreno@braintec.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.PosModel", function (require) {
    "use strict";

    // Since PosModel is not exported, and because we want our new models to have the
    // same structure as the native ones, we're forced to find a solution to get the
    // original PosModel class accessible
    const {Packlotline} = require("point_of_sale.models");

    // This will return the PosModel class
    return Object.getPrototypeOf(Packlotline);
});
