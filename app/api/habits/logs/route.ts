import { NextResponse } from "next/server";
import { db } from "@/db";
import { habitLogs } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { isAuthorized } from "@/lib/auth";

export async function GET(request: Request) {
    if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try { 
        const logs = await db.select().from(habitLogs);
        return NextResponse.json(logs);
     } catch (error) {
        return NextResponse.json({ error: "failed to fetch logs.." }, {status: 500});      
     }
}

export async function POST(request: Request) {
    if (!isAuthorized(request)) return NextResponse.json({ error: "unauthorized" }, {status: 401});

    try {
        const { habitId, date, completed } = await request.json();
        const existing = await db.select().from(habitLogs).where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.date, date))); // log habit

        if (existing.length > 0) {
            await db.update(habitLogs).set({ completed }).where(eq(habitLogs.id, existing[0].id));
        } else {
            await db.insert(habitLogs).values({ habitId, date, completed});
        }
        return NextResponse.json ({ success: true});
    } catch (error) {
        return NextResponse.json({ error: "Failed to log habot"}, {status:500}); // unable to log
    }
}