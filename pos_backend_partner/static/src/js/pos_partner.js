'use strict';

odoo.define('pos_backend_partner.partner_pos', function (require) {
    var tools = require('pos_backend_communication.tools');
    var session = require('web.session');
    var ProductScreenWidget = require('point_of_sale.screens');
    var translation = require('web.translation');
    var _t = translation._t;
    var action_url = null;
    var pos_instance = null;

    function set_client(message)  {
        var data = message.data;
        var partner_info = {
            'id': parseInt(data.id, 10),
            'name': data.name
        };
        pos_instance.get('selectedOrder').set_client(partner_info);
        alert(_t('Customer set')); //try to get the focus back
    }

    function open_backend(message) {
        console.log('open backend partner');
        //lookup action_id
        action_url = action_url || session.rpc(
            '/web/action/load', { "action_id":"pos_backend_partner.action_select_partner_pos"})
            .then(function (e) { return e.id; });

        action_url.then(function (action_id) {
            var url = "/web#view_type=list&model=res.partner&action=" + action_id;
            var msg = {'type': 'partner.choose'};
            tools.open_page(url, msg, 'partner');
        });
    }

    // Bind customer button in main screen
    ProductScreenWidget.ActionpadWidget.include({
        init: function(parent, options) {
            this._super(parent, options);
            pos_instance = this.pos;
        },
        renderElement: function() {
          var self = this;
          this._super();
          this.$('.set-customer').unbind('click');
          this.$('.set-customer').click(function(){
              open_backend();
          });
        }
    });

    // Bind customer button in payement screen
    ProductScreenWidget.PaymentScreenWidget.include({
        init: function(parent, options) {
            this._super(parent, options);
            pos_instance = this.pos;
        },
        click_set_customer: function() {
            open_backend();
        }
    });

    tools.callbacks['partner.partner_selected'] = set_client;

    return {
        callbacks: tools.callbacks
    };
});

odoo.define('pos_backend_partner.prevent_model_load', function (require) {
    // Prevent res.partner to be loaded at startup of the POS
    // we load partners from the back office

    //huge perf improvement server side AND client side AND network side
    // we don't need it since the client is picked from the backoffice
    var pos_models = require('point_of_sale.models');
    var partnerModelId = null;
    pos_models.PosModel.prototype.models.some(function (m, idx) {
        if (m.model !== "res.partner")
           return false;
        partnerModelId = idx; //got her !
        return true; //exit early
    });
    if (partnerModelId) {
        pos_models.PosModel.prototype.models.splice(partnerModelId, 1);
        //remove the model without changing the reference to the array
    }
});

