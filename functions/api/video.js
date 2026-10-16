
export async function onRequestPost({ request }) {
  const base = "https://numanajmal0-wan-video-api.hf.space";

  try {
    const body = await request.json();

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
      return Response.json(
        { error: "Please enter a video prompt." },
        { status: 400 }
      );
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

    const result = await res.text();

    return new Response(result, {
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
