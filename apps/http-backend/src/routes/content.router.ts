import { Router } from "express";
import { middleware } from "../middleware/middleware.js";
import {
  getAllChatMessages,
  getAllDraws,
  getHomeInfo,
} from "../controllers/content.controller.js";

const router: Router = Router();

router.use(middleware);

router.route("/home").get(getHomeInfo);
router.route("/chats/:roomId").get(getAllChatMessages);
router.route("/draws/:roomId").get(getAllDraws);

export default router;
