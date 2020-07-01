import { DB } from "../helpers/DB.ts";

export enum EChapterStatus {
    new = "new",
    finished = "finished",
    inProcess = "in-process"
}

export interface IChapter {
  id?: string;
  user_id?: number;
  book_id: number;
  title: string;
  description?: string;
  text?: string;
  slug?: string;
  position?: number;
  status?:string
}


export class Chapter extends DB {
  table = "chapters";

  belongsTo = {
    selector: "book_id",
    alias: "b",
    table: "books",
    fields: "id,name",
  };
  //make function in higher class
  validate(values: any) {
    if ("title" in values) {
      return true;
    } else {
      return false;
    }
  }

  async getChapter(id: any) {
    return await this.getOne(id);
  }

  async getChapterByValue(field: string, value: any) {
    return await this.getOneByValue(field, value);
  }

  async getChapters(queryParams: any) {
    return await this.getAll(queryParams, true);
  }

  async getChaptersByBookID(id: any) {
    return await this.getAllByValue("book_id", id);
  }

  async addChapter(values: any) {
    return await this.addOne(values);
  }

  async updateChapter(values: any, id: any) {
    return await this.updateOne(values, id);
  }

  async deleteChapter(id: any) {
    return await this.deleteOne(id);
  }
}
