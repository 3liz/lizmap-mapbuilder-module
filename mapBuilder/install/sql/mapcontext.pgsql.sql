CREATE TABLE IF NOT EXISTS public.mapcontext(
  id serial PRIMARY KEY,
  usr_login text NOT NULL,
  is_public boolean NOT NULL,
  mapcontext text NOT NULL
);

DROP INDEX IF EXISTS mapcontext_usr_login_idx;
ALTER TABLE public.mapcontext
DROP CONSTRAINT IF EXISTS mapcontext_usr_login_fkey;

ALTER TABLE public.mapcontext
ADD CONSTRAINT mapcontext_usr_login_fkey FOREIGN KEY (usr_login)
REFERENCES jlx_user (usr_login) MATCH SIMPLE
ON UPDATE CASCADE ON DELETE CASCADE;

CREATE INDEX mapcontext_usr_login_idx ON public.mapcontext( usr_login );
