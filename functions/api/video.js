export async function onRequestPost({ request }) {
  const base = "https://numanajmal0-wan-video-api.hf.space";

  try {
    const body = await request.json();

    // Proxy generated files through the same origin to avoid browser CORS failures.
    if (body.download_url) {
      let fileUrl;
      try { fileUrl = new URL(body.download_url); }
      catch { return Response.json({ error: "Invalid video URL." }, { status: 400 }); }

      if (fileUrl.protocol !== "https:" ||
          !(fileUrl.hostname.endsWith(".hf.space") || fileUrl.hostname === "huggingface.co" ||
            fileUrl.hostname.endsWith(".huggingface.co"))) {
        return Response.json({ error: "Video host is not allowed." }, { status: 400 });
      }

      const fileResponse = await fetch(fileUrl.toString());
      if (!fileResponse.ok) {
        return Response.json({ error: "Could not retrieve generated clip (" + fileResponse.status + ")." }, { status: 502 });
      }
      return new Response(fileResponse.body, {
        headers: {
          "Content-Type": fileResponse.headers.get("content-type") || "video/mp4",
          "Cache-Control": "no-store"
        }
      });
    }

    if (body.event_id) {
      const res = await fetch(
        `${base}/gradio_api/call/generate/${encodeURIComponent(body.event_id)}`
      );
      return new Response(await res.text(), {
        status: res.status,
        headers: { "Content-Type": "text/event-stream" }
      });
    }

    if (!body.prompt?.trim()) {
      return Response.json({ error: "Please enter a video prompt." }, { status: 400 });
    }

    const res = await fetch(`${base}/gradio_api/call/v2/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model_key: "wan-base",
        prompt: body.prompt,
        negative_prompt: body.negative_prompt || "",
        width: body.width || 480,
        height: body.height || 832,
        num_frames: body.num_frames || 21,
        steps: body.steps || 20,
        guidance_scale: body.guidance_scale || 5,
        seed: body.seed ?? -1,
        lora_scale: 1,
        custom_ckpt: ""
      })
    });

    return new Response(await res.text(), {
      status: res.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return Response.json(
      { error: String(error.message || "API connection failed.") },
      { status: 500 }
    );
  }
}