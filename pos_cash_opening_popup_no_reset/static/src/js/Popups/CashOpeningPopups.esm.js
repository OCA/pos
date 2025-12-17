/** @odoo-module **/

/* Copyright CoopITEasy - Simon Hick <sim@coopiteasy.be>
   License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl) */

import CashOpeningPopup from "point_of_sale.CashOpeningPopup";
import Registries from "point_of_sale.Registries";

const CashOpeningPopupNoReset = (CashOpeningPopupOriginal) =>
    class extends CashOpeningPopupOriginal {
        openDetailsPopup() {
            const openingCash = this.state.openingCash;
            super.openDetailsPopup();
            this.state.openingCash = openingCash;
        }
    };

Registries.Component.extend(CashOpeningPopup, CashOpeningPopupNoReset);
