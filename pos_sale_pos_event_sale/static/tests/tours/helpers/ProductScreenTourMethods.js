/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define(
    "pos_sale_pos_event_sale.tour.ProductScreenTourMethods",
    function (require) {
        "use strict";

        const {createTourMethods} = require("point_of_sale.tour.utils");
        const {
            Do,
            Check,
            Execute,
        } = require("point_of_sale.tour.ProductScreenTourMethods");

        class DoExt extends Do {
            clickSaleOrderButton() {
                return [
                    {
                        content: "click Quotation/Order button",
                        trigger:
                            '.control-buttons .control-button:contains("Quotation/Order")',
                    },
                ];
            }
        }

        class CheckExt extends Check {}

        class ExecuteExt extends Execute {}

        return createTourMethods("ProductScreen", DoExt, CheckExt, ExecuteExt);
    }
);
