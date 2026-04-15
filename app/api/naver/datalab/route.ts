export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

function fmtDate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = (searchParams.get("keyword") ?? "").trim();
  if (!keyword) return jsonError("keyword is required");

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return jsonError("Missing NAVER_CLIENT_ID or NAVER_CLIENT_SECRET", 500);
  }

  const end = new Date();
  const start = new Date(end);
  start.setMonth(start.getMonth() - 1);

  const body = {
    startDate: fmtDate(start),
    endDate: fmtDate(end),
    timeUnit: "date",
    keywordGroups: [
      {
        groupName: keyword,
        keywords: [keyword],
      },
    ],
  };

  const upstream = await fetch("https://openapi.naver.com/v1/datalab/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
    body: JSON.stringify(body),
  });

  const text = await upstream.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!upstream.ok) {
    const msg =
      (data && typeof data === "object" && (data as any).errorMessage) ||
      `Upstream error (${upstream.status})`;
    return Response.json({ error: msg, upstream: data }, { status: upstream.status });
  }

  return Response.json(data, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

