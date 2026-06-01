import React, { useState } from 'react';
import './CreatePopup.sass';

const CreatePopup = ({ type = 'album', onClose, onSubmit, mess }) => {
    const [coverFile, setCoverFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setCoverFile(file);
        if (file) setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            alert(`Please enter a ${type} name.`);
            return;
        }
        onSubmit({ name, description, coverFile, type });
        onClose();
    };

    return (
        <div className="popupOverlay">
            <div className="popupBox">
                <h2>{mess}</h2>
                <div className="popupContent">
                    <div className="leftSection">
                        <label htmlFor="coverFile" className="coverUpload">
                            {preview ? (
                                <img src={preview} alt={`${type} cover`} />
                            ) : (
                                <div className="emptyCover">No cover selected</div>
                            )}
                            <input type="file" id="coverFile" accept="image/*" onChange={handleFileChange} />
                        </label>
                    </div>

                    <div className="rightSection">
                        <div className="inputGroup">
                            <label>{type === 'playlist' ? 'Playlist Name' : 'Album Name'}</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={`Enter ${type} name...`}
                            />
                        </div>

                        <div className="inputGroup">
                            <label>Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter description..."
                            />
                        </div>
                    </div>
                </div>

                <div className="popupActions">
                    <button onClick={onClose} className="cancelBtn">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="createBtn">
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePopup;
