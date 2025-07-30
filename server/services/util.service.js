import { default as to } from "await-to-js";
import pe from "parse-error";

// export const toPromise = async (promise) => {
//   const [err, res] = await to(promise);
//   if (err) return [pe(err)];
//   return [null, res];
// };

export const toPromise = (promise) => {
  return promise.then((res) => [null, res]).catch((err) => [err]);
};

export const ReE = (res, data, code) => {
  // Error Web Response
  let send_data = { status: false };
  if (typeof code !== "undefined") res.statusCode = code;

  if (typeof data === "object") {
    send_data = { ...send_data, ...data }; // Merge the objects
  }
  return res.json(send_data);
};

export const ReS = (res, data, code) => {
  // Success Web Response
  let send_data = { status: true };

  if (typeof data === "object") {
    send_data = { ...send_data, ...data }; // Merge the objects
  }

  if (typeof code !== "undefined") res.statusCode = code;

  return res.json(send_data);
};

export const TE = (err_message, log) => {
  // TE stands for Throw Error
  if (log === true) {
    console.error(err_message);
  }

  throw new Error(err_message);
};
