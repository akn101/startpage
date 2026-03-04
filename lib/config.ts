export interface QuickLink {
  label: string;
  url: string;
  color?: string;
}

export const quickLinks: QuickLink[] = [
  { label: "GitHub", url: "https://github.com", color: "#88C0D0" },
  { label: "Gmail", url: "https://mail.google.com", color: "#BF616A" },
  { label: "YouTube", url: "https://youtube.com", color: "#D08770" },
  { label: "Claude", url: "https://claude.ai", color: "#B48EAD" },
  { label: "Linear", url: "https://linear.app", color: "#81A1C1" },
  { label: "Notion", url: "https://notion.so", color: "#8FBCBB" },
  { label: "Twitter", url: "https://x.com", color: "#88C0D0" },
  { label: "Reddit", url: "https://reddit.com", color: "#D08770" },
];

export const idleTimeoutMs = 3 * 60 * 1000; // 3 minutes
