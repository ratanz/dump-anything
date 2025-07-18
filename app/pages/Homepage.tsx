import React from 'react'
import Image from 'next/image'

const Homepage = () => {
  return (
    <div className='w-full min-h-screen flex mt-54 justify-center '>
      <div className="text-container h-fit leading-tight">
        <h1 className='text-7xl'>A place to dump</h1>

        <div className="arrow flex items-center gap-2">
          <Image src="/Arrow 1.svg" alt="Arrow" width={300} height={10} className="mt-2 w-[25vw]" />
          <h1 className='text-[7vw] '>Anything</h1>
        </div>

      </div>
    </div>
  )
}

export default Homepage
