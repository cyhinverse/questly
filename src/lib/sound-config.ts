// Sound configuration for WAV files
// Add your WAV files to public/audio/ folder and update this config

export const SOUND_CONFIG = {
  // Map sound types to WAV file paths
  audioFiles: {
    click: '/audio/mouseClick.wav',
    success: '/audio/success.wav',        // Add success.wav to public/audio/
    error: '/audio/error.wav',            // Add error.wav to public/audio/
    answerSelect: '/audio/mouseClick.wav',    // Using mouseClick.wav temporarily
    correctAnswer: '/audio/correct.wav',  // Add correct.wav to public/audio/
    wrongAnswer: '/audio/wrong.wav',      // Add wrong.wav to public/audio/
  },
  
  // Volume levels for each sound type (0.0 to 1.0)
  volumes: {
    click: 0.3,
    success: 0.4,
    error: 0.2,
    answerSelect: 0.25,
    correctAnswer: 0.5,
    wrongAnswer: 0.2,
  }
};

// Recommended WAV file names and descriptions:
/*
public/audio/
├── mouseClick.wav     ✅ (already exists) - Button click sound
├── success.wav        - Success/achievement sound (e.g., bell chime)
├── error.wav          - Error/warning sound (e.g., low beep)
├── select.wav         - Answer selection sound (e.g., soft click)
├── correct.wav        - Correct answer sound (e.g., happy chime)
└── wrong.wav          - Wrong answer sound (e.g., gentle buzz)

File requirements:
- Format: WAV
- Duration: 0.1-0.5 seconds (short sounds work best)
- Size: < 100KB each (for fast loading)
- Quality: 44.1kHz, 16-bit or 24-bit
- Volume: Normalized to prevent clipping
*/
