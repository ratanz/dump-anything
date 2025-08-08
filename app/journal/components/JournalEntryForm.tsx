import React from 'react';

interface JournalEntryFormProps {
  entry: string;
  setEntry: (val: string) => void;
  handleSaveEntry: () => void;
  isSaving: boolean;
}

export const JournalEntryForm: React.FC<JournalEntryFormProps> = ({
  entry,
  setEntry,
  handleSaveEntry,
  isSaving,
}) => (
  <>
    <textarea
      className='w-full h-64 p-4 bg-transparent border border-zinc-100/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-zinc-300/90'
      placeholder="What's on your mind today?"
      value={entry}
      onChange={(e) => setEntry(e.target.value)}
    />
    <button
      className='mt-4 flex items-center justify-center w-full gap-2 bg-transparent backdrop-blur-lg border border-zinc-100 text-zinc-100 px-6 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
      onClick={handleSaveEntry}
      disabled={isSaving || !entry.trim()}
    >
      {isSaving ? (
        <>
          Saving...
        </>
      ) : (
        <>          
          Save Entry
        </>
      )}
    </button>
  </>
);
