import { NextResponse } from "next/server";
import { db } from "@/db";
import { habits } from "@/db/schema";
import { isAuthorized } from "@/lib/auth";       

// GET function
export async function GET(request: Request) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const allHabits = await db.select().from(habits).orderBy(habits.createdAt);
        return NextResponse.json(allHabits);
    } catch (error) {
        console.error("Failed to fetch habits:", error);
        return NextResponse.json(
            { error: "Failed to fetch habits" },
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
        const { name, description, frequency, color } = body;

        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        const [newHabit] = await db
            .insert(habits)
            .values({ name, description, frequency, color })
            .returning();

        return NextResponse.json(newHabit, { status: 201 });
    } catch (error) {
        console.error("Failed to create habit:", error);
        return NextResponse.json(
            { error: "Failed to create habit" },
            { status: 500 }
        );
    }
}