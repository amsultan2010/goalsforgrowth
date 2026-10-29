from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path.rstrip("/") == "/gallery":
            self.path = "/gallery/index.html"
        return super().do_GET()

    def send_error(self, code, message=None, explain=None):
        if code != 404:
            return super().send_error(code, message, explain)
        body = Path("404.html").read_bytes()
        self.send_response(404)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("X-Robots-Tag", "noindex")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 4173), Handler).serve_forever()
