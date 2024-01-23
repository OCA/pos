/** @odoo-module **/

import CreateOrderPopup from "point_of_sale.CreateOrderPopup";
import Registries from "point_of_sale.Registries";

export const CreateOrderPopupRisk = (OriginalCreateOrderPopup) =>
    class extends OriginalCreateOrderPopup {
        /**
         *  Calculate risk amount by order
         * @returns {Promise<*>} order total
         * @private
         */
        async _calculateRiskAmount() {
            const order = this.env.pos.get_order();
            return order.get_total_with_tax() + order.get_rounding_applied();
        }

        /**
         * Get risk exception message for partner by risk data and order amount
         * @param {Object} partner - partner risk fields {...}
         * @param {String} riskAmount - risk order amount
         * @returns {*|String} error message or empty string
         * @private
         */
        _getRiskExceptionMessage(partner, riskAmount) {
            if (partner.risk_exception) {
                return this.env._t("Financial risk exceeded.\n");
            }
            if (
                partner.risk_sale_order_limit &&
                partner.risk_sale_order + riskAmount > partner.risk_sale_order_limit
            ) {
                return this.env._t("This sale order exceeds the sales orders risk.\n");
            }
            if (
                partner.risk_sale_order_include &&
                partner.risk_total + riskAmount > partner.credit_limit
            ) {
                return this.env._t("This sale order exceeds the financial risk.\n");
            }
            return "";
        }

        /**
         * Get Partners field list
         * @returns {String[]}
         * @private
         */
        _getPartnerFields() {
            return [
                "risk_exception",
                "risk_sale_order_limit",
                "risk_sale_order",
                "risk_sale_order_include",
                "risk_total",
                "credit_limit",
            ];
        }

        /**
         * Get risk fields values for partner of order
         * @returns {Promise<*>} partner fields Object
         * @private
         */
        async _getOrderPartnerRiskValue() {
            const order = this.env.pos.get_order();
            const [partnerRiskValues] = await this.rpc({
                model: "res.partner",
                method: "read",
                args: [order.partner.id, this._getPartnerFields()],
            });
            return partnerRiskValues;
        }

        /**
         * Check Risk for partner by order
         * @param {String} exception_msg Exception message string
         * @param {String} order_state order state
         * @returns {Promise<*>}
         * @private
         */
        async _handleRiskException(exception_msg, order_state) {
            const order = this.env.pos.get_order();
            if (this.env.pos.user.has_role_risk_manager) {
                const {confirmed} = await this.showPopup("ConfirmPopup", {
                    title: this.env._t("Partner risk exceeded"),
                    body: exception_msg,
                });
                if (confirmed) {
                    order.set_bypass_risk(true);
                    const result = await super._actionCreateSaleOrder(order_state);
                    order.set_bypass_risk(false);
                    return result;
                }
            } else {
                await this.showPopup("ErrorPopup", {
                    title: this.env._t("Partner risk exceeded"),
                    body: exception_msg,
                });
            }
            return await this.cancel();
        }

        async _actionCreateSaleOrder(order_state) {
            if (order_state === "draft") {
                // Default behavior
                return await super._actionCreateSaleOrder(order_state);
            }
            this.extraContext = false;
            const riskAmount = await this._calculateRiskAmount();
            const partnerRiskValue = await this._getOrderPartnerRiskValue();
            const exceptionMsg = this._getRiskExceptionMessage(
                partnerRiskValue,
                riskAmount
            );
            if (!exceptionMsg) {
                return await super._actionCreateSaleOrder(order_state);
            }
            return await this._handleRiskException(exceptionMsg, order_state);
        }
    };

Registries.Component.extend(CreateOrderPopup, CreateOrderPopupRisk);
