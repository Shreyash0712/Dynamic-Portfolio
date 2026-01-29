import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { type NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";
import { query } from "./db";

export const authOptions: NextAuthOptions = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Email",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "admin@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    // Query admin_users table
                    const result = await query(
                        'SELECT * FROM admin_users WHERE email = $1',
                        [credentials.email]
                    );

                    if (result.rows.length === 0) {
                        return null;
                    }

                    const user = result.rows[0];

                    // Verify password
                    const isValid = await bcrypt.compare(credentials.password, user.password);

                    if (!isValid) {
                        return null;
                    }

                    // Return user object
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.email.split('@')[0], // Use email prefix as name
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            }
        })
    ],

    callbacks: {
        async signIn({ user, account, profile }) {
            // For GitHub OAuth, check if email is allowed
            if (account?.provider === "github") {
                return profile?.email === "shreyash.swami2476@gmail.com" || profile?.email === "22amtics197@gmail.com";
            }
            // For credentials, already validated in authorize
            return true;
        },
    },

    pages: {
        signIn: '/login',
    },

    session: {
        strategy: 'jwt',
    },
};
