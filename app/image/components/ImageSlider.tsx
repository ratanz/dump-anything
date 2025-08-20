'use client'
import React, { useRef } from 'react'
import Image from 'next/image'
import { Loader2, Trash2 } from 'lucide-react'

import styles from '../slider.module.css';
import { useParallaxSlider } from '../hooks/useParallaxSlider'

interface ImageData {
    id: string;
    url: string;
    fileName: string | null;
    s3Key?: string | null;
    fileSize?: number | null;
    mimeType?: string | null;
    createdAt: string;
}

interface ImageSliderProps {
    images: ImageData[];
    loading: boolean;
    deletingId: string | null;
    onDeleteImage: (id: string) => void;
}

export default function ImageSlider({ 
    images, 
    loading, 
    deletingId, 
    onDeleteImage 
}: ImageSliderProps) {
    const sliderRef = useRef<HTMLDivElement | null>(null);
    
    useParallaxSlider(sliderRef, images);

    if (loading) {
        return (
            <div className="text-center py-12">
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin mx-auto" />
                <p className="mt-4 text-white">Loading images...</p>
            </div>
        );
    }

    if (images.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-xl text-white">No images yet. Upload your first image!</p>
            </div>
        );
    }

    return (
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
                                        onDeleteImage(image.id);
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
    );
}