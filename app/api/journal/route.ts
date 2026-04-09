import { NextResponse } from "next/server";
import { db } from "@/db";
import { thoughts } from "@/db/schema";
import { isAuthorized } from "@/lib/auth";

export async function GET(request: Request) {
    if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized"}, { status: 401 });
    try {
        const data = await db.select().from(thoughts).orderBy(thoughts.createdAt);
        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch journal" }, { status: 500});
    }
}

export async function POST(request: Request) {
    if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized"}, { status: 401});
    try {
        const { content, tags } = await request.json();
        const [newEntry] = await db.insert(thoughts).values({ content, tags }).returning();
        return NextResponse.json(newEntry, { status: 201});
    } catch (e) {
        return NextResponse.json({ error: "Failed to save entry" }, { status: 500 });
    }
}