odoo.define("pos_product_template_combo.CategoryQtyOptionButton", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");
    const {useState} = owl.hooks;

    class CategoryQtyOptionButton extends PosComponent {
        constructor(parent, props) {
            super(parent, props);
            this.state = useState({
                option: props.option,
            });
        }
    }
    CategoryQtyOptionButton.template = "CategoryQtyOptionButton";

    Registries.Component.add(CategoryQtyOptionButton);
    return CategoryQtyOptionButton;
});
