import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { Component, UpdateComponentRequest, ApiResponse } from '@/lib/types';

// GET /api/components/[id] - Fetch a single component (unprotected)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const result = await query('SELECT * FROM components WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            const response: ApiResponse = {
                success: false,
                error: 'Component not found',
            };
            return NextResponse.json(response, { status: 404 });
        }

        const response: ApiResponse<Component> = {
            success: true,
            data: result.rows[0],
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching component:', error);
        const response: ApiResponse = {
            success: false,
            error: 'Failed to fetch component',
        };
        return NextResponse.json(response, { status: 500 });
    }
}

// PUT /api/components/[id] - Update a component (protected)
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
        const body: UpdateComponentRequest = await request.json();

        // Build dynamic update query
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (body.component_type !== undefined) {
            updates.push(`component_type = $${paramCount++}`);
            values.push(body.component_type);
        }
        if (body.props !== undefined) {
            updates.push(`props = $${paramCount++}`);
            values.push(JSON.stringify(body.props));
        }
        if (body.display_order !== undefined) {
            updates.push(`display_order = $${paramCount++}`);
            values.push(body.display_order);
        }
        if (body.is_visible !== undefined) {
            updates.push(`is_visible = $${paramCount++}`);
            values.push(body.is_visible);
        }

        if (updates.length === 0) {
            const response: ApiResponse = {
                success: false,
                error: 'No fields to update',
            };
            return NextResponse.json(response, { status: 400 });
        }

        // Always update the updated_at timestamp
        updates.push(`updated_at = NOW()`);
        values.push(id);

        const result = await query(
            `UPDATE components SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            const response: ApiResponse = {
                success: false,
                error: 'Component not found',
            };
            return NextResponse.json(response, { status: 404 });
        }

        const response: ApiResponse<Component> = {
            success: true,
            data: result.rows[0],
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error updating component:', error);
        const response: ApiResponse = {
            success: false,
            error: 'Failed to update component',
        };
        return NextResponse.json(response, { status: 500 });
    }
}

// DELETE /api/components/[id] - Delete a component (protected)
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

        const result = await query(
            'DELETE FROM components WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            const response: ApiResponse = {
                success: false,
                error: 'Component not found',
            };
            return NextResponse.json(response, { status: 404 });
        }

        const response: ApiResponse<Component> = {
            success: true,
            data: result.rows[0],
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error deleting component:', error);
        const response: ApiResponse = {
            success: false,
            error: 'Failed to delete component',
        };
        return NextResponse.json(response, { status: 500 });
    }
}
