This module enhances Odoo's Point of Sale (POS) by introducing an age verification system.
When a customer is selected, their age (based on their date of birth) is checked against the
predefined **"Age Warning"** threshold set in the POS configuration.

If the customer's age is **less than or equal** to this threshold, their name
will be displayed in **red** on the POS interface to alert the cashier.

## Use Cases
### **Case 1: Alcohol Sales**
- **"Age Warning" threshold set to 18 years**.
- A customer born on **June 5, 2010**, is selected in **March 2025**.
- **Age**: 2025 - 2010 = **14 years old**.
- **Result**: Their name appears in **red**, warning the cashier.

### **Case 2: Customer is of Legal Age**
- **"Age Warning" threshold set to 18 years**.
- A customer born on **February 2, 2003**, is selected in **March 2025**.
- **Age**: 2025 - 2003 = **22 years old**.
- **Result**: No warning, as the customer is above the age limit.

### **Case 3: Gaming Center (No entry for under 16s)**
- **"Age Warning" threshold set to 16 years**.
- A customer born on **July 15, 2009**, is selected in **March 2025**.
- **Age**: 2025 - 2009 = **15 years old** (birthday in July).
- **Result**: Their name appears in **red** because they are not yet 16.
