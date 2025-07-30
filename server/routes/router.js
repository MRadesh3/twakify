import express from "express";

const Router = express.Router();

// Module Routes

import authRoutes from "./auth/auth.router.js";
import messageRoutes from "./message/message.router.js";
import groupchatRoutes from "./groupchat/groupchat.router.js";

Router.use("/auth", authRoutes);
Router.use("/messages", messageRoutes);
Router.use("/groupchat", groupchatRoutes);

export default Router;
