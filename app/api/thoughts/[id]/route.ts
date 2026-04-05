import { NextResponse } from "next/server";
import { db } from "@/db";
import { thoughts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authUid } from "drizzle-orm/neon";
import { isAuthorized } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

// GET function
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const [thought] = await db
            .select()
            .from(thoughts)
            .where(eq(thoughts.id, id));

        if (!thought) {
            return NextResponse.json(
                { error: "Thought not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(thought);
    } catch (error) {
        console.error("Failed to fetch thought:", error);
        return NextResponse.json(
            { error: "Failed to fetch thought" },
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
            .update(thoughts)
            .set(body)
            .where(eq(thoughts.id, id))
            .returning();

        if (!updated) {
            return NextResponse.json(
                { error: "Thought not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Failed to update thought:", error);
        return NextResponse.json(
            { error: "Failed to update thought" },
            { status: 500 }
        );
    }
}

// DELETE function
export async function DELETE(request: Request, { params }: RouteParams) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { id } = await params;
        const [deleted] = await db
            .delete(thoughts)
            .where(eq(thoughts.id, id))
            .returning();

        if (!deleted) {
            return NextResponse.json(
                { error: "Thought not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Thought deleted" });
    } catch (error) {
        console.error("Failed to delete thought:", error);
        return NextResponse.json(
            { error: "Failed to delete thought" },
            { status: 500 }
        );
    }
}