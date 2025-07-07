import { Router } from "express";

import {
  infoController,
  signinController,
  signoutController,
  signupController,
} from "../controllers/auth.controller.js";
import { middleware } from "../middleware/middleware.js";

const router: Router = Router();

router.route("/signin").post(signinController);
router.route("/signup").post(signupController);
router.route("/signout").post(signoutController);
router.route("/info").get(middleware, infoController);

export default router;
