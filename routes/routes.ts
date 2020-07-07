import { Router } from "https://deno.land/x/oak/mod.ts";
import { UserController } from "../controllers/users.ts";
import { BookController } from "../controllers/books.ts";
import { NoteController } from "../controllers/notes.ts";
import { ChapterController } from "../controllers/chapters.ts";
import { protect, authorize } from "../middleware/auth.ts";
import { register, login, me } from "../controllers/auth.ts";

const userController = new UserController();
const bookController = new BookController();
const noteController = new NoteController();
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
  .post("/api/v1/notes", protect, noteController.addNote)
  .delete(
    "/api/v1/notes/:id",
    protect,
    noteController.deleteNote,
  );

router
  .get(
    "/api/v1/books",
    protect,
    authorize("admin", "user"),
    bookController.getBooks,
  )
  .get(
    "/api/v1/books/:id",
    protect,
    authorize("admin", "user"),
    bookController.getBookWithDetails,
  )
  .post(
    "/api/v1/books",
    protect,
    authorize("admin", "user"),
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
    protect,
    authorize("admin", "user"),
    chapterController.getChapters,
  )
  .get(
    "/api/v1/chapters/:id",
    protect,
    authorize("admin", "user"),
    chapterController.getChapterWithDetails,
  )
  .post(
    "/api/v1/chapters",
    protect,
    authorize("admin", "user"),
    chapterController.addChapter,
  )
  .get(`/api/v1/chapters/swap/:first_id/:second_id`,protect,
  authorize("admin", "user"),
  chapterController.swapPosition)
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
