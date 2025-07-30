import { useStateProvider } from "@/context/StateContext";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Avatar from "@/components/common/Avatar";
import Input from "@/components/common/Input";
import { useFormik } from "formik";
import * as Yup from "yup";
import { MdDelete, MdEdit } from "react-icons/md";
import { IoIosCloseCircle } from "react-icons/io";
import { reducerCases } from "@/context/constants";
import { BiLogOut } from "react-icons/bi";
import { BorderBeam } from "../ui/border-beam";
import { updateUser, deleteUser } from "@/apis/Auth/authApis";
import { toaster } from "@/components/ui/toaster";
import { BlurFade } from "../ui/blur-fade";
import { BsArrowDownCircle } from "react-icons/bs";
import { IoCloseSharp } from "react-icons/io5";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import { signOut } from "firebase/auth";
import { decryptMessage } from "@/utils/Crypto";
import AlignItemsList from "./UsersList";
import GroupModal from "./GroupModal";
import {
  deleteGroupApi,
  editAdminApi,
  leaveGroupApi,
} from "@/apis/Groupchat/groupchatApis";

function Profile() {
  const [
    { messages, userInfo, userDetails, groupDetails, socket, groupModal },
    dispatch,
  ] = useStateProvider();
  const [image, setImage] = useState({
    file: userInfo?.profileImage,
    preview: null,
  });
  console.log(userInfo?.profileImage);

  const [isEditing, setIsEditing] = useState(false);
  const bottomRef = useRef(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showImage, setShowImage] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showLeaveGroup, setShowLeaveGroup] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [icon, setIcon] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState("");
  const [userId, setUserId] = useState("");

  // const handleDeleteProfile = async () => {
  //   const response = await deleteUser({ userId: userInfo?.id });
  //   socket.current.emit("signout", userInfo?.id);
  //   dispatch({
  //     type: reducerCases.SET_USER_INFO,
  //     userInfo: undefined,
  //   });
  //   dispatch({
  //     type: reducerCases.EXIT_PROFILE_DETAILS,
  //   });
  //   signOut(firebaseAuth);
  //   if (response?.data?.status) {
  //     toaster.success({
  //       title: `${response?.data?.message}`,
  //       description: "User profile has been deleted successfully",
  //     });
  //   }
  //   router.push("/");
  // };

  const handleDeleteProfile = async () => {
    try {
      const response = await deleteUser({ userId: userInfo?.id });
      socket.current.emit("signout", userInfo?.id);
      dispatch({ type: reducerCases.SET_USER_INFO, userInfo: undefined });
      dispatch({ type: reducerCases.EXIT_PROFILE_DETAILS });

      // Prevent auth listener from redirecting to login
      dispatch({ type: reducerCases.SET_IS_USER_DELETING, payload: true });

      await signOut(firebaseAuth); // Wait for sign-out to complete

      if (response?.data?.status) {
        toaster.success({
          title: `${response?.data?.message}`,
          description: "User profile has been deleted successfully",
        });
      }

      router.push("/"); // Redirect to home after deletion
    } catch (error) {
      console.error("Error deleting user:", error);
    }
    // } finally {
    //   // Reset the flag whether success or error
    //   dispatch({ type: reducerCases.SET_IS_USER_DELETING, payload: false });
    // }
  };

  useEffect(() => {
    if (messages?.length > 0) {
      setLoading(false);
    }
  }, [messages]);

  useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  useEffect(() => {
    if (!loading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const formik = useFormik({
    initialValues: {
      userId: userInfo?.id || "",
      email: userInfo?.email || "",
      name: userInfo?.name || "",
      about: userInfo?.status || "",
      image: image.file,
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
      formData.append("userId", Number(values.userId));
      formData.append("image", image.file);
      formData.append("email", values.email);
      formData.append("name", values.name);
      formData.append("about", values.about);

      const response = await updateUser(formData);
      console.log("Response from register API:", response);

      if (!response?.data?.status) {
        toaster.error({
          title: response?.data?.message,
          description: "Failed updating user profie",
        });
      } else {
        const imagePath = response?.data?.data?.profilePicture;

        console.log("imagePath", imagePath);

        const imageUrl =
          imagePath &&
          (imagePath.startsWith("/avatars") ||
            imagePath.startsWith("avatars") ||
            imagePath.startsWith("heroavatars") ||
            imagePath.startsWith("/heroavatars") ||
            imagePath.startsWith("https://lh3.googleusercontent.com"))
            ? imagePath
            : `${process.env.NEXT_PUBLIC_HOST_URL}/${imagePath}`;

        console.log("imageUrl", imageUrl);

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
          },
        });
        setImage({ file: imageUrl, preview: null });
        toaster.success({
          title: `${response?.data?.message}`,
          description: "User profile has been updated successfully",
        });
        setIsEditing(false);
        // router.push("/chat");
      }
    },
  });

  useEffect(() => {
    if (userDetails?.id) {
      setImage({
        file: userDetails.profileImage,
        preview: null,
      });
    }
  }, [userDetails]);

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "zip":
        return "/icons/zip.png";
      case "pdf":
        return "/icons/pdf.png";
      case "excel":
        return "/icons/excel.png";
      default:
        return "/icons/file.png";
    }
  };

  const groupMembers = groupDetails?.groupMembers?.filter(
    (member) => member?.removedAt === null
  );

  console.log("user", userDetails);
  console.log("userInfo", userInfo);

  const imagePath = groupDetails
    ? groupDetails.profilePicture === "null"
      ? "/icons/partners.png"
      : groupDetails.profilePicture
    : userInfo?.id === userDetails?.id
    ? userInfo?.profileImage
    : userDetails?.profileImage;

  console.log("details image", imagePath);

  const imageFinalUrl =
    imagePath &&
    (imagePath.startsWith("/avatars") ||
      imagePath.startsWith("/heroavatars") ||
      imagePath.startsWith("/icons") ||
      imagePath.startsWith("https://lh3.googleusercontent.com"))
      ? imagePath
      : groupDetails
      ? groupDetails?.profilePicture?.startsWith("uploads")
        ? `${process.env.NEXT_PUBLIC_HOST_URL}/${imagePath}`
        : imagePath
      : imagePath;

  console.log("details imageFinalUrl", imageFinalUrl);

  const baseUrl = process.env.NEXT_PUBLIC_HOST_URL;

  const images = messages
    ?.filter(
      (msg) =>
        msg.deletedAt === null && msg.type !== "text" && msg.type !== "audio"
    ) // Ignore text messages
    .map((msg) => {
      if (msg.type === "image") {
        return {
          type: "image",
          fileUrl: `${baseUrl}/${decryptMessage(msg.message, msg.iv).replace(
            /\\/g,
            "/"
          )}`, // Convert Windows-style paths
          fileName: msg.message.split("\\").pop(), // Extract file name
        };
      } else {
        return {
          type: "file",
          fileUrl: `${baseUrl}/${decryptMessage(msg.message, msg.iv)}`, // File URL
          icon: getFileIcon(msg.type), // Get file icon
          fileName: decryptMessage(msg.message, msg.iv).split("\\").pop(), // Extract file name
        };
      }
    });

  const downloadFile = async (url) => {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch the file");
      }

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName || "download"; // Fallback to a generic filename if `fileName` is not available
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update localStorage
      const downloadedFiles =
        JSON.parse(localStorage.getItem("downloadedFiles")) || [];
      if (!downloadedFiles.includes(fileName)) {
        downloadedFiles.push(fileName);
        localStorage.setItem(
          "downloadedFiles",
          JSON.stringify(downloadedFiles)
        );
      }
      setDownloaded(true);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  const handleAdmin = async (userId) => {
    try {
      const response = await editAdminApi({
        groupId: groupDetails?.id,
        userId,
        editorId: userInfo?.id,
        newRole: isAdmin ? "ADMIN" : "MEMBER",
      });

      console.log(response);

      if (response.data.status) {
        toaster.success({
          title: `${response?.data?.message}`,
          description: `${
            isAdmin
              ? "User appointed as admin"
              : "User removed from admin privileges"
          }`,
        });
        socket.current.emit("updateGroup", {
          groupId: response?.data?.data?.id,
          members: response?.data?.data?.groupMembers.map((m) => m.userId), // Send all user IDs
          groupData: response?.data?.data,
        });

        dispatch({
          type: reducerCases.BIG_IMAGE,
          bigImage: 20,
        });
        setShowAdmin(false);
      } else {
        toaster.error({
          title: `${response?.data?.message}`,
          description: "Assign someone else as admin before removing yourself",
        });
      }
    } catch (err) {
      console.log("Error while handling admin", err);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const response = await leaveGroupApi({
        groupId: groupDetails?.id,
        userId: userInfo?.id,
      });

      console.log(response);

      if (response.data.status) {
        toaster.success({
          title: `${response?.data?.message}`,
          description: "User left the group successfully",
        });

        socket.current.emit("updateGroup", {
          groupId: response?.data?.data?.id,
          members: response?.data?.data?.groupMembers.map((m) => m.userId), // Send all user IDs
          groupData: response?.data?.data,
        });

        dispatch({
          type: reducerCases.BIG_IMAGE,
          bigImage: 20,
        });
        setShowLeaveGroup(false);
      } else {
        toaster.error({
          title: `${response?.data?.message}`,
          description: "Assign a new admin before leaving the group",
        });
      }
    } catch (err) {
      console.log("Error while handling admin", err);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      const response = await deleteGroupApi({
        groupId: groupDetails?.id,
        userId: userInfo?.id,
      });

      console.log(response);

      if (response.data.status) {
        toaster.success({
          title: `${response?.data?.message}`,
          description: "Group admin deleted the entire group successfully",
        });

        socket.current.emit("deleteGroup", {
          groupId: groupDetails?.id,
          members: groupDetails?.groupMembers?.map((m) => m.userId), // Send all user IDs
          groupData: groupDetails,
        });

        dispatch({
          type: reducerCases.BIG_IMAGE,
          bigImage: 20,
        });
        setShowLeaveGroup(false);
      } else {
        toaster.error({
          title: `${response?.data?.message}`,
          description: "Assign a new admin before leaving the group",
        });
      }
    } catch (err) {
      console.log("Error while handling admin", err);
    }
  };

  return (
    <>
      <div className="border-conversation-border text-white border-l w-full bg-conversation-panel-background flex flex-col h-[100vh] z-10">
        {/* Header */}
        <div className="h-16 px-4 py-3 flex justify-between items-center bg-panel-header-background z-10">
          <h1 className="text-lg">
            {groupDetails ? "Group Details" : "Profile Details"}
          </h1>
          <div className="flex gap-6">
            {!isEditing &&
              (userInfo?.id === userDetails?.id ||
                groupDetails?.groupMembers?.some(
                  (member) =>
                    member.userId === userInfo?.id && member.role === "ADMIN"
                )) && (
                <MdEdit
                  className="text-panel-header-icon cursor-pointer text-xl"
                  title={groupDetails ? "Edit group" : "Edit Profile"}
                  // onClick={() => setIsEditing(true)}
                  onClick={() => {
                    if (groupDetails) {
                      dispatch({
                        type: reducerCases.BIG_IMAGE,
                        bigImage: 20,
                      });
                      dispatch({
                        type: reducerCases.SET_GROUP_MODAL,
                        groupModal: 40,
                      });
                      dispatch({
                        type: reducerCases.EXIT_PROFILE_DETAILS,
                      });
                      setShowGroupModal(true);
                    } else {
                      setIsEditing(true);
                    }
                  }}
                />
              )}
            {!isEditing && groupDetails && (
              <BiLogOut
                className="text-panel-header-icon cursor-pointer text-xl -scale-100"
                title="Logout"
                onClick={() => {
                  dispatch({
                    type: reducerCases.BIG_IMAGE,
                    bigImage: 20,
                  });
                  dispatch({
                    type: reducerCases.EXIT_PROFILE_DETAILS,
                  });
                  setShowLeaveGroup(true);
                }}
              />
            )}
            {userInfo?.id === userDetails?.id && (
              <>
                <BiLogOut
                  className="text-panel-header-icon cursor-pointer text-xl -scale-100"
                  title="Logout"
                  onClick={() => {
                    dispatch({
                      type: reducerCases.BIG_IMAGE,
                      bigImage: 20,
                    });
                    setShowLogout(true);
                  }}
                />
                <MdDelete
                  className="text-panel-header-icon cursor-pointer text-xl"
                  title="Delete Account"
                  onClick={() => {
                    dispatch({
                      type: reducerCases.BIG_IMAGE,
                      bigImage: 20,
                    });
                    setShowDelete(true);
                  }}
                />
              </>
            )}

            <IoIosCloseCircle
              className="text-panel-header-icon cursor-pointer text-xl"
              title="Close"
              onClick={() => {
                dispatch({
                  type: reducerCases.SET_GROUP_DETAILS_OPEN,
                  payload: false,
                });
                dispatch({
                  type: reducerCases.SET_PROFILE_DETAILS_OPEN,
                  payload: false,
                });
                groupDetails
                  ? dispatch({
                      type: reducerCases.SET_RECENT_GROUP,
                      recentGroup: groupDetails,
                    })
                  : dispatch({
                      type: reducerCases.SET_RECENT_CHAT,
                      recentChat:
                        userInfo?.id === userDetails?.id ? null : userDetails,
                    });
              }}
            />
          </div>
        </div>

        {/* Profile Content */}
        <div className="h-[80vh] w-full relative flex-grow overflow-auto custom-scrollbar">
          <div className="mx-10 my-6 relative bottom-0 z-40 left-0">
            <div className="flex flex-col gap-5 w-full text-white items-center justify-center">
              {!isEditing ? (
                // View Mode
                <div className="flex flex-col gap-10 w-full">
                  <div className="flex items-center justify-center gap-10 mt-10 border-b border-conversation-border pb-4">
                    <Avatar type="xl" image={imageFinalUrl} isView={true} />
                    <div className="flex flex-col gap-4">
                      <h2 className="text-2xl font-bold">
                        {groupDetails?.name ??
                          userDetails?.name ??
                          userInfo?.name}
                      </h2>
                      {userDetails && (
                        <div className="flex gap-5">
                          <label
                            htmlFor="email"
                            className="text-gray-400 text-lg"
                          >
                            Email :{" "}
                          </label>
                          <p className="text-gray-400 text-lg max-w-sm">
                            {userDetails ? userDetails.email : userInfo?.email}
                          </p>
                        </div>
                      )}
                      <div className="flex gap-5">
                        <label
                          htmlFor="status"
                          className="text-gray-400 text-lg"
                        >
                          About :
                        </label>
                        <p className="text-gray-400 text-lg max-w-sm">
                          {groupDetails?.about ??
                            userDetails?.status ??
                            userDetails?.about ??
                            "No status"}
                        </p>
                      </div>
                      {groupDetails && (
                        <>
                          <div className="flex gap-5">
                            <label
                              htmlFor="email"
                              className="text-gray-400 text-lg"
                            >
                              Total Members :{" "}
                            </label>
                            <p className="text-gray-400 text-lg max-w-sm">
                              {groupMembers.length}
                            </p>
                          </div>
                          <div className="flex gap-5">
                            <label
                              htmlFor="email"
                              className="text-gray-400 text-lg"
                            >
                              Group Type :{" "}
                            </label>
                            <p className="text-gray-400 text-lg max-w-sm">
                              {groupDetails?.groupType}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {groupDetails && (
                    <section>
                      <h1 className="text-lg mb-5">Group Members</h1>
                      <AlignItemsList
                        members={groupMembers}
                        setShowAdmin={setShowAdmin}
                        setIsAdmin={setIsAdmin}
                        setUserId={setUserId}
                      />
                    </section>
                  )}
                  {userInfo?.id !== userDetails?.id && (
                    <section id="photos">
                      <h1 className="text-lg mb-10">Media, links and docs</h1>

                      {images && images.length > 0 ? (
                        <div className="columns-2 gap-4 sm:columns-4">
                          {images.map((imageUrl, idx) => (
                            <BlurFade
                              key={imageUrl.fileUrl}
                              delay={0.25 + idx * 0.05}
                              inView
                            >
                              <img
                                className="mb-4 size-full rounded-lg object-contain cursor-pointer"
                                src={
                                  imageUrl?.type !== "image"
                                    ? imageUrl?.icon
                                    : imageUrl?.fileUrl
                                }
                                alt={`Random stock image ${idx + 1}`}
                                onClick={() => {
                                  if (imageUrl?.type === "image") {
                                    dispatch({
                                      type: reducerCases.BIG_IMAGE,
                                      bigImage: 10,
                                    });
                                  }
                                  setShowImage(true);
                                  setImageUrl(imageUrl?.fileUrl);
                                  setFileName(imageUrl?.fileName);
                                  setIcon(imageUrl?.icon ? imageUrl?.icon : "");
                                }}
                              />
                            </BlurFade>
                          ))}
                        </div>
                      ) : (
                        <div>
                          <p>
                            No media, links and docs are shared during the
                            conversation
                          </p>
                        </div>
                      )}
                    </section>
                  )}
                </div>
              ) : (
                // Edit Mode
                <form
                  onSubmit={formik.handleSubmit}
                  className="flex flex-col gap-6 mt-6 w-full max-w-md"
                >
                  <Avatar type="xl" image={image} setImage={setImage} />
                  <div className="flex flex-col gap-4">
                    <Input
                      name="name"
                      formik={formik}
                      label
                      labelName="Display Name"
                    />
                    <Input
                      name="about"
                      formik={formik}
                      label
                      labelName="About"
                      isTextarea
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-600 px-4 py-2 rounded-lg text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-green-600 px-4 py-2 rounded-lg text-white"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {showGroupModal && (
        <GroupModal
          setShowGroupModal={setShowGroupModal}
          groupDetails={groupDetails}
          isEdit
        />
      )}

      {showAdmin && (
        <div className="text-white fixed z-[10000] top-0 right-0 h-[100vh] w-[100vw] flex items-center justify-center bg-black/50 backdrop-blur-lg">
          {/* <div className="relative flex flex-col items-center justify-center shadow-md"> */}
          <div className="relative flex flex-col items-center justify-center bg-panel-header-background p-10 rounded-lg shadow-2xl">
            <h1 className="text-lg">
              {isAdmin
                ? "Are you sure you want to grant this user admin privileges ?"
                : "Are you sure you want to revoke this user's admin privileges ?"}
            </h1>
            <div className="my-5 flex gap-5">
              <button
                type="button"
                className="text-gray-900 mt-4 bg-gradient-to-r from-[#057e39] via-[#00d348] to-[#5e7509] hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-[#00d348] dark:focus:ring-[#bfeb26] shadow-lg shadow-[#057e39]/50 dark:shadow-lg dark:shadow-[#00d348]/80 font-medium rounded-lg text-sm px-4 py-2 text-center me-2 mb-2"
                onClick={() => handleAdmin(userId)}
              >
                <span className="text-white text-[16px] flex gap-2 items-center justify-center">
                  {" "}
                  {isAdmin ? "Make Admin" : "Remove Admin"}
                </span>
              </button>
              <button
                type="button"
                className="text-gray-900 mt-4 bg-gradient-to-r from-[#ce2021] via-[#ea590c] to-[#ff5722] hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-[#ff2122] dark:focus:ring-[#fe7f07] shadow-lg shadow-[#ce2021]/50 dark:shadow-lg dark:shadow-[#ff5722]/80 font-medium rounded-lg text-sm px-4 py-2 text-center me-2 mb-2"
                onClick={(e) => {
                  dispatch({
                    type: reducerCases.BIG_IMAGE,
                    bigImage: 20,
                  });
                  e.stopPropagation();
                  // setImageUrl(null);
                  setShowAdmin(false);
                }}
              >
                <span className="text-white text-[16px] flex gap-2 items-center justify-center">
                  {" "}
                  Cancel
                </span>
              </button>
            </div>

            <BorderBeam size={250} duration={12} delay={9} />
          </div>
        </div>
      )}

      {showLogout && (
        <div className="text-white fixed z-[10000] top-0 right-0 h-[100vh] w-[100vw] flex items-center justify-center bg-black/50 backdrop-blur-lg">
          {/* <div className="relative flex flex-col items-center justify-center shadow-md"> */}
          <div className="relative flex flex-col items-center justify-center bg-panel-header-background p-10 rounded-lg shadow-2xl">
            <h1 className="text-xl">Are you sure you want to log out?</h1>
            <div className="my-5 flex gap-5">
              <button
                type="button"
                className="text-gray-900 mt-4 bg-gradient-to-r from-[#057e39] via-[#00d348] to-[#5e7509] hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-[#00d348] dark:focus:ring-[#bfeb26] shadow-lg shadow-[#057e39]/50 dark:shadow-lg dark:shadow-[#00d348]/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                onClick={() => router.push("/logout")}
              >
                <span className="text-white text-xl flex gap-2 items-center justify-center">
                  {" "}
                  Logout
                </span>
              </button>
              <button
                type="button"
                className="text-gray-900 mt-4 bg-gradient-to-r from-[#ce2021] via-[#ea590c] to-[#ff5722] hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-[#ff2122] dark:focus:ring-[#fe7f07] shadow-lg shadow-[#ce2021]/50 dark:shadow-lg dark:shadow-[#ff5722]/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                onClick={(e) => {
                  dispatch({
                    type: reducerCases.BIG_IMAGE,
                    bigImage: 20,
                  });
                  e.stopPropagation();
                  // setImageUrl(null);
                  setShowLogout(false);
                }}
              >
                <span className="text-white text-xl flex gap-2 items-center justify-center">
                  {" "}
                  Cancel
                </span>
              </button>
            </div>

            <BorderBeam size={250} duration={12} delay={9} />
          </div>
        </div>
      )}

      {showLeaveGroup && (
        <div className="text-white fixed z-[10000] top-0 right-0 h-[100vh] w-[100vw] flex items-center justify-center bg-black/50 backdrop-blur-lg">
          {/* <div className="relative flex flex-col items-center justify-center shadow-md"> */}
          <div className="relative flex flex-col items-center justify-center bg-panel-header-background p-10 rounded-lg shadow-2xl">
            <h1 className="text-xl">
              Are you sure you want to leave the group ?
            </h1>
            <div className="my-5 flex gap-5">
              <button
                type="button"
                className="text-gray-900 mt-4 bg-gradient-to-r from-[#057e39] via-[#00d348] to-[#5e7509] hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-[#00d348] dark:focus:ring-[#bfeb26] shadow-lg shadow-[#057e39]/50 dark:shadow-lg dark:shadow-[#00d348]/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                onClick={handleLeaveGroup}
              >
                <span className="text-white text-lg flex gap-2 items-center justify-center">
                  {" "}
                  Leave Group
                </span>
              </button>
              {groupDetails?.createdBy === userInfo?.id && (
                <button
                  type="button"
                  className="text-gray-900 mt-4 bg-gradient-to-r from-[#ea590c] via-[#eab108] to-[#f48b20] hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-[#ea590c] dark:focus:ring-[#eab108] shadow-lg shadow-[#ea590c]/50 dark:shadow-lg dark:shadow-[#eab108]/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                  onClick={handleDeleteGroup}
                >
                  <span className="text-white text-lg flex gap-2 items-center justify-center">
                    {" "}
                    Delete Entire Group
                  </span>
                </button>
              )}

              <button
                type="button"
                className="text-gray-900 mt-4 bg-gradient-to-r from-[#ce2021] via-[#ea590c] to-[#ff5722] hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-[#ff2122] dark:focus:ring-[#fe7f07] shadow-lg shadow-[#ce2021]/50 dark:shadow-lg dark:shadow-[#ff5722]/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                onClick={(e) => {
                  dispatch({
                    type: reducerCases.BIG_IMAGE,
                    bigImage: 20,
                  });
                  e.stopPropagation();
                  // setImageUrl(null);
                  setShowLeaveGroup(false);
                }}
              >
                <span className="text-white text-lg flex gap-2 items-center justify-center">
                  {" "}
                  Cancel
                </span>
              </button>
            </div>

            <BorderBeam size={250} duration={12} delay={9} />
          </div>
        </div>
      )}

      {showDelete && (
        <div className="text-white fixed z-[10000] top-0 right-0 h-[100vh] w-[100vw] flex items-center justify-center bg-black/50 backdrop-blur-lg">
          {/* <div className="relative flex flex-col items-center justify-center shadow-md"> */}
          <div className="relative flex flex-col items-center justify-center bg-panel-header-background p-10 rounded-lg shadow-2xl">
            <h1 className="text-xl">
              Are you sure you want to delete this account, you will not been
              able to recover this account ?
            </h1>
            <div className="my-5 flex gap-5">
              <button
                type="button"
                className="text-gray-900 mt-4 bg-gradient-to-r from-[#057e39] via-[#00d348] to-[#5e7509] hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-[#00d348] dark:focus:ring-[#bfeb26] shadow-lg shadow-[#057e39]/50 dark:shadow-lg dark:shadow-[#00d348]/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                onClick={handleDeleteProfile}
              >
                <span className="text-white text-xl flex gap-2 items-center justify-center">
                  {" "}
                  Delete Account
                </span>
              </button>
              <button
                type="button"
                className="text-gray-900 mt-4 bg-gradient-to-r from-[#ce2021] via-[#ea590c] to-[#ff5722] hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-[#ff2122] dark:focus:ring-[#fe7f07] shadow-lg shadow-[#ce2021]/50 dark:shadow-lg dark:shadow-[#ff5722]/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                onClick={(e) => {
                  dispatch({
                    type: reducerCases.BIG_IMAGE,
                    bigImage: 20,
                  });
                  e.stopPropagation();
                  // setImageUrl(null);
                  setShowDelete(false);
                }}
              >
                <span className="text-white text-xl flex gap-2 items-center justify-center">
                  {" "}
                  Cancel
                </span>
              </button>
            </div>

            <BorderBeam size={250} duration={12} delay={9} />
          </div>
        </div>
      )}

      {showImage && (
        <div className="fixed z-[10000] text-white top-0 right-0 h-[100vh] w-[100vw] flex items-center justify-center bg-black/50 backdrop-blur-lg">
          <div className="relative flex flex-col items-center justify-center">
            <img
              src={icon ? icon : imageUrl}
              alt="asset"
              className="h-[80vh] w-full bg-cover mt-10"
            />
            <div className="fixed top-0 my-5 flex gap-3">
              <button
                className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadFile(imageUrl, fileName);
                }}
              >
                <BsArrowDownCircle />
              </button>
              <button
                className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                onClick={(e) => {
                  dispatch({
                    type: reducerCases.BIG_IMAGE,
                    bigImage: 20,
                  });
                  e.stopPropagation();
                  setImageUrl(null);
                  setShowImage(false);
                }}
              >
                <IoCloseSharp />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;
