import { useEffect, useState } from 'react';
import ListeningChart from '~/components/chart/ListeningChart';
import { getSongDailyStats } from '~/apis/songApi';

const ranges = {
    '30d': 30,
    '90d': 90,
    '180d': 180,
    '365d': 365,
};

const SongListeningChart = ({ songId, closeChart }) => {
    const [range, setRange] = useState('30d');
    const [stats, setStats] = useState([]);

    const loadStats = async () => {
        try {
            const days = ranges[range];
            const data = await getSongDailyStats(songId, days);
            setStats(data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    useEffect(() => {
        loadStats();
    }, [songId, range]);

    return (
        <div style={{ padding: '15px', color: '#fff' }}>
            <h3>Thống kê lượt nghe</h3>

            {/* Chọn khoảng ngày */}
            <div style={{ display: 'flex', gap: '10px', margin: '15px 0' }}>
                {Object.keys(ranges).map((key) => (
                    <button
                        key={key}
                        onClick={() => setRange(key)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            border: '1px solid #777',
                            background: range === key ? '#4A90E2' : '#222',
                            color: range === key ? '#fff' : '#ccc',
                        }}>
                        {ranges[key]} ngày
                    </button>
                ))}
            </div>

            {/* Biểu đồ */}
            <ListeningChart data={stats} />

            <button
                onClick={closeChart}
                style={{
                    marginTop: '20px',
                    padding: '8px 15px',
                    background: '#333',
                    color: '#fff',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}>
                Đóng
            </button>
        </div>
    );
};

export default SongListeningChart;
