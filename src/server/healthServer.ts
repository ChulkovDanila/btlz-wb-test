import http from "node:http";

export function startHealthServer(port: number): http.Server {
    const server = http.createServer((request, response) => {
        if (request.method === "GET" && request.url === "/health") {
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ status: "ok" }));
            return;
        }

        response.writeHead(404, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ error: "Not Found" }));
    });

    server.listen(port, () => {
        console.log(`[health] listening on ${port}`);
    });

    return server;
}
