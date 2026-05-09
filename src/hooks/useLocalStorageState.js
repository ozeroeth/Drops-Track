import { useEffect, useRef, useState } from 'react';
import { readJSON, writeJSON } from '../utils/storage.js';

export default function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => {
    const stored = readJSON(key, undefined);
    if (stored === undefined) {
      return typeof initialValue === 'function' ? initialValue() : initialValue;
    }
    return stored;
  });

  const keyRef = useRef(key);

  useEffect(() => {
    keyRef.current = key;
  }, [key]);

  useEffect(() => {
    writeJSON(key, state);
  }, [key, state]);

  return [state, setState];
}
