import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';

import NoAvatar from '~/assets/image/noAvatar.png';
import { setReduxLibrarySong } from '~/redux/reducer/songNotWhitelistSlice';
import { getMySongs, getMyAlbums, createAlbum } from '~/apis/songApi';
import CreatePopup from '~/components/popup/CreatePopup';
import './YourMusic.sass';

const YourMusic = ({ listenSong }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);

    const handlePlay = (e, song) => {
        e.stopPropagation();
        listenSong(e, song.id);
    };

    const handleContext = (e, payload) => {
        e.preventDefault();
        dispatch(setReduxLibrarySong(payload));
    };

    const reduxRefresh = useSelector((state) => state.songNotWhite.reduxRefresh);
    useEffect(() => {
        const fetchSongsAndAlbums = async () => {
            setIsLoading(true);
            try {
                const [songsRes, albumsRes] = await Promise.all([getMySongs(), getMyAlbums()]);
                setSongs(songsRes || []);
                setAlbums(albumsRes || []);
            } catch (err) {
                console.error('Failed to load music:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSongsAndAlbums();
    }, []); // chỉ chạy 1 lần khi component mount

    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const albumsRes = await getMyAlbums();
                setAlbums(albumsRes || []);
            } catch (err) {
                console.error('Failed to reload albums:', err);
            }
        };
        fetchAlbums();
    }, [reduxRefresh]);

    // Tạo album mới
    const handleCreateAlbum = async (data) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('fileCover', data.coverFile);
        await createAlbum(formData);

        const albumsRes = await getMyAlbums();
        setAlbums(albumsRes || []);
    };

    if (isLoading) return <div className="yourMusicContainer">Loading...</div>;

    return (
        <div className="yourMusicContainer">
            {/* --- SONGS SECTION --- */}
            <div className="header">
                <h2 className="yourMusicHeader">Your Songs</h2>
                <button className="uploadButton" onClick={() => navigate('/song/upload')}>
                    Upload New Song
                </button>
            </div>

            {songs.length === 0 ? (
                <div className="yourMusicSection empty">You have no songs yet.</div>
            ) : (
                <div className="yourMusicSection">
                    {songs.map((song) => (
                        <div
                            key={song.id}
                            className="yourMusicCard"
                            onContextMenu={(e) => handleContext(e, [{ type: 'addSongPlaylist', id: song.id }])}>
                            <div className="yourMusicImage">
                                <img src={song.imageUrl || NoAvatar} alt={song.title} />
                            </div>
                            <div className="yourMusicTitle">{song.title}</div>
                            <div className="yourMusicArtist" onClick={() => navigate(`/artist/${song.artistId}`)}>
                                {song.artistName || 'Unknown Artist'}
                                {song.collaborators && song.collaborators.length > 0 && (
                                    <span>{` ft. ${song.collaborators.map(c => c.username).join(', ')}`}</span>
                                )}
                            </div>
                            <div className="yourMusicPlayButton" onClick={(e) => handlePlay(e, song)}>
                                <FontAwesomeIcon icon={faPlay} />
                            </div>

                            <button className="yourMusicStatsButton" onClick={() => navigate(`/song/${song.id}/stats`)}>
                                View Stats
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* --- ALBUMS SECTION --- */}
            <div className="header" style={{ marginTop: '40px' }}>
                <h2 className="yourMusicHeader">Your Albums</h2>
                <button className="uploadButton" onClick={() => setShowPopup(true)}>
                    Create New Album
                </button>
            </div>

            {albums.length === 0 ? (
                <div className="yourMusicSection empty">You have no albums yet.</div>
            ) : (
                <div className="yourMusicSection">
                    {albums.map((album) => (
                        <div
                            key={album.id}
                            className="yourMusicCard"
                            onClick={() => navigate(`/album/${album.id}`)}
                            onContextMenu={(e) => handleContext(e, [{ type: 'deleAlbum', id: album.id }])}>
                            <div className="yourMusicImage">
                                <img src={album.coverUrl || NoAvatar} alt={album.name} />
                            </div>
                            <div className="yourMusicTitle">{album.name}</div>
                            <div className="yourMusicArtist">{album.description || 'No description'}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- POPUP TẠO ALBUM --- */}
            {showPopup && (
                <CreatePopup
                    type="album"
                    mess="Add new album"
                    onClose={() => setShowPopup(false)}
                    onSubmit={handleCreateAlbum}
                />
            )}
        </div>
    );
};

export default YourMusic;
