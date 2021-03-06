CREATE TABLE public.books
(
    id serial,
    user_id integer,
    name text,
    slug text,
    description text,
    genre text,
    public boolean DEFAULT false,
    public_read_only boolean DEFAULT false,
    created_at time with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at time with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at time with time zone,
    PRIMARY KEY (id)
);

ALTER TABLE public.books
    OWNER to avi;