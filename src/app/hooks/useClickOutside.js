import { useEffect } from 'react';

/**
 * Hook to handle clicks outside of referenced element(s)
 * @param {React.RefObject|React.RefObject[]} refOrRefs - Single ref or array of refs to check
 * @param {function} onClickOutside - Callback function when click is outside
 */
export function useClickOutside(refOrRefs, onClickOutside) {
  useEffect(() => {
    const handle = (e) => {
      const refs = Array.isArray(refOrRefs) ? refOrRefs : [refOrRefs];
      if (refs.every(r => r.current && !r.current.contains(e.target))) {
        onClickOutside(e);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [refOrRefs, onClickOutside]);
}
