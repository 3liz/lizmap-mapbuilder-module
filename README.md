MapBuilder module
=================

Add this to `localconfig.ini.php` in `modules` section
```
mapBuilder.access=2

```

Then execute Lizmap install scripts

```
php lizmap/install/installer.php
lizmap/install/clean_vartmp.sh
lizmap/install/set_rights.sh
```

Write your configuration in `/var/config/mapBuilder.ini.php`