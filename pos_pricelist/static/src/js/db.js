/******************************************************************************
*    Point Of Sale - Pricelist for POS Odoo
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
function pos_pricelist_db(instance, module) {

    module.PosDB = module.PosDB.extend({
        init: function (options) {
            options = options || {};
            this._super(options);
            this.default_pricelist_id = 0;
            this.pricelist_by_id = {};
            this.pricelist_version_by_id = {};
            this.pricelist_item_by_id = {};
            this.pricelist_item_sorted = [];
            this.product_category_by_id = {};
            this.product_category_children = {};
            this.product_category_ancestors = {};
            this.product_price_type_by_id = {};
            this.supplierinfo_by_id = {};
            this.pricelist_partnerinfo_by_id = {};
            this.fiscal_position_tax_by_id = {};
        },
        add_fiscal_position_taxes: function (fiscal_position_taxes) {
            if (!(fiscal_position_taxes instanceof Array)) {
                fiscal_position_taxes = [fiscal_position_taxes];
            }
            var fiscal_position_tax;
            while (fiscal_position_tax = fiscal_position_taxes.pop()) {
                this.fiscal_position_tax_by_id[fiscal_position_tax.id] = fiscal_position_tax;
            }
        },
        add_pricelist_partnerinfo: function (pricelist_partnerinfos) {
            if (!(pricelist_partnerinfos instanceof Array)) {
                pricelist_partnerinfos = [pricelist_partnerinfos];
            }
            var partner_info;
            while (partner_info = pricelist_partnerinfos.pop()) {
                this.pricelist_partnerinfo_by_id[partner_info.id] = partner_info;
            }
        },
        add_supplierinfo: function (supplierinfos) {
            if (!(supplierinfos instanceof Array)) {
                supplierinfos = [supplierinfos];
            }
            var supplier_info;
            while (supplier_info = supplierinfos.pop()) {
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
            var pricelist;
            while (pricelist = pricelists.pop()) {
                this.pricelist_by_id[pricelist.id] = pricelist;
            }
        },
        add_pricelist_versions: function (versions) {
            if (!(versions instanceof Array)) {
                versions = [versions];
            }
            var version;
            while (version = versions.pop()) {
                this.pricelist_version_by_id[version.id] = version;
            }
        },
        add_pricelist_items: function (items) {
            if (!(items instanceof Array)) {
                items = [items];
            }
            var item;
            while (item = items.pop()) {
                this.pricelist_item_by_id[item.id] = item;
            }
            this.pricelist_item_sorted = this._items_sorted();
        },
        add_price_types: function (price_types) {
            if (!(price_types instanceof Array)) {
                price_types = [price_types];
            }
            var ptype;
            while (ptype = price_types.pop()) {
                this.product_price_type_by_id[ptype.id] = ptype;
            }
        },
        add_product_categories: function (categories) {
            if (!(categories instanceof Array)) {
                categories = [categories];
            }
            var category;
            while (category = categories.pop()) {
                this.product_category_by_id[category.id] = category;
                this.product_category_children[category.id] = category.child_id
            }
            this._make_ancestors();
        },
        _make_ancestors: function () {
            var category, ancestors;
            for (var id in this.product_category_by_id) {
                category = this.product_category_by_id[id];
                ancestors = [];
                while (category.parent_id) {
                    ancestors.push(category.parent_id[0]);
                    category = category.parent_id ? this.product_category_by_id[category.parent_id[0]] : false;
                }
                this.product_category_ancestors[parseInt(id)] = ancestors;
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
