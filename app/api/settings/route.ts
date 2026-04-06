import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { isAuthorized } from "@/lib/auth";
import { error } from "console";
import { AwardIcon } from "lucide-react";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized"}, { status: 401 });

    try {
        const setting = await db.select().from(userSettings).limit(1);
        return NextResponse.json(setting[0] || { name: "User" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized"}, {status: 401 });
    try {
        const body = await request.json();
        const existing = await db.select().from(userSettings).limit(1);

        if (existing.length > 0) {
            await db.update(userSettings).set({ ...body, updatedAt: new Date() }).where(userSettings.id === existing[0].id);
        } else {
            await db.insert(userSettings).values(body);
        }
        return NextResponse.json({ success: true});
    } catch (error) {
        return NextResponse.json ({ error: "Failed to update settings!"}, { status: 500 })
    }
}