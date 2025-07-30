import { postFormDataMethod, postMethod } from "../ApiConfig";

export const addGroupApi = async (data) => {
  return postFormDataMethod(`/groupchat/add-group`, data);
};

export const updateGroupApi = async (data) => {
  return postFormDataMethod(`/groupchat/update-group`, data);
};

export const getGroupsApi = async (data) => {
  return postMethod(`/groupchat/get-groups`, data);
};

export const editAdminApi = async (data) => {
  return postMethod(`/groupchat/edit-admin`, data);
};

export const leaveGroupApi = async (data) => {
  return postMethod(`/groupchat/leave-group`, data);
};

export const deleteGroupApi = async (data) => {
  return postMethod(`/groupchat/delete-group`, data);
};

export const addGroupMessageApi = async (data) => {
  return postMethod(`/groupchat/add-group-message`, data);
};

export const getGroupMessagesApi = async (data) => {
  return postMethod(`/groupchat/get-group-messages`, data);
};

export const addGroupMediaMessagesApi = async (data) => {
  return postFormDataMethod(`/groupchat/add-group-media-message`, data);
};

export const addMediaMessageApi = async (data) => {
  return postFormDataMethod(`/messages/add-media-message`, data);
};

export const deleteGroupMessagesApi = async (data) => {
  return postMethod(`/groupchat/delete-group-message`, data);
};

export const getInitialGroupConatctsApi = async (data) => {
  return postMethod(`/groupchat/get-group-initial-contacts`, data);
};
