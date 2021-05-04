**Context**

In Point Of Sale module, the front-end works offline, so all datas are
loaded at the beginning.
At the end of the session, if user doesn't close the window, it will be
possible to create new PoS order on a closed session, generating errors.

**Functionality**

This module prevent the possility to create a PoS order via the front
end PoS UI, when session is closed.

The session state is checked every minute by default. If the state of the
session is not opened, a blocking pop up is displayed, and user has to
open a new session.

.. figure:: ../static/description/error_message.png
