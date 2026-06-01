import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { getAlbumWithSongs } from '~/apis/songApi';
import { calculateTotalTime, formatDuration } from '~/util/timeUtils';
import { setReduxIsRight } from '~/redux/reducer/songNotWhitelistSlice';
import ControlListSong from '~/components/control/ControlListSong';
import './AlbumView.sass';

const AlbumView = ({ albumId, onPlayListSong, handleLibrarySong }) => {
    const dispatch = useDispatch();
    const [hoverIndex, setHoverIndex] = useState(null);
    const [albumData, setAlbumData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const currentIndex = useSelector((state) => state.song.reduxCurrentSongIndex);
    const reduxListSong = useSelector((state) => state.song.reduxListSong);
    const currentSongId = reduxListSong[currentIndex]?.song.id;
    const isPlaying = useSelector((state) => state.songNotWhite.reduxIsPlaying);

    // ================== FETCH ALBUM DATA ==================
    useEffect(() => {
        const fetchAlbumData = async () => {
            if (!albumId) return;

            setIsLoading(true);
            try {
                const data = await getAlbumWithSongs(albumId);
                setAlbumData(data);
                dispatch(setReduxIsRight(false));
            } catch (err) {
                console.error('Error fetching album data:', err);
                setAlbumData(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAlbumData();
    }, [albumId, dispatch]);

    // ================== HANDLERS ==================
    const handleMouseEnter = (index) => {
        setHoverIndex(index);
    };

    const handleMouseLeave = () => {
        setHoverIndex(null);
    };

    const handlePlaySong = (e, songId) => {
        if (!albumData) return;
        onPlayListSong(e, songId, albumData);
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
        if (hoverIndex === index) {
            return <FontAwesomeIcon icon={faPlay} />;
        }
        return index + 1;
    };

    if (isLoading) {
        return <div className="albumContainer">Loading...</div>;
    }

    if (!albumData) {
        return <div className="albumContainer">Album not found</div>;
    }

    const { album, artist, songs } = albumData;

    return (
        <div className="albumContainer">
            <div
                className="albumHeader"
                onContextMenu={(e) => {
                    handleLibrarySong(e, [
                        {
                            type: 'album',
                            id: albumId,
                        },
                        {
                            type: 'artist',
                            id: artist.id,
                        },
                    ]);
                }}>
                <div className="albumPicture">
                    <img src={album.coverUrl} alt={album.name} />
                </div>
                <div className="albumInfo">
                    <div className="albumTitle">{album.name}</div>
                    <div className="albumDetails">
                        <img className="albumUserAvatar" src={artist.urlAvatar} alt={artist?.username || 'Artist'} />
                        <div className="albumUserName">{artist?.username || 'No name'}</div>
                        <div className="albumSongCount">{songs.length} song(s)</div>
                        <div className="albumTotalTime">{calculateTotalTime(songs)}</div>
                    </div>
                </div>
            </div>

            <div className="albumBody">
                <ControlListSong isPlaying={isPlaying} onPlayListSong={handlePlaySong} listSong={songs} />

                <div className="songList">
                    {songs.map((song, index) => (
                        <div
                            key={song.id || index}
                            className={`songItem ${song.id === currentSongId ? 'active' : ''}`}
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={handleMouseLeave}
                            onContextMenu={(e) => {
                                handleLibrarySong(e, [
                                    { type: 'playlist', id: song.id },
                                    {
                                        type: 'album',
                                        id: albumId,
                                    },
                                ]);
                            }}>
                            <div className="songRow">
                                <div className="songIndex">
                                    <button className="playButton" onClick={(e) => handlePlaySong(e, song.id)}>
                                        {renderPlayButton(song, index)}
                                    </button>
                                </div>
                                <div className="songImage">
                                    <img src={song.imageUrl} alt={song.title} />
                                </div>
                                <div className="songInfo">
                                    <div className="songTitle">{song.title}</div>
                                    <div className="songArtist">
                                        {song.artistName || artist?.username || 'Unknown Artist'}
                                    </div>
                                </div>
                            </div>
                            <div className="songDuration">{formatDuration(song.duration)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AlbumView;
