import { useState, useEffect, useRef } from 'react';

export default function usePlayback(initialSpeed = 300) {
  const [steps, setSteps] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  const onCompleteRef = useRef(null);

  // Auto-play loop
  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;

    if (currentIdx >= steps.length) {
      setIsPlaying(false);
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
      return;
    }

    const timer = setTimeout(() => {
      setCurrentIdx((prevIdx) => {
        const nextIdx = prevIdx + 1;
        if (nextIdx >= steps.length) {
          setIsPlaying(false);
          if (onCompleteRef.current) {
            // Use a timeout to let the last render commit first
            setTimeout(() => {
              if (onCompleteRef.current) onCompleteRef.current();
            }, 50);
          }
          return prevIdx; // Stay at the end index
        }
        return nextIdx;
      });
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentIdx, steps.length, speed]);

  const load = (newSteps, onComplete = null) => {
    setSteps(newSteps);
    setCurrentIdx(0);
    onCompleteRef.current = onComplete;
    setIsPlaying(newSteps.length > 0);
  };

  const play = () => {
    if (steps.length === 0) return;
    if (currentIdx >= steps.length - 1) {
      setCurrentIdx(0);
    }
    setIsPlaying(true);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const stop = () => {
    setIsPlaying(false);
    setSteps([]);
    setCurrentIdx(0);
    onCompleteRef.current = null;
  };

  const stepForward = () => {
    setIsPlaying(false);
    if (currentIdx < steps.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const stepBackward = () => {
    setIsPlaying(false);
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const currentStep = steps[currentIdx] || null;

  return {
    steps,
    currentIdx,
    isPlaying,
    speed,
    currentStep,
    load,
    play,
    pause,
    stop,
    stepForward,
    stepBackward,
    setSpeed,
    setCurrentIdx,
    setIsPlaying
  };
}
