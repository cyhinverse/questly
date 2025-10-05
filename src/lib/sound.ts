"use client";

import { SOUND_CONFIG } from "./sound-config";

// Sound utility functions for UI interactions using MP3 files
export class SoundManager {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private audioFiles: Map<string, string> = new Map();

  constructor() {
    // Initialize audio context on first user interaction
    if (typeof window !== 'undefined') {
      this.initializeAudioContext();
      this.setupAudioFiles();
    }
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch (error) {
    }
  }

  private setupAudioFiles() {
    // Map sound types to MP3 files from config
    Object.entries(SOUND_CONFIG.audioFiles).forEach(([soundType, filePath]) => {
      this.audioFiles.set(soundType, filePath);
    });
  }

  // Enable/disable sound
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  isSoundEnabled(): boolean {
    return this.isEnabled;
  }

  // Load MP3 file and convert to AudioBuffer
  private async loadAudioFile(soundType: string): Promise<AudioBuffer | null> {
    if (!this.audioContext) return null;

    // Check if already loaded
    if (this.audioBuffers.has(soundType)) {
      return this.audioBuffers.get(soundType)!;
    }

    const audioFile = this.audioFiles.get(soundType);
    if (!audioFile) return null;

    try {
      const response = await fetch(audioFile);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.audioBuffers.set(soundType, audioBuffer);
      return audioBuffer;
    } catch (error) {
      return null;
    }
  }

  // Play MP3 sound
  private async playMp3Sound(soundType: string, customVolume?: number) {
    if (!this.isEnabled || !this.audioContext) return;

    try {
      const audioBuffer = await this.loadAudioFile(soundType);
      if (!audioBuffer) return;

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = audioBuffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Use custom volume or config volume
      const volume = customVolume ?? SOUND_CONFIG.volumes[soundType as keyof typeof SOUND_CONFIG.volumes] ?? 0.5;
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

      source.start(this.audioContext.currentTime);
    } catch (error) {
    }
  }

  // Play click sound using MP3
  playClick() {
    this.playMp3Sound('click');
  }

  // Play success sound using MP3
  playSuccess() {
    this.playMp3Sound('success');
  }

  // Play error sound using MP3
  playError() {
    this.playMp3Sound('error');
  }

  // Play quiz answer select sound using MP3
  playAnswerSelect() {
    this.playMp3Sound('answerSelect');
  }

  // Play quiz correct answer sound using MP3
  playCorrectAnswer() {
    this.playMp3Sound('correctAnswer');
  }

  // Play quiz wrong answer sound using MP3
  playWrongAnswer() {
    this.playMp3Sound('wrongAnswer');
  }
}

// Global sound manager instance
export const soundManager = new SoundManager();

// Hook for using sound in components
export function useSound() {
  return {
    playClick: () => soundManager.playClick(),
    playSuccess: () => soundManager.playSuccess(),
    playError: () => soundManager.playError(),
    playAnswerSelect: () => soundManager.playAnswerSelect(),
    playCorrectAnswer: () => soundManager.playCorrectAnswer(),
    playWrongAnswer: () => soundManager.playWrongAnswer(),
    setEnabled: (enabled: boolean) => soundManager.setEnabled(enabled),
    isEnabled: () => soundManager.isSoundEnabled(),
  };
}
