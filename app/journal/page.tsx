'use client'
import React, { useState, useEffect } from 'react'
import { FloatingDock } from '@/components/ui/floating-dock'
import { HomeIcon, ImageIcon, FileIcon, SaveIcon } from 'lucide-react'

export default function JournalPage() {
  const [entry, setEntry] = useState('')
  const [savedEntries, setSavedEntries] = useState<{date: string, content: string}[]>([])
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    // Format current date as YYYY-MM-DD
    const now = new Date()
    const formattedDate = now.toISOString().split('T')[0]
    setCurrentDate(formattedDate)

    // Load saved entries from localStorage
    const storedEntries = localStorage.getItem('journalEntries')
    if (storedEntries) {
      setSavedEntries(JSON.parse(storedEntries))
    }
  }, [])

  const handleSaveEntry = () => {
    if (!entry.trim()) return

    const newEntry = {
      date: currentDate,
      content: entry
    }

    const updatedEntries = [...savedEntries, newEntry]
    setSavedEntries(updatedEntries)
    
    // Save to localStorage
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries))
    
    // Clear the current entry
    setEntry('')
  }

  return (
    <div className='w-full min-h-screen flex flex-col items-center pt-10 bg-gradient-to-br from-zinc-200 via-emerald-400 to-zinc-200'>
      <h1 className='text-4xl md:text-6xl mb-8 text-zinc-800'>Daily Journal</h1>
      
      <div className='w-full max-w-3xl px-4 flex flex-col gap-6'>
        <div className='bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-2xl font-medium text-zinc-800'>Today's Entry</h2>
            <span className='text-zinc-600'>{currentDate}</span>
          </div>
          
          <textarea
            className='w-full h-64 p-4 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500'
            placeholder="What's on your mind today?"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
          />
          
          <button 
            className='mt-4 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md transition-colors'
            onClick={handleSaveEntry}
          >
            <SaveIcon size={18} />
            Save Entry
          </button>
        </div>
        
        {savedEntries.length > 0 && (
          <div className='bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6'>
            <h2 className='text-2xl font-medium text-zinc-800 mb-4'>Previous Entries</h2>
            
            <div className='flex flex-col gap-4 max-h-64 overflow-y-auto'>
              {savedEntries.slice().reverse().map((entry, index) => (
                <div key={index} className='border-b border-zinc-200 pb-4'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='font-medium text-zinc-700'>{entry.date}</span>
                  </div>
                  <p className='text-zinc-600 whitespace-pre-wrap'>{entry.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
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