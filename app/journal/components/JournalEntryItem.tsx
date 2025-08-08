import React from 'react';
import { Trash2Icon, XIcon, CheckIcon, Loader2 } from 'lucide-react';

interface JournalEntry {
  id: string;
  content: string;
  date: string;
  mood?: string | null;
  createdAt: string;
}

interface MoodOption {
  emoji: string;
  name: string;
}

interface JournalEntryItemProps {
  entry: JournalEntry;
  moodOptions: MoodOption[];
  confirmDelete: string | null;
  isDeleting: string | null;
  initiateDelete: (id: string) => void;
  cancelDelete: () => void;
  handleDeleteEntry: (id: string) => void;
  formatDate: (date: string) => string;
  formatTime: (date: string) => string;
}

export const JournalEntryItem: React.FC<JournalEntryItemProps> = ({
  entry,
  moodOptions,
  confirmDelete,
  isDeleting,
  initiateDelete,
  cancelDelete,
  handleDeleteEntry,
  formatDate,
  formatTime,
}) => (
  <div className='border-b border-zinc-800 pb-4'>
    <div className='flex justify-between items-center mb-2'>
      <div className="flex items-center gap-2">
        <span className='font-medium text-zinc-300'>{formatDate(entry.date)}</span>
        {entry.mood && (
          <span className="px-2 py-0.5 bg-zinc-700/20 border border-zinc-300/10 rounded-full text-sm">
            {(moodOptions.find(m => m.name === entry.mood)?.emoji || '') + ' ' + entry.mood}
          </span>
        )}
      </div>
      <div className='flex items-center gap-2 '>
        <span className='text-sm text-zinc-100'>{formatTime(entry.createdAt)}</span>
        {confirmDelete === entry.id ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleDeleteEntry(entry.id)}
              disabled={isDeleting === entry.id}
              className='text-green-500 hover:text-green-400 transition-colors'
              aria-label="Confirm delete"
            >
              {isDeleting === entry.id ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckIcon size={16} />
              )}
            </button>
            <button
              onClick={cancelDelete}
              className='text-red-500 hover:text-red-400 transition-colors'
              aria-label="Cancel delete"
            >
              <XIcon size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => initiateDelete(entry.id)}
            className='text-zinc-100 hover:text-red-500 transition-colors'
            aria-label="Delete entry"
          >
            <Trash2Icon size={16} />
          </button>
        )}
      </div>
    </div>
    <p className='text-zinc-400 whitespace-pre-wrap'>{entry.content}</p>
  </div>
);
