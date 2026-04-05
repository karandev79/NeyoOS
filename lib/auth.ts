export function isAuthorized(request: Request) {
    const authHeader = request.headers.get("authorization");

    return authHeader == `Bearer ${process.env.API_KEY}`;
}