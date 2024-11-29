import {Router} from 'express';
import {registerUser,loginUser,logout,uploadProfile} from '../controllers/user.controller'
import {USER_ROUTES} from '../constants/routes.constants';
import {verifyToken} from '../middleware/auth.middleware';
import {validateReq} from '../middleware/validation';
import {registerSchema,loginSchema} from '../validations/user';
import upload from '../middleware/multer.middleware';


const router = Router();
router.post(USER_ROUTES.REGISTER,validateReq(registerSchema),registerUser);
router.post(USER_ROUTES.LOGIN,validateReq(loginSchema),loginUser);
router.post(USER_ROUTES.LOGOUT,verifyToken,logout);
router.post(USER_ROUTES.UPLOAD_PROFILE,verifyToken,upload.single('profilePicture'),uploadProfile);

export default router
