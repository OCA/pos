#!/bin/bash
  
export URL_FULL_DOMAIN="my.domain.tld"
export URL_DNS_PROVIDER="dns_gd"  # GoDaddy - many other providers are supported, see acme.sh docs
export GD_Key="......"            # Parameters specific to GoDaddy
export GD_Secret="......"
export CERTIFICATE_PRIVKEY_FILE="/home/pi/ssl.key"
export CERTIFICATE_FULLCHAIN_FILE="/home/pi/ssl.cert"
export ACME_WORK_DIRECTORY="/home/pi/.acme.sh"  # Location of acme.sh clone

########################################################################################
######                                                                            ######
######                   Don't change variables after this line                   ######
######                                                                            ######
########################################################################################

$ACME_WORK_DIRECTORY/acme.sh \
  --home $ACME_WORK_DIRECTORY \
  --issue \
  --dns $URL_DNS_PROVIDER \
  -d $URL_FULL_DOMAIN \
  --key-file $CERTIFICATE_PRIVKEY_FILE \
  --fullchain-file $CERTIFICATE_FULLCHAIN_FILE
