/******************************************************************************
    Copyright (C) 2018 - Today: Akretion (https://www.akretion.com)
    @author: Raphaël Reverdy (https://akretion.com)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 *****************************************************************************/
odoo.define('pos_order_to_sale_order.state_machine', function (require) {
    "use strict";

    var stateMachine = { //State Machine
        listeners: [],
        allowPayment: false,
        allowedStates: [],
        // possible states : poso, draft, confirmed, delivered
        current: {
            name: 'poso',
            isPayable: true,
            isPosOrder: true,
            isPicking: true,
        },
        enter: function(target) {
            var next = {
                name: target
            };
            if (target == 'draft' ) {
                next.isPayable = false && this.allowPayment;
                next.isPosOrder = false;
                next.isPicking = false;
            }
            if (target == 'poso') {
                next.isPayable = true;
                next.isPosOrder = true;
                next.isPicking = true;
            }
            if (target == 'delivered') {
                next.isPayable = true && this.allowPayment;
                next.isPosOrder = false;
                next.isPicking = true;
            }
            if (target == 'confirmed') {
                next.isPayable = true && this.allowPayment;
                next.isPosOrder = false;
                next.isPicking = false;
            }
            this.notify(next);
        },
        exit: function(target) {
            var fallback = 'confirmed';
            var possibles = [];
            var map = {};
            if (this.allowedStates.indexOf('confirmed') == -1) {
                //confirmed is not allowed, fallback to something else.
                possibles = this.allowedStates.filter(function (state) {
                    return state != target;
                }); //possibles = allowedStates - target - order
                fallback = possibles.shift(); //take first
            }
            map = {
                'poso': fallback,
                'confirmed': 'poso',
                'delivered': fallback,
                'draft': fallback
            };
            this.enter(map[target]);
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
        }
    };

    window.stateMachine = stateMachine;
    return stateMachine;
});
