'use client'
import React, { useState, useEffect } from 'react'
import { FloatingDock } from '@/components/ui/floating-dock'
import { HomeIcon, ImageIcon, FileIcon, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { easeInOut, motion } from 'motion/react'
import { MoodSelector } from './components/MoodSelector';
import { JournalEntryForm } from './components/JournalEntryForm';
import { JournalEntryList } from './components/JournalEntryList';

interface JournalEntry {
  id: string;
  content: string;
  date: string;
  mood?: string | null;
  createdAt: string;
}

// Format date in a more readable way
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// Format time in a more readable way
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
};

// Available mood options
const moodOptions = [
  { emoji: "😊", name: "Happy" },
  { emoji: "😔", name: "Sad" },
  { emoji: "😌", name: "Calm" },
  { emoji: "😡", name: "Angry" },
  { emoji: "😴", name: "Tired" },
  { emoji: "🤔", name: "Thoughtful" },
  { emoji: "😎", name: "Cool" },
  { emoji: "🥳", name: "Excited" }
];

export default function JournalPage() {
  const [entry, setEntry] = useState('')
  const [savedEntries, setSavedEntries] = useState<JournalEntry[]>([])
  const [currentDate, setCurrentDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [showMoodSelector, setShowMoodSelector] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Format current date as YYYY-MM-DD
    const now = new Date()
    const formattedDate = now.toISOString().split('T')[0]
    setCurrentDate(formattedDate)

    // Fetch journal entries if user is authenticated
    if (session?.user) {
      fetchJournalEntries()
    }
  }, [session])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const fetchJournalEntries = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/journal')
      if (response.ok) {
        const data = await response.json()
        setSavedEntries(data)
      }
    } catch (error) {
      console.error('Error fetching journal entries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveEntry = async () => {
    if (!entry.trim() || !session?.user) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: entry,
          date: currentDate,
          mood: selectedMood
        }),
      })

      if (response.ok) {
        const newEntry = await response.json()
        setSavedEntries(prev => [newEntry, ...prev])
        setEntry('')
        setSelectedMood(null)
      } else {
        const errorData = await response.json()
        console.error('Error from server:', errorData)
        alert('Failed to save journal entry. Please try again.')
      }
    } catch (error) {
      console.error('Error saving journal entry:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const initiateDelete = (id: string) => {
    setConfirmDelete(id);
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  const handleDeleteEntry = async (id: string) => {
    if (!session?.user) return

    setIsDeleting(id)
    try {
      const response = await fetch(`/api/journal?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSavedEntries(prev => prev.filter(entry => entry.id !== id))
      }
    } catch (error) {
      console.error('Error deleting journal entry:', error)
    } finally {
      setIsDeleting(null)
      setConfirmDelete(null)
    }
  }

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className='w-full min-h-screen flex flex-col items-center justify-center bg-[#0E0E0E]'>
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="mt-4 text-white">Loading...</p>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className='w-full min-h-screen flex flex-col items-center justify-center bg-[#0E0E0E] p-4'>
        <div className="max-w-md w-full bg-zinc-900/80 backdrop-blur-md rounded-xl border border-zinc-800 p-8 shadow-xl text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
          <p className="text-zinc-400 mb-6">Please sign in to access your journal</p>
          <Link
            href="/auth/signin"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full min-h-screen flex flex-col items-center pt-24 bg-gradient-to-tl from-black via-zinc-900 to-black'>

      <div className='w-full max-w-3xl px-4 flex flex-col gap-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7, ease: easeInOut }}
          className='bg-transparent backdrop-blur-xl border border-zinc-300/10 rounded-lg shadow-lg p-6'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-2xl font-medium text-white'>Today&apos;s Entry</h2>
            <span className='text-zinc-400'>{formatDate(currentDate)}</span>
          </div>

          {/* Mood selector */}
          <MoodSelector
            moodOptions={moodOptions}
            selectedMood={selectedMood}
            setSelectedMood={setSelectedMood}
            showMoodSelector={showMoodSelector}
            setShowMoodSelector={setShowMoodSelector}
          />
          <JournalEntryForm
            entry={entry}
            setEntry={setEntry}
            handleSaveEntry={handleSaveEntry}
            isSaving={isSaving}
          />
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        ) : savedEntries.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7, ease: easeInOut }}
            className='bg-transparent backdrop-blur-3xl border border-zinc-300/10 rounded-lg shadow-lg p-6'>
            <h2 className='text-2xl font-medium text-white mb-4'>Previous Entries</h2>
            <JournalEntryList
              entries={savedEntries}
              moodOptions={moodOptions}
              confirmDelete={confirmDelete}
              isDeleting={isDeleting}
              initiateDelete={initiateDelete}
              cancelDelete={cancelDelete}
              handleDeleteEntry={handleDeleteEntry}
              formatDate={formatDate}
              formatTime={formatTime}
            />
          </motion.div>
        ) : (
          <div className='bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-lg shadow-lg p-6 text-center'>
            <p className='text-zinc-400'>No journal entries yet. Start writing today!</p>
          </div>
        )}

      </div>

      <div className='fixed bottom-4'>
        <FloatingDock items={[
          { title: "Home", icon: <HomeIcon />, href: "/" },
          { title: "Image", icon: <ImageIcon />, href: "/image" },
          { title: "Journal", icon: <FileIcon />, href: "/journal" },
        ]} />
      </div>
    </div>
  )
} 