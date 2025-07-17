CREATE TABLE IF NOT EXISTS mapcontext(
  id serial PRIMARY KEY,
  usr_login text NOT NULL,
  name text NOT NULL,
  is_public boolean NOT NULL,
  mapcontext text NOT NULL
);

DROP INDEX IF EXISTS mapcontext_usr_login_idx;
ALTER TABLE mapcontext
DROP CONSTRAINT IF EXISTS mapcontext_usr_login_fkey;

ALTER TABLE mapcontext
ADD CONSTRAINT mapcontext_usr_login_fkey FOREIGN KEY (usr_login)
REFERENCES jlx_user (usr_login) MATCH SIMPLE
ON UPDATE CASCADE ON DELETE CASCADE;

CREATE INDEX mapcontext_usr_login_idx ON mapcontext( usr_login );
