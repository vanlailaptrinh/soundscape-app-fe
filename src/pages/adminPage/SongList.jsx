import { useEffect, useState } from 'react';
import { getAllSongsAdmin } from '~/apis/songApi';
import Pagination from '~/components/pagination/Pagination';
import './SongList.sass';

const SongList = ({ onSelectSong, refreshFlag }) => {
    const [songs, setSongs] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [pages, setPages] = useState(0);

    const [sortField, setSortField] = useState('id');
    const [sortDir, setSortDir] = useState('asc');

    const [loading, setLoading] = useState(true);

    const fetchSongs = async () => {
        try {
            setLoading(true);
            const sortParam = `${sortField},${sortDir}`;
            const data = await getAllSongsAdmin(page, size, sortParam);

            setSongs(data.content);
            setPages(data.page);
        } catch (err) {
            console.error('Failed to fetch songs:', err);
        } finally {
            setTimeout(() => setLoading(false), 150);
        }
    };

    useEffect(() => {
        fetchSongs();
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
        <div className="songListContainer">
            <div className="songListHeader">
                <h2>Quản lý Bài hát</h2>
            </div>

            <div className="songListTable">
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
                                onClick={() => handleSortClick('title')}
                                className={sortField === 'title' ? 'active' : ''}>
                                <div className="thContent">
                                    <span>Tiêu đề</span>
                                    <span className="sortIcon">
                                        {sortField === 'title' ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                                    </span>
                                </div>
                            </th>

                            <th
                                onClick={() => handleSortClick('artistEmail')}
                                className={sortField === 'artistEmail' ? 'active' : ''}>
                                <div className="thContent">
                                    <span>Nghệ sĩ (Email)</span>
                                    <span className="sortIcon">
                                        {sortField === 'artistEmail' ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
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
                        {songs.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center' }}>
                                    Không có dữ liệu
                                </td>
                            </tr>
                        ) : (
                            songs.map((song) => (
                                <tr key={song.id}>
                                    <td>{song.id}</td>
                                    <td>{song.title}</td>
                                    <td>{song.artistEmail}</td>

                                    <td>
                                        <span className={`statusBadge ${song.status.toLowerCase()}`}>
                                            {song.status}
                                        </span>
                                    </td>

                                    <td>
                                        <button className="viewBtn" onClick={() => onSelectSong(song.id)}>
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

export default SongList;
