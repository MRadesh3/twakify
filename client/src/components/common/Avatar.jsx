import Image from "next/image";
import React, { useEffect, useState } from "react";
import { FaCamera } from "react-icons/fa";
import ContextMenu from "./ContextMenu";
import PhotoPicker from "./PhotoPicker";
import PhotoLibrary from "./PhotoLibrary";
import CapturePhoto from "./CapturePhoto";

function Avatar({ type, image, setImage, isView }) {
  const [hover, setHover] = useState(false);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [contextMenuCordinates, setContextMenuCordinates] = useState({
    x: 0,
    y: 0,
  });
  const [grabPhoto, setGrabPhoto] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [showPhotoLibrary, setShowPhotoLibrary] = useState(false);
  const [showCapturedPhoto, setShowCapturedPhoto] = useState(false);

  const showContextMenu = (e) => {
    e.preventDefault();
    setContextMenuCordinates({
      x: e.pageX,
      y: e.pageY,
    });
    setIsContextMenuVisible(true);
  };

  useEffect(() => {
    if (grabPhoto) {
      const data = document.getElementById("photo-picker");
      data.click();
      document.body.onfocus = (e) => {
        setTimeout(() => {
          setGrabPhoto(false);
        }, 1000);
      };
    }
  }, [grabPhoto]);

  const contextMenuOptions = [
    {
      name: "Take Photo",
      callback: () => {
        setShowCapturedPhoto(true);
      },
    },
    {
      name: "Choose From Library",
      callback: () => {
        setShowPhotoLibrary(true);
      },
    },
    {
      name: "Upload Photo",
      callback: () => {
        setGrabPhoto(true);
      },
    },
    {
      name: "Remove Photo",
      callback: () => {
        // setImage({ file: "/default_avatar.png", preview: null });
        setImage({});
        setFilePreview(null);
      },
    },
  ];

  // const photoPickerChange = async (e) => {
  //   const file = e.target.files[0];
  //   console.log("file", file);

  //   const reader = new FileReader();
  //   const data = document.createElement("img");
  //   reader.onload = function (event) {
  //     data.src = event.target.result;
  //     data.setAttribute("data-src", event.target.result);
  //   };
  //   reader.readAsDataURL(file);
  //   setTimeout(() => {
  //     setImage(data.src);
  //   }, 100);
  // };

  // const photoPickerChange = async (e) => {
  //   try {
  //     const selectedFile = e.target.files[0];

  //     if (!selectedFile) return;

  //     // Create the required file response object
  //     const fileResponse = {
  //       fieldname: "media",
  //       originalname: selectedFile.name,
  //       encoding: "7bit", // Browser default
  //       mimetype: selectedFile.type,
  //       destination: "uploads", // You may need to adjust this based on backend handling
  //       filename: selectedFile.name, // Ideally, your backend would generate a unique filename
  //       path: URL.createObjectURL(selectedFile), // Temporary preview URL
  //       size: selectedFile.size,
  //     };

  //     console.log("File Response:", fileResponse);

  //     // Update state with the selected image
  //     setImage(fileResponse);
  //     setFilePreview(fileResponse.path);
  //   } catch (err) {
  //     console.log("Error handling file", err);
  //   }
  // };

  const photoPickerChange = async (e) => {
    try {
      const selectedFile = e.target.files[0];
      if (!selectedFile) return;

      const fileURL = URL.createObjectURL(selectedFile);

      // Update state with file & preview
      setImage({ file: selectedFile, preview: fileURL });
      setFilePreview(fileURL);
    } catch (err) {
      console.error("Error handling file", err);
    }
  };

  const updateImage = (imgData) => {
    setImage(imgData);
    setFilePreview(imgData.preview); // Show preview instantly
  };

  return (
    <>
      <div className="flex items-center justify-center">
        {type === "xsm" && (
          <div className="relative h-7 w-7 rounded-full overflow-hidden bg-panel-header-background">
            <Image
              src={image || "/default_avatar.png"}
              alt="avatar"
              className="object-contain"
              fill
            />
          </div>
        )}
        {type === "sm" && (
          <div className="relative h-10 w-10 rounded-full overflow-hidden bg-panel-header-background">
            <Image
              src={image || "/default_avatar.png"}
              alt="avatar"
              className="object-contain"
              fill
            />
          </div>
        )}
        {type === "lg" && (
          <div className="relative h-14 w-14 rounded-full overflow-hidden bg-panel-header-background">
            <Image
              src={image || "/default_avatar.png"}
              alt="avatar"
              className="object-contain"
              fill
            />
          </div>
        )}
        {type === "xl" && isView && (
          <div className="relative h-60 w-60 rounded-full overflow-hidden bg-panel-header-background">
            <Image
              src={image || "/default_avatar.png"}
              alt="avatar"
              className="object-contain"
              fill
            />
          </div>
        )}
        {type === "xl" && !isView && (
          <div
            className="relative cursor-pointer z-0"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <div
              className={`z-10 bg-photopicker-overlay-background h-60 w-60 absolute top-0 left-0 flex items-center rounded-full justify-center flex-col text-center gap-2
                ${hover ? "visble" : "hidden"}
                `}
              onClick={(e) => showContextMenu(e)}
              id="context-opener"
            >
              <FaCamera
                className="text-2xl"
                id="context-opener"
                onClick={(e) => showContextMenu(e)}
              />
              <span onClick={(e) => showContextMenu(e)} id="context-opener">
                Change <br /> Profile <br /> Photo
              </span>
            </div>
            {/* <div className="flex items-center justify-center h-60 w-60">
              <Image src={image} alt="avatar" className="rounded-full" fill />
            </div> */}
            <div className="relative h-60 w-60 rounded-full overflow-hidden bg-panel-header-background">
              <Image
                src={
                  filePreview
                    ? filePreview
                    : image.file || "/default_avatar.png"
                }
                alt="avatar"
                className="object-contain"
                fill
              />
            </div>
          </div>
        )}
      </div>
      {isContextMenuVisible && (
        <ContextMenu
          options={contextMenuOptions}
          cordinates={contextMenuCordinates}
          contextMenu={isContextMenuVisible}
          setContextMenu={setIsContextMenuVisible}
        />
      )}
      {showCapturedPhoto && (
        <CapturePhoto setImage={updateImage} hide={setShowCapturedPhoto} />
      )}
      {showPhotoLibrary && (
        <PhotoLibrary
          setImage={updateImage}
          hidePhotoLibrary={setShowPhotoLibrary}
        />
      )}
      {grabPhoto && <PhotoPicker onChange={photoPickerChange} />}
    </>
  );
}

export default Avatar;
