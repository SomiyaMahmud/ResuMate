import React, { useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import useVoiceInput from '../hooks/useVoiceInput';

const VoiceInputButton = ({ value, onChange, className = '' }) => {
  const {
    isListening,
    transcript,
    isSupported,
    toggleListening,
    resetTranscript
  } = useVoiceInput();

  // Update the input value when transcript changes
  useEffect(() => {
    if (transcript) {
      // Append transcript to existing value
      const newValue = value ? `${value} ${transcript}` : transcript;
      onChange(newValue);
      resetTranscript();
    }
  }, [transcript]);

  // Don't render if not supported
  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
        isListening
          ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${className}`}
      title={isListening ? 'Stop recording' : 'Start voice input'}
    >
      {isListening ? (
        <MicOff className="w-4 h-4" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
};

export default VoiceInputButton;
