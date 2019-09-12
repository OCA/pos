/*
# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.fr/>)
# Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
# @author: La Louve
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html

*/

odoo.define('pos_ticket_send_by_mail.pos_model', function (require) {
    "use strict";
    var pos_model = require('point_of_sale.models');
    pos_model.load_fields("res.partner", "email_pos_receipt");
    pos_model.load_models([{
        model: "res.config.settings",
        fields: ["receipt_options"],
        loaded: function(self, config_settings){
            const config_setting = config_settings.length > 0 ? config_settings.reduce(function(prev, current) {
                return (prev.id > current.id) ? prev : current
            }) : false; //returns object
            self.config_settings = config_setting;
        }
    }]);

});
