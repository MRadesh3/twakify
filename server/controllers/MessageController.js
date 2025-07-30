import constants from "../config/constants.js";
import { ReE, ReS } from "../services/util.service.js";
import getPrismaInstance from "../utils/PrismaClient.js";
import { renameSync, mkdirSync, existsSync } from "fs";
import { encryptMessage, decryptMessage } from "../utils/CryptoUtils.js";
import { getFileType } from "../middlewares/fileValidation.js";
import path from "path";
import fs from "fs";

// Add new messages

export const addMessage = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();

    const { message, from, to, type } = req.body;

    const { iv, encryptedData } = encryptMessage(message);

    const getUser = onlineUsers.get(Number(to));

    console.log(getUser);

    const newMessage = await prisma.messages.create({
      data: {
        message: encryptedData,
        iv,
        type,
        sender: {
          connect: { id: parseInt(from) },
        },
        receiver: {
          connect: { id: parseInt(to) },
        },
        messageStatus: getUser
          ? constants.MESSAGE_STATUS.DELIVERED
          : constants.MESSAGE_STATUS.SENT,
      },
      include: { sender: true, receiver: true },
    });

    // const decryptedMessage = decryptMessage(
    //   newMessage?.message,
    //   newMessage?.iv
    // );

    // const responseData = {
    //   ...newMessage,
    //   message: decryptedMessage,
    // };

    return ReS(
      res,
      {
        [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.CREATED,
        [constants.RESPONCE_KEY.MESSAGE]: "New message added",
        [constants.RESPONCE_KEY.DATA]: newMessage,
      },
      constants.STATUS_CODES.CREATED
    );
  } catch (err) {
    return ReE(
      res,
      {
        [constants.RESPONCE_KEY.STATUS_CODE]:
          constants.STATUS_CODES.SERVER_ERROR,
        [constants.RESPONCE_KEY.MESSAGE]: err.message,
      },
      constants.STATUS_CODES.SERVER_ERROR
    );
  }
};

// export const deleteMessage = async (req, res, next) => {
//   try {
//     const { messageId } = req.body;
//     const prisma = getPrismaInstance();

//     const isMessageExist = await prisma.messages.findUnique({
//       where: {
//         id: parseInt(messageId, 10),
//       },
//     });

//     if (!isMessageExist) {
//       return ReE(
//         res,
//         {
//           [constants.RESPONCE_KEY.STATUS_CODE]:
//             constants.STATUS_CODES.VALIDATION,
//           [constants.RESPONCE_KEY.MESSAGE]: "Message does not exist",
//         },
//         constants.STATUS_CODES.VALIDATION
//       );
//     }

//     if (isMessageExist.type === "text") {
//       await prisma.messages.delete({
//         where: {
//           id: parseInt(messageId, 10),
//         },
//       });
//       return ReS(
//         res,
//         {
//           [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.SUCCESS,
//           [constants.RESPONCE_KEY.MESSAGE]: "Message deleted successfully",
//         },
//         constants.STATUS_CODES.CREATED
//       );
//     } else {
//       // Decrypt the message to get the file path
//       const decryptedMessage = decryptMessage(
//         isMessageExist?.message,
//         isMessageExist?.iv
//       );
//       console.log("Decrypted message:", decryptedMessage);

//       const filePath = path.resolve(decryptedMessage);
//       console.log("Resolved file path:", filePath);

//       if (fs.existsSync(filePath)) {
//         try {
//           console.log("Deleting file:", filePath);
//           fs.unlinkSync(filePath); // Delete the file
//         } catch (err) {
//           console.error("Error deleting file:", err.message);
//         }
//       } else {
//         console.log("File does not exist:", filePath);
//       }

//       // Delete the message from the database
//       await prisma.messages.delete({
//         where: {
//           id: parseInt(messageId, 10),
//         },
//       });

