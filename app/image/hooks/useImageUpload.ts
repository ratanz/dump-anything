import { useState, useRef } from 'react';
import { validateImageFile, isValidImageUrl } from '@/app/lib/utils';
import { useSession } from 'next-auth/react';
import type { ImageData } from "@/types/image";

export function useImageUpload(setImages: (cb: (prev: ImageData[]) => ImageData[]) => void) {
    const [loading, setLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [imageUrl, setImageUrl] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { data: session } = useSession();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !session?.user) return;
        setError(null);
        const file = e.target.files[0];
        const validation = validateImageFile(file);
        if (!validation.valid) {
            setError(validation.error || 'Invalid file');
            return;
        }
        setLoading(true);
        setUploadStatus('uploading');
        try {
            const formData = new FormData();
            formData.append('imageFile', file);
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                const data = await response.json();
                setImages((prev: ImageData[]) => [data.image, ...prev]);
                setUploadStatus('success');
                setTimeout(() => setShowUploadModal(false), 2000);
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Upload failed');
                setUploadStatus('error');
            }
        } catch {
            setError('Upload failed. Please try again.');
            setUploadStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const handleUrlUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user) return;
        setError(null);
        if (!imageUrl.trim()) {
            setError('Please enter an image URL');
            return;
        }
        if (!isValidImageUrl(imageUrl)) {
            setError('Invalid image URL. URL must point to a JPG, PNG, GIF or WEBP file.');
            return;
        }
        setLoading(true);
        setUploadStatus('uploading');
        try {
            const formData = new FormData();
            formData.append('imageUrl', imageUrl);
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                const data = await response.json();
                setImages((prev: ImageData[]) => [data.image, ...prev]);
                setImageUrl('');
                setUploadStatus('success');
                setTimeout(() => setShowUploadModal(false), 2000);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Upload failed');
                setUploadStatus('error');
            }
        } catch {
            setError('Upload failed. Please try again.');
            setUploadStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        uploadStatus,
        imageUrl,
        setImageUrl,
        showUploadModal,
        setShowUploadModal,
        uploadType,
        setUploadType,
        error,
        setError,
        fileInputRef,
        handleFileUpload,
        handleUrlUpload,
        setUploadStatus,
    };
}
