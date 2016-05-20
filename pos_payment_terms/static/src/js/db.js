function pos_payment_terms_db(instance, module) {

    module.PosDB = module.PosDB.extend({
        init: function (options) {
            options = options || {};
            this._super(options);
        },
        _partner_search_string: function(partner){
            // FIXME: Call super
            //var str = this._super(partner);
            var str =  partner.name;
            if(partner.ean13){
                str += '|' + partner.ean13;
            }
            if(partner.address){
                str += '|' + partner.address;
            }
            if(partner.phone){
                str += '|' + partner.phone.split(' ').join('');
            }
            if(partner.mobile){
                str += '|' + partner.mobile.split(' ').join('');
            }
            if(partner.email){
                str += '|' + partner.email;
            }
            if(partner.cnpj_cpf){
                var cnpj_cpf =  partner.cnpj_cpf
                str += '|' + cnpj_cpf;
                cnpj_cpf = cnpj_cpf.replace(
                    '.','').replace('/','').replace('-','')
                str += '|' + cnpj_cpf;
            }
            str = '' + partner.id + ':' + str.replace(':','') + '\n';
            return str;
        },
        get_partner_by_identification: function(partners, identification){
            for (var i = 0; i < partners.length; i++){
                var cnpj_cpf = partners[i].cnpj_cpf;
                if (cnpj_cpf){
                    cnpj_cpf = cnpj_cpf.replace(".", "").replace("/", "").replace("-","");
                    cnpj_cpf = cnpj_cpf.replace(".","");
                    if (cnpj_cpf == identification){
                        return partners[i];
                    }
                }
            }
            return false;
        },
        search_partner: function(query){
            try {
                query = query.replace(/[\[\]\(\)\+\*\?\.\-\!\&\^\$\|\~\_\{\}\:\,\\\/]/g,'.');
                query = query.replace(' ','.+');
                var re = RegExp("([0-9]+):.*?"+query,"gi");
            }catch(e){
                return [];
            }
            var results = [];
            for(var i = 0; i < this.limit; i++){
                r = re.exec(this.partner_search_string);
                if(r){
                    var id = Number(r[1]);
                    results.push(this.get_partner_by_id(id));
                }else{
                    break;
                }
            }
            return results;
        },
    })
}