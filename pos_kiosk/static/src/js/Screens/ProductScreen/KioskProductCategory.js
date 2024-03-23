odoo.define("pos_kiosk.KioskProductCategory", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class KioskProductCategory extends PosComponent {
        constructor() {
            super(...arguments);
            this.categoryID = false;
            this.categoriesList = Object.values(this.env.pos.db.category_by_id).filter(
                (category) => category.parent_id === false
            );
            this.selectedCategoryId = this.env.pos.get("selectedCategoryId");
        }

        mounted() {
            this.env.pos.on("change:selectedCategoryId", this.render, this);
        }

        willUnmount() {
            this.env.pos.off("change:selectedCategoryId", null, this);
        }

        set selectedCategoryId(categoryID) {
            this.categoryID = categoryID;
        }

        get selectedCategoryId() {
            return this.env.pos.get("selectedCategoryId");
        }

        getCategoryImage(categoryID) {
            const {id, write_date} = this.env.pos.db.get_category_by_id(categoryID);
            return `/web/image?model=pos.category&field=image_128&id=${id}&write_date=${write_date}&unique=1`;
        }
    }

    KioskProductCategory.template = "KioskProductCategory";

    Registries.Component.add(KioskProductCategory);

    return KioskProductCategory;
});
