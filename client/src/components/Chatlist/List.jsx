import { getInitialConatctsApi } from "@/apis/Message/messageApis";
import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import React, { useEffect, useState } from "react";
import ChatLIstItem from "./ChatLIstItem";
import { IoMdAdd } from "react-icons/io";
import GroupModal from "../common/GroupModal";
import {
  getGroupsApi,
  getInitialGroupConatctsApi,
} from "@/apis/Groupchat/groupchatApis";
import GroupChatLIstItem from "./GroupChatListItem";
import { getGroupMessagesApi } from "@/apis/Groupchat/groupchatApis";

function List() {
  const [
    {
      userInfo,
      userContacts,
      contactSearch,
      filteredContacts,
      filteredGroups,
      groupChats,
      socket,
      currentChatUser,
      currentGroupChat,
    },
    dispatch,
  ] = useStateProvider();
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [userGroups, setUserGroups] = useState([]);

  const contacts = contactSearch ? filteredContacts : userContacts;
  const groups = contactSearch ? filteredGroups : groupChats;

  useEffect(() => {
    const getContacts = async () => {
      try {
        const response = await getInitialConatctsApi({ from: userInfo.id });
        const contacts = response?.data?.data?.users || [];
        console.log("Contacts", contacts);

        dispatch({
          type: reducerCases.SET_USER_CONTACTS,
          userContacts: contacts,
        });
        dispatch({
          type: reducerCases.SET_ONLINE_USERS,
          onlineUsers: response?.data?.data?.onlineUsers,
        });
      } catch (err) {
        console.error("Error fetching contacts:", err);
      }
    };

    const updateContactMessages = async (data) => {
      try {
        // wait for contacts to load
        await getContacts();

        // Now register the socket event listener
        socket.current.on("message-status-updated", async (data) => {
          console.log("message-status-updated", data);
          await getContacts();

          dispatch({
            type: reducerCases.UPDATE_MESSAGE_STATUSES,
            payload: {
              messageId: data.messageId,
              status: data.status,
              iv: data.iv,
            },
          });
        });
      } catch (error) {
        console.error("Failed to fetch contacts before socket setup:", error);
      }
    };

    const updateUnreadCount = (data) => {
      if (data.senderId !== currentChatUser?.id) {
        dispatch({
          type: reducerCases.UPDATE_UNREAD_COUNT,
          payload: {
            ...data,
            currentChatUser,
          },
        });
      }
    };

    if (socket) {
      socket.current.on("msg-recieve", updateContactMessages);
      socket.current.on("update-unread-count", updateUnreadCount);
      socket.current.on("msg-sent", updateContactMessages);
    }

    return () => {
      if (socket) {
        socket.current.off("msg-recieve", updateContactMessages);
        socket.current.off("update-unread-count", updateUnreadCount);
        socket.current.off("msg-sent", updateContactMessages);
      }
    };
  }, [socket, dispatch, currentChatUser, userContacts]);

  // Group chats

  useEffect(() => {
    const fetchGroupsOfUser = async () => {
      try {
        const groupsResponse = await getGroupsApi({ userId: userInfo.id });
        const groups = groupsResponse?.data?.data || [];

        const groupsConatctsResponse = await getInitialGroupConatctsApi({});

        const groupsContacts = groupsConatctsResponse?.data?.data?.groups || [];

        const groupsContactMap = new Map(
          groupsContacts.map((group) => [group.groupId, group])
        );

        // const userGroups = groups
        //   .filter((group) => groupsContactMap.has(group.id))
        //   .map((group) => {
        //     const matchedGroup = groupsContactMap.get(group.id);
        //     return {
        //       ...group,
        //       latestMessage: matchedGroup.latestMessage,
        //       totalUnreadMessages: matchedGroup.totalUnreadMessages,
        //     };
        //   });

        const userGroups = groupsContacts
          .map((matchedGroup) => {
            const fullGroup = groups.find(
              (group) => group.id === matchedGroup.groupId
            );
            return {
              ...fullGroup,
              latestMessage: matchedGroup.latestMessage,
              totalUnreadMessages: matchedGroup.totalUnreadMessages,
            };
          })
          .filter((group) => group); // remove any nulls if group was not found

        dispatch({
          type: reducerCases.SET_GROUP_CHATS,
          groupChats: userGroups,
        });
      } catch (err) {
        console.error("Error fetching contacts:", err);
      }
    };

    const updateGroupsContactsMessage = async (data) => {
      try {
        // const userGroups = await fetchGroupsOfUser();

        socket.current.on(
          "groupsContact-message-updated",
          async (groupData) => {
            await fetchGroupsOfUser();
            dispatch({
              type: reducerCases.UPDATE_GROUPS_CHATS,
              payload: groupData,
            });
          }
        );

        // setTimeout(() => {}, 1000);

        socket.current.on("groupMessageDeleted", async (groupData) => {
          await fetchGroupsOfUser();

          const {
            data: { data },
          } = await getGroupMessagesApi({
            groupId: groupData?.groupId,
          });

          dispatch({
            type: reducerCases.SET_GROUP_MESSAGES,
            groupMessages: data,
          });
          dispatch({
            type: reducerCases.UPDATE_GROUP_CHAT,
            payload: groupData,
          });
        });
      } catch (error) {
        console.error("Error fetching groups before socket setup:", error);
      }
      // dispatch({
      //   type: reducerCases.UPDATE_CONTACT_MESSAGE,
      //   payload: {
      //     ...data,
      //     currentChatUser,
      //   },
      // });
    };

    // const updateUnreadCount = (data) => {
    //   if (data.senderId !== currentChatUser?.id) {
    //     dispatch({
    //       type: reducerCases.UPDATE_UNREAD_COUNT,
    //       payload: {
    //         ...data,
    //         currentChatUser,
    //       },
    //     });
    //   }
    // };

    if (socket) {
      socket.current.on("receiveGroupMessage", updateGroupsContactsMessage);
      // socket.current.on("groupMessageSent", updateGroupsContactsMessage);
      // socket.current.on("msg-sent", updateContactMessages);
    }

    return () => {
      if (socket) {
        socket.current.off("receiveGroupMessage", updateGroupsContactsMessage);
        // socket.current.off("groupMessageSent", updateGroupsContactsMessage);
        // socket.current.off("msg-sent", updateContactMessages);
      }
    };
  }, [socket, dispatch, currentGroupChat, groupChats]);

  useEffect(() => {
    if (socket && userInfo?.id) {
      const getContacts = async () => {
        try {
          const response = await getInitialConatctsApi({ from: userInfo.id });
          const contacts = response?.data?.data?.users || [];
          dispatch({
            type: reducerCases.SET_USER_CONTACTS,
            userContacts: contacts,
          });
          dispatch({
            type: reducerCases.SET_ONLINE_USERS,
            onlineUsers: response?.data?.data?.onlineUsers,
          });
        } catch (err) {
          console.error("Error fetching contacts:", err);
        }
      };

      const fetchGroupsOfUser = async () => {
        try {
          const groupsResponse = await getGroupsApi({ userId: userInfo.id });
          const groups = groupsResponse?.data?.data || [];

          const groupsConatctsResponse = await getInitialGroupConatctsApi({});

          const groupsContacts =
            groupsConatctsResponse?.data?.data?.groups || [];

          const groupsContactMap = new Map(
            groupsContacts.map((group) => [group.groupId, group])
          );

          // const userGroups = groups
          //   .filter((group) => groupsContactMap.has(group.id))
          //   .map((group) => {
          //     const matchedGroup = groupsContactMap.get(group.id);
          //     return {
          //       ...group,
          //       latestMessage: matchedGroup.latestMessage,
          //       totalUnreadMessages: matchedGroup.totalUnreadMessages,
          //     };
          //   });

          const userGroups = groupsContacts
            .map((matchedGroup) => {
              const fullGroup = groups.find(
                (group) => group.id === matchedGroup.groupId
              );
              return {
                ...fullGroup,
                latestMessage: matchedGroup.latestMessage,
                totalUnreadMessages: matchedGroup.totalUnreadMessages,
              };
            })
            .filter((group) => group); // remove any nulls if group was not found

          dispatch({
            type: reducerCases.SET_GROUP_CHATS,
            groupChats: userGroups,
          });
        } catch (err) {
          console.error("Error fetching contacts:", err);
        }
      };

      getContacts();
      fetchGroupsOfUser();
    }
  }, [userInfo, socket]);

  return (
    <div className="bg-search-input-container-background flex-auto overflow-auto max-h-full custom-scrollbar">
      <div className="pl-5 text-gray-500 py-2">
        <p>Direct Messages</p>
      </div>
      {contacts && contacts.length > 0 ? (
        contacts.map((contact) => (
          <ChatLIstItem data={contact} key={contact?.id} />
        ))
      ) : (
        <div className="text-center text-gray-500 py-4">
          {contactSearch?.length > 0
            ? `No user found for search '${contactSearch}'`
            : "No chats found"}
        </div>
      )}

      <div className="pl-5 text-gray-500 py-4 flex justify-between items-center px-4">
        <p>Groups</p>
        <IoMdAdd
          className="text-panel-header-icon cursor-pointer text-xl"
          title="New Chat"
          onClick={() => {
            dispatch({
              type: reducerCases.BIG_IMAGE,
              bigImage: 50,
            });
            dispatch({
              type: reducerCases.EXIT_PROFILE_DETAILS,
            });
            setShowGroupModal(true);
          }}
        />
        {showGroupModal && <GroupModal setShowGroupModal={setShowGroupModal} />}
      </div>

      {groups && groups.length > 0 ? (
        groups.map((contact) => (
          <GroupChatLIstItem data={contact} key={contact?.id} />
        ))
      ) : (
        <div className="text-center text-gray-500 py-4">
          {contactSearch?.length > 0
            ? `No group found for search '${contactSearch}'`
            : "No group chats found"}
        </div>
      )}
    </div>
  );
}

export default List;
