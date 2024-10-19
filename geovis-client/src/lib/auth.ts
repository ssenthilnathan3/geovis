import NextAuth, { NextAuthOptions, User, Account, Profile } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string;
      email: string;
    };
    accessToken?: string;
  }

  interface User {
    id: string;
    name?: string;
    email: string;
    token?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        action: { label: "Action", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        const { email, password, name, action } = credentials;
        const url = `${BACKEND_URL}/${action}`;

        console.log(`Attempting ${action} for user:`, email);

        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: action === 'register' ? JSON.stringify({ email, password, name }) : JSON.stringify({ email, password }),
          });

          console.log('Response status:', response.status);
          const responseText = await response.text();
          console.log('Response text:', responseText);

          if (!response.ok) {
            throw new Error(responseText);
          }

          const data = JSON.parse(responseText);

          if (data.user) {
            return { ...data.user, token: data.token };
          } else {
            throw new Error('User data not found in response');
          }
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        name: token.name as string,
        email: token.email as string,
      };
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  events: {
    async signOut({ token }) {
      // Implement server-side logout logic here
      // For example, invalidate the token on your backend
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token.accessToken}`,
          },
        });
      } catch (error) {
        console.error('Error during server-side logout:', error);
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
