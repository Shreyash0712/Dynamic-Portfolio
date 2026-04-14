import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { themes } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { Theme, UpdateThemeRequest, ApiResponse, UpdateThemeSchema } from '@/lib/types';

// GET /api/themes/[id] - Fetch a single theme
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const result = await db.query.themes.findFirst({
            where: eq(themes.id, id),
            with: {
                pages: true,
            },
        });

        if (!result) {
            const response: ApiResponse = {
                success: false,
                error: 'Theme not found',
            };
            return NextResponse.json(response, { status: 404 });
        }

        // Map result to Theme type (convert Date to string)
        const mappedResult = {
            ...result,
            createdAt: result.createdAt.toISOString(),
            updatedAt: result.updatedAt.toISOString(),
            pages: result.pages?.map(page => ({
                ...page,
                createdAt: page.createdAt.toISOString(),
                updatedAt: page.updatedAt.toISOString(),
            })),
        };

        const response: ApiResponse<Theme> = {
            success: true,
            data: mappedResult as unknown as Theme,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching theme:', error);
        const response: ApiResponse = {
            success: false,
            error: 'Failed to fetch theme',
        };
        return NextResponse.json(response, { status: 500 });
    }
}

// PUT /api/themes/[id] - Update a theme (protected)
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
        const body = await request.json() as UpdateThemeRequest;

        // Validate with Zod
        const validation = UpdateThemeSchema.safeParse(body);
        if (!validation.success) {
            const response: ApiResponse = {
                success: false,
                error: validation.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
            };
            return NextResponse.json(response, { status: 400 });
        }

        const data = validation.data;

        // Build update object with only defined values
        const updateData: Partial<typeof data> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        if (Object.keys(updateData).length === 0) {
            const response: ApiResponse = {
                success: false,
                error: 'No fields to update',
            };
            return NextResponse.json(response, { status: 400 });
        }

        const [result] = await db.update(themes)
            .set(updateData)
            .where(eq(themes.id, id))
            .returning();

        if (!result) {
            const response: ApiResponse = {
                success: false,
                error: 'Theme not found',
            };
            return NextResponse.json(response, { status: 404 });
        }

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

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error updating theme:', error);
        const response: ApiResponse = {
            success: false,
            error: 'Failed to update theme',
        };
        return NextResponse.json(response, { status: 500 });
    }
}

// DELETE /api/themes/[id] - Delete a theme (protected)
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

        const [result] = await db.delete(themes)
            .where(eq(themes.id, id))
            .returning();

        if (!result) {
            const response: ApiResponse = {
                success: false,
                error: 'Theme not found',
            };
            return NextResponse.json(response, { status: 404 });
        }

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

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error deleting theme:', error);
        const response: ApiResponse = {
            success: false,
            error: 'Failed to delete theme',
        };
        return NextResponse.json(response, { status: 500 });
    }
}
