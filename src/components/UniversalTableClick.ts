// UniversalTableClick.ts
// Usage: import { useUniversalTableClick } from './UniversalTableClick';
// Call useUniversalTableClick({ onView }) in your table setup and bind @click to handleRowClick

import { ref } from 'vue';

export function useUniversalTableClick<T = any>(onView: (entry: T) => void) {
  // Returns a handler to be used as @click on <tr> or <td>
  function handleRowClick(entry: T, event: MouseEvent) {
    // Prevent if clicking on a button or link inside the row
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;
    onView(entry);
  }
  return { handleRowClick };
}
