import admin from "./firebaseAdmin.js";
import constants from "../config/constants.js";
import { ReE, toPromise } from "../services/util.service.js";
import getPrismaInstance from "../utils/PrismaClient.js";

const checkUser = async (req, res, next) => {
  const providedSecretKey = req.headers["x-secret-key"];
  const authHeader = req.headers.authorization;
  const prisma = getPrismaInstance();

  if (providedSecretKey !== process.env.APP_SECRET_KEY) {
    return ReE(
      res,
      {
        [constants.RESPONCE_KEY.STATUS_CODE]:
          constants.STATUS_CODES.UNAUTHORIZED,
        [constants.RESPONCE_KEY.MESSAGE]: "Unauthorized user",
      },
      constants.STATUS_CODES.UNAUTHORIZED
    );
  }

  // Step 2: Check Bearer Token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return ReE(
      res,
      {
        [constants.RESPONCE_KEY.STATUS_CODE]:
          constants.STATUS_CODES.UNAUTHORIZED,
        [constants.RESPONCE_KEY.MESSAGE]: "Unauthorized user",
      },
      constants.STATUS_CODES.UNAUTHORIZED
    );
  }

  const idToken = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.firebaseUser = decodedToken;

    const [err, user] = await toPromise(
      prisma.user.findUnique({
        where: {
          email: decodedToken.email,
        },
      })
    );

    if (err || !user) {
      return ReE(
        res,
        {
          [constants.RESPONCE_KEY.STATUS_CODE]:
            constants.STATUS_CODES.UNAUTHORIZED,
          [constants.RESPONCE_KEY.MESSAGE]: "User not found",
        },
        constants.STATUS_CODES.UNAUTHORIZED
      );
    }

    req.user = user; // Attach user to request
    next(); // ✅ Auth success, move on
  } catch (error) {
    return ReE(
      res,
      {
        [constants.RESPONCE_KEY.STATUS_CODE]:
          constants.STATUS_CODES.UNAUTHORIZED,
        [constants.RESPONCE_KEY.MESSAGE]: "Unauthorized user",
        // [constants.RESPONCE_KEY.ERROR]: error.message,
      },
      constants.STATUS_CODES.UNAUTHORIZED
    );
  }
};

export default checkUser;
