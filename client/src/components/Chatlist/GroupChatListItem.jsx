import React from "react";
import Avatar from "../common/Avatar";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { calculateTime } from "@/utils/CalculateTime";
import MessageStatus from "../common/MessageStatus";
import { FaCamera, FaMicrophone } from "react-icons/fa";
import { decryptMessage } from "@/utils/Crypto";

function GroupChatLIstItem({ data, isContactPage = false }) {
  const [
    { userInfo, currentChatUser, onlineUsers, socket, messagesSearch },
    dispatch,
  ] = useStateProvider();

  const imagePath =
    data?.profilePicture === "null"
      ? "/icons/partners.png"
      : data.profilePicture;

  const imageUrl =
    imagePath &&
    (imagePath.startsWith("/avatars") ||
      imagePath.startsWith("/heroavatars") ||
      imagePath.startsWith("/icons") ||
      imagePath.startsWith("https://lh3.googleusercontent.com"))
      ? imagePath
      : `${process.env.NEXT_PUBLIC_HOST_URL}/${imagePath}`;

  const handleContactClick = () => {
    dispatch({
      type: reducerCases.SET_CURRENT_GROUP_CHAT,
      groupchat: data,
    });

    if (messagesSearch === true) {
      dispatch({
        type: reducerCases.SET_MESSAGE_SEARCH,
      });
    }

    dispatch({
      type: reducerCases.UPDATE_GROUPS_CONTACT_UNREAD_COUNT,
      groupData: data,
    });
    // if (!isContactPage) {
    //   // dispatch({
    //   //   type: reducerCases.MARK_MESSAGES_AS_READ,
    //   //   payload: { senderId: userInfo?.id },
    //   // });

    //   socket.current.emit("make-as-read", {
    //     from: userInfo?.id,
    //     to: data?.id,
    //     message: data?.message,
    //     iv: data?.iv,
    //   });

    //   dispatch({
    //     type: reducerCases.CHANGE_CURRENT_CHAT_USER,
    //     user: {
    //       name: data?.name,
    //       about: data?.about,
    //       profileImage: imageUrl,
    //       email: data?.email,
    //       id:
    //         userInfo?.id === data?.senderId ? data?.receiverId : data?.senderId,
    //     },
    //   });
    // } else {
    //   dispatch({
    //     type: reducerCases.CHANGE_CURRENT_CHAT_USER,
    //     user: {
    //       ...data,
    //       profileImage: imageUrl,
    //     },
    //   });
    //   dispatch({
    //     type: reducerCases.SET_ALL_CONTACTS_PAGE,
    //   });
    // }
    // }
  };

  return (
    <div
      className={`flex cursor-pointer items-center hover:bg-background-default-hover `}
      onClick={handleContactClick}
    >
      <div className="min-w-fit px-5 pt-3 pb-1">
        <div className="flex items-center relative">
          <Avatar type="lg" image={imageUrl} />
          {onlineUsers?.includes(data?.id) ? (
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#057e39] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00d348]"></span>
            </span>
          ) : null}
        </div>
      </div>
      <div className="min-h-full flex flex-col justify-center mt-3 pr-2 w-full">
        <div className="flex justify-between">
          <div>
            <span className="text-white">
              {data?.id === userInfo?.id ? `${data?.name} ( You )` : data?.name}
            </span>
          </div>
          {!isContactPage && (
            <div>
              <span
                className={`${
                  !data?.totalUnreadMessages > 0
                    ? "text-icon-lighter"
                    : "text-icon-green"
                } text-sm`}
              >
                {data?.latestMessage?.deletedAt === null
                  ? calculateTime(data?.latestMessage?.createdAt)
                  : calculateTime(data?.latestMessage?.deletedAt)}
              </span>
            </div>
          )}
        </div>
        <div className="flex border-b border-conversation-border pb-2 pt-1 pr-2">
          <div className="flex justify-between w-full ">
            <span className="text-panel-header-icon line-clamp-1 text-sm">
              {data?.latestMessage === null ? (
                data?.about || "\u00A0"
              ) : (
                <div className="flex items-center gap-1 max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[200px] xl:max-w-[300px]">
                  {/* {data?.senderId === userInfo?.id && (
                    <MessageStatus messageStatus={data?.messageStatus} />
                  )} */}
                  {data?.latestMessage?.type === "text" && (
                    <span className="truncate">
                      {data?.latestMessage?.deletedAt === null
                        ? decryptMessage(
                            data?.latestMessage?.message,
                            data.latestMessage?.iv
                          )
                        : "This message has been deleted"}
                    </span>
                  )}
                  {data?.latestMessage?.type === "audio" && (
                    <span className="flex gap-1 items-center">
                      {data.latestMessage?.deletedAt === null ? (
                        <>
                          {" "}
                          <FaMicrophone className="text-panel-header-icon" />
                          Audio{" "}
                        </>
                      ) : (
                        "This message has been deleted"
                      )}
                    </span>
                  )}
                  {data?.latestMessage?.type !== "text" &&
                    data?.latestMessage?.type !== "audio" && (
                      <span className="flex gap-1 items-center">
                        {data.latestMessage?.deletedAt === null ? (
                          <>
                            <FaCamera className="text-panel-header-icon" />
                            Image
                          </>
                        ) : (
                          "This message has been deleted"
                        )}
                      </span>
                    )}
                </div>
              )}
            </span>
            {currentChatUser?.id !== data?.id &&
              data?.totalUnreadMessages > 0 && (
                <span className="bg-icon-green px-[5px] rounded-full text-sm">
                  {data?.totalUnreadMessages}
                </span>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupChatLIstItem;
