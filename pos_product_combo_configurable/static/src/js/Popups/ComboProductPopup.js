/* Copyright 2026 Acysos S.L.
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
 */

odoo.define("pos_product_combo_configurable.ComboProductPopup", function (require) {
    "use strict";

    const AbstractAwaitablePopup = require("point_of_sale.AbstractAwaitablePopup");
    const Registries = require("point_of_sale.Registries");
    const {useState} = owl;

    class ComboProductPopup extends AbstractAwaitablePopup {
        setup() {
            super.setup();
            this._selectionCounter = 1;
            this.state = useState({
                categories: this._prepareCategories(),
            });
        }

        get currentOrder() {
            return this.env.pos.get_order();
        }

        get pricelist() {
            return this.currentOrder
                ? this.currentOrder.pricelist
                : this.env.pos.default_pricelist;
        }

        get showProductImage() {
            return Boolean(this.env.pos.config.view_combo_product_image);
        }

        get basePrice() {
            if (!this.props.product) {
                return 0.0;
            }
            return this.props.product.get_price(this.pricelist, 1, 0);
        }

        _computeGroupExtraPrice(group) {
            let groupExtra = 0.0;
            const selected = group.products
                .filter((p) => p.selected && p.qty > 0)
                .sort((a, b) => (a.selection_seq || 0) - (b.selection_seq || 0));

            let remainingIncluded = group.include_price ? group.default_qty : 0;
            for (const item of selected) {
                const includedQty = Math.min(item.qty, remainingIncluded);
                remainingIncluded -= includedQty;
                const extraQty = Math.max(0, item.qty - includedQty);
                groupExtra += extraQty * item.price;
            }
            return groupExtra;
        }

        get extraPrice() {
            let extra = 0.0;
            for (const categ of this.state.categories) {
                for (const reqGroup of categ.required_groups) {
                    extra += this._computeGroupExtraPrice(reqGroup);
                }
                for (const optGroup of categ.optional_groups) {
                    extra += this._computeGroupExtraPrice(optGroup);
                }
            }
            return extra;
        }

        get totalPrice() {
            return this.basePrice + this.extraPrice;
        }

        getSelectedCount(group) {
            return group.products.reduce(
                (sum, p) => sum + (p.selected && p.qty > 0 ? p.qty : 0),
                0
            );
        }

        isFirstIncludedItem(group, item) {
            if (!group.include_price || !item.selected || item.qty <= 0) {
                return false;
            }
            const selected = group.products
                .filter((p) => p.selected && p.qty > 0)
                .sort((a, b) => (a.selection_seq || 0) - (b.selection_seq || 0));
            return selected.length > 0 && selected[0].product_id === item.product_id;
        }

        getImageUrl(productId) {
            return `/web/image?model=product.product&field=image_128&id=${productId}`;
        }

        _buildInitialLookupMaps() {
            const initialLines = this.props.initial_selected_lines || null;
            const initialByLine = {};
            const initialByKey = {};
            if (initialLines) {
                for (const sel of initialLines) {
                    if (sel.pack_line_id) {
                        initialByLine[`${sel.pack_line_id}_${sel.product_id}`] = sel;
                    }
                    const reqKey = sel.is_required ? "req" : "opt";
                    const key = `${sel.categ_id}_${reqKey}_${sel.product_id}`;
                    initialByKey[key] = sel;
                }
            }
            return {
                hasInitialLines: Boolean(initialLines),
                initialByLine,
                initialByKey,
            };
        }

        _buildProductItem(line, product, existingSel, defaultQty) {
            const isSelected = Boolean(existingSel);
            return {
                pack_line_id: line.id,
                product_id: product.id,
                product_name: product.display_name,
                image_128: product.image_128,
                price: product.get_price(this.pricelist, 1, 0),
                default_qty: defaultQty,
                qty: existingSel ? existingSel.qty : 0,
                selected: isSelected,
                selection_seq: isSelected ? this._selectionCounter++ : 0,
                is_required: Boolean(line.is_required),
                include_price: Boolean(line.include_price),
                categ_id: line.pos_category_id[0],
                categ_name: line.pos_category_id[1],
            };
        }

        _buildPackGroup(line, lookupMaps) {
            const categId = line.pos_category_id[0];
            const noOfItems = Math.max(1, line.no_of_items || 1);
            const defaultQty = Math.min(Math.max(1, line.default_qty || 1), noOfItems);
            const isRequired = Boolean(line.is_required);
            const reqKey = isRequired ? "req" : "opt";
            const productItems = [];
            let hasSelection = false;

            for (const prodId of line.product_ids || []) {
                const product = this.env.pos.db.get_product_by_id(prodId);
                if (product) {
                    const key = `${categId}_${reqKey}_${prodId}`;
                    const existingSel =
                        lookupMaps.initialByLine[`${line.id}_${prodId}`] ||
                        lookupMaps.initialByKey[key];
                    const item = this._buildProductItem(
                        line,
                        product,
                        existingSel,
                        defaultQty
                    );
                    if (item.selected) {
                        hasSelection = true;
                    }
                    productItems.push(item);
                }
            }

            if (
                isRequired &&
                !lookupMaps.hasInitialLines &&
                !hasSelection &&
                productItems.length > 0
            ) {
                productItems[0].selected = true;
                productItems[0].qty = defaultQty;
                productItems[0].selection_seq = this._selectionCounter++;
            }

            return {
                pack_line_id: line.id,
                no_of_items: noOfItems,
                default_qty: defaultQty,
                is_required: isRequired,
                include_price: Boolean(line.include_price),
                products: productItems,
            };
        }

        _prepareCategories() {
            const packLines = this.props.combo_pack_lines || [];
            const lookupMaps = this._buildInitialLookupMaps();
            const categMap = new Map();

            for (const line of packLines) {
                if (line.pos_category_id) {
                    const categId = line.pos_category_id[0];
                    const categName = line.pos_category_id[1];
                    if (!categMap.has(categId)) {
                        categMap.set(categId, {
                            categ_id: categId,
                            categ_name: categName,
                            search_text: "",
                            required_groups: [],
                            optional_groups: [],
                        });
                    }
                    const categEntry = categMap.get(categId);
                    const groupData = this._buildPackGroup(line, lookupMaps);
                    if (groupData.is_required) {
                        categEntry.required_groups.push(groupData);
                    } else {
                        categEntry.optional_groups.push(groupData);
                    }
                }
            }
            return Array.from(categMap.values());
        }

        filterProducts(products, searchText) {
            if (!searchText || !searchText.trim()) {
                return products;
            }
            const query = searchText.trim().toLowerCase();
            return products.filter((item) =>
                item.product_name.toLowerCase().includes(query)
            );
        }

        clearSearch(categ) {
            categ.search_text = "";
        }

        onClickProduct(group, item) {
            if (item.selected) {
                item.selected = false;
                item.qty = 0;
                item.selection_seq = 0;
            } else {
                const totalQty = this.getSelectedCount(group);
                if (totalQty >= group.no_of_items) {
                    if (group.no_of_items === 1) {
                        for (const prod of group.products) {
                            prod.selected = false;
                            prod.qty = 0;
                            prod.selection_seq = 0;
                        }
                    } else {
                        this.showPopup("ErrorPopup", {
                            title: this.env._t("Selection Limit Reached"),
                            body: _.str.sprintf(
                                this.env._t("You can only select %s product(s)."),
                                group.no_of_items
                            ),
                        });
                        return;
                    }
                }
                const currentTotal = this.getSelectedCount(group);
                const remaining = Math.max(1, group.no_of_items - currentTotal);
                item.selected = true;
                item.qty = Math.min(item.default_qty || 1, remaining);
                item.selection_seq = this._selectionCounter++;
            }
        }

        onIncrementQty(group, item, ev) {
            ev.stopPropagation();
            const totalQty = this.getSelectedCount(group);
            if (totalQty >= group.no_of_items) {
                this.showPopup("ErrorPopup", {
                    title: this.env._t("Selection Limit Reached"),
                    body: _.str.sprintf(
                        this.env._t("You can only select %s product(s)."),
                        group.no_of_items
                    ),
                });
                return;
            }
            item.qty = (item.qty || 1) + 1;
        }

        onDecrementQty(item, ev) {
            ev.stopPropagation();
            if (item.qty > 1) {
                item.qty -= 1;
            } else {
                item.qty = 0;
                item.selected = false;
                item.selection_seq = 0;
            }
        }

        async confirm() {
            for (const categ of this.state.categories) {
                for (const reqGroup of categ.required_groups) {
                    if (reqGroup.products.length > 0) {
                        const hasSelected = reqGroup.products.some(
                            (p) => p.selected && p.qty > 0
                        );
                        if (!hasSelected) {
                            await this.showPopup("ErrorPopup", {
                                title: this.env._t("Required Product Missing"),
                                body: _.str.sprintf(
                                    this.env._t(
                                        "Please select at least 1 product in category '%s'."
                                    ),
                                    categ.categ_name
                                ),
                            });
                            return;
                        }
                    }
                }
            }
            return super.confirm();
        }

        getPayload() {
            const selectedItems = [];
            for (const categ of this.state.categories) {
                for (const reqGroup of categ.required_groups) {
                    const selectedReq = reqGroup.products
                        .filter((p) => p.selected && p.qty > 0)
                        .sort(
                            (a, b) => (a.selection_seq || 0) - (b.selection_seq || 0)
                        );
                    for (const reqItem of selectedReq) {
                        selectedItems.push({
                            pack_line_id: reqGroup.pack_line_id,
                            product_id: reqItem.product_id,
                            product_name: reqItem.product_name,
                            qty: reqItem.qty,
                            price: reqItem.price,
                            include_price: reqItem.include_price,
                            is_required: true,
                            categ_id: reqItem.categ_id,
                            categ_name: reqItem.categ_name,
                        });
                    }
                }
                for (const optGroup of categ.optional_groups) {
                    const selectedOpt = optGroup.products
                        .filter((p) => p.selected && p.qty > 0)
                        .sort(
                            (a, b) => (a.selection_seq || 0) - (b.selection_seq || 0)
                        );
                    for (const optItem of selectedOpt) {
                        selectedItems.push({
                            pack_line_id: optGroup.pack_line_id,
                            product_id: optItem.product_id,
                            product_name: optItem.product_name,
                            qty: optItem.qty,
                            price: optItem.price,
                            include_price: optItem.include_price,
                            is_required: false,
                            categ_id: optItem.categ_id,
                            categ_name: optItem.categ_name,
                        });
                    }
                }
            }
            return {
                combo_prod_info: selectedItems,
                combo_extra_price: this.extraPrice,
            };
        }
    }

    ComboProductPopup.template = "ComboProductPopup";
    ComboProductPopup.defaultProps = {
        confirmText: "Ok",
        cancelText: "Cancel",
        title: "Select Combo",
    };

    Registries.Component.add(ComboProductPopup);

    return ComboProductPopup;
});
