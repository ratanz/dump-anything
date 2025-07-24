'use client'
import React from 'react'
import Image from 'next/image'
import { FloatingDock } from '@/components/ui/floating-dock'
import { HomeIcon, ImageIcon, FileIcon } from 'lucide-react'

const Homepage = () => {
  return (
    <>
    <div className='w-full h-screen flex flex-col md:pt-64 pt-44 px-4 items-center relative'>
      <Image 
        src="/images/8.png"
        alt="Background"
        fill
        priority
        className="object-cover z-0"
        quality={100}
      />
      <div className="text-container h-fit leading-tight relative z-10">
        <h1 className='text-[10vw] md:text-7xl text-transparent  bg-clip-text bg-gradient-to-bl from-zinc-100 via-zinc-100 to-110% '>A place to dump</h1>

        <div className="arrow flex items-center gap-2">
          <Image 
            src="/Arrow 1.svg" 
            alt="Arrow" 
            width={300} 
            height={10} 
            className="mt-2 w-[25vw] cursor-pointer" 
          />
          <h1 className='text-[13vw] md:text-[7vw] text-transparent  bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-50/80 to-105% '>Anything</h1>
        </div>
      </div>

      <div className='fixed bottom-4 z-10'>
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