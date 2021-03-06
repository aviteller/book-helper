import { Client } from "https://deno.land/x/postgres/mod.ts";
import { dbCreds } from "../util/config.ts";
import { helpers } from "https://deno.land/x/oak/mod.ts";
import { ErrorResponse } from "../util/errorResponse.ts";
import { auditLog } from "../controllers/audits.ts";
import { IAudit, Audit } from "../models/Audit.ts";

enum EPermissions {
  admin = "admin",
  editable = "editable",
  read = "read-only",
  none = "no-access",
  owner = "owner",
  comments = "add-comment",
}

//init client
const client = new Client(dbCreds);

class DB {
  table?: string;
  alias?: string;
  belongsTo?: any;
  hasOne?: any;
  hasMany?: any;
  record_events?: boolean = false;

  sortBy = (queryParams: any): string => {
    console.log(queryParams)
    let { sort } = queryParams;
    let retrunStr: string = "";
    console.log(sort)
    if (sort !== undefined) {
      if (sort.charAt(0) === "-") {
        retrunStr = ` ORDER BY ${this.alias}.${sort.substring(1)} DESC`;
      } else {
        retrunStr = ` ORDER BY ${this.alias}.${sort} ASC`;
      }
    } else {
      ` ORDER BY created_at ASC `;
    }
    return retrunStr;
  };

  totalRows = async (serachStr: string, deleted?: boolean) => {
    let returnNo: number = 0;

    const { rows } = await client.query(
      `SELECT COUNT(*) FROM ${this.table}
       WHERE 
          CASE WHEN ${deleted} THEN
               deleted_at is not null ${serachStr.replace("OR", "AND")}
               ELSE
               deleted_at is null ${serachStr}
          END`,
    );

    returnNo = +rows;

    return returnNo;
  };

  searchBy = (queryParams: any): string => {
    let { search } = queryParams;
    let returnStr: string = "";
    if (search !== undefined) {
      returnStr = " AND ";

      let searchParams = search.split("|");
      let searchFields: Array<string> = searchParams[1].split(",");
      let searchValue = searchParams[0];
      let arrLen = searchFields.length;

      searchFields.forEach((s, i) => {
        returnStr +=
          ` CAST(${this.alias}${s} as TEXT) ILIKE '%${searchValue}%' `;
        if (i + 1 < arrLen) returnStr += " OR ";
      });
    }

    return returnStr;
  };

  getDeleted = (queryParams: any): boolean => {
    let { deleted } = queryParams;
    if (deleted !== undefined) return true;
    else return false;
  };

  getPageAndLimit = (
    queryParams: any,
  ): {
    page: number;
    limit: any;
    endIndex: number;
    pageStr: string;
  } => {
    let { page, limit } = queryParams;
    const returnObj: any = new Object();
    const startPage: any = page !== undefined ? page : 1;
    const pageLimit: number = limit !== undefined ? limit : 10;

    let startIndex = (startPage - 1) * pageLimit;
    returnObj.endIndex = startPage * pageLimit;
    returnObj.page = startPage;
    returnObj.limit = pageLimit;

    if (startPage !== "All") {
      returnObj.pageStr = `LIMIT ${pageLimit} OFFSET ${startIndex}`;
    } else {
      returnObj.pageStr = `LIMIT 500`;
    }

    return returnObj;
  };

