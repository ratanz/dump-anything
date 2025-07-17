import React from 'react'
import { Menu } from 'lucide-react';

const Navbar = () => {
  return (
    <div className='w-full h-10'>
        <div className="logo flex items-center justify-between p-2 px-4">
            <h1>Anything</h1>

            <div className="menu">
            <Menu />
            </div>
        </div>
    </div>
  )
}

export default Navbar
