'use client'
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { FloatingDock } from '@/components/ui/floating-dock'
import { HomeIcon, ImageIcon, FileIcon, QuoteIcon, UploadIcon, LinkIcon, AlertCircleIcon, CheckCircleIcon, Loader2, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { playClickSound } from '@/app/lib/utils'
import { easeInOut, motion, AnimatePresence } from 'motion/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './slider.module.css';
import { useParallaxSlider } from './hooks/useParallaxSlider';
import { useImageUpload } from './hooks/useImageUpload';

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
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false); // Local loading for fetchImages
    const sliderRef = useRef<HTMLDivElement | null>(null);
    const {
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
    } = useImageUpload(setImages);
    const [isClient, setIsClient] = useState(false);
    const { data: session, status } = useSession();
    const router = useRouter();

    useParallaxSlider(sliderRef, images);

    // Memoized buttonVariants
    const buttonVariants = useMemo(() => ({
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2, ease: easeInOut }},
        exit: { opacity: 0, y: 30, transition: { duration: 0.3, ease: easeInOut }}
    }), []);

    // Memoized renderUploadStatus
    const renderUploadStatus = useCallback(() => {
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
    }, [uploadStatus]);

    // Memoized fetchImages
    const fetchImages = useCallback(async () => {
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
    }, [setImages, setError]);

    // Memoized handleDeleteImage
    const handleDeleteImage = useCallback(async (id: string) => {
        if (!session?.user) return;
        try {
            setDeletingId(id);
            const response = await fetch(`/api/images/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
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
    }, [session, setImages]);

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
    }, [session, fetchImages]);

    // Reset upload status after success
    useEffect(() => {
        if (uploadStatus === 'success') {
            const timer = setTimeout(() => {
                setUploadStatus('idle');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [uploadStatus, setUploadStatus]);

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

    return (
        <>
        <div className='w-full min-h-screen flex flex-col items-center bg-gradient-to-br from-black via-zinc-900 to-black lg:pt-18 pt-14'>
            

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
            <AnimatePresence>
            {showUploadModal && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <motion.div 
                        variants={buttonVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="bg-transparent backdrop-blur-3xl rounded-lg p-14 border border-zinc-300/20 w-full max-w-md shadow-2xl">
                        <motion.h2 
                        variants={buttonVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="text-2xl font-bold mb-10 text-center text-gray-100">Upload Image</motion.h2>
                        
                        {/* Status message */}
                        {renderUploadStatus()}
                        
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
                                <AlertCircleIcon size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}
                        
                        <div className="flex gap-4 mb-6">
                            <motion.button 
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.2, ease: easeInOut }}}
                                exit={{ opacity: 0, x: -30, transition: { duration: 0.3, ease: easeInOut }}}
                                className={`flex-1 p-4 rounded-md flex items-center justify-center gap-2 font-medium ${uploadType === 'file' ? ' text-blue-400 border-2 border-blue-500' : 'bg-transparent backdrop-blur-3xl border border-zinc-300/50 hover:bg-zinc-950/20 cursor-pointer'}`}
                                onClick={() => {
                                    setUploadType('file');
                                    setError(null);
                                }}
                                disabled={uploadStatus === 'uploading'}
                            >
                                <UploadIcon size={20} />
                                <span>Upload File</span>
                            </motion.button>
                            <motion.button 
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.2, ease: easeInOut }}}
                                exit={{ opacity: 0, x: 30, transition: { duration: 0.3, ease: easeInOut }}}
                                className={`flex-1 p-4 rounded-md flex items-center justify-center gap-2 font-medium ${uploadType === 'url' ? 'text-blue-400 border-2 border-blue-500' : 'bg-transparent backdrop-blur-3xl border border-zinc-300/50 hover:bg-zinc-950/20 cursor-pointer'}`}
                                onClick={() => {
                                    setUploadType('url');
                                    setError(null);
                                }}
                                disabled={uploadStatus === 'uploading'}
                            >
                                <LinkIcon size={20} />
                                <span>Image URL</span>
                            </motion.button>
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
                                <motion.label 
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2, ease: easeInOut }}}
                                    exit={{ opacity: 0, y: 30, transition: { duration: 0.3, ease: easeInOut }}}
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
                                </motion.label>
                            </div>
                        ) : (
                            <form 
                                onSubmit={handleUrlUpload} className="mb-3">
                                <motion.input 
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2, ease: easeInOut }}}
                                    exit={{ opacity: 0, y: 30, transition: { duration: 0.3, ease: easeInOut }}}
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
                        
                        <motion.button 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2, ease: easeInOut }}}
                            exit={{ opacity: 0, y: 30, transition: { duration: 0.3, ease: easeInOut }}}
                            onClick={() => setShowUploadModal(false)}
                            className={`w-full border border-zinc-300/50 bg-transparent backdrop-blur-3xl cursor-pointer text-white p-3 rounded-md font-medium hover:bg-zinc-950/30 transition-colors ${uploadStatus === 'uploading' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={uploadStatus === 'uploading'}
                        >
                            Cancel
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>

            {/* Parallax Image Slider */}
            <div className="w-full max-w-8xl p-4 px-8">
                {loading ? (
                    <div className="text-center py-12">
                        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mx-auto" />
                        <p className="mt-4 text-white">Loading images...</p>
                    </div>
                ) : images.length > 0 ? (
                    <div className={styles.slider} ref={sliderRef}>
                        <div className="slide-track">
                            {[0, 1, 2].map((dup) =>
                                images.map((image) => (
                                    <div
                                        key={`${dup}-${image.id}`}
                                        className="slide relative flex-shrink-0 w-[350px] h-[500px] mx-5 rounded-2xl overflow-visible cursor-grab shadow-lg transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] origin-center top-1/2 -translate-y-1/2 group"
                                    >
                                        <div className="relative w-full h-full overflow-hidden rounded-2xl">
                                            <Image
                                                src={image.url}
                                                alt={image.fileName || 'Image'}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                priority
                                            />
                                        </div>
                                        <div className="absolute bottom-4 right-4 opacity-0 translate-y-2 transition-all duration-300 ease-in z-20 group-hover:opacity-100 group-hover:translate-y-0">
                                            <button
                                                className="p-2 rounded-full hover:bg-red-600/80 cursor-pointer transition-all"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteImage(image.id);
                                                }}
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
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-xl text-white">No images yet. Upload your first image!</p>
                    </div>
                )}
            </div>

            <div className='dock fixed bottom-4'>
                <FloatingDock items={[
                    { title: "Home", icon: <HomeIcon />, href: "/" },
                    { title: "Image", icon: <ImageIcon />, href: "/image" },
                    { title: "Journal", icon: <FileIcon />, href: "/journal" },
                    { title: "Quotes", icon: <QuoteIcon />, href: "/quotes" },
                ]} />
            </div>
        </div>
        </>
    )
} 