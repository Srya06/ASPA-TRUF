import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import crypto from "crypto";
import { cookies } from "next/headers";
import { getCollection, isDatabaseConfigured } from "@/lib/db/client";
import { ObjectId } from "mongodb";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      email: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    email: string;
  }
}

function hashOTP(otp: string, email: string): string {
  return crypto
    .createHmac("sha256", process.env.AUTH_SECRET || "truf-secret-key")
    .update(`${email}:${otp}`)
    .digest("hex");
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      id: "admin",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        if (email === "sryaraj06@gmail.com" && password === "1234567890@qwertyuiop") {
          return {
            id: "admin_id_123",
            email,
            role: "admin",
            name: "Admin User",
          };
        }

        return null;
      },
    }),
    CredentialsProvider({
      id: "customer",
      name: "CustomerLogin",
      credentials: {
        name: { label: "Full Name", type: "text" },
        email: { label: "Email Address", type: "email" },
        phone: { label: "Phone Number", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.phone || !credentials?.name) return null;

        const email = credentials.email as string;
        const phone = credentials.phone as string;
        const name = credentials.name as string;

        let userId = crypto.createHash("sha256").update(email).digest("hex").substring(0, 24);
        let userRole = "customer";

        if (isDatabaseConfigured()) {
          try {
            const usersCol = await getCollection("users");
            const existingUser = await usersCol.findOne({ email });
            
            if (existingUser) {
              userRole = existingUser.role as string;
              userId = existingUser._id.toString();
              
              // Update phone and name if they are different or missing
              let updateFields: any = {};
              if (existingUser.phone !== phone) updateFields.phone = phone;
              if (existingUser.name !== name) updateFields.name = name;
              
              if (Object.keys(updateFields).length > 0) {
                await usersCol.updateOne({ _id: existingUser._id }, { $set: updateFields });
              }
            } else {
              const newOid = new ObjectId();
              await usersCol.insertOne({
                _id: newOid,
                name,
                email,
                phone,
                isVerified: true,
                role: 'customer'
              });
              userId = newOid.toString();
            }
          } catch (err) {
            console.error("Database error in auth:", err);
          }
        }

        return {
          id: userId,
          email,
          role: userRole,
          name: name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
