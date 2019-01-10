CREATE TABLE IF NOT EXISTS mapcontext(
  id integer PRIMARY KEY AUTOINCREMENT,
  usr_login text NOT NULL,
  name text NOT NULL,
  is_public integer NOT NULL,
  mapcontext text NOT NULL,
  FOREIGN KEY (usr_login) REFERENCES jlx_user (usr_login)
);

DROP INDEX IF EXISTS idx_mapcontext_usr_login;
CREATE INDEX idx_mapcontext_usr_login ON mapcontext( usr_login );
