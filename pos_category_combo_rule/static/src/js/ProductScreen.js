/*
    Copyright (C) 2023 KMEE (https://kmee.com.br)
    @author: Felipe Zago <felipe.zago@kmee.com.br>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

odoo.define("pos_category_combo_rule.ProductScreen", function (require) {
    "use strict";

    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");

    const ComboRulesManagementProductScreen = (Product) =>
        class extends Product {
            constructor() {
                super(...arguments);

                this.applied_rule_qty = {};
            }

            get combo_rules_sorted_by_priority() {
                return this.env.pos.db.combo_rules_sorted_by_priority;
            }

            get combo_rules_by_id() {
                return this.env.pos.db.combo_rules_by_id;
            }

            get combo_rule_item_by_id() {
                return this.env.pos.db.combo_rule_item_by_id;
            }

            _applyRulesDiscount() {
                this._setRuleItemsOrderLines();

                _.each(this.combo_rules_sorted_by_priority, (rule) => {
                    this._calculateAppliedRuleQty(rule);

                    const availableRuleQty = this._getAvailableRuleQty(rule);
                    if (
                        availableRuleQty === 0 ||
                        availableRuleQty <= this.applied_rule_qty[rule.id]
                    )
                        return;

                    const availableLines = _.map(rule.item_ids, (item) => {
                        return item.order_line_ids.slice(0, availableRuleQty);
                    }).flat();
                    if (availableLines.length === 0) return;

                    const orderLinesToReset = this._getOrderLinesToReset(
                        rule,
                        availableRuleQty
                    );
                    orderLinesToReset.forEach((line) => this._resetOrderLine(line));

                    availableLines.forEach((line_id) => {
                        const line = this.order.get_orderline(line_id);
                        const item = _.find(rule.item_ids, (i) => {
                            return i.category_ids.includes(
                                line.product.pos_categ_id[0]
                            );
                        });

                        if (line.quantity > 1) {
                            line.set_quantity(line.quantity - 1);
                            const newLine = line.clone();
                            this.currentOrder.add_orderline(newLine);
                            line.set_quantity(1);
                        }

                        this._setComboDiscount(line, item.discount_amount);
                        line.combo_rule_id = parseInt(rule.id, 10);
                    });

                    this.order.trigger("change", this.order);
                });
            }

            _setRuleItemsOrderLines() {
                const orderLines = this.currentOrder.get_orderlines();
                if (!orderLines) return;

                _.each(this.combo_rule_item_by_id, (item) => {
                    const validOrderLines = _.filter(orderLines, (line) => {
                        return item.category_ids.includes(line.product.pos_categ_id[0]);
                    });

                    item.order_line_ids = _.map(validOrderLines, (line) => line.id);
                });
            }

            _calculateAppliedRuleQty(rule) {
                const orderLines = this.currentOrder.get_orderlines();
                if (!orderLines) return;

                const itemsQty = _.size(rule.item_ids);
                const orderLinesRules = _.filter(
                    orderLines,
                    (line) => line.combo_rule_id === rule.id
                );
                this.applied_rule_qty[rule.id] = parseInt(
                    orderLinesRules.length / itemsQty,
                    10
                );
            }

            _getAvailableRuleQty(rule) {
                const itemOrderLinesSizes = _.map(
                    rule.item_ids,
                    (item) => item.order_line_ids.length
                );
                if (itemOrderLinesSizes.length === 0) return 0;

                return Math.min(...itemOrderLinesSizes);
            }

            _getOrderLinesToReset(rule, qtyAvailable) {
                const getRuleItemsCategories = (items) => {
                    return _.map(items, (i) => i.category_ids).flat();
                };

                const categoryIds = getRuleItemsCategories(rule.item_ids);
                const rulesWithSameCateg = _.filter(this.combo_rules_by_id, (r) => {
                    const currCategs = getRuleItemsCategories(r.item_ids);
                    return _.any(currCategs, (categ) => categoryIds.includes(categ));
                });

                const linesToReset = new Set(
                    _.map(rulesWithSameCateg, (r) => {
                        return _.map(r.item_ids, (item) =>
                            item.order_line_ids.slice(0, qtyAvailable)
                        ).flat();
                    }).flat()
                );
                return _.map(Array.from(linesToReset), (line) =>
                    this.order.get_orderline(line)
                );
            }

            _setComboDiscount(orderLine, discountAmount) {
                const finalAmount = orderLine.price - discountAmount;
                if (finalAmount > 0) {
                    orderLine.set_unit_price(finalAmount);
                    orderLine.combo_discount_amount = discountAmount;
                }
            }

            async _clickProduct(event) {
                await super._clickProduct(event);

                this._applyRulesDiscount();
            }

            async _setValue(val) {
                const orderLine = this.currentOrder.get_selected_orderline();

                await super._setValue(val);

                if (
                    orderLine &&
                    orderLine.combo_rule_id &&
                    !this.currentOrder.get_orderlines().includes(orderLine)
                ) {
                    this._removeOrderLinesComboDiscount(orderLine.combo_rule_id);
                    this._applyRulesDiscount();
                }
            }

            _removeOrderLinesComboDiscount(comboId) {
                const orderLines = _.filter(
                    this.currentOrder.get_orderlines(),
                    (line) => {
                        return line.combo_rule_id === comboId;
                    }
                );

                if (!orderLines) return;

                this.itemsApplied = [];
                _.each(orderLines, (line) => this._resetOrderLine(line));

                this.order.trigger("change", this.order);
            }

            _resetOrderLine(line) {
                line.set_unit_price(line.product.lst_price);
                line.combo_discount_amount = 0;
                line.combo_rule_id = undefined;
            }
        };

    Registries.Component.extend(ProductScreen, ComboRulesManagementProductScreen);
    return ProductScreen;
});
