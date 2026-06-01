import { useEffect, useState } from 'react';
import { getSongDetail, banSong, unblockSong } from '~/apis/songApi';
import NoAvatar from '~/assets/image/noAvatar.png';
import './SongDetail.sass';

const SongDetail = ({ songId, closeRightPanel, setRefreshFlag, openChart }) => {
    const [song, setSong] = useState(null);
    const [loading, setLoading] = useState(true);

    async function reload() {
        const data = await getSongDetail(songId);
        setSong(data);
    }

    useEffect(() => {
        if (!songId) return;
        setLoading(true);
        setSong(null);

        async function fetchDetail() {
            await reload();
            setLoading(false);
        }

        fetchDetail();
    }, [songId]);

    const handleBan = async () => {
        await banSong(songId);
        await reload();
        setRefreshFlag((prev) => !prev);
    };

    const handleUnblock = async () => {
        await unblockSong(songId);
        await reload();
        setRefreshFlag((prev) => !prev);
    };

    if (loading) {
        return (
            <div className="songDetailContainer">
                <p style={{ textAlign: 'center' }}>Đang tải...</p>
            </div>
        );
    }

    if (!song) {
        return (
            <div className="songDetailContainer">
                <p style={{ textAlign: 'center' }}>Không tìm thấy bài hát</p>
            </div>
        );
    }

    return (
        <div className="songDetailContainer">
            <div className="songDetailThumbnail">
                <img src={song.imageUrl || NoAvatar} alt={song.title} />
            </div>

            <div className="songDetailInfo">
                <h3>{song.title}</h3>
                <p className="songDetailAuthor">
                    Tác giả: <strong>{song.author}</strong>
                </p>

                <div className="songDetailSection">
                    <label>Thể loại:</label>
                    {song.genres?.length > 0 ? (
                        <div className="genreList">
                            {song.genres.map((g) => (
                                <span key={g} className="genreBadge">
                                    {g}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className="genreBadge none">NONE</span>
                    )}
                </div>

                <div className="songDetailSection">
                    <label>Trạng thái:</label>
                    <span className={`statusBadge ${song.status.toLowerCase()}`}>{song.status}</span>
                </div>

                <div className="songDetailSection">
                    <label>Lượt nghe:</label>
                    <span>{song.playCount}</span>
                    <button
                        className="chartBtn"
                        onClick={() => openChart(songId)}
                        style={{
                            marginLeft: '10px',
                            padding: '5px 10px',
                            background: '#4A90E2',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#fff',
                            cursor: 'pointer',
                        }}>
                        Xem biểu đồ
                    </button>
                </div>

                <div className="songDetailSection">
                    <label>Rating TB:</label>
                    <span>
                        {song.ratingAvg.toFixed(1)} ({song.ratingCount})
                    </span>
                </div>

                <div className="songDetailSection">
                    <label>Ngày tạo:</label>
                    <span>{new Date(song.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>

                <div className="songDetailSection">
                    <label>Người đăng:</label>
                    <span>
                        {song.authUsername} (id: {song.authId})
                    </span>
                </div>
            </div>

            <div className="songDetailActions">
                {song.status === 'ACTIVE' && (
                    <button className="banBtn" onClick={handleBan}>
                        Banned
                    </button>
                )}

                {song.status === 'BANNED' && (
                    <button className="unblockBtn" onClick={handleUnblock}>
                        Unblock
                    </button>
                )}

                <button className="closeBtn" onClick={closeRightPanel}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default SongDetail;
