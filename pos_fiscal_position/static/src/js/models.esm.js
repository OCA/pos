/** @odoo-module **/
/** © 2023 - FactorLibre - Juan Carlos Bonilla <juancarlos.bonilla@factorlibre.com>
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html). **/

import {Order} from "point_of_sale.models";
import Registries from "point_of_sale.Registries";

export const FiscalPositionOrder = (OriginalOrder) =>
    class extends OriginalOrder {
        updatePricelist(newPartner) {
            super.updatePricelist(...arguments);
            if (newPartner && !this.fiscal_position) {
                const defaultFiscalPosition = this.pos.fiscal_positions.find(
                    (position) =>
                        position.id === this.pos.config.default_fiscal_position_id[0]
                );
                if (defaultFiscalPosition)
                    this.set_fiscal_position(defaultFiscalPosition);
            }
        }
    };

Registries.Model.extend(Order, FiscalPositionOrder);
