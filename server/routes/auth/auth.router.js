import express from "express";
import {
  checkUser,
  deleteUser,
  generateToken,
  getAllUsers,
  onBoardUser,
  updateUser,
} from "../../controllers/AuthController.js";
import {
  checkUserValidation,
  generateTokenValidation,
  onBoardUserValidation,
} from "../../validations/auth.validation.js";
import { errorHandler } from "../../middlewares/errorHandler.js";
import multer from "multer";
import userMiddleware from "../../middlewares/app.user.js";

const Router = express.Router();

const uploadUserImage = multer({ dest: "uploads" });

Router.post("/check-user", checkUserValidation, errorHandler, checkUser);
Router.post(
  "/onboard-user",
  uploadUserImage.single("image"),
  onBoardUserValidation,
  errorHandler,
  onBoardUser
);
Router.post(
  "/update-user",
  userMiddleware,
  uploadUserImage.single("image"),
  onBoardUserValidation,
  errorHandler,
  updateUser
);
Router.post(
  "/delete-user",
  userMiddleware,
  generateTokenValidation,
  errorHandler,
  deleteUser
);
Router.post("/get-all-contacts", getAllUsers);

Router.post(
  "/generate-token",
  generateTokenValidation,
  errorHandler,
  generateToken
);

export default Router;
