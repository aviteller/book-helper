import { DB } from "../helpers/DB.ts";
import { makeResponse } from "../util/response.ts";


export interface IBook {
  id?: string;
  user_id: number;
  name: string;
  slug?: string;
  description?: string;
  genre?:string
}

export class Book extends DB {
  table = "books";
  record_events = true;

  belongsTo = {
    selector: "user_id",
    alias: "u",
    table: "users",
    fields: "id,name",
  };

  hasMany = {
    table: "chapters",
    alias: "ch",
    selector: "book_id",
  };
  //make function in higher class
  validate(values: any) {
    if ("name" in values) {
      return true;
    } else {
      return false;
    }
  }

  async getBookWithDetails(id: any) {
    const returnBook = await this.getOne(id);
    // const jobs = await jobModel.getJobsByBookID(id);

    return  { book: returnBook };
  }
  async getBook(id: any) {
    const returnBook = await this.getOne(id);

    return returnBook;
  }

  async getBookByValue(field: string, value: any) {
    return await this.getOneByValue(field, value);
  }

  async getBooks(queryParams: any) {
    return await this.getAll(queryParams, true);
  }
  // async getBooksWithJobs(queryParams: any) {
  //   let companies = await this.getAll(queryParams, true);
    
  //   if (companies.rows && companies.rows.length > 0) {
  //     for await (const company of companies.rows) {
  //       let jobs = await jobModel.getJobsByCompanyID(company.id.toString());
  //       company.jobs = jobs.rows;
  //     }
  //   }

    

  //   return companies
  // }

  async addBook(values: any) {
    return await this.addOne(values);
  }

  async updateBook(values: any, id: any) {
    return await this.updateOne(values, id);
  }

  async deleteBook(id: any) {
    return await this.deleteOne(id);
  }
}
