import { NextResponse } from "next/server";
import { db } from "@/db";
import { thoughts } from "@/db/schema";
import { isAuthorized } from "@/lib/auth";

// GET function
export async function GET(request: Request) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const allThoughts = await db
            .select()
            .from(thoughts)
            .orderBy(thoughts.createdAt);
        return NextResponse.json(allThoughts);
    } catch (error) {
        console.error("Failed to fetch thoughts:", error);
        return NextResponse.json(
            { error: "Failed to fetch thoughts" },
            { status: 500 }
        );
    }
}

// POST function
export async function POST(request: Request) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, {status: 401 });
    }
    try {
        const body = await request.json();
        const { content, tags, isPinned } = body;

        if (!content) {
            return NextResponse.json(
                { error: "Content is required" },
                { status: 400 }
            );
        }

        const [newThought] = await db
            .insert(thoughts)
            .values({ content, tags, isPinned })
            .returning();

        return NextResponse.json(newThought, { status: 201 });
    } catch (error) {
        console.error("Failed to create thought:", error);
        return NextResponse.json(
            { error: "Failed to create thought" },
            { status: 500 }
        );
    }
}