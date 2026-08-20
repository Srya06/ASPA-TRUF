import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
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
      image?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    email: string;
    image?: string;
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
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
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
      id: "email-otp",
      name: "Email OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) return null;

        const email = credentials.email as string;
        const otp = credentials.otp as string;
        
        const cookieStore = await cookies();
        const otpDataCookie = cookieStore.get("otp_data")?.value;
        
        if (!otpDataCookie) {
          throw new Error("OTP expired or not requested.");
        }

        const { hash: storedHash, email: storedEmail, expiresAt } = JSON.parse(otpDataCookie);
        
        if (email !== storedEmail) {
          throw new Error("Email mismatch.");
        }
        
        if (Date.now() > expiresAt) {
          throw new Error("OTP has expired.");
        }
        
        const inputHash = hashOTP(otp, email);
        if (inputHash !== storedHash) {
          throw new Error("Invalid OTP.");
        }
        
        // OTP verified successfully. Now find or create user.
        let userId = crypto.createHash("sha256").update(email).digest("hex").substring(0, 24);
        let userRole = "customer";
        let userName = email.split('@')[0];

        if (isDatabaseConfigured()) {
          try {
            const usersCol = await getCollection("users");
            const existingUser = await usersCol.findOne({ email });
            
            if (existingUser) {
              userRole = existingUser.role as string;
              userId = existingUser._id.toString();
              userName = existingUser.name as string;
            } else {
              const newOid = new ObjectId();
              await usersCol.insertOne({
                _id: newOid,
                name: userName,
                email,
                isVerified: true,
                role: 'customer',
                createdAt: new Date(),
                authProvider: 'email'
              });
              userId = newOid.toString();
            }
          } catch (err) {
            console.error("Database error in auth:", err);
          }
        }
        
        // Clear OTP cookie
        cookieStore.delete("otp_data");

        return {
          id: userId,
          email,
          role: userRole,
          name: userName,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        if (isDatabaseConfigured() && user.email) {
          try {
            const usersCol = await getCollection("users");
            const existingUser = await usersCol.findOne({ email: user.email });
            
            if (existingUser) {
              user.id = existingUser._id.toString();
              user.role = existingUser.role as string || 'customer';
              
              // Update name or image if missing
              let updateFields: any = {};
              if (!existingUser.name && user.name) updateFields.name = user.name;
              if (user.image && existingUser.image !== user.image) updateFields.image = user.image;
              
              if (Object.keys(updateFields).length > 0) {
                await usersCol.updateOne({ _id: existingUser._id }, { $set: updateFields });
              }
            } else {
              const newOid = new ObjectId();
              await usersCol.insertOne({
                _id: newOid,
                name: user.name || user.email.split('@')[0],
                email: user.email,
                image: user.image,
                isVerified: true,
                role: 'customer',
                createdAt: new Date(),
                authProvider: 'google'
              });
              user.id = newOid.toString();
              user.role = 'customer';
            }
          } catch (err) {
            console.error("Database error during Google sign-in:", err);
          }
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.picture = user.image;
      }
      if (trigger === "update" && session?.user) {
        token.picture = session.user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
