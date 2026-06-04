import { combineReducers } from 'redux';
import authSlice from "./authSlice";
import uiSlice from "./uiSlice";
import songSlice from "./songSlice"
import songNotWhiteListSlice from "./songNotWhitelistSlice";

const appReducer = combineReducers({
    auth: authSlice,
    ui: uiSlice,
    song: songSlice,
    songNotWhite: songNotWhiteListSlice
});

const rootReducer = (state, action) => {
    if (action.type === 'auth/setReduxLogout') {
        state = undefined;
    }
    return appReducer(state, action);
};

export default rootReducer;
