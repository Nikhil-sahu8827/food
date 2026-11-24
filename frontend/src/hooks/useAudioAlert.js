import { useRef, useCallback, useState, useEffect } from 'react';

/**
 * Robust restaurant kitchen bell & order ring hook using Web Audio API.
 * Synthesizes authentic metallic kitchen bell strikes ("Ding-Ding!").
 * Works 100% offline without external audio files and handles browser autoplay policies.
 */
export const useAudioAlert = () => {
  const audioContextRef = useRef(null);
  const ringIntervalRef = useRef(null);
  const autoStopTimeoutRef = useRef(null);
  const [isRinging, setIsRinging] = useState(false);

  const getAudioContext = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioContext();
      }

      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      return audioContextRef.current;
    } catch (e) {
      console.warn('AudioContext initialization error:', e);
      return null;
    }
  }, []);

  // Single double-bell strike ("Ding-Ding!")
  const playBellStrike = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      const playStrike = (startTime, fundamentalFreq) => {
        // Primary fundamental metallic tone
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(fundamentalFreq, startTime);
        gain1.gain.setValueAtTime(0.35, startTime);
        gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.65);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(startTime);
        osc1.stop(startTime + 0.65);

        // High harmonic sparkle for brass bell overtone
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(fundamentalFreq * 2.1, startTime);
        gain2.gain.setValueAtTime(0.18, startTime);
        gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(startTime);
        osc2.stop(startTime + 0.45);
      };

      // Strike 1 (High bell strike)
      playStrike(now, 987.77); // B5 note

      // Strike 2 (Quick succession response strike)
      playStrike(now + 0.22, 1318.51); // E6 note
    } catch (e) {
      console.warn('Error playing bell strike:', e);
    }
  }, [getAudioContext]);

  // Start continuous ringing until acknowledged
  const startContinuousRing = useCallback(() => {
    // Clear any existing ring
    if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    if (autoStopTimeoutRef.current) clearTimeout(autoStopTimeoutRef.current);

    setIsRinging(true);
    playBellStrike();

    // Repeat every 1.8 seconds
    ringIntervalRef.current = setInterval(() => {
      playBellStrike();
    }, 1800);

    // Auto-stop after 30 seconds if unattended
    autoStopTimeoutRef.current = setTimeout(() => {
      stopContinuousRing();
    }, 30000);
  }, [playBellStrike]);

  const stopContinuousRing = useCallback(() => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
    setIsRinging(false);
  }, []);

  // Play single notification chime
  const playNotificationSound = useCallback(() => {
    playBellStrike();
  }, [playBellStrike]);

  useEffect(() => {
    return () => {
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
      if (autoStopTimeoutRef.current) clearTimeout(autoStopTimeoutRef.current);
    };
  }, []);

  return {
    isRinging,
    playNotificationSound,
    playBellStrike,
    startContinuousRing,
    stopContinuousRing,
  };
};
