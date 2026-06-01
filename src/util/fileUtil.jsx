const getMediaType = (mediaUrl) => {
    if (!mediaUrl) return "audio";
    const lower = mediaUrl.toLowerCase();
    if (lower.endsWith(".mp4")) return "video";
    if (lower.endsWith(".mp3")) return "audio";
    return "audio";
};

const isVideo = (mediaUrl) => {
    return getMediaType(mediaUrl) === "video";
};


export { isVideo }