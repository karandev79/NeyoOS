// functions for mood IDs
import { NextResponse } from "next/server";
import { db } from "@/db";
import { moodEntries } from "@/db/schema";
import { eq, is } from "drizzle-orm";
import { isAuthorized } from "@/lib/auth";
import { error } from "console";

type RouteParams = { params: Promise<{ id: string }> };

// GET function
export async function GET(request: Request, { params }: RouteParams) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized"}, { status: 401});
    }
    try {
        const { id } = await params;
        const [entry] = await db
            .select()
            .from(moodEntries)
            .where(eq(moodEntries.id, id));

        if (!entry) {
            return NextResponse.json(
                { error: "Mood entry not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(entry);
    } catch (error) {
        console.error("Failed to fetch mood entry:", error);
        return NextResponse.json(
            { error: "Failed to fetch mood entry" },
            { status: 500 }
        );
    }
}

// PATCH function
export async function PATCH(request: Request, { params }: RouteParams) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { id } = await params;
        const body = await request.json();

        const [updated] = await db
            .update(moodEntries)
            .set(body)
            .where(eq(moodEntries.id, id))
            .returning();

        if (!updated) {
            return NextResponse.json(
                { error: "Mood entry not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Failed to update mood entry:", error);
        return NextResponse.json(
            { error: "Failed to update mood entry" },
            { status: 500 }
        );
    }
}

// DELETE function
export async function DELETE(request: Request, { params }: RouteParams) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized"}, { status: 401});
    }
    try {
        const { id } = await params;
        const [deleted] = await db
            .delete(moodEntries)
            .where(eq(moodEntries.id, id))
            .returning();

        if (!deleted) {
            return NextResponse.json(
                { error: "Mood entry not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Mood entry deleted" });
    } catch (error) {
        console.error("Failed to delete mood entry:", error);
        return NextResponse.json(
            { error: "Failed to delete mood entry" },
            { status: 500 }
        );
    }
}