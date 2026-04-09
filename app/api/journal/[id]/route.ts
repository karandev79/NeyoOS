import { NextResponse } from "next/server";
import { db } from "@/db";
import { thoughts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAuthorized } from "@/lib/auth";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const { id } = await params;
        console.log("deleting journal entry ID:", id);
        const result = await db.delete(thoughts).where(eq(thoughts.id, id));
        console.log("delete result:", result);
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("delete API error:", e);
        return NextResponse.json({ error: "failed to delete entry" }, { status: 500 });
    }
}