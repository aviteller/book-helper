CREATE TABLE public.audits
(
    id serial,
    user_id integer,
    text text,
    model text,
    model_id integer,
    created_at time with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at time with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at time with time zone,
    PRIMARY KEY (id)
);

ALTER TABLE public.audits
    OWNER to avi;