import React from 'react'
import Image from 'next/image'
import { FloatingDock } from '@/components/ui/floating-dock'
import { HomeIcon, ImageIcon, VideoIcon,  FileIcon } from 'lucide-react'

const Homepage = () => {
  return (
    <>

    <div className='w-full min-h-screen flex md:pt-44 pt-54 px-4  justify-center bg-gradient-to-bl from-zinc-950 via-zinc to-blue-500  '>
      <div className="text-container h-fit leading-tight">
        <h1 className='text-[11vw] md:text-7xl'>A place to dump</h1>

        <div className="arrow flex items-center gap-2">
          <Image src="/Arrow 1.svg" alt="Arrow" width={300} height={10} className="mt-2 w-[25vw]" />
          <h1 className='text-[17vw] md:text-[7vw] '>Anything</h1>
        </div>

      </div>


    <div className='fixed bottom-4'>
        <FloatingDock items={[
          {title: "Home", icon: <HomeIcon />, href: "/"},
          {title: "Image", icon: <ImageIcon />, href: "/images"},
          {title: "Video", icon: <VideoIcon />, href: "/videos"},
          {title: "Type", icon: <FileIcon />, href: "/types"},
          ]}/>
    </div>
    </div>
    </>
  )
}

export default Homepage
