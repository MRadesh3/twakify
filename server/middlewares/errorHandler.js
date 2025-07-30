import { validationResult } from "express-validator";
import { ReE } from "../services/util.service.js";
import constants from "../config/constants.js";

export const errorHandler = async (req, res, next) => {
  const resMeta = {};
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    resMeta.statusCode = constants.STATUS_CODES.VALIDATION;
    resMeta.error = errors.array();
    return ReE(res, resMeta, constants.STATUS_CODES.VALIDATION);
  }
  next();
};
