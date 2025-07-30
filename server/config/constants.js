"use strict";

let constants = {
  ROLE: {
    SUPERADMIN: 1,
    ADMIN: 2,
    USER: 3,
  },
  STATUS_CODES: {
    SUCCESS: 200,
    CREATED: 201,
    VALIDATION: 422,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    BAD_REQUEST: 400,
    SERVER_ERROR: 500,
    REQUEST_TIMEOUT: 408,
    NOT_FOUND: 404,
  },
  RESPONCE_KEY: {
    STATUS: "status",
    MESSAGE: "message",
    STATUS_CODE: "statusCode",
    DATA: "data",
    TOKEN: "token",
    ERROR: "error",
    COUNT: "count",
  },
  USER_PERMISSIONS: {
    CREATE: "is_create",
    READ: "is_read",
    UPDATE: "is_edit",
    DELETE: "is_delete",
  },
  MESSAGE_STATUS: {
    PENDING: "pending",
    SENT: "sent",
    DELIVERED: "delivered",
    SEEN: "seen",
  },
};

export default Object.freeze(constants);
