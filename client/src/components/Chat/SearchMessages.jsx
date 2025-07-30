import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import { calculateTime } from "@/utils/CalculateTime";
import React, { useEffect, useState } from "react";
import { BiSearchAlt2 } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import { decryptMessage } from "@/utils/Crypto";
import Avatar from "../common/Avatar";

function SearchMessages() {
  const [
    {
      currentChatUser,
      currentGroupChat,
      messages,
      messagesSearch,
      groupMessages,
      userInfo,
    },
    dispatch,
  ] = useStateProvider();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedMessages, setSearchedMessages] = useState([]);

  useEffect(() => {
    const lowerSearchTerm = searchTerm?.toLowerCase();

    if (currentChatUser) {
      if (searchTerm) {
        setSearchedMessages(
          messages.filter((message) => {
            if (message?.type !== "text") return false;
            const decrypted = decryptMessage(message?.message, message?.iv);
            return decrypted?.toLowerCase().includes(lowerSearchTerm);
          })
        );
      } else {
        setSearchedMessages([]);
      }
    } else {
      if (searchTerm) {
        setSearchedMessages(
          groupMessages.filter((message) => {
            if (message?.type !== "text") return false;
            const decrypted = decryptMessage(message?.message, message?.iv);
            return decrypted?.toLowerCase().includes(lowerSearchTerm);
          })
        );
      } else {
        setSearchedMessages([]);
      }
    }
  }, [searchTerm]);

  console.log("searchedMessages", searchedMessages);
  console.log("user", currentChatUser);
  console.log("group", currentGroupChat);
  console.log("userInfo", userInfo);

  const getImageUrl = (imagePath) => {
    if (
      imagePath &&
      (imagePath.startsWith("/avatars") ||
        imagePath.startsWith("/heroavatars") ||
        imagePath.startsWith("https://lh3.googleusercontent.com"))
    ) {
      return imagePath;
    }

    return `${process.env.NEXT_PUBLIC_HOST_URL}/${imagePath}`;
  };

  return (
    <div className="border-conversation-border border-1 w-full bg-conversation-panel-background flex flex-col z-10 max-h-screen">
      <div className="h-16 px-4 py-5 flex gap-10 items-center bg-panel-header-background text-primary-strong">
        <IoClose
          className="cursor-pointer text-icon-lighter text-2xl"
          onClick={() =>
            dispatch({
              type: reducerCases.SET_MESSAGE_SEARCH,
            })
          }
        />
        <span>Search Messages</span>
      </div>
      <div className="overflow-auto custom-scrollbar h-full">
        <div className="flex items-center flex-col w-full">
          <div className="flex px-5 items-center gap-3 h-14 w-full">
            <div className="bg-panel-header-background flex items-center gap-5 px-3 py-1 rounded-lg flex-grow">
              <div>
                <BiSearchAlt2 className="text-panel-header-icon cursor-pointer text-lg" />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Search messages"
                  className="bg-transparent text-sm focus:outline-none text-white w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          <span className="mt-10 text-icon-lighter">
            {!searchTerm.length &&
              `Search for messages with ${
                currentGroupChat?.name || currentChatUser?.name
              } `}
          </span>
        </div>
        <div className="flex justify-center h-full flex-col">
          {searchTerm.length > 0 && !searchedMessages.length && (
            <span className="text-icon-lighter w-full flex justify-center">
              No messages found
            </span>
          )}
          <div className="flex flex-col w-full h-full">
            {searchedMessages.map((message) => (
              <div
                className={`flex cursor-pointer flex-col justify-center hover:bg-background-default-hover w-full px-5 border-b-[0.1px] py-5 border-conversation-border
                
              `}
              >
                <div
                  className={`flex ${
                    currentChatUser
                      ? message?.senderId === currentChatUser?.id
                        ? "justify-start"
                        : "justify-end"
                      : message?.senderId === userInfo?.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {/* <div>
                  <Avatar
                    type="xsm"
                    image={getImageUrl(message?.sender?.profilePicture)}
                  />
                </div> */}
                  <div className="max-w-[50%]">
                    <div className="text-sm text-teal-light">
                      {currentChatUser
                        ? message.senderId !== currentChatUser?.id
                          ? `You`
                          : `Sender`
                        : message.senderId === userInfo?.id
                        ? `You`
                        : message?.sender.name}
                    </div>
                    <div className="text-sm text-icon-lighter">
                      {calculateTime(message?.createdAt)}
                    </div>
                    <div className="text-icon-green">
                      {decryptMessage(message?.message, message?.iv)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchMessages;
