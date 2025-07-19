import React from 'react'
import { Menu } from 'lucide-react';

const Navbar = () => {
  return (
    <div className='w-full h-10 fixed left-0 right-0 z-50'>
        <div className="logo flex items-center justify-between p-2 px-4">
            <h1>Anything</h1>

            <div className="menu hover:cursor-pointer">
            <Menu />
            </div>
        </div>
    </div>
  )
}

export default Navbar
