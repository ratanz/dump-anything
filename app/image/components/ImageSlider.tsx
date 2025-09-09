'use client'
import React, { useRef } from 'react'
import Image from 'next/image'
import { Loader2, Trash2 } from 'lucide-react'

import styles from '../slider.module.css';
import { useParallaxSlider } from '../hooks/useParallaxSlider'
import type { ImageData } from "@/types/image";

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
            <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-800/50 rounded-full mb-4">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
                <p className="text-zinc-400 text-lg">Loading your images...</p>
            </div>
        );
    }

    if (images.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-zinc-800/30 rounded-full mb-6">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-500">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21,15 16,10 5,21"></polyline>
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No images yet</h3>
                <p className="text-zinc-400 mb-6">Add your first image by clicking the + button</p>
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
                            
                            {/* Delete button */}
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