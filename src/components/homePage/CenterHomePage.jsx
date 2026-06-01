import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Slider from '~/components/slider/Slider';
import {
    getListeningHistory,
    getSongAndArtistBySongId,
    getTrendingAlbums,
    getTrendingArtists,
    getTrendingSongs,
    getRecommendSongs,
} from '~/apis/songApi';
import { setReduxIsPlaying, setReduxIsRight, setReduxLibrarySong } from '~/redux/reducer/songNotWhitelistSlice';
import { addNextSong, addSongList, clearSongs, setReduxCurrentSongIndex } from '~/redux/reducer/songSlice';
import NoAvatar from '~/assets/image/noAvatar.png';
import AlbumView from '~/components/listSong/AlbumView';
import ArtistSongList from '~/components/listSong/ArtistSongList';
import Playlist from '~/components/listSong/Playlist';
import SearchView from '~/components/listSong/SearchView';
import YourMusic from '~/components/listSong/YourMusic';
import useDailyFeedback from '~/components/popup/useDailyFeedback';
import FeedbackPopup from '~/components/popup/FeedbackPopup';
import ProfileView from '~/components/listSong/ProfileView';
import './CenterHomePage.sass';

const CenterHomePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const reduxIsRight = useSelector((state) => state.songNotWhite.reduxIsRight);
    const reduxIsPlaying = useSelector((state) => state.songNotWhite.reduxIsPlaying);
    const isLogin = useSelector((state) => state.auth.reduxIsLogin);
    const reduxSongs = useSelector((state) => state.song.reduxSongs);
    const reduxCurrentSongIndex = useSelector((state) => state.song.reduxCurrentSongIndex);

    const [trendingSongs, setTrendingSongs] = useState([]);
    const [topAlbums, setTopAlbums] = useState([]);
    const [topArtists, setTopArtists] = useState([]);
    const [listeningHistory, setListeningHistory] = useState([]);
    const [recommendSongs, setRecommendSongs] = useState([]);
    const [pageType, setPageType] = useState(null);
    const [pageId, setPageId] = useState(null);

    const { canShow, markShown } = useDailyFeedback();
    const [showFeedback, setShowFeedback] = useState(false);
    const [lastWasRecommended, setLastWasRecommended] = useState(false);
    const [prevSongId, setPrevSongId] = useState(null);
    const lastPlayedRecommendedRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const requests = [getTrendingSongs(), getTrendingAlbums(), getTrendingArtists()];

                if (isLogin) {
                    requests.push(getRecommendSongs());
                }

                const results = await Promise.allSettled(requests);

                const [songs, albums, artists, recommend] = results;

                if (songs?.status === 'fulfilled') setTrendingSongs(songs.value);
                if (albums?.status === 'fulfilled') setTopAlbums(albums.value);
                if (artists?.status === 'fulfilled') setTopArtists(artists.value);

                if (isLogin && recommend?.status === 'fulfilled') {
                    setRecommendSongs(recommend.value);
                } else {
                    setRecommendSongs([]);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
            }
        };

        fetchData();
    }, [location.pathname, isLogin]);

    const updateHistory = useCallback(async () => {
        if (!isLogin) return;
        try {
            const history = await getListeningHistory();
            setListeningHistory([...history]);
        } catch (err) {
            console.error('Error fetching history:', err);
        }
    }, [isLogin]);

    useEffect(() => {
        if (isLogin) updateHistory();
    }, [reduxCurrentSongIndex, isLogin, updateHistory]);

    useEffect(() => {
        const currentSong = reduxSongs?.[reduxCurrentSongIndex]?.song;
        if (currentSong?.id) {
            setPrevSongId(currentSong.id);
        }
    }, [reduxCurrentSongIndex, reduxSongs]);

    const listenSong = useCallback(
        async (e, songId, isRecommended = false) => {
            e.stopPropagation();
            dispatch(clearSongs());
            try {
                const res = await getSongAndArtistBySongId(songId);
                dispatch(addNextSong(res));
                dispatch(setReduxCurrentSongIndex(0));
                dispatch(setReduxIsRight(true));
                dispatch(setReduxIsPlaying(true));

                await updateHistory();

                if (isRecommended) {
                    lastPlayedRecommendedRef.current = songId;
                    setLastWasRecommended(true);
                } else {
                    lastPlayedRecommendedRef.current = null;
                    setLastWasRecommended(false);
                }
            } catch (err) {
                console.error('Error playing song:', err);
            }
        },
        [dispatch, updateHistory]
    );

    const [finishedSongId, setFinishedSongId] = useState(null);
    useEffect(() => {
        if (!reduxIsPlaying && lastWasRecommended && canShow && lastPlayedRecommendedRef.current) {
            const songId =
                prevSongId || reduxSongs?.[reduxCurrentSongIndex]?.song?.id || lastPlayedRecommendedRef.current;
            setFinishedSongId(songId);
            setShowFeedback(true);
            markShown();

            setLastWasRecommended(false);
            lastPlayedRecommendedRef.current = null;
        }
    }, [reduxIsPlaying, lastWasRecommended, canShow, markShown, prevSongId, reduxSongs, reduxCurrentSongIndex]);

    const mergeArtistToSong = useCallback((data) => {
        return data.songs.map((song) => ({
            song: { ...song },
            artist: data.artist,
        }));
    }, []);

    const playListSong = useCallback(
        async (e, songId, dataSource) => {
            e.stopPropagation();
            if (!dataSource) return;

            const currentIndex = dataSource.songs.findIndex((song) => song.id === songId);
            if (currentIndex === -1) return;

            dispatch(clearSongs());
            dispatch(
                addSongList({
                    songs: mergeArtistToSong(dataSource),
                    currentIndex,
                })
            );
            dispatch(setReduxIsRight(true));
            dispatch(setReduxIsPlaying(true));

            await updateHistory();
        },
        [dispatch, mergeArtistToSong, updateHistory]
    );

    useEffect(() => {
        const path = location.pathname;
        const parts = path.split('/').filter(Boolean);

        if (parts.length >= 1) {
            setPageType(parts[0]);
            setPageId(parts[1] || null);
        } else {
            setPageType(null);
            setPageId(null);
        }
    }, [location.pathname]);

    const handleLibrarySong = (e, payload) => {
        e.preventDefault();
        dispatch(setReduxLibrarySong(payload));
    };

    const renderContent = () => {
        switch (pageType) {
            case 'album':
                return (
                    <AlbumView
                        albumId={Number(pageId)}
                        onPlayListSong={playListSong}
                        handleLibrarySong={handleLibrarySong}
                    />
                );
            case 'artist':
                return (
                    <ArtistSongList
                        artistId={Number(pageId)}
                        onPlayListSong={playListSong}
                        handleLibrarySong={handleLibrarySong}
                    />
                );
            case 'playlist':
                return (
                    <Playlist
                        playlistId={Number(pageId)}
                        onPlayListSong={playListSong}
                        handleLibrarySong={handleLibrarySong}
                    />
                );
            case 'profile':
                return <ProfileView />;
            case 'search':
                return <SearchView listenSong={listenSong} />;
            case 'your-music':
                return <YourMusic listenSong={listenSong} />;
            default:
                return (
                    <>
                        {isLogin && listeningHistory.length > 0 && (
                            <div className="listeningHistoryContainer">
                                <div className="listeningHistoryTitle">Listening History</div>
                                <div className="listeningHistoryList">
                                    {listeningHistory.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`historyItem ${reduxIsRight ? 'rightActive' : ''}`}
                                            onClick={(e) => listenSong(e, item.id)}
                                            onContextMenu={(e) => {
                                                handleLibrarySong(e, [
                                                    { type: 'playlist', id: item.id },
                                                    { type: 'artist', id: item.artistId },
                                                ]);
                                            }}>
                                            <div className="historyImage">
                                                <img src={item.imageUrl || NoAvatar} alt={item.title} />
                                            </div>
                                            <div className="nameHistorySong">{item.title}</div>
                                            <div className="playHistoryButton">
                                                <FontAwesomeIcon icon={faPlay} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="trendingContainer">
                            <div className="trendingTitle">Trending Songs</div>
                            <Slider>
                                {trendingSongs?.map((song) => (
                                    <div
                                        key={song.id}
                                        className="trendingSongItem"
                                        onContextMenu={(e) => {
                                            handleLibrarySong(e, [
                                                { type: 'playlist', id: song.id },
                                                { type: 'artist', id: song.artistId },
                                            ]);
                                        }}>
                                        <div className="trendingSongImage">
                                            <img src={song.imageUrl || NoAvatar} alt={song.title} />
                                        </div>
                                        <div className="trendingSongTitle">{song.title}</div>
                                        <p className="trendingSongArtist">{song.username || 'No name'}</p>
                                        <div className="trendingPlayButton" onClick={(e) => listenSong(e, song.id)}>
                                            <FontAwesomeIcon icon={faPlay} />
                                        </div>
                                    </div>
                                ))}
                            </Slider>
                        </div>

                        <div className="topAlbumsContainer">
                            <div className="topAlbumsHeader">
                                <div className="topAlbumsTitle">Top Albums</div>
                                <div className="viewAllAlbums">View All</div>
                            </div>
                            <Slider>
                                {topAlbums?.map((album) => (
                                    <div
                                        key={album.id}
                                        className="albumItem"
                                        onClick={() => navigate(`/album/${album.id}`)}
                                        onContextMenu={(e) => {
                                            handleLibrarySong(e, [
                                                { type: 'album', id: album.id },
                                                { type: 'artist', id: album.artistId },
                                            ]);
                                        }}>
                                        <div className="albumImage">
                                            <img src={album.coverUrl} alt={album.name} />
                                        </div>
                                        <div className="albumName">{album.name}</div>
                                        <div className="albumArtist">{album.username || 'No name'}</div>
                                    </div>
                                ))}
                            </Slider>
                        </div>

                        <div className="topArtistController">
                            <div className="topArtsHeader">
                                <div className="topArtistTitle">Top Artists</div>
                                <div className="viewAllArtists">View All</div>
                            </div>
                            <Slider>
                                {topArtists.map((artist) => (
                                    <div
                                        key={artist.id}
                                        className="artistItem"
                                        onClick={() => navigate(`/artist/${artist.id}`)}
                                        onContextMenu={(e) => {
                                            handleLibrarySong(e, [{ type: 'artist', id: artist.id }]);
                                        }}>
                                        <div className="artistImage">
                                            <img src={artist.urlAvatar} alt={artist.username} />
                                        </div>
                                        <div className="artistName">{artist.username || 'No name'}</div>
                                    </div>
                                ))}
                            </Slider>
                        </div>

                        {isLogin && recommendSongs.length > 0 && (
                            <div className="recommendContainer">
                                <div className="recommendTitle">You might like</div>
                                <Slider>
                                    {recommendSongs.map((song) => (
                                        <div
                                            key={song.id}
                                            className="recommendSongItem"
                                            onContextMenu={(e) => {
                                                handleLibrarySong(e, [
                                                    { type: 'playlist', id: song.id },
                                                    { type: 'artist', id: song.artistId },
                                                ]);
                                            }}>
                                            <div className="recommendSongImage">
                                                <img src={song.imageUrl || NoAvatar} alt={song.title} />
                                            </div>
                                            <div className="recommendSongTitle">{song.title}</div>
                                            <p className="recommendSongArtist">{song.username || 'No name'}</p>
                                            <div
                                                className="recommendPlayButton"
                                                onClick={(e) => listenSong(e, song.id, true)}>
                                                <FontAwesomeIcon icon={faPlay} />
                                            </div>
                                        </div>
                                    ))}
                                </Slider>
                            </div>
                        )}

                        {showFeedback && (
                            <FeedbackPopup
                                songId={finishedSongId}
                                source={'hyper'}
                                forceShow={showFeedback}
                                onClose={() => setShowFeedback(false)}
                            />
                        )}
                    </>
                );
        }
    };

    return <div className={`centerHomePage ${reduxIsRight ? 'rightActive' : ''}`}>{renderContent()}</div>;
};

export default CenterHomePage;
