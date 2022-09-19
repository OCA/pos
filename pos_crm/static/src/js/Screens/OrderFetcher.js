odoo.define("pos_crm.OrderFetcher", function (require) {
    "use strict";

    const OrderFetcher = require("point_of_sale.OrderFetcher");

    OrderFetcher._predicateBasedOnSearchDomain = (order_to_search) => {
        const self = OrderFetcher;
        function check(order, field, searchWord) {
            searchWord = searchWord.toLowerCase();
            switch (field) {
                case "partner_vat":
                    const partner_vat = order.partner_vat
                        ? order.partner_vat.replace(/[./-]/g, "")
                        : "";
                    return partner_vat.includes(searchWord.replace(/[./-]/g, ""));
                case "pos_reference":
                    return order.name.toLowerCase().includes(searchWord);
                case "partner_id.display_name":
                    const client = order.get_client();
                    return client
                        ? client.name.toLowerCase().includes(searchWord)
                        : false;
                case "date_order":
                    return moment(order.creation_date)
                        .format("YYYY-MM-DD hh:mm A")
                        .includes(searchWord);
                default:
                    return false;
            }
        }
        for (const clausule of (self.searchDomain || []).filter(
            (item) => item !== "|"
        )) {
            const field = clausule[0];
            let searchWord = clausule[2];
            // Remove surrounding "%" from `searchWord`
            searchWord = searchWord.substring(1, searchWord.length - 1);
            if (check(order_to_search, field, searchWord)) {
                return true;
            }
        }
        return false;
    };
});
