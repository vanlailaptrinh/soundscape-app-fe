import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    reduxIsHomeActive: true,
    reduxIsBrowseActive: false,
    reduxIsNotificationActive: false,
    previousNotification: "",

};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setReduxIsHomeActiveTrue: (state) => {
            state.reduxIsHomeActive = true;
            state.reduxIsBrowseActive = false;
            state.reduxIsNotificationActive = false;
        },
        setReduxIsBrowseActiveTrue: (state) => {
            state.reduxIsBrowseActive = true;
            state.reduxIsHomeActive = false;
            state.reduxIsNotificationActive = false;
        },
        setReduxIsNotificationActive: (state, action) => {
            if (action.payload) {
                for (let key in state) {
                    if (state[key] === true && key !== 'reduxIsNotificationActive') {
                        state.previousNotification = key;
                    }
                }
                state.reduxIsNotificationActive = true;
                state.reduxIsHomeActive = false;
                state.reduxIsBrowseActive = false;
            } else {
                state.reduxIsNotificationActive = false;
                if (state.previousNotification) {
                    state[state.previousNotification] = true;
                    state.previousNotification = '';
                }
            }
        }

    },
});

export const { setReduxIsHomeActiveTrue, setReduxIsBrowseActiveTrue, setReduxIsNotificationActive } = uiSlice.actions;
export default uiSlice.reducer;
