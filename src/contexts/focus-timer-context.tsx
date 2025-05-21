
"use client";

import type { ReactNode} from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;
const LOCAL_STORAGE_KEY_FOCUS_DURATION = 'focusTimerFocusDuration';
const LOCAL_STORAGE_KEY_BREAK_DURATION = 'focusTimerBreakDuration';
const LOCAL_STORAGE_KEY_TOTAL_FOCUS_TIME = 'focusTimerTotalFocusTime';
// It might be useful to persist isBreakTime and timeLeft if we want to resume perfectly after refresh,
// but that adds complexity. For now, we re-initialize timeLeft based on persisted durations.
// const LOCAL_STORAGE_KEY_IS_BREAK_TIME = 'focusTimerIsBreakTime';
// const LOCAL_STORAGE_KEY_TIME_LEFT = 'focusTimerTimeLeft';


interface FocusTimerContextType {
  timeLeft: number; // in seconds
  isRunning: boolean;
  isBreakTime: boolean;
  problemsSolvedThisSession: number;
  focusDuration: number; // in seconds
  breakDuration: number; // in seconds
  totalFocusTime: number; // in seconds
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (switchToFocus?: boolean) => void;
  incrementProblemsSolved: () => void;
  setFocusDuration: (minutes: number) => void;
  setBreakDuration: (minutes: number) => void;
  currentModeDisplay: string;
}

const FocusTimerContext = createContext<FocusTimerContextType | undefined>(undefined);

