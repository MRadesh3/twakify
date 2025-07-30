import Image from "next/image";
import React from "react";
import { IoClose } from "react-icons/io5";

function PhotoLibrary({ setImage, hidePhotoLibrary }) {
  const images = [
    "/avatars/1.png",
    "/avatars/2.png",
    "/avatars/3.png",
    "/avatars/4.png",
    "/avatars/5.png",
    "/avatars/6.png",
    "/avatars/7.png",
    "/avatars/8.png",
    "/avatars/9.png",
    "/heroavatars/person1.png",
    "/heroavatars/person2.png",
    "/heroavatars/person3.png",
    "/heroavatars/person4.png",
    "/heroavatars/person5.png",
    "/heroavatars/person6.png",
    "/heroavatars/person7.png",
    "/heroavatars/person8.png",
    "/heroavatars/person9.png",
    "/heroavatars/person10.png",
    "/heroavatars/person11.png",
    "/heroavatars/person12.png",
    "/heroavatars/person13.png",
    "/heroavatars/person14.png",
    "/heroavatars/person15.png",
    "/heroavatars/person16.png",
  ];
  return (
    <div className="fixed top-0 left-0 max-h-[100vh] max-w-[100vw] h-full w-full flex justify-center items-center bg-black/50 z-20">
      <div className="custom-scrollbar max-h-[90vh] w-max bg-gray-900 gap-6 rounded-lg p-4 overflow-auto">
        <div
          className="custom-scrollbar pt-2 pe-2 cursor-pointer flex items-end justify-end"
          onClick={() => hidePhotoLibrary(false)}
        >
          <IoClose className="h-10 w-10 cursor-pointer" />
        </div>
        <div className=" grid grid-cols-3 justify-center items-center gap-16 p-20 w-full">
          {images.map((image, index) => (
            <div
              key={index}
              // onClick={() => {
              //   setImage({ file: images[index], preview: null });
              //   hidePhotoLibrary(false);
              // }}
              onClick={() => {
                setImage({
                  file: images[index],
                  preview: images[index],
                });
                hidePhotoLibrary(false);
              }}
            >
              {/* <div className="h-24 w-24 cursor-pointer relative rounded-full overflow-hidden">
                <Image src={image} alt="avatar" fill />
              </div> */}
              <div className="relative h-24 w-24 rounded-full overflow-hidden bg-panel-header-background">
                <Image
                  src={image}
                  alt="avatar"
                  className="object-contain"
                  fill
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PhotoLibrary;
