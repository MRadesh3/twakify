import constants from "../config/constants.js";
import { ReE, ReS } from "../services/util.service.js";
import getPrismaInstance from "../utils/PrismaClient.js";
import { renameSync, mkdirSync, existsSync } from "fs";
import { encryptMessage, decryptMessage } from "../utils/CryptoUtils.js";
import { getFileType } from "../middlewares/fileValidation.js";
import path from "path";
import fs from "fs";

// Add new group

// export const addGroup = async (req, res, next) => {
//   try {
//     const prisma = getPrismaInstance();

//     const { name, about, selectedIds, adminId, image } = req.body;

//     const isGroupExist = await prisma.groups.findUnique({
//       where: { name },
//     });

//     if (!isGroupExist) {
//       return ReE(
//         res,
//         {
//           [constants.RESPONCE_KEY.STATUS_CODE]:
//             constants.STATUS_CODES.VALIDATION,
//           [constants.RESPONCE_KEY.MESSAGE]: "Group not found",
//         },
//         constants.STATUS_CODES.VALIDATION
//       );
//     }

//     let newFilePath = null;

//     if (req.file) {
//       let folderPath = `uploads/groupchat/profiles`;

//       const folderExists = existsSync(folderPath);
//       if (!folderExists) {
//         mkdirSync(folderPath, { recursive: true });
//       }

//       const date = Date.now();
//       const fileName = `${date}-${req.file.originalname}`;
//       newFilePath = path.join(folderPath, fileName);

//       renameSync(req.file.path, newFilePath);

//       newFilePath = `uploads/groupchat/profiles/${fileName}`;
//     }

//     const newGroup = await prisma.groups.create({
//       data: {
//         name,
//         about,
//         profilePicture: newFilePath || image,
//         createdAt: new Date(),
//       },
//     });

//     await prisma.groupMember.create({
//       data: {
//         userId: parseInt(adminId),
//         groupId: newGroup.id,
//         role: "ADMIN",
//         joinedAt: new Date(),
//       },
//     });

//     const membersToAdd = selectedIds.filter(
//       (id) => parseInt(id) !== parseInt(adminId)
//     );

//     if (selectedIds.length > 0) {
//       await Promise.all(
//         membersToAdd.map(async (user) => {
//           return prisma.groupMember.create({
//             data: {
//               userId: parseInt(user),
//               groupId: newGroup.id,
//               role: "MEMBER",
//               joinedAt: new Date(),
//             },
//           });
//         })
//       );
//     }

//     // Fetch the created group along with its members' details
//     const groupWithMembers = await prisma.groups.findUnique({
//       where: { id: newGroup.id },
//       include: {
//         groupMembers: {
//           include: {
//             user: {
//               select: {
//                 id: true,
//                 name: true,
//                 email: true,
//                 about: true,
//                 profilePicture: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     return ReS(
//       res,
//       {
//         [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.CREATED,
//         [constants.RESPONCE_KEY.MESSAGE]: "New group added successfully",
//         [constants.RESPONCE_KEY.DATA]: groupWithMembers,
//       },
//       constants.STATUS_CODES.CREATED
//     );
//   } catch (err) {
//     console.error("Error adding group:", err);
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

export const addGroup = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();

    const { name, about, selectedIds, adminId, image, groupType } = req.body;

    const existingGroup = await prisma.groups.findUnique({
      where: { name },
    });

    if (existingGroup) {
      return ReE(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.SUCCESS,
          [constants.RESPONCE_KEY.MESSAGE]:
            "Group with this name already exists",
        },
        constants.STATUS_CODES.SUCCESS
      );
    }

    let newFilePath = null;

    if (req.file) {
      let folderPath = `uploads/groupchat/profiles`;

      const folderExists = existsSync(folderPath);
      if (!folderExists) {
        mkdirSync(folderPath, { recursive: true });
      }

      const date = Date.now();
      const fileName = `${date}-${req.file.originalname}`;
      newFilePath = path.join(folderPath, fileName);

      renameSync(req.file.path, newFilePath);

      newFilePath = `uploads/groupchat/profiles/${fileName}`;
    }

    const newGroup = await prisma.groups.create({
      data: {
        name,
        about,
        profilePicture: newFilePath || image,
        groupType,
        createdBy: parseInt(adminId, 10),
        createdAt: new Date(),
      },
    });

    await prisma.groupMember.create({
      data: {
        userId: parseInt(adminId),
        groupId: newGroup.id,
        role: "ADMIN",
        addedBy: parseInt(adminId, 10),
        joinedAt: new Date(),
      },
    });

    const membersToAdd = selectedIds.filter(
      (id) => parseInt(id) !== parseInt(adminId)
    );

    if (selectedIds.length > 0) {
      await Promise.all(
        membersToAdd.map(async (user) => {
          return prisma.groupMember.create({
            data: {
              userId: parseInt(user),
              groupId: newGroup.id,
              role: "MEMBER",
              addedBy: parseInt(adminId, 10),
              joinedAt: new Date(),
            },
          });
        })
      );
    }

    // Fetch the created group along with its members' details
    const groupWithMembers = await prisma.groups.findUnique({
      where: { id: newGroup.id },
      include: {
        groupMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                about: true,
                profilePicture: true,
              },
            },
            adder: {
              // Including the adderInfo relationship
              select: {
                id: true,
                name: true,
                email: true,
                about: true,
                profilePicture: true,
              },
            },
          },
        },
        creater: {
          // Use 'creater' as the relation name
          select: {
            id: true,
            name: true,
            email: true,
            about: true,
            profilePicture: true,
          },
        },
      },
    });

    return ReS(
      res,
      {
        [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.CREATED,
        [constants.RESPONCE_KEY.MESSAGE]: "New group added successfully",
        [constants.RESPONCE_KEY.DATA]: groupWithMembers,
      },
      constants.STATUS_CODES.CREATED
    );
  } catch (err) {
    console.error("Error adding group:", err);
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return ReE(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]:
            constants.STATUS_CODES.VALIDATION,
          [constants.RESPONCE_KEY.MESSAGE]:
            "Group with this name already exists",
        },
        constants.STATUS_CODES.VALIDATION
      );
    }
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

