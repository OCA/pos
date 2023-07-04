/*
    Copyright 2023 Camptocamp SA (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.EventFilters", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");
    const {useState} = owl;

    class EventFilters extends PosComponent {
        setup() {
            super.setup();
            this.state = useState({
                filters: this.props.filters,
            });
        }
        /**
         * @property {Object} Configuration for SearchBar component
         */
        get searchBarConfig() {
            return {
                searchFields: new Map([
                    ["display_name", this.env._t("Name")],
                    ["event_type_id", this.env._t("Type")],
                    ["country_id", this.env._t("Country")],
                ]),
                filter: {
                    show: false,
                    options: new Map(),
                },
                defaultSearchDetails: {
                    fieldName: "display_name",
                    searchTerm: "",
                },
            };
        }
        /**
         * @property {Array} List of event tag filters to display
         */
        get eventTagFilters() {
            const filters = [];
            for (const category of this.env.pos.db.event_tags) {
                filters.push({
                    id: category.id,
                    label: category.name,
                    options: category.tag_ids.map((tag) => {
                        return {
                            label: tag.name,
                            value: tag.id,
                            checked: Boolean(
                                this.state.filters.find(
                                    (filter) =>
                                        filter.kind === "tag" &&
                                        filter.data.tagID === tag.id
                                )
                            ),
                        };
                    }),
                });
            }
            return filters;
        }
        /**
         * Remove applied filters that match the given conditions
         *
         * @param {Function} condition
         */
        removeFilters(condition) {
            this.state.filters = this.state.filters.filter(
                (filter) => !condition(filter)
            );
        }
        /**
         * @event
         * @param {Event} event
         * @param {String} event.detail.fieldName
         * @param {String} event.detail.searchTerm
         */
        onSearch(event) {
            const {fieldName, searchTerm} = event.detail;
            // Clear existing search filters for this fieldName
            this.removeFilters(
                (filter) =>
                    filter.kind === "search" && filter.data.fieldName === fieldName
            );
            // Add the new search filter
            if (searchTerm) {
                this.state.filters.push({
                    kind: "search",
                    data: {fieldName, searchTerm},
                    label: this.searchBarConfig.searchFields.get(fieldName),
                    value: searchTerm,
                });
            }
            this.trigger("change", this.state.filters);
        }
        /**
         * @event
         * @param {Event} event
         * @param {Array} event.detail List of tag IDs
         * @param {Object} tagFilter The tag category
         */
        onTagsFilterChange(event, tagFilter) {
            const tags = event.detail;
            // Clear existing tag filters for this category not in the new selected list
            this.removeFilters(
                (filter) =>
                    filter.kind === "tag" &&
                    filter.data.categoryID === tagFilter.id &&
                    !tags.includes(filter.data.tagID)
            );
            // Add new tag filters for this category
            for (const tagID of tags) {
                if (
                    this.state.filters.find(
                        (filter) => filter.kind === "tag" && filter.data.tagID === tagID
                    )
                ) {
                    continue;
                }
                this.state.filters.push({
                    kind: "tag",
                    data: {tagID, categoryID: tagFilter.id},
                    label: tagFilter.label,
                    value: tagFilter.options.find((option) => option.value === tagID)
                        .label,
                });
            }
            this.trigger("change", this.state.filters);
        }
        /**
         * @event
         * @param {Event} event
         * @param {Number} index Filter index
         */
        onRemoveFilter(event, index) {
            this.state.filters.splice(index, 1);
            this.trigger("change", this.state.filters);
        }
    }
    EventFilters.template = "EventFilters";

    Registries.Component.add(EventFilters);
    return EventFilters;
});