  getAll = async (ctx: any, joinOwner?: boolean, optSelectFields?: string) => {
    let response: any = new Object();
    let queryParams = helpers.getQuery(ctx);
    let { select, sort } = queryParams;

    try {
      select = select !== undefined ? select : optSelectFields || "*";

      await client.connect();

      const orderBy: string = await this.sortBy(queryParams);

      const searchByString: string = await this.searchBy(queryParams);

      const selectFields: string = select === "*"
        ? "*"
        : `${this.alias}.${select.split(",").join(`,${this.alias}.`)}`;

      const deleted = (await this.getDeleted(queryParams)) ? "is not" : "is";

      const pageAndLimitObject = await this.getPageAndLimit(queryParams);

      let join = joinOwner
        ? ` JOIN (SELECT ${this.belongsTo.fields ||
          "*"} FROM  ${this.belongsTo.table}) ${this.belongsTo.alias} ON ${this.alias}.${this.belongsTo.selector} = ${this.belongsTo.alias}.id`
        : "";

      const finalQuery =
        `SELECT ${selectFields} FROM ${this.table} AS ${this.alias} ${join}  WHERE ${this.alias}.deleted_at ${deleted} null ${searchByString} ${orderBy} ${pageAndLimitObject.pageStr} `;
      // console.log(finalQuery)
      const result = await client.query(finalQuery);
      // console.log(result.rows)
      const resObj: any = new Object();

      const resultsArray: Array<Object> = new Array();

      let orignalTableOid: number = 0;

      result.rows.map((p) => {
        let obj: any = new Object();
        let ownerObj: any = new Object();
        result.rowDescription.columns.map((el, i) => {
          if (orignalTableOid === 0) {
            orignalTableOid = el.tableOid;
            obj[el.name] = p[i];
          } else if (el.tableOid === orignalTableOid) {
            obj[el.name] = p[i];
          } else {
            ownerObj[el.name] = p[i];
            obj.owner = ownerObj;
          }
        });
        resultsArray.push(obj);
      });

      const total = await this.totalRows(
        searchByString,
        await this.getDeleted(queryParams),
      );

      resObj.pagination = await this.pagination(pageAndLimitObject, total);
      resObj.pagination.count = result.rowCount;
      resObj.rows = resultsArray;
      resObj.sortBy = sort;

      return resObj;
    } catch (error) {
      throw new ErrorResponse(error.toString(), 404);
    } finally {
      await client.end();
    }

    return response;
  };

  pagination = (
    pageObj: {
      page: number;
      limit: any;
      endIndex: number;
      pageStr: string;
    },
    total: number,
  ): Object => {
    const returnObj: any = new Object();
    if (pageObj.limit !== "max") {
      if (pageObj.page != 1) returnObj.prevPage = pageObj.page - 1;
      returnObj.currentPage = +pageObj.page;
      returnObj.totalPages = Math.ceil(total / pageObj.limit);
      returnObj.totalRows = total;
      returnObj.limit = pageObj.limit;

      if (pageObj.endIndex < total) {
        returnObj.nextPage = +pageObj.page + 1;
      }
    }

    return returnObj;
  };

  getAllByValue = async (field: string, value: string, deleted?: boolean, params?:any) => {
    let response: any = new Object();

    let result: any;
    try {
      try {
        await client.connect();
        
const sort = await this.sortBy(params);
        // let {sortfield} = params
        // if(Object.values(params).includes("sortfield")) sort = ` ORDER BY ${sortfield} `
        // console.log(Object.values(params))
        let searchDeleted = deleted ? "is not" : "is";

        console.log( `SELECT * FROM ${this.table} WHERE ${field} = $1 AND deleted_at ${searchDeleted} null ${sort}`)
        result = await client.query(
          `SELECT * FROM ${this.table} as ${this.alias} WHERE ${this.alias}.${field} = $1 AND deleted_at ${searchDeleted} null ${sort}`,
          value,
        );
      } catch (error) {
        throw new ErrorResponse(error.toString(), 404);
      }

      if (result.rows.toString() === "") {
        return 0;
      } else {
        const resObj: any = new Object();
        const resultsArray: Array<Object> = new Array();
        result.rows.map((p: any) => {
          let obj: any = new Object();
          result.rowDescription.columns.map(
            (el: any, i: any) => (obj[el.name] = p[i]),
          );
          resultsArray.push(obj);
        });
        resObj.rows = resultsArray;
        return resObj;
      }
    } catch (error) {
      throw new ErrorResponse(error.toString(), 404);
    } finally {
      await client.end();
    }

    return response;
  };

  getOne = async (id: string, deleted?: boolean, returnTo: boolean = false) => {
    let response: any = new Object();
    try {
      await client.connect();

      let searchDeleted = deleted ? "is not" : "is";

      const result = await client.query(
        `SELECT * FROM ${this.table} WHERE id = $1 AND deleted_at ${searchDeleted} null`,
        id,
      );

      if (result.rows.toString() === "") {
        if (returnTo) return false;
        throw new ErrorResponse("No rows found", 404);
      } else {
        const resObj: any = new Object();
        result.rows.map((p) =>
          result.rowDescription.columns.map((el, i) => (resObj[el.name] = p[i]))
        );
        return resObj;
      }
    } catch (error) {
      throw new ErrorResponse(error.toString(), 404);
    } finally {
      await client.end();
    }

    return response;
  };

