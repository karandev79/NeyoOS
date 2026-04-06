export function isAuthorized(request: Request) {
    const authHeader = request.headers.get("authorization");

    return authHeader == `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`;
}