/* Copyright (C) 2020-Today Akretion (https://www.akretion.com)
    @author Raphaël Reverdy (https://www.akretion.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

odoo.define("pos_remove_pos_category.Chrome", function (require) {
    "use strict";

    var Chrome = require("point_of_sale.Chrome");
    var Registries = require("point_of_sale.Registries");

    var PRPCChrome = (Chrome) =>
        class PRPCChrome extends Chrome {
            _preloadImages() {
                // Don't preload categories images
                // because _preloadImage can't be overriden properly
                // and we don't want to mess with images loading
                var backup = this.env.pos.db.category_by_id;
                this.env.pos.db.category_by_id = {};
                super._preloadImages();
                this.env.pos.db.category_by_id = backup;
            }
        };

    Registries.Component.extend(Chrome, PRPCChrome);
    return PRPCChrome;
});
