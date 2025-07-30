import { firebaseAuth } from "@/utils/FirebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import Image from "next/image";
import React, { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { checkUser } from "@/apis/Auth/authApis";
import { useRouter } from "next/router";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { toaster } from "@/components/ui/toaster";

function login() {
  const router = useRouter();

  const [{ userInfo, newUser }, dispatch] = useStateProvider();

  useEffect(() => {
    if (userInfo?.id && !newUser) {
      router.push("/chat");
    }
  }, [userInfo, newUser, router]);

  // const handleLogin = async () => {
  //   const provider = new GoogleAuthProvider();

  //   try {
  //     const {
  //       user: { displayName: name, email, photoURL: profileImage },
  //     } = await signInWithPopup(firebaseAuth, provider);

  //     if (email) {
  //       console.log("Sending email to API:", email);

  //       const response = await checkUser({ email });
  //       console.log("Response from API:", response);

  //       if (!response?.data?.status) {
  //         dispatch({
  //           type: reducerCases.SET_NEW_USER,
  //           newUser: true,
  //         });
  //         dispatch({
  //           type: reducerCases.SET_USER_INFO,
  //           userInfo: {
  //             name,
  //             email,
  //             profileImage,
  //             status: "",
  //           },
  //         });
  //         router.push("/onboarding");
  //       } else {
  //         const imagePath = response?.data?.data?.profilePicture;

  //         const imageUrl =
  //           imagePath &&
  //           (imagePath.startsWith("/avatars") ||
  //             imagePath.startsWith("/heroavatars") ||
  //             imagePath.startsWith("https://lh3.googleusercontent.com"))
  //             ? imagePath
  //             : `${process.env.NEXT_PUBLIC_HOST_URL}/${imagePath}`;

  //         dispatch({
  //           type: reducerCases.SET_USER_INFO,
  //           userInfo: {
  //             id: response?.data?.data?.id,
  //             name: response?.data?.data?.name,
  //             email: response?.data?.data?.email,
  //             profileImage: imageUrl,
  //             status: response?.data?.data?.about,
  //           },
  //         });
  //         router.push("/chat");
  //         console.log("User already exists:", response.data);
  //       }
  //     }
  //   } catch (err) {
  //     console.error("Error while login:", err);
  //   }
  // };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const {
        user: { displayName: name, email, photoURL: profileImage },
      } = await signInWithPopup(firebaseAuth, provider);

      if (email) {
        console.log("Sending email to API:", email);

        const response = await checkUser({ email });
        console.log("Response from API:", response);

        if (response?.data?.status) {
          const imagePath = response?.data?.data?.profilePicture;

          const imageUrl =
            imagePath &&
            (imagePath.startsWith("/avatars") ||
              imagePath.startsWith("/heroavatars") ||
              imagePath.startsWith("https://lh3.googleusercontent.com"))
              ? imagePath
              : `${process.env.NEXT_PUBLIC_HOST_URL}/${imagePath}`;

          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: {
              id: response?.data?.data?.id,
              name: response?.data?.data?.name,
              email: response?.data?.data?.email,
              profileImage: imageUrl,
              status: response?.data?.data?.about,
              groups: response?.data?.data?.groupMembers,
            },
          });
          router.push("/chat");
          console.log("User already exists:", response.data);
        } else {
          toaster.error({
            title: `${response?.data?.message}`,
            description: "User not registerd, please signup first",
          });
        }
      }
    } catch (err) {
      console.error("Error while login:", err);
    }
  };

  const handleSignup = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const {
        user: { displayName: name, email, photoURL: profileImage },
      } = await signInWithPopup(firebaseAuth, provider);

      if (email) {
        console.log("Sending email to API:", email);

        const response = await checkUser({ email });
        console.log("Response from API:", response);

        if (!response?.data?.status) {
          dispatch({
            type: reducerCases.SET_NEW_USER,
            newUser: true,
          });
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: {
              name,
              email,
              profileImage,
              status: "",
              groups: [],
            },
          });
          router.push("/onboarding");
        }
        // } else {
        //   const imagePath = response?.data?.data?.profilePicture;

        //   const imageUrl =
        //     imagePath &&
        //     (imagePath.startsWith("/avatars") ||
        //       imagePath.startsWith("/heroavatars") ||
        //       imagePath.startsWith("https://lh3.googleusercontent.com"))
        //       ? imagePath
        //       : `${process.env.NEXT_PUBLIC_HOST_URL}/${imagePath}`;

        //   dispatch({
        //     type: reducerCases.SET_USER_INFO,
        //     userInfo: {
        //       id: response?.data?.data?.id,
        //       name: response?.data?.data?.name,
        //       email: response?.data?.data?.email,
        //       profileImage: imageUrl,
        //       status: response?.data?.data?.about,
        //     },
        //   });
        //   router.push("/chat");
        //   console.log("User already exists:", response.data);
        // }
      }
    } catch (err) {
      console.error("Error while signup:", err);
    }
  };

  return (
    <div className="flex justify-center items-center bg-panel-header-background h-screen w-screen flex-col gap-6">
      <div className="flex items-center justify-center gap-2 text-white">
        <Image src="/twakify_logo.png" alt="twakify" width={150} height={150} />
        <div className="brand-name">
          <span className="gradient-green">Tawk</span>ify
        </div>
      </div>
      <button
        className="flex items-center justify-center gap-7 bg-search-input-container-background p-5 rounded-lg"
        onClick={handleLogin}
      >
        <FcGoogle className="text-4xl" />
        <span className="text-white text-2xl">Login with Google</span>
      </button>
      <button
        className="flex items-center justify-center gap-7 bg-search-input-container-background p-5 rounded-lg"
        onClick={handleSignup}
      >
        <FcGoogle className="text-4xl" />
        <span className="text-white text-2xl">Signup with Google</span>
      </button>
    </div>
  );
}

export default login;