  getOneByValue = async (field: string, value: string, deleted?: boolean) => {
    try {
      await client.connect();

      let searchDeleted = deleted ? "is not" : "is";

      const result = await client.query(
        `SELECT * FROM ${this.table} WHERE ${field} = $1 AND deleted_at ${searchDeleted} null`,
        value,
      );

      if (result.rows.toString() === "") {
        return false;
      } else {
        const resObj: any = new Object();
        result.rows.map((p) =>
          result.rowDescription.columns.map((el, i) => (resObj[el.name] = p[i]))
        );
        return resObj;
      }
    } catch (error) {
      throw new ErrorResponse(error.toString(), 404);
    } finally {
      await client.end();
    }
  };

  customQuery = async (query: string, toReturn: boolean = false, ...params:any) => {
    try {
      await client.connect();
      
      const result = await client.query(query, ...params);

      if (result.rows.toString() === "") {
        if (!toReturn) {
          throw new ErrorResponse("Resource could not be found", 404);
        } else return null;
      } else {
        const resObj: any = new Object();
        const resultsArray: Array<Object> = new Array();
        result.rows.map((p: any) => {
          let obj: any = new Object();
          result.rowDescription.columns.map(
            (el: any, i: any) => (obj[el.name] = p[i]),
          );
          resultsArray.push(obj);
        });
        resObj.rows = resultsArray;
        return resObj;
    
      }
    } catch (error) {
      throw new ErrorResponse(error.toString(), 404);
    } finally {
      await client.end();
    }
  };

  updateOne = async (values: any, id: string) => {
    let response: any = new Object();
    let res = await this.getOne(id);
    if (res.error) {
      response.error = res.error;
      return response;
    } else {
      const updatedColumns = new Array();
      const updatedValues = new Array();

      let i = 1;
      for (const v in values) {
        updatedColumns.push(`${v}=$${i++}`);
        updatedValues.push(values[v]);
      }

      const updatedQuery = `UPDATE ${this.table} SET ${
        updatedColumns.join(
          ",",
        )
      }, updated_at = CURRENT_TIMESTAMP WHERE id = ${id} RETURNING *`;

      try {
        await client.connect();

        const result = await client.query(updatedQuery, ...updatedValues);

        const resObj: any = new Object();
        result.rows.map((p) =>
          result.rowDescription.columns.map((el, i) => (resObj[el.name] = p[i]))
        );

        if (result.rows.toString() === "") {
          throw new ErrorResponse("Error updating", 404);
        } else {
          if (this.record_events && this.table) {
            this.auditLog(
              this.table,
              resObj.id,
              `Updated ${JSON.stringify(values)}`,
              resObj.user_id,
            );
          }
          return resObj;
        }
      } catch (error) {
        throw new ErrorResponse(error.toString(), 404);
      } finally {
        await client.end();
      }
      return response;
    }
  };

  addOne = async (values: any) => {
    let response: any = new Object();
    const insertColumns = new Array();
    const insertValues = new Array();
    const insertPlaceholder = new Array();

    let i = 1;
    for (const v in values) {
      insertColumns.push(v);
      insertValues.push(values[v]);
      insertPlaceholder.push(`$${i++}`);
    }

    const insertQuery = `INSERT INTO ${this.table}(${
      insertColumns.join(
        ",",
      )
    }) VALUES(${insertPlaceholder}) RETURNING *`;

    try {
      await client.connect();

      const result = await client.query(insertQuery, ...insertValues);

      const resObj: any = new Object();

      result.rows.map((p) =>
        result.rowDescription.columns.map((el, i) => (resObj[el.name] = p[i]))
      );

      if (result.rows.toString() === "") {
        throw new ErrorResponse("Error adding tow", 404);
      } else {
        if (this.record_events && this.table) {
          this.auditLog(this.table, resObj.id, "Added", resObj.user_id);
        }
        return resObj;
      }
    } catch (error) {
      throw new ErrorResponse(error.toString(), 404);
    } finally {
      await client.end();
    }

    return response;
  };

  deleteOne = async (id: string) => {
    let response: any = new Object();
    let res = await this.getOne(id, false, true);
    if (!res.id) {
      let resDeleted = await this.getOne(id, true, true);

      // console.log('s',resDeleted)
      if (resDeleted.error) {
        throw new ErrorResponse("Shouldnt have made it here", 404);
      } else {
        try {
          await client.connect();

          await client.query(`DELETE FROM ${this.table} WHERE id = $1`, id);

          return { msg: `${this.table} with id ${id} PermaDeleted` };
        } catch (error) {
          throw new ErrorResponse(error.toString(), 404);
        } finally {
          await client.end();
        }
      }

      return response;
    } else {
      try {
        await client.connect();
        // check for deleted flag if deleted flag then perma delete

        await client.query(
          `UPDATE ${this.table} SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1`,
          id,
        );

        return { msg: `${this.table} with id ${id} Removed` };
      } catch (error) {
        throw new ErrorResponse(error.toString(), 404);
      } finally {
        await client.end();
      }
      return response;
    }
  };

