$source = @'
using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;

public static class DictaLearnServer
{
    private static string root;
    private static readonly UTF8Encoding Utf8 = new UTF8Encoding(false);

    public static void Run(string contentRoot, int port)
    {
        root = Path.GetFullPath(contentRoot).TrimEnd(Path.DirectorySeparatorChar);
        var listener = new TcpListener(IPAddress.Loopback, port);
        listener.Start();

        while (true)
        {
            var client = listener.AcceptTcpClient();
            ThreadPool.QueueUserWorkItem(HandleClient, client);
        }
    }

    private static void HandleClient(object state)
    {
        using (var client = (TcpClient)state)
        {
            client.ReceiveTimeout = 5000;
            client.SendTimeout = 15000;
            using (var stream = client.GetStream())
            using (var reader = new StreamReader(stream, Utf8, false, 4096, true))
            {
                try
                {
                    var requestLine = reader.ReadLine();
                    if (String.IsNullOrWhiteSpace(requestLine)) return;

                    string header;
                    while (!String.IsNullOrEmpty(header = reader.ReadLine())) { }

                    var parts = requestLine.Split(' ');
                    if (parts.Length < 2 || (parts[0] != "GET" && parts[0] != "HEAD"))
                    {
                        Respond(stream, "405 Method Not Allowed", "text/plain; charset=utf-8", Utf8.GetBytes("Method Not Allowed"), false);
                        return;
                    }

                    var rawTarget = parts[1].Split('?')[0];
                    var relative = Uri.UnescapeDataString(rawTarget).TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                    if (String.IsNullOrWhiteSpace(relative)) relative = "index.html";

                    var filePath = Path.GetFullPath(Path.Combine(root, relative));
                    var insideRoot = filePath.StartsWith(root + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase);
                    if (!insideRoot || !File.Exists(filePath))
                    {
                        Respond(stream, "404 Not Found", "text/plain; charset=utf-8", Utf8.GetBytes("File Not Found"), parts[0] == "HEAD");
                        return;
                    }

                    var body = File.ReadAllBytes(filePath);
                    Respond(stream, "200 OK", MimeType(Path.GetExtension(filePath)), body, parts[0] == "HEAD");
                }
                catch (IOException) { }
                catch (SocketException) { }
            }
        }
    }

    private static void Respond(Stream stream, string status, string contentType, byte[] body, bool headOnly)
    {
        var headers = Utf8.GetBytes("HTTP/1.1 " + status + "\r\nContent-Type: " + contentType + "\r\nContent-Length: " + body.Length + "\r\nConnection: close\r\n\r\n");
        stream.Write(headers, 0, headers.Length);
        if (!headOnly && body.Length > 0) stream.Write(body, 0, body.Length);
    }

    private static string MimeType(string extension)
    {
        switch (extension.ToLowerInvariant())
        {
            case ".html": return "text/html; charset=utf-8";
            case ".js": return "application/javascript; charset=utf-8";
            case ".json": return "application/json; charset=utf-8";
            case ".css": return "text/css; charset=utf-8";
            case ".svg": return "image/svg+xml";
            case ".png": return "image/png";
            case ".ico": return "image/x-icon";
            default: return "application/octet-stream";
        }
    }
}
'@

Add-Type -TypeDefinition $source -Language CSharp
$port = 5500
Write-Host "[DictaLearn Server] Running at: http://localhost:$port/index.html"
[DictaLearnServer]::Run((Get-Location).Path, $port)
