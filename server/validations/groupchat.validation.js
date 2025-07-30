import { body, check } from "express-validator";

export const addGroupValidation = [
  body("name").not().isEmpty().withMessage("Group name is required").trim(),
  body("about")
    .not()
    .isEmpty()
    .withMessage("Group information is required")
    .trim(),
  body("selectedIds")
    .not()
    .isEmpty()
    .withMessage("Members Ids are required")
    .isArray()
    .withMessage("Please provide a valid array"),
  body("adminId")
    .not()
    .isEmpty()
    .withMessage("Admin Id is required")
    .isInt()
    .withMessage("Please provide a valid integer")
    .trim(),
];

export const updateGroupValidation = [
  body("groupId")
    .not()
    .isEmpty()
    .withMessage("Group Id is required")
    .isInt()
    .withMessage("Please provide a valid integer")
    .trim(),
  body("name").not().isEmpty().withMessage("Group name is required").trim(),
  body("about")
    .not()
    .isEmpty()
    .withMessage("Group information is required")
    .trim(),
  body("selectedIds")
    .not()
    .isEmpty()
    .withMessage("Members Ids are required")
    .isArray()
    .withMessage("Please provide a valid array"),
  body("adminId")
    .not()
    .isEmpty()
    .withMessage("Admin Id is required")
    .isInt()
    .withMessage("Please provide a valid integer")
    .trim(),
];

export const editAdminValidation = [
  body("groupId")
    .not()
    .isEmpty()
    .withMessage("Group Id is required")
    .isInt()
    .withMessage("Please provide a valid integer")
    .trim(),
  body("userId")
    .not()
    .isEmpty()
    .withMessage("User Id is required")
    .isInt()
    .withMessage("Please provide a valid integer")
    .trim(),
];

export const getGroupsValidation = [
  body("userId")
    .not()
    .isEmpty()
    .withMessage("User Id is required")
    .isInt()
    .withMessage("Please provide a valid integer")
    .trim(),
];

export const addMediaMessageValidation = [
  body("from")
    .not()
    .isEmpty()
    .withMessage("Sender Id is required")
    .isInt()
    .withMessage("Please provide a valid integer")
    .trim(),
  body("to")
    .not()
    .isEmpty()
    .withMessage("Receiver Id is required")
    .isInt()
    .withMessage("Please provide a valid integer")
    .trim(),
];

export const getGroupContactsWithMessagesValidation = [
  body("from")
    .not()
    .isEmpty()
    .withMessage("Sender Id is required")
    .isInt()
    .withMessage("Please provide a valid integer")
    .trim(),
];

export const deleteMessageValidation = [
  body("messageId")
    .not()
    .isEmpty()
    .withMessage("Message Id is required")
    .isInt()
    .withMessage("Please provide a valid integer")
    .trim(),
];

export const addGroupMessagesValidation = [
  body("from")
    .not()
    .isEmpty()
    .withMessage("Sender Id is required")
    .isInt()
    .withMessage("Please provide a valid integer")
    .trim(),
  body("groupId")
    .not()
    .isEmpty()
    .withMessage("Group Id is required")
    .isInt()
    .withMessage("Please provide a valid integer")
    .trim(),
];

export const deleteGroupMessageValidation = [
  body("messageId")
    .not()
    .isEmpty()
    .withMessage("Message Id is required")
    .isInt()
    .withMessage("Please provide a valid integer")
    .trim(),
  // body("from")
  //   .not()
  //   .isEmpty()
  //   .withMessage("Sender Id is required")
  //   .isInt()
  //   .withMessage("Please provide a valid integer")
  //   .trim(),
];

export const getGroupMessagesValidation = [
  body("groupId")
    .not()
    .isEmpty()
    .withMessage("Group Id is required")
    .isInt()
    .withMessage("Please provide a valid integer")
    .trim(),
];
