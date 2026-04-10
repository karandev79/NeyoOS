import { NextResponse } from "next/server";
import { db } from "@/db";
import { focusSessions } from "@/db/schema";
import { isAuthorized } from "@/lib/auth";
import { desc, sql } from "drizzle-orm";

export async function GET(request: Request) {
    if (!isAuthorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    try {
        const sessions = await db.select().from(focusSessions)
            .where(sql`DATE(${focusSessions.createdAt}) = CURRENT_DATE`)
            .orderBy(desc(focusSessions.createdAt));
        return NextResponse.json(sessions);
    } catch (e) {
        return NextResponse.json({ error: "failed to fetch sessions" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!isAuthorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    try {
        const { type, duration } = await request.json();
        const [session] = await db.insert(focusSessions).values({ type, duration }).returning();
        return NextResponse.json(session, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: "failed to log session" }, { status: 500 });
    }
}