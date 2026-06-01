import { createSlice } from "@reduxjs/toolkit";
import { getRoleFromJWT } from "~/services/authService"

const initialState = {
    reduxAccessToken: null,
    reduxIsLogin: false,
    reduxEmail: null,
    reduxUser: null
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setReduxAccessToken: (state, action) => {
            state.reduxAccessToken = action.payload;
        },
        setReduxLogin: (state, action) => {
            state.reduxIsLogin = true;
            state.reduxAccessToken = action.payload;
        },
        setReduxLogout: (state) => {
            state.reduxAccessToken = null;
            state.reduxUser = null;
            state.reduxIsLogin = false
        },
        setReduxEmail: (state, action) => {
            state.reduxEmail = action.payload;
        },
        setReduxUser: (state, action) => {
            const token = state.reduxAccessToken;
            const roles = getRoleFromJWT(token);
            state.reduxUser = {
                ...action.payload,
                roles
            };
        },
    },
});

export const { setReduxAccessToken, setReduxLogout, setReduxLogin, setReduxEmail, setReduxUser } = authSlice.actions;
export default authSlice.reducer;
