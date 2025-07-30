import { useStateProvider } from "@/context/StateContext";
import {
  calculateTime,
  formatDate,
  formatTime24Hour,
} from "@/utils/CalculateTime";
import React, { useEffect, useRef, useState } from "react";
import MessageStatus from "../common/MessageStatus";
import Image from "next/image";
import ImageMessage from "./ImageMessage";
import dynamic from "next/dynamic";
const VoiceMessage = dynamic(() => import("./VoiceMessage"), { ssr: false });
import { decryptMessage } from "@/utils/Crypto";
import Avatar from "../common/Avatar";

function GroupChatContainer() {
  const [
    { messages, userInfo, currentChatUser, currentGroupChat, groupMessages },
  ] = useStateProvider();
  const bottomRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const scrollToBottom = (smooth = true) => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  const newGroupMessages = groupMessages?.filter(
    (message) => message.groupId === currentGroupChat?.id
  );

  console.log("newGroupMessages", newGroupMessages);

  useEffect(() => {
    if (newGroupMessages?.length > 0) {
      setLoading(false);
    }
  }, [newGroupMessages]);

  useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(() => {
        scrollToBottom(false);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  useEffect(() => {
    if (!loading) {
      scrollToBottom(true);
    }
  }, [newGroupMessages, loading]);

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

  // const groupMessagesByDate = () => {
  //   const groupedMessages = {};
  //   groupMessages?.forEach((message) => {
  //     const messageDate = formatDate(message?.createdAt);
  //     const typedMessage = { ...message, itemType: "message" };
  //     if (!groupedMessages[messageDate]) {
  //       groupedMessages[messageDate] = [];
  //     }
  //     groupedMessages[messageDate].push(typedMessage);
  //   });

  //   currentGroupChat?.groupMembers?.forEach((member) => {
  //     const memberJoinedDate = formatDate(
  //       member?.removedAt ? member?.removedAt : member?.joinedAt
  //     );

  //     if (!groupedMessages[memberJoinedDate]) {
  //       groupedMessages[memberJoinedDate] = [];
  //     }
  //     const typedMessage = {
  //       ...member,
  //       itemType: "member",
  //     };
  //     groupedMessages[memberJoinedDate].push(typedMessage);
  //   });

  //   return groupedMessages;
  // };
  const groupMessagesByDate = () => {
    const allItems = [];

    // Add all messages with type "message"
    newGroupMessages?.forEach((message) => {
      allItems.push({
        ...message,
        itemType: "message",
        time: new Date(message?.createdAt),
      });
    });

    // Add all member actions with type "member"
    currentGroupChat?.groupMembers?.forEach((member) => {
      const actionTime = member?.removedAt || member?.joinedAt;
      allItems.push({
        ...member,
        itemType: "member",
        time: new Date(actionTime),
      });
    });

    // Sort all items by time ascending
    allItems.sort((a, b) => new Date(a.time) - new Date(b.time));

    // Group by formatted date
    const groupedMessages = {};
    allItems.forEach((item) => {
      const dateKey = formatDate(item.time); // Assuming this gives something like "2025-04-14"
      if (!groupedMessages[dateKey]) {
        groupedMessages[dateKey] = [];
      }
      groupedMessages[dateKey].push(item);
    });

    return groupedMessages;
  };

  const groupedMessages = groupMessagesByDate();

  const sortedGroupedMessages = Object.entries(groupedMessages).sort(
    ([a], [b]) => {
      // Special handling for Today, Yesterday, etc. if needed
      const parseDate = (dateStr) => {
        if (dateStr === "Today") return new Date(); // or use a fixed ref
        return new Date(dateStr);
      };

      return parseDate(a) - parseDate(b);
    }
  );

  return (
    <div className="h-[80vh] w-full relative flex-grow overflow-auto custom-scrollbar">
      <div className="bg-chat-background bg-fixed h-full w-full opacity-5 fixed left-0 top-0 z-0"></div>
      <div className="mx-10 my-6 relative bottom-0 z-40 left-0">
        <div className="flex justify-center items-center">
          <p className="text-gray-400 text-[11px] rounded-md max-w-fit text-center bg-panel-header-background p-2 ">
            Welcome to the group ! Please be respectful and communicate
            thoughtfully with others.
          </p>
        </div>
        <div className="flex justify-center items-center mt-2">
          <p className="text-gray-400 text-[11px] rounded-md max-w-fit text-center bg-panel-header-background p-2 ">
            {`${currentGroupChat?.creater?.name} created this group`}
          </p>
        </div>
        {currentGroupChat?.groupType === "PRIVATE" && (
          <div className="flex justify-center items-center mt-2">
            <p className="text-gray-400 text-[11px] rounded-md max-w-fit text-center bg-panel-header-background p-2 ">
              This is a private group where only admins can post
            </p>
          </div>
        )}

        {/* Chat Messages Grouped by Date */}
        {sortedGroupedMessages?.map(([date, messages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex justify-center items-center my-4">
              <p className="text-gray-400 text-[11px] rounded-md bg-panel-header-background p-2">
                {date}
              </p>
            </div>

            {/* Messages */}
            {messages?.map((message, index) => {
              if (
                message.itemType === "member" &&
                message.userId === currentGroupChat.createdBy
              ) {
                return null;
              }
              if (message.itemType === "member") {
                return (
                  <div
                    className="flex justify-center items-center my-2"
                    key={message.id}
                  >
                    <p className="text-gray-400 text-[11px] rounded-md max-w-fit text-center bg-panel-header-background p-2">
                      {`${message?.adder?.name} ${
                        message.removedAt === null ? "added" : "removed"
                      } ${message.user.name}`}
                    </p>
                  </div>
                );
              } else {
                return (
                  <div
                    key={index}
                    className={`flex gap-2 my-1 ${
                      message?.senderId === userInfo?.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {message?.senderId !== userInfo?.id && (
                      <Avatar
                        type="xsm"
                        image={getImageUrl(message?.sender?.profilePicture)}
                      />
                    )}

                    {/* Message Types */}
                    {message?.type === "text" ? (
                      <div
                        className={`text-white px-2 pb-[5px] text-sm rounded-md flex gap-2 items-end max-w-[45%] ${
                          message?.senderId === userInfo?.id
                            ? "bg-outgoing-background"
                            : "bg-incoming-background"
                        }`}
                      >
                        <span
                          className={`${message.deletedAt && "text-gray-300"}`}
                        >
                          {message.deletedAt
                            ? "This message has been deleted"
                            : decryptMessage(message?.message, message?.iv)}
                        </span>

                        <div className="flex gap-1 items-end min-w-fit">
                          <span className="text-bubble-meta text-[11px] pt-1">
                            {formatTime24Hour(
                              message.deletedAt
                                ? message?.deletedAt
                                : message?.createdAt
                            )}
                          </span>
                          {message?.senderId === userInfo?.id && (
                            <MessageStatus
                              messageStatus={message?.messageStatus}
                              currentChatUser={currentChatUser}
                              messageId={message?.id}
                              message={message}
                            />
                          )}
                        </div>
                      </div>
                    ) : message?.type === "audio" ? (
                      <VoiceMessage message={message} />
                    ) : (
                      <ImageMessage message={message} />
                    )}
                  </div>
                );
              }
            })}
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      {/* <div className="flex w-full">
          <div className="flex flex-col justify-end w-full gap-1 overflow-auto">
            {groupMessages?.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 ${
                  message?.senderId === userInfo?.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {message?.senderId !== userInfo?.id && (
                  <Avatar
                    type="xsm"
                    image={getImageUrl(message?.sender?.profilePicture)}
                  />
                )}
                {message?.type === "text" ? (
                  <div
                    className={`text-white px-2 py-[5px] text-sm rounded-md flex gap-2 items-end max-w-[45%] ${
                      message?.senderId === userInfo?.id
                        ? "bg-outgoing-background"
                        : "bg-incoming-background"
                    }`}
                  >
                    <span
                      className={`break-all ${
                        message.deletedAt !== null && "text-gray-300"
                      }`}
                    >
                      {message.deletedAt === null
                        ? decryptMessage(message?.message, message?.iv)
                        : "This message has been deleted"}
                    </span>
                    <div className="flex gap-1 items-end min-w-fit">
                      <span className="text-bubble-meta text-[11px] pt-1 min-w-fit">
                        {message.deletedAt === null
                          ? calculateTime(message?.createdAt)
                          : calculateTime(message?.deletedAt)}
                      </span>
                      <span>
                        {message?.senderId === userInfo?.id && (
                          <MessageStatus
                            messageStatus={message?.messageStatus}
                            currentChatUser={currentChatUser}
                            messageId={message?.id}
                            message={message}
                          />
                        )}
                      </span>
                    </div>
                  </div>
                ) : message?.type === "audio" ? (
                  <VoiceMessage message={message} />
                ) : (
                  <ImageMessage message={message} />
                )}
              </div>
            ))}
            <div ref={bottomRef}></div>
          </div>
        </div> */}
    </div>
  );
}

export default GroupChatContainer;
