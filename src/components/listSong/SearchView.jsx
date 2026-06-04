import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';

import NoAvatar from '~/assets/image/noAvatar.png';
import Slider from '~/components/slider/Slider';
import { setReduxLibrarySong } from '~/redux/reducer/songNotWhitelistSlice';
import { searchSongs } from '~/apis/songApi';
import './SearchView.sass';

const SearchView = ({ listenSong }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [searchData, setSearchData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const parts = location.pathname.split('/').filter(Boolean);
    const keyword = decodeURIComponent(parts[1] || '');

    useEffect(() => {
        const fetchSearchData = async () => {
            if (!keyword) return;
            setIsLoading(true);
            try {
                const data = await searchSongs(keyword);
                setSearchData(data);
            } catch (err) {
                console.error('Error fetching search:', err);
                setSearchData(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSearchData();
    }, [keyword]);

    const handlePlay = (e, song) => {
        e.stopPropagation();
        listenSong(e, song.id);
    };

    const handleContext = (e, payload) => {
        e.preventDefault();
        dispatch(setReduxLibrarySong(payload));
    };

    if (isLoading) return <div className="searchContainer">Loading...</div>;
    if (!searchData) return <div className="searchContainer">No results for {keyword}</div>;

    const { artists = [], albums = [], songs = [] } = searchData;

    return (
        <div className="searchContainer">
            <h2 className="searchHeader">Results for {keyword}</h2>

            {/* --- Songs --- */}
            {songs.length > 0 && (
                <div className="searchSection">
                    <div className="searchTitle">Songs</div>
                    <Slider>
                        {songs.map((song) => (
                            <div
                                key={song.id}
                                className="songItem"
                                onContextMenu={(e) =>
                                    handleContext(e, [
                                        { type: 'playlist', id: song.id },
                                        { type: 'artist', id: song.artistId },
                                    ])
                                }>
                                <div className="songImage">
                                    <img src={song.imageUrl || NoAvatar} alt={song.title} />
                                </div>
                                <div className="songTitle">{song.title}</div>
                                <div className="songArtist">
                                    {song.artistName || song.username || song.author}
                                    {song.collaborators && song.collaborators.length > 0 && (
                                        <span>{` ft. ${song.collaborators.map(c => c.username).join(', ')}`}</span>
                                    )}
                                </div>
                                <div className="songPlayButton" onClick={(e) => handlePlay(e, song)}>
                                    <FontAwesomeIcon icon={faPlay} />
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            )}

            {/* --- Artists --- */}
            {artists.length > 0 && (
                <div className="searchSection">
                    <div className="searchTitle">Artists</div>
                    <Slider>
                        {artists.map((artist, idx) => (
                            <div
                                key={idx}
                                className="artistItem"
                                onClick={() => navigate(`/artist/${artist.id}`)}
                                onContextMenu={(e) =>
                                    handleContext(e, [{ type: 'artist', id: artist.id || artist.userName }])
                                }>
                                <div className="artistImage">
                                    <img src={artist.urlAvatar || NoAvatar} alt={artist.username} />
                                </div>
                                <div className="artistName">{artist.username}</div>
                            </div>
                        ))}
                    </Slider>
                </div>
            )}

            {/* --- Albums --- */}
            {albums.length > 0 && (
                <div className="searchSection">
                    <div className="searchTitle">Albums</div>
                    <Slider>
                        {albums.map((album) => (
                            <div
                                key={album.id}
                                className="albumItem"
                                onClick={() => navigate(`/album/${album.id}`)}
                                onContextMenu={(e) =>
                                    handleContext(e, [
                                        { type: 'album', id: album.id },
                                        { type: 'artist', id: album.artistId },
                                    ])
                                }>
                                <div className="albumImage">
                                    <img src={album.coverUrl || NoAvatar} alt={album.name} />
                                </div>
                                <div className="albumName">{album.name}</div>
                                <div className="albumArtist">{album.username || 'Unknown'}</div>
                            </div>
                        ))}
                    </Slider>
                </div>
            )}

            {/* --- No results --- */}
            {artists.length === 0 && albums.length === 0 && songs.length === 0 && (
                <div className="noResults">No results found for “{keyword}”</div>
            )}
        </div>
    );
};

export default SearchView;
