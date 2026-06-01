import api from './api';

async function registerInitiate(email, password) {
    try {
        const res = await api.post('/auth/register-initiate', { email, password }, { skipAuthCheck: true });
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function registerVerify(email, verificationCode) {
    try {
        const res = await api.post('/auth/register-verify', { email, verificationCode }, { skipAuthCheck: true });
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function logout() {
    try {
        const res = await api.post('/auth/logout');
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function profile() {
    try {
        const res = await api.get('/user/profile');
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function login(email, password) {
    try {
        const res = await api.post('/auth/login', { email, password }, { skipAuthCheck: true });
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function loginWithGoogle(code) {
    try {
        const res = await api.post('/auth/google-callback', code, { skipAuthCheck: true });
        console.log(res);
        return res.data;
    } catch (err) {
        throw err;
    }
}

export { registerInitiate, registerVerify, logout, login, loginWithGoogle, profile };
