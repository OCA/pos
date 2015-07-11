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
(function () {
    'use strict';

    openerp.Tour.register({
        id: 'pos_pricelist_order',
        name: 'Complete a order trough the Front-End using POS Pricelist',
        path: '/web#model=pos.session.opening&action=point_of_sale.action_pos_session_opening',
        mode: 'test',
        steps: [
            {
                wait: 2000,
                title: 'Wait for screen to be ready'
            },
            {
                wait: 2000,
                title: 'Load the Session',
                waitNot: '.oe_loading:visible',
                element: 'span:contains("Resume Session"),' +
                'span:contains("Start Session")'
            },
            {
                title: 'Loading Screen',
                waitFor: '.loader'
            },
            {
                wait: 2000,
                title: 'The Point of Sale',
                waitFor: '.pos'
            },
            {
                title: "We will buy some Products!, let's add (POS Product 1)",
                element: '.product-list ' +
                '.product-name:contains("POS Product 1")'
            },
            {
                wait: 5000,
                title: 'The order total has been ' +
                'updated to the correct value : 100€',
                waitFor: '.order .total .value:contains("100.00 €")'
            },
            {
                wait: 5000,
                title: 'We will add one more unit!',
                element: '.product-list ' +
                '.product-name:contains("POS Product 1")'
            },
            {
                wait: 4000,
                title: 'We will add another unit',
                element: '.product-list ' +
                '.product-name:contains("POS Product 1")'
            },
            {
                wait: 4000,
                title: 'The order total should be updated ' +
                ': 270€ which means 90€/Unit (Rule 10% Discount from 3 Units)',
                waitFor: '.order .total .value:contains("270.00 €")'
            },
            {
                wait: 8000,
                title: 'We will add another product',
                element: '.product-list ' +
                '.product-name:contains("POS Product 2")'
            },
            {
                wait: 4000,
                title: 'We will add another unit for this product ' +
                '(POS Product 2)',
                element: '.product-list ' +
                '.product-name:contains("POS Product 2")'
            },
            {
                wait: 4000,
                title: "Let's verify the total that we should pay," +
                " it's should be equal to : 450€, which means that <br>" +
                "10% Discount if offered if we buy 2 units of " +
                "(POS Product 2), Rule based on standard price",
                waitFor: '.order .total .value:contains("450.00 €")'
            },
            {
                wait: 10000,
                title: "Now, we will add (POS Product 3), for this " +
                "product if we buy more then 2 units <br>" +
                "20% Discount is given by supplier to our customers",
                element: '.product-list .product-name:contains("POS Product 3")'
            },
            {
                wait: 10000,
                title: 'We will add another unit for ' +
                'this product (POS Product 3)',
                element: '.product-list ' +
                '.product-name:contains("POS Product 3")'
            },
            {
                wait: 5000,
                title: "Let's check the total (610€)",
                waitFor: '.order .total .value:contains("610.00 €")'
            },
            {
                wait: 5000,
                title: "Now, we will add (POS Product 4), this product " +
                "belong to (Comptuer) category in which " +
                "we apply 5% if customer buy more then 2 products",
                element: '.product-list ' +
                '.product-name:contains("POS Product 4")'
            },
            {
                wait: 10000,
                title: 'We will add another unit for ' +
                'this product (POS Product 4)',
                element: '.product-list ' +
                '.product-name:contains("POS Product 4")'
            },
            {
                wait: 5000,
                title: "Let's check the total again (800€)",
                waitFor: '.order .total .value:contains("800.00 €")'
            },
            {
                wait: 5000,
                title: "Let's pay the order",
                element: ".paypad-button:contains('Bank')"
            },
            {
                wait: 1000,
                title: "Let's accept the payment",
                onload: function () {
                    window._print = window.print;
                    window.print = function () {
                        console.log('Print!')
                    };
                },
                element: ".button .iconlabel:contains('Validate'):visible"
            },
            {
                wait: 1000,
                title: "Let's finish the order",
                element: ".button:not(.disabled) " +
                ".iconlabel:contains('Next'):visible"
            },
            {
                wait: 1000,
                onload: function () {
                    window.print = window._print;
                    window._print = undefined;
                },
                title: "Let's wait for the order posting",
                waitFor: ".oe_status.js_synch .js_connected:visible"
            },
            {
                wait: 1000,
                title: "Let's close the Point of Sale",
                element: ".header-button:contains('Close')"
            },
            {
                title: "Let's confirm",
                element: ".header-button.confirm:contains('Confirm')"
            },
            {
                title: "Wait for the backend to ready itself",
                element: 'span:contains("Resume Session"),' +
                'span:contains("Start Session")'
            }
        ]
    });

})();
