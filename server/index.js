import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import Router from "./routes/router.js";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import getPrismaInstance from "./utils/PrismaClient.js";

const prisma = getPrismaInstance();

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", Router);

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${server.address().port}`);
});

const io = new Server(server, {
  cors: {
    origin: process.env.HOST,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;

  socket.on("add-user", (userId) => {
    console.log("userId", userId);

    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  });

  socket.on("signout", (id) => {
    onlineUsers.delete(id);
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  });

  // socket.on("send-msg", (data) => {
  //   console.log("message", data);

  //   const receiveUserSocket = onlineUsers.get(data.to);
  //   const sendUserSocket = onlineUsers.get(data.from);
  //   // console.log("data", data);

  //   if (receiveUserSocket) {
  //     socket.to(receiveUserSocket).emit("msg-recieve", {
  //       id: data?.messageId,
  //       messageId: data?.messageId,
  //       receiverId: data.to,
  //       senderId: data.from,
  //       message: data.message,
  //       type: data.type,
  //       messageStatus: data.messageStatus,
  //       createdAt: data.createdAt,
  //     });

  //     // socket.to(receiveUserSocket).emit("message-seen", {
  //     //   receiverId: data.to,
  //     //   senderId: data.from,
  //     //   messageId: data.messageId,
  //     //   messageStatus: data.messageStatus,
  //     // });

  //     // socket.to(sendUserSocket).emit("message-as-read", {
  //     //   receiverId: data.to,
  //     //   senderId: data.from,
  //     //   messageId: data.messageId,
  //     // });
  //   }

  //   // socket.to(receiveUserSocket).emit("message-seen", {
  //   //   receiverId: data.to,
  //   //   senderId: data.from,
  //   //   messageId: data.messageId,
  //   //   messageStatus: "read", // Update status to 'read'
  //   // });

  //   // socket.emit("message-as-read", {
  //   //   receiverId: data.to,
  //   //   senderId: data.from,
  //   //   messageId: data.messageId,
  //   //   messageStatus: data.messageStatus,
  //   // });

  //   socket.broadcast.emit("update-unread-count", {
  //     receiverId: data.to,
  //     senderId: data.from,
  //     message: data.message,
  //     type: data.type,
  //     messageStatus: data.messageStatus,
  //     createdAt: data.createdAt,
  //   });

  //   socket.emit("msg-sent", {
  //     receiverId: data.to,
  //     senderId: data.from,
  //     message: data.message,
  //     type: data.type,
  //     messageStatus: data.messageStatus,
  //     createdAt: data.createdAt,
  //   });
  // });

  socket.on("send-msg", async (data) => {
    console.log("message", data);

    const receiveUserSocket = onlineUsers.get(data.to);

    console.log("receiveUserSocket", receiveUserSocket);

    if (receiveUserSocket) {
      socket.to(receiveUserSocket).emit("msg-recieve", {
        id: data?.messageId,
        messageId: data?.messageId,
        receiverId: data.to,
        senderId: data.from,
        message: data.message,
        iv: data.iv,
        type: data.type,
        messageStatus: "delivered",
        createdAt: data.createdAt,
        deletedAt: data.deletedAt,
      });

      await prisma.messages.updateMany({
        where: {
          id: data?.messageId,
          receiverId: data.to,
          messageStatus: "sent",
        },
        data: { messageStatus: "delivered" },
      });
    }

    socket.broadcast.emit("update-unread-count", {
      receiverId: data.to,
      senderId: data.from,
      message: data.message,
      iv: data.iv,
      type: data.type,
      messageStatus: "delivered",
      createdAt: data.createdAt,
    });

    socket.emit("msg-sent", {
      receiverId: data.to,
      senderId: data.from,
      message: data.message,
      iv: data.iv,
      type: data.type,
      messageId: data?.messageId,
      messageStatus: data.messageStatus,
      createdAt: data.createdAt,
      deletedAt: data.deletedAt,
    });
  });

  socket.on("update-message-status", (data) => {
    const { messageId, senderId, receiverId, status, iv } = data;
    console.log("message update data", data);

    const senderSocket = onlineUsers.get(senderId);
    console.log(senderSocket);

    if (senderSocket) {
      socket.to(senderSocket).emit("message-status-updated", {
        messageId,
        status,
        iv,
      });
    }
  });

  socket.on("delete-msg", (data) => {
    const receiverSocket = onlineUsers.get(data.receiverId);
    const userSocket = onlineUsers.get(data.senderId);

    if (receiverSocket) {
      socket.to(receiverSocket).emit("deleted-msg", {
        id: data.id,
        messageId: data.messageId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        message: data.message,
        iv: data.iv,
        messageStatus: data.messageStatus,
        type: data.type,
        createdAt: data.createdAt,
        deletedAt: data.deletedAt,
      });
    }

    if (userSocket) {
      socket.emit("deleted-msg", {
        id: data.id,
        messageId: data.messageId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        message: data.message,
        iv: data.iv,
        messageStatus: data.messageStatus,
        type: data.type,
        createdAt: data.createdAt,
        deletedAt: data.deletedAt,
      });
    }
  });

  // socket.on("make-as-read", (data) => {
  //   const sendUserSocket = onlineUsers.get(data.to);
  //   const sendReceiverSocket = onlineUsers.get(data.from);

  //   if (sendUserSocket) {
  //     socket.to(sendUserSocket).emit("messages-read", {
  //       senderId: data.from,
  //       receiverId: data.to,
  //     });
  //   }

  //   if (sendReceiverSocket) {
  //     socket.to(sendReceiverSocket).emit("messages-read", {
  //       senderId: data.from,
  //       receiverId: data.to,
  //     });
  //   }
  // });

  // socket.on("make-as-read", (data) => {
  //   console.log("Received make-as-read:", data);
  //   console.log("Current online users:", onlineUsers);

  //   const sendUserSocket = onlineUsers.get(data.to);
  //   const sendReceiverSocket = onlineUsers.get(data.from);

  //   console.log("sendUserSocket:", sendUserSocket);
  //   console.log("sendReceiverSocket:", sendReceiverSocket);

  //   if (sendUserSocket) {
  //     io.to(sendUserSocket).emit("messages-read", {
  //       senderId: data.from,
  //       receiverId: data.to,
  //     });
  //   }

  //   if (sendReceiverSocket) {
  //     io.to(sendReceiverSocket).emit("messages-read", {
  //       senderId: data.from,
  //       receiverId: data.to,
  //     });
  //   }
  // });

  socket.on("make-as-read", async (data) => {
    try {
      await prisma.messages.updateMany({
        where: {
          senderId: data.to,
          receiverId: data.from,
          messageStatus: "delivered",
        },
        data: { messageStatus: "read" },
      });

      const sendUserSocket = onlineUsers.get(data.to);
      const sendReceiverSocket = onlineUsers.get(data.from);

      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("messages-read", {
          senderId: data.from,
          receiverId: data.to,
          iv: data.iv,
        });
      }

      if (sendReceiverSocket) {
        socket.to(sendReceiverSocket).emit("messages-read", {
          senderId: data.from,
          receiverId: data.to,
          iv: data.iv,
        });
      }
    } catch (error) {
      console.error("Error updating message status to read:", error);
    }
  });

  socket.on("outgoing-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-voice-call", {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });

  socket.on("outgoing-video-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-video-call", {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });

  socket.on("reject-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.from);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("voice-call-rejected");
    }
  });

  socket.on("reject-video-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.from);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("video-call-rejected");
    }
  });

  socket.on("accept-incoming-call", ({ id }) => {
    const sendUserSocket = onlineUsers.get(id);
    socket.to(sendUserSocket).emit("accept-call");
  });

  // Group chats socket

  socket.on("joinUserGroups", async ({ userId, groups }) => {
    if (!groups || groups.length === 0) {
      return console.log(`No groups found for user ${userId}`);
    }

    const userSocketId = onlineUsers.get(userId);
    const userSocket = io.sockets.sockets.get(userSocketId);

    if (!userSocket) {
      return console.error(`Socket not found for user: ${userId}`);
    }

    for (const groupId of groups) {
      userSocket.join(`group_${groupId}`);
      console.log(
        `User ${userId} (socket ${userSocket.id}) rejoined group_${groupId}`
      );
    }

    // Optional: Emit an event confirming the user has rejoined all groups
    userSocket.emit("rejoinedGroups", { userId, groups });

    console.log(`User ${userId} successfully rejoined groups: ${groups}`);
  });

  socket.on("joinGroup", async ({ groupId, members, groupData }) => {
    if (!members || members.length === 0) {
      return console.log(`No members found for group_${groupId}`);
    }

    for (const userId of members) {
      if (!onlineUsers.has(userId)) {
        console.error(`User ${userId} is not online or socket not found`);
        continue;
      }

      const userSocketId = onlineUsers.get(userId);
      const userSocket = io.sockets.sockets.get(userSocketId);

      if (userSocket) {
        userSocket.join(`group_${groupId}`);
        console.log(
          `User ${userId} (socket ${userSocket.id}) joined group_${groupId}`
        );
      } else {
        console.error(`Socket instance not found for user: ${userId}`);
      }
    }

    // Log all users in the room
    const sockets = await io.in(`group_${groupId}`).fetchSockets();
    const usersInRoom = sockets.map((socket) => socket.id);
    console.log(`Current users in group_${groupId}:`, usersInRoom);

    // Send group data to all users in the group
    io.to(`group_${groupId}`).emit("groupCreated", { groupId, groupData });

    console.log(`Group data sent to group_${groupId}:`, groupData);
  });

  socket.on("updateGroup", async ({ groupId, members, groupData }) => {
    if (!members || members.length === 0) {
      return console.log(`No members found for group_${groupId}`);
    }

    for (const userId of members) {
      if (!onlineUsers.has(userId)) {
        console.error(`User ${userId} is not online or socket not found`);
        continue;
      }

      const userSocketId = onlineUsers.get(userId);
      const userSocket = io.sockets.sockets.get(userSocketId);

      if (userSocket) {
        userSocket.join(`group_${groupId}`);
        console.log(
          `User ${userId} (socket ${userSocket.id}) joined group_${groupId}`
        );
      } else {
        console.error(`Socket instance not found for user: ${userId}`);
      }
    }

    // Log all users in the room
    const sockets = await io.in(`group_${groupId}`).fetchSockets();
    const usersInRoom = sockets.map((socket) => socket.id);
    console.log(`Current users in group_${groupId}:`, usersInRoom);

    // Send group data to all users in the group
    io.to(`group_${groupId}`).emit("groupUpdated", { groupId, groupData });

    console.log(`Group data sent to group_${groupId}:`, groupData);
  });

  socket.on("deleteGroup", async ({ groupId, members, groupData }) => {
    if (!members || members.length === 0) {
      return console.log(`No members found for group_${groupId}`);
    }

    for (const userId of members) {
      if (!onlineUsers.has(userId)) {
        console.error(`User ${userId} is not online or socket not found`);
        continue;
      }

      const userSocketId = onlineUsers.get(userId);
      const userSocket = io.sockets.sockets.get(userSocketId);

      if (userSocket) {
        userSocket.join(`group_${groupId}`);
        console.log(
          `User ${userId} (socket ${userSocket.id}) joined group_${groupId}`
        );
      } else {
        console.error(`Socket instance not found for user: ${userId}`);
      }
    }

    // Log all users in the room
    const sockets = await io.in(`group_${groupId}`).fetchSockets();
    const usersInRoom = sockets.map((socket) => socket.id);
    console.log(`Current users in group_${groupId}:`, usersInRoom);

    // Send group data to all users in the group
    io.to(`group_${groupId}`).emit("groupDeleted", { groupId, groupData });

    console.log(`Group data sent to group_${groupId}:`, groupData);
  });

  socket.on("createGroup", (groupData) => {
    const groupId = groupData.data.id;
    // if (io.sockets.adapter.rooms.get(`group_${groupId}`)?.size) {
    //   console.log(groupId);

    //   socket.to(`group_${groupId}`).emit("groupCreated", groupData);
    // } else {
    //   console.error(`No users in group_${groupId}`);
    // }

    // console.log(`Emitting "groupCreated" event to group_${groupId}`, groupData);
    io.to(groupId).emit("groupCreated", groupData);
  });

  socket.on("sendGroupMessage", (groupData) => {
    const groupId = groupData.groupId;
    const room = io.sockets.adapter.rooms.get(`group_${groupId}`);
    // socket.emit("groupMessageSent", groupData);

    if (room?.size) {
      console.log(`Message sent to group_${groupId} with ${room.size} users`);
      io.to(`group_${groupId}`).emit("receiveGroupMessage", groupData);
    } else {
      console.error(`No users in group_${groupId}`);
    }
  });

  socket.on("deleteGroupMessage", (groupData) => {
    const groupId = groupData.groupId;
    const room = io.sockets.adapter.rooms.get(`group_${groupId}`);
    if (room?.size) {
      console.log(
        `Message deleted to group_${groupId} with ${room.size} users`
      );
      io.to(`group_${groupId}`).emit("groupMessageDeleted", groupData);
    } else {
      console.error(`No users in group_${groupId}`);
    }
  });

  socket.on("update-groupsContact-message", (groupData) => {
    const groupId = groupData.groupId;
    const room = io.sockets.adapter.rooms.get(`group_${groupId}`);
    if (room?.size) {
      // Check if there are users in the room
      console.log(
        `Message updated to group_${groupId} with ${room.size} users`
      );
      io.to(`group_${groupId}`).emit(
        "groupsContact-message-updated",
        groupData
      );
    } else {
      console.error(`No users in group_${groupId}`);
    }
  });
});
