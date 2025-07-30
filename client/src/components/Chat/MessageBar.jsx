import { addMediaMessageApi, addMessageApi } from "@/apis/Message/messageApis";
import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import EmojiPicker from "emoji-picker-react";
import React, { useEffect, useRef, useState } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { FaMicrophone } from "react-icons/fa";
import { ImAttachment } from "react-icons/im";
import { MdSend } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import PhotoPicker from "../common/PhotoPicker";
import dynamic from "next/dynamic";
import {
  addGroupMessageApi,
  addGroupMediaMessagesApi,
} from "@/apis/Groupchat/groupchatApis";
const CaptureAudio = dynamic(() => import("../common/CaptureAudio"), {
  ssr: false,
});
import { openAIChat } from "@/apis/OpenAI/openAIApis";

function MessageBar() {
  const [{ userInfo, currentChatUser, socket, currentGroupChat }, dispatch] =
    useStateProvider();
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const [grabPhoto, setGrabPhoto] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);

  const currentChatUserRef = useRef(currentChatUser);
  useEffect(() => {
    currentChatUserRef.current = currentChatUser;
  }, [currentChatUser]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (event.target.id !== "emoji-open") {
        if (
          emojiPickerRef.current &&
          !emojiPickerRef.current.contains(event.target)
        ) {
          setShowEmojiPicker(false);
        }
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const handleEmojiModal = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (emoji) => {
    setMessage((prevMessage) => (prevMessage += emoji.emoji));
  };

  const sendMessage = async () => {
    try {
      if (file) {
        if (currentGroupChat) {
          console.log("hello file", file);

          const formData = new FormData();
          formData.append("media", file);
          formData.append("from", userInfo?.id);
          formData.append("groupId", currentGroupChat?.id);

          const response = await addGroupMediaMessagesApi(formData);

          console.log("group media", response?.data);

          if (response?.data?.status) {
            socket.current.emit("sendGroupMessage", {
              id: response?.data?.data?.id,
              createdAt: response?.data?.data?.createdAt,
              deletedAt: response?.data?.data?.deletedAt,
              messageId: response?.data?.data?.id,
              groupId: currentGroupChat?.id,
              groupMessageReadStatus:
                response?.data?.data?.groupMessageReadStatus,
              senderId: userInfo?.id,
              sender: response?.data?.data?.sender,
              message: response?.data?.data?.message,
              type: response?.data?.data?.type,
              iv: response?.data?.data?.iv,
            });
            // dispatch({
            //   type: reducerCases.ADD_GROUP_MESSAGE,
            //   newGroupMessage: {
            //     ...response?.data?.data,
            //     group: currentGroupChat,
            //   },
            //   loggedInUserId: userInfo?.id,
            //   fromSelf: true,
            // });

            // socket.current.on("message-status-updated", (data) => {
            //   dispatch({
            //     type: reducerCases.UPDATE_MESSAGE_STATUS,
            //     payload: {
            //       messageId: data?.messageId,
            //       status: data.status,
            //       socket,
            //     },
            //   });
            // });
          }
        } else {
          console.log("log from else");

          const formData = new FormData();
          formData.append("media", file);
          formData.append("from", userInfo?.id);
          formData.append("to", currentChatUser?.id);

          const response = await addMediaMessageApi(formData);
          if (response?.data?.status) {
            socket.current.emit("send-msg", {
              messageId: response?.data?.data?.id,
              to: currentChatUser?.id,
              from: userInfo?.id,
              message: response?.data?.data?.message,
              iv: response?.data?.data?.iv,
              type: response?.data?.data?.type,
              createdAt: response?.data?.data?.createdAt,
              deletedAt: response?.data?.data?.deletedAt,
              messageStatus: response?.data?.data?.messageStatus,
            });
            dispatch({
              type: reducerCases.ADD_MESSAGE,
              newMessage: { ...response?.data?.data },
              currentChatUserId: currentChatUserRef?.current?.id,
              loggedInUserId: userInfo?.id,
              fromSelf: true,
            });

            // socket.current.on("message-status-updated", (data) => {
            //   dispatch({
            //     type: reducerCases.UPDATE_MESSAGE_STATUS,
            //     payload: {
            //       messageId: data?.messageId,
            //       status: data.status,
            //       socket,
            //     },
            //   });
            // });
          }
        }
      } else if (message) {
        if (currentGroupChat) {
          let messageAnswer = "";
          if (message.startsWith("@gpt")) {
            const res = await fetch("/api/openai_chat", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ message }),
            });

            const data = await res.json();
            messageAnswer = data?.message;
          }
          console.log("messageAnswer", messageAnswer);
          const response = await addGroupMessageApi({
            groupId: currentGroupChat?.id,
            from: userInfo?.id,
            message,
            messageAnswer: messageAnswer,
            type: "text",
          });

          console.log("Group Message Response", response);

          if (response?.data.status) {
            socket.current.emit("sendGroupMessage", {
              id: response?.data?.data?.id,
              createdAt: response?.data?.data?.createdAt,
              deletedAt: response?.data?.data?.deletedAt,
              messageId: response?.data?.data?.id,
              groupId: currentGroupChat?.id,
              groupMessageReadStatus:
                response?.data?.data?.groupMessageReadStatus,
              senderId: userInfo?.id,
              sender: response?.data?.data?.sender,
              message: response?.data?.data?.message,
              messageAnswer: response?.data?.data?.messageAnswer,
              iv: response?.data?.data?.iv,
              type: "text",
            });
            // dispatch({
            //   type: reducerCases.ADD_GROUP_MESSAGE,
            //   newGroupMessage: {
            //     ...response?.data?.data,
            //     group: currentGroupChat,
            //   },
            //   loggedInUserId: userInfo?.id,
            //   fromSelf: true,
            // });

            // socket.current.on("group-message-status-updated", (data) => {
            //   dispatch({
            //     type: reducerCases.UPDATE_GROUP_MESSAGE_STATUS,
            //     payload: {
            //       messageId: data?.messageId,
            //       status: data.status,
            //       socket,
            //       groupId: data?.groupId,
            //     },
            setMessage("");
          }
        } else {
          const response = await addMessageApi({
            to: currentChatUser?.id,
            from: userInfo?.id,
            message,
            type: "text",
          });
          if (response?.data?.status) {
            socket.current.emit("send-msg", {
              messageId: response?.data?.data?.id,
              to: currentChatUser?.id,
              from: userInfo?.id,
              message: response?.data?.data?.message,
              iv: response?.data?.data?.iv,
              type: response?.data?.data?.type,
              createdAt: response?.data?.data?.createdAt,
              deletedAt: response?.data?.data?.deletedAt,
              messageStatus: response?.data?.data?.messageStatus,
            });
            dispatch({
              type: reducerCases.ADD_MESSAGE,
              newMessage: { ...response?.data?.data },
              currentChatUserId: currentChatUserRef?.current?.id,
              loggedInUserId: userInfo?.id,
              fromSelf: true,
            });

            // socket.current.on("message-status-updated", (data) => {
            //   dispatch({
            //     type: reducerCases.UPDATE_MESSAGE_STATUS,
            //     payload: {
            //       messageId: data?.messageId,
            //       status: data.status,
            //       socket,
            //     },
            //   });
            // });
            setMessage("");
          }
        }
      }
      setFile(null);
    } catch (err) {
      console.log("Error sending message", err);
    }
  };

  const photoPickerChange = async (e) => {
    try {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      if (selectedFile) {
        const fileURL = URL.createObjectURL(selectedFile);
        setFilePreview(fileURL);
      }
    } catch (err) {
      console.log("Error handling file", err);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  useEffect(() => {
    if (grabPhoto) {
      const data = document.getElementById("photo-picker");
      data.click();
      document.body.onfocus = (e) => {
        setTimeout(() => {
          setGrabPhoto(false);
        }, 1000);
      };
    }
  }, [grabPhoto]);

  return (
    <div className="bg-panel-header-background h-20 px-4 flex items-center gap-6 relative">
      {!showAudioRecorder && (
        <>
          <div className="flex gap-6">
            <BsEmojiSmile
              className="text-panel-header-icon cursor-pointer text-xl"
              title="Emoji"
              id="emoji-open"
              onClick={handleEmojiModal}
            />
            {showEmojiPicker && (
              <div
                className="absolute bottom-24 left-16 z-40"
                ref={emojiPickerRef}
              >
                <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
              </div>
            )}
            <ImAttachment
              className="text-panel-header-icon cursor-pointer text-xl"
              title="Attach File"
              onClick={() => setGrabPhoto(true)}
            />
          </div>
          <div className="w-full rounded-lg h-10 flex items-center ">
            {file ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-6">
                  <span className="text-white text-sm">{file.name}</span>

                  {filePreview && file?.type?.startsWith("image/") ? (
                    <img
                      src={filePreview}
                      alt="image preview"
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : file?.type?.startsWith("application/pdf") ? (
                    <img
                      src="/icons/pdf.png"
                      alt="pdf"
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : file?.type?.startsWith(
                      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    ) ? (
                    <img
                      src="/icons/excel.png"
                      alt="excel"
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : file?.type?.startsWith("application/x-zip-compressed") ? (
                    <img
                      src="/icons/zip.png"
                      alt="zip"
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <img
                      src="/icons/file.png"
                      alt="file"
                      className="w-10 h-10 rounded object-cover"
                    />
                  )}

                  <IoClose
                    className="text-white cursor-pointer"
                    title="Remove File"
                    onClick={handleRemoveFile}
                  />
                </div>
                <div lassName="flex w-10 items-center justify-center">
                  <MdSend
                    className="text-panel-header-icon cursor-pointer text-xl"
                    title="Send Message"
                    onClick={sendMessage}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="w-full rounded-lg h-10 flex items-center ">
                  <input
                    type="text"
                    placeholder="Type a message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-input-background text-sm focus:outline-none text-white h-10 rounded-lg px-5 py-4 w-full"
                  />
                </div>
                <div className="flex w-10 items-center justify-center">
                  <button>
                    {message?.length ? (
                      <MdSend
                        className="text-panel-header-icon cursor-pointer text-xl"
                        title="Send Message"
                        onClick={sendMessage}
                      />
                    ) : (
                      <FaMicrophone
                        className="text-panel-header-icon cursor-pointer text-xl"
                        title="Record Audio"
                        onClick={() => setShowAudioRecorder(true)}
                      />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
      {grabPhoto && <PhotoPicker onChange={photoPickerChange} />}
      {showAudioRecorder && <CaptureAudio hide={setShowAudioRecorder} />}
    </div>
  );
}

export default MessageBar;
