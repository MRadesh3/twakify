import { postFormDataMethod, postMethod } from "../ApiConfig";

export const addMessageApi = async (data) => {
  return postMethod(`/messages/add-message`, data);
};

export const getMessagesApi = async (data) => {
  return postMethod(`/messages/get-messages`, data);
};

export const deleteMessagesApi = async (data) => {
  return postMethod(`/messages/delete-message`, data);
};

export const addMediaMessageApi = async (data) => {
  return postFormDataMethod(`/messages/add-media-message`, data);
};

export const getInitialConatctsApi = async (data) => {
  return postMethod(`/messages/get-initial-contacts`, data);
};
