import { Router, send } from "https://deno.land/x/oak/mod.ts";

import { UserController } from "../controllers/users.ts";
import { BookController } from "../controllers/books.ts";
import { JobController } from "../controllers/jobs.ts";
import { protect, authorize } from "../middleware/auth.ts";
import { register, login, me } from "../controllers/auth.ts";

const userController = new UserController();
const bookController = new BookController();
const jobController = new JobController();

const router = new Router();

// router.get("/", (ctx) => {
//   console.log(ctx)
//   ctx.render("index.ejs", { data: { msg: "World" } });
// });

router
  .get("/api/v1/users", protect, authorize("admin"), userController.getUsers)
  .get("/api/v1/users/:id", protect, authorize("admin"), userController.getUser)
  .post("/api/v1/users", protect, authorize("admin"), userController.addUser)
  .put(
    "/api/v1/users/:id",
    protect,
    authorize("admin"),
    userController.updateUser
  )
  .delete(
    "/api/v1/users/:id",
    protect,
    authorize("admin"),
    userController.deleteUser
  );

router
  .get(
    "/api/v1/books",
    // protect,
    // authorize("admin", "book"),
    bookController.getBookWithDetails
  )
  .get(
    "/api/v1/books/:id",
    // protect,
    // authorize("admin", "book"),
    bookController.getBooks
  )
  .post(
    "/api/v1/books",
    // protect,
    // authorize("admin", "book"),
    bookController.addBook
  )
  .put(
    "/api/v1/books/:id",
    protect,
    authorize("admin", "book"),
    bookController.updateBook
  )
  .delete(
    "/api/v1/books/:id",
    protect,
    authorize("admin", "book"),
    bookController.deleteBook
  );

// router
//   .get(
//     "/api/v1/jobs",
//     // protect,
//     // authorize("admin", "book"),
//     jobController.getJobs
//   )
//   .get(
//     "/api/v1/jobs/:id",
//     // protect,
//     // authorize("admin", "book"),
//     jobController.getJob
//   )
//   .post(
//     "/api/v1/jobs",
//     // protect,
//     // authorize("admin", "book"),
//     jobController.addJob
//   )
//   .put(
//     "/api/v1/jobs/:id",
//     protect,
//     authorize("admin", "book"),
//     jobController.updateJob
//   )
//   .delete(
//     "/api/v1/jobs/:id",
//     protect,
//     authorize("admin", "book"),
//     jobController.deleteJob
//   );

router
  .post("/api/v1/auth/register", register)
  .post("/api/v1/auth/login", login)
  .get("/api/v1/auth/me", protect, me);

export default router;
