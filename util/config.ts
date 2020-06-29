import "https://deno.land/x/dotenv/load.ts";

let envObj = Deno.env.toObject();

// console.log(+portEnv.DBPORT)

const dbCreds = {
  user: envObj.DBUSER,
  database: envObj.DBNAME,
  password:envObj.DBPASS,
  hostname: envObj.DBHOST,
  port: +envObj.DBPORT,
};
// console.log(dbCreds)
export { dbCreds };