//       return ReS(
//         res,
//         {
//           [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.SUCCESS,
//           [constants.RESPONCE_KEY.MESSAGE]: "Message deleted successfully",
//         },
//         constants.STATUS_CODES.CREATED
//       );
//     }
//   } catch (err) {
//     return ReE(
//       res,
//       {
//         [constants.RESPONCE_KEY.STATUS_CODE]:
//           constants.STATUS_CODES.SERVER_ERROR,
//         [constants.RESPONCE_KEY.MESSAGE]: err.message,
//       },
//       constants.STATUS_CODES.SERVER_ERROR
//     );
//   }
// };

// Get messages of user

export const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.body;
    const prisma = getPrismaInstance();

    const isMessageExist = await prisma.messages.findUnique({
      where: {
        id: parseInt(messageId, 10),
      },
    });

    if (!isMessageExist) {
      return ReE(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]:
            constants.STATUS_CODES.VALIDATION,
          [constants.RESPONCE_KEY.MESSAGE]: "Message does not exist",
        },
        constants.STATUS_CODES.VALIDATION
      );
    }

    const currentTime = new Date();
    console.log(currentTime);

    if (isMessageExist.type === "text") {
      // Update only the deletedAt column for text messages
      await prisma.messages.update({
        where: { id: parseInt(messageId, 10) },
        data: { deletedAt: currentTime },
      });

      return ReS(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.SUCCESS,
          [constants.RESPONCE_KEY.MESSAGE]: "Message deleted successfully",
        },
        constants.STATUS_CODES.SUCCESS
      );
    } else {
      // Handle media messages
      const decryptedMessage = decryptMessage(
        isMessageExist?.message,
        isMessageExist?.iv
      );
      console.log("Decrypted message:", decryptedMessage);

      const filePath = path.resolve(decryptedMessage);
      console.log("Resolved file path:", filePath);

      if (fs.existsSync(filePath)) {
        try {
          console.log("Deleting file:", filePath);
          fs.unlinkSync(filePath); // Delete the file
        } catch (err) {
          console.error("Error deleting file:", err.message);
        }
      } else {
        console.log("File does not exist:", filePath);
      }

      // Update message field to empty and set deletedAt for media messages
      await prisma.messages.update({
        where: { id: parseInt(messageId, 10) },
        data: {
          message: undefined,
          deletedAt: currentTime,
        },
      });

      return ReS(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.SUCCESS,
          [constants.RESPONCE_KEY.MESSAGE]: "Media deleted successfully",
        },
        constants.STATUS_CODES.SUCCESS
      );
    }
  } catch (err) {
    return ReE(
      res,
      {
        [constants.RESPONCE_KEY.STATUS_CODE]:
          constants.STATUS_CODES.SERVER_ERROR,
        [constants.RESPONCE_KEY.MESSAGE]: err.message,
      },
      constants.STATUS_CODES.SERVER_ERROR
    );
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();

    const { from, to } = req.body;

    const messages = await prisma.messages.findMany({
      where: {
        OR: [
          {
            senderId: parseInt(from),
            receiverId: parseInt(to),
          },
          {
            senderId: parseInt(to),
            receiverId: parseInt(from),
          },
        ],
      },
      orderBy: {
        id: "asc",
      },
    });

    const unreadMessages = [];

    messages.forEach((message, index) => {
      // if (message.iv && message.deletedAt === null) {
      //   messages[index].message = decryptMessage(message.message, message.iv);
      // }

      if (message.deletedAt === null) {
        messages[index].message = message.message;
      }

      if (
        message.messageStatus !== "read" &&
        message.senderId === parseInt(to)
      ) {
        messages[index].messageStatus = "read";
        unreadMessages.push(message.id);
      }
    });

    await prisma.messages.updateMany({
      where: {
        id: { in: unreadMessages },
      },
      data: {
        messageStatus: "sent",
      },
    });

    return ReS(
      res,
      {
        [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.SUCCESS,
        [constants.RESPONCE_KEY.MESSAGE]: "Messages fetched successfully",
        [constants.RESPONCE_KEY.DATA]: messages,
      },
      constants.STATUS_CODES.SUCCESS
    );
  } catch (err) {
    return ReE(
      res,
      {
        [constants.RESPONCE_KEY.STATUS_CODE]:
          constants.STATUS_CODES.SERVER_ERROR,
        [constants.RESPONCE_KEY.MESSAGE]: err.message,
      },
      constants.STATUS_CODES.SERVER_ERROR
    );
  }
};

