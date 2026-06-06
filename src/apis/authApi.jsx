import api from './api';

async function registerInitiate(email, password) {
    try {
        const res = await api.post('/auth/register-initiate', { email, password }, { skipAuthCheck: true });
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function registerVerify(token) {
    try {
        const res = await api.get(`/auth/register-verify?token=${token}`, { skipAuthCheck: true });
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
        const res = await api.post('/auth/google-callback', { code }, { skipAuthCheck: true });
        console.log(res);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function updateMyProfile(formData) {
    try {
        const res = await api.put('/user/profile/update', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    } catch (err) {
        throw err;
    }
}

export { registerInitiate, registerVerify, logout, login, loginWithGoogle, profile, updateMyProfile };
