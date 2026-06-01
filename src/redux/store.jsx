import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
// Vite workaround cho redux-persist storage
const storage = {
    getItem: (key) => Promise.resolve(localStorage.getItem(key)),
    setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
    removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
};
import rootReducer from "./reducer/rootReducer";

const persistConfig = {
    key: "root",
    storage,
    whitelist: ["auth", "song"], // chỉ lưu reducer "auth"
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // tắt check vì redux-persist lưu non-serializable data
        }),
});

export const persistor = persistStore(store);