// export const getMessages = async (req, res, next) => {
//   try {
//     const prisma = getPrismaInstance();
//     const { from, to } = req.body;

//     // Convert IDs to integers
//     const senderId = parseInt(from);
//     const receiverId = parseInt(to);

//     // Fetch all messages between sender and receiver
//     const messages = await prisma.messages.findMany({
//       where: {
//         OR: [
//           { senderId, receiverId },
//           { senderId: receiverId, receiverId: senderId },
//         ],
//       },
//       orderBy: { id: "asc" },
//     });

//     const deliveredMessages = [];
//     const sentMessages = [];

//     // Check if receiver is online
//     const isReceiverOnline = onlineUsers.has(receiverId);

//     messages.forEach((message, index) => {
//       // Decrypt message if encrypted
//       if (message.iv) {
//         messages[index].message = decryptMessage(message.message, message.iv);
//       } else {
//         messages[index].message = "Decryption error";
//       }

//       // Fix message status logic
//       if (message.senderId === senderId) {
//         if (message.messageStatus === "sent") {
//           if (isReceiverOnline) {
//             messages[index].messageStatus = "delivered";
//             deliveredMessages.push(message.id);
//           } else {
//             messages[index].messageStatus = "sent";
//             sentMessages.push(message.id);
//           }
//         }
//       }
//     });

//     // Update only messages that should be "delivered"
//     if (deliveredMessages.length > 0) {
//       await prisma.messages.updateMany({
//         where: { id: { in: deliveredMessages } },
//         data: { messageStatus: "delivered" },
//       });
//     }

//     return ReS(
//       res,
//       {
//         [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.SUCCESS,
//         [constants.RESPONCE_KEY.MESSAGE]: "Messages fetched successfully",
//         [constants.RESPONCE_KEY.DATA]: messages,
//       },
//       constants.STATUS_CODES.SUCCESS
//     );
//   } catch (err) {
//     return ReE(
//       res,
//       {
//         [constants.RESPONCE_KEY.STATUS_CODE]:
//           constants.STATUS_CODES.SERVER_ERROR,
//         [constants.RESPONCE_KEY.MESSAGE]: err.message,
//       },
//       constants.STATUS_CODES.SERVER_ERROR
//     );
//   }
// };

// export const getMessages = async (req, res, next) => {
//   try {
//     const prisma = getPrismaInstance();
//     const { from, to } = req.body;

//     // Ensure correct type for receiverId
//     const receiverId = Number(to);
//     const isReceiverOnline = onlineUsers.has(receiverId);

//     console.log(`Receiver ID: ${receiverId}, Is Online:`, isReceiverOnline);
//     console.log("Online Users List:", Array.from(onlineUsers.keys())); // Debugging

//     const messages = await prisma.messages.findMany({
//       where: {
//         OR: [
//           { senderId: parseInt(from), receiverId: parseInt(to) },
//           { senderId: parseInt(to), receiverId: parseInt(from) },
//         ],
//       },
//       orderBy: { id: "asc" },
//     });

//     const unreadMessages = [];

//     messages.forEach((message, index) => {
//       if (message.iv) {
//         messages[index].message = decryptMessage(message.message, message.iv);
//       } else {
//         messages[index].message = "Decryption error";
//       }

//       // Only update messages that were sent by the receiver and are still unread
//       if (
//         message.messageStatus === "sent" &&
//         message.senderId === receiverId // Receiver sent this message, meaning it's unread
//       ) {
//         if (isReceiverOnline) {
//           messages[index].messageStatus = "sent"; // Receiver is online, so mark as delivered
//           unreadMessages.push(message.id);
//         } else {
//           messages[index].messageStatus = "sent"; // Keep as "sent" if the receiver is offline
//         }
//       }
//     });

//     // Update only "delivered" messages in the database
//     if (unreadMessages.length > 0) {
//       await prisma.messages.updateMany({
//         where: { id: { in: unreadMessages } },
//         data: { messageStatus: "sent" },
//       });
//     }

