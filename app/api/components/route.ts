import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { Component, CreateComponentRequest, ApiResponse } from '@/lib/types';

// GET /api/components - Fetch all components (unprotected)
export async function GET() {
    try {
        const result = await query(
            'SELECT * FROM components ORDER BY display_order ASC'
        );

        const response: ApiResponse<Component[]> = {
            success: true,
            data: result.rows,
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

        const body: CreateComponentRequest = await request.json();

        // Validate required fields (display_order is now optional)
        if (!body.component_type || !body.props) {
            const response: ApiResponse = {
                success: false,
                error: 'Missing required fields: component_type, props',
            };
            return NextResponse.json(response, { status: 400 });
        }

        // Get max display_order and add 1 for new component (or use 1 if no components exist)
        let displayOrder = body.display_order;
        if (displayOrder === undefined || displayOrder === 0) {
            const maxOrderResult = await query(
                'SELECT COALESCE(MAX(display_order), 0) as max_order FROM components'
            );
            displayOrder = maxOrderResult.rows[0].max_order + 1;
        }

        // Insert new component
        const result = await query(
            `INSERT INTO components (component_type, props, display_order, is_visible)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [
                body.component_type,
                JSON.stringify(body.props),
                displayOrder,
                body.is_visible ?? true,
            ]
        );

        const response: ApiResponse<Component> = {
            success: true,
            data: result.rows[0],
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
