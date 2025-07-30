import { useStateProvider } from "@/context/StateContext";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Avatar from "../common/Avatar";
import { MdOutlineCallEnd } from "react-icons/md";
import { reducerCases } from "@/context/constants";
import { getCallTokenApi } from "@/apis/Auth/authApis";

function Container({ data }) {
  const [{ socket, userInfo }, dispatch] = useStateProvider();
  const [callAccepted, setCallAccepted] = useState(false);
  const [token, setToken] = useState(undefined);
  const [zegoVar, setZegoVar] = useState(undefined);
  const [localStream, setLocalStream] = useState(undefined);
  const [publishedStream, setPublishedStream] = useState(undefined);

  useEffect(() => {
    if (data.type === "out-going") {
      socket.current.on("accept-call", () => {
        setCallAccepted(true);
      });
    } else {
      setTimeout(() => {
        setCallAccepted(true);
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    const getToken = async () => {
      try {
        const response = await getCallTokenApi({
          userId: userInfo?.id,
        });
        setToken(response?.data?.data);
        console.log("res token", response);
      } catch (err) {
        console.log("Error generating token", err);
      }
    };
    getToken();
  }, [callAccepted]);

  useEffect(() => {
    const startCall = async () => {
      import("zego-express-engine-webrtc").then(
        async ({ ZegoExpressEngine }) => {
          const zego = new ZegoExpressEngine(
            parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID, 10),
            process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET
          );
          setZegoVar(zego);

          zego.on(
            "roomStreamUpdate",
            async (roomId, updateType, streamList, extendedData) => {
              if (updateType === "ADD") {
                const rmVideo = document.getElementById("remote-video");
                const vd = document.createElement(
                  data?.callType === "video" ? "video" : "audio"
                );
                vd.id = streamList[0].streamID;
                vd.autoplay = true;
                vd.playsInline = true;
                vd.muted = false;
                if (rmVideo) {
                  rmVideo.appendChild(vd);
                }
                zego
                  .startPlayingStream(streamList[0].streamID, {
                    audio: true,
                    video: true,
                  })
                  .then((stream) => (vd.srcObject = stream));
              } else if (
                updateType === "DELETE" &&
                zego &&
                localStream &&
                streamList[0].streamID
              ) {
                zego.destroyStream(localStream);
                zego.stopPublishingStream(streamList[0].streamID);
                zego.logoutRoom(data.roomId.toString());
                dispatch({
                  type: reducerCases.END_CALL,
                });
              }
            }
          );
          await zego.loginRoom(
            data?.roomId?.toString(),
            token,
            { userID: userInfo?.id?.toString(), userName: userInfo?.name },
            { userUpdate: true }
          );

          const localStream = await zego.createStream({
            camera: {
              audio: true,
              video: data?.callType === "video" ? true : false,
            },
          });
          const localVideo = document.getElementById("local-video");
          const videoElement = document.createElement(
            data?.callType === "video" ? "video" : "audio"
          );
          videoElement.id = "video-local-zego";
          videoElement.className = "h-28 w-32";
          videoElement.autoplay = true;
          videoElement.muted = false;
          videoElement.playsInline = false;
          localVideo.appendChild(videoElement);
          const td = document.getElementById("video-local-zego");
          td.srcObject = localStream;
          const streamID = "123" + Date.now();
          setPublishedStream(streamID);
          setLocalStream(localStream);
          zego.startPublishingStream(streamID, localStream);
        }
      );
    };
    if (token) {
      startCall();
    }
  }, [token]);

  const endCall = () => {
    const id = data?.id;
    if (zegoVar && localStream && publishedStream) {
      zegoVar.destroyStream(localStream);
      zegoVar.stopPublishingStream(publishedStream);
      zegoVar.logoutRoom(data?.roomId?.toString());
    }
    if (data?.callType === "voice") {
      socket.current.emit("reject-voice-call", { from: id });
    } else {
      socket.current.emit("reject-video-call", { from: id });
    }
    dispatch({
      type: reducerCases.END_CALL,
    });
  };

  return (
    <div className="border-conversation-border border-1 w-full bg-conversation-panel-background flex flex-col h-[100vh] overflow-hidden items-center justify-center text-white">
      <div className="flex flex-col gap-3 items-center">
        <span className="text-5xl">{data?.name}</span>
        <span className="text-lg">
          {callAccepted && data?.callType !== "video"
            ? "On going call"
            : "Calling"}
        </span>
      </div>
      {(!callAccepted || data?.callType === "voice") && (
        <div className="my-10">
          <div className="relative h-[300px] w-[300px] rounded-full overflow-hidden bg-panel-header-background">
            <Image
              src={data?.profilePicture}
              alt="avatar"
              className="object-contain"
              fill
            />
          </div>
        </div>
      )}

      <div className="my-5 relative" id="remote-video">
        <div className="absolute bottom-5 right-5" id="local-video"></div>
      </div>

      <div className="h-16 w-16 bg-red-600 flex items-center justify-center rounded-full">
        <MdOutlineCallEnd
          className="text-3xl cursor-pointer"
          onClick={endCall}
        />
      </div>
    </div>
  );
}

export default Container;
