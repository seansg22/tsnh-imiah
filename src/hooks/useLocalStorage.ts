import { useEffect, useRef, useState } from 'react';
import { APPLIED_EVENT } from '../lib/cloudSync';

function read<T>(key: string, initialValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : initialValue;
  } catch {
    return initialValue;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => read(key, initialValue));
  const initialRef = useRef(initialValue);

  // a cloud merge rewrote localStorage: re-read this key
  useEffect(() => {
    const onApplied = () => setStoredValue(read(key, initialRef.current));
    window.addEventListener(APPLIED_EVENT, onApplied);
    return () => window.removeEventListener(APPLIED_EVENT, onApplied);
  }, [key]);

  const setValue = (value: T) => {
    setStoredValue(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue];
}
