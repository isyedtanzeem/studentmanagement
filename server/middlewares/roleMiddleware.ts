import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

export type UserRole = 'Super Admin' | 'Admin' | 'Admission Officer' | 'Faculty' | 'Student';

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access.'
      });
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Role '${req.user.role}' lacks permissions for this endpoint.`
      });
    }

    next();
  };
}
