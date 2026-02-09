import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using CLOUDINARY_URL environment variable
// Format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
if (!process.env.CLOUDINARY_URL) {
    console.warn('CLOUDINARY_URL is not set. Media uploads will not work.');
}

// Cloudinary automatically configures from CLOUDINARY_URL env var
// No need for manual config if using CLOUDINARY_URL

export { cloudinary };

// Helper function to upload a file buffer to Cloudinary
export async function uploadToCloudinary(
    fileBuffer: Buffer,
    options: {
        folder?: string;
        resourceType?: 'image' | 'video' | 'raw' | 'auto';
        transformation?: any;
    } = {}
): Promise<{
    url: string;
    secureUrl: string;
    publicId: string;
    format: string;
    width?: number;
    height?: number;
    duration?: number;
}> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: options.folder || 'portfolio',
                resource_type: options.resourceType || 'auto',
                transformation: options.transformation,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else if (result) {
                    resolve({
                        url: result.url,
                        secureUrl: result.secure_url,
                        publicId: result.public_id,
                        format: result.format,
                        width: result.width,
                        height: result.height,
                        duration: result.duration,
                    });
                } else {
                    reject(new Error('Upload failed with no result'));
                }
            }
        );

        uploadStream.end(fileBuffer);
    });
}

// Helper function to delete a file from Cloudinary
export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video' = 'image') {
    try {
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        return result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
}
