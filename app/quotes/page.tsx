'use client'
import React, { useEffect, useState } from 'react'
import { FloatingDock } from '@/components/ui/floating-dock'
import { HomeIcon, ImageIcon, FileIcon, QuoteIcon, Copy, Trash2, Loader2, Plus } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { easeInOut, motion } from 'motion/react'

interface QuoteItem {
  id: string;
  content: string;
  createdAt: string;
}

export default function QuotesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [quotes, setQuotes] = useState<QuoteItem[]>([])
  const [content, setContent] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user) {
      fetchQuotes()
    }
  }, [session])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const fetchQuotes = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/quotes')
      if (res.ok) {
        const data = await res.json()
        setQuotes(data)
      }
    } catch (e) {
      console.error('Error fetching quotes', e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!content.trim()) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (res.ok) {
        const newQuote = await res.json()
        setQuotes(prev => [newQuote, ...prev])
        setContent('')

      } else {
        const err = await res.json()
        alert(err.error || 'Failed to save quote')
      }
    } catch (e) {
      console.error('Save quote error', e)
      alert('Failed to save quote')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/quotes?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setQuotes(prev => prev.filter(q => q.id !== id))
      }
    } catch (e) {
      console.error('Delete quote error', e)
    } finally {
      setDeletingId(null)
    }
  }

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch (e) {
      console.error('Copy failed', e)
    }
  }

  if (status === 'loading') {
    return (
      <div className='w-full min-h-screen flex flex-col items-center justify-center bg-[#0E0E0E]'>
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="mt-4 text-white">Loading...</p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className='w-full min-h-screen flex flex-col items-center pt-24 bg-gradient-to-br from-black via-zinc-900 to-black'>
      <div className='w-full max-w-2xl px-4 flex flex-col gap-8'>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeInOut }}
          className='flex flex-col gap-2'
        >
          <h1 className='text-3xl font-semibold text-white tracking-tight'>Quotes</h1>
          <p className='text-zinc-400 text-sm'>Save lines that inspire you.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: easeInOut }}
          className='rounded-2xl border border-zinc-800 p-5 bg-transparent'
        >
          <div className='flex flex-col gap-3'>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && content.trim() && !isSaving) {
                  e.preventDefault();
                  handleSave();
                }
              }}
              placeholder='“Write your quote here...”'
              className='w-full h-28 p-5 italic leading-relaxed text-lg bg-transparent border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:ring-0 focus:border-zinc-700 placeholder:text-zinc-500'
            />
            <button
              onClick={handleSave}
              disabled={isSaving || !content.trim()}
              className='self-start inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSaving ? <Loader2 className='h-4 w-4 animate-spin' /> : <Plus className='h-4 w-4' />}
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: easeInOut }}
          className='flex flex-col gap-4'
        >
          {isLoading ? (
            <div className='flex justify-center py-12'>
              <Loader2 className='h-8 w-8 text-blue-500 animate-spin' />
            </div>
          ) : quotes.length === 0 ? (
            <p className='text-zinc-500 text-center'>No quotes yet.</p>
          ) : (
            <div className='flex flex-col gap-3 max-h-96 overflow-y-auto'>
              {quotes.map((q) => (
                <figure key={q.id} className='group relative rounded-xl border border-zinc-800 p-5 hover:border-zinc-700 transition-colors'>
                  <blockquote className='text-zinc-200 whitespace-pre-wrap text-lg italic leading-relaxed'>
                    “{q.content}”
                  </blockquote>

                  <div className='absolute top-5 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity '>
                    <button
                      aria-label='Copy quote'
                      title='Copy'
                      onClick={() => handleCopy(q.id, q.content)}
                      className='p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-white/10 hover:cursor-pointer'
                    >
                      {copiedId === q.id ? (
                        <span className='text-green-400 text-xs px-1'>Copied</span>
                      ) : (
                        <Copy className='h-4 w-4' />
                      )}
                    </button>
                    <button
                      aria-label='Delete quote'
                      title='Delete'
                      onClick={() => handleDelete(q.id)}
                      disabled={deletingId === q.id}
                      className='p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-50 hover:cursor-pointer'
                    >
                      {deletingId === q.id ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Trash2 className='h-4 w-4' />
                      )}
                    </button>
                  </div>
                </figure>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* dock */}
      <div className='fixed bottom-4'>
        <FloatingDock items={[
          { title: "Home", icon: <HomeIcon />, href: "/" },
          { title: "Image", icon: <ImageIcon />, href: "/image" },
          { title: "Journal", icon: <FileIcon />, href: "/journal" },
          { title: "Quotes", icon: <QuoteIcon />, href: "/quotes" },
        ]} />
      </div>
    </div>
  )
}


