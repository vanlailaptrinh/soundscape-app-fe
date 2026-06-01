function getRoleFromJWT(token) {
    if (!token) return null;
    try {
        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) return null;

        const payload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
        return payload.role || payload.roles || null;
    } catch (err) {
        console.error('Invalid token', err);
        return null;
    }
}

export { getRoleFromJWT };