export function FocusTimerProvider({ children }: { children: ReactNode }) {
  const [focusDuration, setFocusDurationState] = useState(DEFAULT_FOCUS_MINUTES * 60);
  const [breakDuration, setBreakDurationState] = useState(DEFAULT_BREAK_MINUTES * 60);
  
  // Initialize timeLeft with a default, will be overwritten by useEffect on mount
  const [timeLeft, setTimeLeft] = useState(DEFAULT_FOCUS_MINUTES * 60); 
  
  const [isRunning, setIsRunning] = useState(false);
  const [isBreakTime, setIsBreakTime] = useState(false); // Default to not break time on load
  const [problemsSolvedThisSession, setProblemsSolvedThisSession] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);

  // Load settings and initialize timeLeft from localStorage on mount
  useEffect(() => {
    let initialFocus = DEFAULT_FOCUS_MINUTES * 60;
    let initialBreak = DEFAULT_BREAK_MINUTES * 60;
    // let initialIsBreak = false; // Assume starting in focus mode unless persisted
    // let initialTimeLeft = initialFocus;

    try {
      const storedFocus = localStorage.getItem(LOCAL_STORAGE_KEY_FOCUS_DURATION);
      if (storedFocus) {
        const parsed = parseInt(storedFocus, 10);
        if (!isNaN(parsed) && parsed > 0) initialFocus = parsed;
      }
      setFocusDurationState(initialFocus);

      const storedBreak = localStorage.getItem(LOCAL_STORAGE_KEY_BREAK_DURATION);
      if (storedBreak) {
        const parsed = parseInt(storedBreak, 10);
        if (!isNaN(parsed) && parsed > 0) initialBreak = parsed;
      }
      setBreakDurationState(initialBreak);
      
      const storedTotalFocus = localStorage.getItem(LOCAL_STORAGE_KEY_TOTAL_FOCUS_TIME);
      if (storedTotalFocus) {
        const parsed = parseInt(storedTotalFocus, 10);
        if (!isNaN(parsed) && parsed >= 0) setTotalFocusTime(parsed); else setTotalFocusTime(0);
      }

      // Persisting isBreakTime and timeLeft for exact resume is complex due to client-only localStorage.
      // For now, on load, we assume a reset state unless the timer was explicitly running.
      // If we were to persist timeLeft and isBreakTime:
      // const storedIsBreak = localStorage.getItem(LOCAL_STORAGE_KEY_IS_BREAK_TIME);
      // if (storedIsBreak) initialIsBreak = JSON.parse(storedIsBreak);
      // setIsBreakTime(initialIsBreak);
      //
      // const storedTimeLeft = localStorage.getItem(LOCAL_STORAGE_KEY_TIME_LEFT);
      // if (storedTimeLeft) {
      //   const parsed = parseInt(storedTimeLeft, 10);
      //   if (!isNaN(parsed) && parsed >=0) initialTimeLeft = parsed;
      // }
      // setTimeLeft(initialTimeLeft);

      // Simplified: Set timeLeft based on whether we assume it's break or focus mode initially
      // If we don't persist isBreakTime, it will always start in focus mode settings.
      if (!isBreakTime) { // isBreakTime is false by default
          setTimeLeft(initialFocus);
      } else {
          setTimeLeft(initialBreak);
      }

    } catch (error) {
      console.error("Error loading focus timer settings from localStorage", error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array: runs once on mount.

  // Persist settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_FOCUS_DURATION, focusDuration.toString());
    } catch (error) {
      console.error("Error saving focus duration to localStorage", error);
    }
  }, [focusDuration]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_BREAK_DURATION, breakDuration.toString());
    } catch (error) {
      console.error("Error saving break duration to localStorage", error);
    }
  }, [breakDuration]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_TOTAL_FOCUS_TIME, totalFocusTime.toString());
    } catch (error) {
      console.error("Error saving total focus time to localStorage", error);
    }
  }, [totalFocusTime]);

  // useEffect(() => {
  //   if (typeof window !== 'undefined') localStorage.setItem(LOCAL_STORAGE_KEY_IS_BREAK_TIME, JSON.stringify(isBreakTime));
  // }, [isBreakTime]);

  // useEffect(() => {
  //  if (typeof window !== 'undefined') localStorage.setItem(LOCAL_STORAGE_KEY_TIME_LEFT, timeLeft.toString());
  // }, [timeLeft]);


  const setFocusDuration = (minutes: number) => {
    const newDuration = minutes * 60;
    setFocusDurationState(newDuration);
    // If timer is not running and currently in focus mode, update timeLeft to new duration.
    if (!isRunning && !isBreakTime) {
      setTimeLeft(newDuration);
    }
  };

  const setBreakDuration = (minutes: number) => {
    const newDuration = minutes * 60;
    setBreakDurationState(newDuration);
    // If timer is not running and currently in break mode, update timeLeft to new duration.
    if (!isRunning && isBreakTime) {
      setTimeLeft(newDuration);
    }
  };
  
  const incrementProblemsSolved = useCallback(() => {
    setProblemsSolvedThisSession(prev => prev + 1);
  }, []);

  const startTimer = useCallback(() => {
    // If timeLeft is 0 (or less) for the current mode, reset it before starting
    if (timeLeft <= 0) {
        setTimeLeft(isBreakTime ? breakDuration : focusDuration);
    }
    setIsRunning(true);
  }, [timeLeft, isBreakTime, breakDuration, focusDuration]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback((switchToFocus: boolean = true) => {
    setIsRunning(false);
    if (switchToFocus) {
      setIsBreakTime(false);
      setTimeLeft(focusDuration);
    } else { 
      // Reset to current mode's full duration
      setTimeLeft(isBreakTime ? breakDuration : focusDuration);
    }
  }, [focusDuration, breakDuration, isBreakTime]);

  // Main timer logic
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) { // Also stop if timeLeft somehow becomes 0 or less while running
        if (isRunning && timeLeft <= 0) { // If it was running and time ran out
            if (!isBreakTime) { // Focus session ended
                setIsBreakTime(true);
                setTimeLeft(breakDuration);
                // Potentially trigger a notification here
              } else { // Break session ended
                setIsBreakTime(false);
                setTimeLeft(focusDuration);
                // Potentially trigger a notification here
              }
              // Pause the timer automatically after switching, user needs to press start for next session
              // Or, if auto-start next session is desired, keep isRunning true or call startTimer()
              setIsRunning(false); // Let's make it pause after switch
        }
        return;
    }

    const intervalId = setInterval(() => {
      if (!isBreakTime) {
        setTotalFocusTime(prevTotal => prevTotal + 1);
      }

      setTimeLeft(prevTime => {
        const newTime = prevTime - 1;
        if (newTime <= 0) {
          // The switching logic is now handled in the outer part of useEffect when timeLeft hits <=0
          // This ensures totalFocusTime is incremented for the last second.
          // clearInterval(intervalId); // Interval will be cleared by useEffect cleanup or when isRunning becomes false
          return 0; // Or newTime, which is 0 or negative
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, timeLeft, isBreakTime, focusDuration, breakDuration, setTotalFocusTime]);


  const currentModeDisplay = isBreakTime ? "休息中" : "專注中";

  return (
    <FocusTimerContext.Provider value={{ 
      timeLeft, 
      isRunning, 
      isBreakTime, 
      problemsSolvedThisSession, 
      focusDuration, 
      breakDuration, 
      totalFocusTime,
      startTimer, 
      pauseTimer, 
      resetTimer, 
      incrementProblemsSolved,
      setFocusDuration, 
      setBreakDuration, 
      currentModeDisplay
    }}>
      {children}
    </FocusTimerContext.Provider>
  );
}

export function useFocusTimerContext() {
  const context = useContext(FocusTimerContext);
  if (context === undefined) {
    throw new Error('useFocusTimerContext 必須在 FocusTimerProvider 中使用');
  }
  return context;
}
