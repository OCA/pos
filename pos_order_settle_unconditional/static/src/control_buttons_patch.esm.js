import {ControlButtons} from "@point_of_sale/app/screens/product_screen/control_buttons/control_buttons";
import {patch} from "@web/core/utils/patch";

// Sale.order._compute_amount_unpaid clamps amount_unpaid to 0, so an order
// totalling a negative amount never satisfies the "amount_unpaid > 0" leaf that
// pos_sale puts in the Quotation/Order domain and "Settle the order" stays out of
// reach. Accept such an order on its total instead; the "invoice_status !=
// 'invoiced'" leaf still drops it once it has been settled.
const relaxUnpaidDomain = (domain) =>
    domain.flatMap((leaf) =>
        leaf[0] === "amount_unpaid" ? ["|", leaf, ["amount_total", "<", 0]] : [leaf]
    );

patch(ControlButtons.prototype, {
    onClickQuotation() {
        if (!this.pos.config.always_enable_order_settle) {
            return super.onClickQuotation(...arguments);
        }
        // The domain is built inside onClickQuotation and handed straight to the
        // dialog, so wrapping the dialog service is the only way to widen it while
        // still going through super.
        const dialog = this.dialog;
        this.dialog = {
            ...dialog,
            add: (component, props, options) =>
                dialog.add(
                    component,
                    props.domain
                        ? {...props, domain: relaxUnpaidDomain(props.domain)}
                        : props,
                    options
                ),
        };
        try {
            return super.onClickQuotation(...arguments);
        } finally {
            this.dialog = dialog;
        }
    },
});
