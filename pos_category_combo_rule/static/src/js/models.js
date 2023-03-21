/*
    Copyright (C) 2023 KMEE (https://kmee.com.br)
    @author: Felipe Zago <felipe.zago@kmee.com.br>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

odoo.define("pos_category_combo_rule.models", function (require) {
    "use strict";

    const models = require("point_of_sale.models");
    const PosDB = require("point_of_sale.DB");
    const {Gui} = require("point_of_sale.Gui");
    var core = require("web.core");
    var _t = core._t;

    models.load_models([
        {
            model: "combo.rule.item",
            fields: ["id", "category_ids", "discount_amount"],
            loaded: function (self, rule_items) {
                self.db.add_combo_rule_itens(rule_items);
            },
        },
        {
            model: "combo.rule",
            fields: ["id", "combo_rule_item_ids", "priority"],
            loaded: function (self, rules) {
                self.db.add_combo_rule(rules);
            },
        },
    ]);

    PosDB.include({
        init: function (options) {
            this.combo_rule_item_by_id = {};
            this.combo_rules_by_id = {};
            this.combo_rules_sorted_by_priority = [];
            this._super(options);
        },

        add_combo_rule_itens: function (rule_items) {
            rule_items.forEach((item) => {
                this.combo_rule_item_by_id[item.id] = {
                    id: item.id,
                    category_ids: item.category_ids,
                    discount_amount: item.discount_amount,
                    order_line_ids: [],
                };
            });
        },

        add_combo_rule: function (rules) {
            rules.forEach((rule) => {
                var itens_by_rule = {};

                rule.combo_rule_item_ids.forEach((item) => {
                    itens_by_rule[item] = this.combo_rule_item_by_id[item];
                });

                this.combo_rules_by_id[rule.id] = {
                    id: rule.id,
                    item_ids: itens_by_rule,
                    priority: parseInt(rule.priority, 10),
                };
            });

            const rulesSorted = _.sortBy(rules, (r) => r.priority);
            this.combo_rules_sorted_by_priority = _.map(rulesSorted, (rule) => {
                return this.combo_rules_by_id[rule.id];
            });
        },
    });

    var _super_orderline = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({
        // eslint-disable-next-line no-unused-vars
        initialize: function (attributes, options) {
            _super_orderline.initialize.apply(this, arguments);

            this.combo_rule_id = this.combo_rule_id || options.combo_rule_id;
            this.combo_discount_amount =
                this.combo_discount_amount || options.combo_discount_amount;
        },

        init_from_JSON: function (json) {
            _super_orderline.init_from_JSON.apply(this, arguments);

            this.combo_rule_id = json.combo_rule_id;
            this.combo_discount_amount = json.combo_discount_amount;
        },

        export_as_JSON: function () {
            const json = _super_orderline.export_as_JSON.apply(this, arguments);

            json.combo_rule_id = this.combo_rule_id;
            json.combo_discount_amount = this.combo_discount_amount;

            return json;
        },

        // eslint-disable-next-line no-unused-vars
        set_quantity: function (quantity, keep_price) {
            if (
                this.combo_rule_id &&
                this.combo_discount_amount &&
                !["remove", ""].includes(quantity)
            ) {
                return Gui.showPopup("ErrorPopup", {
                    title: _t("Validation Error"),
                    body: _t(
                        "Unable to update quantity from order line with discount from combo."
                    ),
                });
            }

            _super_orderline.set_quantity.apply(this, arguments);
        },

        // eslint-disable-next-line no-unused-vars
        can_be_merged_with: function (orderline) {
            if (this.combo_rule_id) {
                return false;
            }

            return _super_orderline.can_be_merged_with.apply(this, arguments);
        },
    });

    return models;
});
