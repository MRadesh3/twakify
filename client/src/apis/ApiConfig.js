import axios from "axios";
import { API_URL, SECRET_KEY } from "@/config/constants";
import { getFirebaseToken } from "../utils/utils";

const postMethod = async (url, data) => {
  const token = await getFirebaseToken();

  const axiosConfig = {
    url: `${API_URL}${url}`,
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-secret-key": SECRET_KEY,
      Authorization: `Bearer ${token}`,
    },
    data,
  };
  return axios(axiosConfig);
};

const getMethod = (url, data) => {
  const axiosConfig = {
    url: `${API_URL}${url}`,
    method: "get",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-secret-key": SECRET_KEY,
    },
    params: data,
  };

  return axios(axiosConfig);
};

const postFormDataMethod = async (url, data) => {
  const token = await getFirebaseToken();

  const axiosConfig = {
    url: `${API_URL}${url}`,
    method: "post",
    headers: {
      "Content-Type": "multipart/form-data",
      Accept: "application/json",
      "x-secret-key": SECRET_KEY,
      Authorization: `Bearer ${token}`,
    },
    data,
  };

  return axios(axiosConfig);
};

// response blob

const getFileResponse = (url) => {
  const axiosConfig = {
    url,
    method: "get",
    responseType: "blob",
  };

  return axios(axiosConfig);
};

export { postMethod, getMethod, postFormDataMethod, getFileResponse };
