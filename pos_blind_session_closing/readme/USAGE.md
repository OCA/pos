To use this module and enable blind closing in the POS, follow these steps:

1. Navigate to **Settings** → **Users & Companies** → **Users**

2. Open the user who should be allowed to see the expected closing amounts

3. In the **Extra Rights** tab, enable the group:
   - **Can see POS closing amounts**

4. Users **with this group** will be able to see the expected amounts during the POS session closing.

5. Users **without this group** will perform a **blind closing**, meaning:
   - Expected cash amounts are hidden
   - Only counted amounts can be entered

**Notes:**

- This allows managers or supervisors to see the expected totals while regular cashiers perform a blind cash count.
- The feature applies to the **POS closing popup** when ending a session.
- When **Employees** is installed and the POS uses employee login, the permission is evaluated on the **linked user** of the logged-in employee. Employees without a linked user always perform a blind closing, even if the backend user opening the POS has the group.
