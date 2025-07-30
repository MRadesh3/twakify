import express from "express";
import { errorHandler } from "../../middlewares/errorHandler.js";
import multer from "multer";
import {
  addGroupMessagesValidation,
  addGroupValidation,
  deleteGroupMessageValidation,
  editAdminValidation,
  getGroupContactsWithMessagesValidation,
  getGroupMessagesValidation,
  getGroupsValidation,
  updateGroupValidation,
} from "../../validations/groupchat.validation.js";
import {
  addGroup,
  addGroupMediaMessage,
  addGroupMessage,
  deleteGroup,
  deleteGroupMessage,
  editAdmin,
  getGroupContactsWithUnreadCount,
  getGroupMessages,
  getUserGroups,
  leaveGroup,
  updateGroup,
} from "../../controllers/GroupChatController.js";
import userMiddleware from "../../middlewares/app.user.js";

const Router = express.Router();

const uploadImage = multer({ dest: "uploads" });

Router.post(
  "/add-group",
  userMiddleware,
  uploadImage.single("image"),
  addGroupValidation,
  errorHandler,
  addGroup
);

Router.post(
  "/update-group",
  userMiddleware,
  uploadImage.single("image"),
  updateGroupValidation,
  errorHandler,
  updateGroup
);

Router.post(
  "/get-groups",
  userMiddleware,
  getGroupsValidation,
  errorHandler,
  getUserGroups
);

Router.post(
  "/edit-admin",
  userMiddleware,
  editAdminValidation,
  errorHandler,
  editAdmin
);

Router.post(
  "/leave-group",
  userMiddleware,
  editAdminValidation,
  errorHandler,
  leaveGroup
);

Router.post(
  "/delete-group",
  userMiddleware,
  editAdminValidation,
  errorHandler,
  deleteGroup
);

Router.post(
  "/add-group-message",
  userMiddleware,
  addGroupMessagesValidation,
  errorHandler,
  addGroupMessage
);

Router.post(
  "/delete-group-message",
  userMiddleware,
  deleteGroupMessageValidation,
  errorHandler,
  deleteGroupMessage
);

Router.post(
  "/get-group-messages",
  userMiddleware,
  getGroupMessagesValidation,
  errorHandler,
  getGroupMessages
);

Router.post(
  "/add-group-media-message",
  userMiddleware,
  uploadImage.single("media"),
  addGroupMessagesValidation,
  errorHandler,
  addGroupMediaMessage
);

Router.post(
  "/get-group-initial-contacts",
  userMiddleware,
  // getGroupContactsWithMessagesValidation,
  errorHandler,
  getGroupContactsWithUnreadCount
);

export default Router;
