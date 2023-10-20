odoo.define("pos_kiosk.WelcomeScreen", function (require) {
    "use strict";
    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class WelcomeScreen extends PosComponent {
        navigateToProductScreen() {
            this.showScreen("KioskProductScreen");
        }

        get bannerURL() {
            const {id, write_date} = this.env.pos.config;
            return `/web/image?model=pos.config&field=banner_image&id=${id}&write_date=${write_date}&unique=1`;
        }
    }

    WelcomeScreen.template = "WelcomeScreen";

    Registries.Component.add(WelcomeScreen);

    return WelcomeScreen;
});
