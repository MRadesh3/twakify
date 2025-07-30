import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import Image from "next/image";
import React from "react";

function IncomingCall() {
  const [{ incomingVoiceCall, socket }, dispatch] = useStateProvider();

  const acceptCall = () => {
    dispatch({
      type: reducerCases.SET_VOICE_CALL,
      voiceCall: { ...incomingVoiceCall, type: "in-coming" },
    });
    socket.current.emit("accept-incoming.call", { id: incomingVoiceCall?.id });
    dispatch({
      type: reducerCases.SET_INCOMING_VOICE_CALL,
      incomingVoiceCall: undefined,
    });
  };

  const rejectCall = () => {
    socket.current.emit("reject-voice-call", { from: incomingVoiceCall?.id });
    dispatch({
      type: reducerCases.END_CALL,
    });
  };

  return (
    <div className="h-24 w-80 fixed top-8 mb-0 right-[50%] left-[50%] z-50 rounded-sm flex gap-10 items-center justify-start bg-conversation-panel-background text-white drop-shadow-2xl border-icon-green border-2 py-14">
      <div className="relative h-[70px] w-[70px] rounded-full overflow-hidden bg-panel-header-background ml-5">
        <Image
          src={incomingVoiceCall?.profilePicture}
          alt="avatar"
          className="object-contain"
          fill
        />
      </div>
      <div>
        <div>{incomingVoiceCall?.name}</div>
        <div className="text-xs">Incoming Voice Call</div>
        <div className="flex gap-2 mt-4">
          <button
            className="bg-red-500 p-1 px-4 text-sm rounded-full"
            onClick={rejectCall}
          >
            Reject
          </button>
          <button
            className="bg-green-500 p-1 px-4 text-sm rounded-full"
            onClick={acceptCall}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncomingCall;
