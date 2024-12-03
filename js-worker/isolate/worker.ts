self.onmessage = async (event) => {
  if (event.data.cmd === "start") {
    const port = 8003;
    const handler = (request: Request): Response => {
      const body = `Your user-agent is:\n\n${request.headers.get("user-agent") ?? "Unknown"
        }`;

      return new Response(body, { status: 200 });
    };

    console.log(`HTTP server running. Access it at: http://localhost:${port}/`);
    Deno.serve({ port }, handler);
    const headers = await fetch('http://api.github.com/status').then(d => {
      return d.headers;
    });
    console.log("worker:github_headers:", headers); // postMessage 不会传dom headers
    self.postMessage({ result: headers, extra: { a: 1 } });
  }
};
