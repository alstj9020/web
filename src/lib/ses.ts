import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER ?? "",
    pass: process.env.GMAIL_APP_PASSWORD ?? "",
  },
});

export const SES_FROM = process.env.GMAIL_USER ?? "";

export interface NewsletterArticle {
  title: string;
  summary: string;
  severity: string;
  cvss: number | null;
  cveIds: string[];
  action: string;
  sourceUrl: string;
}

export async function sendNewsletter({
  to,
  audience,
  articles,
}: {
  to: string;
  audience: string;
  articles: NewsletterArticle[];
}): Promise<void> {
  await transporter.sendMail({
    from: `하루보안 <${SES_FROM}>`,
    to,
    subject: `[하루보안] 오늘의 보안 브리핑`,
    html: buildHtml({ audience, articles }),
  });
}

function buildHtml({
  audience,
  articles,
}: {
  audience: string;
  articles: NewsletterArticle[];
}): string {
  const severityColor: Record<string, string> = {
    Critical: "#ef4444",
    High: "#f97316",
    Medium: "#f59e0b",
    Low: "#22c55e",
    Info: "#6b7280",
  };

  const articleRows = articles
    .map((a) => {
      const color = severityColor[a.severity] ?? "#6b7280";
      const cve = a.cveIds.length > 0 ? a.cveIds.slice(0, 2).join(", ") : "";
      const cvss = a.cvss !== null ? `CVSS ${a.cvss}` : "";
      return `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #e8eaed;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <span style="background:${color};color:#fff;font-size:11px;font-weight:bold;padding:2px 8px;border-radius:4px;">${a.severity}</span>
              ${cvss ? `<span style="color:#6bb8d4;font-size:11px;">${cvss}</span>` : ""}
              ${cve ? `<span style="color:#8a9bbd;font-size:11px;">${cve}</span>` : ""}
            </div>
            <a href="${a.sourceUrl}" style="font-size:15px;font-weight:bold;color:#1e2235;text-decoration:none;">${a.title}</a>
            <p style="margin:6px 0 0;font-size:13px;color:#3d4f6e;line-height:1.7;">${a.summary}</p>
            ${
              a.action
                ? `<p style="margin:8px 0 0;font-size:12px;color:#6bb8d4;"><strong>대응:</strong> ${a.action}</p>`
                : ""
            }
          </td>
        </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6f8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;max-width:600px;">

        <!-- 헤더 -->
        <tr>
          <td style="background:#1e2235;padding:28px 32px;">
            <p style="margin:0 0 4px;color:#6bb8d4;font-size:12px;font-weight:600;letter-spacing:1px;">DAILY SECURITY BRIEFING</p>
            <h1 style="margin:0;color:#f5f6f8;font-size:22px;font-weight:900;">하루보안</h1>
            <p style="margin:8px 0 0;color:#8a9bbd;font-size:13px;">${audience} 맞춤 보안 뉴스</p>
          </td>
        </tr>

        <!-- 본문 -->
        <tr>
          <td style="padding:24px 32px;">
            ${
              articles.length === 0
                ? `<p style="color:#a8b8d0;text-align:center;padding:32px 0;">오늘의 추천 기사가 없습니다.</p>`
                : `<table width="100%" cellpadding="0" cellspacing="0">${articleRows}</table>`
            }
          </td>
        </tr>

        <!-- 푸터 -->
        <tr>
          <td style="background:#f5f6f8;padding:20px 32px;text-align:center;border-top:1px solid #e8eaed;">
            <p style="margin:0;font-size:11px;color:#a8b8d0;">
              본 메일은 하루보안 구독자에게 발송됩니다.
              구독을 원하지 않으시면 <a href="{UNSUBSCRIBE_URL}" style="color:#6bb8d4;">구독 해지</a>를 클릭하세요.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
