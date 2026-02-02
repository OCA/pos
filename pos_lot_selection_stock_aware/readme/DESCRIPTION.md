This module extends `pos_lot_selection` to display available stock quantities
beside each lot/serial number in the Point of Sale interface, and filters out
lots with zero quantity at the POS location.

**Features:**

* Display available quantity beside lot numbers (e.g., "LOT001 (Qty: 15)")
* Auto-filter lots with zero quantity at POS location
* Location-aware filtering (uses POS picking type source location)
* Prevent typing invalid lot numbers (selection-only interface)
* Real-time quantity updates via RPC calls
