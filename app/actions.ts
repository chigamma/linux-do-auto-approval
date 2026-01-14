"use server";

import { sendTelegramMessage } from "@/lib/telegram";
import { approveGroupMember } from "@/lib/linux-do";

export type ApplicationFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function handleApplication(_: ApplicationFormState, formData: FormData): Promise<ApplicationFormState> {
  const userId = (formData.get("userId") as string | null)?.trim() ?? "";
  const reason = (formData.get("reason") as string | null)?.trim() ?? "";
  const isAuthenticated = (formData.get("isAuthenticated") as string | null) === "true";
  const trustLevel = formData.get("trustLevel") as string | null;

  if (!userId) {
    return {
      status: "error",
      message: "请填写您的用户 ID",
    };
  }

  if (!reason) {
    return {
      status: "error",
      message: "请填写申请理由",
    };
  }

  const targetUserId = process.env.TELEGRAM_USER_ID;

  if (!targetUserId) {
    return {
      status: "error",
      message: "系统配置错误，请联系管理员",
    };
  }

  try {
    const authStatus = isAuthenticated ? "✅ 已通过 CONNECT 验证" : "⚠️ 未通过 OIDC 验证";
    const trustLevelInfo = trustLevel ? ` (TL${trustLevel})` : "";

    // 如果已登录且开启了自动审批，则自动通过申请
    const autoApprove = process.env.NEXT_PUBLIC_AUTO_APPROVE === "true";
    const groupId = process.env.CARDHUB_GROUP_ID;

    // 获取允许自动审批的最低信任等级
    const minTrustLevel = process.env.NEXT_PUBLIC_MIN_TRUST_LEVEL ? parseInt(process.env.NEXT_PUBLIC_MIN_TRUST_LEVEL, 10) : 0;
    const userTrustLevel = trustLevel ? parseInt(trustLevel, 10) : 0;

    // 判断是否满足自动审批条件
    const meetsAutoApprovalCriteria = autoApprove && isAuthenticated && groupId && userTrustLevel >= minTrustLevel;

    let approvalStatus = "";
    let successMessage = "申请已提交，请等待审核！";

    if (meetsAutoApprovalCriteria) {
      try {
        await approveGroupMember({
          usernames: [userId],
          groupId,
        });
        approvalStatus = "\n✅ *已自动通过审批*";
        successMessage = "申请已自动通过，欢迎加入板块！";
      } catch (approveError) {
        console.error("Auto-approve failed", approveError);

        // 判断是否是 API 错误
        const errorMessage = approveError instanceof Error ? approveError.message : String(approveError);

        if (errorMessage.includes("API 返回错误")) {
          // API 错误，建议用户重新申请
          return {
            status: "error",
            message: "自动审批失败，可能是网络问题或权限不足。请稍后重新提交申请，或退出登录后重新填写 ID 提交管理员进行手动审核。",
          };
        }

        // 其他错误，降级为手动审核
        approvalStatus = "\n⚠️ 自动审批失败，需要手动处理";
        successMessage = "申请已提交，请等待管理员审核！";
      }
    }

    // 发送 Telegram 通知（包含审批状态）
    await sendTelegramMessage({
      content: `*入组申请*\n\n用户 ID: \`${userId}\`\n认证状态: ${authStatus}${trustLevelInfo}${approvalStatus}\n\n申请理由:\n${reason}`,
      userId: targetUserId,
      parseMode: "Markdown",
    });

    return {
      status: "success",
      message: successMessage,
    };
  } catch (error) {
    console.error("Failed to send CardHub application via Telegram", error);
    return {
      status: "error",
      message: error instanceof Error ? `错误信息：${error.message}` : "提交失败，请稍后再试。",
    };
  }
}
