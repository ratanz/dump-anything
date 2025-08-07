'use client'
import React from 'react'
import Image from 'next/image'
import { FloatingDock } from '@/components/ui/floating-dock'
import { HomeIcon, ImageIcon, FileIcon } from 'lucide-react'
import { motion } from "motion/react"

const Homepage = () => {

  return (
    <>
    {/* bg image */}
      <div className='w-full h-screen flex flex-col md:pt-64 pt-44 px-4 items-center relative'>
        <Image
          src="/images/image.png"
          alt="Background"
          fill
          priority
          className="object-cover z-0"
          quality={100}
        />


        <div className="text-container h-fit leading-tight relative z-10">
              {"A place to dump".split("").map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className='text-[10vw] md:text-7xl text-zinc-100/90'>
                  {char}
                </motion.span>
              ))}

          <div className="arrow flex items-center gap-2">
            <motion.img
              initial={{ width: 0}}
              animate={{ width: 230, height: 10 }}
              transition={{ duration: 1, delay: 0.5 }}
              src="/Arrow 1.svg"
              alt="Arrow"
              width={300}
              height={10}
              className="mt-2 w-[25vw] cursor-pointer"
            />
            <div className="flex">
              {"Anything".split("").map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  className='text-[13vw] md:text-[7vw] bg-clip-text text-zinc-100/90  '
                >
                  {char}
                </motion.span>
              ))}
            </div>
          </div>
        </div>

        <div className='fixed bottom-4 z-10'>
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

export default Homepage


// bg-gradient-to-bl from-zinc-200 via-blue-500 to-zinc-200 