// supabase/functions/proxyDownload/index.ts

import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  try {
    // 从请求中获取下载链接
    const url = new URL(req.url);
    const videoUrl = url.searchParams.get('videoUrl');

    if (!videoUrl) {
      return new Response(
        JSON.stringify({ error: 'No video URL provided' }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      )
    }

    // 使用 fetch 代理下载
    const videoResponse = await fetch(videoUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Cache-Control': 'no-cache',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': 'https://www.xiaohongshu.com/'  // 添加正确的 Referer
      },
      redirect: 'follow',
    });

    if (!videoResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to download video' }),
        {
          status: videoResponse.status,
          headers: { "Content-Type": "application/json" }
        }
      )
    }

    // 获取视频流
    const videoStream = videoResponse.body;
    if (!videoStream) {
      throw new Error('Video stream is null');
    }

    // 设置响应头
    const headers = new Headers();
    headers.set('Content-Type', 'video/mp4');
    headers.set('Content-Disposition', 'attachment; filename="video.mp4"');

    // 创建并返回响应
    return new Response(videoStream, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
})

// export default async (req, res) => {
//   try {
//     // 从请求中获取下载链接
//     const { videoUrl } = await req.json();

//     res.status(500).json({ 'success': 'hi' });


//     if (!videoUrl) {
//       return res.status(400).json({ error: 'No video URL provided' });
//     }

//     // 使用 fetch 代理下载
//     const videoResponse = await fetch(videoUrl, {
//       method: 'GET',
//       headers: {
//         'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
//         'Accept': '*/*',
//         'Cache-Control': 'no-cache',
//         'Accept-Encoding': 'gzip, deflate, br',
//         'Connection': 'keep-alive',
//         'Referer': 'https://www.xiaohongshu.com/'  // 添加正确的 Referer
//       },
//       redirect: 'follow',
//     });

//     if (!videoResponse.ok) {
//       return res.status(videoResponse.status).json({ error: 'Failed to download video' });
//     }

//     // 将视频流返回客户端
//     const videoStream = videoResponse.body;

//     res.setHeader('Content-Type', 'video/mp4');
//     videoStream.pipe(res);
//   } catch (error) {
//     console.error('Error fetching video:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/proxyDownload' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"videoUrl": "https://sns-video-qc.xhscdn.com/stream/110/410/01e6f60e8e6505e601037301923129131d_410.mp4?sign=baa38b2029a8d7636801cb482b0b4ce4&t=66fd3ee8"}'

*/
