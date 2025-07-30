import React, { useEffect, useState, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import Avatar from "../common/Avatar";
import { FaPlay, FaStop } from "react-icons/fa";
import { calculateTime, formatTime24Hour } from "@/utils/CalculateTime";
import MessageStatus from "../common/MessageStatus";
import { useStateProvider } from "@/context/StateContext";
import { decryptMessage } from "@/utils/Crypto";

function VoiceMessage({ message }) {
  const [{ userInfo, currentChatUser, currentGroupChat }] = useStateProvider();
  const [audioMessage, setAudioMessage] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  const waveFormRef = useRef(null);
  const waveform = useRef(null);

  useEffect(() => {
    if (message.deletedAt === null && !waveform.current) {
      waveform.current = WaveSurfer.create({
        container: waveFormRef.current,
        waveColor: "#ccc",
        progressColor: "#4a9eff",
        cursorColor: "#7ae3c3",
        barWidth: 2,
        height: 30,
        responsive: true,
      });

      waveform.current.on("finish", () => {
        setIsPlaying(false);
      });
    }

    return () => {
      if (waveform.current) {
        waveform.current.destroy();
        waveform.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (message?.deletedAt === null && message?.message && waveform.current) {
      const audioURL = `${process.env.NEXT_PUBLIC_HOST_URL}/${decryptMessage(
        message?.message,
        message?.iv
      )}`;
      const audio = new Audio(audioURL);
      setAudioMessage(audio);

      waveform.current.load(audioURL);
      waveform.current.on("ready", () => {
        setTotalDuration(waveform.current.getDuration());
      });
    }
  }, [message?.message]);

  useEffect(() => {
    if (audioMessage) {
      const updatePlaybackTime = () => {
        setCurrentPlaybackTime(audioMessage.currentTime);
      };
      audioMessage.addEventListener("timeupdate", updatePlaybackTime);

      return () => {
        audioMessage.removeEventListener("timeupdate", updatePlaybackTime);
      };
    }
  }, [audioMessage]);

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handlePlayAudio = () => {
    if (audioMessage && waveform.current) {
      waveform.current.play();
      audioMessage.play();
      setIsPlaying(true);
    }
  };

  const handlePauseAudio = () => {
    if (audioMessage && waveform.current) {
      waveform.current.pause();
      audioMessage.pause();
      setIsPlaying(false);
    }
  };

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

  return (
    <div
      className={`flex items-center gap-5 text-white px-4 pr-2 py-4 text-sm rounded-md ${
        message?.senderId !== userInfo?.id
          ? "bg-incoming-background"
          : "bg-outgoing-background"
      }`}
    >
      {message.deletedAt === null ? (
        <>
          <div>
            <Avatar
              type="lg"
              image={
                currentChatUser
                  ? message?.senderId === currentChatUser?.id
                    ? currentChatUser?.profileImage
                    : userInfo.profileImage
                  : getImageUrl(message?.sender?.profilePicture)
              }
            />
          </div>
          <div className="cursor-pointer text-xl">
            {!isPlaying ? (
              <FaPlay onClick={handlePlayAudio} />
            ) : (
              <FaStop onClick={handlePauseAudio} />
            )}
          </div>
          <div className="relative">
            <div className="w-60" ref={waveFormRef} />
            <div className="text-bubble-meta text-[11px] pt-1 flex justify-between absolute bottom-[-22px] w-full">
              <span>
                {formatTime(isPlaying ? currentPlaybackTime : totalDuration)}
              </span>
              <div className="flex gap-1">
                <span>{formatTime24Hour(message?.createdAt)}</span>
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
          </div>
        </>
      ) : (
        <>
          <span
            className={`break-all ${
              message.deletedAt !== null && "text-gray-300"
            }`}
          >
            This media message has been deleted
          </span>
          <div className="flex gap-1 items-end min-w-fit">
            <span className="text-bubble-meta text-[11px] pt-1 min-w-fit">
              {currentChatUser
                ? calculateTime(message?.deletedAt ?? message?.createdAt)
                : formatTime24Hour(message?.deletedAt ?? message?.createdAt)}
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
        </>
      )}
    </div>
  );
}

export default VoiceMessage;
