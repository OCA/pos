/* Copyright 2026 INVITU (https://www.invitu.com)
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html). */

// A serialized value (cancelled line) has no attribute_id, only attribute_line_id.
export function isAttributeValueHidden(models, value, field) {
    const attribute =
        value.attribute_id ??
        models["product.template.attribute.line"].get(value.attribute_line_id)
            ?.attribute_id;
    return attribute?.create_variant === "no_variant" && Boolean(attribute[field]);
}
