export async function onRequest() {
  const asset = "const.js";
  const upstream = "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/esm/" + asset;
  try {
    const response = await fetch(upstream);
    if (!response.ok) return new Response("FFmpeg asset unavailable", { status: 502 });
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=86400"
      }
    });
  } catch {
    return new Response("Could not load FFmpeg asset", { status: 502 });
  }
}