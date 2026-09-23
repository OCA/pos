## How It Works

When this module is installed and a payment method has a "Cash Receipt Account" configured, the accounting flow changes:

### Standard Cash Flow (without module)
```
Customer Payment → Cash Journal Account (direct)
```

### With This Module
```
Customer Payment → Cash Receipt Account (intermediate) → Cash Journal Account (final)
```

### Accounting Entries Created

When a POS session is closed, the module creates the following journal entries:

#### Entry 1 - Payment Entry
Records each cash payment through the intermediate account:
- **Debit**: Cash Receipt Account (configured on the payment method)
- **Credit**: Customer's Receivable Account (or appropriate income account)

#### Entry 2 - Transfer Entry
Consolidates all cash from the receipt account into the journal's main cash account:
- **Debit**: Cash Journal Account (final destination)
- **Credit**: Cash Receipt Account (intermediate)

#### Entry 3 - Change Entry (If Applicable)
When customers receive change (pay more than order amount):
- **Debit**: Cash Receipt Account (per change transaction)
- **Credit**: Cash Journal Account (total change given)

## Use Cases

### 1. Basic Cash Payment

**Scenario**: Customer orders 100 USD, pays 100 USD cash

**Result**: Net cash in journal = 100 USD

**Accounting**:
- Entry 1: Dr. Cash Receipt 100 / Cr. Receivable 100
- Entry 2: Dr. Cash Journal 100 / Cr. Cash Receipt 100

### 2. Payment with Change

**Scenario**: Customer orders 8.63 USD, pays 10 USD, receives 1.37 USD change

**Result**: Net cash in journal = 8.63 USD

**Accounting**:
- Entry 1: Dr. Cash Receipt 8.63 / Cr. Receivable 8.63 (net payment grouped)
- Entry 2: Dr. Cash Journal 10 / Cr. Cash Receipt 10 (transfer received amount)
- Entry 3: Dr. Cash Receipt 1.37 / Cr. Cash Journal 1.37 (change given)

### 3. Multiple Orders in One Session

**Scenario**: 
- Order 1: 8.63 USD, paid 10 USD, change 1.37 USD
- Order 2: 20.00 USD, paid 20 USD (exact)
- Order 3: 14.03 USD, paid 20 USD, change 5.97 USD

**Result**: Net cash in journal = 42.66 USD (8.63 + 20.00 + 14.03)

**Accounting**:
- Entry 1: Three payment entries (one per order, if split transactions enabled) to Cash Receipt Account
- Entry 2: One transfer entry consolidating all net payments
- Entry 3: One change entry with 2 lines (one per change transaction)

## Benefits

1. **Audit Trail**: Clear separation between cash received and cash registered
2. **Cash Reconciliation**: Easier to track cash movements and identify discrepancies
3. **Multi-location**: Different POS locations can use different receipt accounts
4. **Change Tracking**: Separate visibility of change given to customers
5. **Compliance**: Meet accounting requirements for intermediate cash handling
