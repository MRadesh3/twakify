import React, { useEffect, useRef, useState } from "react";
import ChatList from "./Chatlist/ChatList";
import Empty from "./Empty";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import { checkUser } from "@/apis/Auth/authApis";
import { useRouter } from "next/router";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import Chat from "./Chat/Chat";
import Profile from "./common/Profile";
import { getMessagesApi } from "@/apis/Message/messageApis";
import { io } from "socket.io-client";
import SearchMessages from "./Chat/SearchMessages";
import VideoCall from "./Call/VideoCall";
import VoiceCall from "./Call/VoiceCall";
import IncomingVideoCall from "./common/IncomingVideoCall";
import IncomingCall from "./common/IncomingCall";
import { getGroupMessagesApi } from "@/apis/Groupchat/groupchatApis";

function Main() {
  const router = useRouter();
  const [redirectLogin, setRedirectLogin] = useState(false);
  const [
    {
      userInfo,
      userDetails,
      userDetailsOpen,
      groupDetails,
      groupDetailsOpen,
      currentChatUser,
      isUserDeleting,
      messagesSearch,
      videoCall,
      voiceCall,
      incomingVideoCall,
      incomingVoiceCall,
      currentGroupChat,
    },
    dispatch,
  ] = useStateProvider();
  const socket = useRef();
  const [socketEvent, setSocketEvent] = useState(false);

  const currentChatUserRef = useRef(currentChatUser);
  useEffect(() => {
    currentChatUserRef.current = currentChatUser;
  }, [currentChatUser]);

  // useEffect(() => {
  //   if (redirectLogin) {
  //     router.push("/login");
  //   }
  // }, [redirectLogin]);

  useEffect(() => {
    if (redirectLogin && !isUserDeleting) {
      router.push("/login");
    }
  }, [redirectLogin, isUserDeleting]);

  onAuthStateChanged(firebaseAuth, async (currentUser) => {
    // if (!currentUser && !redirectLogin) setRedirectLogin(true);
    if (!currentUser && !redirectLogin && !isUserDeleting)
      setRedirectLogin(true);
    if (!userInfo && currentUser?.email) {
      const response = await checkUser({ email: currentUser?.email });

      if (!response?.data?.status) {
        router.push("/login");
      }
      const imagePath = response?.data?.data?.profilePicture;

      const imageUrl =
        imagePath &&
        (imagePath.startsWith("/avatars") ||
          imagePath.startsWith("/heroavatars") ||
          imagePath.startsWith("https://lh3.googleusercontent.com"))
          ? imagePath
          : `${process.env.NEXT_PUBLIC_HOST_URL}/${imagePath}`;

      dispatch({
        type: reducerCases.SET_USER_INFO,
        userInfo: {
          id: response?.data?.data?.id,
          name: response?.data?.data?.name,
          email: response?.data?.data?.email,
          profileImage: imageUrl,
          status: response?.data?.data?.about,
          groups: response?.data?.data?.groupMembers,
        },
      });
    }
  });

  // useEffect(() => {
  //   if (userInfo) {
  //     socket.current = io(process.env.NEXT_PUBLIC_HOST_URL);
  //     socket.current.emit("add-user", userInfo?.id);
  //     dispatch({
  //       type: reducerCases.SET_SOCKET,
  //       socket,
  //     });

  //     // Example: Emit user's groups on login or refresh
  //     socket.current.emit("joinUserGroups", {
  //       userId: userInfo?.id, // The logged-in user's ID
  //       groups: userInfo?.groups?.map((group) => group.groupId), // Array of group IDs
  //     });
  //   }
  // }, [userInfo]);

  useEffect(() => {
    if (userInfo) {
      socket.current = io(process.env.NEXT_PUBLIC_HOST_URL);

      socket.current.on("connect", () => {
        socket.current.emit("add-user", userInfo?.id);
        socket.current.emit("joinUserGroups", {
          userId: userInfo?.id,
          groups: userInfo?.groups?.map((group) => group.groupId),
        });

        dispatch({
          type: reducerCases.SET_SOCKET,
          socket,
        });
      });
    }
  }, [userInfo]);

  // useEffect(() => {
  //   if (currentChatUser) {
  //     socket.current.on("message-as-read", (data) => {
  //       console.log("Message seen event received:", data);

  //       console.log("data from read message", data);
  //       dispatch({
  //         type: reducerCases.MARK_MESSAGE_AS_READ,
  //         payload: { ...data, currentChatUser },
  //       });
  //     });
  //   }
  // }, [currentChatUser]);

  useEffect(() => {
    if (socket.current && !socketEvent) {
      socket.current.on("msg-recieve", (data) => {
        dispatch({
          type: reducerCases.ADD_RECEIVER_MESSAGE,
          newMessage: { ...data },
          socket,
        });

        // if (currentChatUser?.id === data.senderId) {
        //   socket.current.emit("message-as-read", {
        //     from: userInfo?.id,
        //     to: data.senderId,
        //   });
        // }
      });

      socket.current.onAny((event, data) => {
        console.log(`Received Event: ${event}`, data);
      });

      socket.current.on("message-status-updated", (data) => {
        dispatch({
          type: reducerCases.UPDATE_MESSAGE_STATUSES,
          payload: {
            messageId: data.messageId,
            status: data.status,
            iv: data.iv,
          },
        });
      });

      // socket.current.on("message-seen", (data) => {
      //   console.log("Message seen event received:", data);

      //   // Dispatch action to update the message status to 'read'
      //   dispatch({
      //     type: reducerCases.MARK_MESSAGE_AS_READ,
      //     payload: {
      //       ...data,
      //       currentChatUserRef,
      //     },
      //   });
      // });

      socket.current.on("deleted-msg", async (newData) => {
        console.log("data from deleted", newData);

        const {
          data: { data },
        } = await getMessagesApi({
          from: newData.senderId,
          to: newData.receiverId,
        });

        dispatch({
          type: reducerCases.SET_MESSAGES,
          messages: data,
        });
        dispatch({
          type: reducerCases.UPDATE_CONTACT_MESSAGE,
          payload: {
            ...newData,
            currentChatUser: currentChatUserRef.current,
          },
        });
      });

      socket.current.on("messages-read", (data) => {
        console.log("read data", data);

        dispatch({
          type: reducerCases.SET_READ_MESSAGES,
          payload: { senderId: data.senderId, receiverId: data.receiverId },
        });
      });

      socket.current.on("incoming-voice-call", ({ from, roomId, callType }) => {
        dispatch({
          type: reducerCases.SET_INCOMING_VOICE_CALL,
          incomingVoiceCall: {
            ...from,
            roomId,
            callType,
          },
        });
      });

      socket.current.on("incoming-video-call", ({ from, roomId, callType }) => {
        dispatch({
          type: reducerCases.SET_INCOMING_VIDEO_CALL,
          incomingVideoCall: {
            ...from,
            roomId,
            callType,
          },
        });
      });

      socket.current.on("voice-call-rejected", () => {
        dispatch({
          type: reducerCases.END_CALL,
        });
      });

      socket.current.on("video-call-rejected", () => {
        dispatch({
          type: reducerCases.END_CALL,
        });
      });

      socket.current.on("online-users", ({ onlineUsers }) => {
        dispatch({
          type: reducerCases.SET_ONLINE_USERS,
          onlineUsers,
        });
      });

      // Group sockets
      socket.current.on("groupCreated", ({ groupId, groupData }) => {
        console.log(`Received group data for group_${groupId}:`, groupData);
        dispatch({
          type: reducerCases.ADD_NEW_GROUP,
          newGroup: groupData,
        });
      });

      socket.current.on("groupUpdated", ({ groupId, groupData }) => {
        console.log(
          `Received updated group data for group_${groupId}:`,
          groupData
        );
        dispatch({
          type: reducerCases.ADD_UPDATED_GROUP,
          newGroup: groupData,
        });
        dispatch({
          type: reducerCases.UPDATE_GROUP_DETAILS,
          newGroup: groupData,
        });
      });

      socket.current.on("groupDeleted", ({ groupId, groupData }) => {
        console.log(
          `Received deleted group data for group_${groupId}:`,
          groupData
        );
        dispatch({
          type: reducerCases.DELETE_GROUP_CHAT,
          groupId,
        });
        dispatch({
          type: reducerCases.DELETE_GROUP_DETAILS,
        });
      });

      socket.current.on("receiveGroupMessage", (groupData) => {
        dispatch({
          type: reducerCases.ADD_GROUP_MESSAGE,
          newGroupMessage: groupData,
        });
      });

      // socket.current.on("groupMessageDeleted", async (groupData) => {
      //   console.log("deleted data", groupData);

      //   const {
      //     data: { data },
      //   } = await getGroupMessagesApi({
      //     groupId: groupData?.groupId,
      //   });

      //   dispatch({
      //     type: reducerCases.SET_GROUP_MESSAGES,
      //     groupMessages: data,
      //   });
      //   dispatch({
      //     type: reducerCases.UPDATE_GROUP_CHAT,
      //     payload: groupData,
      //   });
      // });

      // socket.current.on("groupsContact-message-updated", async (groupData) => {
      //   dispatch({
      //     type: reducerCases.UPDATE_GROUPS_CHATS,
      //     payload: groupData,
      //   });
      // });

      setSocketEvent(true);
    }
  }, [socket.current, currentChatUser]);

  useEffect(() => {
    const getMessages = async () => {
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
    if (currentChatUser?.id) {
      getMessages();
    }
  }, [currentChatUser]);

  useEffect(() => {
    const getGroupMessages = async () => {
      const {
        data: { data },
      } = await getGroupMessagesApi({
        groupId: currentGroupChat?.id,
        userId: userInfo?.id,
      });

      dispatch({
        type: reducerCases.SET_GROUP_MESSAGES,
        groupMessages: data,
      });
    };
    if (currentGroupChat?.id) {
      getGroupMessages();
    }
  }, [currentGroupChat]);

  return (
    <>
      {incomingVideoCall && <IncomingVideoCall />}
      {incomingVoiceCall && <IncomingCall />}

      {videoCall && (
        <div className="h-screen w-screen max-h-full overflow-hidden">
          <VideoCall />
        </div>
      )}

      {voiceCall && (
        <div className="h-screen w-screen max-h-full overflow-hidden">
          <VoiceCall />
        </div>
      )}

      {!voiceCall && !videoCall && (
        <div className="grid grid-cols-main h-screen w-screen max-h-screen max-w-full overflow-hidden">
          <ChatList />
          {(userDetailsOpen && userDetails) ||
          (groupDetailsOpen && groupDetails) ? (
            <Profile />
          ) : currentChatUser || currentGroupChat ? (
            <div
              className={messagesSearch ? "grid grid-cols-2" : "grid-cols-2"}
            >
              <Chat />
              {messagesSearch && <SearchMessages />}
            </div>
          ) : (
            <Empty />
          )}
        </div>
      )}
    </>
  );
}

export default Main;
