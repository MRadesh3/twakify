import Avatar from "@/components/common/Avatar";
import Input from "@/components/common/Input";
import { useStateProvider } from "@/context/StateContext";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { onBoardUser } from "@/apis/Auth/authApis";
import { toaster } from "@/components/ui/toaster";
import { useRouter } from "next/router";
import { reducerCases } from "@/context/constants";

function Onboarding() {
  const router = useRouter();
  const [{ userInfo, newUser }, dispatch] = useStateProvider();
  const [image, setImage] = useState({
    file: userInfo?.profileImage,
    preview: null,
  });

  console.log("image", image);

  useEffect(() => {
    if (!newUser && !userInfo?.email) {
      router.push("/login");
    } else if (!newUser && userInfo?.email) {
      router.push("/chat");
    }
  }, [newUser, userInfo, router]);

  const formik = useFormik({
    initialValues: {
      email: userInfo?.email || "",
      name: userInfo?.name || "",
      about: "",
      image: image || "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required("Display Name is required")
        .min(3, "Name must be at least 3 characters"),
      about: Yup.string()
        .required("About is required")
        .max(150, "About cannot exceed 150 characters"),
    }),
    onSubmit: async (values) => {
      console.log("Form Submitted", values);
      const formData = new FormData();
      formData.append("image", image.file);
      formData.append("email", values.email);
      formData.append("name", values.name);
      formData.append("about", values.about);

      const response = await onBoardUser(formData);
      console.log("Response from register API:", response);

      if (!response?.data?.status) {
        toaster.error({
          title: response?.data?.message,
          description: "User with this email already exists",
        });
      } else {
        const imagePath = response?.data?.data?.profilePicture;

        const imageUrl =
          imagePath &&
          (imagePath.startsWith("/avatars") ||
            imagePath.startsWith("/heroavatars") ||
            imagePath.startsWith("https://lh3.googleusercontent.com"))
            ? imagePath
            : `${process.env.NEXT_PUBLIC_HOST_URL}/${imagePath}`;

        dispatch({
          type: reducerCases.SET_NEW_USER,
          newUser: false,
        });
        dispatch({
          type: reducerCases.SET_USER_INFO,
          userInfo: {
            id: response?.data?.data?.id,
            name: response?.data?.data?.name,
            email: response?.data?.data?.email,
            profileImage: imageUrl,
            status: response?.data?.data?.about,
            groups: [],
          },
        });
        toaster.success({
          title: `${response?.data?.message}`,
          description: "Your profile has been created successfully",
        });
        router.push("/chat");
      }
    },
  });

  useEffect(() => {
    if (image) {
      formik.setFieldValue("image", image.file);
    }
  }, [image]);

  return (
    <div className="bg-panel-header-background h-screen w-screen text-white flex flex-col items-center justify-center">
      <div className="flex items-center justify-center gap-2 text-white">
        <Image src="/twakify_logo.png" alt="twakify" width={150} height={150} />
        <div className="brand-name">
          <span className="gradient-green">Tawk</span>ify
        </div>
      </div>
      <h2 className="text-2xl">Create Your Profile</h2>
      <form
        onSubmit={formik.handleSubmit}
        className="flex gap-6 mt-6 w-full max-w-md"
      >
        <div className="flex flex-col items-center justify-center mt-5 gap-6 w-full">
          <Input name="name" formik={formik} label labelName="Display Name" />
          <Input name="about" formik={formik} label labelName="About" />
          <button
            type="submit"
            className="flex items-center justify-center gap-7 bg-search-input-container-background p-5 rounded-lg"
          >
            Create Profile
          </button>
        </div>
        <div>
          <Avatar type="xl" image={image} setImage={setImage} />
        </div>
      </form>
    </div>
  );
}

export default Onboarding;
