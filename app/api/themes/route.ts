import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { themes } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import {
    CreateThemeSchema,
    type CreateThemeRequest,
    type ApiResponse,
    type Theme,
} from '@/lib/types';

// GET /api/themes - Fetch all themes
export async function GET() {
    try {
        const result = await db.query.themes.findMany({
            orderBy: [desc(themes.createdAt)],
        });

        // Map Drizzle results to Theme type (convert Date to string)
        const mappedResult = result.map(item => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
        }));

        const response: ApiResponse<Theme[]> = {
            success: true,
            data: mappedResult as unknown as Theme[],
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching themes:', error);
        const response: ApiResponse = {
            success: false,
            error: 'Failed to fetch themes',
        };
        return NextResponse.json(response, { status: 500 });
    }
}

// POST /api/themes - Create a new theme (protected)
export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            const response: ApiResponse = {
                success: false,
                error: 'Unauthorized',
            };
            return NextResponse.json(response, { status: 401 });
        }

        const body = await request.json() as CreateThemeRequest;

        // Validate with Zod
        const validation = CreateThemeSchema.safeParse(body);
        if (!validation.success) {
            const response: ApiResponse = {
                success: false,
                error: validation.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
            };
            return NextResponse.json(response, { status: 400 });
        }

        const data = validation.data;

        // Insert new theme
        const [result] = await db.insert(themes).values({
            name: data.name,
            isActive: data.isActive ?? false,
        }).returning();

        // Map result to Theme type (convert Date to string)
        const mappedResult = {
            ...result,
            createdAt: result.createdAt.toISOString(),
            updatedAt: result.updatedAt.toISOString(),
        };

        const response: ApiResponse<Theme> = {
            success: true,
            data: mappedResult as unknown as Theme,
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error('Error creating theme:', error);
        const response: ApiResponse = {
            success: false,
            error: 'Failed to create theme',
        };
        return NextResponse.json(response, { status: 500 });
    }
}
