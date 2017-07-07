FROM ubuntu:16.04

RUN apt-get update
RUN apt-get install -y nano curl
RUN apt-get install -y nginx
#for wsl sudo add-apt-repository ppa:ondrej/php
RUN apt-get install -y php-fpm
RUN apt-get install -y php-mysql
RUN apt-get install -y debconf-utils
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q mysql-server
RUN apt-get install -y sudo
#to get php-fpm7.0 running
RUN apt-get install -y libpcre3
RUN apt-get install -y php-xdebug
RUN apt-get install -y supervisor

#php config changing path info for security
RUN sed -i 's/;cgi.fix_pathinfo=1/cgi.fix_pathinfo=0/' /etc/php/7.0/fpm/php.ini
#php configuration
ADD php.ini /etc/php/7.0/fpm/php.ini
ADD php.ini /etc/php/7.0/cli/php.ini
#xdebug configuration
ADD xdebug.ini /etc/php/7.0/mods-available/xdebug.ini
#supervisor configuration
ADD supervisord.conf /etc/supervisor/conf.d/supervisord.conf
#is this necessary?
RUN mkdir -p /var/run/php

# Composer
RUN php -r "readfile('https://getcomposer.org/installer');" | php -- --install-dir=/usr/local/bin --filename=composer


# Download WordPress CLI
RUN curl -L "https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar" > /usr/bin/wp && \
    chmod +x /usr/bin/wp

# Apache access
# RUN chown -R www-data:www-data /var/www/html && rm /var/www/html/index.html

# nginx site configuration
ADD default.conf /etc/nginx/sites-available/default
ADD default.conf /etc/nginx/conf.d/
ADD www.conf /etc/php/7.0/fpm/pool.d/www.conf
#nginx configuration
ADD nginx.conf /etc/nginx/nginx.conf
#mysql startup script
#where I left off on wsl <----------------------------------
ADD config_and_start_mysql.sh /config_and_start_mysql.sh
#wordpress configuration and startup script
ADD config_wordpress.sh /config_wordpress.sh
#Xdebug remote host ip mapper
ADD xdebug.sh /xdebug.sh
#run script
ADD run.sh /run.sh
#permission denied if not set.
RUN chmod 755 /*.sh

# MySQL environment variables
ENV MYSQL_WP_USER WordPress
ENV MYSQL_WP_PASSWORD secret

# WordPress environment variables
ENV WP_URL localhost
#ENV WP_THEME_FOLDER mytheme
ENV WP_TITLE WordPress SymphonyAgencyDevSite
ENV WP_ADMIN_USER developer
ENV WP_ADMIN_PASSWORD symphonypassword123
ENV WP_ADMIN_EMAIL developer@symphonyagency.com
ENV LOCAL_IP 1.1.1.1

EXPOSE 80 3306

CMD ["/run.sh"]