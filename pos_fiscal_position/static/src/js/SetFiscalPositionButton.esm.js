/** @odoo-module **/
/** © 2023 - FactorLibre - Juan Carlos Bonilla <juancarlos.bonilla@factorlibre.com>
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html). **/

import ProductScreen from "point_of_sale.ProductScreen";
import Registries from "point_of_sale.Registries";
import SetFiscalPositionButton from "point_of_sale.SetFiscalPositionButton";

import {onWillRender} from "@odoo/owl";

export const SetFiscalPositionButtonInherit = (OriginalSetFiscalPositionButton) =>
    class extends OriginalSetFiscalPositionButton {
        setup() {
            super.setup();

            onWillRender(() => {
                const self = this;
                if (this.currentOrder && !this.currentOrder.fiscal_position) {
                    const fiscal_pos = _.find(
                        this.env.pos.fiscal_positions,
                        function (fp) {
                            return (
                                fp.id ===
                                self.env.pos.config.default_fiscal_position_id[0]
                            );
                        }
                    );
                    if (fiscal_pos) this.currentOrder.set_fiscal_position(fiscal_pos);
                }
            });
        }

        // We overwrite it to show always a fiscal position option without 'none' value.
        async onClick() {
            const currentFiscalPosition = this.currentOrder.fiscal_position;
            const fiscalPosList = [];
            for (const fiscalPos of this.env.pos.fiscal_positions) {
                fiscalPosList.push({
                    id: fiscalPos.id,
                    label: fiscalPos.name,
                    isSelected: currentFiscalPosition
                        ? fiscalPos.id === currentFiscalPosition.id
                        : false,
                    item: fiscalPos,
                });
            }
            const {confirmed, payload: selectedFiscalPosition} = await this.showPopup(
                "SelectionPopup",
                {
                    title: this.env._t("Select Fiscal Position"),
                    list: fiscalPosList,
                }
            );
            if (confirmed) {
                this.currentOrder.set_fiscal_position(selectedFiscalPosition);
                for (const line of this.currentOrder.orderlines) {
                    line.set_quantity(line.quantity);
                }
            }
        }
    };

Registries.Component.extend(SetFiscalPositionButton, SetFiscalPositionButtonInherit);

ProductScreen.addControlButton({
    component: SetFiscalPositionButton,
    condition: function () {
        return (
            this.env.pos.fiscal_positions.length > 0 &&
            !this.env.pos.config.hide_fiscal_position_button
        );
    },
    position: ["replace", "SetFiscalPositionButton"],
});
