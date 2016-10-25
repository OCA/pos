/* © 2016 Diagram Software S.L.
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

(function ($) {
    "use strict";
    openerp.pos_save_client_error_fix = function (instance, module) {
        var _t = instance.web._t;
        var pos = instance.point_of_sale;

        pos.ClientListScreenWidget = pos.ClientListScreenWidget.extend({
            save_client_details: function(partner) {
                var self = this;

                var fields = {};
                this.$('.client-details-contents .detail').each(function(idx,el){
                    fields[el.name] = el.value;
                });

                if (!fields.name) {
                    this.pos_widget.screen_selector.show_popup('error',{
                        message: _t('A Customer Name Is Required'),
                    });
                    return;
                }

                if (this.uploaded_picture) {
                    fields.image = this.uploaded_picture;
                }

                fields.id           = partner.id || false;
                fields.country_id   = fields.country_id || false;
                fields.ean13        = fields.ean13 ? this.pos.barcode_reader.sanitize_ean(fields.ean13) : false;

                new instance.web.Model('res.partner').call('create_from_ui',[fields]).then(function(partner_id){
                    self.saved_client_details(partner_id);
                },function(err,event){
                    event.preventDefault();
                    self.pos_widget.screen_selector.show_popup('error',{
                        'message': _t('Error: Could not Save Changes'),
                        'comment': err.data["arguments"][1],
                    });
                });
            },
        });
    };
})(jQuery);
