/*
Copyright (C) 2022-Today KMEE (https://kmee.com.br)
 License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).
*/

odoo.define("pos_crm.models", function (require) {
    "use strict";

    var models = require("point_of_sale.models");

    //    Models.load_fields("pos.order", ["is_pos_crm_checked"]);

    var _super_order = models.Order.prototype;
    models.Order = models.Order.extend({
        initialize: function (attributes, options) {
            _super_order.initialize.apply(this, arguments, options);
            this.is_pos_crm_checked = this.is_pos_crm_checked || null;
            this.save_to_db();
        },
        init_from_JSON: function (json) {
            _super_order.init_from_JSON.apply(this, arguments);
            this.is_pos_crm_checked = json.is_pos_crm_checked || null;
        },
        export_for_printing: function () {
            var json = _super_order.export_for_printing.apply(this, arguments);
            json.is_pos_crm_checked = this.is_pos_crm_checked;
            return json;
        },
        set_is_pos_crm_checked: function (is_pos_crm_checked) {
            this.assert_editable();
            this.is_pos_crm_checked = is_pos_crm_checked;
        },
        is_is_pos_crm_checked: function () {
            return this.is_pos_crm_checked;
        },
    });
});
