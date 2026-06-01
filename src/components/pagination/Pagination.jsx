import './Pagination.sass';

const Pagination = ({ page, totalPages, onPageChange }) => {
    return (
        <div className="paginationContainer">
            <button disabled={page === 0} onClick={() => onPageChange(page - 1)}>
                ← Trước
            </button>

            <span>
                Trang {page + 1}/{totalPages}
            </span>

            <button disabled={page + 1 >= totalPages} onClick={() => onPageChange(page + 1)}>
                Sau →
            </button>
        </div>
    );
};

export default Pagination;
