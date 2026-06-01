export const formatDuration = (duration) => {
    if (!duration || duration < 0) return '0:00';

    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const calculateTotalTime = (songs) => {
    if (!songs || songs.length === 0) return '0min 00sec';

    const totalSeconds = songs.reduce((sum, song) => sum + (song.duration || 0), 0);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}min ${seconds.toString().padStart(2, '0')}sec`;
};

export const formatLongDuration = (duration) => {
    if (!duration || duration < 0) return '0sec';

    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}min`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}sec`);

    return parts.join(' ');
};

export const secondsToTime = (seconds) => {
    if (!seconds || seconds < 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
    }

    return {
        hours: Math.floor(seconds / 3600),
        minutes: Math.floor((seconds % 3600) / 60),
        seconds: seconds % 60,
    };
};
