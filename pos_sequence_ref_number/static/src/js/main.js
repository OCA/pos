/**
 * # -*- coding: utf-8 -*-
 * # See README.rst file on addon root folder for license details
 */

odoo.define('pos_sequence_ref_number.pos', function (require) {
    var core = require('web.core');
	var utils = require('web.utils');
	var Model = require('web.DataModel');
	var screens = require('point_of_sale.screens');
	var gui = require('point_of_sale.gui');
	var models = require('point_of_sale.models');
	var PopupWidget = require('point_of_sale.popups');


    'use strict';
        var _t = core._t;
            _lt = core._lt;
        var QWeb = core.qweb;
        var _sequence_next = function(seq){
            var idict = {
                'year': moment().format('YYYY'),
                'month': moment().format('MM'),
                'day': moment().format('DD'),
                'y': moment().format('YY')
            };
            var format = function(s, dict){
                s = s || '';
                $.each(dict, function(k, v){
                    s = s.replace('%(' + k + ')s', v);
                });
                return s;
            };
            function pad(n, width, z) {
                z = z || '0';
                n = n + '';
                if (n.length < width) {
                    n = new Array(width - n.length + 1).join(z) + n;
                }
                return n;
            }
            var num = seq.number_next_actual;
            var prefix = format(seq.prefix, idict);
            var suffix = format(seq.suffix, idict);
            seq.number_next_actual += seq.number_increment;

            return prefix + pad(num, seq.padding) + suffix;
        };

        var PosModelParent = models.PosModel;
        models.PosModel = models.PosModel.extend({
            load_server_data: function(){
                var self = this;
                // Load POS sequence object
                self.models.push({
                    model: 'ir.sequence',
                    fields: [],
                    ids:    function(self){ return [self.config.sequence_id[0]]; },
                    loaded: function(self, sequence){ self.pos_order_sequence = sequence[0]; },
                });
                return PosModelParent.prototype.load_server_data.apply(this, arguments);
            },
            push_order: function(order) {
                if (order !== undefined) {
                    order.set({'sequence_ref_number': this.pos_order_sequence.number_next_actual});
                    order.set({'sequence_ref': _sequence_next(this.pos_order_sequence)});
                }
                return PosModelParent.prototype.push_order.call(this, order);
            }
        });

        var OrderParent = models.Order;
        models.Order = models.Order.extend({
            export_for_printing: function(attributes){
                var order = OrderParent.prototype.export_for_printing.apply(this, arguments);
                order['sequence_ref_number'] = this.get('sequence_ref_number');
                return order;
            },
            export_as_JSON: function() {
                var order = OrderParent.prototype.export_as_JSON.apply(this, arguments);
                order['sequence_ref'] = this.get('sequence_ref');
                order['sequence_ref_number'] = this.get('sequence_ref_number');;
                return order;
            },
        });
    });

