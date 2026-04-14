import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { pages, themes } from '@/lib/schema';
import { eq, and, asc, desc } from 'drizzle-orm';
import {
    CreatePageSchema,
    type CreatePageRequest,
    type ApiResponse,
    type Page,
} from '@/lib/types';

// GET /api/pages - Fetch pages (query by themeId or return all)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const themeId = searchParams.get('themeId');
        const includeInvisible = searchParams.get('includeInvisible') === 'true';

        let result;

        if (themeId) {
            // Fetch pages for a specific theme
            const whereClause = includeInvisible
                ? eq(pages.themeId, themeId)
                : and(eq(pages.themeId, themeId), eq(pages.isVisible, true));

            result = await db.query.pages.findMany({
                where: whereClause,
                orderBy: [asc(pages.name)],
                with: {
                    components: true,
                },
            });
        } else {
            // Fetch all pages
            result = await db.query.pages.findMany({
                where: includeInvisible ? undefined : eq(pages.isVisible, true),
                orderBy: [asc(pages.name)],
                with: {
                    theme: true,
                },
            });
        }

        // Map Drizzle results to Page type (convert Date to string)
        const mappedResult = result.map(item => ({
            id: item.id,
            themeId: item.themeId,
            name: item.name,
            slug: item.slug,
            isVisible: item.isVisible,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
        }));

        const response: ApiResponse<Page[]> = {
            success: true,
            data: mappedResult as unknown as Page[],
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching pages:', error);
        const response: ApiResponse = {
            success: false,
            error: 'Failed to fetch pages',
        };
        return NextResponse.json(response, { status: 500 });
    }
}

// POST /api/pages - Create a new page (protected)
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

        const body = await request.json() as CreatePageRequest;

        // Validate with Zod
        const validation = CreatePageSchema.safeParse(body);
        if (!validation.success) {
            const response: ApiResponse = {
                success: false,
                error: validation.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
            };
            return NextResponse.json(response, { status: 400 });
        }

        const data = validation.data;

        // Check if theme exists
        const themeExists = await db.query.themes.findFirst({
            where: eq(themes.id, data.themeId),
        });

        if (!themeExists) {
            const response: ApiResponse = {
                success: false,
                error: 'Theme not found',
            };
            return NextResponse.json(response, { status: 404 });
        }

        // Insert new page
        const [result] = await db.insert(pages).values({
            themeId: data.themeId,
            name: data.name,
            slug: data.slug,
            isVisible: data.isVisible ?? true,
        }).returning();

        // Map result to Page type (convert Date to string)
        const mappedResult = {
            ...result,
            createdAt: result.createdAt.toISOString(),
            updatedAt: result.updatedAt.toISOString(),
        };

        const response: ApiResponse<Page> = {
            success: true,
            data: mappedResult as unknown as Page,
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error('Error creating page:', error);
        const response: ApiResponse = {
            success: false,
            error: 'Failed to create page',
        };
        return NextResponse.json(response, { status: 500 });
    }
}
