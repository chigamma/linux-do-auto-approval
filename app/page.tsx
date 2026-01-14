"use client";

import React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import { UserPlus, LogIn, LogOut } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { handleApplication, type ApplicationFormState } from "./actions";

const initialState: ApplicationFormState = {
  status: "idle",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-sm font-medium"
      disabled={pending}
    >
      {pending ? "提交中..." : "提交申请"}
    </button>
  );
}

function ApplicationForm({
  onStateChange,
  userIdValue,
  isAuthenticated,
  trustLevel,
}: {
  onStateChange?: (state: ApplicationFormState) => void;
  userIdValue?: string;
  isAuthenticated?: boolean;
  trustLevel?: number;
}) {
  const [userId, setUserId] = React.useState(userIdValue || "");

  // 当 userIdValue 改变时更新本地状态
  React.useEffect(() => {
    if (userIdValue) {
      setUserId(userIdValue);
    }
  }, [userIdValue]);

  const [, formAction] = useActionState(async (prevState: ApplicationFormState, formData: FormData) => {
    const result = await handleApplication(prevState, formData);
    if (onStateChange) onStateChange(result);
    return result;
  }, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="userId" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          用户 ID
        </label>
        <input
          id="userId"
          name="userId"
          type="text"
          required
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          readOnly={isAuthenticated}
          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 placeholder:text-zinc-400 read-only:bg-zinc-50 dark:read-only:bg-zinc-900/50 read-only:cursor-not-allowed"
          placeholder="请输入您的 Linux DO 用户名"
        />
        {isAuthenticated && <p className="text-xs text-zinc-500 dark:text-zinc-400">已通过 LINUX DO CONNECT 登录，用户 ID 已自动填充</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="reason" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          申请理由
        </label>
        <textarea
          id="reason"
          name="reason"
          required
          rows={5}
          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 placeholder:text-zinc-400 resize-none"
          placeholder="简单介绍一下自己，或说明想加入的原因..."
        />
      </div>

      <div className="flex flex-col gap-3">
        <SubmitButton />
      </div>

      <input type="hidden" name="isAuthenticated" value={isAuthenticated ? "true" : "false"} />
      {trustLevel !== undefined && <input type="hidden" name="trustLevel" value={trustLevel.toString()} />}
    </form>
  );
}

export default function CardHubApplicationPage() {
  const [applicationState, setApplicationState] = React.useState<ApplicationFormState>(initialState);
  const { data: session, status } = useSession();

  const userId = session?.user?.username || session?.user?.email || "";

  // 判断是否满足自动审批条件
  const autoApproveEnabled = process.env.NEXT_PUBLIC_AUTO_APPROVE === "true";
  const minTrustLevel = process.env.NEXT_PUBLIC_MIN_TRUST_LEVEL ? parseInt(process.env.NEXT_PUBLIC_MIN_TRUST_LEVEL, 10) : 0;
  const userTrustLevel = session?.user?.trustLevel ?? 0;
  const meetsAutoApproval = autoApproveEnabled && userTrustLevel >= minTrustLevel;

  return (
    <>
      <motion.header className="mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 border bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-sm border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-500 mb-6 transition-colors duration-500">
          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 animate-pulse" />
          APPLICATION
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4 font-mono transition-colors duration-500">
          入组申请<span className="text-zinc-300 dark:text-zinc-700">.</span>
        </h1>

        <p className="text-lg text-zinc-500 max-w-2xl leading-relaxed transition-colors duration-500">
          欢迎申请加入该板块~
          <br className="hidden md:block" />
          填写您的用户 ID 和申请理由，我们会尽快审核您的申请。
        </p>
      </motion.header>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-sm">
          <div className="max-w-2xl">
            {/* 登录状态显示 */}
            <div className="mb-6 flex items-center">
              {status === "loading" && (
                <div className="w-full h-full p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 text-sm flex items-center">
                  <p>正在加载...</p>
                </div>
              )}

              {status === "authenticated" && session?.user && (
                <div className="w-full p-4 border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/10 text-green-800 dark:text-green-200 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium mb-1">
                        已通过 LINUX DO CONNECT 登录
                        {meetsAutoApproval && " · 🎉 满足自动审批条件"}
                      </p>
                      <p className="text-xs opacity-80">
                        用户名: {session.user.username || session.user.email}
                        {session.user.trustLevel !== undefined && ` | 信任等级: TL${session.user.trustLevel}`}
                      </p>
                    </div>
                    <button
                      onClick={() => signOut()}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-green-200 dark:border-green-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <LogOut className="w-3 h-3" />
                      退出
                    </button>
                  </div>
                </div>
              )}

              {status === "unauthenticated" && (
                <div className="w-full p-4 border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-200 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium mb-1">推荐通过 LINUX DO CONNECT 登录</p>
                      <p className="text-xs opacity-80">登录后将自动填充您的用户 ID</p>
                    </div>
                    <button
                      onClick={() => signIn("linux-do")}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                      <LogIn className="w-3 h-3" />
                      登录
                    </button>
                  </div>
                </div>
              )}
            </div>

            <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 dark:text-white mb-2 font-mono">提交申请</h2>

            <ApplicationForm onStateChange={setApplicationState} userIdValue={userId} isAuthenticated={status === "authenticated"} trustLevel={session?.user?.trustLevel} />
          </div>
        </div>
      </motion.div>

      {/* 成功或失败提示区域 */}
      {applicationState.status === "success" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-4 p-4 border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/10 text-green-800 dark:text-green-200 text-sm backdrop-blur-sm"
        >
          <p className="flex items-start gap-2">
            <UserPlus className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{applicationState.message}</span>
          </p>
        </motion.div>
      )}
      {applicationState.status === "error" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-4 p-4 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-200 text-sm backdrop-blur-sm"
        >
          <p className="flex items-start gap-2">
            <UserPlus className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{applicationState.message}</span>
          </p>
        </motion.div>
      )}
    </>
  );
}
