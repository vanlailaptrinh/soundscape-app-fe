import api from './api';

export const getApiErrorMessage = (error, fallback = 'Something went wrong') => {
    const data = error?.response?.data;
    return data?.message || data?.error || (typeof data === 'string' ? data : null) || fallback;
};

async function uploadSong(formData) {
    const res = await api.post('/artist/upload-song', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
}

async function getAllSongGenres() {
    try {
        const res = await api.get('/artist/genres');
        console.log(res.data);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getTrendingSongs(page = 0, size = 10, days = 7) {
    try {
        const res = await api.get(
            'open/songs/trending',
            {
                params: { page, size, days },
            },
            { skipAuthCheck: true }
        );
        return res.data.content;
    } catch (err) {
        throw err;
    }
}

async function getRecentSongs(page = 0, size = 10) {
    try {
        const res = await api.get('open/songs/recent', {
            params: { page, size },
        });
        return res.data.content;
    } catch (err) {
        throw err;
    }
}

async function getSongAndArtistBySongId(songId) {
    try {
        const res = await api.get(`open/songs/${songId}`);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function listenSong(songId) {
    try {
        await api.get(`user/songs/${songId}/listen`);
    } catch (err) {
        throw err;
    }
}

async function calDurationSong(songId) {
    try {
        const res = await api.put(`user/songs/${songId}/cal-duration-song`);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getTrendingAlbums(page = 0, size = 10) {
    try {
        const res = await api.get('open/albums/trending', {
            params: { page, size },
            skipAuthCheck: true,
        });
        return res.data.content;
    } catch (err) {
        throw err;
    }
}

async function getAlbumWithSongs(albumId) {
    try {
        const res = await api.get(`open/albums/${albumId}/songs`);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getTrendingArtists(page = 0, size = 10, days = 7) {
    try {
        const res = await api.get(
            'open/artist/trending',
            {
                params: { page, size, days },
            },
            { skipAuthCheck: true }
        );
        return res.data.content;
    } catch (err) {
        throw err;
    }
}

async function getArtistWithSongsAndAlbums(artistId) {
    try {
        const res = await api.get(`open/${artistId}/full`);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getListeningHistory(page = 0, size = 8) {
    try {
        const res = await api.get('user/listening-history', {
            params: { page, size },
        });
        return res.data.content;
    } catch (err) {
        throw err;
    }
}

async function follow(id, type) {
    try {
        const res = await api.post('/user/follow', { id, type });
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function unfollow(id, type) {
    try {
        const res = await api.post('/user/unfollow', { id, type });
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function addSongToPlaylist(playlistId, songId) {
    try {
        const res = await api.post(`user/${playlistId}/songs/${songId}`);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function deleteSongFromPlaylist(playlistId, songId) {
    try {
        const res = await api.delete(`user/${playlistId}/songs/${songId}`);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getMyPlaylists() {
    try {
        const res = await api.get('user/my-playlists');
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function createPlaylistWithSong(songId) {
    try {
        const res = await api.post('user/create-playlist-with-song', { songId });
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function followed() {
    try {
        const res = await api.get('user/followed');
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function followedArtistApi() {
    try {
        const res = await api.get('user/followedArtist');
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function followedAlbumApi() {
    try {
        const res = await api.get('user/followedAlbum');
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getPlaylistWithListSong(playlistId) {
    try {
        const res = await api.get(`user/playlist/${playlistId}`);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getRecommendSongs() {
    try {
        const res = await api.get(`/user/recommend/songs`);
        return res.data.content;
    } catch (err) {
        throw err;
    }
}

async function searchSongs(keyword) {
    try {
        const res = await api.get(`/search?keyword=${encodeURIComponent(keyword)}`);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function deletePlaylist(playlistId) {
    try {
        const res = await api.delete(`/user/${playlistId}`);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getMySongs() {
    try {
        const res = await api.get('/artist/get-songs');
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getMyAlbums() {
    try {
        const res = await api.get('/artist/get-my-albums');
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function createAlbum(formData) {
    try {
        const res = await api.post('/artist/create-album', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function addSongToAlbum(albumId, songId) {
    try {
        const res = await api.post(`/artist/${albumId}/add-song/${songId}`);
        return res.data;
    } catch (err) {
        console.error('Failed to add song to album:', err);
        throw err;
    }
}

async function deleteAlbum(albumId) {
    try {
        const res = await api.delete(`/artist/delete-album/${albumId}`);
        return res.data;
    } catch (err) {
        console.error('Failed to delete album:', err);
        throw err;
    }
}

async function commentOnSong(songId, comment) {
    try {
        const res = await api.post(`/user/comments/song/${songId}`, comment, {
            headers: { 'Content-Type': 'text/plain' },
        });
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getCommentsOnSong(songId) {
    try {
        const res = await api.get(`/user/comments/song/${songId}`, {
            headers: { 'Content-Type': 'text/plain' },
        });
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function addCommentReply(commentId, content) {
    try {
        const res = await api.post(`/user/comments/reply/${commentId}`, content, {
            headers: { 'Content-Type': 'text/plain' },
        });
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getReply(commentId) {
    try {
        const res = await api.get(`/user/comments/reply/${commentId}`);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function sendFeedback(feedback) {
    try {
        const res = await api.post('/user/feedbacks', feedback, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return res.data;
    } catch (err) {
        console.error('Failed to send feedback:', err);
        throw err;
    }
}

async function rateSong(songId, rating) {
    try {
        const res = await api.post(`/user/song/ratings/${songId}/rate`, {
            songId: songId,
            rating: rating,
        });
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function unrateSong(songId) {
    try {
        const res = await api.delete(`/user/song/ratings/${songId}/rate`);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getUserRating(songId) {
    try {
        const res = await api.get(`/user/song/ratings/${songId}/rate`);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getAverageSongRating(songId) {
    try {
        const res = await api.get(`/user/song/ratings/${songId}/rating-average`);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getRatingStats(songId) {
    try {
        const res = await api.get(`/user/song/ratings/${songId}/rating-stats`);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getAllUsers(page = 0, size = 10, sort = 'id,asc') {
    try {
        const res = await api.get('/admin/get-all-users', {
            params: {
                page,
                size,
                sort,
            },
        });
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getUserDetail(userId) {
    try {
        const res = await api.get(`/admin/get-user-detail/${userId}`);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function blockUser(userId) {
    try {
        const res = await api.put(`/admin/${userId}/block`);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function banUser(userId) {
    try {
        const res = await api.put(`/admin/${userId}/ban`);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function unblockUser(userId) {
    try {
        const res = await api.put(`/admin/${userId}/unblock`);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function addRoleToUser(userId, role) {
    try {
        const res = await api.post(`/admin/${userId}/roles/add`, {
            role: role, // roleEnum: ADMIN, USER, ARTIST
        });
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function removeRoleFromUser(userId, role) {
    try {
        const res = await api.post(`/admin/${userId}/roles/remove`, {
            role: role,
        });
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getAllSongsAdmin(page = 0, size = 10, sort = 'id,asc') {
    try {
        const res = await api.get('/admin/get-all-songs', {
            params: { page, size, sort },
        });
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getSongDetail(songId) {
    try {
        const res = await api.get(`/admin/get-song-detail/${songId}`);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function banSong(songId) {
    try {
        const res = await api.put(`/admin/song/${songId}/ban`);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function unblockSong(songId) {
    try {
        const res = await api.put(`/admin/song/${songId}/unblock`);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getSongMonthlyStats(songId, months = 6) {
    try {
        const res = await api.get(`/admin/statistics/song/${songId}/listening`, {
            params: { months },
        });
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getAppListeningStats(days = 30) {
    try {
        const res = await api.get(`/admin/statistics/analyse`, {
            params: { days },
        });
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getAllArtists() {
    try {
        const res = await api.get('/open/artists');
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getSongDailyStats(songId, days = 30) {
    try {
        const res = await api.get(`/artist/song/${songId}/listening/daily`, {
            params: { days },
        });
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getMyProfile() {
    try {
        const res = await api.get('/user/profile');
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getMyListeningDaily(days = 30) {
    try {
        const res = await api.get('/user/daily-time', {
            params: { days },
        });
        return res.data;
    } catch (err) {
        throw err;
    }
}

export {
    uploadSong,
    getAllSongGenres,
    getTrendingSongs,
    getRecentSongs,
    getSongAndArtistBySongId,
    listenSong,
    calDurationSong,
    getTrendingAlbums,
    getAlbumWithSongs,
    getTrendingArtists,
    getArtistWithSongsAndAlbums,
    getListeningHistory,
    follow,
    unfollow,
    addSongToPlaylist,
    deleteSongFromPlaylist,
    getMyPlaylists,
    createPlaylistWithSong,
    followed,
    followedArtistApi,
    followedAlbumApi,
    getPlaylistWithListSong,
    getRecommendSongs,
    searchSongs,
    deletePlaylist,
    getMySongs,
    getMyAlbums,
    createAlbum,
    addSongToAlbum,
    deleteAlbum,
    commentOnSong,
    getCommentsOnSong,
    addCommentReply,
    getReply,
    sendFeedback,
    rateSong,
    unrateSong,
    getUserRating,
    getAverageSongRating,
    getRatingStats,
    getAllUsers,
    getUserDetail,
    blockUser,
    banUser,
    unblockUser,
    addRoleToUser,
    removeRoleFromUser,
    getAllSongsAdmin,
    getSongDetail,
    banSong,
    unblockSong,
    getSongMonthlyStats,
    getAppListeningStats,
    getSongDailyStats,
    getAllArtists,
    getMyProfile,
    getMyListeningDaily,
};
