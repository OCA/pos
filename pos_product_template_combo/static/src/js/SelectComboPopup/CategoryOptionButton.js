odoo.define("pos_product_template_combo.CategoryOptionButton", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");
    const {useState} = owl.hooks;

    class CategoryOptionButton extends PosComponent {
        constructor(parent, props) {
            super(parent, props);

            this.state = useState({
                name: props.name,
            });
        }
    }
    CategoryOptionButton.template = "CategoryOptionButton";

    Registries.Component.add(CategoryOptionButton);
    return CategoryOptionButton;
});
