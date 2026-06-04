import { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import NoAvatar from '~/assets/image/noAvatar.png';
import { getMyProfile, getMyListeningDaily, getListeningHistory } from '~/apis/songApi';
import { updateMyProfile } from '~/apis/authApi';
import { setReduxUser } from '~/redux/reducer/authSlice';
import ListeningChart from '~/components/chart/ListeningChart';
import './ProfileView.sass';

const ProfileView = ({ listenSong }) => {
    const dispatch = useDispatch();
    const [profile, setProfile] = useState(null);
    const [listeningData, setListeningData] = useState([]);
    const [recentSongs, setRecentSongs] = useState([]);
    const [days, setDays] = useState(30);

    // Edit states
    const [isEditing, setIsEditing] = useState(false);
    const [editUsername, setEditUsername] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState(null);
    const fileInputRef = useRef(null);

    const fetchListeningData = async (d) => {
        try {
            const res = await getMyListeningDaily(d);
            setListeningData(res);
        } catch (err) {
            console.error('Daily listening fetch failed:', err);
        }
    };

    const fetchRecentSongs = async () => {
        try {
            const res = await getListeningHistory(0, 8); // top 8 recent songs
            setRecentSongs(res || []);
        } catch (err) {
            console.error('Recent songs fetch failed:', err);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                const data = await getMyProfile();
                setProfile(data);
                setEditUsername(data.username || '');
                setEditDescription(data.description || '');
                fetchListeningData(days);
                fetchRecentSongs();
            } catch (err) {
                console.error(err);
            }
        };
        init();
    }, []);

    useEffect(() => {
        fetchListeningData(days);
    }, [days]);

    const handleAvatarClick = () => {
        if (isEditing) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setSaveMessage({ type: 'error', text: 'Vui lòng chọn file ảnh!' });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setSaveMessage({ type: 'error', text: 'Kích thước ảnh tối đa 5MB!' });
            return;
        }

        setAvatarFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleStartEdit = () => {
        setIsEditing(true);
        setEditUsername(profile?.username || '');
        setEditDescription(profile?.description || '');
        setAvatarFile(null);
        setAvatarPreview(null);
        setSaveMessage(null);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setAvatarFile(null);
        setAvatarPreview(null);
        setSaveMessage(null);
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setSaveMessage(null);

        try {
            const formData = new FormData();
            if (editUsername.trim()) {
                formData.append('username', editUsername.trim());
            }
            formData.append('description', editDescription.trim());
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            const updatedProfile = await updateMyProfile(formData);
            setProfile(updatedProfile);
            dispatch(setReduxUser(updatedProfile));
            setIsEditing(false);
            setAvatarFile(null);
            setAvatarPreview(null);
            setSaveMessage({ type: 'success', text: 'Cập nhật thành công!' });

            // Clear success message after 3s
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (err) {
            console.error('Profile update failed:', err);
            setSaveMessage({ type: 'error', text: 'Cập nhật thất bại. Vui lòng thử lại!' });
        } finally {
            setIsSaving(false);
        }
    };

    if (!profile) return <div className="profileLoading">Đang tải...</div>;

    const displayAvatar = avatarPreview || profile?.urlAvatar || NoAvatar;
    const ranges = [30, 90, 180, 365];

    return (
        <div className="profilePage">
            <div className="profileHeader">
                <div className="profileAvatarWrapper" onClick={handleAvatarClick}>
                    <img src={displayAvatar} alt="Avatar" className="profileAvatar" />
                    {isEditing && (
                        <div className="avatarOverlay">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="white"/>
                                <path d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H16.83L15 2H9Z" stroke="white" strokeWidth="1.5"/>
                            </svg>
                            <span>Đổi ảnh</span>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                </div>

                <div className="profileInfo">
                    {isEditing ? (
                        <input
                            type="text"
                            className="editUsernameInput"
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            placeholder="Nhập tên hiển thị..."
                            maxLength={50}
                        />
                    ) : (
                        <div className="profileUsername">{profile?.username || 'Chưa đặt tên'}</div>
                    )}

                    {isEditing ? (
                        <textarea
                            className="editDescriptionInput"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Giới thiệu bản thân..."
                            maxLength={500}
                            rows={3}
                        />
                    ) : (
                        <div className="profileDescription">
                            {profile?.description || 'Chưa có mô tả'}
                        </div>
                    )}

                    <div className="profileEmail">{profile?.email}</div>
                </div>

                <div className="profileActions">
                    {isEditing ? (
                        <>
                            <button
                                className="profileBtn saveBtn"
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <span className="savingSpinner"></span>
                                ) : (
                                    'Lưu'
                                )}
                            </button>
                            <button
                                className="profileBtn cancelBtn"
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                            >
                                Hủy
                            </button>
                        </>
                    ) : (
                        <button className="profileBtn editBtn" onClick={handleStartEdit}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Chỉnh sửa
                        </button>
                    )}
                </div>
            </div>

            {saveMessage && (
                <div className={`saveMessage ${saveMessage.type}`}>
                    {saveMessage.text}
                </div>
            )}

            <div className="recentListeningContainer">
                <h2>Lịch sử nghe gần đây</h2>
                {recentSongs.length > 0 ? (
                    <div className="recentSongsList">
                        {recentSongs.map((item) => (
                            <div
                                key={item.id}
                                className="recentSongItem"
                                onClick={(e) => listenSong && listenSong(e, item.id)}
                            >
                                <div className="recentSongImageWrapper">
                                    <img
                                        src={item.imageUrl || NoAvatar}
                                        alt={item.title}
                                        className="recentSongImage"
                                    />
                                    <div className="recentPlayButton">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M8 5v14l11-7z" fill="black" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="recentSongInfo">
                                    <div className="recentSongTitle">{item.title}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="chartEmpty">Không có lịch sử nghe</div>
                )}
            </div>

            <div className="listeningChartContainer">
                <h2>Thống kê thời lượng nghe</h2>
                <div className="daysButtonGroup">
                    {ranges.map((r) => (
                        <button
                            key={r}
                            className={`dayButton ${days === r ? 'active' : ''}`}
                            onClick={() => setDays(r)}>
                            {r} ngày gần nhất
                        </button>
                    ))}
                </div>

                {listeningData.length > 0 ? (
                    <ListeningChart data={listeningData} />
                ) : (
                    <div className="chartEmpty">Không có dữ liệu</div>
                )}
            </div>
        </div>
    );
};

export default ProfileView;
