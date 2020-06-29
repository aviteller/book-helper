CREATE TABLE public.jobs
(
    id serial,
    user_id integer,
    company_id integer,
    title text,
    description text,
    minimum_skill text,
    pay text,
    created_at time with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at time with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at time with time zone,
    PRIMARY KEY (id)
);

ALTER TABLE public.jobs
    OWNER to avi;