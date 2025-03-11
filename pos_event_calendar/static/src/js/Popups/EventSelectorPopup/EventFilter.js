import { Component, useState } from "@odoo/owl";

export class EventFilter extends Component {
    static template = "pos_event_calendar.EventFilter";
    static props = {
        filters: { type: Array, required: true },
        events: { type: Array, required: true },
        onClickFilter: { type: Function, optional: true },
    };

    setup() {
        this.state = useState({
            filters: this.props.filters,
            searchTerm: '',
            activeTags: [],
        });
        
        this.uniqueTags = this.getUniqueTags();
    }
    
    getUniqueTags() {
        const uniqueTags = new Map();
        
        for (const event of this.props.events || []) {
            if (event.tag_ids && Array.isArray(event.tag_ids)) {
                for (const tag of event.tag_ids) {
                    uniqueTags.set(tag.id, tag);
                }
            }
        }
        
        return Array.from(uniqueTags.values());
    }
    
    handleSearchChange(event) {
        this.state.searchTerm = event.target.value;
        this.applyFilters();
    }

    applyFilters() {
        const filters = [];
        
        if (this.state.searchTerm.trim()) {
            filters.push({
                kind: "search",
                data: {
                    fieldName: "name",
                    searchTerm: this.state.searchTerm,
                }
            });
        }
        
        if (this.state.activeTags.length > 0) {
            filters.push({
                kind: "tags",
                data: {
                    tagIds: this.state.activeTags,
                }
            });
        }

        if (this.props.onClickFilter) {
            this.props.onClickFilter(filters);
        }
    }

    handleTagClick = (tagId) => {
        console.log("Tag clicked:", tagId);
        const tagIndex = this.state.activeTags.indexOf(tagId);
        if (tagIndex >= 0) {
            this.state.activeTags.splice(tagIndex, 1);
        } else {
            this.state.activeTags.push(tagId);
        }
        
        this.applyFilters();
    }

    isTagActive(tagId) {
        return this.state.activeTags.includes(tagId);
    }
}

export default EventFilter;
