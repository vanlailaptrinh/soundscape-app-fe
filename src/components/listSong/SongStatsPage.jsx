import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSongDailyStats } from '~/apis/songApi';
import ListeningChart from '~/components/chart/ListeningChart';
import './SongStatsPage.sass';

const ranges = {
    '30d': 30,
    '90d': 90,
    '180d': 180,
    '365d': 365,
};

export default function SongStatsPage() {
    const { songId } = useParams();
    const navigate = useNavigate();

    const [range, setRange] = useState('30d');
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const days = ranges[range];
            const data = await getSongDailyStats(songId, days);
            setStats(data);
        } catch (err) {
            console.error('Failed to load song stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [songId, range]);

    return (
        <div className="songStatsContainer">
            <button className="backBtn" onClick={() => navigate(-1)}>
                ← Back
            </button>

            <h2 className="title">Song Listening Statistics</h2>

            {/* --- Nút chọn khoảng ngày hiển thị rõ ràng --- */}
            <div className="rangeSelector">
                {Object.keys(ranges).map((key) => (
                    <button
                        key={key}
                        className={`rangeButton ${range === key ? 'active' : ''}`}
                        onClick={() => setRange(key)}>
                        {ranges[key]} ngày gần nhất
                    </button>
                ))}
            </div>

            {loading ? (
                <p>Loading chart...</p>
            ) : (
                <div className="chartWrapper">
                    <ListeningChart data={stats} />
                </div>
            )}
        </div>
    );
}
