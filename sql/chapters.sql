CREATE TABLE public.chapters
(
    id serial,
    user_id integer,
    book_id integer,
    title text,
    description text,
    text text,
    position text,
    status text,
    slug text,
    public boolean DEFAULT false,
    public_read_only boolean DEFAULT false,
    created_at time with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at time with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at time with time zone,
    PRIMARY KEY (id)
);

ALTER TABLE public.chapters
    OWNER to avi;