import "next-auth";

declare module "next-auth" {
  interface User {
    username?: string;
    trustLevel?: number;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string;
    trustLevel?: number;
  }
}
