import { NextResponse } from "next/server";
import { db } from "@/db";
import { moodEntries, habits, thoughts, focusSessions } from "@/db/schema";
import { isAuthorized } from "@/lib/auth";
import { gte } from "drizzle-orm";

export async function POST(request: Request) {
    if (!isAuthorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    try {
        const { timeframe, types } = await request.json();
        const now = new Date();
        let startDate = new Date();

        if (timeframe === "today") startDate.setHours(0, 0, 0, 0);
        else if (timeframe === "week") startDate.setDate(now.getDate() - 7);
        else if (timeframe === "month") startDate.setMonth(now.getMonth() - 1);

        const data: any = {};

        if (types.includes("moods")) {
            data.moods = await db.select().from(moodEntries).where(gte(moodEntries.createdAt, startDate));
        }
        if (types.includes("habits")) {
            data.habits = await db.select().from(habits);
        }
        if (types.includes("journal")) {
            data.journal = await db.select().from(thoughts).where(gte(thoughts.createdAt, startDate));
        }
        if (types.includes("focus")) {
            data.focus = await db.select().from(focusSessions).where(gte(focusSessions.createdAt, startDate));
        }

        const prompt = `
            Analyze the following for the timeframe: ${timeframe.toUpperCase()}.
            
            ${data.moods ? `Mood Logs: ${JSON.stringify(data.moods)}` : ''}
            ${data.journal ? `Journal Entries: ${JSON.stringify(data.journal)}` : ''}
            ${data.focus ? `Focus Sessions: ${JSON.stringify(data.focus)}` : ''}

            provide a concise "Command Briefing" in Markdown. 
            Include:
            1. **Mission Summary**: overall vibe and productivity.
            2. **Patterns Detected**: whats working or whats failing.
            3. **Tactical Advice**: 2-3 specific actions for the next ${timeframe === 'today' ? 'day' : 'week'}.
            keep it strictly professional and focused.
        `;

        const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.AI_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-120b",
                messages: [{ role: "user", content: prompt }]
            })
        });

        const aiData = await aiRes.json();

        if (!aiRes.ok || aiData.error) {
            console.error("OpenAI API Error Detail:", aiData);
            return NextResponse.json({
                error: `API error: ${aiData.error?.message || 'check api key or api status'}`
            }, { status: aiRes.status || 500 });
        }

        return NextResponse.json({ report: aiData.choices[0].message.content });

    } catch (e) {
        console.error("backend api error:", e);
        return NextResponse.json({ error: "failure: could not generate report" }, { status: 500 });
    }
}