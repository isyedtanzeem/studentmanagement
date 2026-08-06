import { Router, Request, Response } from 'express';
import { AlumniService } from '../services/alumniService';

const router = Router();

// GET /api/v1/alumni - Get all alumni with filters
router.get('/', (req: Request, res: Response) => {
  try {
    const { search, graduationYear, department, employmentStatus, industry, networkingOptIn } = req.query;

    const records = AlumniService.getAll({
      search: search as string,
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
      department: department as string,
      employmentStatus: employmentStatus as string,
      industry: industry as string,
      networkingOptIn: networkingOptIn !== undefined ? networkingOptIn === 'true' : undefined,
    });

    res.json({
      success: true,
      data: records,
      totalCount: records.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch alumni records.',
    });
  }
});

// GET /api/v1/alumni/reports - Get alumni analytics and placement statistics
router.get('/reports', (req: Request, res: Response) => {
  try {
    const reports = AlumniService.getReportsAndAnalytics();
    res.json({
      success: true,
      data: reports,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate alumni analytics report.',
    });
  }
});

// GET /api/v1/alumni/:id - Get single alumni details
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const alumni = AlumniService.getById(id);
    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: `Alumni with ID ${id} not found.`,
      });
    }

    res.json({
      success: true,
      data: alumni,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch alumni details.',
    });
  }
});

// POST /api/v1/alumni - Add new alumni record
router.post('/', (req: Request, res: Response) => {
  try {
    const payload = req.body;
    if (!payload.fullName || !payload.email || !payload.graduationYear) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: fullName, email, graduationYear.',
      });
    }

    const created = AlumniService.create(payload);
    res.status(201).json({
      success: true,
      message: `Alumni profile for ${created.fullName} created successfully.`,
      data: created,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create alumni record.',
    });
  }
});

// PUT /api/v1/alumni/:id - Update alumni details
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = AlumniService.update(id, updates);
    res.json({
      success: true,
      message: `Alumni profile for ${updated.fullName} updated successfully.`,
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update alumni record.',
    });
  }
});

// DELETE /api/v1/alumni/:id - Delete alumni record
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = AlumniService.delete(id);
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Alumni record not found or already deleted.',
      });
    }

    res.json({
      success: true,
      message: 'Alumni record deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete alumni record.',
    });
  }
});

// POST /api/v1/alumni/:id/giving - Record alumni donation/giving
router.post('/:id/giving', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, currency, purpose, date } = req.body;

    if (!amount || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Amount and purpose are required for recording a contribution.',
      });
    }

    const updated = AlumniService.addGiving(id, {
      amount: Number(amount),
      currency,
      purpose,
      date,
    });

    res.json({
      success: true,
      message: `Recorded donation of ${currency || 'INR'} ${amount} for ${updated.fullName}.`,
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to record alumni contribution.',
    });
  }
});

export default router;
