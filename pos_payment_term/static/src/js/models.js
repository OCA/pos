/*****************************************************************************
* © 2016 KMEE INFORMATICA LTDA (<http://kmee.com.br>)
*    Luiz Felipe do Divino <luiz.divino@kmee.com.br>
* License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
******************************************************************************/

function pos_payment_term_models(instance, module){

    var round_di = instance.web.round_decimals;

    var PosModelParent = module.PosModel;
    module.PosModel = module.PosModel.extend({
        /**
         * @param session
         * @param attributes
         */
        initialize: function (session, attributes) {
            PosModelParent.prototype.initialize.apply(this, arguments);
            this.models.push({
                model:  'account.payment.term',
                fields: ['name', 'note'],
                loaded: function(self,payment_terms){
                    self.payment_terms = payment_terms;
                }
            });
        }
    });

    module.Paymentline = Backbone.Model.extend({
        initialize: function(attributes, options) {
            this.amount = 0;
            this.cashregister = options.cashregister;
            this.name = this.cashregister.journal_id[1];
            this.payment_term = false;
            this.selected = false;
            this.pos = options.pos;
        },
        set_payment_term: function(payment_term){
            this.payment_term = payment_term;
        },
        get_payment_term: function(){
            return this.payment_term;
        },
        //sets the amount of money on this payment line
        set_amount: function(value){
            this.amount = round_di(parseFloat(value) || 0, this.pos.currency.decimals);
            this.trigger('change:amount',this);
        },
        // returns the amount of money on this paymentline
        get_amount: function(){
            return this.amount;
        },
        get_amount_str: function(){
            return openerp.instances[this.pos.session.name].web.format_value(this.amount, {
                type: 'float', digits: [69, this.pos.currency.decimals]
            });
        },
        set_selected: function(selected){
            if(this.selected !== selected){
                this.selected = selected;
                this.trigger('change:selected',this);
            }
        },
        // returns the payment type: 'cash' | 'bank'
        get_type: function(){
            return this.cashregister.journal.type
        },
        export_as_JSON: function(){
            return {
                name: instance.web.datetime_to_str(new Date()),
                statement_id: this.cashregister.id,
                account_id: this.cashregister.account_id[0],
                journal_id: this.cashregister.journal_id[0],
                amount: this.get_amount(),
                payment_term: this.get_payment_term()
            };
        }
    });

    module.Order = module.Order.extend({
        export_as_JSON: function() {
            var orderLines, paymentLines;
            var attributes;
            payment_terms_id = $(".paymentline-input").val();;
            orderLines = [];
            (this.get('orderLines')).each(_.bind( function(item) {
                return orderLines.push([0, 0, item.export_as_JSON()]);
            }, this));
            paymentLines = [];
            (this.get('paymentLines')).each(_.bind( function(item) {
                console.log(item.export_as_JSON());
                return paymentLines.push([0, 0, item.export_as_JSON()]);
            }, this));
            return {
                name: this.getName(),
                amount_paid: this.getPaidTotal(),
                amount_total: this.getTotalTaxIncluded(),
                amount_tax: this.getTax(),
                amount_return: this.getChange(),
                lines: orderLines,
                statement_ids: paymentLines,
                pos_session_id: this.pos.pos_session.id,
                partner_id: this.get_client() ? this.get_client().id : false,
                user_id: this.pos.cashier ? this.pos.cashier.id : this.pos.user.id,
                uid: this.uid,
                sequence_number: this.sequence_number,
                payment_terms_id: payment_terms_id
            };
        }
    });
}