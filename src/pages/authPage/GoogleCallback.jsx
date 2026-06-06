import { useEffect } from 'react';
import { loginWithGoogle } from '~/apis/authApi';

const GoogleCallback = () => {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code) {
            const redirectUri = window.location.origin + '/api/auth/google-callback';
            loginWithGoogle(code, redirectUri)
                .then((res) => {
                    if (window.opener) {
                        window.opener.postMessage({ accessToken: res.accessToken }, window.location.origin);
                        window.close();
                    }
                })
                .catch((err) => {
                    console.error(err);

                    const message = err.response?.data?.message || 'Google login failed. Please try again.';
                    console.error(message);

                    if (window.opener) {
                        window.opener.postMessage({ error: message }, window.location.origin);
                        window.close();
                    }
                });
        }
    }, []);

    return <div>Đang xác thực Google...</div>;
};

export default GoogleCallback;
