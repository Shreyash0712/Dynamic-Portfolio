import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { pages } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { Page, UpdatePageRequest, ApiResponse, UpdatePageSchema } from '@/lib/types';

// GET /api/pages/[id] - Fetch a single page
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const result = await db.query.pages.findFirst({
            where: eq(pages.id, id),
            with: {
                theme: true,
                components: true,
            },
        });

        if (!result) {
            const response: ApiResponse = {
                success: false,
                error: 'Page not found',
            };
            return NextResponse.json(response, { status: 404 });
        }

        // Map result to Page type (convert Date to string)
        const mappedResult = {
            id: result.id,
            themeId: result.themeId,
            name: result.name,
            slug: result.slug,
            isVisible: result.isVisible,
            createdAt: result.createdAt.toISOString(),
            updatedAt: result.updatedAt.toISOString(),
            theme: result.theme ? {
                id: result.theme.id,
                name: result.theme.name,
                isActive: result.theme.isActive,
                createdAt: result.theme.createdAt.toISOString(),
                updatedAt: result.theme.updatedAt.toISOString(),
            } : undefined,
            components: result.components?.map(comp => ({
                id: comp.id,
                pageId: comp.pageId,
                status: comp.status,
                isVisible: comp.isVisible,
                rowStart: comp.rowStart,
                rowSpan: comp.rowSpan,
                colStart: comp.colStart,
                colSpan: comp.colSpan,
                contentHtml: comp.contentHtml,
                alignItems: comp.alignItems,
                justifyContent: comp.justifyContent,
                bgColor: comp.bgColor,
                padding: comp.padding,
                borderRadius: comp.borderRadius,
                imageUrl: comp.imageUrl,
                imagePublicId: comp.imagePublicId,
                imagePosition: comp.imagePosition,
                imageOpacity: comp.imageOpacity,
                imageAccentColor: comp.imageAccentColor,
                createdAt: comp.createdAt.toISOString(),
                updatedAt: comp.updatedAt.toISOString(),
            })),
        };

        const response: ApiResponse<Page> = {
            success: true,
            data: mappedResult as unknown as Page,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching page:', error);
        const response: ApiResponse = {
            success: false,
            error: 'Failed to fetch page',
        };
        return NextResponse.json(response, { status: 500 });
    }
}

// PUT /api/pages/[id] - Update a page (protected)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        const body = await request.json() as UpdatePageRequest;

        // Validate with Zod
        const validation = UpdatePageSchema.safeParse(body);
        if (!validation.success) {
            const response: ApiResponse = {
                success: false,
                error: validation.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
            };
            return NextResponse.json(response, { status: 400 });
        }

        const data = validation.data;

        // Build update object with only defined values
        const updateData: Record<string, unknown> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.slug !== undefined) updateData.slug = data.slug;
                if (data.isVisible !== undefined) updateData.isVisible = data.isVisible;

        if (Object.keys(updateData).length === 0) {
            const response: ApiResponse = {
                success: false,
                error: 'No fields to update',
            };
            return NextResponse.json(response, { status: 400 });
        }

        const [result] = await db.update(pages)
            .set(updateData)
            .where(eq(pages.id, id))
            .returning();

        if (!result) {
            const response: ApiResponse = {
                success: false,
                error: 'Page not found',
            };
            return NextResponse.json(response, { status: 404 });
        }

        // Map result to Page type (convert Date to string)
        const mappedResult = {
            id: result.id,
            themeId: result.themeId,
            name: result.name,
            slug: result.slug,
            isVisible: result.isVisible,
            createdAt: result.createdAt.toISOString(),
            updatedAt: result.updatedAt.toISOString(),
        };

        const response: ApiResponse<Page> = {
            success: true,
            data: mappedResult as unknown as Page,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error updating page:', error);
        const response: ApiResponse = {
            success: false,
            error: 'Failed to update page',
        };
        return NextResponse.json(response, { status: 500 });
    }
}

// DELETE /api/pages/[id] - Delete a page (protected)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;

        const [result] = await db.delete(pages)
            .where(eq(pages.id, id))
            .returning();

        if (!result) {
            const response: ApiResponse = {
                success: false,
                error: 'Page not found',
            };
            return NextResponse.json(response, { status: 404 });
        }

        // Map result to Page type (convert Date to string)
        const mappedResult = {
            id: result.id,
            themeId: result.themeId,
            name: result.name,
            slug: result.slug,
            isVisible: result.isVisible,
            createdAt: result.createdAt.toISOString(),
            updatedAt: result.updatedAt.toISOString(),
        };

        const response: ApiResponse<Page> = {
            success: true,
            data: mappedResult as unknown as Page,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error deleting page:', error);
        const response: ApiResponse = {
            success: false,
            error: 'Failed to delete page',
        };
        return NextResponse.json(response, { status: 500 });
    }
}
