'use client';

import { useState, useRef } from 'react';

interface MediaUploaderProps {
    onUploadComplete: (url: string, publicId: string, metadata: any) => void;
    onDelete?: (publicId: string) => void;
    acceptedTypes?: 'image' | 'video' | 'both';
    currentUrl?: string;
    currentPublicId?: string;
    label?: string;
}

export default function MediaUploader({
    onUploadComplete,
    onDelete,
    acceptedTypes = 'both',
    currentUrl,
    currentPublicId,
    label = 'Upload Media'
}: MediaUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
    const [publicId, setPublicId] = useState<string | null>(currentPublicId || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getAcceptString = () => {
        if (acceptedTypes === 'image') return 'image/jpeg,image/png,image/gif,image/webp';
        if (acceptedTypes === 'video') return 'video/mp4,video/webm,video/quicktime';
        return 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime';
    };

    const handleFile = async (file: File) => {
        setError(null);
        setUploading(true);
        setProgress(0);

        try {
            // Create preview
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);

            // Upload to server
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Upload failed');
            }

            setProgress(100);
            setPreviewUrl(data.data.url);
            setPublicId(data.data.publicId);
            onUploadComplete(data.data.url, data.data.publicId, data.data);

            // Clean up object URL
            URL.revokeObjectURL(objectUrl);
        } catch (err: any) {
            setError(err.message || 'Upload failed');
            setPreviewUrl(null);
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleRemove = async () => {
        // If we have a publicId and onDelete callback, delete from Cloudinary
        if (publicId && onDelete) {
            try {
                const resourceType = previewUrl?.includes('video') || previewUrl?.endsWith('.mp4') || previewUrl?.endsWith('.webm')
                    ? 'video'
                    : 'image';

                await fetch('/api/upload/delete', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ publicId, resourceType }),
                });

                onDelete(publicId);
            } catch (err) {
                console.error('Delete error:', err);
            }
        }

        setPreviewUrl(null);
        setPublicId(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>

            {!previewUrl ? (
                <div
                    className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept={getAcceptString()}
                        onChange={handleChange}
                        disabled={uploading}
                    />

                    <div className="text-center">
                        {uploading ? (
                            <div className="space-y-2">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="text-sm text-gray-600">Uploading... {progress}%</p>
                            </div>
                        ) : (
                            <>
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                >
                                    <path
                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Click to upload
                                    </button>
                                    <p className="text-sm text-gray-500">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    {acceptedTypes === 'image' && 'PNG, JPG, GIF, WEBP up to 10MB'}
                                    {acceptedTypes === 'video' && 'MP4, WEBM up to 50MB'}
                                    {acceptedTypes === 'both' && 'Images up to 10MB, Videos up to 50MB'}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div className="relative border border-gray-300 rounded-lg overflow-hidden">
                    {previewUrl.includes('video') || previewUrl.endsWith('.mp4') || previewUrl.endsWith('.webm') ? (
                        <video src={previewUrl} controls className="w-full max-h-64 object-contain bg-gray-100" />
                    ) : (
                        <img src={previewUrl} alt="Preview" className="w-full max-h-64 object-contain bg-gray-100" />
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white text-gray-700 px-3 py-1 rounded shadow hover:bg-gray-50 text-sm"
                        >
                            Replace
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="bg-red-600 text-white px-3 py-1 rounded shadow hover:bg-red-700 text-sm"
                        >
                            Remove
                        </button>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept={getAcceptString()}
                        onChange={handleChange}
                        disabled={uploading}
                    />
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 px-3 py-2 rounded text-sm">
                    {error}
                </div>
            )}
        </div>
    );
}
