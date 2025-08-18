'use client'
import React, { useState, useEffect, useRef } from 'react'
import { FloatingDock } from '@/components/ui/floating-dock'
import { HomeIcon, ImageIcon, FileIcon, QuoteIcon, UploadIcon, LinkIcon, AlertCircleIcon, CheckCircleIcon, Loader2, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { validateImageFile, isValidImageUrl, playClickSound } from '@/app/lib/utils'
import { easeInOut, motion, AnimatePresence } from 'motion/react'
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
    const sliderRef = useRef<HTMLDivElement>(null);
    // Add client-side only rendering flag
    const [isClient, setIsClient] = useState(false);
    const { data: session, status } = useSession();
    const router = useRouter();

    // Mark component as client-side rendered once mounted
    useEffect(() => {
        setIsClient(true);
    }, []);
    
    // Initialize the slider with parallax effect
    useEffect(() => {
        if (!isClient || !sliderRef.current || images.length === 0) return;
        
        const config = {
            SCROLL_SPEED: 1.75,
            LERP_FACTOR: 0.05,
            MAX_VELOCITY: 200,
        };

        const state = {
            currentX: 0,
            targetX: 0,
            slideWidth: window.innerWidth < 1000 ? 215 : 350, // Match the CSS width
            isDragging: false,
            startX: 0,
            lastX: 0,
            lastMouseX: 0,
            lastScrollTime: Date.now(),
            isMoving: false,
            velocity: 0,
            lastCurrentX: 0,
            dragDistance: 0,
            hasActuallyDragged: false,
            isMobile: window.innerWidth < 1000,
            totalWidth: 0,
            sequenceWidth: 0,
        };

        const track = sliderRef.current.querySelector(".slide-track");
        if (!track) return;
        
        const slides = Array.from(track.querySelectorAll(".slide"));
        if (slides.length === 0) return;
        
        // Calculate the width of one sequence of slides (all unique images)
        const slideMargin = 40; // 20px on each side
        state.sequenceWidth = images.length * (state.slideWidth + slideMargin);
        
        // Set initial position to center the first set of images
        state.currentX = -state.sequenceWidth / 2;
        state.targetX = state.currentX;

        // Keep track of whether we're currently in a loop transition
        let isLoopTransitioning = false;
        
        function updateSlidePositions() {
            if (!track) return;
            
            // Handle infinite scrolling by resetting position when reaching threshold
            // Only reset position when not currently in a transition and not dragging
            if (!state.isDragging && !isLoopTransitioning) {
                if (state.currentX > -state.sequenceWidth * 0.25) {
                    // If scrolled too far to the right, jump back without animation
                    isLoopTransitioning = true;
                    
                    // Apply the transform immediately with no transition
                    (track as HTMLElement).style.transition = 'none';
                    (track as HTMLElement).style.transform = `translate3d(${state.currentX}px, 0, 0)`;
                    
                    // Force reflow to ensure the transition is disabled
                    void (track as HTMLElement).offsetWidth;
                    
                    // Update position values
                    state.currentX -= state.sequenceWidth;
                    state.targetX -= state.sequenceWidth;
                    
                    // Apply the new position immediately
                    (track as HTMLElement).style.transform = `translate3d(${state.currentX}px, 0, 0)`;
                    
                    // Reset the transition state after a short delay
                    setTimeout(() => {
                        isLoopTransitioning = false;
                    }, 10);
                    
                } else if (state.currentX < -state.sequenceWidth * 1.75) {
                    // If scrolled too far to the left, jump forward without animation
                    isLoopTransitioning = true;
                    
                    // Apply the transform immediately with no transition
                    (track as HTMLElement).style.transition = 'none';
                    (track as HTMLElement).style.transform = `translate3d(${state.currentX}px, 0, 0)`;
                    
                    // Force reflow to ensure the transition is disabled
                    void (track as HTMLElement).offsetWidth;
                    
                    // Update position values
                    state.currentX += state.sequenceWidth;
                    state.targetX += state.sequenceWidth;
                    
                    // Apply the new position immediately
                    (track as HTMLElement).style.transform = `translate3d(${state.currentX}px, 0, 0)`;
                    
                    // Reset the transition state after a short delay
                    setTimeout(() => {
                        isLoopTransitioning = false;
                    }, 10);
                }
            }
            
            // Apply smooth transition only when not in a loop transition
            if (!isLoopTransitioning) {
                (track as HTMLElement).style.transition = state.isDragging ? 'none' : 'transform 0.05s linear';
                (track as HTMLElement).style.transform = `translate3d(${state.currentX}px, 0, 0)`;
            }
        }

        function updateParallax() {
            const viewportCenter = window.innerWidth / 2;

            slides.forEach((slide) => {
                const img = slide.querySelector("img");
                if (!img) return;

                const slideRect = slide.getBoundingClientRect();

                // Optimize by skipping slides that are far outside the viewport
                if (
                    slideRect.right < -1000 ||
                    slideRect.left > window.innerWidth + 1000
                ) {
                    return;
                }

                const slideCenter = slideRect.left + slideRect.width / 2;
                const distanceFromCenter = slideCenter - viewportCenter;
                
                // Enhanced parallax effect with better scaling
                // More subtle parallax effect for smoother visual flow
                const parallaxOffset = distanceFromCenter * -0.1;
                
                // Apply different scale based on distance from center for depth effect
                // Use a minimal scaling effect
                const distanceRatio = Math.abs(distanceFromCenter) / (window.innerWidth / 2);
                const scale = 1.1 + (distanceRatio * 0.1); // Minimal scale for very subtle effect
                
                // Apply transform with no transition during dragging for smoother experience
                if (state.isDragging || isLoopTransitioning) {
                    img.style.transition = 'none';
                } else {
                    img.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                }
                
                img.style.transform = `translateX(${parallaxOffset}px) scale(${scale})`;
            });
        }

        function updateMovingState() {
            state.velocity = Math.abs(state.currentX - state.lastCurrentX);
            state.lastCurrentX = state.currentX;

            const isSlowEnough = state.velocity < 0.1;
            const hasBeenStillLongEnough = Date.now() - state.lastScrollTime > 200;
            state.isMoving =
                state.hasActuallyDragged || !isSlowEnough || !hasBeenStillLongEnough;

            document.documentElement.style.setProperty(
                "--slider-moving",
                state.isMoving ? "1" : "0"
            );
        }

        function animate() {
            // Use a smoother LERP factor based on velocity
            const dynamicLerpFactor = Math.min(
                config.LERP_FACTOR * 1.5,
                Math.max(config.LERP_FACTOR * 0.5, config.LERP_FACTOR / (1 + state.velocity * 0.01))
            );
            
            state.currentX += (state.targetX - state.currentX) * dynamicLerpFactor;

            updateMovingState();
            updateSlidePositions();
            updateParallax();

            requestAnimationFrame(animate);
        }

        function handleWheel(e: WheelEvent) {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                return;
            }

            e.preventDefault();
            state.lastScrollTime = Date.now();

            const scrollDelta = e.deltaY * config.SCROLL_SPEED;
            state.targetX -= Math.max(
                Math.min(scrollDelta, config.MAX_VELOCITY),
                -config.MAX_VELOCITY
            );
        }

        function handleTouchStart(e: TouchEvent) {
            state.isDragging = true;
            state.startX = e.touches[0].clientX;
            state.lastX = state.targetX;
            state.dragDistance = 0;
            state.hasActuallyDragged = false;
            state.lastScrollTime = Date.now();
        }

        function handleTouchMove(e: TouchEvent) {
            if (!state.isDragging) return;

            const deltaX = (e.touches[0].clientX - state.startX) * 1.5;
            state.targetX = state.lastX + deltaX;
            state.dragDistance = Math.abs(deltaX);

            if (state.dragDistance > 5) {
                state.hasActuallyDragged = true;
            }

            state.lastScrollTime = Date.now();
        }

        function handleTouchEnd() {
            state.isDragging = false;
            setTimeout(() => {
                state.hasActuallyDragged = false;
            }, 100);
        }

        function handleMouseDown(e: MouseEvent) {
            e.preventDefault();
            state.isDragging = true;
            state.startX = e.clientX;
            state.lastMouseX = e.clientX;
            state.lastX = state.targetX;
            state.dragDistance = 0;
            state.hasActuallyDragged = false;
            state.lastScrollTime = Date.now();
        }

        function handleMouseMove(e: MouseEvent) {
            if (!state.isDragging) return;

            e.preventDefault();
            const deltaX = (e.clientX - state.lastMouseX) * 2;
            state.targetX += deltaX;
            state.lastMouseX = e.clientX;
            state.dragDistance += Math.abs(deltaX);

            if (state.dragDistance > 5) {
                state.hasActuallyDragged = true;
            }

            state.lastScrollTime = Date.now();
        }

        function handleMouseUp() {
            state.isDragging = false;
            setTimeout(() => {
                state.hasActuallyDragged = false;
            }, 100);
        }

        function handleResize() {
            state.isMobile = window.innerWidth < 1000;
            state.slideWidth = state.isMobile ? 215 : 350; // Match the CSS width
            
            // Recalculate sequence width
            const slideMargin = 40; // 20px on each side
            state.sequenceWidth = images.length * (state.slideWidth + slideMargin);
        }

        // Add event listeners
        const slider = sliderRef.current;
        if (!slider) return;

        slider.addEventListener("wheel", handleWheel, { passive: false });
        slider.addEventListener("touchstart", handleTouchStart);
        slider.addEventListener("touchmove", handleTouchMove);
        slider.addEventListener("touchend", handleTouchEnd);
        slider.addEventListener("mousedown", handleMouseDown);
        slider.addEventListener("mouseleave", handleMouseUp);
        slider.addEventListener("dragstart", (e) => e.preventDefault());

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("resize", handleResize);

        // Start animation
        animate();

        // Cleanup function
        return () => {
            slider.removeEventListener("wheel", handleWheel);
            slider.removeEventListener("touchstart", handleTouchStart);
            slider.removeEventListener("touchmove", handleTouchMove);
            slider.removeEventListener("touchend", handleTouchEnd);
            slider.removeEventListener("mousedown", handleMouseDown);
            slider.removeEventListener("mouseleave", handleMouseUp);
            slider.removeEventListener("dragstart", (e) => e.preventDefault());

            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("resize", handleResize);
        };
    }, [isClient, images.length]);

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

    const buttonVariants = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2, ease: easeInOut }},
        exit: { opacity: 0, y: 30, transition: { duration: 0.3, ease: easeInOut }}
    }
    

    // CSS styles for the parallax slider
    const sliderStyles = `
        .slider {
            position: relative;
            width: 100vw;
            height: 70vh;
            min-height: 500px;
            overflow: hidden;
            cursor: grab;
            margin-top: 20px;
            user-select: none;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
        }
        
        .slider:active {
            cursor: grabbing;
        }
        
        .slide-track {
            display: flex;
            position: absolute;
            will-change: transform;
            height: 100%;
            width: 100%;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
        }
        
        .slide {
            position: relative;
            flex-shrink: 0;
            width: 350px;
            height: 500px;
            margin: 0 20px;
            border-radius: 20px;
            overflow: visible;
            cursor: grab;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            transform-origin: center center;
            top: 50%;
            transform: translateY(-50%);
        }
        
        .slide:hover {
            transform: translateY(calc(-50% - 5px)) scale(1.005);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
            z-index: 10;
        }
        
        .slide-image {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
            border-radius: 20px;
        }
        
        .slide-image img {
            object-fit: cover;
            width: 100%;
            height: 100%;
            will-change: transform;
            transform: scale(1.05);
            user-select: none;
            -webkit-user-select: none;
        }
        
        .delete-button {
            position: absolute;
            bottom: 15px;
            right: 15px;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s ease;
            z-index: 20;
        }
        
        .delete-button button {
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
            border-radius: 50%;
            padding: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .slide:hover .delete-button {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* Custom scrollbar for the slider */
        .slider::-webkit-scrollbar {
            display: none;
        }
        
        /* CSS variable for slider state */
        :root {
            --slider-moving: 0;
        }
        
        @media (max-width: 1000px) {
            .slide {
                width: 215px;
                height: 80%;
                margin-top: auto;
            }
            
            .slider {
                height: 60vh;
            }
        }
    `;

    return (
        <>
        <style jsx>{sliderStyles}</style>
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
                    <div className="slider" ref={sliderRef}>
                        <div className="slide-track">
                            {/* First set of images */}
                            {images.map((image) => (
                                <div key={`first-${image.id}`} className="slide">
                                    <div className="slide-image">
                                        <Image
                                            src={image.url}
                                            alt={image.fileName || 'Image'}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            priority
                                        />
                                    </div>
                                    <div className="delete-button">
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
                            ))}
                            
                            {/* Second set of images (duplicate) */}
                            {images.map((image) => (
                                <div key={`second-${image.id}`} className="slide">
                                    <div className="slide-image">
                                        <Image
                                            src={image.url}
                                            alt={image.fileName || 'Image'}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </div>
                                    {/* delete button */}
                                    <div className="delete-button">
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
                            ))}
                            
                            {/* Third set of images (duplicate) */}
                            {images.map((image) => (
                                <div key={`third-${image.id}`} className="slide">
                                    <div className="slide-image">
                                        <Image
                                            src={image.url}
                                            alt={image.fileName || 'Image'}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </div>
                                    <div className="delete-button">
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
                            ))}
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