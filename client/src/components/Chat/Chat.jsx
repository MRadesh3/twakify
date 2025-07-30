import React from "react";
import ChatHeader from "./ChatHeader";
import ChatContainer from "./ChatContainer";
import MessageBar from "./MessageBar";
import { useStateProvider } from "@/context/StateContext";
import GroupChatContainer from "./ChatGroupContainer";

function Chat() {
  const [{ currentGroupChat, userInfo }] = useStateProvider();

  return (
    <div className="border-conversation-border border-l w-full bg-conversation-panel-background flex flex-col h-[100vh] z-10">
      <ChatHeader />
      {currentGroupChat ? <GroupChatContainer /> : <ChatContainer />}
      {!currentGroupChat ? (
        <MessageBar />
      ) : currentGroupChat.groupType === "PUBLIC" ? (
        <MessageBar />
      ) : (
        currentGroupChat.groupType === "PRIVATE" &&
        currentGroupChat.groupMembers.some(
          (member) =>
            member?.userId === userInfo?.id && member?.role === "ADMIN"
        ) && <MessageBar />
      )}
    </div>
  );
}

export default Chat;
