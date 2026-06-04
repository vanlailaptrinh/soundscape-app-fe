import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import NoAvatar from '~/assets/image/noAvatar.png';
import { getArtistWithSongsAndAlbums } from '~/apis/songApi';
import { formatDuration, calculateTotalTime } from '~/util/timeUtils';
import { setReduxIsRight } from '~/redux/reducer/songNotWhitelistSlice';
import ControlListSong from '~/components/control/ControlListSong';
import { useNavigate } from 'react-router-dom';
import './ArtistSongList.sass';

const ArtistSongList = ({ artistId, onPlayListSong, handleLibrarySong }) => {
    const [hoverIndex, setHoverIndex] = useState(null);
    const [artistData, setArtistData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const currentIndex = useSelector((state) => state.song.reduxCurrentSongIndex);
    const reduxListSong = useSelector((state) => state.song.reduxListSong);
    const currentSongId = reduxListSong[currentIndex]?.song.id;
    const isPlaying = useSelector((state) => state.songNotWhite.reduxIsPlaying);

    // ================== FETCH ARTIST DATA ==================
    useEffect(() => {
        const fetchArtistData = async () => {
            if (!artistId) return;

            setIsLoading(true);
            try {
                const data = await getArtistWithSongsAndAlbums(artistId);
                setArtistData(data);
                dispatch(setReduxIsRight(false));
            } catch (err) {
                setArtistData(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArtistData();
    }, [artistId, dispatch]);

    const handleMouseEnter = (index) => setHoverIndex(index);
    const handleMouseLeave = () => setHoverIndex(null);
    const handlePlaySong = (e, songId) => artistData && onPlayListSong(e, songId, artistData);

    const renderPlayButton = (song, index) => {
        if (song.id === currentSongId && isPlaying) {
            return (
                <img
                    src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f5eb96f2.gif"
                    alt="Playing"
                    className="artistEqualizerGif"
                />
            );
        }
        if (hoverIndex === index) return <FontAwesomeIcon icon={faPlay} />;
        return index + 1;
    };

    if (isLoading)
        return (
            <div className="artistContainer" style={{ padding: '50px', textAlign: 'center' }}>
                <h2>Loading...</h2>
            </div>
        );
    if (!artistData)
        return (
            <div className="artistContainer" style={{ padding: '50px', textAlign: 'center' }}>
                <h2>Artist not found</h2>
            </div>
        );

    const { album = [], artist, songs = [] } = artistData;
    const selectedAlbum = album[0]; // chỉ dùng album đầu tiên
    const displayedSongs = songs;

    return (
        <div className="artistContainer">
            <div
                className="artistHeader"
                onContextMenu={(e) => {
                    handleLibrarySong(e, [
                        {
                            type: 'artist',
                            id: artistId,
                        },
                    ]);
                }}>
                <div className="artistPicture">
                    <img src={artist?.urlAvatar || NoAvatar} alt={artist?.urlAvatar} />
                </div>
                <div className="artistInfo">
                    <div className="artistTitle">{artist?.username || artist?.email || 'No name'}</div>
                    <div className="artistDetails">
                        <div className="artistSongCount">{displayedSongs.length} song(s)</div>
                        <div className="artistTotalTime">{calculateTotalTime(displayedSongs)}</div>
                    </div>
                </div>
            </div>

            <div className="artistBody">
                <ControlListSong isPlaying={isPlaying} onPlayListSong={handlePlaySong} listSong={songs} />
                <h2 className="title">Song</h2>
                <div className="artistSongList">
                    {displayedSongs.length === 0 ? (
                        <div className="artistNoSongs">No songs available</div>
                    ) : (
                        displayedSongs.map((song, index) => (
                            <div
                                key={song.id || index}
                                className={`artistSongItem ${song.id === currentSongId ? 'active' : ''}`}
                                onMouseEnter={() => handleMouseEnter(index)}
                                onMouseLeave={handleMouseLeave}
                                onContextMenu={(e) => {
                                    handleLibrarySong(e, [
                                        { type: 'playlist', id: song.id },
                                        {
                                            type: 'artist',
                                            id: artistId,
                                        },
                                    ]);
                                }}>
                                <div className="artistSongRow">
                                    <div className="artistSongIndex">
                                        <button
                                            className="artistPlayButton"
                                            onClick={(e) => handlePlaySong(e, song.id)}>
                                            {renderPlayButton(song, index)}
                                        </button>
                                    </div>
                                    <div className="artistSongImage">
                                        <img src={song.imageUrl || NoAvatar} alt={song.title || 'Song'} />
                                    </div>
                                    <div className="artistSongInfo">
                                        <div className="artistSongTitle">{song.title || song.author || 'Untitled'}</div>
                                        <div className="artistSongArtist">
                                            {song.author || artist?.username || artist?.email || 'Unknown Artist'}
                                            {song.collaborators && song.collaborators.length > 0 && (
                                                <span>{` ft. ${song.collaborators.map(c => c.username).join(', ')}`}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="artistSongDuration">{formatDuration(song.duration)}</div>
                            </div>
                        ))
                    )}
                </div>
                <div className="artistAlbumList">
                    {album.length > 1 && (
                        <>
                            <h2>Album</h2>
                            <div className="artistAlbumTabs">
                                {album.map((alb) => (
                                    <div
                                        key={alb.id}
                                        className="albumTab"
                                        onClick={() => navigate(`/album/${alb.id}`)}
                                        onContextMenu={(e) => {
                                            handleLibrarySong(e, [
                                                { type: 'album', id: alb.id },
                                                {
                                                    type: 'artist',
                                                    id: artistId,
                                                },
                                            ]);
                                        }}>
                                        {alb.coverUrl && <img src={alb.coverUrl || NoAvatar} alt={alb.name} />}
                                        <span>{alb.name}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArtistSongList;
