import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return NextResponse.json({ prs: [] });

  const res = await fetch(
    "https://api.github.com/search/issues?q=is:pr+is:open+author:akn101&per_page=5&sort=updated",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        Accept: "application/vnd.github+json",
      },
      next: { revalidate: 300 },
    }
  );

  if (!res.ok) return NextResponse.json({ prs: [] });

  const data = await res.json();
  const prs = (data.items ?? []).map((item: { title: string; html_url: string; repository_url: string; created_at: string }) => ({
    title: item.title,
    url: item.html_url,
    repo: item.repository_url.split("/").slice(-1)[0],
    createdAt: item.created_at,
  }));

  return NextResponse.json({ prs });
}
