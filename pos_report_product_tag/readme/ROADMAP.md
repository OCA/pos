Since product tags are a Many2many field, we had to choose to take the first tag
in the products.
This avoids any double-counting of sales figures that would occur with a direct
Many2many field.
This can be improved if we want real figures for every tag in the products
