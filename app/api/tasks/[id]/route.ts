// functions for task IDs
import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAuthorized } from "@/lib/auth";
import { error } from "console";

type RouteParams = { params: Promise<{ id: string }> };

// GET task function
export async function GET(request: Request, { params }: RouteParams) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { id } = await params;
        const [task] = await db.select().from(tasks).where(eq(tasks.id, id));

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        return NextResponse.json(task);
    } catch (error) {
        console.error("Failed to fetch task:", error);
        return NextResponse.json(
            { error: "Failed to fetch task" },
            { status: 500 }
        );
    }
}

// PATCH task function
export async function PATCH(request: Request, { params }: RouteParams) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { id } = await params;
        const body = await request.json();
        const updates: Record<string, unknown> = {
            ...body,
            updatedAt: new Date(),
        };

        if (body.status === "done" && !body.completedAt) {
            updates.completedAt = new Date();
        }

        if (body.dueDate) {
            updates.dueDate = new Date(body.dueDate);
        }

        const [updated] = await db
            .update(tasks)
            .set(updates)
            .where(eq(tasks.id, id))
            .returning();

        if (!updated) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Failed to update task:", error);
        return NextResponse.json(
            { error: "Failed to update task" },
            { status: 500 }
        );
    }
}

// DELETE task function
export async function DELETE(request: Request, { params }: RouteParams) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { id } = await params;
        const [deleted] = await db
            .delete(tasks)
            .where(eq(tasks.id, id))
            .returning();

        if (!deleted) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Task deleted" });
    } catch (error) {
        console.error("Failed to delete task:", error);
        return NextResponse.json(
            { error: "Failed to delete task" },
            { status: 500 }
        );
    }
}