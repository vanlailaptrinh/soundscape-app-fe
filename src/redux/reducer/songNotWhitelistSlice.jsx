import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    reduxIsPlaying: false,
    reduxDuration: 0,
    reduxIsRight: false,
    reduxExtendedFullRight: false,
    reduxLibrarySong: [], // { type: '', id: '' }
    reduxRefresh: 0,
};

const songNotWhiteListSlice = createSlice({
    name: 'songNotWhite',
    initialState,
    reducers: {
        // Set trạng thái right panel
        setReduxIsRight: (state, action) => {
            state.reduxIsRight = action.payload;
        },

        setReduxCurrentTime: (state, action) => {
            state.reduxCurrentTime = action.payload;
        },
        // setIsPlaying
        setReduxIsPlaying: (state, action) => {
            state.reduxIsPlaying = action.payload;
        },
        setReduxLibrarySong: (state, action) => {
            const newItems = Array.isArray(action.payload) ? action.payload : [action.payload];

            newItems.forEach(({ type, id }) => {
                const exists = state.reduxLibrarySong.some((item) => item.type === type && item.id === id);
                if (!exists) {
                    state.reduxLibrarySong.push({ type, id });
                }
            });
        },
        cleanReduxLibrarySong: (state) => {
            state.reduxLibrarySong = [];
        },
        setReduxRefresh: (state, action) => {
            state.reduxRefresh += 1;
        },
        setReduxExtendedFullRight: (state, action) => {
            state.reduxExtendedFullRight = action.payload;
        },
    },
});

export const {
    setReduxIsRight,
    setReduxCurrentTime,
    setReduxIsPlaying,
    setReduxLibrarySong,
    cleanReduxLibrarySong,
    setReduxRefresh,
    setReduxExtendedFullRight,
} = songNotWhiteListSlice.actions;
export default songNotWhiteListSlice.reducer;
