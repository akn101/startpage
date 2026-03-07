"use client";

// Opens the command palette (handles both Google search and /commands)
export default function SearchBar({ autoFocus }: { autoFocus?: boolean }) {
  const open = () => window.dispatchEvent(new CustomEvent("openCommandPalette"));

  return (
    <button
      type="button"
      className="search-trigger"
      onClick={open}
      aria-label="Open search"
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus={autoFocus}
    >
      <span className="search-trigger-icon">⌕</span>
      <span className="search-trigger-placeholder">Search or ⌘K…</span>
      <kbd className="search-trigger-kbd">⌘K</kbd>
    </button>
  );
}
