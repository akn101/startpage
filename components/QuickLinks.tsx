"use client";

import { quickLinks } from "@/lib/config";

function getFaviconUrl(url: string) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return null;
  }
}

export default function QuickLinks() {
  return (
    <div className="links-grid glass">
      {quickLinks.map((link) => {
        const favicon = getFaviconUrl(link.url);
        return (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-item"
          >
            <div className="link-icon">
              {favicon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={favicon} alt={link.label} width={24} height={24} />
              ) : (
                <span className="link-fallback">
                  {link.label.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <span className="link-label">{link.label}</span>
          </a>
        );
      })}
    </div>
  );
}
