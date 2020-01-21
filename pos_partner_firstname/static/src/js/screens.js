odoo.define('pos_partner_firstname.screens', function (require) {
    "use strict";

    var Screens = require('point_of_sale.screens');

    Screens.ClientListScreenWidget.include({

        partner_names_order: 'last_first',

        init: function(parent, options){
            var self = this;
            this._super(parent, options);
            this._rpc({
                model: 'res.partner',
                method: 'get_names_order',
                args: [],
            }).then(function(partner_names_order) {
                if (partner_names_order != false) {
                    self.partner_names_order = partner_names_order;
                }
            });
        },

        _update_client_name: function(checked){
            if (!checked) {
                var lastname = $('.lastname').val() || '';
                var firstname = $('.firstname').val() || '';
                var name = null;
                if (this.partner_names_order === 'last_first_comma') {
                    name = lastname + ', ' + firstname;
                }
                else if (this.partner_names_order === 'first_last') {
                    name = firstname + ' ' + lastname;
                }
                else
                {
                    name = lastname + ' ' + firstname;
                }
                $('.client-name').val(name);
            }
        },

        display_client_details: function(visibility,partner,clickpos){
            var self = this;
            this._super.apply(self, arguments);
            if (visibility === 'edit') {
                if (!$('.is_company').is(':checked')) {
                     $('.client-name').attr('readonly', true);
                }
                this.$('.person').off('keyup').on('keyup', function(event) {
                    var checked = $('.is_company').is(':checked');
                    $('.client-name').attr('readonly', !checked);
                    if (!checked) {
                        self._update_client_name(checked);
                    }
                });
                this.$('.checkbox').off('change').on('change', function(event) {
                    this.value = this.checked;
                    if (this.name === 'is_company') {
                        var checked = this.checked;
                        $('.is_person').toArray().forEach(function(el) {
                            $(el).css('display', !checked ? 'block' : 'none');
                        });
                        var clientname = $('.client-name');
                        clientname.attr('readonly', !checked);
                        if (!checked) {
                            self._update_client_name(checked);
                        }
                        else
                        {
                            $('.lastname').val(clientname.val());
                            $('.firstname').val('');
                        }
                    };
                });
            }
        },
     });
});
