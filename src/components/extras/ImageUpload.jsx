import React, { useRef, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import './ImageUpload.css';

/**
 * Reusable image upload component using Supabase Storage.
 *
 * Props:
 *   currentUrl   — existing image URL string (shows preview)
 *   onUpload     — callback(newUrl: string) called after successful upload
 *   folder       — subfolder inside the bucket, e.g. "guide", "hotels", "places"
 *   label        — optional label above the component
 */
const ImageUpload = ({ currentUrl, onUpload, folder = 'general', label = 'Image' }) => {
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(currentUrl || '');

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
        if (!allowedTypes.includes(file.type)) {
            alert('Please select a JPEG, PNG, WebP, or HEIC image.');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('Image must be smaller than 10MB.');
            return;
        }

        setIsUploading(true);

        try {
            // Build a unique file path
            const ext = file.name.split('.').pop().toLowerCase();
            const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from('tour-images')
                .upload(fileName, file, { upsert: false });

            if (uploadError) throw uploadError;

            // Get the public URL
            const { data } = supabase.storage
                .from('tour-images')
                .getPublicUrl(fileName);

            const publicUrl = data.publicUrl;
            setPreviewUrl(publicUrl);
            onUpload(publicUrl);

        } catch (err) {
            console.error('Upload error:', err);
            alert('Upload failed. Please check your Supabase Storage bucket is set to public and policies are configured.');
        } finally {
            setIsUploading(false);
            // Reset file input so the same file can be re-selected
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleClear = () => {
        setPreviewUrl('');
        onUpload('');
    };

    return (
        <div className="image-upload-wrapper">
            {label && <label className="image-upload-label">{label}</label>}

            {previewUrl ? (
                <div className="image-preview-container">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="image-preview-thumb"
                        onError={() => setPreviewUrl('')}
                    />
                    <div className="image-preview-actions">
                        <button
                            type="button"
                            className="btn-replace-image"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? '⏳ Uploading...' : '🔄 Replace'}
                        </button>
                        <button
                            type="button"
                            className="btn-clear-image"
                            onClick={handleClear}
                            disabled={isUploading}
                        >
                            ✕ Remove
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    className={`btn-upload-image ${isUploading ? 'uploading' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <>
                            <span className="upload-spinner" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <span className="upload-icon">📷</span>
                            Upload Photo
                        </>
                    )}
                </button>
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
        </div>
    );
};

export default ImageUpload;