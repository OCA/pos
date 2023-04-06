odoo.define("pos_crm.OrderFetcher", function (require) {
    "use strict";

    const OrderFetcher = require("point_of_sale.OrderFetcher");

    OrderFetcher._predicateBasedOnSearchDomain = (order) => {
        function normalizePartnerVat(vat) {
            return vat ? vat.replace(/[./-]/g, "") : "";
        }

        function searchByPartnerVat(order, searchWord) {
            const partner_vat = normalizePartnerVat(order.partner_vat);
            const searchVat = normalizePartnerVat(searchWord);
            return partner_vat.includes(searchVat);
        }

        function searchByPosReference(order, searchWord) {
            const name = order.name.toLowerCase();
            return name.includes(searchWord.toLowerCase());
        }

        function searchByClientName(order, searchWord) {
            const client = order.get_client();
            const clientName = client ? client.name.toLowerCase() : "";
            return clientName.includes(searchWord.toLowerCase());
        }

        function searchByDateOrder(order, searchWord) {
            const creationDate = moment(order.creation_date).format(
                "YYYY-MM-DD hh:mm A"
            );
            return creationDate.includes(searchWord.toLowerCase());
        }

        function checkOrder(order, field, searchWord) {
            searchWord = searchWord.substring(1, searchWord.length - 1).toLowerCase();
            switch (field) {
                case "partner_vat":
                    return searchByPartnerVat(order, searchWord);
                case "pos_reference":
                    return searchByPosReference(order, searchWord);
                case "partner_id.display_name":
                    return searchByClientName(order, searchWord);
                case "date_order":
                    return searchByDateOrder(order, searchWord);
                default:
                    return false;
            }
        }

        const searchDomain = OrderFetcher.searchDomain || [];
        const clauses = searchDomain.filter((item) => item !== "|");
        for (const clause of clauses) {
            const [field, searchWord] = clause.split(" ");
            if (checkOrder(order, field, searchWord)) {
                return true;
            }
        }
        return false;
    };
});