  auditLog = async (
    model: string,
    model_id: number,
    action: string,
    user_id: number,
    parent?: { parent_model: string; parent_model_id: number },
  ) => {
    const auditBody: any = {
      user_id,
      model,
      model_id,
      action,
      parent_model: parent?.parent_model,
      parent_model_id: parent?.parent_model_id,
    };
    const insertColumns = new Array();
    const insertValues = new Array();
    const insertPlaceholder = new Array();

    let i = 1;
    for (const v in auditBody) {
      insertColumns.push(v);
      insertValues.push(auditBody[v]);
      insertPlaceholder.push(`$${i++}`);
    }
    const insertQuery = `INSERT INTO audits(${
      insertColumns.join(
        ",",
      )
    }) VALUES(${insertPlaceholder}) returning * `;

    try {
      try {
        await client.connect();

        const result = await client.query(insertQuery, ...insertValues);

        const resObj: any = new Object();

        result.rows.map((p) =>
          result.rowDescription.columns.map((el, i) => (resObj[el.name] = p[i]))
        );

        if (result.rows.toString() === "") {
          throw new ErrorResponse("Error adding audit", 404);
        } else {
          return true;
        }
      } catch (error) {
        throw new ErrorResponse(error.toString(), 404);
      } finally {
        await client.end();
      }
    } catch (error) {
      throw new ErrorResponse(error, 401);
    }
  };

  isOwnerByID = async (id_value: string, user_id: number) => {
    return this.isOwner("id", id_value, user_id);
  };

  isOwner = async (id_field: string, id_value: string, user_id: number) => {
    const result = await this.customQuery(
      `SELECT user_id FROM ${this.table} WHERE deleted_at is null AND ${id_field} = ${id_value}`,
    );

    if (result && result.user_id === user_id) {
      return true;
    } else {
      return false;
    }
  };

  getNotesByModel = async (model_id: number) => {
    let notes = await this.customQuery(
      `SELECT * FROM notes WHERE deleted_at is null AND model = '${this.table}' AND model_id = ${model_id}`,
      true,
    );

    if (notes) return notes.rows;
    else {
      return null;
    }
  };

  makeSlug = async (name: string, id?: number): Promise<string> => {
    let slug = await this.slugify(name);
    let newSlug = await this.customQuery(
      `SELECT * FROM ${this.table} WHERE deleted_at is null AND slug = '${slug}' ${
        id ? `AND id <> ${id}` : ""
      }`,
      true,
    );
    // keep the slug unique within model
    if (newSlug !== null) {
      slug = `${slug}-${this.makeRandomStr(5)}`;
    }

    return slug;
  };

  restoreOne = async (id: number) => {
    try {
      await client.connect();
      // check for deleted flag if deleted flag then perma delete

      await client.query(
        `UPDATE ${this.table} SET deleted_at = null WHERE id = $1`,
        id,
      );

      return { msg: `${this.table} with id ${id} restored` };
    } catch (error) {
      throw new ErrorResponse(error.toString(), 404);
    } finally {
      await client.end();
    }
  };

  slugify = (str: string): string => {
    let returnString: string;
    //needs more work
    returnString = str.replaceAll(/[^a-zA-Z0-9]/g, " ");
    returnString = returnString.trim();
    returnString = returnString.replaceAll(" ", "-");
    returnString = returnString.replaceAll("--", "-");
    returnString = returnString.toLocaleLowerCase();

    return returnString;
  };

  permissons = async (
    model_id: any,
    user: any,
  ): Promise<EPermissions> => {
    if (user.role === "admin") return EPermissions.admin;

    if (await this.isOwnerByID(model_id, user.id)) return EPermissions.owner;

    const model = await this.getOne(model_id);

    if (model.public === false) return EPermissions.none;

    if (model.public_read_only === false) {
      return EPermissions.editable;
    } else {
      return EPermissions.read;
    }
  };

  makeRandomStr = (length: number): string => {
    let result: string = "";
    let characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  wordCount = (str: string): number => {
    return str.split(" ")
      .filter(function (n) {
        return n != "";
      })
      .length;
  };
}

export { DB };
