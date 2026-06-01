import { useEffect, useState } from 'react';
import NoAvatar from '~/assets/image/noAvatar.png';
import { getMyProfile, getMyListeningDaily } from '~/apis/songApi';
import ListeningChart from '~/components/chart/ListeningChart';
import './ProfileView.sass';

const ProfileView = () => {
    const [profile, setProfile] = useState(null);
    const [listeningData, setListeningData] = useState([]);
    const [days, setDays] = useState(30);

    const fetchListeningData = async (d) => {
        try {
            const res = await getMyListeningDaily(d);
            setListeningData(res);
        } catch (err) {
            console.error('Daily listening fetch failed:', err);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                const data = await getMyProfile();
                setProfile(data);
                fetchListeningData(days);
            } catch (err) {
                console.error(err);
            }
        };
        init();
    }, []);

    useEffect(() => {
        fetchListeningData(days);
    }, [days]);

    if (!profile) return <div className="profileLoading">Đang tải...</div>;

    const ranges = [30, 90, 180, 365];

    return (
        <div className="profilePage">
            <div className="profileHeader">
                <img src={profile?.urlAvatar || NoAvatar} alt="Avatar" className="profileAvatar" />
                <div className="profileInfo">
                    <div className="profileUsername">{profile?.username}</div>
                </div>
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
