# MapBuilder module

![demo](demo.jpg "3Liz Map Builder")

You can have a look at our [map builder demo](https://demo.lizmap.com/mapbuilder/).
* OSM project
* Local Urbanism Plan project
* Combine these two projects into a single one using the Map Builder

### Installation

Add this to `localconfig.ini.php` in `modules` section
```ini
mapBuilder.access=2
mapBuilderAdmin.access=2
```

Then execute Lizmap install scripts

```bash
php lizmap/install/installer.php
lizmap/install/clean_vartmp.sh
lizmap/install/set_rights.sh
```

Write your configuration in `/var/config/mapBuilder.ini.php` or use the administration of Lizmap
