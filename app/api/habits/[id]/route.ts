// functions for habit IDs
import { NextResponse } from "next/server";
import { db } from "@/db";
import { habits } from "@/db/schema";
import { eq } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

// GET function
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const [habit] = await db.select().from(habits).where(eq(habits.id, id));

        if (!habit) {
            return NextResponse.json({ error: "Habit not found" }, { status: 404 });
        }

        return NextResponse.json(habit);
    } catch (error) {
        console.error("Failed to fetch habit:", error);
        return NextResponse.json(
            { error: "Failed to fetch habit" },
            { status: 500 }
        );
    }
}

// PATCH function
export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        const [updated] = await db
            .update(habits)
            .set({ ...body, updatedAt: new Date() })
            .where(eq(habits.id, id))
            .returning();

        if (!updated) {
            return NextResponse.json({ error: "Habit not found" }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Failed to update habit:", error);
        return NextResponse.json(
            { error: "Failed to update habit" },
            { status: 500 }
        );
    }
}

// DELETE function
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const [deleted] = await db
            .delete(habits)
            .where(eq(habits.id, id))
            .returning();

        if (!deleted) {
            return NextResponse.json({ error: "Habit not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Habit deleted" });
    } catch (error) {
        console.error("Failed to delete habit:", error);
        return NextResponse.json(
            { error: "Failed to delete habit" },
            { status: 500 }
        );
    }
}