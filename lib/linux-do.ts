import "server-only";

type ApproveGroupMemberOptions = {
  usernames: string[];
  groupId: string;
};

export async function approveGroupMember({ usernames, groupId }: ApproveGroupMemberOptions) {
  const cookie = process.env.LINUX_DO_COOKIE;
  const csrf = process.env.LINUX_DO_CSRF_TOKEN;

  if (!cookie || !csrf) {
    throw new Error("Linux.do 凭证未配置，请联系管理员设置 LINUX_DO_COOKIE 和 LINUX_DO_CSRF_TOKEN");
  }

  const response = await fetch(`https://linux.do/groups/${groupId}/members.json`, {
    method: "PUT",
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-csrf-token": csrf,
      "x-requested-with": "XMLHttpRequest",
      cookie: cookie,
    },
    body: `usernames=${encodeURIComponent(usernames.join(","))}&notify_users=true`,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Linux.do API 返回错误：${response.status} ${errorText}`);
  }

  return await response.json();
}
