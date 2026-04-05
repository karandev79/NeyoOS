import { NextResponse } from "next/server";
import { db } from "@/db";
import { moodEntries } from "@/db/schema";
import { isAuthorized } from "@/lib/auth";

// GET function
export async function GET(request: Request) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized"}, { status: 401});
    }
    try {
        const entries = await db
            .select()
            .from(moodEntries)
            .orderBy(moodEntries.createdAt);
        return NextResponse.json(entries);
    } catch (error) {
        console.error("Failed to fetch mood entries:", error);
        return NextResponse.json(
            { error: "Failed to fetch mood entries" },
            { status: 500 }
        );
    }
}

// POST function
export async function POST(request: Request) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await request.json();
        const { mood, note, energyLevel } = body;

        if (mood === undefined || mood < 1 || mood > 10) {
            return NextResponse.json(
                { error: "Mood must be between 1 and 10" },
                { status: 400 }
            );
        }

        const [entry] = await db
            .insert(moodEntries)
            .values({ mood, note, energyLevel })
            .returning();

        return NextResponse.json(entry, { status: 201 });
    } catch (error) {
        console.error("Failed to create mood entry:", error);
        return NextResponse.json(
            { error: "Failed to create mood entry" },
            { status: 500 }
        );
    }
}