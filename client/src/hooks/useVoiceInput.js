import { useState, useEffect, useRef } from 'react';

const useVoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      // Initialize speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Changed to false for better control
      recognition.interimResults = false; // Only final results
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        finalTranscriptRef.current = '';
      };

      recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        if (result.isFinal) {
          const finalTranscript = result[0].transcript;
          finalTranscriptRef.current = finalTranscript;
          setTranscript(finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        // Don't show error for "no-speech" - user just didn't speak
        if (event.error !== 'no-speech') {
          console.error('Speech recognition error details:', event);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      console.warn('Speech recognition is not supported in this browser');
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      // Stop listening
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    } else {
      // Start listening
      try {
        finalTranscriptRef.current = '';
        setTranscript('');
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsListening(false);
      }
    }
  };

  const resetTranscript = () => {
    setTranscript('');
    finalTranscriptRef.current = '';
  };

  return {
    isListening,
    transcript,
    isSupported,
    toggleListening,
    resetTranscript
  };
};

export default useVoiceInput;