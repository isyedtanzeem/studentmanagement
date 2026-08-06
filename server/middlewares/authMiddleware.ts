import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwtUtils';
import { UserModel } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload & {
    department?: string;
    studentId?: string;
    employeeId?: string;
    avatarUrl?: string;
  };
}

export async function protect(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  // 1. Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    // 2. Check HttpOnly cookie
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in with a valid token.'
    });
  }

  try {
    const decoded = verifyAccessToken(token);

    // Verify user still exists and is active
    const user = await UserModel.findById(decoded.userId);

    if (!user || user.status !== 'Active') {
      return res.status(401).json({
        success: false,
        message: 'Account suspended, inactive, or no longer exists.'
      });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      department: user.department,
      studentId: user.studentId,
      employeeId: user.employeeId,
      avatarUrl: user.avatarUrl
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Access token expired. Please send refresh token.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.'
    });
  }
}
