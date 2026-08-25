1. Go to **Point of Sale → Configuration → Settings** and select your
   POS.
2. Ensure **IoT Box** is **not** checked.
3. Under the **PyWebDriver** section, enable **Enable PyWebDriver**.
4. Set the **Proxy IP Address** to the URL where PyWebDriver is
   listening (default: `https://127.0.0.1:8069`).
5. Save.

> **Note:** Enabling **IoT Box** will automatically disable PyWebDriver,
> and enabling PyWebDriver will automatically disable IoT Box. They
> cannot be active at the same time.
