import NextAuth from "next-auth";

// 在开发环境下，如果没有配置 secret，使用一个临时的
const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || (process.env.NODE_ENV === "development" ? "development-secret-please-change-in-production" : undefined);

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret,
  providers: [
    {
      id: "linux-do",
      name: "Linux.do",
      type: "oidc",
      issuer: "https://connect.linux.do/",
      authorization: {
        url: "https://connect.linux.do/oauth2/authorize",
        params: { scope: "openid profile email" },
      },
      token: "https://connect.linux.do/oauth2/token",
      userinfo: "https://connect.linux.do/api/user",
      clientId: process.env.LINUX_DO_CLIENT_ID,
      clientSecret: process.env.LINUX_DO_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || profile.username,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.username,
          trustLevel: profile.trust_level,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.username = profile.username;
        token.trustLevel = profile.trust_level;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.username = token.username as string;
        session.user.trustLevel = token.trustLevel as number;
      }
      return session;
    },
  },
});
