import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Image Download Proxy Function Initialized")

// 注意：要解决 "Missing authorization header" 错误，
// 请在 Supabase 控制台中将此函数设置为公开访问。
// 路径：项目设置 -> API -> Auth -> Functions -> proxyImageDownload -> Set to "No API Key Required"

Deno.serve(async (req: Request) => {
    try {
        // 从请求中获取下载链接
        const url = new URL(req.url);
        const imageUrl = url.searchParams.get('imageUrl');

        if (!imageUrl) {
            return new Response(
                JSON.stringify({ error: 'No image URL provided' }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                }
            )
        }

        // 使用 fetch 代理下载
        const imageResponse = await fetch(imageUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en-GB;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6,tr;q=0.5',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Upgrade-Insecure-Requests': '1',
                'Referer': 'https://www.xiaohongshu.com/'
            },
            redirect: 'follow',
        });

        if (!imageResponse.ok) {
            return new Response(
                JSON.stringify({ error: 'Failed to download image' }),
                {
                    status: imageResponse.status,
                    headers: { "Content-Type": "application/json" }
                }
            )
        }

        // 获取图片流
        const imageStream = imageResponse.body;
        if (!imageStream) {
            throw new Error('Image stream is null');
        }

        // 设置响应头
        const headers = new Headers();
        headers.set('Content-Type', imageResponse.headers.get('Content-Type') || 'image/jpeg');
        headers.set('Content-Disposition', 'attachment; filename="image.jpg"');

        // 创建并返回响应
        return new Response(imageStream, {
            status: 200,
            headers: headers,
        });
    } catch (error) {
        console.error('Error fetching image:', error);
        return new Response(
            JSON.stringify({ error: 'Internal Server Error' }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        )
    }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/proxyImageDownload?imageUrl=https://example.com/image.jpg' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

*/