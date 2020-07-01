import { Router } from "https://deno.land/x/oak/mod.ts";
import { UserController } from "../controllers/users.ts";
import { BookController } from "../controllers/books.ts";
import { ChapterController } from "../controllers/chapters.ts";
import { protect, authorize } from "../middleware/auth.ts";
import { register, login, me } from "../controllers/auth.ts";

const userController = new UserController();
const bookController = new BookController();
const chapterController = new ChapterController();

const router = new Router();

router
  .get("/api/v1/users", protect, authorize("admin"), userController.getUsers)
  .get("/api/v1/users/:id", protect, authorize("admin"), userController.getUser)
  .post("/api/v1/users", protect, authorize("admin"), userController.addUser)
  .put(
    "/api/v1/users/:id",
    protect,
    authorize("admin"),
    userController.updateUser,
  )
  .delete(
    "/api/v1/users/:id",
    protect,
    authorize("admin"),
    userController.deleteUser,
  );

router
  .get(
    "/api/v1/books",
    // protect,
    // authorize("admin", "book"),
    bookController.getBooks,
  )
  .get(
    "/api/v1/books/:id",
    // protect,
    // authorize("admin", "book"),
    bookController.getBookWithDetails,
  )
  .post(
    "/api/v1/books",
    // protect,
    // authorize("admin", "book"),
    bookController.addBook,
  )
  .put(
    "/api/v1/books/:id",
    protect,
    authorize("admin", "user"),
    bookController.updateBook,
  )
  .delete(
    "/api/v1/books/:id",
    protect,
    authorize("admin", "user"),
    bookController.deleteBook,
  );

router
  .get(
    "/api/v1/chapters",
    // protect,
    // authorize("admin", "book"),
    chapterController.getChapters,
  )
  .get(
    "/api/v1/chapters/:id",
    // protect,
    // authorize("admin", "book"),
    chapterController.getChapter,
  )
  .post(
    "/api/v1/chapters",
    // protect,
    // authorize("admin", "book"),
    chapterController.addChapter,
  )
  .put(
    "/api/v1/chapters/:id",
    protect,
    authorize("admin", "user"),
    chapterController.updateChapter,
  )
  .delete(
    "/api/v1/chapters/:id",
    protect,
    authorize("admin", "user"),
    chapterController.deleteChapter,
  );

router
  .post("/api/v1/auth/register", register)
  .post("/api/v1/auth/login", login)
  .get("/api/v1/auth/me", protect, me);

export default router;