// Update group details

export const updateGroup = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const { name, about, selectedIds, adminId, groupId, image, groupType } =
      req.body;
    console.log(req.body);

    const isGroupExist = await prisma.groups.findUnique({
      where: { id: parseInt(groupId, 10) },
      include: { groupMembers: true }, // Fetch current members
    });

    if (!isGroupExist) {
      return ReE(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]:
            constants.STATUS_CODES.VALIDATION,
          [constants.RESPONCE_KEY.MESSAGE]: "Group not found",
        },
        constants.STATUS_CODES.VALIDATION
      );
    }

    // Check if the name has changed
    const isNameChanged = isGroupExist.name !== name;

    // If the name has changed, perform the uniqueness check
    if (isNameChanged) {
      const existingGroup = await prisma.groups.findUnique({
        where: { name },
      });

      if (existingGroup) {
        return ReE(
          res,
          {
            [constants.RESPONCE_KEY.STATUS_CODE]:
              constants.STATUS_CODES.SUCCESS,
            [constants.RESPONCE_KEY.MESSAGE]:
              "Group with this name already exists",
          },
          constants.STATUS_CODES.SUCCESS
        );
      }
    }

    let newFilePath = isGroupExist?.profilePicture;

    if (
      image &&
      (image.startsWith("/avatars") || image.startsWith("/heroavatars"))
    ) {
      if (image.startsWith("/avatars") || image.startsWith("/heroavatars")) {
        newFilePath = image; // Update the profilePicture with the new image URL.
      }

      const oldFilePath = path.resolve(isGroupExist?.profilePicture);
      console.log("Resolved file path:", oldFilePath);

      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (err) {
          console.error("Error deleting old file:", err.message);
        }
      }
    }

    if (req.file) {
      // const oldFilePath = path.join(__dirname, isGroupExist.profilePicture);
      const oldFilePath = path.resolve(isGroupExist?.profilePicture);
      console.log("Resolved file path:", oldFilePath);

      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (err) {
          console.error("Error deleting old file:", err.message);
        }
      }

      const folderPath = `uploads/groupchat/profiles`;
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const fileName = `${Date.now()}-${req.file.originalname}`;
      newFilePath = path.join(folderPath, fileName);

      fs.renameSync(req.file.path, newFilePath);
      newFilePath = `uploads/groupchat/profiles/${fileName}`;
    }

    await prisma.groups.update({
      where: { id: parseInt(groupId, 10) },
      data: {
        name,
        about,
        profilePicture: image === "undefined" ? "null" : newFilePath,
        groupType,
        createdBy: isGroupExist?.createdBy,
        createdAt: new Date(),
      },
    });

    // Get existing group members
    const existingMemberIds = isGroupExist.groupMembers
      .map((m) => (m.removedAt === null ? m.userId : undefined))
      .filter((userId) => userId !== undefined);

    console.log("exist", existingMemberIds);

    // Convert selectedIds to integers
    const selectedUserIds = selectedIds.map((id) => parseInt(id));

    // Members to add (in selectedIds but NOT in existing members)
    const membersToAdd = selectedUserIds.filter(
      (id) => !existingMemberIds.includes(id)
    );

    console.log("add", membersToAdd);

    // Members to remove (in existing members but NOT in selectedIds)
    const membersToRemove = existingMemberIds.filter(
      (id) => !selectedUserIds.includes(id)
    );

    console.log("members remove", membersToRemove);

    const groupCreator = isGroupExist.createdBy; // Assuming `createdBy` stores creator ID

    const membersToRemoveFiltered = membersToRemove
      .filter((id) => {
        if (id === groupCreator && parseInt(adminId, 10) !== groupCreator) {
          return false; // Block removal of creator by anyone else
        }
        return true;
      })
      .map((id) => parseInt(id, 10)); // Ensure the IDs are integers
    console.log("remove", membersToRemoveFiltered);

    // Add new members
    if (membersToAdd.length > 0) {
      const groupIdInt = parseInt(groupId, 10);
      const adminIdInt = parseInt(adminId, 10);

      await Promise.all(
        membersToAdd.map(async (userId) => {
          const userIdInt = parseInt(userId, 10);

          // Check if the user is already a member of the group, regardless of removedAt status
          const existingMember = await prisma.groupMember.findUnique({
            where: {
              userId_groupId: {
                userId: userIdInt,
                groupId: groupIdInt,
              },
            },
          });

          if (existingMember) {
            // If the user was previously removed, update the record
            if (existingMember.removedAt !== null) {
              await prisma.groupMember.update({
                where: { id: existingMember.id },
                data: {
                  removedAt: null,
                  role: "MEMBER",
                  addedBy: adminIdInt,
                  joinedAt: new Date(),
                },
              });
            }
            // If the user is already an active member, you can choose to handle it as needed
          } else {
            // If the user is not a member, create a new record
            await prisma.groupMember.create({
              data: {
                userId: userIdInt,
                groupId: groupIdInt,
                role: "MEMBER",
                addedBy: adminIdInt,
                joinedAt: new Date(),
              },
            });
          }
        })
      );

      // await Promise.all(
      //   membersToAdd.map(async (userId) => {
      //     return prisma.groupMember.create({
      //       data: {
      //         userId: parseInt(userId, 10),
      //         groupId: parseInt(groupId, 10),
      //         role: "MEMBER",
      //         addedBy: parseInt(adminId, 10),
      //         joinedAt: new Date(),
      //       },
      //     });
      //   })
      // );
    }

    if (membersToRemove.length > 0) {
      await prisma.groupMember.updateMany({
        where: {
          groupId: parseInt(groupId, 10),
          userId: { in: membersToRemoveFiltered },
        },
        data: {
          removedAt: new Date(), // Mark the removal time
        },
      });
    }

    const groupWithMembers = await prisma.groups.findUnique({
      where: { id: parseInt(groupId, 10) },
      // include: {
      //   groupMembers: {
      //     include: {
      //       user: {
      //         select: {
      //           id: true,
      //           name: true,
      //           email: true,
      //           about: true,
      //           profilePicture: true,
      //         },
      //       },
      //     },
      //   },
      // },
      include: {
        groupMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                about: true,
                profilePicture: true,
              },
            },
            adder: {
              // Including the adderInfo relationship
              select: {
                id: true,
                name: true,
                email: true,
                about: true,
                profilePicture: true,
              },
            },
          },
        },
        creater: {
          // Use 'creater' as the relation name
          select: {
            id: true,
            name: true,
            email: true,
            about: true,
            profilePicture: true,
          },
        },
      },
    });

    return ReS(
      res,
      {
        [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.CREATED,
        [constants.RESPONCE_KEY.MESSAGE]: "Group updated successfully",
        [constants.RESPONCE_KEY.DATA]: groupWithMembers,
      },
      constants.STATUS_CODES.CREATED
    );
  } catch (err) {
    console.error("Error updating group:", err);
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

// Get all groups for specific user

export const getUserGroups = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();

    const { userId } = req.body;

    const groups = await prisma.groups.findMany({
      where: {
        groupMembers: {
          some: {
            userId: parseInt(userId),
            removedAt: null,
          },
        },
      },
      include: {
        groupMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                about: true,
                profilePicture: true,
              },
            },
            adder: {
              // Including the adderInfo relationship
              select: {
                id: true,
                name: true,
                email: true,
                about: true,
                profilePicture: true,
              },
            },
          },
        },
        creater: {
          // Use 'creater' as the relation name
          select: {
            id: true,
            name: true,
            email: true,
            about: true,
            profilePicture: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Sort by createdAt in descending order (newest first)
      },
    });

    return ReS(
      res,
      {
        [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.OK,
        [constants.RESPONCE_KEY.MESSAGE]:
          "All groups of user fetched successfully",
        [constants.RESPONCE_KEY.DATA]: groups,
      },
      constants.STATUS_CODES.OK
    );
  } catch (err) {
    console.error("Error fetching user groups:", err);
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

// Make and remove admin

// export const editAdmin = async (req, res, next) => {
//   try {
//     const prisma = getPrismaInstance();

//     const { groupId, userId, editorId, newRole } = req.body;

//     console.log(req.body);

//     const isGroupExist = await prisma.groups.findUnique({
//       where: { id: parseInt(groupId, 10) },
//       include: { groupMembers: true },
//     });

//     if (!isGroupExist) {
//       return ReE(
//         res,
//         {
//           [constants.RESPONCE_KEY.STATUS_CODE]:
//             constants.STATUS_CODES.VALIDATION,
//           [constants.RESPONCE_KEY.MESSAGE]: "Group not found",
//         },
//         constants.STATUS_CODES.VALIDATION
//       );
//     }

//     const isUserExist = await prisma.user.findUnique({
//       where: { id: parseInt(userId, 10) },
//     });

//     if (!isUserExist) {
//       return ReE(
//         res,
//         {
//           [constants.RESPONCE_KEY.STATUS_CODE]:
//             constants.STATUS_CODES.VALIDATION,
//           [constants.RESPONCE_KEY.MESSAGE]: "User not found",
//         },
//         constants.STATUS_CODES.VALIDATION
//       );
//     }

//     // Check if the editor has the "ADMIN" role in the group
//     const editor = isGroupExist.groupMembers.find(
//       (member) => member?.userId === editorId
//     );
//     console.log(editor);

//     if (!editor || editor.role !== "ADMIN") {
//       return ReE(
//         res,
//         {
//           [constants.RESPONCE_KEY.STATUS_CODE]:
//             constants.STATUS_CODES.FORBIDDEN,
//           [constants.RESPONCE_KEY.MESSAGE]:
//             "Only users with the 'ADMIN' role can update user roles.",
//         },
//         constants.STATUS_CODES.FORBIDDEN
//       );
//     }

//     if (editor.role === "ADMIN") {
//       // Check if there are other admins
//       const otherAdmins = isGroupExist.groupMembers.filter(
//         (m) => m.role === "ADMIN" && m.userId !== userId && m.removedAt === null
//       );

//       if (otherAdmins.length === 0) {
//         if (isGroupExist.groupMembers.length === 1) {
//           // User is the only member, delete the group
//           await prisma.groups.delete({
//             where: { id: groupId },
//           });
//           return ReS(
//             res,
//             {
//               [constants.RESPONCE_KEY.STATUS_CODE]:
//                 constants.STATUS_CODES.SUCCESS,
//               [constants.RESPONCE_KEY.MESSAGE]:
//                 "Group deleted as the only admin left",
//             },
//             constants.STATUS_CODES.SUCCESS
//           );
//         } else {
//           return ReE(
//             res,
//             {
//               [constants.RESPONCE_KEY.STATUS_CODE]:
//                 constants.STATUS_CODES.SUCCESS,
//               [constants.RESPONCE_KEY.MESSAGE]: "You are the only admin",
//             },
//             constants.STATUS_CODES.SUCCESS
//           );
//         }
//       } else {
//         await prisma.groups.update({
//           where: { id: parseInt(groupId, 10) },
//           data: {
//             createdBy: parseInt(otherAdmins[0].userId, 10),
//           },
//         });
//       }
//     }

//     const updatedUser = await prisma.groupMember.update({
//       where: {
//         userId_groupId: {
//           userId: parseInt(userId, 10),
//           groupId: parseInt(groupId, 10),
//         },
//       },
//       data: { role: newRole },
//     });

//     return ReS(
//       res,
//       {
//         [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.CREATED,
//         [constants.RESPONCE_KEY.MESSAGE]: "User role updated successfully",
//         [constants.RESPONCE_KEY.DATA]: updatedUser,
//       },
//       constants.STATUS_CODES.CREATED
//     );
//   } catch (err) {
//     console.error("Error updating user role:", err);
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

// export const editAdmin = async (req, res, next) => {
//   try {
//     const prisma = getPrismaInstance();

//     const { groupId, userId, editorId, newRole } = req.body;

//     console.log(req.body);

//     const isGroupExist = await prisma.groups.findUnique({
//       where: { id: parseInt(groupId, 10) },
//       include: { groupMembers: true },
//     });

//     if (!isGroupExist) {
//       return ReE(
//         res,
//         {
//           [constants.RESPONCE_KEY.STATUS_CODE]:
//             constants.STATUS_CODES.VALIDATION,
//           [constants.RESPONCE_KEY.MESSAGE]: "Group not found",
//         },
//         constants.STATUS_CODES.VALIDATION
//       );
//     }

//     const isUserExist = await prisma.user.findUnique({
//       where: { id: parseInt(userId, 10) },
//     });

//     if (!isUserExist) {
//       return ReE(
//         res,
//         {
//           [constants.RESPONCE_KEY.STATUS_CODE]:
//             constants.STATUS_CODES.VALIDATION,
//           [constants.RESPONCE_KEY.MESSAGE]: "User not found",
//         },
//         constants.STATUS_CODES.VALIDATION
//       );
//     }

//     // Check if the editor has the "ADMIN" role in the group
//     const editor = isGroupExist.groupMembers.find(
//       (member) => member?.userId === editorId
//     );

//     if (!editor || editor.role !== "ADMIN") {
//       return ReE(
//         res,
//         {
//           [constants.RESPONCE_KEY.STATUS_CODE]:
//             constants.STATUS_CODES.FORBIDDEN,
//           [constants.RESPONCE_KEY.MESSAGE]:
//             "Only admins can update user roles.",
//         },
//         constants.STATUS_CODES.FORBIDDEN
//       );
//     }

//     // Check if the user being updated is an ADMIN
//     const userToUpdate = isGroupExist.groupMembers.find(
//       (member) => member?.userId === parseInt(userId, 10)
//     );

//     if (!userToUpdate) {
//       return ReE(
//         res,
//         {
//           [constants.RESPONCE_KEY.STATUS_CODE]:
//             constants.STATUS_CODES.VALIDATION,
//           [constants.RESPONCE_KEY.MESSAGE]: "User is not in the group",
//         },
//         constants.STATUS_CODES.VALIDATION
//       );
//     }

//     // If user is the only admin, prevent them from being demoted unless another admin is assigned
//     const admins = isGroupExist.groupMembers.filter(
//       (member) => member.role === "ADMIN" && member.removedAt === null
//     );

//     if (admins.length === 1 && admins[0].userId === parseInt(userId, 10)) {
//       return ReE(
//         res,
//         {
//           [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.SUCCESS,
//           [constants.RESPONCE_KEY.MESSAGE]: "You are the only admin",
//         },
//         constants.STATUS_CODES.SUCCESS
//       );
//     }

//     const updatedUser = await prisma.groupMember.update({
//       where: {
//         userId_groupId: {
//           userId: parseInt(userId, 10),
//           groupId: parseInt(groupId, 10),
//         },
//       },
//       data: { role: newRole },
//     });

//     const groupWithMembers = await prisma.groups.findUnique({
//       where: { id: parseInt(groupId, 10) },
//       // include: {
//       //   groupMembers: {
//       //     include: {
//       //       user: {
//       //         select: {
//       //           id: true,
//       //           name: true,
//       //           email: true,
//       //           about: true,
//       //           profilePicture: true,
//       //         },
//       //       },
//       //     },
//       //   },
//       // },
//       include: {
//         groupMembers: {
//           include: {
//             user: {
//               select: {
//                 id: true,
//                 name: true,
//                 email: true,
//                 about: true,
//                 profilePicture: true,
//               },
//             },
//             adder: {
//               // Including the adderInfo relationship
//               select: {
//                 id: true,
//                 name: true,
//                 email: true,
//                 about: true,
//                 profilePicture: true,
//               },
//             },
//           },
//         },
//         creater: {
//           // Use 'creater' as the relation name
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             about: true,
//             profilePicture: true,
//           },
//         },
//       },
//     });

//     return ReS(
//       res,
//       {
//         [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.CREATED,
//         [constants.RESPONCE_KEY.MESSAGE]: "User role updated successfully",
//         [constants.RESPONCE_KEY.DATA]: groupWithMembers,
//       },
//       constants.STATUS_CODES.CREATED
//     );
//   } catch (err) {
//     console.error("Error updating user role:", err);
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

export const editAdmin = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();

    const { groupId, userId, editorId, newRole } = req.body;

    console.log(req.body);

    const isGroupExist = await prisma.groups.findUnique({
      where: { id: parseInt(groupId, 10) },
      include: { groupMembers: true },
    });

    if (!isGroupExist) {
      return ReE(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]:
            constants.STATUS_CODES.VALIDATION,
          [constants.RESPONCE_KEY.MESSAGE]: "Group not found",
        },
        constants.STATUS_CODES.VALIDATION
      );
    }

    const isUserExist = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
    });

    if (!isUserExist) {
      return ReE(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]:
            constants.STATUS_CODES.VALIDATION,
          [constants.RESPONCE_KEY.MESSAGE]: "User not found",
        },
        constants.STATUS_CODES.VALIDATION
      );
    }

    // Check if the editor has the "ADMIN" role in the group
    const editor = isGroupExist.groupMembers.find(
      (member) => member?.userId === editorId
    );

    if (!editor || editor.role !== "ADMIN") {
      return ReE(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]:
            constants.STATUS_CODES.FORBIDDEN,
          [constants.RESPONCE_KEY.MESSAGE]:
            "Only admins can update user roles.",
        },
        constants.STATUS_CODES.FORBIDDEN
      );
    }

    // Check if the user being updated is in the group
    const userToUpdate = isGroupExist.groupMembers.find(
      (member) => member?.userId === parseInt(userId, 10)
    );

    if (!userToUpdate) {
      return ReE(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]:
            constants.STATUS_CODES.VALIDATION,
          [constants.RESPONCE_KEY.MESSAGE]: "User is not in the group",
        },
        constants.STATUS_CODES.VALIDATION
      );
    }

    // Fetch all admins in the group
    const admins = isGroupExist.groupMembers.filter(
      (member) => member.role === "ADMIN" && member.removedAt === null
    );

    // If user is the only admin, prevent them from being demoted unless another admin is assigned
    if (admins.length === 1 && admins[0].userId === parseInt(userId, 10)) {
      return ReE(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.SUCCESS,
          [constants.RESPONCE_KEY.MESSAGE]: "You are the only admin",
        },
        constants.STATUS_CODES.SUCCESS
      );
    }

    // If the user being demoted is the group creator, assign a new creator
    let newCreator = null;
    if (
      isGroupExist.createdBy === parseInt(userId, 10) &&
      newRole !== "ADMIN"
    ) {
      const newAdmin = admins.find(
        (admin) => admin.userId !== parseInt(userId, 10)
      );
      if (newAdmin) {
        newCreator = newAdmin.userId;
      }
    }

    // Update the user's role
    await prisma.groupMember.update({
      where: {
        userId_groupId: {
          userId: parseInt(userId, 10),
          groupId: parseInt(groupId, 10),
        },
      },
      data: { role: newRole },
    });

    // If a new creator is assigned, update the group creator
    if (newCreator) {
      await prisma.groups.update({
        where: { id: parseInt(groupId, 10) },
        data: { createdBy: parseInt(newCreator, 10) },
      });
    }

    const groupWithMembers = await prisma.groups.findUnique({
      where: { id: parseInt(groupId, 10) },
      include: {
        groupMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                about: true,
                profilePicture: true,
              },
            },
            adder: {
              select: {
                id: true,
                name: true,
                email: true,
                about: true,
                profilePicture: true,
              },
            },
          },
        },
        creater: {
          select: {
            id: true,
            name: true,
            email: true,
            about: true,
            profilePicture: true,
          },
        },
      },
    });

    return ReS(
      res,
      {
        [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.CREATED,
        [constants.RESPONCE_KEY.MESSAGE]: "User role updated successfully",
        [constants.RESPONCE_KEY.DATA]: groupWithMembers,
      },
      constants.STATUS_CODES.CREATED
    );
  } catch (err) {
    console.error("Error updating user role:", err);
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

// Leave group

export const leaveGroup = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const { groupId, userId } = req.body;

    // Parse IDs to integers
    const groupIdInt = parseInt(groupId, 10);
    const userIdInt = parseInt(userId, 10);

    // Fetch the group with its members
    const group = await prisma.groups.findUnique({
      where: { id: groupIdInt },
      include: { groupMembers: true },
    });

    if (!group) {
      return ReE(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]:
            constants.STATUS_CODES.VALIDATION,
          [constants.RESPONCE_KEY.MESSAGE]: "Group not found",
        },
        constants.STATUS_CODES.VALIDATION
      );
    }

    // Find the member who wants to leave
    const member = group.groupMembers.find((m) => m.userId === userIdInt);
    const groupCreator = group.createdBy;

    if (!member) {
      return ReE(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]:
            constants.STATUS_CODES.VALIDATION,
          [constants.RESPONCE_KEY.MESSAGE]:
            "User is not a member of this group",
        },
        constants.STATUS_CODES.VALIDATION
      );
    }

    if (member.role === "ADMIN") {
      // Check if there are other admins
      const otherAdmins = group.groupMembers.filter(
        (m) =>
          m.role === "ADMIN" && m.userId !== userIdInt && m.removedAt === null
      );

      if (otherAdmins.length === 0) {
        if (group.groupMembers.length === 1) {
          // User is the only member, delete the group
          await prisma.groups.delete({
            where: { id: groupIdInt },
          });
          return ReS(
            res,
            {
              [constants.RESPONCE_KEY.STATUS_CODE]:
                constants.STATUS_CODES.SUCCESS,
              [constants.RESPONCE_KEY.MESSAGE]:
                "Group deleted as the only admin left",
            },
            constants.STATUS_CODES.SUCCESS
          );
        } else {
          return ReE(
            res,
            {
              [constants.RESPONCE_KEY.STATUS_CODE]:
                constants.STATUS_CODES.SUCCESS,
              [constants.RESPONCE_KEY.MESSAGE]: "You are the only admin",
            },
            constants.STATUS_CODES.SUCCESS
          );
        }
      } else {
        await prisma.groups.update({
          where: { id: parseInt(groupId, 10) },
          data: {
            createdBy: parseInt(otherAdmins[0].userId, 10),
          },
        });
      }
    }

    // Update the member's removedAt timestamp to indicate they've left
    await prisma.groupMember.update({
      where: {
        userId_groupId: {
          userId: userIdInt,
          groupId: groupIdInt,
        },
      },
      data: { removedAt: new Date() },
    });

    const groupWithMembers = await prisma.groups.findUnique({
      where: { id: parseInt(groupId, 10) },
      // include: {
      //   groupMembers: {
      //     include: {
      //       user: {
      //         select: {
      //           id: true,
      //           name: true,
      //           email: true,
      //           about: true,
      //           profilePicture: true,
      //         },
      //       },
      //     },
      //   },
      // },
      include: {
        groupMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                about: true,
                profilePicture: true,
              },
            },
            adder: {
              // Including the adderInfo relationship
              select: {
                id: true,
                name: true,
                email: true,
                about: true,
                profilePicture: true,
              },
            },
          },
        },
        creater: {
          // Use 'creater' as the relation name
          select: {
            id: true,
            name: true,
            email: true,
            about: true,
            profilePicture: true,
          },
        },
      },
    });

    return ReS(
      res,
      {
        [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.CREATED,
        [constants.RESPONCE_KEY.MESSAGE]: "User left the group successfully",
        [constants.RESPONCE_KEY.DATA]: groupWithMembers,
      },
      constants.STATUS_CODES.CREATED
    );
  } catch (err) {
    console.error("Error updating user role:", err);
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

// Delete group

export const deleteGroup = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const { groupId, userId, editorId } = req.body;

    console.log(req.body);

    const isGroupExist = await prisma.groups.findUnique({
      where: { id: parseInt(groupId, 10) },
      include: { groupMembers: true },
    });

    if (!isGroupExist) {
      return ReE(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]:
            constants.STATUS_CODES.VALIDATION,
          [constants.RESPONCE_KEY.MESSAGE]: "Group not found",
        },
        constants.STATUS_CODES.VALIDATION
      );
    }

    const isUserExist = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
    });

    if (!isUserExist) {
      return ReE(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]:
            constants.STATUS_CODES.VALIDATION,
          [constants.RESPONCE_KEY.MESSAGE]: "User not found",
        },
        constants.STATUS_CODES.VALIDATION
      );
    }

    const editor = isGroupExist.groupMembers.find(
      (member) => member?.userId === parseInt(userId, 10)
    );

    const groupCreator = isGroupExist?.createdBy;

    console.log("Group Creator:", groupCreator, "Editor:", editor);

    if (!editor || editor.role !== "ADMIN") {
      return ReE(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]:
            constants.STATUS_CODES.FORBIDDEN,
          [constants.RESPONCE_KEY.MESSAGE]:
            "Only ADMIN users can delete the group.",
        },
        constants.STATUS_CODES.FORBIDDEN
      );
    }

    if (groupCreator !== parseInt(userId, 10)) {
      return ReE(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]:
            constants.STATUS_CODES.FORBIDDEN,
          [constants.RESPONCE_KEY.MESSAGE]:
            "Only the group creator can delete the group.",
        },
        constants.STATUS_CODES.FORBIDDEN
      );
    }

    if (isGroupExist?.profilePicture) {
      const filePath = path.resolve(isGroupExist.profilePicture);
      console.log("Resolved file path:", filePath);

      if (fs.existsSync(filePath)) {
        try {
          console.log("Deleting file:", filePath);
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error("Error deleting file:", err.message);
        }
      } else {
        console.log("File does not exist:", filePath);
      }
    }

    await prisma.groups.delete({
      where: {
        id: parseInt(groupId, 10),
      },
    });

    return ReS(
      res,
      {
        [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.CREATED,
        [constants.RESPONCE_KEY.MESSAGE]: "Group deleted successfully",
      },
      constants.STATUS_CODES.CREATED
    );
  } catch (err) {
    console.error("Error deleting group:", err);
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

// Add group message

// export const addGroupMessage = async (req, res, next) => {
//   try {
//     const prisma = getPrismaInstance();

//     const { message, from, groupId, type } = req.body;

//     const isGroupExist = await prisma.groups.findUnique({
//       where: { id: parseInt(groupId, 10) },
//       include: { groupMembers: true },
//     });

//     console.log("group members", isGroupExist);

//     if (!isGroupExist) {
//       return ReE(
//         res,
//         {
//           [constants.RESPONCE_KEY.STATUS_CODE]:
//             constants.STATUS_CODES.NOT_FOUND,
//           [constants.RESPONCE_KEY.MESSAGE]: "Group not found",
//         },
//         constants.STATUS_CODES.NOT_FOUND
//       );
//     }

//     const { iv, encryptedData } = encryptMessage(message);

//     // Correct transaction logic
//     const result = await prisma.$transaction(async (prisma) => {
//       const newGroupMessage = await prisma.groupMessage.create({
//         data: {
//           groupId: parseInt(groupId, 10),
//           senderId: parseInt(from, 10),
//           message: encryptedData,
//           iv,
//           type,
//         },
//         include: {
//           sender: true,
//           // group: true,
//         },
//       });

//       const newReadStatus = await prisma.groupMessageReadStatus.create({
//         data: {
//           messageId: newGroupMessage?.id,
//           userId: parseInt(from, 10),
//           createdAt: new Date(),
//         },
//       });

//       // Return both objects together
//       return { newGroupMessage, newReadStatus };
//     });

//     // Attach read status to the message object
//     result.newGroupMessage.groupMessageReadStatus = [result.newReadStatus];

//     return ReS(
//       res,
//       {
//         [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.CREATED,
//         [constants.RESPONCE_KEY.MESSAGE]: "New group message added",
//         [constants.RESPONCE_KEY.DATA]: result.newGroupMessage,
//       },
//       constants.STATUS_CODES.CREATED
//     );
//   } catch (err) {
//     console.error("Error adding group message:", err);
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

export const addGroupMessage = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();

    const { message, from, groupId, type, messageAnswer } = req.body;
    console.log("messageAnswer", messageAnswer);

    const isGroupExist = await prisma.groups.findUnique({
      where: { id: parseInt(groupId, 10) },
      include: { groupMembers: true },
    });

    if (!isGroupExist) {
      return ReE(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]:
            constants.STATUS_CODES.NOT_FOUND,
          [constants.RESPONCE_KEY.MESSAGE]: "Group not found",
        },
        constants.STATUS_CODES.NOT_FOUND
      );
    }

    const { iv, encryptedData } = encryptMessage(message);

    const result = await prisma.$transaction(async (prisma) => {
      const newGroupMessage = await prisma.groupMessage.create({
        data: {
          groupId: parseInt(groupId, 10),
          senderId: parseInt(from, 10),
          message: encryptedData,
          messageAnswer,
          iv,
          type,
        },
        include: {
          sender: true,
        },
      });

      const readStatusPromises = isGroupExist.groupMembers
        .filter(
          (member) =>
            member.removedAt === null && member.userId !== parseInt(from, 10)
        )
        .map((member) =>
          prisma.groupMessageReadStatus.create({
            data: {
              messageId: newGroupMessage.id,
              userId: member.userId,
              createdAt: new Date(),
            },
          })
        );

      const readStatuses = await Promise.all(readStatusPromises);

      newGroupMessage.groupMessageReadStatus = readStatuses;

      return newGroupMessage;
    });

    return ReS(
      res,
      {
        [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.CREATED,
        [constants.RESPONCE_KEY.MESSAGE]: "New group message added",
        [constants.RESPONCE_KEY.DATA]: result,
      },
      constants.STATUS_CODES.CREATED
    );
  } catch (err) {
    console.error("Error adding group message:", err);
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

// Delete group message

export const deleteGroupMessage = async (req, res, next) => {
  try {
    console.log(req.body);

    const { messageId } = req.body;
    const prisma = getPrismaInstance();

    const isMessageExist = await prisma.groupMessage.findUnique({
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
          [constants.RESPONCE_KEY.MESSAGE]:
            "Message does not exist or you are not the sender",
        },
        constants.STATUS_CODES.VALIDATION
      );
    }

    const currentTime = new Date();

    if (isMessageExist.type === "text") {
      // Update only the deletedAt column for text messages
      await prisma.groupMessage.update({
        where: { id: parseInt(messageId, 10) },
        data: { deletedAt: currentTime },
      });

      return ReS(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.SUCCESS,
          [constants.RESPONCE_KEY.MESSAGE]:
            "Group message deleted successfully",
        },
        constants.STATUS_CODES.SUCCESS
      );
    } else {
      // Handle media messages
      const decryptedMessage = decryptMessage(
        isMessageExist?.message,
        isMessageExist?.iv
      );

      const filePath = path.resolve(decryptedMessage);

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
      await prisma.groupMessage.update({
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
          [constants.RESPONCE_KEY.MESSAGE]: "Group media deleted successfully",
        },
        constants.STATUS_CODES.SUCCESS
      );
    }
  } catch (err) {
    console.error("Error deleting group message:", err);
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

// Add group media message

export const addGroupMediaMessage = async (req, res, next) => {
  try {
    if (req.file) {
      console.log("hello from api");
      const { from, groupId } = req.body;
      console.log(req.body);

      console.log(req.file);

      const prisma = getPrismaInstance();

      const isGroupExist = await prisma.groups.findUnique({
        where: { id: parseInt(groupId, 10) },
        include: { groupMembers: true },
      });

      if (!isGroupExist) {
        return ReE(
          res,
          {
            [constants.RESPONCE_KEY.STATUS_CODE]:
              constants.STATUS_CODES.NOT_FOUND,
            [constants.RESPONCE_KEY.MESSAGE]: "Group not found",
          },
          constants.STATUS_CODES.NOT_FOUND
        );
      }

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

      // const getUser = onlineUsers.get(Number(to));

      const { iv, encryptedData } = encryptMessage(newFilePath);

      const result = await prisma.$transaction(async (prisma) => {
        const newGroupMediaMessage = await prisma.groupMessage.create({
          data: {
            groupId: parseInt(groupId, 10),
            senderId: parseInt(from, 10),
            message: encryptedData,
            iv,
            type: fileType,
          },
          include: {
            sender: true,
          },
        });

        const readStatusPromises = isGroupExist.groupMembers
          .filter(
            (member) =>
              member.removedAt === null && member.userId !== parseInt(from, 10)
          )
          .map((member) =>
            prisma.groupMessageReadStatus.create({
              data: {
                messageId: newGroupMediaMessage.id,
                userId: member.userId,
                createdAt: new Date(),
              },
            })
          );

        const readStatuses = await Promise.all(readStatusPromises);

        newGroupMediaMessage.groupMessageReadStatus = readStatuses;

        return newGroupMediaMessage;
      });

      return ReS(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.CREATED,
          [constants.RESPONCE_KEY.MESSAGE]: "New media message added",
          [constants.RESPONCE_KEY.DATA]: result,
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

// Get group messages

export const getGroupMessages = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();

    const { groupId, userId } = req.body;

    console.log(req.body);

    const messages = await prisma.groupMessage.findMany({
      where: {
        groupId: parseInt(groupId, 10),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
        groupMessageReadStatus: {
          select: {
            id: true,
            userId: true,
            readAt: true,
          },
        },
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
      console.log("message", message);

      if (message.deletedAt === null) {
        messages[index].message = message.message;
      }

      const isMessageUnread = message.groupMessageReadStatus.find(
        (status) =>
          status.userId === parseInt(userId, 10) && status.readAt === null
      );

      console.log("isMessage", isMessageUnread);

      if (isMessageUnread) {
        unreadMessages.push(isMessageUnread.id);
      }
    });

    console.log("unreadMessages", unreadMessages);

    // Mark unread messages as read
    await prisma.groupMessageReadStatus.updateMany({
      where: {
        id: { in: unreadMessages },
      },
      data: {
        readAt: new Date(),
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
    console.error("Error fetching group messages:", err);
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

// export const addMediaMessage = async (req, res, next) => {
//   try {
//     if (req.file) {
//       const { from, to } = req.body;
//       const fileType = getFileType(req.file);

//       let folderPath = `uploads/${fileType}`;

//       const folderExists = existsSync(folderPath);
//       if (!folderExists) {
//         mkdirSync(folderPath, { recursive: true });
//       }

//       const date = Date.now();
//       const fileName = `${date}-${req.file.originalname}`;
//       const newFilePath = path.join(folderPath, fileName);

//       renameSync(req.file.path, newFilePath);

//       const prisma = getPrismaInstance();
//       const getUser = onlineUsers.get(Number(to));

//       const { iv, encryptedData } = encryptMessage(newFilePath);

//       const message = await prisma.messages.create({
//         data: {
//           message: encryptedData,
//           iv,
//           type: fileType,
//           sender: {
//             connect: { id: parseInt(from) },
//           },
//           receiver: {
//             connect: { id: parseInt(to) },
//           },
//           messageStatus: getUser
//             ? constants.MESSAGE_STATUS.DELIVERED
//             : constants.MESSAGE_STATUS.SENT,
//         },
//       });

//       // const decryptedMessage = decryptMessage(message?.message, message?.iv);

//       // const responseData = {
//       //   ...message,
//       //   message: decryptedMessage,
//       // };

//       return ReS(
//         res,
//         {
//           [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.CREATED,
//           [constants.RESPONCE_KEY.MESSAGE]: "New message added",
//           [constants.RESPONCE_KEY.DATA]: message,
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
//           include: { receiver: true, sender: true },
//           orderBy: { createdAt: "desc" },
//         },
//         receivedMessages: {
//           include: { receiver: true, sender: true },
//           orderBy: { createdAt: "desc" },
//         },
//       },
//     });

//     const messages = [...user.sentMessages, ...user.receivedMessages];
//     messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

//     const users = new Map();
//     const messageStatusChange = [];

//     messages.forEach((msg) => {
//       if (msg.deletedAt === null) {
//         msg = { ...msg, message: msg.message };
//       }

//       const isSender = msg.senderId === userId;
//       const calculatedId = isSender ? msg.receiverId : msg.senderId;

//       if (msg.messageStatus === "sent" && !isSender) {
//         messageStatusChange.push(msg.id);
//       }

//       const {
//         id,
//         type,
//         message,
//         iv,
//         receiverId,
//         senderId,
//         messageStatus,
//         createdAt,
//         deletedAt,
//       } = msg;

//       if (!users.get(calculatedId)) {
//         let user = {
//           messageId: id,
//           type,
//           message,
//           iv,
//           messageStatus,
//           createdAt,
//           senderId,
//           receiverId,
//           deletedAt,
//         };

//         if (isSender) {
//           user = { ...user, ...msg.receiver, totalUnreadMessages: 0 };
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
//           receiverId: userId, // Ensure only received messages are updated
//           messageStatus: "sent", // Only update if still marked as "sent"
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

// Get group chats with unread messages

export const getGroupContactsWithUnreadCount = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id); // the requesting user
    const prisma = getPrismaInstance();

    // Get all groups the user is a member of
    const groupMemberships = await prisma.groupMember.findMany({
      where: { userId, removedAt: null },
      include: {
        group: {
          include: {
            groupMessages: {
              include: {
                sender: true,
                groupMessageReadStatus: {
                  where: { userId },
                },
              },
              orderBy: { createdAt: "desc" },
            },
            groupMembers: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    const groups = [];

    for (const membership of groupMemberships) {
      const group = membership.group;
      const latestMessage = group.groupMessages[0] || null;

      let unreadCount = 0;

      for (const msg of group.groupMessages) {
        const readStatus = msg.groupMessageReadStatus.find(
          (status) => status.userId === userId
        );

        if (readStatus && readStatus.readAt === null) {
          unreadCount++;
        }
      }

      groups.push({
        groupId: group.id,
        name: group.name,
        profilePicture: group.profilePicture,
        about: group.about,
        latestMessage: latestMessage
          ? {
              id: latestMessage.id,
              message: latestMessage.message,
              iv: latestMessage.iv,
              type: latestMessage.type,
              senderId: latestMessage.senderId,
              createdAt: latestMessage.createdAt,
              deletedAt: latestMessage.deletedAt,
              sender: latestMessage.sender,
            }
          : null,
        totalUnreadMessages: unreadCount,
      });
    }

    groups.sort((a, b) => {
      const dateA = a.latestMessage?.createdAt
        ? new Date(a.latestMessage.createdAt)
        : new Date(0);
      const dateB = b.latestMessage?.createdAt
        ? new Date(b.latestMessage.createdAt)
        : new Date(0);
      return dateB - dateA;
    });

    return ReS(res, {
      [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.SUCCESS,
      [constants.RESPONCE_KEY.MESSAGE]: "Group contacts fetched successfully",
      [constants.RESPONCE_KEY.DATA]: {
        groups,
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
