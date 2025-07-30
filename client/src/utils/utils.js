import jwtDecode from "jwt-decode";
import axios from "axios";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import { getIdToken } from "firebase/auth";

const isValidToken = (accessToken) => {
  if (!accessToken) {
    return false;
  }
  const decoded = jwtDecode(accessToken);
  const currentTime = Date.now() / 1000;
  return decoded.exp > currentTime;
};

const setSession = (accessToken, type) => {
  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
  } else {
    localStorage.removeItem("accessToken");

    delete axios.defaults.headers.common.Authorization;
  }
};

const getAccessToken = () => localStorage.getItem("accessToken");

const getFirebaseToken = async () => {
  const token = await getIdToken(
    firebaseAuth.currentUser,
    /* forceRefresh */ true
  );

  return token;
};

export { isValidToken, setSession, getAccessToken, getFirebaseToken };
