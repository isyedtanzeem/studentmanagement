import { Request, Response } from 'express';
import { StudentService } from '../services/studentService';

const studentService = new StudentService();

export class StudentController {
  public static getStudents = (req: Request, res: Response) => {
    try {
      const {
        page,
        limit,
        search,
        department,
        status,
        gender,
        enrollmentYear,
        sortBy,
        sortOrder
      } = req.query;

      const result = studentService.getStudents({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        department: department as string,
        status: status as string,
        gender: gender as string,
        enrollmentYear: enrollmentYear ? Number(enrollmentYear) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });

      return res.status(200).json({
        success: true,
        data: result.students,
        pagination: result.pagination,
        stats: result.stats
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch students list.'
      });
    }
  };

  public static getStudentById = (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const student = studentService.getStudentById(id);
      return res.status(200).json({
        success: true,
        data: student
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || 'Student not found.'
      });
    }
  };

  public static createStudent = (req: Request, res: Response) => {
    try {
      const user = (req as any).user || { id: 'usr-100', fullName: 'System Administrator', email: 'admin@scholarcore.edu', role: 'SuperAdmin' };
      const newStudent = studentService.createStudent(req.body, user);
      return res.status(201).json({
        success: true,
        data: newStudent,
        message: 'Student record created successfully.'
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create student record.'
      });
    }
  };

  public static updateStudent = (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user || { id: 'usr-100', fullName: 'System Administrator', email: 'admin@scholarcore.edu', role: 'SuperAdmin' };
      const updatedStudent = studentService.updateStudent(id, req.body, user);
      return res.status(200).json({
        success: true,
        data: updatedStudent,
        message: 'Student profile updated successfully.'
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update student profile.'
      });
    }
  };

  public static deleteStudent = (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user || { id: 'usr-100', fullName: 'System Administrator', email: 'admin@scholarcore.edu', role: 'SuperAdmin' };
      studentService.deleteStudent(id, user);
      return res.status(200).json({
        success: true,
        message: 'Student record deleted successfully.'
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete student.'
      });
    }
  };

  public static bulkImport = (req: Request, res: Response) => {
    try {
      const user = (req as any).user || { id: 'usr-100', fullName: 'System Administrator', email: 'admin@scholarcore.edu', role: 'SuperAdmin' };
      const { students } = req.body;
      if (!Array.isArray(students)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input. Expected an array of student records.'
        });
      }

      const result = studentService.bulkImportStudents(students, user);
      return res.status(200).json({
        success: true,
        data: result,
        message: `Imported ${result.successCount} students successfully.`
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to execute bulk import.'
      });
    }
  };

  public static exportCSV = (req: Request, res: Response) => {
    try {
      const csvData = studentService.exportCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="students_export.csv"');
      return res.status(200).send(csvData);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to export CSV.'
      });
    }
  };

  public static getMyPortalData = (req: Request, res: Response) => {
    try {
      const user = (req as any).user || { email: 'student@scholarcore.edu.in', studentId: '2024CSE1001' };
      const data = studentService.getStudentPortalData(user);
      return res.status(200).json({
        success: true,
        data
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch student portal data.'
      });
    }
  };
}
