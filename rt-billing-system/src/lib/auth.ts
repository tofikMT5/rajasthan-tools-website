import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Username and password are required');
        }

        const username = String(credentials.username).trim();
        const password = String(credentials.password);

        const user = await db.user.findUnique({
          where: { username },
        });

        if (!user) {
          throw new Error('Invalid username or password');
        }

        if (!user.isActive) {
          throw new Error('Account is deactivated. Contact administrator.');
        }

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (1000 * 60));
          throw new Error(`Account locked due to multiple failed attempts. Try again in ${minutesLeft} minutes.`);
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isValidPassword) {
          const updatedFailed = user.failedLogins + 1;
          let lockTime: Date | null = null;
          if (updatedFailed >= 5) {
            lockTime = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
          }

          await db.user.update({
            where: { id: user.id },
            data: {
              failedLogins: updatedFailed,
              lockedUntil: lockTime,
            },
          });

          throw new Error('Invalid username or password');
        }

        // Success: Reset failed logins and update last login
        await db.user.update({
          where: { id: user.id },
          data: {
            failedLogins: 0,
            lockedUntil: null,
            lastLogin: new Date(),
          },
        });

        // Log login activity
        await db.activityLog.create({
          data: {
            userId: user.id,
            action: 'LOGIN',
            entityType: 'User',
            entityId: user.id,
            details: { username: user.username, role: user.role },
          },
        });

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    // Omit maxAge to use session cookies that clear when Electron/Browser is closed
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username as string;
        (session.user as any).role = token.role as Role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
  },
  secret: process.env.AUTH_SECRET,
});
