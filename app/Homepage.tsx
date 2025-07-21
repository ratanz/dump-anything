'use client'
import React from 'react'
import Image from 'next/image'
import { FloatingDock } from '@/components/ui/floating-dock'
import { HomeIcon, ImageIcon, FileIcon } from 'lucide-react'

const Homepage = () => {
  return (
    <>
    <div className='w-full h-screen flex flex-col md:pt-58 pt-44 px-4 items-center bg-[#0E0E0E]'>
      <div className="text-container h-fit leading-tight">
        <h1 className='text-[10vw] md:text-7xl'>A place to dump</h1>

        <div className="arrow flex items-center gap-2">
          <Image 
            src="/Arrow 1.svg" 
            alt="Arrow" 
            width={300} 
            height={10} 
            className="mt-2 w-[25vw] cursor-pointer" 
          />
          <h1 className='text-[13vw] md:text-[7vw] '>Anything</h1>
        </div>
      </div>

      <div className='fixed bottom-4'>
        <FloatingDock items={[
          {title: "Home", icon: <HomeIcon />, href: "/"},
          {title: "Image", icon: <ImageIcon />, href: "/image"},
          {title: "Journal", icon: <FileIcon />, href: "/journal"},
        ]}/>
      </div>
    </div>
    </>
  )
}

export default Homepage


// bg-gradient-to-bl from-zinc-200 via-blue-500 to-zinc-200 