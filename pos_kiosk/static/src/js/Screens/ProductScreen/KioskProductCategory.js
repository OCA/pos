odoo.define("pos_kiosk.KioskProductCategory", function (require) {
  "use strict";

  const PosComponent = require("point_of_sale.PosComponent");
  const Registries = require("point_of_sale.Registries");
  const {useListener} = require("web.custom_hooks");

  class KioskProductCategory extends PosComponent {
    constructor() {
      super(...arguments);
      this.categoryID = false;
      this.categoriesList = Object.values(this.env.pos.db.category_by_id).filter(category => category.parent_id === false);
      this.selectedCategoryId = this.env.pos.get("selectedCategoryId");
    }

    mounted() {
      this.env.pos.on('change:selectedCategoryId', this.render, this);
    }

    willUnmount() {
        this.env.pos.off('change:selectedCategoryId', null, this);
    }

    // setCategory(categoryID) {
    //   this.categoryID = categoryID;
    //   this.env.pos.set("selectedCategoryId", categoryID);
    //   this.subCategoriesList = [];

    //   // for (const key in this.env.pos.db.category_by_id) {
    //   //     this.productList = [];
    //   //     if (this.env.pos.db.category_by_id.hasOwnProperty(key)) {
    //   //         const sub_category_id = this.env.pos.db.category_by_id[key];
    //   //         if (
    //   //             sub_category_id.parent_id &&
    //   //             sub_category_id.parent_id[0] === categoryID
    //   //         ) {
    //   //             for (const key in this.env.pos.db.product_by_id) {
    //   //                 if (this.env.pos.db.product_by_id.hasOwnProperty(key)) {
    //   //                     const value = this.env.pos.db.product_by_id[key];
    //   //                     if (value.pos_categ_id[0] === sub_category_id.id) {
    //   //                         this.productList.push(value);
    //   //                     }
    //   //                 }
    //   //             }
    //   //             this.subCategoriesList.push({
    //   //                 id: sub_category_id.id,
    //   //                 name: sub_category_id.name,
    //   //                 productList: this.productList,
    //   //             });
    //   //         }
    //   //     }
    //   // }
    //   this.render();
    //   this.trigger("click-category");
    // }

    set selectedCategoryId(categoryID) {
      this.categoryID = categoryID;
    }

    get selectedCategoryId() {
      return this.env.pos.get("selectedCategoryId");
    }

    getCategoryImage(categoryID) {
      const { id, write_date } = this.env.pos.db.get_category_by_id(categoryID);
      return `/web/image?model=pos.category&field=image_128&id=${id}&write_date=${write_date}&unique=1`;
    }
  }

  KioskProductCategory.template = "KioskProductCategory";

  Registries.Component.add(KioskProductCategory);

  return KioskProductCategory;
  
});