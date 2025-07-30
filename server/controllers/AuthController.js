import getPrismaInstance from "../utils/PrismaClient.js";
import { ReE, ReS } from "../services/util.service.js";
import { renameSync, mkdirSync, existsSync, unlinkSync } from "fs";
import constants from "../config/constants.js";
import { generateToken04 } from "../utils/TokenGenerator.js";
import path from "path";
import url from "url";
import fs from "fs";

// Check for user

export const checkUser = async (req, res, next) => {
  try {
    const { email } = req.body;

    const prisma = getPrismaInstance();

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        groupMembers: true,
      },
    });

    if (!user) {
      return ReE(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.SUCCESS,
          [constants.RESPONCE_KEY.MESSAGE]: "User not found",
        },
        constants.STATUS_CODES.SUCCESS
      );
    }

    return ReS(
      res,
      {
        [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.SUCCESS,
        [constants.RESPONCE_KEY.MESSAGE]: "User found",
        [constants.RESPONCE_KEY.DATA]: user,
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

// Register a user

export const onBoardUser = async (req, res, next) => {
  try {
    const { email, name, about, image } = req.body;

    let newFilePath = null;
    console.log(req.file);

    if (req.file) {
      let folderPath = `uploads/users`;

      const folderExists = existsSync(folderPath);
      if (!folderExists) {
        mkdirSync(folderPath, { recursive: true });
      }

      const date = Date.now();
      const fileName = `${date}-${req.file.originalname}`;
      newFilePath = path.join(folderPath, fileName);

      renameSync(req.file.path, newFilePath);

      newFilePath = `uploads/users/${fileName}`;
    }

    const prisma = getPrismaInstance();

    const isUserExists = await prisma.user.findUnique({
      where: { email },
    });

    if (isUserExists) {
      return ReE(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]:
            constants.STATUS_CODES.VALIDATION,
          [constants.RESPONCE_KEY.MESSAGE]: "User already exists",
        },
        constants.STATUS_CODES.VALIDATION
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        profilePicture: newFilePath || image,
        about,
      },
    });

    return ReS(
      res,
      {
        [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.SUCCESS,
        [constants.RESPONCE_KEY.MESSAGE]: "User created successfully",
        [constants.RESPONCE_KEY.DATA]: user,
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

// Update user details

export const updateUser = async (req, res, next) => {
  try {
    const { email, name, about, image, userId } = req.body;

    const prisma = getPrismaInstance();

    // Check if the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
    });

    if (!existingUser) {
      return ReE(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]:
            constants.STATUS_CODES.VALIDATION,
          [constants.RESPONCE_KEY.MESSAGE]: "User does not exist",
        },
        constants.STATUS_CODES.VALIDATION
      );
    }

    let newFilePath = existingUser.profilePicture;

    // Case 1: Image is uploaded via req.file (New File Upload)
    if (req.file) {
      const folderPath = `uploads/users`;

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const fileName = `${Date.now()}-${req.file.originalname}`;
      newFilePath = path.join(folderPath, fileName);
      fs.renameSync(req.file.path, newFilePath);

      newFilePath = `uploads/users/${fileName}`;

      // Delete old image if it exists
      if (
        existingUser.profilePicture &&
        fs.existsSync(existingUser.profilePicture)
      ) {
        fs.unlinkSync(existingUser.profilePicture);
      }
    }
    // Case 2: Image is provided as a path in req.body
    // else if (image) {
    //   // If image is a full file path and different from existingUser.profilePicture, delete old one
    //   if (
    //     existingUser.profilePicture &&
    //     existingUser.profilePicture !== image &&
    //     fs.existsSync(existingUser.profilePicture)
    //   ) {
    //     fs.unlinkSync(existingUser.profilePicture);
    //   }

    //   newFilePath = image; // Update with the new image path
    // }
    else if (image) {
      // Extract pathname from the image URL
      const parsedUrl = url.parse(image);
      const relativeImagePath = parsedUrl.pathname.startsWith("/")
        ? parsedUrl.pathname.slice(1)
        : parsedUrl.pathname; // remove leading slash if present

      const isSameImage = relativeImagePath === existingUser.profilePicture;

      console.log("relative", relativeImagePath);
      console.log("same", isSameImage);

      if (
        existingUser.profilePicture &&
        !isSameImage &&
        fs.existsSync(existingUser.profilePicture)
      ) {
        fs.unlinkSync(existingUser.profilePicture);
      }

      newFilePath = `/${relativeImagePath}`; // Save relative path in DB
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId, 10) },
      data: {
        email: email || existingUser.email,
        name: name || existingUser.name,
        about: about || existingUser.about,
        profilePicture: newFilePath,
      },
    });

    return ReS(
      res,
      {
        [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.SUCCESS,
        [constants.RESPONCE_KEY.MESSAGE]: "User profile updated successfully",
        [constants.RESPONCE_KEY.DATA]: updatedUser,
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

// Get all users

export const getAllUsers = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();

    const users = await prisma.user.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        email: true,
        name: true,
        about: true,
        profilePicture: true,
      },
    });

    const usersGroupedByInitialLetter = users.reduce((acc, user) => {
      const initialLetter = user.name[0].toUpperCase();

      if (!acc[initialLetter]) {
        acc[initialLetter] = [];
      }

      acc[initialLetter].push(user);

      return acc;
    }, {});

    return ReS(
      res,
      {
        [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.SUCCESS,
        [constants.RESPONCE_KEY.MESSAGE]: "Users fetched successfully",
        [constants.RESPONCE_KEY.DATA]: usersGroupedByInitialLetter,
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

// Delte user

export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const prisma = getPrismaInstance();

    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
    });

    if (!existingUser) {
      return ReE(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]:
            constants.STATUS_CODES.VALIDATION,
          [constants.RESPONCE_KEY.MESSAGE]: "User does not exist",
        },
        constants.STATUS_CODES.VALIDATION
      );
    }

    if (
      existingUser.profilePicture &&
      !existingUser.profilePicture.startsWith("/avatars/") &&
      !existingUser.profilePicture.startsWith("/heroavatars/") &&
      fs.existsSync(existingUser.profilePicture)
    ) {
      fs.unlinkSync(existingUser.profilePicture);
    }

    await prisma.user.delete({
      where: { id: parseInt(userId, 10) },
    });

    return ReS(
      res,
      {
        [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.SUCCESS,
        [constants.RESPONCE_KEY.MESSAGE]: "User deleted successfully",
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

// Zego cloud token

export const generateToken = async (req, res, next) => {
  try {
    const appId = parseInt(process.env.ZEGO_APP_ID);
    const serverSecret = process.env.ZEGO_SERVER_SECRET;

    const { userId } = req.body;
    const effectiveTime = 3600;
    const payload = "";

    if (appId && serverSecret && userId) {
      const token = await generateToken04(
        appId,
        userId,
        serverSecret,
        effectiveTime,
        payload
      );
      return ReS(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.CREATED,
          [constants.RESPONCE_KEY.MESSAGE]:
            "Zego Cloud token created successfully",
          [constants.RESPONCE_KEY.DATA]: token,
        },
        constants.STATUS_CODES.CREATED
      );
    }
    return ReE(
      res,
      {
        [constants.RESPONCE_KEY.STATUS_CODE]: constants.STATUS_CODES.VALIDATION,
        [constants.RESPONCE_KEY.MESSAGE]:
          "App Id and server secret keys are required",
      },
      constants.STATUS_CODES.VALIDATION
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
