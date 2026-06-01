import { useEffect, useState } from 'react';
import { getUserDetail, blockUser, banUser, unblockUser, addRoleToUser, removeRoleFromUser } from '~/apis/songApi';
import NoAvatar from '~/assets/image/noAvatar.png';
import './UserDetail.sass';

const ALL_ROLES = ['ADMIN', 'ARTIST', 'USER'];

const UserDetail = ({ userId, closeRightPanel, setRefreshFlag }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [dropdownOpen, setDropdownOpen] = useState(false);

    async function reload() {
        const data = await getUserDetail(userId);
        setUser(data);
    }

    useEffect(() => {
        if (!userId) return;

        // Reset tất cả state về ban đầu khi userId thay đổi
        setDropdownOpen(false);
        setLoading(true);
        setUser(null);

        async function fetchDetail() {
            await reload();
            setLoading(false);
        }

        fetchDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    if (loading) {
        return (
            <div className="userDetailContainer">
                <p style={{ textAlign: 'center' }}>Đang tải...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="userDetailContainer">
                <p style={{ textAlign: 'center' }}>Không tìm thấy user</p>
            </div>
        );
    }

    const handleAddRole = async (role) => {
        await addRoleToUser(userId, role);
        setDropdownOpen(false);
        await reload();
    };

    const handleRemoveRole = async (role) => {
        await removeRoleFromUser(userId, role);
        await reload();
    };

    const handleBlockUser = async (userId) => {
        await blockUser(userId);
        setRefreshFlag((prev) => !prev);
        await reload();
    };

    const handleBanUser = async (userId) => {
        await banUser(userId);
        setRefreshFlag((prev) => !prev);
        await reload();
    };

    const handleUnblockUser = async (userId) => {
        await unblockUser(userId);
        setRefreshFlag((prev) => !prev);
        await reload();
    };

    return (
        <div className="userDetailContainer">
            {/* ---- AVATAR ---- */}
            <div className="userDetailAvatar">
                <img src={user.urlAvatar || NoAvatar} alt={user.username} />
            </div>

            {/* ---- INFO ---- */}
            <div className="userDetailInfo">
                <h3>{user.username}</h3>
                <p className="userDetailEmail">{user.email}</p>

                {/* ======= ROLE SECTION ======= */}
                <div className="userDetailSection">
                    <label>Vai trò:</label>

                    <div className="roleList">
                        {user.role?.length > 0 ? (
                            user.role.map((r) => (
                                <div key={r} className={`roleBadge ${r.toLowerCase()}`}>
                                    {r}
                                    <button className="removeRoleBtn" onClick={() => handleRemoveRole(r)}>
                                        ×
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="roleBadge none">NONE</div>
                        )}
                    </div>

                    <div
                        className={`toggleAddRoleBtn ${dropdownOpen ? 'open' : 'closed'}`}
                        onClick={() => setDropdownOpen(!dropdownOpen)}>
                        {dropdownOpen ? 'Close' : '+ Add role'}
                    </div>

                    {dropdownOpen && (
                        <div className="dropdownRoleBox">
                            {ALL_ROLES.filter((r) => !user.role?.includes(r)).map((role) => (
                                <div key={role} className="dropdownRoleItem" onClick={() => handleAddRole(role)}>
                                    {role}
                                </div>
                            ))}

                            {ALL_ROLES.filter((r) => !user.role?.includes(r)).length === 0 && (
                                <div className="dropdownRoleItem disabled">Không còn role nào</div>
                            )}
                        </div>
                    )}
                </div>

                {/* ---- STATUS ---- */}
                <div className="userDetailSection">
                    <label>Trạng thái:</label>
                    <span className={`statusBadge ${user.status.toLowerCase()}`}>{user.status}</span>
                </div>

                {/* ---- EXTRA METRICS ---- */}
                <div className="userDetailSection">
                    <label>Ngày tạo:</label>
                    <span>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>

                <div className="userDetailSection">
                    <label>Tổng bài hát:</label>
                    <span>{user.totalSongs}</span>
                </div>

                <div className="userDetailSection">
                    <label>Tổng lượt nghe:</label>
                    <span>{user.totalListeningCount}</span>
                </div>

                <div className="userDetailSection">
                    <label>Lượt nghe trung bình / tháng:</label>
                    <span>{user.averageMonthlyListeners}</span>
                </div>
            </div>

            {/* ---- ACTIONS ---- */}
            <div className="userDetailActions">
                {user.status === 'ACTIVE' && (
                    <>
                        <button className="banBtn" onClick={() => handleBanUser(userId)}>
                            Banned
                        </button>
                        <button className="blockBtn" onClick={() => handleBlockUser(userId)}>
                            Block
                        </button>
                    </>
                )}

                {(user.status === 'LOCKED' || user.status === 'BANNED') && (
                    <button className="unblockBtn" onClick={() => handleUnblockUser(userId)}>
                        Unblock
                    </button>
                )}

                <button className="closeBtn" onClick={closeRightPanel}>
                    Đóng
                </button>
            </div>
        </div>
    );
};

export default UserDetail;
