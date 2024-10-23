/*
    Copyright (C) 2022-Today GRAP (http://www.grap.coop)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html
*/
odoo.define("pos_customer_comment.tour.PosCustomerComment", function (require) {
    "use strict";

    const Tour = require("web_tour.tour");

    var steps = [
        {
            content: "Test pos_customer_content: Waiting for loading to finish",
            trigger: "body:not(:has(.loader))",
        },
        {
            content: "Test pos_customer_content: open customer list",
            trigger: "button.set-partner",
        },
        {
            content: "Test pos_customer_content: select 'Addison Olson' Customer",
            trigger: ".partner-line:contains('Addison Olson') .edit-partner-button",
        },
        {
            content: "Test pos_customer_content: Check if value is correctly loaded",
            trigger: "textarea[name='pos_comment']",
            run: () => {
                var content = $("textarea[name='pos_comment']");
                if (!content.val().includes("Important")) {
                    throw new Error("the PoS comment was not loaded in the frontend");
                }
            },
        },
        {
            content: "Test pos_customer_content: Write new text in PoS Comment field",
            trigger: "textarea[name='pos_comment']",
            run: "text New Comment",
        },
        {
            content: "Test pos_customer_content: Save Customer changes",
            trigger: ".partnerlist-screen .button.highlight",
        },
        {
            content: "Test pos_customer_content: Close the Point of Sale frontend",
            trigger: ".header-button",
        },
        {
            content: "Test pos_customer_content: Confirm closing the frontend",
            trigger: ".header-button",
        },
    ];

    Tour.register("PosCustomerCommentTour", {test: true, url: "/pos/ui"}, steps);
});

/* */
