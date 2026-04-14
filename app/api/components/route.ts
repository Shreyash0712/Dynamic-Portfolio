import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { components, pages, themes } from '@/lib/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import {
    CreateComponentSchema,
    type CreateComponentRequest,
    type ApiResponse,
    type Component,
} from '@/lib/types';

// GET /api/components - Fetch components (query by pageId or return all published)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const pageId = searchParams.get('pageId');
        const status = searchParams.get('status') || 'published';

        let result;

        if (pageId) {
            // Fetch components for a specific page
            result = await db.query.components.findMany({
                where: and(
                    eq(components.pageId, pageId),
                    eq(components.status, status)
                ),
                orderBy: [asc(components.rowStart), asc(components.colStart)],
            });
        } else {
            // Fetch all published components for the active theme
            result = await db.query.components.findMany({
                where: eq(components.status, status),
                with: {
                    page: {
                        with: {
                            theme: true,
                        },
                    },
                },
                orderBy: [asc(components.rowStart), asc(components.colStart)],
            });
        }

        // Map Drizzle results to Component type (convert Date to string)
        const mappedResult = result.map(item => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
        }));

        const response: ApiResponse<Component[]> = {
            success: true,
            data: mappedResult as unknown as Component[],
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching components:', error);
        const response: ApiResponse = {
            success: false,
            error: 'Failed to fetch components',
        };
        return NextResponse.json(response, { status: 500 });
    }
}

// POST /api/components - Create a new component (protected)
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

        const body = await request.json() as CreateComponentRequest;

        // Validate with Zod
        const validation = CreateComponentSchema.safeParse(body);
        if (!validation.success) {
            const response: ApiResponse = {
                success: false,
                error: validation.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
            };
            return NextResponse.json(response, { status: 400 });
        }

        const data = validation.data;

        // Insert new component
        const [result] = await db.insert(components).values({
            pageId: data.pageId,
            status: data.status || 'draft',
            isVisible: data.isVisible ?? true,
            rowStart: data.rowStart || 1,
            rowSpan: data.rowSpan || 1,
            colStart: data.colStart || 1,
            colSpan: data.colSpan || 1,
            contentHtml: data.contentHtml || null,
            alignItems: data.alignItems || 'center',
            justifyContent: data.justifyContent || 'center',
            bgColor: data.bgColor || null,
            padding: data.padding ?? 24,
            borderRadius: data.borderRadius || 'medium',
            imageUrl: data.imageUrl || null,
            imagePublicId: data.imagePublicId || null,
            imagePosition: data.imagePosition || 'none',
            imageOpacity: data.imageOpacity ?? null,
            imageAccentColor: data.imageAccentColor || null,
        }).returning();

        // Map result to Component type (convert Date to string)
        const mappedResult = {
            ...result,
            createdAt: result.createdAt.toISOString(),
            updatedAt: result.updatedAt.toISOString(),
        };

        const response: ApiResponse<Component> = {
            success: true,
            data: mappedResult as unknown as Component,
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error('Error creating component:', error);
        const response: ApiResponse = {
            success: false,
            error: 'Failed to create component',
        };
        return NextResponse.json(response, { status: 500 });
    }
}
