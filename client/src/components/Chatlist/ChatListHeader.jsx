import React, { useState } from "react";
import Avatar from "../common/Avatar";
import { useStateProvider } from "@/context/StateContext";
import { BsFillChatLeftTextFill } from "react-icons/bs";
import { reducerCases } from "@/context/constants";

function ChatListHeader() {
  const [{ userInfo }, dispatch] = useStateProvider();

  const handleProfile = () => {
    dispatch({
      type: reducerCases.SET_PROFILE_DETAILS,
      payload: userInfo,
    });
    dispatch({
      type: reducerCases.SET_PROFILE_DETAILS_OPEN,
      payload: true,
    });
  };

  const handleAllContactsPage = () => {
    dispatch({
      type: reducerCases.SET_ALL_CONTACTS_PAGE,
    });
  };

  return (
    <>
      <div className="h-16 px-4 py-3 flex justify-between items-center z-[1000]">
        <div className="cursor-pointer" onClick={handleProfile}>
          <Avatar type="sm" image={userInfo?.profileImage} />
        </div>
        <div className="flex gap-6">
          <BsFillChatLeftTextFill
            className="text-panel-header-icon cursor-pointer text-xl"
            title="New Chat"
            onClick={handleAllContactsPage}
          />
        </div>
      </div>
    </>
  );
}

export default ChatListHeader;
