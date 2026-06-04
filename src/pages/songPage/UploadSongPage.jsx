import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { uploadSong, getAllSongGenres, getAllArtists } from '~/apis/songApi';
import Navigation from '~/components/navs/Navigation';
import './UploadSongPage.sass';

const UploadSongPage = () => {
    const currentUser = useSelector((state) => state.auth.reduxUser);

    const [fileMedia, setFileMedia] = useState(null);
    const [fileImage, setFileImage] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isVideo, setIsVideo] = useState(false);

    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [singer, setSinger] = useState('');
    const [albumId, setAlbumId] = useState('');
    const [genreIds, setGenreIds] = useState([]);
    const [genres, setGenres] = useState([]);
    
    const [artists, setArtists] = useState([]);
    const [collaboratorIds, setCollaboratorIds] = useState([]);

    const [errorTitle, setErrorTitle] = useState('');
    const [errorAuthor, setErrorAuthor] = useState('');
    const [status, setStatus] = useState('idle'); // idle | loading | success | error

    const [dragOverMedia, setDragOverMedia] = useState(false);
    const [dragOverImage, setDragOverImage] = useState(false);

    const processMediaFile = (file) => {
        if (!file) return;
        if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) return;
        setFileMedia(file);
        const url = URL.createObjectURL(file);
        setMediaPreview(url);
        setIsVideo(file.type.startsWith('video/'));
    };

    const processImageFile = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) return;
        setFileImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleMediaClick = () => document.getElementById('media-input').click();
    const handleImageClick = () => document.getElementById('image-input').click();
    const handleMediaChange = (e) => {
        processMediaFile(e.target.files[0]);
        e.target.value = null;
    };
    const handleImageChange = (e) => {
        processImageFile(e.target.files[0]);
        e.target.value = null;
    };

    const handleMediaDrop = (e) => {
        e.preventDefault();
        setDragOverMedia(false);
        processMediaFile(e.dataTransfer.files[0]);
    };
    const handleImageDrop = (e) => {
        e.preventDefault();
        setDragOverImage(false);
        processImageFile(e.dataTransfer.files[0]);
    };
    const handleDragOver = (e) => e.preventDefault();
    const handleMediaDragEnter = (e) => {
        e.preventDefault();
        setDragOverMedia(true);
    };
    const handleMediaDragLeave = () => setDragOverMedia(false);
    const handleImageDragEnter = (e) => {
        e.preventDefault();
        setDragOverImage(true);
    };
    const handleImageDragLeave = () => setDragOverImage(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        let hasError = false;
        setErrorTitle('');
        setErrorAuthor('');

        if (!title.trim()) {
            setErrorTitle('Vui lòng nhập tiêu đề bài hát.');
            hasError = true;
        }
        if (!author.trim()) {
            setErrorAuthor('Vui lòng nhập tên tác giả.');
            hasError = true;
        }
        if (!fileMedia) {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
            return;
        }
        if (hasError) {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
            return;
        }

        setStatus('loading');
        try {
            const formData = new FormData();
            formData.append('fileMedia', fileMedia);
            if (fileImage) formData.append('fileImage', fileImage);
            formData.append('title', title);
            formData.append('author', author);
            formData.append('singer', singer);
            formData.append('albumId', albumId);
            genreIds.forEach((id) => formData.append('genreIds', id));
            collaboratorIds.forEach((id) => formData.append('collaboratorIds', id));

            await uploadSong(formData);

            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);

            // reset form
            setFileMedia(null);
            setFileImage(null);
            setMediaPreview(null);
            setImagePreview(null);
            setTitle('');
            setAuthor('');
            setSinger('');
            setAlbumId('');
            setGenreIds([]);
            setCollaboratorIds([]);
        } catch (err) {
            console.error(err);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [genresData, artistsData] = await Promise.all([
                    getAllSongGenres(),
                    getAllArtists()
                ]);
                setGenres(genresData || []);
                setArtists(artistsData || []);
            } catch (err) {
                console.error('Failed to load genres or artists', err);
                setGenres([]);
                setArtists([]);
            }
        };
        fetchData();
    }, []);

    const toggleSelect = (id) => {
        setGenreIds(genreIds.includes(id) ? genreIds.filter((x) => x !== id) : [...genreIds, id]);
    };

    const toggleCollaborator = (id) => {
        setCollaboratorIds(
            collaboratorIds.includes(id)
                ? collaboratorIds.filter((x) => x !== id)
                : [...collaboratorIds, id]
        );
    };

    useEffect(() => {
        return () => {
            if (mediaPreview) URL.revokeObjectURL(mediaPreview);
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, [mediaPreview, imagePreview]);

    return (
        <>
            <Navigation />
            <div className="upload-song-page">
                <div className="page-center">
                    <div className="card">
                        <h1 className="title">Upload Song</h1>
                        <form onSubmit={handleSubmit} className="upload-song-form">
                            <div className="form-content">
                                <div className="left">
                                    {/* --- Media Upload Box --- */}
                                    <div
                                        className={`media-box ${dragOverMedia ? 'drag-over' : ''}`}
                                        onClick={handleMediaClick}
                                        onDrop={handleMediaDrop}
                                        onDragOver={handleDragOver}
                                        onDragEnter={handleMediaDragEnter}
                                        onDragLeave={handleMediaDragLeave}>
                                        {mediaPreview ? (
                                            isVideo ? (
                                                <video
                                                    src={mediaPreview}
                                                    controls
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            ) : (
                                                <audio controls onClick={(e) => e.stopPropagation()}>
                                                    <source src={mediaPreview} type={fileMedia?.type} />
                                                </audio>
                                            )
                                        ) : (
                                            <div className="placeholder">
                                                <span className="placeholder-icon">🎵</span>
                                                <span className="placeholder-text">Click hoặc kéo thả file audio/video vào đây</span>
                                                <span className="placeholder-hint">MP3, WAV, MP4, MOV...</span>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        id="media-input"
                                        type="file"
                                        accept="audio/*,video/*"
                                        onChange={handleMediaChange}
                                        hidden
                                    />

                                    {/* --- Cover Image Box --- */}
                                    <div
                                        className={`image-box ${dragOverImage ? 'drag-over' : ''}`}
                                        onClick={handleImageClick}
                                        onDrop={handleImageDrop}
                                        onDragOver={handleDragOver}
                                        onDragEnter={handleImageDragEnter}
                                        onDragLeave={handleImageDragLeave}>
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Cover preview"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        ) : (
                                            <div className="placeholder">
                                                <span className="placeholder-icon">🖼️</span>
                                                <span className="placeholder-text">Click hoặc kéo thả ảnh bìa vào đây</span>
                                                <span className="placeholder-hint">JPG, PNG, WEBP...</span>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        id="image-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        hidden
                                    />

                                    {/* --- File name hints --- */}
                                    {fileMedia && (
                                        <div className="file-hint">
                                            <span className="file-hint-icon">✓</span>
                                            {fileMedia.name}
                                        </div>
                                    )}
                                    {fileImage && (
                                        <div className="file-hint">
                                            <span className="file-hint-icon">✓</span>
                                            {fileImage.name}
                                        </div>
                                    )}
                                </div>

                                <div className="right">
                                    <div className="field">
                                        <label>Title</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => {
                                                setTitle(e.target.value);
                                                if (e.target.value.trim()) setErrorTitle('');
                                            }}
                                            className={errorTitle ? 'error' : ''}
                                        />
                                        {errorTitle && <p className="error-text">{errorTitle}</p>}
                                    </div>

                                    <div className="field">
                                        <label>Author</label>
                                        <input
                                            type="text"
                                            value={author}
                                            onChange={(e) => {
                                                setAuthor(e.target.value);
                                                if (e.target.value.trim()) setErrorAuthor('');
                                            }}
                                            className={errorAuthor ? 'error' : ''}
                                        />
                                        {errorAuthor && <p className="error-text">{errorAuthor}</p>}
                                    </div>

                                    <label className="section-label">Genre</label>
                                    <div className="multi-select">
                                        <div className="options">
                                            {genres.map((g) => (
                                                <div
                                                    key={g.id}
                                                    className={`option ${genreIds.includes(g.id) ? 'active' : ''}`}
                                                    onClick={() => toggleSelect(g.id)}>
                                                    {g.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <label className="section-label">Collaborators (Co-artists)</label>
                                    <div className="multi-select">
                                        <div className="options">
                                            {artists
                                                .filter((a) => a.id !== currentUser?.id)
                                                .map((a) => (
                                                    <div
                                                        key={a.id}
                                                        className={`option ${collaboratorIds.includes(a.id) ? 'active' : ''}`}
                                                        onClick={() => toggleCollaborator(a.id)}>
                                                        {a.username}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className={`btn submit-btn ${status}`}
                                        disabled={status === 'loading'}>
                                        <span>
                                            {status === 'idle' && 'Upload Song'}
                                            {status === 'loading' && 'Uploading...'}
                                            {status === 'success' && 'Upload Successful!'}
                                            {status === 'error' && 'Upload Failed!'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UploadSongPage;
