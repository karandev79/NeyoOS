import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { isAuthorized } from "@/lib/auth";
import { is } from "drizzle-orm";

// GET function
export async function GET(request: Request) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const allTasks = await db.select().from(tasks).orderBy(tasks.createdAt);
        return NextResponse.json(allTasks);
    } catch (error) {
        console.error("Failed to fetch tasks:", error);
        return NextResponse.json(
            { error: "Failed to fetch tasks" },
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
        const { title, description, priority, dueDate, status } = body;

        if (!title) {
            return NextResponse.json(
                { error: "Title is required" },
                { status: 400 }
            );
        }

        const [newTask] = await db
            .insert(tasks)
            .values({
                title,
                description,
                priority,
                status,
                dueDate: dueDate ? new Date(dueDate) : undefined,
            })
            .returning();

        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        console.error("Failed to create task:", error);
        return NextResponse.json(
            { error: "Failed to create task" },
            { status: 500 }
        );
    }
}