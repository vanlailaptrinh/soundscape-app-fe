const normalizeString = (str) => {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // xóa dấu
        .toLowerCase();
};

export { normalizeString };
