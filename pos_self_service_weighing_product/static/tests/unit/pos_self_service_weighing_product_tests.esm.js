/** @odoo-module **/
// SPDX-FileCopyrightText: 2025 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import BarcodeParser from "barcodes.BarcodeParser";
import BarcodeReader from "point_of_sale.BarcodeReader";
import makePosTestEnv from "point_of_sale.test_env";

function create_product({id, name, price, uom, tax_id, barcode}) {
    return {
        id: id,
        display_name: name,
        lst_price: price,
        taxes_id: [tax_id],
        barcode: barcode,
        to_weight: true,
        uom_id: [uom.id, uom.name],
        product_tmpl_id: [id, name],
        categ: {
            id: 1,
            name: "All",
            parent_id: false,
            parent: null,
        },
    };
}

async function test_price_barcode_label_with_context(
    context,
    assert,
    product,
    weight,
    price,
    barcode_label
) {
    context.print_barcode_label_calls.length = 0;
    await context.pos.print_product_barcode_label(product, weight);
    assert.deepEqual(context.print_barcode_label_calls[0], barcode_label);
    const current_order = context.pos.get_order();
    current_order.add_product(product, {quantity: weight});
    const orderline = current_order.get_last_orderline();
    assert.strictEqual(
        context.pos.format_currency_no_symbol(
            orderline.get_display_price(),
            "Product Price"
        ),
        price
    );
    current_order.remove_orderline(orderline);
}

