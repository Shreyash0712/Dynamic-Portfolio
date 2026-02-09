import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';

export async function DELETE(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get public ID from request body
        const body = await request.json();
        const { publicId, resourceType } = body;

        if (!publicId) {
            return NextResponse.json(
                { success: false, error: 'Public ID is required' },
                { status: 400 }
            );
        }

        // Delete from Cloudinary
        const result = await deleteFromCloudinary(publicId, resourceType || 'image');

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        console.error('Delete error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Delete failed' },
            { status: 500 }
        );
    }
}
