import { body, check } from "express-validator";

export const addMessageValidation = [
  body("message").not().isEmpty().withMessage("Message is required").trim(),
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
  body("type").not().isEmpty().withMessage("Message type is required").trim(),
];

export const getMessagesValidation = [
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

export const getInitialContactsWithMessagesValidation = [
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
