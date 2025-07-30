import React, { useState, useEffect } from "react";
import { BsCheck, BsCheckAll, BsThreeDotsVertical } from "react-icons/bs";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { BorderBeam } from "../ui/border-beam";
import { deleteMessagesApi } from "@/apis/Message/messageApis";
import { toaster } from "../ui/toaster";
import { getMessagesApi } from "@/apis/Message/messageApis";
import { deleteGroupMessagesApi } from "@/apis/Groupchat/groupchatApis";

function MessageStatus({ messageStatus, currentChatUser, messageId, message }) {
  const [{ userInfo, socket, currentGroupChat }, dispatch] = useStateProvider();
  const [showDelete, setShowDelete] = useState(false);

  const handleDeleteMessage = async (id) => {
    if (currentGroupChat) {
      const response = await deleteGroupMessagesApi({
        messageId: id,
      });

      console.log("res", response);

      if (response?.data?.status) {
        socket.current.emit("deleteGroupMessage", {
          groupId: currentGroupChat?.id,
          messageId: id,
          senderId: message?.senderId,
          receiverId: message?.receiverId,
          createdAt: message?.createdAt,
        });

        setShowDelete(false);
      }
    } else {
      const response = await deleteMessagesApi({
        messageId: id,
      });
      if (response.data.status) {
        socket.current.emit("delete-msg", {
          id: message.id,
          messageId: message.id,
          message: message.message,
          messageStatus: message.messageStatus,
          type: message.type,
          senderId: message.senderId,
          receiverId: message.receiverId,
          createdAt: message.createdAt,
          deletedAt: new Date(),
        });

        setShowDelete(false);
        // getMessages();
      }
    }
  };

  const getMessages = async () => {
    console.log("Yes");

    const {
      data: { data },
    } = await getMessagesApi({
      from: userInfo?.id,
      to: currentChatUser?.id,
    });

    dispatch({
      type: reducerCases.SET_MESSAGES,
      messages: data,
    });
  };

  return (
    <>
      <div className="flex gap-1">
        {messageStatus === "sent" && <BsCheck className="text-lg min-w-fit" />}
        {messageStatus === "delivered" && (
          <BsCheckAll className="text-lg min-w-fit" />
        )}
        {messageStatus === "read" && (
          <BsCheckAll className="text-lg text-icon-ack min-w-fit" />
        )}
        {currentChatUser &&
          (message.deletedAt === null ? (
            <BsThreeDotsVertical
              className="text-lg min-w-fit cursor-pointer text-gray-300"
              onClick={() => {
                dispatch({
                  type: reducerCases.BIG_IMAGE,
                  bigImage: 20,
                });
                setShowDelete(true);
              }}
            />
          ) : (
            <BsThreeDotsVertical className="text-lg min-w-fit  text-gray-400" />
          ))}

        {currentGroupChat &&
          (message?.deletedAt === null ? (
            <BsThreeDotsVertical
              className="text-lg min-w-fit cursor-pointer text-gray-300"
              onClick={() => {
                dispatch({
                  type: reducerCases.BIG_IMAGE,
                  bigImage: 20,
                });
                setShowDelete(true);
              }}
            />
          ) : (
            <BsThreeDotsVertical className="text-lg min-w-fit  text-gray-400" />
          ))}

        {showDelete && (
          <div className="text-white fixed z-[10000] top-0 right-0 h-[100vh] w-[100vw] flex items-center justify-center bg-black/50 backdrop-blur-lg">
            {/* <div className="relative flex flex-col items-center justify-center shadow-md"> */}
            <div className="relative flex flex-col items-center justify-center bg-panel-header-background p-10 rounded-lg shadow-2xl w-[40%]">
              <h1 className="text-lg text-center">
                {`Are you sure you want to delete this message${
                  currentGroupChat
                    ? ` from the group ${currentGroupChat.name}`
                    : ""
                } ? You will not be able to recover this message.`}
              </h1>
              <div className="my-5 flex gap-5">
                <button
                  type="button"
                  className="text-gray-900 mt-4 bg-gradient-to-r from-[#057e39] via-[#00d348] to-[#5e7509] hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-[#00d348] dark:focus:ring-[#bfeb26] shadow-lg shadow-[#057e39]/50 dark:shadow-lg dark:shadow-[#00d348]/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                  onClick={() => handleDeleteMessage(messageId)}
                >
                  <span className="text-white text-sm flex gap-2 items-center justify-center">
                    {" "}
                    Delete Message
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
                  <span className="text-white text-sm flex gap-2 items-center justify-center">
                    {" "}
                    Cancel
                  </span>
                </button>
              </div>

              <BorderBeam size={250} duration={12} delay={9} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default MessageStatus;
