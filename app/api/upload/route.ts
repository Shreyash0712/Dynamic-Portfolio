import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get form data
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
        const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

        if (!isImage && !isVideo) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Invalid file type. Allowed types: ${[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(', ')}`
                },
                { status: 400 }
            );
        }

        // Validate file size
        const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
        if (file.size > maxSize) {
            return NextResponse.json(
                {
                    success: false,
                    error: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`
                },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const resourceType = isImage ? 'image' : 'video';
        const result = await uploadToCloudinary(buffer, {
            folder: 'portfolio',
            resourceType,
            transformation: isImage ? {
                quality: 'auto',
                fetch_format: 'auto',
            } : undefined,
        });

        return NextResponse.json({
            success: true,
            data: {
                url: result.secureUrl,
                publicId: result.publicId,
                format: result.format,
                width: result.width,
                height: result.height,
                duration: result.duration,
                type: resourceType,
            },
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Upload failed' },
            { status: 500 }
        );
    }
}
