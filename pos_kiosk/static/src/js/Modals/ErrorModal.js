odoo.define("point_of_sale.ErrorModal", function (require) {
    "use strict";

    const AbstractAwaitablePopup = require("point_of_sale.AbstractAwaitablePopup");
    const Registries = require("point_of_sale.Registries");

    class ErrorPopup extends AbstractAwaitablePopup {}
    ErrorPopup.template = "ErrorModal";
    ErrorPopup.defaultProps = {
        confirmText: "Ok",
        cancelText: "Cancel",
        title: "Error",
        body: "",
    };

    Registries.Component.add(ErrorPopup);

    return ErrorPopup;
});
