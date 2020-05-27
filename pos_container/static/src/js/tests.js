odoo.define('pos_container.tour.tare', function (require) {
    "use strict";

    var Tour = require('web_tour.tour');

    function click_numpad(num) {
        return {
            content: "click on numpad button '" + num + "'",
            trigger: ".input-button.number-char:contains('"+num+"')"
        }
    }

    function scan(barcode) {
        return {
            content: "Scanning barcode " + barcode,
            trigger: "input.ean",
            run: "text " + barcode
        }
    }

    function confirm_scan() {
        return {
            content: "Confirm barcode",
            trigger: ".button.barcode",
        }
    }

    function set_weight(weight) {
        return {
            content: "Setting weight " + weight,
            trigger: "input.weight",
            run: "text " + weight
        }
    }

    function confirm_weight() {
        return {
            content: "Confirm weight",
            trigger: ".button.set_weight",
        }
    }

    function check_selected_orderline(message, check) {
        return {
            content: message,
            trigger: ".orderline.selected " + check,
            run: function () {}, // it's a check
        }
    }


    var steps = [{
        content: 'waiting for loading to finish',
        trigger: '.o_main_content:has(.loader:hidden)',
        run: function () {},
    },
    scan('0499999999998'),
    confirm_scan(),
    set_weight(0.1),
    confirm_weight(),
    {
        content: "Click on save",
        trigger: ".add-container",
    },
    // Test a second time with a custom name
    scan('0499999999981'),
    confirm_scan(),
    set_weight(0.2),
    confirm_weight(),
    {
        content: "Set a custom name",
        trigger:"input.container-name",
        run:"text TOTO",
    }, {
        content: "Click on save",
        trigger: ".add-container",
    },
    // Scan du premier contenant 
    scan('0499999999998'),
    confirm_scan(),
    check_selected_orderline("Check: empty container in the orderline", ".product-name:contains('Container without product')"),
    check_selected_orderline("Check: the name is 'Container'", ".info:contains('Container')"),
    check_selected_orderline("Check: the quantity is 0", ".info em:contains('0.000')"),
    {
        content: "select product",
        trigger: ".product:contains('Whiteboard Pen')", //UoM = kg
    },
    set_weight(0.2),
    confirm_weight(),
    {
        content: "validate weight",
        trigger: ".buy-product",
    },
    check_selected_orderline("Check: the name is 'Container'", ".info:contains('Container')"),
    check_selected_orderline("Check: orderline in AUTO tare mode", ".pos-right-align:contains('AUTO')"),
    check_selected_orderline("Check: orderline's product is the Pen", ".product-name:contains('Whiteboard Pen')"),
    check_selected_orderline("Check: the quantity is the tared weight", ".info:contains('0.200')"),
    {
        content: "click container button",
        trigger: ".control-button.o_container_button",
    }, {
        content: "Search Container TOTO",
        trigger: ".searchbox input",
        run: "text TOTO",
    }, {
        content: "Select container TOTO",
        trigger: ".container-line:contains('TOTO')", 
    }, {
        content: "Click delete",
        trigger: ".button.delete-container",
    }, {
        content: "Click cancel",
        trigger: ".button.cancel",
    }, {
        content: "Click delete",
        trigger: ".button.delete-container",
    }, {
        content: "Click confirm",
        trigger: ".button.confirm",
    }, {
        content: "Search by barcode",
        trigger: ".searchbox input",
        run: "text 0499999999998",
    }, {
        content: "select the searched container",
        trigger: ".container-line:contains('Container')", 
    }, {
        content: "confirm selection",
        trigger: ".containerlist-screen .next",
    }, {
        content: "remove orderline quantity",
        trigger: ".input-button.numpad-backspace",
    }, {
        content: "delete orderline",
        trigger: ".input-button.numpad-backspace",
    }, {
        content: "select another product",
        trigger: ".product:contains('Desk Organizer')", //UoM = kg
    },
    set_weight(0.5),
    confirm_weight(),
    {
        content: "confirm purchase",
        trigger: ".buy-product",
    }, {
        content: "switch numpad to tare mode",
        trigger: ".control-button.o_tare_button",
    },
    click_numpad(0),
    click_numpad('.'),
    click_numpad(2),
    check_selected_orderline("Check: orderline in MAN tare mode", ".pos-right-align:contains('MAN')"),
    check_selected_orderline("Check: orderline's product is the Organizer", ".product-name:contains('Desk Organizer')"),
    check_selected_orderline("Check: the quantity is the tared weight", ".info:contains('0.300')"),
    {
        content: "click orderline auto",
        trigger: ".orderline .pos-right-align:contains('AUTO')",
    }, {
        content: "switch numpad to tare mode",
        trigger: ".control-button.o_tare_button",
    },
    click_numpad(0),
    click_numpad('.'),
    click_numpad(2),
    check_selected_orderline("Check: orderline in MAN tare mode", ".pos-right-align:contains('MAN')"),
    check_selected_orderline("Check: orderline's product is the Pen", ".product-name:contains('Whiteboard Pen')"),
    check_selected_orderline("Check: the quantity is the tared weight", ".info em:contains('0.100')"),
    {
        content: "switch numpad to quantity mode",
        trigger: ".mode-button[data-mode='quantity']",
    },
    click_numpad(0),
    click_numpad('.'),
    click_numpad(6),
    check_selected_orderline("Check: orderline in MAN tare mode", ".pos-right-align:contains('MAN')"),
    check_selected_orderline("Check: orderline's product is the Pen", ".product-name:contains('Whiteboard Pen')"),
    check_selected_orderline("Check: the quantity is 0.6", ".info em:contains('0.600')"),
    check_selected_orderline("Check: the tare is unchanged", ".info:contains('0.2')"),
    check_selected_orderline("Check: the gross weight is the tare + the quantity", ".info:contains('Gross : 0.8 kg')"),
    {
        content: "Add a unit product",
        trigger: ".product:contains('Large Cabinet')",
    }, {
        content: "click discount",
        trigger: ".mode-button[data-mode='discount']",
    },
    click_numpad(1),
    click_numpad(0),
    check_selected_orderline("Check: orderline in MAN tare mode", ".pos-right-align:contains('MAN')"),
    check_selected_orderline("Check: the undiscounted price is still 320", ".info:contains('320.00')"),
    {
        content: "Add a unit product",
        trigger: ".product:contains('Large Cabinet')",
    }, {
        content: "click price change",
        trigger: ".mode-button[data-mode='price']",
    },
    click_numpad(2),
    click_numpad(0),
    click_numpad(0),
    check_selected_orderline("Check: orderline in MAN tare mode", ".pos-right-align:contains('MAN')"),
    // Ajouter une ligne en AUTO
    scan('0499999999998'),
    confirm_scan(),
    {
        content: "select product",
        trigger: ".product:contains('Whiteboard Pen')", //UoM = kg
    },
    set_weight(0.3),
    confirm_weight(),
    {
        content: "validate weight",
        trigger: ".buy-product",
    },
    {
        content: "pay",
        trigger: ".button.pay",
    },
    click_numpad(2),
    click_numpad(0),
    click_numpad(0),
    click_numpad(0),
    {
        content: "validate",
        trigger: ".button.next",
    }];


    var autre = [{
        content: "relancer POS",
        trigger: "",
    }, {
        content: "click commandes",
        trigger: "",
    }, {
        content: "sélectionner dernière commande",
        trigger: "",
    }, {
        content: "click reprint",
        trigger: "",
    }];

    Tour.register('pos_container', { test: true, url: '/pos/web' }, steps);
});
