import { combineReducers } from 'redux';
import authSlice from "./authSlice";
import uiSlice from "./uiSlice";
import songSlice from "./songSlice"
import songNotWhiteListSlice from "./songNotWhitelistSlice";

const rootReducer = combineReducers({
    auth: authSlice,
    ui: uiSlice,
    song: songSlice,
    songNotWhite: songNotWhiteListSlice
});

export default rootReducer;
