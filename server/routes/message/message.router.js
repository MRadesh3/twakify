import express from "express";
import {
  addMediaMessage,
  addMessage,
  deleteMessage,
  getInitialContactsWithMessages,
  getMessages,
} from "../../controllers/MessageController.js";
import {
  addMediaMessageValidation,
  addMessageValidation,
  deleteMessageValidation,
  getInitialContactsWithMessagesValidation,
  getMessagesValidation,
} from "../../validations/message.validation.js";
import { errorHandler } from "../../middlewares/errorHandler.js";
import multer from "multer";
import userMiddleware from "../../middlewares/app.user.js";

const Router = express.Router();

const uploadImage = multer({ dest: "uploads" });

Router.post(
  "/add-message",
  userMiddleware,
  addMessageValidation,
  errorHandler,
  addMessage
);
Router.post(
  "/get-messages",
  userMiddleware,
  getMessagesValidation,
  errorHandler,
  getMessages
);
Router.post(
  "/delete-message",
  userMiddleware,
  deleteMessageValidation,
  errorHandler,
  deleteMessage
);
Router.post(
  "/add-media-message",
  userMiddleware,
  uploadImage.single("media"),
  addMediaMessageValidation,
  errorHandler,
  addMediaMessage
);
Router.post(
  "/get-initial-contacts",
  userMiddleware,
  getInitialContactsWithMessagesValidation,
  errorHandler,
  getInitialContactsWithMessages
);

export default Router;
