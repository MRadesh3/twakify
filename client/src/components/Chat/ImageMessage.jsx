import { useStateProvider } from "@/context/StateContext";
import { calculateTime, formatTime24Hour } from "@/utils/CalculateTime";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import MessageStatus from "../common/MessageStatus";
import { BsArrowDownCircle } from "react-icons/bs";
import { IoCloseSharp } from "react-icons/io5";
import { reducerCases } from "@/context/constants";
import { decryptMessage } from "@/utils/Crypto";

function FileMessage({ message }) {
  const [{ userInfo, currentChatUser }, dispatch] = useStateProvider();
  const [downloaded, setDownloaded] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "zip":
        return "/icons/zip.png";
      case "pdf":
        return "/icons/pdf.png";
      case "excel":
        return "/icons/excel.png";
      default:
        return "/icons/file.png";
    }
  };

  const fileUrl = `${process.env.NEXT_PUBLIC_HOST_URL}/${decryptMessage(
    message?.message,
    message?.iv
  )}`;
  const fileName = decryptMessage(message?.message, message?.iv)
    .split(`\\`)
    .pop();

  useEffect(() => {
    const downloadedFiles =
      JSON.parse(localStorage.getItem("downloadedFiles")) || [];
    if (downloadedFiles.includes(fileName)) {
      setDownloaded(true);
    }
  }, [fileName]);

  const downloadFile = async (url) => {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch the file");
      }

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName || "download"; // Fallback to a generic filename if `fileName` is not available
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update localStorage
      const downloadedFiles =
        JSON.parse(localStorage.getItem("downloadedFiles")) || [];
      if (!downloadedFiles.includes(fileName)) {
        downloadedFiles.push(fileName);
        localStorage.setItem(
          "downloadedFiles",
          JSON.stringify(downloadedFiles)
        );
      }
      setDownloaded(true);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  return (
    <div
      className={`text-white px-2 py-[5px] text-sm rounded-md flex gap-2 items-end max-w-[45%] relative cursor-pointer ${
        message.senderId !== userInfo?.id
          ? "bg-incoming-background"
          : "bg-outgoing-background"
      }`}
    >
      {message.type === "image" && message.deletedAt === null ? (
        <div className="relative">
          <img
            src={fileUrl}
            alt="asset"
            className="rounded-lg pb-6 mb-2"
            height={250}
            width={250}
            onClick={() => {
              if (message?.type === "image") {
                dispatch({
                  type: reducerCases.BIG_IMAGE,
                  bigImage: 10,
                });
              }
              setShowImage(true);
              setImageUrl(fileUrl);
            }}
          />
          <div className="absolute bottom-1 right-1 flex items-end gap-1">
            <span className="text-bubble-meta text-[11px] pt-1 min-w-fit">
              {currentChatUser
                ? calculateTime(message?.createdAt)
                : formatTime24Hour(message?.createdAt)}
            </span>
            <span className="text-bubble-meta">
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
      ) : message.type !== "image" && message.deletedAt === null ? (
        <div className="relative">
          <div className="flex gap-3 items-center">
            <Image
              src={getFileIcon(message.type)}
              alt={message.type}
              className="rounded-lg pb-6"
              height={80}
              width={80}
              onClick={() => {
                if (message?.type === "image") {
                  dispatch({
                    type: reducerCases.BIG_IMAGE,
                    bigImage: 10,
                  });
                }
                setShowImage(true);
                setImageUrl(fileUrl);
              }}
            />

            <span className="break-all">{fileName}</span>
          </div>

          <div className="absolute bottom-1 right-1 flex items-end gap-1">
            <span className="text-bubble-meta text-[11px] pt-1 min-w-fit">
              {currentChatUser
                ? calculateTime(message?.createdAt)
                : formatTime24Hour(message?.createdAt)}
            </span>
            <span className="text-bubble-meta">
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

          {message?.senderId !== userInfo?.id && !downloaded && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                downloadFile(fileUrl);
              }}
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md cursor-pointer"
            >
              <BsArrowDownCircle className="text-bubble-meta text-3xl hover:text-white" />
            </div>
          )}
        </div>
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
              {message.deletedAt === null
                ? formatTime24Hour(message?.createdAt)
                : formatTime24Hour(message?.deletedAt)}
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

      {/* {message.type !== "image" && (
        <div className="relative">
          <div className="flex gap-3 items-center">
            <Image
              src={getFileIcon(message.type)}
              alt={message.type}
              className="rounded-lg pb-6"
              height={80}
              width={80}
              onClick={() => {
                if (message?.type === "image") {
                  dispatch({
                    type: reducerCases.BIG_IMAGE,
                    bigImage: 10,
                  });
                }
                setShowImage(true);
                setImageUrl(fileUrl);
              }}
            />

            <span className="break-all">{fileName}</span>
          </div>

          <div className="absolute bottom-1 right-1 flex items-end gap-1">
            <span className="text-bubble-meta text-[11px] pt-1 min-w-fit">
              {calculateTime(message?.createdAt)}
            </span>
            <span className="text-bubble-meta">
              {message?.senderId === userInfo?.id && (
                <MessageStatus
                  messageStatus={message?.messageStatus}
                  currentChatUser={currentChatUser}
                  messageId={message?.id}
                />
              )}
            </span>
          </div>

          {message?.senderId !== userInfo?.id && !downloaded && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                downloadFile(fileUrl);
              }}
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md cursor-pointer"
            >
              <BsArrowDownCircle className="text-bubble-meta text-3xl hover:text-white" />
            </div>
          )}
        </div>
      )} */}

      {showImage && message?.type === "image" && (
        <div className="fixed z-[10000] top-0 right-0 h-[100vh] w-[100vw] flex items-center justify-center bg-black/50 backdrop-blur-lg">
          <div className="relative flex flex-col items-center justify-center">
            <img
              src={imageUrl}
              alt="asset"
              className="h-[80vh] w-full bg-cover mt-10"
            />
            <div className="fixed top-0 my-5 flex gap-3">
              <button
                className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadFile(imageUrl);
                }}
              >
                <BsArrowDownCircle />
              </button>
              <button
                className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                onClick={(e) => {
                  dispatch({
                    type: reducerCases.BIG_IMAGE,
                    bigImage: 20,
                  });
                  e.stopPropagation();
                  setImageUrl(null);
                  setShowImage(false);
                }}
              >
                <IoCloseSharp />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileMessage;
