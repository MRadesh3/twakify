import React, { useState } from "react";
import Avatar from "../common/Avatar";
import { MdCall } from "react-icons/md";
import { IoVideocam } from "react-icons/io5";
import { BiSearchAlt2 } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import ContextMenu from "../common/ContextMenu";

function ChatHeader() {
  const [
    { userInfo, currentChatUser, onlineUsers, currentGroupChat },
    dispatch,
  ] = useStateProvider();
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [contextMenuCordinates, setContextMenuCordinates] = useState({
    x: 0,
    y: 0,
  });

  const showContextMenu = (e) => {
    e.preventDefault();
    const headerHeight = document.querySelector(".h-16")?.offsetHeight || 0; // Adjust for header height

    setContextMenuCordinates({
      x: e.pageX - 85,
      y: e.pageY + 35,
    });
    setIsContextMenuVisible(true);
  };

  const contextMenuOptions = [
    {
      name: "Exit Chat",
      callback: async () => {
        {
          currentChatUser
            ? dispatch({
                type: reducerCases.SET_EXIT_CHAT,
                userId: currentChatUser?.id,
              })
            : dispatch({
                type: reducerCases.EXIT_GROUP_CHAT,
              });
        }
      },
    },
  ];

  const handleVoiceCall = () => {
    dispatch({
      type: reducerCases.SET_VOICE_CALL,
      voiceCall: {
        ...currentChatUser,
        type: "out-going",
        callType: "voice",
        roomId: Date.now(),
      },
    });
  };

  const handleVideoCall = () => {
    dispatch({
      type: reducerCases.SET_VIDEO_CALL,
      videoCall: {
        ...currentChatUser,
        type: "out-going",
        callType: "video",
        roomId: Date.now(),
      },
    });
  };

  const imagePath = currentGroupChat
    ? currentGroupChat.profilePicture === "null"
      ? "/icons/partners.png"
      : currentGroupChat.profilePicture
    : currentChatUser?.profileImage;

  const imageUrl =
    imagePath &&
    (imagePath.startsWith("/avatars") ||
      imagePath.startsWith("/heroavatars") ||
      imagePath.startsWith("/icons") ||
      imagePath.startsWith("https://lh3.googleusercontent.com"))
      ? imagePath
      : currentGroupChat
      ? currentGroupChat?.profilePicture?.startsWith("uploads")
        ? `${process.env.NEXT_PUBLIC_HOST_URL}/${imagePath}`
        : imagePath
      : imagePath;

  const handleProfile = () => {
    console.log(currentChatUser, currentGroupChat);

    {
      currentChatUser
        ? dispatch({
            type: reducerCases.SET_PROFILE_DETAILS,
            payload: {
              ...currentChatUser,
              // profilePicture: imageUrl,
            },
          })
        : dispatch({
            type: reducerCases.SET_GROUP_DETAILS,
            payload: {
              ...currentGroupChat,
              // profilePicture: imageUrl,
            },
          });
      if (currentGroupChat) {
        dispatch({
          type: reducerCases.SET_GROUP_DETAILS_OPEN,
          payload: true,
        });
      } else {
        dispatch({
          type: reducerCases.SET_PROFILE_DETAILS_OPEN,
          payload: true,
        });
      }
    }
  };

  return (
    <div className="h-16 px-4 py-3 flex justify-between items-center bg-panel-header-background z-10">
      <div
        className="flex items-center justify-center gap-6 cursor-pointer"
        onClick={handleProfile}
      >
        <div className="flex items-center relative">
          <Avatar type="sm" image={imageUrl} />
          {currentChatUser && onlineUsers?.includes(currentChatUser?.id) ? (
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#057e39] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00d348]"></span>
            </span>
          ) : null}
        </div>

        <div className="flex flex-col">
          <span className="text-primary-strong">
            {currentGroupChat
              ? currentGroupChat.name
              : currentChatUser?.id === userInfo?.id
              ? `${currentChatUser?.name} ( You )`
              : currentChatUser?.name}
          </span>
          <span className="text-panel-header-icon text-sm">
            {currentGroupChat
              ? currentGroupChat.about
              : onlineUsers?.includes(currentChatUser?.id)
              ? "Online"
              : "Offline"}
          </span>
        </div>
      </div>
      <div className="flex gap-6">
        {currentChatUser && (
          <>
            {" "}
            <MdCall
              className="text-panel-header-icon cursor-pointer text-xl"
              title="Call"
              onClick={handleVoiceCall}
            />
            <IoVideocam
              className="text-panel-header-icon cursor-pointer text-xl"
              title="Video Call"
              onClick={handleVideoCall}
            />
          </>
        )}
        <BiSearchAlt2
          className="text-panel-header-icon cursor-pointer text-xl"
          title="Search"
          onClick={() =>
            dispatch({
              type: reducerCases.SET_MESSAGE_SEARCH,
            })
          }
        />
        <BsThreeDotsVertical
          className="text-panel-header-icon cursor-pointer text-xl"
          title="Menu"
          id="context-opener"
          onClick={(e) => showContextMenu(e)}
        />
        {isContextMenuVisible && (
          <ContextMenu
            options={contextMenuOptions}
            cordinates={contextMenuCordinates}
            contextMenu={isContextMenuVisible}
            setContextMenu={setIsContextMenuVisible}
          />
        )}
      </div>
    </div>
  );
}

export default ChatHeader;
