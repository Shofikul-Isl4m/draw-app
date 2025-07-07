import { Router } from "express";
import { middleware } from "../middleware/middleware.js";
import {
  createRoomController,
  fetchAllRoomsController,
  joinRoomController,
} from "../controllers/room.controller.js";

const roomRouter: Router = Router();

roomRouter.use(middleware);

roomRouter.route("/create").post(createRoomController);
roomRouter.route("/join").post(joinRoomController);
roomRouter.route("/all").get(fetchAllRoomsController);

export default roomRouter;
