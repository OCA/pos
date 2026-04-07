/** @odoo-module */

import {ActionpadWidget} from "@point_of_sale/app/screens/product_screen/action_pad/action_pad";
import {CenteredIcon} from "@point_of_sale/app/generic_components/centered_icon/centered_icon";
import {Component, onMounted, useState} from "@odoo/owl";
import {deserializeDateTime, formatDateTime, parseDateTime} from "@web/core/l10n/dates";
const {DateTime} = luxon;
import {Numpad} from "@point_of_sale/app/generic_components/numpad/numpad";
import {OrderWidget} from "@point_of_sale/app/generic_components/order_widget/order_widget";
import {Orderline} from "@point_of_sale/app/generic_components/orderline/orderline";
import {SearchBar} from "@point_of_sale/app/screens/ticket_screen/search_bar/search_bar";
import {_t} from "@web/core/l10n/translation";
import {registry} from "@web/core/registry";
import {usePos} from "@point_of_sale/app/store/pos_hook";
import {useService} from "@web/core/utils/hooks";

export class CustomerHistoryScreen extends Component {
    static storeOnOrder = false;
    static template = "pos_order_line_customer_history.CustomerHistoryScreen";
    static components = {
        ActionpadWidget,
        Orderline,
        OrderWidget,
        CenteredIcon,
        SearchBar,
        Numpad,
    };
    static defaultProps = {
        ui: {},
    };
    static numpadActionName = _t("Payment");
    static searchPlaceholder = _t("Search Orders...");
    setup() {
        this.pos = usePos();
        this.ui = useState(useService("ui"));
        this.orm = useService("orm");
        this.numberBuffer = useService("number_buffer");
        this.numberBuffer.use({
            triggerAtInput: (event) => this._onUpdateSelectedOrderline(event),
        });
        this._state = this.pos.HISTORY_SCREEN_STATE;
        const defaultUIState = {
            selectedOrder: this.pos.get_order(),
            searchDetails: this.pos.getDefaultSearchDetails(),
            filter: null,
        };
        Object.assign(this._state.ui, defaultUIState, this.props.ui || {});
        onMounted(this.onMounted);
    }
    onMounted() {
        setTimeout(() => {
            this.onFilterSelected();
        });
    }
    async onFilterSelected() {
        await this._fetchSyncedOrderLines();
    }
    getNumpadButtons() {
        return [
            {value: "1"},
            {value: "2"},
            {value: "3"},
            {value: "quantity", text: _t("Qty"), class: "active border-primary"},
            {value: "4"},
            {value: "5"},
            {value: "6"},
            {value: "discount", text: _t("% Disc"), disabled: true},
            {value: "7"},
            {value: "8"},
            {value: "9"},
            {value: "price", text: _t("Price"), disabled: true},
            {value: "-", text: "+/-", disabled: true},
            {value: "0"},
            {value: this.env.services.localization.decimalPoint},
            {value: "Backspace", text: "⌫"},
        ];
    }
    async onSearch(search) {
        Object.assign(this._state.ui.searchDetails, search);
        this._state.syncedOrderLines.currentPage = 1;
        await this._fetchSyncedOrderLines();
    }
    async onAddToCart(line) {
        this.numberBuffer.reset();
        if (line && line.product_id) {
            const product = this.pos.db.get_product_by_id(line.product_id);
            if (product) {
                this._state.ui.selectedOrder.add_product(product, {
                    quantity: 1,
                });
            }
        }
    }
    async onNextPage() {
        if (this._state.syncedOrderLines.currentPage < this._getLastPage()) {
            this._state.syncedOrderLines.currentPage += 1;
            await this._fetchSyncedOrderLines();
        }
    }
    async onPrevPage() {
        if (this._state.syncedOrderLines.currentPage > 1) {
            this._state.syncedOrderLines.currentPage -= 1;
            await this._fetchSyncedOrderLines();
        }
    }
    onClickOrderline(orderline) {
        const order = this.getSelectedOrder();
        if (order) {
            order.select_orderline(orderline);
            this.numberBuffer.reset();
        }
    }
    _setValue(val) {
        const order = this.getSelectedOrder();
        if (order) {
            const selectedLine = order.get_selected_orderline();
            if (selectedLine) {
                if (val === "remove") {
                    order.removeOrderline(selectedLine);
                } else {
                    selectedLine.set_quantity(val);
                }
            }
        }
    }
    _onUpdateSelectedOrderline({buffer}) {
        const order = this.getSelectedOrder();
        if (!order) {
            return this.numberBuffer.reset();
        }
        const selectedOrderlineId = this.getSelectedOrderlineId();
        if (!selectedOrderlineId) {
            return this.numberBuffer.reset();
        }
        var val = 0;
        if (buffer === null) {
            val = "remove";
        } else {
            val = buffer;
        }
        this._setValue(val);
    }
    async onDoPayment() {
        this.closeHistoryScreen();
        this.pos.showScreen("PaymentScreen");
    }
    getSelectedOrder() {
        return this._state.ui.selectedOrder;
    }
    getSelectedOrderlineId() {
        const order = this.getSelectedOrder();
        if (order) {
            const selectedLine = order.get_selected_orderline();
            if (selectedLine) {
                return selectedLine.id;
            }
        }
    }
    getFilteredOrderLineList() {
        return this._state.syncedOrderLines.toShow;
    }
    getDate(line) {
        const date_order = deserializeDateTime(line.date_order);
        return formatDateTime(date_order);
    }
    getPriceUnit(line) {
        return this.env.utils.formatCurrency(line.price_unit);
    }
    getTotal(line) {
        return this.env.utils.formatCurrency(line.price_subtotal_incl);
    }
    getPartner() {
        return this.getSelectedOrder().get_partner_name();
    }
    getSearchBarConfig() {
        return {
            searchFields: new Map(
                Object.entries(this._getSearchFields()).map(([key, val]) => [
                    key,
                    val.displayName,
                ])
            ),
            filter: {show: true, options: this._getFilterOptions()},
            defaultSearchDetails: this._state.ui.searchDetails,
            defaultFilter: this._state.ui.filter,
        };
    }
    shouldShowPageControls() {
        return this._getLastPage() > 1;
    }
    getPageNumber() {
        if (!this._state.syncedOrderLines.totalCount) {
            return `1/1`;
        }
        return `${this._state.syncedOrderLines.currentPage}/${this._getLastPage()}`;
    }
    getSelectedPartner() {
        const order = this.getSelectedOrder();
        return order ? order.get_partner() : null;
    }
    switchPane() {
        this.pos.switchPaneTicketScreen();
    }
    closeHistoryScreen() {
        this.pos.ticket_screen_mobile_pane = "left";
        this.pos.closeScreen();
    }
    _getFilterOptions() {
        const orderStates = this._getOrderStates();
        orderStates.set("SYNCED", {text: _t("History")});
        return orderStates;
    }
    _getSearchFields() {
        const fields = {
            PRODUCT_ID: {
                repr: (line) => line.product_id,
                displayName: _t("Product"),
                modelField: "product_id",
            },
            BARCODE: {
                repr: (line) => line.product_id.barcode,
                displayName: _t("Barcode"),
                modelField: "product_id.barcode",
            },
            DATE: {
                repr: (line) => formatDateTime(line.date_order),
                displayName: _t("Date"),
                modelField: "order_id.date_order",
                formatSearch: (searchTerm) => {
                    const includesTime = searchTerm.includes(":");
                    let parsedDateTime = "";
                    try {
                        parsedDateTime = parseDateTime(searchTerm);
                    } catch {
                        return searchTerm;
                    }
                    if (includesTime) {
                        return parsedDateTime.toUTC().toFormat("yyyy-MM-dd HH:mm:ss");
                    }
                    return parsedDateTime.toFormat("yyyy-MM-dd");
                },
            },
        };
        return fields;
    }
    _getOrderStates() {
        const states = new Map();
        return states;
    }
    getSortableColumns() {
        const sortable_columns_list = [
            {label: "Date", field: "date_order"},
            {label: "Product", field: "full_product_name"},
            {label: "Qty", field: "qty"},
            {label: "Price Unit", field: "price_unit"},
            {label: "Total", field: "price_subtotal_incl"},
        ];
        return sortable_columns_list;
    }
    /**
     * Return the formatted value for a given field in a line.
     * Override or extend this to customize specific fields.
     *
     * @param {String} field - The field name.
     * @param {Object} line - The order line record.
     * @returns {*} - Formatted value for display.
     */
    formatRowValue(field, line) {
        switch (field) {
            case "date_order":
                return this.getDate(line);
            case "price_unit":
                return this.getPriceUnit(line);
            case "price_subtotal_incl":
                return this.getTotal(line);
            default:
                return line[field] ?? "";
        }
    }
    /**
     * Build a full formatted row based on current sortable columns.
     *
     * @param {Object} line - The order line record.
     * @returns {Array} - List of formatted values for table row.
     */
    getFormattedRow(line) {
        return this.getSortableColumns().map((col) =>
            this.formatRowValue(col.field, line)
        );
    }
    onClickColumn(sort_type = "id", ev) {
        const $allCols = $(".header-row .col");
        const $target = $(ev.currentTarget);
        const $icon = $target.find("i.fa");
        const isCurrentlyDescending = $icon.hasClass("fa-angle-down");
        // Reset all columns
        $allCols
            .removeClass("table-active")
            .find("i.fa")
            .removeClass("fa-angle-up fa-angle-down")
            .addClass("fa-angle-down");
        // Set active column
        $target.addClass("table-active");
        $icon.toggleClass("fa-angle-up", isCurrentlyDescending);
        $icon.toggleClass("fa-angle-down", !isCurrentlyDescending);
        const sortOrder = isCurrentlyDescending ? "asc" : "desc";
        const order_by = `${sort_type} ${sortOrder}`;
        this._fetchSyncedOrderLines(order_by);
    }
    _computeSyncedOrderLinesDomain() {
        const {fieldName} = this._state.ui.searchDetails;
        let {searchTerm} = this._state.ui.searchDetails;
        const domain = [["order_id.partner_id", "ilike", `%${this.getPartner()}%`]];
        if (!searchTerm) {
            return domain;
        }
        if (fieldName == "BARCODE") {
            try {
                var parsed_results =
                    this.pos.barcodeReader.parser.parse_barcode(searchTerm);
                const productBarcode = parsed_results.find(
                    (element) => element.type === "product"
                );
                if (productBarcode) {
                    searchTerm = productBarcode.base_code;
                }
            } catch {}
        }
        const searchField = this._getSearchFields()[fieldName];
        if (searchField) {
            if (searchField.formatSearch) {
                searchTerm = searchField.formatSearch(searchTerm);
            }
            domain.push([searchField.modelField, "ilike", `%${searchTerm}%`]);
            return domain;
        }
        return domain;
    }
    async _fetchSyncedOrderLines(orderby = "id") {
        const domain = this._computeSyncedOrderLinesDomain();
        const limit = this._state.syncedOrderLines.nPerPage;
        const offset =
            (this._state.syncedOrderLines.currentPage - 1) *
            this._state.syncedOrderLines.nPerPage;
        // Const orderby = $(".history_sort_by").val();
        const config_id = this.pos.config.id;
        const LinesInfo = await this.orm.call(
            "pos.order",
            "search_paid_orderline_ids",
            [],
            {config_id, domain, limit, offset, orderby}
        );
        const {totalCount} = LinesInfo;
        let {orderLinesInfo} = LinesInfo;
        const idsNotInCache = orderLinesInfo.filter(
            (orderLineInfo) => !(orderLineInfo[0] in this._state.syncedOrderLines.cache)
        );
        // If no cacheDate, then assume reasonable earlier date.
        const cacheDate =
            this._state.syncedOrderLines.cacheDate || DateTime.fromMillis(0);
        const idsNotUpToDate = orderLinesInfo.filter((orderLineInfo) => {
            return deserializeDateTime(orderLineInfo[1]) > cacheDate;
        });
        const idsToLoad = idsNotInCache.concat(idsNotUpToDate).map((info) => info[0]);
        if (idsToLoad.length > 0) {
            const fetchedOrderLines = await this.orm.call(
                "pos.order.line",
                "export_for_ui",
                [idsToLoad]
            );
            const fetchedOrderLineIds = new Set(
                fetchedOrderLines.map((line) => line.id)
            );
            const notLoadedIds = idsNotInCache.filter(
                (orderLineInfo) => !fetchedOrderLineIds.has(orderLineInfo[0])
            );
            orderLinesInfo = orderLinesInfo.filter(
                (orderLineInfo) => !notLoadedIds.includes(orderLineInfo[0])
            );
            await this.pos._loadMissingHistoryProducts(fetchedOrderLines);
            fetchedOrderLines.forEach((orderLine) => {
                this._state.syncedOrderLines.cache[orderLine.id] = orderLine;
            });
            this._state.syncedOrderLines.cacheDate = DateTime.local();
        }
        const ids = orderLinesInfo.map((info) => info[0]);
        this._state.syncedOrderLines.totalCount = totalCount;
        this._state.syncedOrderLines.toShow = ids.map(
            (id) => this._state.syncedOrderLines.cache[id]
        );
    }
    _getLastPage() {
        const totalCount = this._state.syncedOrderLines.totalCount;
        const nPerPage = this._state.syncedOrderLines.nPerPage;
        const remainder = totalCount % nPerPage;
        if (remainder === 0) {
            return totalCount / nPerPage;
        }
        return Math.ceil(totalCount / nPerPage);
    }
}
registry.category("pos_screens").add("CustomerHistoryScreen", CustomerHistoryScreen);
