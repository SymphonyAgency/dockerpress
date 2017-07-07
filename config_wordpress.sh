#!/bin/sh
echo "=> Startiing WordPress"
if [ ! -e /var/www/html/wp-config.php ] ; then
   echo "=> WordPress is not configured yet, configuring WordPress ..."

   echo "=> Installing WordPress"
   chown -R root:root /var/www/html
   sudo -E -u root wp core download --path="/var/www/html" --allow-root
   cd /var/www/html
   sudo -E -u root wp core config --dbname="wordpress" --dbuser="$MYSQL_WP_USER" --dbpass="$MYSQL_WP_PASSWORD" --path="/var/www/html"  --allow-root
   sudo -E -u root wp core install --path='/var/www/html' --url="$WP_URL" --title="$WP_TITLE" --admin_user="$WP_ADMIN_USER" --admin_password="$WP_ADMIN_PASSWORD" --admin_email="$WP_ADMIN_EMAIL" --skip-email  --allow-root
   sudo -E -u root wp plugin install --activate rest-api  --allow-root
#   if [ -d "/var/www/html/wp-content/themes/$WP_THEME_FOLDER/plugins" ]; then
#      FILES=/var/www/html/wp-content/themes/$WP_THEME_FOLDER/plugins/*.zip
#      for f in $FILES
#      do
#        echo "Installing plugin from theme plugins folder $f"
#        sudo -E -u root wp plugin install --activate $f
#      done
#   fi
#   sudo -E -u root wp theme activate $WP_THEME_FOLDER
   sudo -E -u root wp rewrite structure '/%postname%/'  --allow-root
   chown -R root:root /var/www/html
else
   echo "=> WordPress is already configured.";
fi


