/* Copyright (C) 2020-Today Akretion (https://www.akretion.com)
    @author Raphaël Reverdy (https://www.akretion.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/
odoo.define("pos_remove_pos_category.CategoryButton", function (require) {
    "use strict";

    const CategoryButton = require("point_of_sale.CategoryButton");
    const Registries = require("point_of_sale.Registries");

    var PRPCCategoryButton = (CategoryButton) =>
        class PRPCCategoryButton extends CategoryButton {
            get imageUrl() {
                const category = this.props.category;
                return `/web/image?model=product.category&field=image_128&id=${category.id}&write_date=${category.write_date}&unique=1`;
            }
        };

    Registries.Component.extend(CategoryButton, PRPCCategoryButton);

    return PRPCCategoryButton;
});
