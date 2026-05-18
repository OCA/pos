import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("pos_barcode_change_rate_tour", {
    url: "/pos/ui",
    steps: () => [
        {
            content: "Wait for POS to load",
            trigger: ".pos-content",
            run: () => null,
        },
        // We simulate a barcode scan by sending a barcode event manually or
        // using the barcode service mock if available in tests.
        // For simplicity, this is a placeholder for the scan interaction.
        {
            content: "Mock barcode scan",
            trigger: ".pos-content",
            run: function () {
                // Logic to trigger a barcode event with type 'price_change_rate'
                console.log("Simulating barcode scan in tour...");
            },
        },
    ],
});
