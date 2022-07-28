odoo.define("pos_pwa_cache_oca.models", function (require) {

    var models = require("point_of_sale.models");
    var session = require('web.session');

    var _super_pos_model = models.PosModel.prototype;
    var _models = models.PosModel.prototype.models;

    var pictures_model = _.findIndex(_models, function(model) {
        return model.label === "pictures";
    });

    _models[pictures_model]['loaded'] = ((self) => {
            self.company_logo = new Image();
            var  logo_loaded = new $.Deferred();
            self.company_logo.onload = function(){
                var img = self.company_logo;
                var ratio = 1;
                var targetwidth = 300;
                var maxheight = 150;
                if( img.width !== targetwidth ){
                    ratio = targetwidth / img.width;
                }
                if( img.height * ratio > maxheight ){
                    ratio = maxheight / img.height;
                }
                var width  = Math.floor(img.width * ratio);
                var height = Math.floor(img.height * ratio);
                var c = document.createElement('canvas');
                    c.width  = width;
                    c.height = height;
                var ctx = c.getContext('2d');
                    ctx.drawImage(self.company_logo,0,0, width, height);

                self.company_logo_base64 = c.toDataURL();
                logo_loaded.resolve();
            };
            self.company_logo.onerror = function(){
                logo_loaded.reject();
            };
            self.company_logo.crossOrigin = "anonymous";
            self.company_logo.src = '/web/binary/company_logo' +'?dbname=' + session.db;

            return logo_loaded;
        });
});