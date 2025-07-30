import { reducerCases } from "./constants";

export const initialState = {
  userInfo: undefined,
  newUser: false,
  userDetails: undefined,
  groupDetails: undefined,
  contactsPage: false,
  currentChatUser: undefined,
  currentGroupChat: undefined,
  isUserDeleting: false,
  messages: [],
  groupMessages: [],
  socket: undefined,
  bigImage: 20,
  groupModal: 0,
  userDetailsOpen: false,
  groupDetailsOpen: false,
  messagesSearch: false,
  userContacts: [],
  groupChats: [],
  onlineUsers: [],
  contactSearch: "",
  filteredConatacts: [],
  filteredGroups: [],
  activeChatUserIds: [],
  videoCall: undefined,
  voiceCall: undefined,
  incomingVoiceCall: undefined,
  incomingVideoCall: undefined,
};

const reducer = (state, action) => {
  switch (action.type) {
    case reducerCases.SET_USER_INFO:
      return {
        ...state,
        userInfo: action.userInfo,
      };
    case reducerCases.SET_NEW_USER: {
      return {
        ...state,
        newUser: action.newUser,
      };
    }
    case reducerCases.SET_ALL_CONTACTS_PAGE: {
      return {
        ...state,
        contactsPage: !state.contactsPage,
      };
    }
    case reducerCases.CHANGE_CURRENT_CHAT_USER: {
      return {
        ...state,
        currentChatUser: action.user,
        currentGroupChat: undefined,
        activeChatUserIds: [
          ...new Set([...state.activeChatUserIds, action.user.id]),
        ],
        userDetails: undefined,
        groupDetails: undefined,
      };
    }
    case reducerCases.SET_CURRENT_GROUP_CHAT: {
      return {
        ...state,
        currentGroupChat: action.groupchat,
        currentChatUser: undefined,
        userDetails: undefined,
        groupDetails: undefined,
      };
    }
    case reducerCases.SET_MESSAGES: {
      return {
        ...state,
        messages: action.messages,
      };
    }
    case reducerCases.SET_SOCKET: {
      return {
        ...state,
        socket: action.socket,
      };
    }
    case reducerCases.ADD_MESSAGE: {
      return {
        ...state,
        messages: [...state.messages, action.newMessage],
      };
    }
    case reducerCases.ADD_RECEIVER_MESSAGE: {
      if (
        state.currentChatUser &&
        state.currentChatUser.id === action.newMessage.senderId
      ) {
        state.socket.current.emit("update-message-status", {
          messageId: action.newMessage.messageId,
          status: "read",
          senderId: action.newMessage.senderId,
          receiverId: action.newMessage.receiverId,
          iv: action.newMessage.iv,
        });

        return {
          ...state,
          messages: [...state.messages, action.newMessage],
        };
      } else {
        return {
          ...state,
          messages: [...state.messages, action.newMessage],
        };
      }
    }
    case reducerCases.UPDATE_MESSAGE_STATUSES: {
      const { messageId, status, iv } = action.payload;

      const updatedContacts = state.userContacts.map((contact) => {
        if (contact.messageId === action.payload.messageId) {
          return {
            ...contact,
            messageStatus: "read",
          };
        }

        return contact;
      });

      return {
        ...state,
        messages: state.messages.map((message) =>
          message.id === messageId
            ? { ...message, messageStatus: status }
            : message
        ),
        userContacts: updatedContacts,
      };
    }
    case reducerCases.UPDATE_MESSAGES: {
      console.log("new delete", action.payload);

      const updatedmessages = state.messages.filter((message) => message);

      return {
        ...state,
        messages: updatedmessages,
      };
    }
    case reducerCases.SET_READ_MESSAGES: {
      const updatedContacts = state.userContacts.map((contact) => {
        console.log("contact", action.payload);

        if (contact.id === action.payload.senderId) {
          return {
            ...contact,
            senderId: action.payload.receiverId,
            receiverId: action.payload.senderId,
            messageStatus: "read",
            totalUnreadMessages: 0,
          };
        }
        return contact;
      });

      console.log("updated conatcts", updatedContacts);

      const updatedMessages = state.messages.map((message) => {
        console.log(state.onlineUsers);

        if (message.messageStatus !== "read") {
          return {
            ...message,
            messageStatus: "read",
          };
        }
        return message;
      });

      console.log(state.onlineUsers.includes(action.payload.receiverId));

      // const updatedMessages = state.messages.map((message) => {
      //   // Only update messages sent by the sender (not all messages)
      //   // if (message.messageStatus !== "read") {
      //   //   return {
      //   //     ...message,
      //   //     messageStatus: state.onlineUsers.includes(action.payload.receiverId)
      //   //       ? "sent"
      //   //       : "read",
      //   //   };
      //   // }
      //   return message;
      // });

      return {
        ...state,
        messages: updatedMessages,
        userContacts: updatedContacts,
      };
    }
    case reducerCases.MARK_MESSAGE_AS_READ: {
      // console.log("new function", action.payload.currentChatUserRef.current.id);

      const updatedMessages = state.messages.map((message) => {
        if (message.senderId === action.payload.currentChatUserRef.current.id) {
          return {
            ...message,
            messageStatus: "read",
          };
        }
        return message;
      });

      const updatedContacts = state.userContacts.map((contact) => {
        if (contact.id === action.payload.senderId) {
          return {
            ...contact,
            totalUnreadMessages: 0,
            messageStatus: "read",
          };
        }
        return contact;
      });

      // console.log("updated messages", updatedMessages);

      return {
        ...state,
        messages: updatedMessages,
        userContacts: updatedContacts,
      };
    }
    case reducerCases.MARK_MESSAGES_AS_READ: {
      const updatedContacts = state.userContacts.map((contact) => {
        if (contact.id === action.payload.senderId) {
          return {
            ...contact,
            senderId: action.payload.senderId,
            messageStatus: "read",
            totalUnreadMessages: 0,
          };
        }
        return contact;
      });

      const updatedMessages = state.messages.map((message) => {
        if (message.senderId === action.payload.senderId) {
          return {
            ...message,
            messageStatus: "read",
          };
        }
        return message;
      });

      return {
        ...state,
        userContacts: updatedContacts,
        messages: updatedMessages,
      };
    }
    case reducerCases.BIG_IMAGE: {
      return {
        ...state,
        bigImage: action.bigImage,
      };
    }
    case reducerCases.SET_GROUP_MODAL: {
      console.log(action.groupModal);

      return {
        ...state,
        groupModal: action.groupModal,
      };
    }
    case reducerCases.SET_MESSAGE_SEARCH: {
      return {
        ...state,
        messagesSearch: !state.messagesSearch,
      };
    }
    case reducerCases.UPDATE_CONTACT_MESSAGE: {
      console.log("new logic", action.payload);

      const updatedContacts = state.userContacts.map((contact) => {
        if (
          contact.id === action.payload.senderId ||
          contact.id === action.payload.receiverId
        ) {
          const isChatOpen =
            action.payload.currentChatUser?.id === action.payload.senderId ||
            action.payload.currentChatUser?.id === action.payload.receiverId;

          console.log(isChatOpen);

          return {
            ...contact,
            senderId: action.payload.senderId,
            receiverId: action.payload.receiverId,
            message: action.payload.message,
            iv: action.payload.iv,
            messageStatus: action.payload.messageStatus,
            type: action.payload.type,
            createdAt: action.payload.createdAt,
            deletedAt: action.payload.deletedAt,
            totalUnreadMessages: isChatOpen
              ? "" // No unread messages when chat is open
              : contact.totalUnreadMessages, // Increment unread count if chat is closed
          };
        }
        return contact;
      });

      updatedContacts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      console.log("after", updatedContacts);

      return {
        ...state,
        userContacts: updatedContacts,
      };
    }
    case reducerCases.UPDATE_UNREAD_COUNT: {
      const updatedContacts = state.userContacts.map((contact) => {
        if (
          contact.id === action.payload.senderId &&
          action.payload.messageStatus !== "read"
        ) {
          const isChatOpen =
            action.payload.currentChatUser?.id === action.payload.senderId;

          return {
            ...contact,
            totalUnreadMessages: isChatOpen
              ? "" // No unread messages when chat is open
              : (contact.totalUnreadMessages || 0) + 1, // Increment unread count if chat is closed
          };
        }

        return contact;
      });

      updatedContacts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      return {
        ...state,
        userContacts: updatedContacts,
      };
    }
    case reducerCases.SET_USER_CONTACTS: {
      return {
        ...state,
        userContacts: action.userContacts,
      };
    }
    case reducerCases.SET_ONLINE_USERS: {
      return {
        ...state,
        onlineUsers: action.onlineUsers,
      };
    }
    case reducerCases.SET_CONTACT_SEARCH: {
      const filteredContacts = state.userContacts.filter((contact) =>
        contact.name.toLowerCase().includes(action.contactSearch.toLowerCase())
      );

      const filteredGroups = state.groupChats.filter((group) =>
        group.name.toLowerCase().includes(action.contactSearch.toLowerCase())
      );
      return {
        ...state,
        contactSearch: action.contactSearch,
        filteredContacts,
        filteredGroups,
      };
    }
    case reducerCases.SET_VIDEO_CALL: {
      return {
        ...state,
        videoCall: action.videoCall,
      };
    }
    case reducerCases.SET_VOICE_CALL: {
      return {
        ...state,
        voiceCall: action.voiceCall,
      };
    }
    case reducerCases.SET_INCOMING_VOICE_CALL: {
      return {
        ...state,
        incomingVoiceCall: action.incomingVoiceCall,
      };
    }
    case reducerCases.SET_INCOMING_VIDEO_CALL: {
      return {
        ...state,
        incomingVideoCall: action.incomingVideoCall,
      };
    }
    case reducerCases.END_CALL: {
      return {
        ...state,
        voiceCall: undefined,
        videoCall: undefined,
        incomingVideoCall: undefined,
        incomingVoiceCall: undefined,
      };
    }
    case reducerCases.SET_EXIT_CHAT: {
      console.log(
        "Before exit:",
        state.activeChatUserIds,
        "Exiting:",
        action.userId
      );

      const updatedActiveChatUserIds = state.activeChatUserIds.filter(
        (id) => id.toString() !== action.userId.toString()
      );

      console.log("After exit:", updatedActiveChatUserIds);

      return {
        ...state,
        activeChatUserIds: updatedActiveChatUserIds,
        currentChatUser: undefined,
        userDetails: undefined,
      };
    }
    case reducerCases.SET_PROFILE_DETAILS: {
      return {
        ...state,
        userDetails: action.payload,
        groupDetails: undefined,
        currentChatUser: undefined,
        currentGroupChat: undefined,
      };
    }
    case reducerCases.SET_GROUP_DETAILS: {
      return {
        ...state,
        groupDetails: action.payload,
        userDetails: undefined,
        currentChatUser: undefined,
        currentGroupChat: undefined,
      };
    }
    case reducerCases.SET_PROFILE_DETAILS_OPEN: {
      return {
        ...state,
        userDetailsOpen: action.payload,
      };
    }
    case reducerCases.SET_GROUP_DETAILS_OPEN: {
      return {
        ...state,
        groupDetailsOpen: action.payload,
      };
    }
    case reducerCases.UPDATE_GROUP_DETAILS: {
      const { newGroup } = action;
      const isUserStillInGroup = newGroup.groupMembers.some(
        (member) =>
          member.userId === state.userInfo.id && member.removedAt === null
      );
      return {
        ...state,
        groupDetails: isUserStillInGroup ? action.newGroup : undefined,
        // userDetails: undefined,
        // currentChatUser: undefined,
        // currentGroupChat: undefined,
      };
    }
    case reducerCases.SET_RECENT_CHAT: {
      return {
        ...state,
        currentChatUser: action.recentChat,
        userDetails: undefined,
        groupDetails: undefined,
        currentGroupChat: undefined,
      };
    }
    case reducerCases.SET_RECENT_GROUP: {
      return {
        ...state,
        currentChatUser: undefined,
        userDetails: undefined,
        groupDetails: undefined,
        currentGroupChat: action.recentGroup,
      };
    }
    case reducerCases.EXIT_PROFILE_DETAILS: {
      return {
        ...state,
        userDetails: undefined,
        currentChatUser: undefined,
      };
    }
    case reducerCases.SET_IS_USER_DELETING:
      return {
        ...state,
        isUserDeleting: action.payload,
      };
    case reducerCases.SET_GROUP_CHATS: {
      return {
        ...state,
        groupChats: action.groupChats,
      };
    }
    case reducerCases.ADD_NEW_GROUP: {
      console.log("new", action.newGroup);

      return {
        ...state,
        groupChats: [action.newGroup, ...state.groupChats],
      };
    }
    case reducerCases.ADD_UPDATED_GROUP: {
      const { newGroup } = action;

      const isUserStillInGroup = newGroup.groupMembers.some(
        (member) =>
          member.userId === state.userInfo.id && member.removedAt === null
      );

      const isGroupAlreadyInChats = state.groupChats.some(
        (group) => group.id === newGroup.id
      );

      let updatedGroups;

      if (isUserStillInGroup) {
        updatedGroups = isGroupAlreadyInChats
          ? state.groupChats.map((group) =>
              group.id === newGroup.id ? newGroup : group
            )
          : [newGroup, ...state.groupChats];
      } else {
        updatedGroups = state.groupChats.filter(
          (group) => group.id !== newGroup.id
        );
      }

      return {
        ...state,
        groupChats: updatedGroups,
      };
    }
    case reducerCases.EXIT_GROUP_CHAT: {
      return {
        ...state,
        currentChatUser: undefined,
        userDetails: undefined,
        currentGroupChat: undefined,
      };
    }
    case reducerCases.DELETE_GROUP_CHAT: {
      return {
        ...state,
        groupChats: state.groupChats.filter(
          (group) => group.id !== action.groupId
        ),
      };
    }
    case reducerCases.DELETE_GROUP_DETAILS: {
      return {
        ...state,
        groupDetails: undefined,
      };
    }
    case reducerCases.SET_GROUP_MESSAGES: {
      return {
        ...state,
        groupMessages: action.groupMessages,
      };
    }
    case reducerCases.ADD_GROUP_MESSAGE: {
      if (
        state?.currentGroupChat &&
        state?.currentGroupChat?.id === action.newGroupMessage.groupId
      ) {
        state.socket.current.emit(
          "update-groupsContact-message",
          action.newGroupMessage
        );

        return {
          ...state,
          groupMessages: [...state.groupMessages, action.newGroupMessage],
        };
      } else {
        return {
          ...state,
          groupMessages: [...state.groupMessages, action.newGroupMessage],
        };
      }
    }
    case reducerCases.UPDATE_GROUPS_CHATS: {
      const updatedGroupId = state.currentGroupChat?.id;

      console.log("updatedGroupId", updatedGroupId);
      console.log("groupData", action.payload);
      console.log("state.groupChats", state.groupChats);

      const updatedGroupsContacts = state.groupChats.map((group) => {
        if (group.groupId === action.payload.groupId) {
          return {
            ...group,
            totalUnreadMessages: 0,
          };
        }

        return group;
      });

      return {
        ...state,
        groupChats: updatedGroupsContacts,
      };
    }
    case reducerCases.UPDATE_GROUP_CHAT: {
      const updatedGroupId = state.currentGroupChat?.id;
      console.log("updatedGroupId", updatedGroupId);
      console.log("payload for delete", action.payload);

      const updatedGroupsContacts = state.groupChats.map((group) => {
        if (group.id === action.payload.groupId) {
          return {
            ...group,
            totalUnreadMessages: 0,
          };
        }

        return group;
      });

      return {
        ...state,
        groupChats: updatedGroupsContacts,
      };
    }
    case reducerCases.UPDATE_GROUPS_CONTACT_UNREAD_COUNT: {
      const updatedGroupData = {
        ...action.groupData,
        totalUnreadMessages: 0,
      };

      return {
        ...state,
        groupChats: state.groupChats.map((group) =>
          group.id === updatedGroupData.id
            ? { ...group, ...updatedGroupData }
            : group
        ),
      };
    }

    default:
      return state;
  }
};

export default reducer;
