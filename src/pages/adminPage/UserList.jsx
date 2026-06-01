import { useEffect, useState } from 'react';
import { getAllUsers } from '~/apis/songApi';
import Pagination from '~/components/pagination/Pagination';
import './UserList.sass';

const UserList = ({ onSelectUser, refreshFlag }) => {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [pages, setPages] = useState(0);

    const [sortField, setSortField] = useState('id');
    const [sortDir, setSortDir] = useState('asc');

    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const sortParam = `${sortField},${sortDir}`;
            const data = await getAllUsers(page, size, sortParam);

            setUsers(data.content);
            setPages(data.page);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setTimeout(() => setLoading(false), 150);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, sortField, sortDir, refreshFlag]);

    const handleSortClick = (field) => {
        if (sortField === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
        setPage(0);
    };

    return (
        <div className="userListContainer">
            <div className="userListHeader">
                <h2>Quản lý User</h2>
            </div>

            <div className="userListTable">
                <table>
                    <thead>
                        <tr>
                            <th onClick={() => handleSortClick('id')} className={sortField === 'id' ? 'active' : ''}>
                                <div className="thContent">
                                    <span>ID</span>
                                    <span className="sortIcon">
                                        {sortField === 'id' ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                                    </span>
                                </div>
                            </th>

                            <th
                                onClick={() => handleSortClick('username')}
                                className={sortField === 'username' ? 'active' : ''}>
                                <div className="thContent">
                                    <span>Tên</span>
                                    <span className="sortIcon">
                                        {sortField === 'username' ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                                    </span>
                                </div>
                            </th>

                            <th
                                onClick={() => handleSortClick('email')}
                                className={sortField === 'email' ? 'active' : ''}>
                                <div className="thContent email">
                                    <span>Email</span>
                                    <span className="sortIcon">
                                        {sortField === 'email' ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                                    </span>
                                </div>
                            </th>

                            <th
                                onClick={() => handleSortClick('status')}
                                className={sortField === 'status' ? 'active' : ''}>
                                <div className="thContent">
                                    <span>Trạng thái</span>
                                    <span className="sortIcon">
                                        {sortField === 'status' ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                                    </span>
                                </div>
                            </th>

                            <th>Hành động</th>
                        </tr>
                    </thead>

                    <tbody className={loading ? 'loadingRows' : ''}>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center' }}>
                                    Không có dữ liệu
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>

                                    <td>
                                        <span className={`statusBadge ${user.status.toLowerCase()}`}>
                                            {user.status}
                                        </span>
                                    </td>

                                    <td>
                                        <button className="viewBtn" onClick={() => onSelectUser(user.id)}>
                                            Xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination page={page} totalPages={pages.totalPages} onPageChange={(newPage) => setPage(newPage)} />
        </div>
    );
};

export default UserList;
