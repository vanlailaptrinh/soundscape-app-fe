const isValidEmail = (email) => {
    const regexEmai = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmai.test(email);
}

export { isValidEmail };