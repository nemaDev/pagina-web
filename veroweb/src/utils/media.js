export const getVideoPoster = (src = "", poster = "") => {
  if (poster) return poster;
  if (!src) return "";

  if (src.includes("res.cloudinary.com") && src.includes("/video/upload/")) {
    const withFirstFrame = src.replace("/video/upload/", "/video/upload/so_0/");
    return withFirstFrame.replace(/\.[^./?]+(?=($|\?))/, ".jpg");
  }

  return "";
};
