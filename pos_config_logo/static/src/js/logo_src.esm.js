function _guessImageMime(b64) {
    if (b64.startsWith("/9j/")) {
        return "image/jpeg";
    }
    if (b64.startsWith("R0lGOD")) {
        return "image/gif";
    }
    if (b64.startsWith("UklGR")) {
        return "image/webp";
    }
    return "image/png";
}

/**
 * Build a receipt-safe src for the per-POS logo.
 *
 * 16.0 loaded ``/web/image?model=pos.config`` (relative) and converted it
 * to a data URI via canvas (``config_logo_base64``) so the printed ticket did
 * not depend on a later HTTP fetch. The 18.0 migration replaced that with
 * ``web.base.url`` + ``/web/image?model=pos.config``, which returns Odoo's
 * camera placeholder when the request has no session cookie (localhost vs
 * 127.0.0.1, print preview). Company logos stay public; ``pos.config.logo``
 * does not. Embed the binary already loaded into the POS, with a relative
 * ``/web/image`` fallback (never an absolute ``_base_url``).
 */
export function posConfigLogoSrc(config) {
    if (!config?.id || !config.logo) {
        return false;
    }
    const raw = config.logo;
    if (typeof raw === "string" && (raw.startsWith("data:") || raw.startsWith("/"))) {
        return raw;
    }
    const b64 = String(raw).replace(/\s/g, "");
    if (b64.length > 32) {
        return `data:${_guessImageMime(b64)};base64,${b64}`;
    }
    return `/web/image?model=pos.config&id=${config.id}&field=logo`;
}
