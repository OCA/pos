odoo.define("pos_product_warning.ProductWarningPopup", function (require) {
    const AbstractAwaitablePopup = require("point_of_sale.AbstractAwaitablePopup");
    const Registries = require("point_of_sale.Registries");

    class ProductWarningPopup extends AbstractAwaitablePopup {}
    ProductWarningPopup.template = "ProductWarningPopup";

    Registries.Component.add(ProductWarningPopup);

    return ProductWarningPopup;
});
