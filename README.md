# MapBuilder module

![demo](demo.jpg "3Liz Map Builder")

You can have a look at our [map builder demo](https://demo.lizmap.com/mapbuilder/).
* OSM project
* Local Urbanism Plan project
* Combine these two projects into a single one using the Map Builder

### Installation

* MapBuilder 2.0.0 is compatible with Lizmap Web Client >= 3.4.x
* MapBuilder 1.1.x is compatible with Lizmap Web Client < 3.4 and >= 3.2.x

Unzip content in `lizmap/lizmap-modules/`

Add this to `localconfig.ini.php` in `modules` section

```ini
mapBuilder.access=1
mapBuilderAdmin.access=1
```

Add this to `index/config.ini.php` in `modules` section

```ini
mapBuilder.access=2
```

Add this to `admin/config.ini.php` in `modules` section

```ini
mapBuilderAdmin.access=2
```

Then execute Lizmap install scripts

```bash
php lizmap/install/installer.php
lizmap/install/clean_vartmp.sh
lizmap/install/set_rights.sh
```

Write your configuration in `/var/config/mapBuilder.ini.php` or use the administration of Lizmap
