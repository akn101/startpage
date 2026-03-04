"use client";

// Opens the command palette (handles both Google search and /commands)
export default function SearchBar() {
  const open = () => window.dispatchEvent(new CustomEvent("openCommandPalette"));

  return (
    <button
      type="button"
      className="search-trigger"
      onClick={open}
      aria-label="Open search"
    >
      <span className="search-trigger-icon">⌕</span>
      <span className="search-trigger-placeholder">Search or ⌘K…</span>
      <kbd className="search-trigger-kbd">⌘K</kbd>
    </button>
  );
}
