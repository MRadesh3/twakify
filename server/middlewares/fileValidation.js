export const getFileType = (file) => {
  console.log("file", file);

  if (!file || !file.mimetype || !file.originalname) {
    return "unknown";
  }

  if (file.mimetype.startsWith("image/")) {
    return "image";
  } else if (file.mimetype === "application/pdf") {
    return "pdf";
  } else if (
    file.mimetype === "application/zip" ||
    file.mimetype === "application/x-zip-compressed"
  ) {
    return "zip";
  } else if (
    file.mimetype === "application/vnd.ms-excel" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return "excel";
  } else if (
    file.mimetype === "application/msword" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "doc";
  } else if (file.mimetype.startsWith("video/")) {
    return "video";
  } else if (file.mimetype.startsWith("audio/")) {
    return "audio";
  }

  const fileExtension = file.originalname.split(".").pop().toLowerCase();

  switch (fileExtension) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
    case "webp":
      return "image";
    case "xls":
    case "xlsx":
      return "excel";
    case "pdf":
      return "pdf";
    case "zip":
      return "zip";
    case "doc":
    case "docx":
      return "doc";
    case "mp4":
    case "avi":
    case "mov":
    case "mkv":
      return "video";
    case "mp3":
    case "wav":
    case "ogg":
    case "aac":
      return "audio";
    default:
      return "unknown";
  }
};
