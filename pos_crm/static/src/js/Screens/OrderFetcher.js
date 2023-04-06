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

        const searchDomain = OrderFetcher.searchDomain || [];
        const clauses = searchDomain.filter((item) => item !== "|");

        for (const clause of clauses) {
            const [field, operator, searchWord] = clause;

            switch (field) {
                case "partner_vat":
                    if (operator === "ilike") {
                        return searchByPartnerVat(order, searchWord);
                    }
                    break;

                case "pos_reference":
                    if (operator === "ilike") {
                        return searchByPosReference(order, searchWord);
                    }
                    break;

                case "partner_id.display_name":
                    if (operator === "ilike") {
                        return searchByClientName(order, searchWord);
                    }
                    break;

                case "date_order":
                    if (operator === "ilike") {
                        return searchByDateOrder(order, searchWord);
                    }
                    break;
            }
        }

        return false;
    };
});
