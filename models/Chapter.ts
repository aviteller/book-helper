import { DB } from "../helpers/DB.ts";

export enum EChapterStatus {
  new = "new",
  finished = "finished",
  inProcess = "in-process",
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
  status?: string;
  word_count?: number;
}

export class Chapter extends DB {
  table = "chapters";
  alias = "c"

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

  async getChapterWithDetails(id: any) {
    const chapter = await this.getOne(id);
    const notes = await this.getNotesByModel(id);

    return { chapter, notes };
  }

  async getChapterByValue(field: string, value: any) {
    return await this.getOneByValue(field, value);
  }

  async getChapters(queryParams: any) {
    return await this.getAll(queryParams, true);
  }

  async getChaptersByBookID(id: any) {
    let sort = {sort:"position"}
    let chapters = await this.getAllByValue("book_id", id, false,sort);
    if (chapters != 0) return chapters.rows;
    return null;
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

  async swapPosition(first_id:number, second_id:number):Promise<boolean> {
    try {
      
      const firstPos = await this.getPositionByID(first_id);
   
      const secondPos = await this.getPositionByID(second_id);

  
      await this.customQuery(`UPDATE chapters SET position = $1 WHERE id = $2`, true,secondPos, first_id)
      await this.customQuery(`UPDATE chapters SET position = $1 WHERE id = $2`, true,firstPos, second_id)
    } catch (error) {
      console.log("swap failed")
      return false
    }
    return true
  }

  async getPositionByID(id: number): Promise<number> {
    // console.log(`select position from chapters where book_id = ${book_id} AND deleted_at is  null and position is not null order by position::int desc limit 1`)
    const result = await this.customQuery(
      `select position from chapters where id = $1 AND deleted_at is  null and position is not null order by position::int desc limit 1`,
      true,
      id,
    );
   if(result === null) return 0
    
    // console.log(+Object.values(rows[0]))
    return +Object.values(result.rows[0]);
  }

  async getPositionByBookID(book_id: number): Promise<number> {
    // console.log(`select position from chapters where book_id = ${book_id} AND deleted_at is  null and position is not null order by position::int desc limit 1`)
    const result = await this.customQuery(
      `select position from chapters where book_id = $1 AND deleted_at is  null and position is not null order by position::int desc limit 1`,
      true,
      book_id,
    );
   if(result === null) return 0
    
    // console.log(+Object.values(rows[0]))
    return +Object.values(result.rows[0]);
  }
}
