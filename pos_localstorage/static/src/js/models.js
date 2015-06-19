openerp.pos_localstorage = function(instance){
    var module = instance.point_of_sale;

    var UpdateProducts = {
        runOnce: function(pos) {
            var self = this;
            // We subtract the following period from the last update time
            //  to make sure that we get all changes (including those that happened
            //  during the last update phase).
            var _searchGracePeriod = 30 * 60 * 1000;  // 30 minutes
            // List of product attributes that the POS uses.
            var productAttributeList = ['name', 'list_price','price','pos_categ_id', 'taxes_id', 'ean13', 'default_code', 'variants',
                     'to_weight', 'uom_id', 'uos_id', 'uos_coeff', 'mes_type', 'description_sale', 'description'];

            var lastUpdate = pos.db.load('last_product_update');
            if (!lastUpdate)
                lastUpdate = '1970-01-01T00:00:00Z';

            // Fetch all products that we sell and that have not been changed since
            //  we updated for the last time.
            return pos.fetch(
                'product.product',
                ['id'],
                [['sale_ok', '=', true], ['available_in_pos', '=', true], ['write_date', '<', lastUpdate]]
            ).then(function(products){
                var products_to_add = [];
                var products_to_fetch = [];
                for (var i in products) {
                    // Try to get product information from localStorage.
                    // If this fails, we load the information from the server.
                    var product = pos.db.load('product_' + products[i].id);
                    if (product) {
                        products_to_add.push(product);
                    } else {
                        products_to_fetch.push(products[i].id);
                    }
                }
                // Add products that we have in localStorage
                pos.db.add_products(products_to_add);

                // Fetch all products that we don't have the data
                //  because they were not in localStorage or they are new
                return pos.fetch('product.product',
                                 productAttributeList,
                                 ['|', ['id', 'in', products_to_fetch],
                                       '&', '&', ['sale_ok', '=', true], ['available_in_pos', '=', true], ['write_date', '>=', lastUpdate]],
                                 {pricelist: pos.get('shop').pricelist_id[0]} // context for price
                );
            }).then(function(products){
                pos.db.add_products(products);

                lastUpdate = new Date(Date.now() - _searchGracePeriod).toISOString();
                pos.db.save('last_product_update', lastUpdate);
            });
        },
    };


    var _old_initialize = module.PosModel.prototype.initialize;
    module.PosModel.prototype.initialize = function(session, attributes) {
        var ret = _old_initialize.call(this, session, attributes);
        // HACK to make localStorage abstraction dependent of the database
        this.db.name = session.db;
        // clear database again after setting the name;
        this.db.clear('products','categories');
        return ret;
    };

    // Overwrite method to additionally save product data in localStorage
    var _old_add_products = module.PosLS.prototype.add_products;
    module.PosLS.prototype.add_products = function(products) {
        _old_add_products.call(this, products);
        try {
            for (var i in products) {
                var product = products[i];
                this.save('product_' + product.id, product);
            }
        } catch(e) {
            if (console) {
                console.log("Could not store all products into LocalStorage");
                console.log(e);
            }
            // We delete the last ~100 products to free up space.
            // If localStorage is full, some other features may crash.
            var length = localStorage.length;
            for (var i = 1; i <= 100; ++i) {
                var key = localStorage.key(length - i);
                if (/product_\d+$/.exec(key)) {
                    localStorage.removeItem(key);
                }
            }
        }
    };

    // overwrite method in order to replace product loading
    module.PosModel.prototype.load_server_data = function(){
        var self = this;

        var loaded = self.fetch('res.users',['name','company_id'],[['id','=',this.session.uid]])
            .then(function(users){
                self.set('user',users[0]);

                return self.fetch('res.company',
                [
                    'currency_id',
                    'email',
                    'website',
                    'company_registry',
                    'vat',
                    'name',
                    'phone',
                    'partner_id',
                ],
                [['id','=',users[0].company_id[0]]]);
            }).then(function(companies){
                self.set('company',companies[0]);

                return self.fetch('res.partner',['contact_address'],[['id','=',companies[0].partner_id[0]]]);
            }).then(function(company_partners){
                self.get('company').contact_address = company_partners[0].contact_address;

                return self.fetch('product.uom', null, null);
            }).then(function(units){
                self.set('units',units);
                var units_by_id = {};
                for(var i = 0, len = units.length; i < len; i++){
                    units_by_id[units[i].id] = units[i];
                }
                self.set('units_by_id',units_by_id);

                return self.fetch('product.packaging', null, null);
            }).then(function(packagings){
                self.set('product.packaging',packagings);

                return self.fetch('res.users', ['name','ean13'], [['ean13', '!=', false]]);
            }).then(function(users){
                self.set('user_list',users);

                return self.fetch('res.partner', ['name','ean13'], [['ean13', '!=', false]]);
            }).then(function(partners){
                self.set('partner_list',partners);

                return self.fetch('account.tax', ['amount', 'price_include', 'type']);
            }).then(function(taxes){
                self.set('taxes', taxes);

                return self.fetch(
                    'pos.session',
                    ['id', 'journal_ids','name','user_id','config_id','start_at','stop_at'],
                    [['state', '=', 'opened'], ['user_id', '=', self.session.uid]]
                );
            }).then(function(sessions){
                self.set('pos_session', sessions[0]);

                return self.fetch(
                    'pos.config',
                    ['name','journal_ids','shop_id','journal_id',
                     'iface_self_checkout', 'iface_led', 'iface_cashdrawer',
                     'iface_payment_terminal', 'iface_electronic_scale', 'iface_barscan', 'iface_vkeyboard',
                     'iface_print_via_proxy','iface_cashdrawer','state','sequence_id','session_ids'],
                    [['id','=', self.get('pos_session').config_id[0]]]
                );
            }).then(function(configs){
                var pos_config = configs[0];
                self.set('pos_config', pos_config);
                self.iface_electronic_scale    =  !!pos_config.iface_electronic_scale;
                self.iface_print_via_proxy     =  !!pos_config.iface_print_via_proxy;
                self.iface_vkeyboard           =  !!pos_config.iface_vkeyboard;
                self.iface_self_checkout       =  !!pos_config.iface_self_checkout;
                self.iface_cashdrawer          =  !!pos_config.iface_cashdrawer;

                return self.fetch('sale.shop',[],[['id','=',pos_config.shop_id[0]]]);
            }).then(function(shops){
                self.set('shop',shops[0]);

                return self.fetch('product.pricelist',['currency_id'],[['id','=',self.get('shop').pricelist_id[0]]]);
            }).then(function(pricelists){
                self.set('pricelist',pricelists[0]);

                return self.fetch('res.currency',['symbol','position','rounding','accuracy'],[['id','=',self.get('pricelist').currency_id[0]]]);
            }).then(function(currencies){
                self.set('currency',currencies[0]);

                return self.fetch('product.packaging',['ean','product_id']);
            }).then(function(packagings){
                self.db.add_packagings(packagings);

                return self.fetch('pos.category', ['id','name','parent_id','child_id','image'])
            }).then(function(categories){
                self.db.add_categories(categories);

                return UpdateProducts.runOnce(self);
            }).then(function(products){
                return self.fetch(
                    'account.bank.statement',
                    ['account_id','currency','journal_id','state','name','user_id','pos_session_id'],
                    [['state','=','open'],['pos_session_id', '=', self.get('pos_session').id]]
                );
            }).then(function(bank_statements){
                var journals = new Array();
                _.each(bank_statements,function(statement) {
                    journals.push(statement.journal_id[0])
                });
                self.set('bank_statements', bank_statements);
                return self.fetch('account.journal', undefined, [['id','in', journals]]);
            }).then(function(journals){
                self.set('journals',journals);

                // associate the bank statements with their journals.
                var bank_statements = self.get('bank_statements');
                for(var i = 0, ilen = bank_statements.length; i < ilen; i++){
                    for(var j = 0, jlen = journals.length; j < jlen; j++){
                        if(bank_statements[i].journal_id[0] === journals[j].id){
                            bank_statements[i].journal = journals[j];
                            bank_statements[i].self_checkout_payment_method = journals[j].self_checkout_payment_method;
                        }
                    }
                }
                self.set({'cashRegisters' : new module.CashRegisterCollection(self.get('bank_statements'))});
            });

        return loaded;
    };
}
