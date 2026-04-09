import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const { username, password} = await request.json();
        if (username == process.env.USER && password === process.env.PASSWORD) {
            const cookieStore = await cookies();
            cookieStore.set("user_session", "is_authenti", {
                httpOnly: true,
                secure: process.env.NODE_ENV == "production",
                maxAge: 60 * 60 * 24 *7, // cookie vaild for 7days
                path: "/",
            });
            return NextResponse.json({ success: true});
        } // fail responses
        return NextResponse.json({ error: "Invalid Credentials"}, {status: 401});
    } catch (error) {
        return NextResponse.json({ error: "Auth error"}, { status: 500}); 

    }
}