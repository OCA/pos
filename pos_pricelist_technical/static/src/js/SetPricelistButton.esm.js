/** @odoo-module **/
/**
Copyright (C) 2022 - Today: GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
**/

import Registries from "point_of_sale.Registries";
import SetPricelistButton from "point_of_sale.SetPricelistButton";

const SetPricelistButtonPosTechnicalPricelist = (OriginalSetPricelistButton) =>
    class extends OriginalSetPricelistButton {
        async showPopup(name, props) {
            props.list = props.list.filter((x) => !x.item.is_technical);
            return await super.showPopup(name, props);
        }
    };

Registries.Component.extend(
    SetPricelistButton,
    SetPricelistButtonPosTechnicalPricelist
);
