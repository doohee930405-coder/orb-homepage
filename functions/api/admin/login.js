export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  try {
    const body = await context.request.json().catch(() => ({}));
    const password = (body.password || '').trim();

    if (password === '135700') {
      return new Response(
        JSON.stringify({
          success: true,
          authenticated: true,
          message: '원장님 인증이 완료되었습니다.',
        }),
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: '비밀번호가 올바르지 않습니다.',
      }),
      {
        status: 401,
        headers: corsHeaders,
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: '인증 요청 처리 중 오류가 발생했습니다.' }),
      { status: 500, headers: corsHeaders }
    );
  }
}