//     return ReS(
//       res,
//       {
//         [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.SUCCESS,
//         [constants.RESPONCE_KEY.MESSAGE]: "Messages fetched successfully",
//         [constants.RESPONCE_KEY.DATA]: messages,
//       },
//       constants.STATUS_CODES.SUCCESS
//     );
//   } catch (err) {
//     return ReE(
//       res,
//       {
//         [constants.RESPONCE_KEY.STATUS_CODE]:
//           constants.STATUS_CODES.SERVER_ERROR,
//         [constants.RESPONCE_KEY.MESSAGE]: err.message,
//       },
//       constants.STATUS_CODES.SERVER_ERROR
//     );
//   }
// };

// Add media message

export const addMediaMessage = async (req, res, next) => {
  try {
    if (req.file) {
      const { from, to } = req.body;
      const fileType = getFileType(req.file);

      let folderPath = `uploads/${fileType}`;

      const folderExists = existsSync(folderPath);
      if (!folderExists) {
        mkdirSync(folderPath, { recursive: true });
      }

      const date = Date.now();
      const fileName = `${date}-${req.file.originalname}`;
      const newFilePath = path.join(folderPath, fileName);

      renameSync(req.file.path, newFilePath);

      const prisma = getPrismaInstance();
      const getUser = onlineUsers.get(Number(to));

      const { iv, encryptedData } = encryptMessage(newFilePath);

      const message = await prisma.messages.create({
        data: {
          message: encryptedData,
          iv,
          type: fileType,
          sender: {
            connect: { id: parseInt(from) },
          },
          receiver: {
            connect: { id: parseInt(to) },
          },
          messageStatus: getUser
            ? constants.MESSAGE_STATUS.DELIVERED
            : constants.MESSAGE_STATUS.SENT,
        },
      });

      // const decryptedMessage = decryptMessage(message?.message, message?.iv);

      // const responseData = {
      //   ...message,
      //   message: decryptedMessage,
      // };

      return ReS(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.CREATED,
          [constants.RESPONCE_KEY.MESSAGE]: "New message added",
          [constants.RESPONCE_KEY.DATA]: message,
        },
        constants.STATUS_CODES.CREATED
      );
    }
  } catch (err) {
    return ReE(
      res,
      {
        [constants.RESPONCE_KEY.STATUS_CODE]:
          constants.STATUS_CODES.SERVER_ERROR,
        [constants.RESPONCE_KEY.MESSAGE]: err.message,
      },
      constants.STATUS_CODES.SERVER_ERROR
    );
  }
};

// Get conatcts with messages

// export const getInitialContactsWithMessages = async (req, res, next) => {
//   try {
//     const userId = parseInt(req.body.from);

//     const primsa = getPrismaInstance();

//     const user = await primsa.user.findUnique({
//       where: {
//         id: userId,
//       },
//       include: {
//         sentMessages: {
//           include: {
//             receiver: true,
//             sender: true,
//           },
//           orderBy: {
//             createdAt: "desc",
//           },
//         },
//         receivedMessages: {
//           include: {
//             receiver: true,
//             sender: true,
//           },
//           orderBy: {
//             createdAt: "desc",
//           },
//         },
//       },
//     });

//     const messages = [...user.sentMessages, ...user.receivedMessages];
//     messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
//     const users = new Map();
//     const messageStatusChange = [];

//     messages.forEach((msg) => {
//       msg = { ...msg, message: decryptMessage(msg.message, msg.iv) };

//       const isSender = msg.senderId === userId;
//       const calculatedId = isSender ? msg.receiverId : msg.senderId;
//       if (msg.messageStatus === "sent") {
//         messageStatusChange.push(msg.id);
//       }

//       const {
//         id,
//         type,
//         message,
//         receiverId,
//         senderId,
//         messageStatus,
//         createdAt,
//       } = msg;

