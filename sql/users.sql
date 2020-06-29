CREATE TABLE public.users
(
    id serial,
    name text,
    email text,
    password text,
    role text,
    created_at time with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at time with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at time with time zone,
    PRIMARY KEY (id)
);

ALTER TABLE public.users
    OWNER to avi;