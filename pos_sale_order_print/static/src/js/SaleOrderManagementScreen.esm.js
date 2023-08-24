/** @odoo-module **/

import SaleOrderManagementScreen from "pos_sale.SaleOrderManagementScreen";
import Registries from "point_of_sale.Registries";

const PrintSaleOrderManagementScreen = (SaleOrderManagementScreen) =>
    class PrintSaleOrderManagementScreen extends SaleOrderManagementScreen {
        async _onClickSaleOrder(event) {
            // Add a "Print" option to the selection list
            this.additionalSelectionList = [
                {id: "2", label: this.env._t("Print"), item: "print"},
            ];
            // Store the clicked order
            this.clickedOrder = event.detail;
            await super._onClickSaleOrder(...arguments);
            // Clear the additional selection list
            this.additionalSelectionList = false;
        }
        async _printSaleOrder(confirmed, payload) {
            // Reset confirmed, payload, and additionalSelectionList
            confirmed = false;
            payload = false;
            this.additionalSelectionList = false;
            if (
                this.env.pos.config.print_sales_order_ids &&
                this.env.pos.config.print_sales_order_ids.length > 0
            ) {
                const printActions = this.env.pos.config.print_sales_order_ids.filter(
                    (id) => {
                        return this.env.pos.ir_actions_report.some(
                            (report) => report.id === id
                        );
                    }
                );

                // Show a selection popup for the user to choose what to print
                const {confirmed: popupConfirmed, payload: popupSelectedOption} =
                    await this.showPopup("SelectionPopup", {
                        title: this.env._t("What do you want to print?"),
                        list: printActions.map((actionId) => ({
                            id: actionId,
                            item: actionId,
                            label: this.env.pos.ir_actions_report.find(
                                (report) => report.id === actionId
                            ).name,
                        })),
                    });

                if (popupConfirmed) {
                    try {
                        await this.env.legacyActionManager.do_action(
                            popupSelectedOption,
                            {
                                additional_context: {
                                    active_ids: [this.clickedOrder.id],
                                },
                            }
                        );
                    } catch (error) {
                        if (error instanceof Error) {
                            throw error;
                        } else {
                            this.showPopup("ErrorPopup", {
                                title: this.env._t("Network Error"),
                                body: this.env._t("Unable to download the report."),
                            });
                        }
                    }
                }
            } else {
                this.showPopup("ErrorPopup", {
                    title: this.env._t("Print Error"),
                    body: this.env._t(
                        "Please choose which sale orders to print in the POS sales configuration."
                    ),
                });
            }
            return {confirmed, payload};
        }
        showPopup(name, props) {
            if (name == "SelectionPopup" && this.additionalSelectionList) {
                props.list = [...props.list, ...this.additionalSelectionList];
            }
            return super.showPopup(name, props).then(({confirmed, payload}) => {
                // Check if the user confirmed and wants to print
                if (confirmed && payload === "print") {
                    // Handle printing based on user selections
                    return this._printSaleOrder(confirmed, payload);
                }
                return {confirmed, payload};
            });
        }
    };

Registries.Component.extend(SaleOrderManagementScreen, PrintSaleOrderManagementScreen);
