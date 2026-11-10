# Migration Notes - Odoo 19.0

## Scope

This document describes the migration of `pos_sale_product_config_no_variant` from a
legacy POS integration pattern (Odoo 16 style) to the Odoo 19 POS architecture while
preserving functional behavior.

## Functional Goal Kept

The module still ensures that **no-variant attribute values selected in POS** are
available on `pos.order.line` and visible in backend order lines through the **Extra
Values** field.

## Why Changes Were Needed

Odoo 19 POS uses a different frontend and data-loading architecture:

- Legacy frontend extension style (`odoo.define`, `Registries`) is obsolete for this use
  case.
- Legacy backend hooks used by older POS flows are no longer valid in Odoo 19:
  - `_order_line_fields`
  - `_get_fields_for_order_line`
  - `_loader_params_*` style hooks used in this module
- Odoo 19 already provides native attribute propagation through `attribute_value_ids` on
  `pos.order.line`.

## Implemented Changes

### 1) Backend model logic aligned with Odoo 19

Updated `models/pos_order_line.py`:

- Kept `product_no_variant_attribute_value_ids` as a stored computed field.
- Reworked compute dependencies to rely on native Odoo 19 data:
  - `@api.depends("product_id", "attribute_value_ids")`
- Compute now derives values from `attribute_value_ids` filtered by:
  - same product template
  - `create_variant == "no_variant"`

This removes custom parsing/normalization logic that is no longer required in Odoo 19.

### 2) Removed obsolete backend overrides

Deleted files no longer valid in Odoo 19:

- `models/pos_order.py`
- `models/pos_session.py`

Updated `models/__init__.py` accordingly.

### 3) Removed legacy POS JS patches

Deleted legacy JS files:

- `static/src/js/ProductScreen.js`
- `static/src/js/OrderLines.js`
- `static/src/js/PosProductConfig.js`

Reason: Odoo 19 already handles configurator payload and selected attribute values
natively in POS app models/services.

### 4) Manifest cleanup

Updated `__manifest__.py`:

- Removed obsolete POS asset bundle declaration for legacy JS patches.
- Kept only required module metadata and backend view data.

## Compatibility and Behavior

- The feature remains available from a business perspective: users can still see
  selected no-variant values in POS order lines (`Extra Values`).
- The implementation now follows Odoo 19 native mechanisms, reducing technical debt and
  migration risk.

## Validation Performed

- Static code validation reported no errors after cleanup.
- Repository status confirmed expected file modifications/deletions.

## Automated Tests Added (TransactionCase)

A dedicated TransactionCase test suite was added to validate the compute logic in an
Odoo 19-compatible way:

- `tests/test_pos_order_line.py`

Test design:

- Uses `setUpClass` to create all required fixtures (attributes, attribute values,
  product templates, PTAVs).
- Verifies `_compute_no_variant_attribute_values` keeps only:
  - values from the same product template
  - values with `create_variant == "no_variant"`
- Verifies compute result is empty when `product_id` is not set.

This test scope is focused on functional correctness of the migrated compute path for
`pos.order.line`.

## Coverage Objective

The target is to push module coverage close to 97% for the migrated logic area. Exact
global coverage depends on the full project test matrix execution and coverage tooling
configuration in the target CI environment.

## Recommended Runtime Validation

1. Upgrade the module in a test database.
2. Create/use a product template with attributes configured as `no_variant`.
3. In POS, add product and select attribute values.
4. Confirm order and inspect backend POS order line.
5. Verify `Extra Values` contains the selected no-variant attribute values.

## Notes for Future Maintenance

- Prefer extending Odoo 19 POS through native model/serialization flow before
  introducing custom frontend patches.
- Keep this module focused on backend visibility/reporting of no-variant values, not on
  replacing core configurator behavior.
