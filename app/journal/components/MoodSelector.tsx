import React from 'react';

interface MoodOption {
  emoji: string;
  name: string;
}

interface MoodSelectorProps {
  moodOptions: MoodOption[];
  selectedMood: string | null;
  setSelectedMood: (mood: string) => void;
  showMoodSelector: boolean;
  setShowMoodSelector: (show: boolean) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  moodOptions,
  selectedMood,
  setSelectedMood,
  showMoodSelector,
  setShowMoodSelector,
}) => (
  <div className="mb-4">
    <div className="flex items-center gap-2 mb-2">
      <button
        onClick={() => setShowMoodSelector(!showMoodSelector)}
        className="flex items-center gap-1 text-zinc-300 hover:text-white transition-colors"
      >
        <span role="img" aria-label="mood">
          {selectedMood ? (moodOptions.find(m => m.name === selectedMood)?.emoji || '😊') : '😊'}
        </span>
        <span>{selectedMood ? `Feeling: ${selectedMood}` : "How are you feeling?"}</span>
      </button>
    </div>
    {showMoodSelector && (
      <div className="flex flex-wrap gap-2 p-2 bg-zinc-800/20 border border-zinc-300/20 backdrop-blur-md rounded-md mb-2">
        {moodOptions.map(mood => (
          <button
            key={mood.name}
            onClick={() => {
              setSelectedMood(mood.name);
              setShowMoodSelector(false);
            }}
            className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
              selectedMood === mood.name
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-700/30 border border-zinc-700/40 text-zinc-200 hover:bg-zinc-800 hover:cursor-pointer'
            }`}
          >
            <span>{mood.emoji}</span>
            <span>{mood.name}</span>
          </button>
        ))}
      </div>
    )}
  </div>
);
