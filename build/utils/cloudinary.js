"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const getResourceType = (filePath) => {
    const ext = path_1.default.extname(filePath).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
        return 'image';
    }
    else if (['.mp4', '.mov', '.avi'].includes(ext)) {
        return 'video';
    }
    else {
        throw new Error('Unsupported file type');
    }
};
const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) {
        console.warn('No file path provided for upload.');
        return null;
    }
    let resourceType;
    try {
        resourceType = getResourceType(localFilePath);
    }
    catch (error) {
        console.error('Error determining resource type:', error.message);
        return null;
    }
    try {
        const response = await cloudinary_1.v2.uploader.upload(localFilePath, {
            resource_type: resourceType
        });
        return response;
    }
    catch (error) {
        console.error('Error uploading file:', error.message);
        return null;
    }
    finally {
        if (fs_1.default.existsSync(localFilePath)) {
            fs_1.default.unlink(localFilePath, unlinkError => {
                if (unlinkError) {
                    console.error('Error deleting local file:', unlinkError.message);
                }
                else {
                    console.info('Local file deleted successfully:', path_1.default.basename(localFilePath));
                }
            });
        }
    }
};
exports.default = uploadOnCloudinary;
