/******************************************************************************
*    Point Of Sale - Dynamic Price for POS Odoo
*    Copyright (C) 2014 Taktik (http://www.taktik.be)
*    @author Adil Houmadi <ah@taktik.be>
*
*    This program is free software: you can redistribute it and/or modify
*    it under the terms of the GNU Affero General Public License as
*    published by the Free Software Foundation, either version 3 of the
*    License, or (at your option) any later version.
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU Affero General Public License for more details.
*    You should have received a copy of the GNU Affero General Public License
*    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
******************************************************************************/
function pdp_db(instance, module) {

    module.PosDB = module.PosDB.extend({
        init: function (options) {
            options = options || {};
            this._super(options);
            this.default_pricelist_id = 0;
            this.pricelist_by_id = {};
            this.pricelist_version_by_id = {};
            this.pricelist_item_by_id = {};
            this.pricelist_item_sorted = [];
            this.product_catrgory_by_id = {};
            this.product_catrgory_children = {};
            this.product_catrgory_ancestors = {};
            this.product_price_type_by_id = {};
            this.supplierinfo_by_id = {};
            this.pricelist_partnerinfo_by_id = {};
            this.fiscal_position_tax_by_id = {};
        },
        add_fiscal_position_taxes: function (fiscal_position_taxes) {
            if (!(fiscal_position_taxes instanceof Array)) {
                fiscal_position_taxes = [fiscal_position_taxes];
            }
            for (var i = 0, len = fiscal_position_taxes.length; i < len; i++) {
                var fiscal_position_tax = fiscal_position_taxes[i];
                this.fiscal_position_tax_by_id[fiscal_position_tax.id] = fiscal_position_tax;
            }
        },
        add_pricelist_partnerinfo: function (pricelist_partnerinfos) {
            if (!(pricelist_partnerinfos instanceof Array)) {
                pricelist_partnerinfos = [pricelist_partnerinfos];
            }
            for (var i = 0, len = pricelist_partnerinfos.length; i < len; i++) {
                var partner_info = pricelist_partnerinfos[i];
                this.pricelist_partnerinfo_by_id[partner_info.id] = partner_info;
            }
        },
        add_supplierinfo: function (supplierinfos) {
            if (!(supplierinfos instanceof Array)) {
                supplierinfos = [supplierinfos];
            }
            for (var i = 0, len = supplierinfos.length; i < len; i++) {
                var supplier_info = supplierinfos[i];
                this.supplierinfo_by_id[supplier_info.id] = supplier_info;
            }
        },
        add_default_pricelist: function (res_id) {
            if (res_id && res_id.length) {
                this.default_pricelist_id = res_id[0].res_id;
            }
        },
        add_pricelists: function (pricelists) {
            if (!(pricelists instanceof Array)) {
                pricelists = [pricelists];
            }
            for (var i = 0, len = pricelists.length; i < len; i++) {
                var pricelist = pricelists[i];
                this.pricelist_by_id[pricelist.id] = pricelist;
            }
        },
        add_pricelist_versions: function (versions) {
            if (!(versions instanceof Array)) {
                versions = [versions];
            }
            for (var i = 0, len = versions.length; i < len; i++) {
                var version = versions[i];
                this.pricelist_version_by_id[version.id] = version;
            }
        },
        add_pricelist_items: function (items) {
            if (!(items instanceof Array)) {
                items = [items];
            }
            for (var i = 0, len = items.length; i < len; i++) {
                var item = items[i];
                this.pricelist_item_by_id[item.id] = item;
            }
            this.pricelist_item_sorted = this._items_sorted();
        },
        add_price_types: function (price_types) {
            if (!(price_types instanceof Array)) {
                price_types = [price_types];
            }
            for (var i = 0, len = price_types.length; i < len; i++) {
                var ptype = price_types[i];
                this.product_price_type_by_id[ptype.id] = ptype;
            }
        },
        add_product_categories: function (categories) {
            var self = this;
            if (!(categories instanceof Array)) {
                categories = [categories];
            }
            for (var i = 0, len = categories.length; i < len; i++) {
                var category = categories[i];
                this.product_catrgory_by_id[category.id] = category;
                this.product_catrgory_children[category.id] = category.child_id
            }
            function make_ancestors(cat_id, ancestors) {
                self.product_catrgory_ancestors[cat_id] = ancestors;
                ancestors = ancestors.slice(0);
                ancestors.push(cat_id);
                var children = self.product_catrgory_children[cat_id] || [];
                for (var i = 0, len = children.length; i < len; i++) {
                    make_ancestors(children[i], ancestors);
                }
            }
            if (categories.length) {
                var cat = categories[0];
                make_ancestors(cat.id, cat.parent_id === false ? [] : [cat.parent_id])
            }
        },
        _items_sorted: function () {
            var items = this.pricelist_item_by_id;
            var list = [];
            for (var key in items) {
                list.push(items[key]);
            }
            list.sort(function (a, b) {
                if (a.sequence < b.sequence) return -1;
                if (a.sequence > b.sequence) return 1;
                if (a.min_quantity > b.min_quantity) return -1;
                if (a.min_quantity < b.min_quantity) return 1;
                return 0;
            });
            return list;
        },
        find_taxes_by_fiscal_position_id: function (fiscal_position_id) {
            var taxes = [];
            for (var id in this.fiscal_position_tax_by_id) {
                var tax = this.fiscal_position_tax_by_id[id];
                if (tax && tax.position_id && tax.position_id[0] == fiscal_position_id) {
                    taxes.push(tax);
                }
            }
            return taxes;
        }
    })
}