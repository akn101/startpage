import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_DATABASE_ID;
  if (!token || !dbId) return NextResponse.json({ tasks: [] });

  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ page_size: 5 }),
    next: { revalidate: 300 },
  });

  if (!res.ok) return NextResponse.json({ tasks: [] });

  const data = await res.json();
  const tasks = (data.results ?? []).map((page: {
    id: string;
    url: string;
    properties: Record<string, { title?: { plain_text: string }[]; status?: { name: string }; select?: { name: string } }>;
  }) => {
    const props = page.properties;
    // Try common title property names
    const titleProp = props["Name"] ?? props["Task"] ?? props["Title"] ?? Object.values(props).find((p) => p.title);
    const title = (titleProp as { title?: { plain_text: string }[] })?.title?.[0]?.plain_text ?? "Untitled";
    const statusProp = props["Status"] ?? props["状態"];
    const status = statusProp?.status?.name ?? statusProp?.select?.name ?? "";
    return { id: page.id, title, url: page.url, status };
  });

  return NextResponse.json({ tasks });
}
