import { body, check } from "express-validator";

export const checkUserValidation = [
  body("email")
    .not()
    .isEmpty()
    .withMessage("Email address is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .trim(),
];

export const onBoardUserValidation = [
  body("name").not().isEmpty().withMessage("Name is required").trim(),
  body("email")
    .not()
    .isEmpty()
    .withMessage("Email address is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .trim(),
  // body("image")
  //   .not()
  //   .isEmpty()
  //   .withMessage("Profile picture is required")
  //   .trim(),
  body("about").not().isEmpty().withMessage("About is required").trim(),
];

export const generateTokenValidation = [
  body("userId").not().isEmpty().withMessage("User Id is required").trim(),
];