//       if (!users.get(calculatedId)) {
//         let user = {
//           messageId: id,
//           type,
//           message,
//           messageStatus,
//           createdAt,
//           senderId,
//           receiverId,
//         };
//         if (isSender) {
//           user = {
//             ...user,
//             ...msg.receiver,
//             totalUnreadMessages: 0,
//           };
//         } else {
//           user = {
//             ...user,
//             ...msg.sender,
//             totalUnreadMessages: messageStatus !== "read" ? 1 : 0,
//           };
//         }
//         users.set(calculatedId, { ...user });
//       } else if (messageStatus !== "read" && !isSender) {
//         const user = users.get(calculatedId);
//         users.set(calculatedId, {
//           ...user,
//           totalUnreadMessages: user.totalUnreadMessages + 1,
//         });
//       }
//     });

//     if (messageStatusChange.length) {
//       await primsa.messages.updateMany({
//         where: {
//           id: { in: messageStatusChange },
//         },
//         data: {
//           messageStatus: "delivered",
//         },
//       });
//     }

//     return ReS(res, {
//       [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.SUCCESS,
//       [constants.RESPONCE_KEY.MESSAGE]: "Users fetched successfully",
//       [constants.RESPONCE_KEY.DATA]: {
//         users: Array.from(users.values()),
//         onlineUsers: Array.from(onlineUsers.keys()),
//       },
//     });
//   } catch (err) {
//     return ReE(
//       res,
//       {
//         [constants.RESPONCE_KEY.STATUS_CODE]:
//           constants.STATUS_CODES.SERVER_ERROR,
//         [constants.RESPONCE_KEY.MESSAGE]: err.message,
//       },
//       constants.STATUS_CODES.SERVER_ERROR
//     );
//   }
// };

export const getInitialContactsWithMessages = async (req, res, next) => {
  try {
    const userId = parseInt(req.body.from);

    const primsa = getPrismaInstance();

    const user = await primsa.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        sentMessages: {
          include: { receiver: true, sender: true },
          orderBy: { createdAt: "desc" },
        },
        receivedMessages: {
          include: { receiver: true, sender: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const messages = [...user.sentMessages, ...user.receivedMessages];
    messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const users = new Map();
    const messageStatusChange = [];

    messages.forEach((msg) => {
      if (msg.deletedAt === null) {
        msg = { ...msg, message: msg.message };
      }

      const isSender = msg.senderId === userId;
      const calculatedId = isSender ? msg.receiverId : msg.senderId;

      if (msg.messageStatus === "sent" && !isSender) {
        messageStatusChange.push(msg.id);
      }

      const {
        id,
        type,
        message,
        iv,
        receiverId,
        senderId,
        messageStatus,
        createdAt,
        deletedAt,
      } = msg;

      if (!users.get(calculatedId)) {
        let user = {
          messageId: id,
          type,
          message,
          iv,
          messageStatus,
          createdAt,
          senderId,
          receiverId,
          deletedAt,
        };

        if (isSender) {
          user = { ...user, ...msg.receiver, totalUnreadMessages: 0 };
        } else {
          user = {
            ...user,
            ...msg.sender,
            totalUnreadMessages: messageStatus !== "read" ? 1 : 0,
          };
        }

        users.set(calculatedId, { ...user });
      } else if (messageStatus !== "read" && !isSender) {
        const user = users.get(calculatedId);
        users.set(calculatedId, {
          ...user,
          totalUnreadMessages: user.totalUnreadMessages + 1,
        });
      }
    });

    if (messageStatusChange.length) {
      await primsa.messages.updateMany({
        where: {
          id: { in: messageStatusChange },
          receiverId: userId, // Ensure only received messages are updated
          messageStatus: "sent", // Only update if still marked as "sent"
        },
        data: {
          messageStatus: "delivered",
        },
      });
    }

    return ReS(res, {
      [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.SUCCESS,
      [constants.RESPONCE_KEY.MESSAGE]: "Users fetched successfully",
      [constants.RESPONCE_KEY.DATA]: {
        users: Array.from(users.values()),
        onlineUsers: Array.from(onlineUsers.keys()),
      },
    });
  } catch (err) {
    return ReE(
      res,
      {
        [constants.RESPONCE_KEY.STATUS_CODE]:
          constants.STATUS_CODES.SERVER_ERROR,
        [constants.RESPONCE_KEY.MESSAGE]: err.message,
      },
      constants.STATUS_CODES.SERVER_ERROR
    );
  }
};
