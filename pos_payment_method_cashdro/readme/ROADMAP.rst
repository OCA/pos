* Cashdro terminals are designed to communicate in the local network, so they can't
  receive or transmit any request to a remote Odoo server. So in order to implement
  further features, la cash control or cash ins/outs it would be necessary to either:

  - Prepare the Cashdro terminal for a remote use (VPN, dns, etc.) and implement the
    corresponding backend methods.
  - Develope PoS frontend modules that allow to perform such operations and extend this
    one making use of them.
