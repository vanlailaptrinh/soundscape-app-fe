import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getPlaylistWithListSong } from '~/apis/songApi';
import { calculateTotalTime, formatDuration } from '~/util/timeUtils';
import { setReduxIsRight } from '~/redux/reducer/songNotWhitelistSlice';
import ControlListSong from '~/components/control/ControlListSong';
import NoAvatar from '~/assets/image/noAvatar.png';
import './PlaylistView.sass';

const PlaylistView = ({ playlistId, onPlayListSong, handleLibrarySong }) => {
    const dispatch = useDispatch();
    const [hoverIndex, setHoverIndex] = useState(null);
    const [playlistData, setPlaylistData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const currentIndex = useSelector((state) => state.song.reduxCurrentSongIndex);
    const reduxListSong = useSelector((state) => state.song.reduxListSong);
    const currentSongId = reduxListSong[currentIndex]?.song.id;
    const isPlaying = useSelector((state) => state.songNotWhite.reduxIsPlaying);

    useEffect(() => {
        const fetchPlaylistData = async () => {
            if (!playlistId) return;
            setIsLoading(true);
            try {
                const data = await getPlaylistWithListSong(playlistId);

                // Chuẩn hóa dữ liệu để phù hợp với cấu trúc của CenterHomePage
                // Nhưng vẫn giữ nguyên songAndArtistResponses vì mỗi bài hát có artist riêng
                const normalizedData = {
                    playlist: data.playlist,
                    songs: data.songAndArtistResponses?.map((item) => item.song) || [],
                    songAndArtistResponses: data.songAndArtistResponses || [],
                };

                setPlaylistData(normalizedData);
                dispatch(setReduxIsRight(false));
            } catch (err) {
                console.error('Error fetching playlist data:', err.response || err.message);
                setPlaylistData(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlaylistData();
    }, [playlistId, dispatch]);

    const handleMouseEnter = (index) => setHoverIndex(index);
    const handleMouseLeave = () => setHoverIndex(null);

    const handlePlaySong = (e, songId) => {
        if (!playlistData) return;

        const clickedSongIndex = playlistData.songs.findIndex((song) => song.id === songId);

        if (clickedSongIndex === -1) return;
        const clickedArtist = playlistData.songAndArtistResponses[clickedSongIndex]?.artist || null;

        const dataToSend = {
            songs: playlistData.songs,
            artist: clickedArtist,
            songAndArtistResponses: playlistData.songAndArtistResponses,
        };

        onPlayListSong(e, songId, dataToSend);
    };

    const renderPlayButton = (song, index) => {
        if (song.id === currentSongId && isPlaying) {
            return (
                <img
                    src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f5eb96f2.gif"
                    alt="Playing"
                    className="equalizerGif"
                />
            );
        }
        if (hoverIndex === index) return <FontAwesomeIcon icon={faPlay} />;
        return index + 1;
    };

    if (isLoading) return <div className="playlistContainer">Loading...</div>;
    if (!playlistData) return <div className="playlistContainer">Playlist not found</div>;

    const { playlist, songs, songAndArtistResponses } = playlistData;

    return (
        <div className="playlistContainer">
            {/* Header */}
            <div className="playlistHeader">
                <div className="playlistPicture">
                    <img src={playlist.imageUrl || NoAvatar} alt={playlist.name} />
                </div>
                <div className="playlistInfo">
                    <div className="playlistTitle">{playlist.name}</div>
                    <div className="playlistDetails">
                        <div className="playlistSongCount">{songs.length} song(s)</div>
                        <div className="playlistTotalTime">{calculateTotalTime(songs)}</div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="playlistBody">
                <ControlListSong isPlaying={isPlaying} onPlayListSong={handlePlaySong} listSong={songs} />

                <div className="songList">
                    {songAndArtistResponses.map((item, index) => (
                        <div
                            key={item.song.id || index}
                            className={`songItem ${item.song.id === currentSongId ? 'active' : ''}`}
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={handleMouseLeave}
                            onContextMenu={(e) => {
                                handleLibrarySong(e, [
                                    { type: 'playlist', id: item.song.id },
                                    { type: 'artist', id: item.artist?.id },
                                ]);
                            }}>
                            <div className="songRow">
                                <div className="songIndex">
                                    <button className="playButton" onClick={(e) => handlePlaySong(e, item.song.id)}>
                                        {renderPlayButton(item.song, index)}
                                    </button>
                                </div>
                                <div className="songImage">
                                    <img src={item.song.imageUrl || NoAvatar} alt={item.song.title} />
                                </div>
                                <div className="songInfo">
                                    <div className="songTitle">{item.song.title}</div>
                                    <div className="songArtist">{item.artist?.username || 'Unknown Artist'}</div>
                                </div>
                            </div>
                            <div className="songDuration">{formatDuration(item.song.duration)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PlaylistView;
