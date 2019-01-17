/******************************************************************************
    Copyright (C) 2018 - Today: Akretion (https://www.akretion.com)
    @author: Raphaël Reverdy (https://akretion.com)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 *****************************************************************************/
odoo.define('pos_order_to_sale_order.state_machine', function (require) {
    "use strict";

    var stateMachine = { //State Machine
        listeners: [],
        allowPayment: true,
        allowedStates: [],
        // possible states : poso, draft, confirmed, delivered, invoiced
        current: {
            name: 'poso',
            isPayable: true,
            isPosOrder: true,
            isPicking: true,
            isInvoicable: true,
        },
        enter: function(target) {
            var next = {
                name: target
            };
            if (this.allowedStates.indexOf(target) == -1) {
                // don't enter in a disallowed state
                return this.exit(target);
            }
            if (target == 'draft' ) {
                next.isPayable = false;
                next.isPosOrder = false;
                next.isPicking = false;
                next.isInvoicable = false;
            }
            if (target == 'poso') {
                next.isPayable = true;
                next.isPosOrder = true;
                next.isPicking = true;
                next.isInvoicable = true;
            }
            if (target == 'confirmed') {
                next.isPayable = true && this.allowPayment;
                next.isPosOrder = false;
                next.isPicking = false;
                next.isInvoicable = false;
            }
            if (target == 'delivered') {
                next.isPayable = true && this.allowPayment;
                next.isPosOrder = false;
                next.isPicking = true;
                next.isInvoicable = false;
            }
            if (target == 'invoiced') {
                next.isPayable = true && this.allowPayment;
                next.isPosOrder = false;
                next.isPicking = true;
                next.isInvoicable = true;
            }
            this.notify(next);
        },
        exit: function(target) {
            var fallback = 'confirmed';
            var possibles = [];
            if (this.allowedStates.indexOf('confirmed') == -1) {
                //confirmed is not allowed, fallback to something else.
                possibles = this.allowedStates.filter(function (state) {
                    return state != target;
                }); //possibles = allowedStates - target - confirmed
                fallback = possibles.shift(); //take first
            }
            this.enter(fallback);
        },
        toggle: function(target) {
            if (this.current.name == target){
                this.exit(target);
            } else {
                this.enter(target);
            }
        },
        notify: function(next) {
            var prev = this.current;
            this.current = next || prev;
            this.listeners.forEach(function (cb) {
                cb(this.current, prev);
            }, this);
        },
        init: function() {
            //will goes to poso if available
            //or fall back to confirmed
            this.exit('confirmed');
        }
    };

    return stateMachine;
});
