import {Component} from "@odoo/owl";
import {Dialog} from "@web/core/dialog/dialog";
import {_t} from "@web/core/l10n/translation";
import {renderToElement} from "@web/core/utils/render";
import {usePos} from "@point_of_sale/app/store/pos_hook";
import {useService} from "@web/core/utils/hooks";

export class AutomaticCashdrawerInventoryDialog extends Component {
    static template = "AutomaticCashdrawerInventoryDialog";
    static components = {Dialog};
    static props = {
        close: Function,
        totals: Object,
        inventory: Object,
        sorted_values: Array,
    };
    setup() {
        super.setup(...arguments);
        this.dialog = useService("dialog");
        this.notification = useService("notification");
        this.printer = useService("printer");
        this.ui = useService("ui");
        this.pos = usePos();
    }

    /**
     * ACTIONS
     **/

    cancel() {
        this.props.close();
    }
    async print_inventory() {
        this.ui.block();
        const {totals, inventory, sorted_values} = this.props;
        const xmlReportElement = renderToElement(
            "AutomaticCashdrawerInventoryXmlReport",
            {
                pos: this.pos,
                report: {
                    totals: totals,
                    inventory: inventory,
                    sorted_values: sorted_values,
                },
            }
        );
        await this.pos.sendCashlogy("print_xml_receipt", {
            receipt: xmlReportElement.outerHTML,
        });
        this.notification.add(_t("Print Inventory Successfully"), {type: "success"});
        this.ui.unblock();
        this.props.close();
    }
}
