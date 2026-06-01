import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    reduxListSong: [],
    reduxCurrentSongIndex: -1,
    reduxCurrentTime: 0,
    reduxIsPlaying: false,
    reduxVolume: 0.1,
};

const songSlice = createSlice({
    name: 'song',
    initialState,
    reducers: {
        // Thêm 1 bài hát sau bài đang phát (Play Next)
        addNextSong: (state, action) => {
            const newSong = action.payload;
            if (state.reduxCurrentSongIndex >= 0) {
                state.reduxListSong.splice(state.reduxCurrentSongIndex + 1, 0, newSong);
            } else {
                state.reduxListSong.push(newSong);
                state.reduxCurrentSongIndex = 0; // nếu chưa có bài nào đang phát
            }
        },

        // Thêm 1 bài hát vào cuối queue (Add to Playlist/Queue)
        addSongToEnd: (state, action) => {
            state.reduxListSong.push(action.payload);
        },

        setReduxCurrentSongIndex: (state, action) => {
            const listLength = state.reduxListSong.length;

            if (action.payload === 'next') {
                // Increase index by 1, but stop at the last song (listLength - 1)
                state.reduxCurrentSongIndex = Math.min(state.reduxCurrentSongIndex + 1, listLength - 1);
            } else if (action.payload === 'prev') {
                // Decrease index by 1, but stop at 0
                state.reduxCurrentSongIndex = Math.max(state.reduxCurrentSongIndex - 1, 0);
            } else if (typeof action.payload === 'number') {
                // Set index directly, but clamp it between 0 and listLength - 1
                state.reduxCurrentSongIndex = Math.max(0, Math.min(action.payload, listLength - 1));
            }
        },

        // Xóa bài theo id
        removeSong: (state, action) => {
            // const songId = String(action.payload);
            // const index = state.reduxListSong.findIndex(info => info.song.id === songId);

            if (state.reduxListSong.length > 0) {
                state.reduxListSong.splice(state.reduxListSong.length - 1, 1);
                state.reduxCurrentSongIndex = Math.max(0, state.reduxCurrentSongIndex - 1);
            }
        },
        clearSongs: (state) => {
            state.reduxListSong = [];
            state.reduxCurrentSongIndex = -1;
        },

        addSongList: (state, action) => {
            const { songs, currentIndex } = action.payload;
            state.reduxListSong = [...state.reduxListSong, ...songs];
            state.reduxCurrentSongIndex = currentIndex;
        },

        setReduxVolume: (state, action) => {
            state.reduxVolume = action.payload;
        },
    },
});

export const {
    addNextSong,
    addSongToEnd,
    setReduxCurrentSongIndex,
    removeSong,
    clearSongs,
    setReduxIsRight,
    setReduxCurrentTime,
    setReduxIsPlaying,
    addSongList,
    setReduxVolume,
} = songSlice.actions;
export default songSlice.reducer;
