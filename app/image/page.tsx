'use client'
import React from 'react'
import { FloatingDock } from '@/components/ui/floating-dock'
import { HomeIcon, ImageIcon, FileIcon } from 'lucide-react'

export default function ImagePage() {
  return (
    <div className='w-full h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-zinc-200 via-purple-500 to-zinc-200'>
      <h1 className='text-4xl md:text-6xl mb-8'>Image Upload</h1>
      <p className='text-xl mb-12'>Coming soon: Upload and share your images</p>
      
      <div className='fixed bottom-4'>
        <FloatingDock items={[
          {title: "Home", icon: <HomeIcon />, href: "/"},
          {title: "Image", icon: <ImageIcon />, href: "/image"},
          {title: "Journal", icon: <FileIcon />, href: "/journal"},
        ]}/>
      </div>
    </div>
  )
} 