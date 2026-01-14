import "server-only";

type SendTelegramMessageOptions = {
  content: string;
  contact?: string;
  source?: string;
  userId?: string;
  parseMode?: "Markdown" | "MarkdownV2" | "HTML";
};

export async function sendTelegramMessage({ content, contact, source, userId: targetUserId, parseMode }: SendTelegramMessageOptions) {
  const token = process.env.TELEGRAM_BOT_API_KEY;
  const userId = targetUserId || process.env.TELEGRAM_USER_ID;
  const baseUrl = process.env.TELEGRAM_API_URL || "https://api.telegram.org";

  if (!token || !userId) {
    throw new Error("Telegram 凭证未配置，请设置 TELEGRAM_BOT_API_KEY 和 TELEGRAM_USER_ID");
  }

  const text = [content, contact ? `联系方式: ${contact}` : "", source ? `来源页面: ${source}` : ""].filter(Boolean).join("\n\n");

  const body: Record<string, unknown> = {
    chat_id: userId,
    text,
  };

  if (parseMode) {
    body.parse_mode = parseMode;
  }

  const response = await fetch(`${baseUrl}/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram API 返回错误：${response.status} ${errorText}`);
  }
}
