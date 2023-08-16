odoo.define("pos_kiosk.BannerScreen", function (require) {
    "use strict";
    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class BannerScreen extends PosComponent {
        constructor() {
            super(...arguments);
        }

        clickNextScreen() {
            this.showScreen("MainScreen");
        }

        get bannerURL() {
            const pos_config = this.env.pos.config;
            return `/web/image?model=pos.config&field=banner_image&id=${pos_config.id}&write_date=${pos_config.write_date}&unique=1`
        }
    }

    BannerScreen.template = "BannerScreen";

    Registries.Component.add(BannerScreen);

    return BannerScreen;
});
