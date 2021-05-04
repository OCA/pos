A different receipt template is used if the PoS ticket is printed via web or
via proxy. In the case the ticket is printed via web (through the browser) the
company logo isn't printed. This module adds it.

In other hand, company_logo is loaded using `/web/binary/company_logo`
controller `that returns a 150px wide logo <https://github.com/odoo/odoo/blob/11.0/addons/point_of_sale/static/src/js/models.js#L481>`_:

but after that logo is resized to 300px width, so a pixelled logo appears even
original logo is 300px wide.
That's why we override how company_logo is loaded. We also resized it to 260px
(not 300px) wide because appears cut in PDF.
