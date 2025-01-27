# Run Lizmap stack with docker compose

Steps:

- clean previous versions (optional)

  ```bash
  make clean
  ```

- Launch Lizmap with docker compose

  ```bash
  make run
  ```

  If you want to use a specific version of Lizmap (for example a local docker image),
  indicate the version of the docker image into `LIZMAP_VERSION_TAG`:

  ```bash
  make run LIZMAP_VERSION_TAG=3.8
  ```

- Add the test data
  ```bash
  make import-test-data
  ```

- Then install modules

  ```bash
  make install-module
  ```

- Finally, add the needed Lizmap rights with some mapbuilder rights

  ```bash
  make import-lizmap-acl
  ```

- Open your browser at `http://localhost:9016`

For more information, refer to the [docker compose documentation](https://docs.docker.com/compose/)

## Javascript build

Javascript has to be built with webpack.

### Development

Run `npm run watch` in `mapBuilder/www/js/` directory. Files will be built and put in `tests/lizmap/www/mapBuilder/js/`.

### Production

When ready for production run `npm run build` in `mapBuilder/www/js/` directory. Files will be built and put in `mapBuilder/www/js/dist/`.

## Add some demo projects

```bash
cd tests/instances
git clone git@github.com:3liz/lizmap-web-client-demo.git
cp -R lizmap-web-client-demo/*/* .
```

Limitation: only projects with files database will work currently. Others need sql to loaded in the docker container and the PG_SERVICE environment variable set.

## Access to the dockerized PostgreSQL instance

You can access the docker PostgreSQL test database `lizmap` from your host by configuring a
[service file](https://docs.qgis.org/latest/en/docs/user_manual/managing_data_source/opening_data.html#postgresql-service-connection-file).
The service file can be stored in your user home `~/.pg_service.conf` and should contain this section

```ini
[lizmap-mapbuilder]
dbname=lizmap
host=localhost
port=9018
user=lizmap
password=lizmap1234!
```

Then you can use any PostgreSQL client (psql, QGIS, PgAdmin, DBeaver) and use the `service`
instead of the other credentials (host, port, database name, user and password).

```bash
psql service=lizmap-mapbuilder
```

## Access to the lizmap container

If you want to enter into the lizmap container to execute some commands,
execute `make shell`.

## Linters

In order to test your code with linters, you can refer to the [contributors readme file](../CONTRIBUTING.md).
