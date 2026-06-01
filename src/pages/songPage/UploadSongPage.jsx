import { useState, useEffect } from 'react';
import { uploadSong, getAllSongGenres } from '~/apis/songApi';
import Navigation from '~/components/navs/Navigation';
import './UploadSongPage.sass';

const UploadSongPage = () => {
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
        } catch (err) {
            console.error(err);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const data = await getAllSongGenres();
                setGenres(data || []);
            } catch (err) {
                console.error('Failed to load genres', err);
                setGenres([]);
            }
        };
        fetchGenres();
    }, []);

    const toggleSelect = (id) => {
        setGenreIds(genreIds.includes(id) ? genreIds.filter((x) => x !== id) : [...genreIds, id]);
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
                                                Click hoặc kéo thả file audio/video vào đây
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
                                            <div className="placeholder">Click hoặc kéo thả ảnh bìa vào đây</div>
                                        )}
                                    </div>
                                    <input
                                        id="image-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        hidden
                                    />
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

                                    <label>Genre</label>
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
