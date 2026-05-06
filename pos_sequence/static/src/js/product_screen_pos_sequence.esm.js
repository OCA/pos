import {ProductScreen} from "@point_of_sale/app/screens/product_screen/product_screen";
import {patch} from "@web/core/utils/patch";

function asNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function asString(value) {
    return (value || "").toString().trim().toLowerCase();
}

function sortByPosSequenceDefaultCodeName(products) {
    return products.slice().sort((a, b) => {
        const byPosSequence =
            asNumber(a.pos_sequence, 100) - asNumber(b.pos_sequence, 100);
        if (byPosSequence !== 0) {
            return byPosSequence;
        }
        const byDefaultCode = asString(a.default_code).localeCompare(
            asString(b.default_code)
        );
        if (byDefaultCode !== 0) {
            return byDefaultCode;
        }
        return asString(a.name || a.display_name).localeCompare(
            asString(b.name || b.display_name)
        );
    });
}

patch(ProductScreen.prototype, {
    get productsToDisplay() {
        const products = super.productsToDisplay;
        return sortByPosSequenceDefaultCodeName(products);
    },

    getProductsBySearchWord(searchWord) {
        const products = super.getProductsBySearchWord(searchWord);
        return sortByPosSequenceDefaultCodeName(products);
    },
});
