/*
    POS Payment Terminal module for Odoo
    Copyright (C) 2014-2020 Aurélien DUMAINE
    Copyright (C) 2014-2020 Akretion (www.akretion.com)
    @author: Aurélien DUMAINE
    @author: Alexis de Lattre <alexis.delattre@akretion.com>
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/

odoo.define("pos_payment_terminal.models", function (require) {
    var models = require("point_of_sale.models");
    var OCAPaymentTerminal = require("pos_payment_terminal.payment");
    models.register_payment_method("oca_payment_terminal", OCAPaymentTerminal);
    models.load_fields("pos.payment.method", "oca_payment_terminal_mode");
});
