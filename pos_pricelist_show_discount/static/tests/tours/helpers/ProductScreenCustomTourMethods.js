odoo.define(
    "pos_pricelist_show_discount.tour.ProductScreenCustomTourMethods",
    function (require) {
        "use strict";

        const {createTourMethods} = require("point_of_sale.tour.utils");

        class Do {}

        class Check {
            findInProductInfo(text) {
                return [
                    {
                        content: `discount original price is shown`,
                        trigger: `li.info:contains('${text}')`,
                    },
                ];
            }
        }

        class Execute {}

        return createTourMethods("ProductScreenCustom", Do, Check, Execute);
    }
);
