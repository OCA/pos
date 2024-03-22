odoo.define("pos_partner_location_abstract.PartnerDetailTour", function (require) {
    const Tour = require("web_tour.tour");

    const steps = [
        {
            content:
                "Test pos_partner_location_abstract: Waiting for loading to finish",
            trigger: "body:not(:has(.loader))",
            // eslint-disable-next-line no-empty-function
            run: () => {},
        },
        {
            content: "Test pos_partner_location_abstract: Close Opening cashbox popup",
            trigger: "div.opening-cash-control .button:contains('Open session')",
        },
        {
            content: "Test pos_partner_location_abstract: Click on 'Customer' Button",
            trigger: "button.set-partner",
        },
        {
            content: "Test pos_partner_location_abstract: Search Test Partner",
            trigger: ".pos-search-bar input",
            run: "text Test Partner",
        },
        {
            content:
                "Test pos_partner_location_abstract: Select a customer 'Test Partner'",
            trigger: ".partner-line:contains('Test Partner') .edit-partner-button",
        },
        {
            content: "Test pos_partner_location_abstract: Change Lat",
            trigger: "input.detail[name=partner_latitude]",
            run: "text 15",
        },
        {
            content: "Test pos_partner_location_abstract: Change Long",
            trigger: "input.detail[name=partner_longitude]",
            run: "text a",
        },
        {
            content: "Test pos_partner_location_abstract: Save changes",
            trigger: ".button:contains('Save')",
        },
        {
            content: "Test pos_partner_location_abstract: Confirm closing the frontend",
            trigger: ".header-button",
            // eslint-disable-next-line no-empty-function
            run: () => {},
        },
    ];

    Tour.register("PartnerDetailTour", {test: true, url: "/pos/ui"}, steps);
});
