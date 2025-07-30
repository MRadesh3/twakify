import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";

function CapturePhoto({ hide, setImage }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    let stream;
    const startCamera = async () => {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      videoRef.current.srcObject = stream;
    };
    startCamera();
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const capturePhoto = (event) => {
    event.preventDefault(); // Prevent form submission
    event.stopPropagation(); // Prevent the event from bubbling up
    const canvas = document.createElement("canvas");
    const video = videoRef.current;

    if (!video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to Blob (image file)
    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File([blob], "captured-photo.jpg", {
          type: "image/jpeg",
        });
        const fileURL = URL.createObjectURL(file); // Generate preview URL

        // Pass both file & preview back to Avatar component
        setImage({ file, preview: fileURL });
        hide(false);
      },
      "image/jpeg",
      0.9
    );
  };

  // const capturePhoto = () => {
  //   const canvas = document.createElement("canvas");
  //   canvas.getContext("2d").drawImage(videoRef.current, 0, 0, 300, 150);
  //   setImage(canvas.toDataURL("image/jpeg"));
  //   hide(false);
  // };

  // const capturePhoto = () => {
  //   const canvas = document.createElement("canvas");
  //   const video = videoRef.current;

  //   // Set canvas dimensions
  //   canvas.width = video.videoWidth;
  //   canvas.height = video.videoHeight;
  //   canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

  //   // Convert canvas to Blob
  //   canvas.toBlob(
  //     (blob) => {
  //       const file = new File([blob], "captured-photo.jpg", {
  //         type: "image/jpeg",
  //       });
  //       const fileURL = URL.createObjectURL(file); // Generate preview URL

  //       setImage(fileURL); // Set image as preview URL instead of File
  //       hide(false);
  //     },
  //     "image/jpeg",
  //     0.9
  //   );
  // };

  // const capturePhoto = () => {
  //   const canvas = document.createElement("canvas");
  //   const video = videoRef.current;

  //   canvas.width = video.videoWidth;
  //   canvas.height = video.videoHeight;

  //   canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

  //   canvas.toBlob(
  //     (blob) => {
  //       const file = new File([blob], "captured-photo.jpg", {
  //         type: "image/jpeg",
  //       });
  //       setImage(file);
  //       setFilePreviews(file);
  //       hide(false);
  //     },
  //     "image/jpeg",
  //     0.9
  //   ); // 0.9 = JPEG quality
  // };

  return (
    <div className="absolute h-5/6 w-2/6 top-[10%] left-1/3 bg-gray-900 gap-3 rounded-lg pt-2 flex items-center justify-center z-20">
      <div className="flex flex-col gap-4 w-full items-center justify-center">
        <div
          className="pt-2 pr-2 cursor-pointer flex items-end justify-end"
          onClick={() => hide(false)}
        >
          <IoClose className="h-10 w-10 cursor-pointer" />
        </div>
        <div className="flex justify-center">
          <video id="video" width={400} autoPlay ref={videoRef}></video>
        </div>
        <button
          className="h-16 w-16 bg-white rounded-full cursor-pointer border-8 border-teal-light p-2 mb-10"
          onClick={capturePhoto}
        ></button>
      </div>
    </div>
  );
}

export default CapturePhoto;
