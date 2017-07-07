#!/bin/sh
echo "=> Services configuration"
./config_and_start_mysql.sh
./config_wordpress.sh
echo "=> Finished services configuration"

/usr/bin/supervisord