QUnit.module("Self-Service Product Weighing", function (hooks) {
    hooks.before(async function () {
        this.env = makePosTestEnv();
        this.pos = this.env.pos;
        this.pos.env = this.env;
        const tax_15_excl = {
            id: 1000,
            name: "Tax 15% excl",
            price_include: false,
            include_base_amount: false,
            is_base_affected: true,
            amount_type: "percent",
            children_tax_ids: [],
            amount: 15,
        };
        const tax_15_incl = {
            id: 1001,
            name: "Tax 15% incl",
            price_include: true,
            include_base_amount: true,
            is_base_affected: true,
            amount_type: "percent",
            children_tax_ids: [],
            amount: 15,
        };
        this.pos.taxes.push(tax_15_excl, tax_15_incl);
        this.pos.taxes_by_id[tax_15_excl.id] = tax_15_excl;
        this.pos.taxes_by_id[tax_15_incl.id] = tax_15_incl;
        const kg_uom = this.pos.find_uom_by_name("kg");
        const product_1 = create_product({
            id: 2000,
            name: "weighable product 1",
            price: 0.1,
            uom: kg_uom,
            tax_id: 1000,
            barcode: "2302000000003",
        });
        const product_2 = create_product({
            id: 2001,
            name: "weighable product 2",
            price: 0.115,
            uom: kg_uom,
            tax_id: 1001,
            barcode: "2302001000002",
        });
        const product_3 = create_product({
            id: 2002,
            name: "weighable product 3",
            price: 1,
            uom: kg_uom,
            tax_id: 1000,
            barcode: "2302002000001",
        });
        const product_4 = create_product({
            id: 2003,
            name: "weighable product 4",
            price: 1.15,
            uom: kg_uom,
            tax_id: 1001,
            barcode: "2302003000000",
        });
        const product_5 = create_product({
            id: 2004,
            name: "weighable product 5",
            price: 0.1,
            uom: kg_uom,
            tax_id: 1000,
            barcode: "2102004000005",
        });
        const g_uom = this.pos.find_uom_by_name("g");
        const product_6 = create_product({
            id: 2005,
            name: "weighable product 6",
            price: 0.1,
            uom: g_uom,
            tax_id: 1000,
            barcode: "2302005000008",
        });
        const product_7 = create_product({
            id: 2006,
            name: "weighable product 7",
            price: 0.1,
            uom: g_uom,
            tax_id: 1000,
            barcode: "2102006000003",
        });
        this.pos._loadProductProduct([
            product_1,
            product_2,
            product_3,
            product_4,
            product_5,
            product_6,
            product_7,
        ]);
        this.product_1 = this.pos.db.product_by_id[product_1.id];
        this.product_2 = this.pos.db.product_by_id[product_2.id];
        this.product_3 = this.pos.db.product_by_id[product_3.id];
        this.product_4 = this.pos.db.product_by_id[product_4.id];
        this.product_5 = this.pos.db.product_by_id[product_5.id];
        this.product_6 = this.pos.db.product_by_id[product_6.id];
        this.product_7 = this.pos.db.product_by_id[product_7.id];
        this.env.barcode_reader = new BarcodeReader({
            env: this.env,
            proxy: this.env.proxy,
        });
        const barcode_parser = new BarcodeParser({
            nomenclature_id: this.env.pos.company.nomenclature_id,
        });
        this.env.barcode_reader.set_barcode_parser(barcode_parser);
        await barcode_parser.loaded;
        this.pos.init_barcode_generators();
        this._original_print_barcode_label = this.pos.print_barcode_label;
        this.print_barcode_label_calls = [];
        this.pos.print_barcode_label = async function (title, barcode, value_str) {
            const call = {title, barcode, value_str};
            this.print_barcode_label_calls.push(call);
        }.bind(this);
    });

    hooks.after(async function () {
        this.pos.print_product_barcode_label = this._original_print_barcode_label;
    });

    hooks.beforeEach(async function () {
        this._original_iface_tax_included = this.pos.config.iface_tax_included;
        this.print_barcode_label_calls.length = 0;
    });

    hooks.afterEach(async function () {
        this.pos.config.iface_tax_included = this._original_iface_tax_included;
    });

    QUnit.test("should handle taxes correctly", async function (assert) {
        await this.pos.print_product_barcode_label(this.product_1, 1);
        // The barcode should encode the price without taxes.
        assert.deepEqual(this.print_barcode_label_calls[0], {
            title: "weighable product 1",
            barcode: "2302000000102",
            value_str: "$ 0.12 (1.00 kg)",
        });
        await this.pos.print_product_barcode_label(this.product_2, 1);
        // The barcode should encode the price with taxes.
        assert.deepEqual(this.print_barcode_label_calls[1], {
            title: "weighable product 2",
            barcode: "2302001000125",
            value_str: "$ 0.12 (1.00 kg)",
        });
        await this.pos.print_product_barcode_label(this.product_3, 1);
        // The barcode should encode the price without taxes.
        assert.deepEqual(this.print_barcode_label_calls[2], {
            title: "weighable product 3",
            barcode: "2302002001008",
            value_str: "$ 1.15 (1.00 kg)",
        });
        await this.pos.print_product_barcode_label(this.product_4, 1);
        // The barcode should encode the price with taxes.
        assert.deepEqual(this.print_barcode_label_calls[3], {
            title: "weighable product 4",
            barcode: "2302003001151",
            value_str: "$ 1.15 (1.00 kg)",
        });
    });

    QUnit.test(
        "should round values in the same way as order lines (with taxes included)",
        async function (assert) {
            const test_price_barcode_label = async (
                product,
                weight,
                price,
                barcode_label
            ) =>
                test_price_barcode_label_with_context(
                    this,
                    assert,
                    product,
                    weight,
                    price,
                    barcode_label
                );
            await test_price_barcode_label(this.product_1, 2.944, "0.33", {
                title: "weighable product 1",
                barcode: "2302000000294",
                value_str: "$ 0.33 (2.94 kg)",
            });
            await test_price_barcode_label(this.product_1, 2.945, "0.35", {
                title: "weighable product 1",
                barcode: "2302000000300",
                value_str: "$ 0.35 (2.95 kg)",
            });
            await test_price_barcode_label(this.product_2, 2.874, "0.34", {
                title: "weighable product 2",
                barcode: "2302001000347",
                value_str: "$ 0.34 (2.87 kg)",
            });
            await test_price_barcode_label(this.product_2, 2.875, "0.35", {
                title: "weighable product 2",
                barcode: "2302001000354",
                value_str: "$ 0.35 (2.88 kg)",
            });
            await test_price_barcode_label(this.product_3, 2.944, "3.38", {
                title: "weighable product 3",
                barcode: "2302002002944",
                value_str: "$ 3.38 (2.94 kg)",
            });
            await test_price_barcode_label(this.product_3, 2.945, "3.39", {
                title: "weighable product 3",
                barcode: "2302002002951",
                value_str: "$ 3.39 (2.95 kg)",
            });
            await test_price_barcode_label(this.product_4, 2.944, "3.38", {
                title: "weighable product 4",
                barcode: "2302003003384",
                value_str: "$ 3.38 (2.94 kg)",
            });
            await test_price_barcode_label(this.product_4, 2.945, "3.39", {
                title: "weighable product 4",
                barcode: "2302003003391",
                value_str: "$ 3.39 (2.95 kg)",
            });
        }
    );

    QUnit.test(
        "should round values in the same way as order lines (with taxes excluded)",
        async function (assert) {
            this.pos.config.iface_tax_included = "subtotal";
            const test_price_barcode_label = async (
                product,
                weight,
                price,
                barcode_label
            ) =>
                test_price_barcode_label_with_context(
                    this,
                    assert,
                    product,
                    weight,
                    price,
                    barcode_label
                );
            await test_price_barcode_label(this.product_1, 2.944, "0.29", {
                title: "weighable product 1",
                barcode: "2302000000294",
                value_str: "$ 0.29 (2.94 kg)",
            });
            await test_price_barcode_label(this.product_1, 2.945, "0.30", {
                title: "weighable product 1",
                barcode: "2302000000300",
                value_str: "$ 0.30 (2.95 kg)",
            });
            await test_price_barcode_label(this.product_2, 2.874, "0.30", {
                title: "weighable product 2",
                barcode: "2302001000347",
                value_str: "$ 0.30 (2.87 kg)",
            });
            await test_price_barcode_label(this.product_2, 2.875, "0.30", {
                title: "weighable product 2",
                barcode: "2302001000354",
                value_str: "$ 0.30 (2.88 kg)",
            });
            await test_price_barcode_label(this.product_3, 2.944, "2.94", {
                title: "weighable product 3",
                barcode: "2302002002944",
                value_str: "$ 2.94 (2.94 kg)",
            });
            await test_price_barcode_label(this.product_3, 2.945, "2.95", {
                title: "weighable product 3",
                barcode: "2302002002951",
                value_str: "$ 2.95 (2.95 kg)",
            });
            await test_price_barcode_label(this.product_4, 2.944, "2.94", {
                title: "weighable product 4",
                barcode: "2302003003384",
                value_str: "$ 2.94 (2.94 kg)",
            });
            await test_price_barcode_label(this.product_4, 2.945, "2.95", {
                title: "weighable product 4",
                barcode: "2302003003391",
                value_str: "$ 2.95 (2.95 kg)",
            });
        }
    );

    QUnit.test(
        "should round the weight according to the barcode precision",
        async function (assert) {
            await this.pos.print_product_barcode_label(this.product_5, 2.9445);
            assert.deepEqual(this.print_barcode_label_calls[0], {
                title: "weighable product 5",
                barcode: "2102004029457",
                value_str: "2.945 kg",
            });
        }
    );

    QUnit.test("should convert units of measure correctly", async function (assert) {
        await this.pos.print_product_barcode_label(this.product_6, 0.1);
        assert.deepEqual(this.print_barcode_label_calls[0], {
            title: "weighable product 6",
            barcode: "2302005010007",
            value_str: "$ 11.50 (100.00 g)",
        });
        await this.pos.print_product_barcode_label(this.product_7, 0.1);
        assert.deepEqual(this.print_barcode_label_calls[1], {
            title: "weighable product 7",
            barcode: "2102006001000",
            value_str: "100 g",
        });
    });
});
