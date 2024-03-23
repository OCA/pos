odoo.define("pos_kiosk.KioskHeader", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class KioskHeader extends PosComponent {
        syncOrders() {
            this.env.pos.push_orders(null, {show_error: true});
            this.render();
        }

        get topBannerLogo() {
            const {id, write_date} = this.env.pos.config;
            return `/web/image?model=pos.config&field=top_banner_image&id=${id}&write_date=${write_date}&unique=1`;
        }

        get blockedOrders() {
            if (this.env.pos.db.cache.orders) {
                return this.env.pos.db.cache.orders.length > 0;
            }
        }

        get blockedOrdersNumber() {
            return this.env.pos.db.cache.orders.length;
        }

        get logoHeaderURL() {
            const {id, write_date} = this.env.pos.config;
            return `/web/image?model=pos.config&field=logo_image&id=${id}&write_date=${write_date}&unique=1`;
        }
    }

    KioskHeader.template = "KioskHeader";

    Registries.Component.add(KioskHeader);

    return KioskHeader;
});
