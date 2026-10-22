**Activate the foreign currency**

Who: **Billing Administrator**.

1. Open the **Invoicing** app.
2. Click **Configuration**, then **Accounting**, then **Currencies**.
3. Open the foreign currency.
4. Turn on **Active**.
5. Click **Save**.

A second active currency turns on **Multi-Currencies** for every internal
user.

**Set exchange difference accounts**

Who: a user in **Settings**. The block appears only when
**Multi-Currencies** is on.

1. Open the **Invoicing** app.
2. Click **Configuration**, then **Settings**.
3. In **Default Accounts**, under **Post Exchange difference entries in:**,
   set **Journal**, **Gain** and **Loss**.
4. Click **Save**.

A session that took a foreign tender cannot close while any of these is
empty.

**Set cash and bank difference accounts**

Who: **Billing Administrator**.

1. Open the **Invoicing** app.
2. Click **Configuration**, then **Accounting**, then **Journals**.
3. Open the cash journal used by the Point of Sale cash method.
4. Open the **Journal Entries** tab.
5. Set **Profit Account** and **Loss Account**.
6. Click **Save**.
7. Repeat steps 3 to 6 for each bank journal used by a payment method.

Foreign cash and card closing differences use these accounts.

**Enable foreign currencies on the Point of Sale**

Who: a Point of Sale manager who also has **Settings**. The Point of Sale
currency must be the company currency.

1. Open the **Point of Sale** app.
2. Click **Configuration**, then **Settings**.
3. In the **Payment** section, set **Foreign Currencies**. The company
   currency and the Point of Sale currency are not offered. Leave the list
   empty to take payments in the Point of Sale currency only.
4. Click **Save**.

The list cannot be changed while a session of that Point of Sale is open. A
currency cannot be removed while its last counted closing is not zero.

**Optional: bank currency difference journal**

Who: a Point of Sale manager.

1. Open the **Point of Sale** app.
2. Click **Configuration**, then **Payment Methods**.
3. Open a bank method.
4. Set **Currency Difference Journal** when a foreign card closing
   difference must be posted in another journal. Leave it empty to use the
   method's own journal.
5. Click **Save**.

Cash differences, and differences in the Point of Sale currency, stay on
the method's journal.
