const VIDEO_EXTENSIONS = ['mp4', 'mkv', 'mov', 'avi', 'flv', 'wmv', 'webm'];
const AUDIO_EXTENSIONS = ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'];

const getExtension = (url) => {
    if (!url) return '';
    // Lấy phần trước query string/hash nếu có
    const clean = url.split('?')[0].split('#')[0];
    const dot = clean.lastIndexOf('.');
    return dot !== -1 ? clean.substring(dot + 1).toLowerCase() : '';
};

const getMediaType = (mediaUrl) => {
    const ext = getExtension(mediaUrl);
    if (VIDEO_EXTENSIONS.includes(ext)) return 'video';
    if (AUDIO_EXTENSIONS.includes(ext)) return 'audio';
    return 'audio'; // mặc định
};

const isVideo = (mediaUrl) => {
    return getMediaType(mediaUrl) === 'video';
};

export { isVideo, getMediaType };