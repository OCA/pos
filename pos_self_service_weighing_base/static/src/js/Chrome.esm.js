/** @odoo-module alias=pos_self_service_weighing_base.Chrome **/
// SPDX-FileCopyrightText: 2023 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import Chrome from "point_of_sale.Chrome";
import Registries from "point_of_sale.Registries";

const SelfServiceWeighingChrome = (Chrome) =>
    class extends Chrome {
        /**
         * @override
         * `SelfServiceWeighingWelcomeScreen` is the start screen if the POS is configured
         *  as a self-service pos.
         */
        get startScreen() {
            // Calling super first because it logs an error in some cases.
            var result = super.startScreen;
            if (this.env.pos.config.is_self_service_weighing_point) {
                return {name: "SelfServiceWeighingWelcomeScreen"};
            }
            return result;
        }

        showTicketButton() {
            /**
             * The ticket button should not be displayed if the POS
             * is a self-service weighing station.
             * Returns False if the `is_self_service_weighing_point` is checked.
             */
            return (
                this.env.pos &&
                this.env.pos.config &&
                !this.env.pos.config.is_self_service_weighing_point
            );
        }

        showCashMoveButton() {
            return (
                super.showCashMoveButton() &&
                !this.env.pos.config.is_self_service_weighing_point
            );
        }
    };

Registries.Component.extend(Chrome, SelfServiceWeighingChrome);
export default SelfServiceWeighingChrome;
