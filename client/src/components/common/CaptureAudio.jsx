import { addMediaMessageApi } from "@/apis/Message/messageApis";
import { addGroupMediaMessagesApi } from "@/apis/Groupchat/groupchatApis";
import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import React, { useEffect, useRef, useState } from "react";
import {
  FaMicrophone,
  FaPauseCircle,
  FaPlay,
  FaStop,
  FaTrash,
} from "react-icons/fa";
import { MdSend } from "react-icons/md";
import WaveSurfer from "wavesurfer.js";

function CaptureAudio({ hide }) {
  const [{ userInfo, currentChatUser, socket, currentGroupChat }, dispatch] =
    useStateProvider();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [waveform, setWaveform] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setisPlaying] = useState(false);
  const [renderedAudio, setRenderedAudio] = useState(null);

  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const waveFormRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prevDuration) => {
          setTotalDuration(prevDuration + 1);
          return prevDuration + 1;
        });
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [isRecording]);

  useEffect(() => {
    const wavesurfer = WaveSurfer.create({
      container: waveFormRef.current,
      waveColor: "#ccc",
      progressColor: "#4a9eff",
      cursorColor: "#7ae3c3",
      barWidth: 2,
      height: 30,
      responsive: true,
    });

    setWaveform(wavesurfer);

    wavesurfer.on("finish", () => {
      setisPlaying(false);
    });

    return () => {
      wavesurfer.destroy();
    };
  }, []);

  useEffect(() => {
    if (waveform) {
      handleStartRecording();
    }
  }, [waveform]);

  const handleStartRecording = () => {
    setRecordingDuration(0);
    setCurrentPlaybackTime(0);
    setTotalDuration(0);
    setIsRecording(true);
    setRecordedAudio(null);
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioRef.current.srcObject = stream;

        const chunks = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
          const audioURL = URL.createObjectURL(blob);
          const audio = new Audio(audioURL);
          setRecordedAudio(audio);

          waveform.load(audioURL);
        };
        mediaRecorder.start();
      })
      .catch((error) => {
        console.log("Audio error", error);
      });
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      waveform.stop();

      // Stop all tracks of the MediaStream
      if (audioRef.current.srcObject) {
        const tracks = audioRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop()); // Stop each track
      }

      const audioChunks = [];
      mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });

      mediaRecorderRef.current.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
        const audioFile = new File([audioBlob], "recording.mp3");
        setRenderedAudio(audioFile);
      });
    }
  };

  useEffect(() => {
    if (recordedAudio) {
      const updatePlaybackTime = () => {
        setCurrentPlaybackTime(recordedAudio.currentTime);
      };
      recordedAudio.addEventListener("timeupdate", updatePlaybackTime);
      return () => {
        recordedAudio.removeEventListener("timeupdate", updatePlaybackTime);
      };
    }
  }, [recordedAudio]);

  const handlePlayRecording = () => {
    if (recordedAudio) {
      waveform.stop();
      waveform.play();
      recordedAudio.play();
      setisPlaying(true);
    }
  };

  const handlePauseRecording = () => {
    waveform.stop();
    recordedAudio.pause();
    setisPlaying(false);
  };

  const sendRecording = async () => {
    try {
      if (currentGroupChat) {
        const formData = new FormData();
        formData.append("media", renderedAudio);
        formData.append("from", userInfo?.id);
        formData.append("groupId", currentGroupChat?.id);

        const response = await addGroupMediaMessagesApi(formData);

        console.log("group media", response?.data);

        if (response?.data?.status) {
          socket.current.emit("sendGroupMessage", {
            id: response?.data?.data?.id,
            createdAt: response?.data?.data?.createdAt,
            deletedAt: response?.data?.data?.deletedAt,
            messageId: response?.data?.data?.id,
            groupId: currentGroupChat?.id,
            groupMessageReadStatus:
              response?.data?.data?.groupMessageReadStatus,
            senderId: userInfo?.id,
            sender: response?.data?.data?.sender,
            message: response?.data?.data?.message,
            type: response?.data?.data?.type,
            iv: response?.data?.data?.iv,
          });
          // dispatch({
          //   type: reducerCases.ADD_GROUP_MESSAGE,
          //   newGroupMessage: {
          //     ...response?.data?.data,
          //     group: currentGroupChat,
          //   },
          //   loggedInUserId: userInfo?.id,
          //   fromSelf: true,
          // });

          // socket.current.on("message-status-updated", (data) => {
          //   dispatch({
          //     type: reducerCases.UPDATE_MESSAGE_STATUS,
          //     payload: {
          //       messageId: data?.messageId,
          //       status: data.status,
          //       socket,
          //     },
          //   });
          // });
        }
        setRenderedAudio(null);
        hide();
      } else {
        const formData = new FormData();
        formData.append("media", renderedAudio);
        formData.append("from", userInfo?.id);
        formData.append("to", currentChatUser?.id);

        const response = await addMediaMessageApi(formData);
        if (response?.data?.status) {
          socket.current.emit("send-msg", {
            to: currentChatUser?.id,
            from: userInfo?.id,
            message: response?.data?.data?.message,
            iv: response?.data?.data?.iv,
            type: response?.data?.data?.type,
            createdAt: response?.data?.data?.createdAt,
            messageStatus: response?.data?.data?.messageStatus,
          });
          dispatch({
            type: reducerCases.ADD_MESSAGE,
            newMessage: { ...response?.data?.data },
            fromSelf: true,
          });
        }
        setRenderedAudio(null);
        hide();
      }
    } catch (err) {
      console.log("Error sending audio", err);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex text-2xl w-full justify-end items-center">
      <div className="pt-1">
        <FaTrash
          className="text-panel-header-icon cursor-pointer"
          onClick={() => hide()}
        />
      </div>
      <div className="mx-4 py-2 px-4 text-white text-lg flex gap-3 justify-center items-center bg-search-input-container-background rounded-full drop-shadow-lg">
        {isRecording ? (
          <div className="text-red-500 animate-pulse 2-60 text-center">
            Recording <span>{recordingDuration}s</span>
          </div>
        ) : (
          <div>
            {recordedAudio && (
              <>
                {!isPlaying ? (
                  <FaPlay
                    onClick={handlePlayRecording}
                    className="cursor-pointer"
                  />
                ) : (
                  <FaStop
                    onClick={handlePauseRecording}
                    className="cursor-pointer"
                  />
                )}
              </>
            )}
          </div>
        )}
        <div className="w-60" ref={waveFormRef} hidden={isRecording} />
        {recordedAudio && isPlaying && (
          <span>{formatTime(currentPlaybackTime)}</span>
        )}
        {recordedAudio && !isPlaying && (
          <span>{formatTime(totalDuration)}</span>
        )}
        <audio ref={audioRef} hidden />
      </div>
      <div className="mr-4">
        {!isRecording ? (
          <FaMicrophone
            className="text-red-500 cursor-pointer"
            onClick={handleStartRecording}
          />
        ) : (
          <FaPauseCircle
            className="text-red-500 cursor-pointer"
            onClick={handleStopRecording}
          />
        )}
      </div>
      <div>
        <MdSend
          className="text-panel-header-icon cursor-pointer mr-4"
          title="Send"
          onClick={sendRecording}
        />
      </div>
    </div>
  );
}

export default CaptureAudio;
