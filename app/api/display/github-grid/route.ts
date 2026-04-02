import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

const GH_TOKEN = process.env.GITHUB_TOKEN!;

interface ContribDay { date: string; contributionCount: number }
interface ContribWeek { contributionDays: ContribDay[] }

export async function GET() {
  if (!GH_TOKEN || !await isAuthenticated()) return Response.json({ weeks: [], totalContributions: 0, streak: 0 });

  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 55); // ~8 weeks back

  const query = `{
    viewer {
      contributionsCollection(from: "${from.toISOString()}", to: "${now.toISOString()}") {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }`;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${GH_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    next: { revalidate: 300 },
  });

  if (!res.ok) return Response.json({ weeks: [], totalContributions: 0, streak: 0 });
  const data = await res.json();
  const cal = data?.data?.viewer?.contributionsCollection?.contributionCalendar;
  if (!cal) return Response.json({ weeks: [], totalContributions: 0, streak: 0 });

  // Compute current streak (consecutive days with ≥1 contribution, going back from today)
  const allDays: ContribDay[] = (cal.weeks as ContribWeek[]).flatMap((w) => w.contributionDays);
  const todayStr = now.toISOString().slice(0, 10);
  // Sort descending
  const sorted = [...allDays].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  for (const day of sorted) {
    if (day.date > todayStr) continue; // future (shouldn't happen)
    if (day.contributionCount > 0) streak++;
    else break;
  }

  return Response.json({ weeks: cal.weeks, totalContributions: cal.totalContributions, streak });
}
