import React from 'react';
import { JournalEntryItem } from './JournalEntryItem';

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

interface JournalEntryListProps {
  entries: JournalEntry[];
  moodOptions: MoodOption[];
  confirmDelete: string | null;
  isDeleting: string | null;
  initiateDelete: (id: string) => void;
  cancelDelete: () => void;
  handleDeleteEntry: (id: string) => void;
  formatDate: (date: string) => string;
  formatTime: (date: string) => string;
}

export const JournalEntryList: React.FC<JournalEntryListProps> = ({
  entries,
  moodOptions,
  confirmDelete,
  isDeleting,
  initiateDelete,
  cancelDelete,
  handleDeleteEntry,
  formatDate,
  formatTime,
}) => (
  <div className='flex flex-col gap-4 max-h-96 overflow-y-auto'>
    {entries.map((entry) => (
      <JournalEntryItem
        key={entry.id}
        entry={entry}
        moodOptions={moodOptions}
        confirmDelete={confirmDelete}
        isDeleting={isDeleting}
        initiateDelete={initiateDelete}
        cancelDelete={cancelDelete}
        handleDeleteEntry={handleDeleteEntry}
        formatDate={formatDate}
        formatTime={formatTime}
      />
    ))}
  </div>
);
