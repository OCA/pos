The configuration of the hardware is done in the configuration file of
the Odoo server of the POSbox. You can add the following entries in
the configuration file (optional).

* posbox_ssl_cert (default = /home/pi/ssl.cert)
* posbox_ssl_key (default = /home/pi/ssl.key)

On these paths you have to put a valid SSL certificate and key for the domain you want to use.

Once the module is installed, loaded and points to a valid SSL certificate on the POSbox side,
you can now configure the Odoo side: in the configuration of a Point of Sale terminal, instead of pointing
the POSbox to `http://x.y.x.y:8069`, you can now point it to `https://domain.name:8069`.

NOTE: It's advisable to place `domain.name` in `/etc/hosts` (or Windows hosts file) of your POS PC as well,
so that when the Internet goes down, the DNS will still resolve to the POSbox IP address.

Automatically refreshing a certificate
--------------------------------------

If you want to automatically refresh the SSL certificate connected to your POSbox, you can use
the [ACME.sh](https://github.com/acmesh-official/acme.sh) shell script. Simply:

#. Clone acme.sh: `git clone https://github.com/acmesh-official/acme.sh /home/pi/.acme.sh`
#. Create an API key in the control panel of your DNS provider
#. Create a script such as [this](scripts/refresh-acme.sh), fill in the domain and the API key
#. Place the script on the POSbox and in the crontab of `pi` user, using `crontab -e`, and add `> dev/null`.
