CREATE TABLE public.companies
(
    id serial,
    user_id integer,
    name text,
    slug text,
    description text,
    website text,
    email text,
    phone text,
    address_number text,
    street text,
    city text,
    postcode text,
    country text,
    size integer,
    rating integer,
    photo text,
    created_at time with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at time with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at time with time zone,
    PRIMARY KEY (id)
);

ALTER TABLE public.companies
    OWNER to avi;