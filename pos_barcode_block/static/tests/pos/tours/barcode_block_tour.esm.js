import * as Chrome from "@point_of_sale/../tests/tours/utils/chrome_util";
import * as ProductScreen from "@point_of_sale/../tests/tours/utils/product_screen_util";
import {registry} from "@web/core/registry";

function scan(code) {
    for (const key of code) {
        document.body.dispatchEvent(new KeyboardEvent("keydown", {key, bubbles: true}));
    }
    document.body.dispatchEvent(
        new KeyboardEvent("keydown", {key: "Enter", bubbles: true})
    );
}

registry.category("web_tour.tours").add("PosBarcodeBlockTour", {
    steps: () =>
        [
            Chrome.startPoS(),
            {
                content: "Confirm the opening control popup if it is shown",
                trigger: "body",
                run: async () => {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    const button = [
                        ...document.querySelectorAll(".modal-footer .btn-primary"),
                    ].find((btn) => btn.textContent.includes("Open Register"));
                    if (button) {
                        button.click();
                    }
                },
            },
            {
                content: "Wait for the product screen to be ready",
                trigger: ".product-screen:not(:has(.modal-dialog))",
            },
            {
                content: "Scan an unknown barcode",
                trigger: "body",
                run: () => scan("DOESNOTEXIST999"),
            },
            {
                content: "Blocking dialog appears",
                trigger: ".modal-dialog:contains('Unknown Barcode')",
            },
            {
                content: "Close the dialog",
                trigger:
                    ".modal-dialog:contains('DOESNOTEXIST999') .modal-footer .btn-primary",
                run: "click",
            },
            {
                content: "Scan a valid barcode",
                trigger: "body",
                run: () => scan("BLOCKTEST001"),
            },
            ProductScreen.selectedOrderlineHas("Test product", "1.0"),
            ProductScreen.closePos(),
        ].flat(),
});
