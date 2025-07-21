'use client'
import React, { useState, useEffect, useRef } from 'react'
import { FloatingDock } from '@/components/ui/floating-dock'
import { HomeIcon, ImageIcon, FileIcon, UploadIcon, LinkIcon, AlertCircleIcon } from 'lucide-react'
import Image from 'next/image'
import { validateImageFile, isValidImageUrl, playClickSound } from '@/app/lib/utils'
import { motion } from 'motion/react'

interface ImageData {
    id: string;
    url: string;
    fileName: string | null;
    s3Key?: string | null;
    fileSize?: number | null;
    mimeType?: string | null;
    createdAt: string;
}

export default function ImagePage() {
    const [images, setImages] = useState<ImageData[]>([]);
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Add client-side only rendering flag
    const [isClient, setIsClient] = useState(false);

    // Mark component as client-side rendered once mounted
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Fetch images on component mount
    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/images');
            if (response.ok) {
                const data = await response.json();
                setImages(data);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to fetch images');
            }
        } catch (error) {
            console.error('Error fetching images:', error);
            setError('Failed to load images. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        setError(null);
        const file = e.target.files[0];
        
        // Validate file
        const validation = validateImageFile(file);
        if (!validation.valid) {
            setError(validation.error || 'Invalid file');
            return;
        }
        
        setLoading(true);
        
        try {
            const formData = new FormData();
            formData.append('imageFile', file);
            
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            
            if (response.ok) {
                const data = await response.json();
                setImages(prev => [data.image, ...prev]);
                setShowUploadModal(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setError('Upload failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUrlUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (!imageUrl.trim()) {
            setError('Please enter an image URL');
            return;
        }
        
        // Validate URL
        if (!isValidImageUrl(imageUrl)) {
            setError('Invalid image URL. URL must point to a JPG, PNG, GIF or WEBP file.');
            return;
        }
        
        setLoading(true);
        
        try {
            const formData = new FormData();
            formData.append('imageUrl', imageUrl);
            
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            
            if (response.ok) {
                const data = await response.json();
                setImages(prev => [data.image, ...prev]);
                setImageUrl('');
                setShowUploadModal(false);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setError('Upload failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Return early with loading state if not client-side
    if (!isClient) {
        return <div className='w-full min-h-screen flex flex-col items-center bg-gradient-to-br from-zinc-200 via-blue-500 to-zinc-200 pb-20'>
            <h1 className='text-4xl md:text-6xl my-8 text-white'>Loading...</h1>
        </div>;
    }

    return (
        <div className='w-full min-h-screen flex flex-col items-center bg-gradient-to-br from-zinc-200 via-blue-500 to-zinc-200 pb-20'>

            {/* Upload Button */}
            <motion.div
                className="fixed right-[37vw] bottom-6 z-10 hover:scale-110 transition-all duration-300 ease-in-out cursor-pointer"
               
            >
                <button 
                    onClick={() => {
                        setError(null);
                        setShowUploadModal(true);
                        playClickSound();
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/40 backdrop-blur-md border border-white/20 dark:bg-black/40 dark:border-white/10"
                >
                    <div className="flex items-center justify-center h-5 w-5">
                        <UploadIcon />
                    </div>
                </button>
            </motion.div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-transparent backdrop-blur-3xl rounded-lg p-14 border border-zinc-300/20 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold mb-10 text-center text-gray-100">Upload Image</h2>
                        
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
                                <AlertCircleIcon size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}
                        
                        <div className="flex gap-4 mb-6">
                            <button 
                                className={`flex-1 p-4 rounded-md flex items-center justify-center gap-2 font-medium ${uploadType === 'file' ? ' text-blue-500 border-2 border-blue-500' : 'bg-transparent backdrop-blur-3xl border border-zinc-300/50 hover:bg-zinc-950/20 cursor-pointer'}`}
                                onClick={() => {
                                    setUploadType('file');
                                    setError(null);
                                }}
                            >
                                <UploadIcon size={20} />
                                <span>Upload File</span>
                            </button>
                            <button 
                                className={`flex-1 p-4 rounded-md flex items-center justify-center gap-2 font-medium ${uploadType === 'url' ? 'text-blue-500 border-2 border-blue-500' : 'bg-transparent backdrop-blur-3xl border border-zinc-300/50 hover:bg-zinc-950/20 cursor-pointer'}`}
                                onClick={() => {
                                    setUploadType('url');
                                    setError(null);
                                }}
                            >
                                <LinkIcon size={20} />
                                <span>Image URL</span>
                            </button>
                        </div>
                        
                        {uploadType === 'file' ? (
                            <div className="mb-6">
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label 
                                    htmlFor="file-upload"
                                    className="block w-full p-12 border-2 border-zinc-300/50 rounded-lg text-center cursor-pointer hover:bg-zinc-950/20 transition-colors"
                                >
                                    <UploadIcon size={36} className="mx-auto mb-3 text-blue-400" />
                                    <p className="text-lg font-medium text-gray-100">Click to select an image</p>
                                    <p className="text-sm text-gray-400 mt-2">PNG, JPG, GIF up to 10MB</p>
                                </label>
                            </div>
                        ) : (
                            <form onSubmit={handleUrlUpload} className="mb-3">
                                <input 
                                    type="url" 
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="Paste image URL here"
                                    className="w-full p-4 text-lg border-2 border-zinc-300/50 rounded-md mb-8 focus:outline-none focus-within:border-blue-500"
                                    required
                                />
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-transparent backdrop-blur-3xl border border-zinc-300/50 hover:bg-zinc-950/20 cursor-pointer  p-3 rounded-md font-medium text-md transition-colors"
                                >
                                    {loading ? 'Uploading...' : 'Upload'}
                                </button>
                            </form>
                        )}
                        
                        <button 
                            onClick={() => setShowUploadModal(false)}
                            className="w-full border border-zinc-300/50 bg-transparent backdrop-blur-3xl text-white p-3 rounded-md font-medium hover:bg-zinc-950/30 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Image Grid */}
            <div className="w-full max-w-7xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {loading && images.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <p className="text-xl text-white">Loading images...</p>
                    </div>
                ) : images.length > 0 ? (
                    images.map((image) => (
                        <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg shadow-md bg-white">
                            <Image
                                src={image.url}
                                alt={image.fileName || 'Image'}
                                fill
                                className="object-cover hover:scale-105 transition-transform"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <p className="text-xl text-white">No images yet. Upload your first image!</p>
                    </div>
                )}
            </div>

            <div className='dock fixed bottom-4'>
                <FloatingDock items={[
                    { title: "Home", icon: <HomeIcon />, href: "/" },
                    { title: "Image", icon: <ImageIcon />, href: "/image" },
                    { title: "Journal", icon: <FileIcon />, href: "/journal" },
                ]} />
            </div>
        </div>
    )
} 