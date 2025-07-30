import { postFormDataMethod, postMethod } from "../ApiConfig";

export const checkUser = async (data) => {
  return postMethod(`/auth/check-user`, data);
};

export const onBoardUser = async (data) => {
  return postFormDataMethod(`/auth/onboard-user`, data);
};

export const updateUser = async (data) => {
  return postFormDataMethod(`/auth/update-user`, data);
};

export const deleteUser = async (data) => {
  return postMethod(`/auth/delete-user`, data);
};

export const getAllContacts = async (data) => {
  return postMethod(`/auth/get-all-contacts`, data);
};

export const getCallTokenApi = async (data) => {
  return postMethod(`/auth/generate-token`, data);
};
