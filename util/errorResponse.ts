import { HttpError } from "https://deno.land/x/oak/mod.ts";

export class ErrorResponse extends HttpError {
  status: number;
  constructor(message: any, statusCode: number) {
    super(message);
    this.status = statusCode;
  }
}
