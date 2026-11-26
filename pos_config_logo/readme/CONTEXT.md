This module is useful for a company that runs stores with different brandings. To have
a logo from the main branch is weird for the customer of those branded stores.

## Receipt image (why it is embedded)

16.0 put the POS logo on the ticket as a data URI after loading a
**relative** ``/web/image?model=pos.config`` URL (same idea as the core
company logo). The 18.0 migration switched to an absolute
``{web.base.url}/web/image?model=pos.config`` URL.

That URL needs a session cookie. Company logos are typically public;
``pos.config.logo`` is not. If the browser host does not match
``web.base.url`` (``localhost`` vs ``127.0.0.1``) or print runs without
cookies, Odoo returns ``placeholder.png`` (camera icon) even when the
alternative logo is set. Changing ``web.base.url`` only fixes one host.

This module therefore embeds the binary already loaded on the POS as
``data:image/…;base64,…``, with a relative ``/web/image`` fallback (never
``_base_url``). That matches 16.0 and current Odoo receipt guidance:
store the logo as a data URL instead of refetching ``/web/image`` when
printing.
