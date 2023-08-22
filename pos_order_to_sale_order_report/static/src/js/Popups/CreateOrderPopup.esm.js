/** @odoo-module **/

import CreateOrderPopup from "point_of_sale.CreateOrderPopup";
import Registries from "point_of_sale.Registries";

const PosSaleOrderReportCreateOrderPopup = (CreateOrderPopup) =>
    class extends CreateOrderPopup {
        async _downloadSaleOrderReport(saleOrderId) {
            try {
                const report = this.env.pos.config.iface_sale_order_report_id;
                if (saleOrderId && report) {
                    await this.env.legacyActionManager.do_action(report[0], {
                        additional_context: {
                            active_ids: [saleOrderId],
                        },
                    });
                }
            } catch (error) {
                if (error instanceof Error) {
                    throw error;
                } else {
                    this.showPopup("ErrorPopup", {
                        title: this.env._t("Network Error"),
                        body: this.env._t("Unable to download report."),
                    });
                }
            }
        }
        // @override
        async _createSaleOrder(order_state) {
            const data = await super._createSaleOrder(order_state);
            if (data) {
                await this._downloadSaleOrderReport(data.sale_order_id);
            }
            return data;
        }
    };

Registries.Component.extend(CreateOrderPopup, PosSaleOrderReportCreateOrderPopup);
