import { useStateProvider } from "@/context/StateContext";
import { calculateTime } from "@/utils/CalculateTime";
import React, { useEffect, useRef, useState } from "react";
import MessageStatus from "../common/MessageStatus";
import Image from "next/image";
import ImageMessage from "./ImageMessage";
import dynamic from "next/dynamic";
const VoiceMessage = dynamic(() => import("./VoiceMessage"), { ssr: false });
import { decryptMessage } from "@/utils/Crypto";

function ChatContainer() {
  const [{ messages, userInfo, currentChatUser }] = useStateProvider();
  const bottomRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const scrollToBottom = (smooth = true) => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  const newMessages = messages?.filter(
    (message) =>
      (message.senderId === userInfo?.id &&
        message.receiverId === currentChatUser?.id) ||
      (message.senderId === currentChatUser?.id &&
        message.receiverId === userInfo?.id)
  );

  useEffect(() => {
    if (messages?.length > 0) {
      setLoading(false);
    }
  }, [messages]);

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
  }, [messages, loading]);

  return (
    <div className="h-[80vh] w-full relative flex-grow overflow-auto custom-scrollbar">
      <div className="bg-chat-background bg-fixed h-full w-full opacity-5 fixed left-0 top-0 z-0"></div>
      <div className="mx-10 my-6 relative bottom-0 z-40 left-0">
        <div className="flex justify-center items-center mb-2">
          <p className="text-gray-400 text-[11px] rounded-md max-w-fit text-center bg-panel-header-background p-2 ">
            Remember, your messages are end-to-end encrypted for your privacy
          </p>
        </div>
        <div className="flex w-full">
          <div className="flex flex-col justify-end w-full gap-1 overflow-auto">
            {newMessages?.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message?.senderId === currentChatUser?.id
                    ? "justify-start"
                    : "justify-end"
                }`}
              >
                {message?.type === "text" ? (
                  <div
                    className={`text-white px-2 pb-[5px] text-sm rounded-md flex gap-2 items-end max-w-[45%] ${
                      message?.senderId === currentChatUser?.id
                        ? "bg-incoming-background"
                        : "bg-outgoing-background"
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
        </div>
      </div>
    </div>
  );
}

export default ChatContainer;
