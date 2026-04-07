# POS Order Line Customer History

This module adds a feature in the Point of Sale (POS) interface to allow users to view the sales history of a selected customer and reuse past order lines in new orders.

## Features

- Adds a **"History" button** above the customer details on the POS screen.
- When clicked, opens a new view showing past `pos.order.line` records for the selected customer.
- If no customer is selected, a popup is displayed with the message:
  > "You must select a customer first"

### History View

- Displays a list of past order lines for the selected customer.
- Ordered by most recent first.
- Shown fields:
  - **Date**
  - **Product**
  - **Quantity**
  - **Discount**
  - **Price Unit**
  - **Total**

### Functionalities

- **Sortable Data**: Users can sort the list by selecting from a dropdown with the following options:
  - Date ASC
  - Date DESC
  - Product ASC
  - Product DESC
  - Price Unit ASC
  - Price Unit DESC
  - Qty ASC
  - Qty DESC
  - Total ASC
  - Total DESC

- **Search Bar**:
  - Filter by **product name** or **barcode**
  - Filter by **date**

- **Line Selection**:
  - Select one or more lines from the list.
  - Add selected products and their quantities to the current POS order.
  - Note: **Discounts and prices are not copied**, only **product and quantity** are reused.

## Usage

1. Select a customer in the POS interface.
2. Click the "History" button to view their order history.
3. Use the search and sort features to find relevant products.
4. Select lines and add them to the current order as needed.

## Technical Information

- Compatible with Odoo 17.0
- Developed following OCA module standards.
