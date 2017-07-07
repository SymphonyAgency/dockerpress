#!/bin/sh
echo "=> setting xdebug local machine settings"
echo "$1"
head -n -1 /etc/php/7.0/mods-available/xdebug.ini > /etc/php/7.0/mods-available/xdebug.tmp
echo "xdebug.remote_host=$1" >> /etc/php/7.0/mods-available/xdebug.tmp
rm /etc/php/7.0/mods-available/xdebug.ini
mv /etc/php/7.0/mods-available/xdebug.tmp /etc/php/7.0/mods-available/xdebug.ini