'use client'
import React, { useState, useEffect, useRef } from 'react'
import { FloatingDock } from '@/components/ui/floating-dock'
import { HomeIcon, ImageIcon, FileIcon, UploadIcon, LinkIcon, AlertCircleIcon, CheckCircleIcon, Loader2, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { validateImageFile, isValidImageUrl, playClickSound } from '@/app/lib/utils'
import { motion } from 'motion/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [imageUrl, setImageUrl] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Add client-side only rendering flag
    const [isClient, setIsClient] = useState(false);
    const { data: session, status } = useSession();
    const router = useRouter();

    // Mark component as client-side rendered once mounted
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    // Fetch images on component mount if authenticated
    useEffect(() => {
        if (session?.user) {
            fetchImages();
        }
    }, [session]);

    // Reset upload status after success
    useEffect(() => {
        if (uploadStatus === 'success') {
            const timer = setTimeout(() => {
                setUploadStatus('idle');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [uploadStatus]);

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
        if (!e.target.files || e.target.files.length === 0 || !session?.user) return;
        
        setError(null);
        const file = e.target.files[0];
        
        // Validate file
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
                setImages(prev => [data.image, ...prev]);
                setUploadStatus('success');
                setTimeout(() => {
                    setShowUploadModal(false);
                }, 2000);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Upload failed');
                setUploadStatus('error');
            }
        } catch (error) {
            console.error('Upload error:', error);
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
        
        // Validate URL
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
                setImages(prev => [data.image, ...prev]);
                setImageUrl('');
                setUploadStatus('success');
                setTimeout(() => {
                    setShowUploadModal(false);
                }, 2000);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Upload failed');
                setUploadStatus('error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setError('Upload failed. Please try again.');
            setUploadStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteImage = async (id: string) => {
        if (!session?.user) return;
        
        try {
            setDeletingId(id);
            const response = await fetch(`/api/images/${id}`, {
                method: 'DELETE',
            });
            
            if (response.ok) {
                // Remove the image from state
                setImages(prev => prev.filter(img => img.id !== id));
                playClickSound();
            } else {
                const errorData = await response.json();
                console.error('Error deleting image:', errorData);
                alert('Failed to delete image. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Failed to delete image. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    // Show loading state while checking authentication
    if (status === 'loading' || !isClient) {
        return (
            <div className='w-full min-h-screen flex flex-col items-center justify-center bg-[#0E0E0E]'>
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                <p className="mt-4 text-white">Loading...</p>
            </div>
        );
    }

    // Show login prompt if not authenticated
    if (status === 'unauthenticated') {
        return (
            <div className='w-full min-h-screen flex flex-col items-center justify-center bg-[#0E0E0E] p-4'>
                <div className="max-w-md w-full bg-zinc-900/80 backdrop-blur-md rounded-xl border border-zinc-800 p-8 shadow-xl text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
                    <p className="text-zinc-400 mb-6">Please sign in to access the image gallery</p>
                    <Link 
                        href="/auth/signin" 
                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    // Render upload status message
    const renderUploadStatus = () => {
        switch (uploadStatus) {
            case 'uploading':
                return (
                    <div className="bg-blue-50/30 backdrop-blur-md border border-blue-200 text-blue-700 px-4 py-3 rounded-md mb-6 flex items-center justify-center">
                        <Loader2 size={20} className="mr-2 animate-spin" />
                        <p>Uploading your image...</p>
                    </div>
                );
            case 'success':
                return (
                    <div className="bg-green-50/30 backdrop-blur-md border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 flex items-center justify-center">
                        <CheckCircleIcon size={20} className="mr-2" />
                        <p>Upload successful!</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
        <div className='w-full min-h-screen flex flex-col items-center bg-[#0E0E0E] lg:pt-18 pt-14'>
            

            {/* Upload Button */}
            <motion.div
                className="fixed right-[37vw] bottom-6 z-10 hover:scale-110 transition-all duration-300 ease-in-out cursor-pointer"
               
            >
                <button 
                    onClick={() => {
                        setError(null);
                        setUploadStatus('idle');
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
                        
                        {/* Status message */}
                        {renderUploadStatus()}
                        
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
                                disabled={uploadStatus === 'uploading'}
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
                                disabled={uploadStatus === 'uploading'}
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
                                    disabled={uploadStatus === 'uploading'}
                                />
                                <label 
                                    htmlFor="file-upload"
                                    className={`block w-full p-12 border-2 border-zinc-300/50 rounded-lg text-center cursor-pointer hover:bg-zinc-950/20 transition-colors ${uploadStatus === 'uploading' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {uploadStatus === 'uploading' ? (
                                        <>
                                            <Loader2 size={36} className="mx-auto mb-3 text-blue-400 animate-spin" />
                                            <p className="text-lg font-medium text-gray-100">Uploading...</p>
                                        </>
                                    ) : (
                                        <>
                                            <UploadIcon size={36} className="mx-auto mb-3 text-blue-400" />
                                            <p className="text-lg font-medium text-gray-100">Click to select an image</p>
                                            <p className="text-sm text-gray-400 mt-2">PNG, JPG, GIF up to 10MB</p>
                                        </>
                                    )}
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
                                    disabled={uploadStatus === 'uploading'}
                                />
                                <button 
                                    type="submit"
                                    disabled={uploadStatus === 'uploading'}
                                    className={`w-full bg-transparent backdrop-blur-3xl border border-zinc-300/50 hover:bg-zinc-950/20 cursor-pointer p-3 rounded-md font-medium text-md transition-colors ${uploadStatus === 'uploading' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {uploadStatus === 'uploading' ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 size={20} className="animate-spin" />
                                            <span>Uploading...</span>
                                        </div>
                                    ) : 'Upload'}
                                </button>
                            </form>
                        )}
                        
                        <button 
                            onClick={() => setShowUploadModal(false)}
                            className={`w-full border border-zinc-300/50 bg-transparent backdrop-blur-3xl text-white p-3 rounded-md font-medium hover:bg-zinc-950/30 transition-colors ${uploadStatus === 'uploading' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={uploadStatus === 'uploading'}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Image Grid */}
            <div className="w-full max-w-7xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {loading ? (
                    <div className="col-span-full text-center py-12">
                        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mx-auto" />
                        <p className="mt-4 text-white">Loading images...</p>
                    </div>
                ) : images.length > 0 ? (
                    images.map((image) => (
                        <div 
                            key={image.id} 
                            className="relative aspect-square overflow-hidden hover:scale-105 transition-all duration-300 ease-in-out rounded-lg shadow-md border border-white/10 group"
                        >
                            <Image
                                src={image.url}
                                alt={image.fileName || 'Image'}
                                fill
                                className="object-cover transition-transform"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                priority
                            />
                            
                            {/* Delete Icon on Hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/20 to-transparent transition-opacity flex items-end justify-center p-3">
                                <button 
                                    className="p-2 rounded-full transform hover:scale-110 hover:bg-red-600/80 cursor-pointer transition-transform"
                                    onClick={() => handleDeleteImage(image.id)}
                                    disabled={deletingId === image.id}
                                >
                                    {deletingId === image.id ? (
                                        <Loader2 size={20} className="text-white animate-spin" />
                                    ) : (
                                        <Trash2 size={20} className="text-white" />
                                    )}
                                </button>
                            </div>
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
        </>
    )
} 