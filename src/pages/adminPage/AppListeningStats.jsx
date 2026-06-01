import React, { useEffect, useState } from 'react';
import { getAppListeningStats } from '~/apis/songApi';
import './AppListeningStats.sass';
import { Line } from 'react-chartjs-2';

const ranges = {
    '30d': 30,
    '90d': 90,
    '180d': 180,
    '365d': 365,
};

const AppListeningStats = ({ openChart }) => {
    const [range, setRange] = useState('30d');
    const [chartData, setChartData] = useState(null);
    const [topSongs, setTopSongs] = useState([]);

    const fetchStats = async () => {
        const days = ranges[range];
        const res = await getAppListeningStats(days);

        setChartData(res.data.chart);
        setTopSongs(res.data.topSongs);
    };

    useEffect(() => {
        fetchStats();
    }, [range]);

    return (
        <div className="appStats">
            <h2>Thống kê nghe nhạc toàn ứng dụng</h2>

            {/* --- Nút chọn khoảng thời gian --- */}
            <div className="timeRangeButtons">
                {Object.keys(ranges).map((key) => (
                    <button key={key} className={range === key ? 'activeRange' : ''} onClick={() => setRange(key)}>
                        {ranges[key]} ngày gần nhất
                    </button>
                ))}
            </div>

            {/* ----- Biểu đồ tổng lượt nghe ----- */}
            <div className="statsChartWrapper">
                {chartData ? (
                    <Line
                        data={{
                            labels: chartData.map((item) => item.date),
                            datasets: [
                                {
                                    label: 'Tổng lượt nghe',
                                    data: chartData.map((item) => item.count),
                                    borderWidth: 2,
                                    borderColor: '#4A90E2',
                                    backgroundColor: 'rgba(74,144,226,0.2)',
                                },
                            ],
                        }}
                    />
                ) : (
                    <p>Đang tải biểu đồ...</p>
                )}
            </div>

            {/* ----- Top Songs ----- */}
            <h3>Top 10 bài hát nghe nhiều nhất</h3>
            <table className="topSongsTable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên bài hát</th>
                        <th>Nghệ sĩ</th>
                        <th>Lượt nghe</th>
                        <th>Biểu đồ</th>
                    </tr>
                </thead>

                <tbody>
                    {topSongs.map((song, index) => (
                        <tr key={song.songId}>
                            <td>{index + 1}</td>
                            <td>{song.title}</td>
                            <td>{song.artist}</td>
                            <td>{song.listeningCount.toLocaleString()}</td>
                            <td>
                                <button className="chartBtn" onClick={() => openChart(song.songId)}>
                                    Xem biểu đồ
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AppListeningStats;
