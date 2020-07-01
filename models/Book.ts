import { DB } from "../helpers/DB.ts";
import { Chapter } from "./Chapter.ts";
const chapterModel = new Chapter();
export interface IBook {
  id?: string;
  user_id: number;
  name: string;
  slug?: string;
  description?: string;
  genre?: string;
}

export class Book extends DB {
  table = "books";
  alias = "b";
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
    const book = await this.getOne(id);
    const {rows} = await chapterModel.getChaptersByBookID(id)||null;

    return { book, chapters:rows };
  }
  async getBook(id: any) {
    return await this.getOne(id);
  }

  async getBookByValue(field: string, value: any) {
    return await this.getOneByValue(field, value);
  }

  async getBooks(ctx: any) {
    return await this.getAll(ctx, true);
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

  permissonToEdit = async (book_id: any, user: any): Promise<boolean> => {
    console.log(user);
    if (user.role === "admin") return true;
    console.log("not- admin");
    if (await this.isOwnerByID(book_id, user.id)) return true;
    console.log("not- owner");
    let book = await this.getBook(book_id);
    console.log(book);
    if (book.public === false) return false;
    console.log("not- public");
    if (book.public_read_only === false) return true;
    else return false;
  };

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
