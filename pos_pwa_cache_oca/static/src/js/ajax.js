odoo.define('pos_pwa_cache_oca.ajax', function (require) {
"use strict";

var ajax = require('web.ajax');

var getUrl = window.location.origin;

$.ajax({
    url: getUrl + '/web/static/src/xml/dialog.xml',
    method: 'GET',
    timeout: 2000,
})

});