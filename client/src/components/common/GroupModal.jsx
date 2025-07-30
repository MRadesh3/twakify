import { getInitialConatctsApi } from "@/apis/Message/messageApis";
import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import React, { useEffect, useState } from "react";
import { BorderBeam } from "../ui/border-beam";
import { IoIosCloseCircle } from "react-icons/io";
import Avatar from "@/components/common/Avatar";
import Input from "@/components/common/Input";
import { useFormik } from "formik";
import * as Yup from "yup";
import MultipleSelectChip from "./MultiSelect";
import { getAllContacts } from "@/apis/Auth/authApis";
import { addGroupApi, updateGroupApi } from "@/apis/Groupchat/groupchatApis";
import { toaster } from "../ui/toaster";
import BasicSelect from "./Select";

function GroupModal({ setShowGroupModal, groupDetails, isEdit }) {
  const [{ userInfo, groupModal, socket }, dispatch] = useStateProvider();
  const [allContacts, setAllContacts] = useState([]);

  const fetchAllContacts = async () => {
    try {
      const response = await getAllContacts({});
      if (response?.data?.status) {
        setAllContacts(response?.data?.data);
      }
    } catch (error) {
      console.log("Error fetching contacts", error);
    }
  };

  const normalizedContacts = Object.values(allContacts).flat();

  useEffect(() => {
    fetchAllContacts();
  }, []);

  const imagePath = groupDetails
    ? groupDetails?.profilePicture === "null"
      ? "/icons/partners.png"
      : groupDetails?.profilePicture
    : null;

  console.log(imagePath);

  const imageFinalUrl =
    imagePath &&
    (imagePath.startsWith("/avatars") ||
      imagePath.startsWith("/heroavatars") ||
      imagePath.startsWith("/icons") ||
      imagePath.startsWith("https://lh3.googleusercontent.com"))
      ? imagePath
      : `${process.env.NEXT_PUBLIC_HOST_URL}/${imagePath}`;

  console.log("edit", groupDetails, imageFinalUrl);

  const [image, setImage] = useState({
    file: groupDetails ? imageFinalUrl : null,
    preview: null,
  });

  useEffect(() => {
    formik.setFieldValue("image", image.file);
  }, [image]);

  const formik = useFormik({
    initialValues: {
      groupId: groupDetails?.id || "",
      name: groupDetails?.name || "",
      about: groupDetails?.about || "",
      groupType: groupDetails?.groupType || "",
      selectedContacts: groupDetails?.groupMembers
        ? groupDetails?.groupMembers
            ?.filter((m) => m.removedAt === null)
            .map((member) => member.userId)
        : [],
      image: image || "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required("Group Name is required")
        .min(3, "Name must be at least 3 characters"),
      about: Yup.string()
        .required("About is required")
        .max(150, "About cannot exceed 150 characters"),
      groupType: Yup.string().required("Group type is required"),
      selectedContacts: Yup.array()
        .min(2, "Select at least two contacts")
        .max(10, "You can add upto 10 contacts only")
        .required("At least two contacts are required"),
    }),
    onSubmit: async (values) => {
      if (isEdit) {
        console.log("Form Submitted with:", values);

        const formdata = new FormData();
        formdata.append("groupId", values.groupId);
        formdata.append("image", image.file);
        formdata.append("name", values.name);
        formdata.append("about", values.about);
        formdata.append("groupType", values.groupType);
        const flatSelectedContacts = [].concat(...values.selectedContacts);
        flatSelectedContacts.forEach((id) =>
          formdata.append("selectedIds[]", id)
        );
        formdata.append("adminId", userInfo.id);

        const response = await updateGroupApi(formdata);

        if (response.data.status) {
          toaster.success({
            title: `${response?.data?.message}`,
            description: "Group updated successfully",
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
          dispatch({
            type: reducerCases.SET_GROUP_MODAL,
            groupModal: 0,
          });
          // e.stopPropagation();
          setShowGroupModal(false);
        } else {
          toaster.error({
            title: `${response?.data?.message}`,
            description: "Please choose another name for the group",
          });
        }
      } else {
        console.log("Form Submitted with:", values);

        const formdata = new FormData();
        formdata.append("image", image.file);
        formdata.append("name", values.name);
        formdata.append("about", values.about);
        formdata.append("groupType", values.groupType);
        const flatSelectedContacts = [].concat(...values.selectedContacts);
        flatSelectedContacts.forEach((id) =>
          formdata.append("selectedIds[]", id)
        );
        formdata.append("adminId", userInfo.id);

        const response = await addGroupApi(formdata);

        if (response.data.status) {
          toaster.success({
            title: `${response?.data?.message}`,
            description: "New group created successfully with the users",
          });

          socket.current.emit("joinGroup", {
            groupId: response?.data?.data?.id,
            members: response?.data?.data?.groupMembers.map((m) => m.userId), // Send all user IDs
            groupData: response?.data?.data,
          });

          // response?.data?.data?.groupMembers?.forEach((member) => {
          //   socket.current.emit("joinGroup", {
          //     groupId: member.groupId,
          //     userId: member.userId,
          //   });
          // });

          socket.current.emit("createGroup", { data: response?.data?.data });

          dispatch({
            type: reducerCases.BIG_IMAGE,
            bigImage: 20,
          });
          dispatch({
            type: reducerCases.SET_GROUP_MODAL,
            groupModal: 0,
          });
          // e.stopPropagation();
          setShowGroupModal(false);
        } else {
          toaster.error({
            title: `${response?.data?.message}`,
            description: "Please choose another name for the group",
          });
        }
      }
    },
  });

  return (
    <div
      className={`bg-search-input-container-background flex-auto overflow-auto max-h-full custom-scrollbar ${
        groupModal !== 0 ? `z-${groupModal}` : ""
      }`}
    >
      <div className="text-white fixed z-[10000] inset-0 top-0 right-0 h-[100vh] w-[100vw] flex items-center justify-center bg-black/50 backdrop-blur-lg">
        <div className="relative flex flex-col bg-panel-header-background px-8 py-4 rounded-lg shadow-2xl w-[80%] h-[95%] overflow-auto custom-scrollbar">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl">Create Group</h1>
              <p className="text-gray-400 text-sm mt-1">
                Please fill up the details to create a group
              </p>
            </div>
            <IoIosCloseCircle
              className="text-panel-header-icon cursor-pointer text-xl"
              title="Close Box"
              onClick={(e) => {
                dispatch({
                  type: reducerCases.BIG_IMAGE,
                  bigImage: 20,
                });
                dispatch({
                  type: reducerCases.SET_GROUP_MODAL,
                  groupModal: 0,
                });
                e.stopPropagation();
                setShowGroupModal(false);
              }}
            />
          </div>
          <div className="my-5">
            <form
              onSubmit={formik.handleSubmit}
              className="grid grid-cols-5 gap-6 mt-6 w-full"
            >
              {/* Avatar - Takes 2 columns */}
              <div className="col-span-2 flex justify-center">
                <Avatar type="xl" image={image} setImage={setImage} />
              </div>

              {/* Form Inputs & Buttons - Takes 3 columns */}
              <div className="col-span-3 flex flex-col gap-4">
                <Input
                  name="name"
                  formik={formik}
                  label
                  labelName="Group Name"
                  className="w-full"
                />
                <Input
                  name="about"
                  formik={formik}
                  label
                  labelName="About Group "
                  className="w-full"
                />
                <BasicSelect
                  name="groupType"
                  formik={formik}
                  label
                  labelName="Select Group Type"
                  fieldName="groupType"
                />

                <MultipleSelectChip
                  name="selectedContacts"
                  label
                  labelName="Select Contacts"
                  contacts={normalizedContacts}
                  formik={formik}
                  fieldName="selectedContacts"
                />

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    className="bg-gray-600 px-4 py-2 rounded-lg text-white"
                    onClick={(e) => {
                      dispatch({
                        type: reducerCases.BIG_IMAGE,
                        bigImage: 20,
                      });
                      dispatch({
                        type: reducerCases.SET_GROUP_MODAL,
                        groupModal: 0,
                      });
                      e.stopPropagation();
                      setShowGroupModal(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 px-4 py-2 rounded-lg text-white"
                  >
                    {isEdit ? "Edit Group" : "Create Group"}
                  </button>
                </div>
              </div>
            </form>
          </div>
          {/* <BorderBeam size={250} duration={12} delay={9} /> */}
        </div>
      </div>
    </div>
  );
}

export default GroupModal;
