import { createServer } from "http";
import session from "express-session";
import { storage } from "./storage.js";
import { 
  loginSchema, 
  registerSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  updateProfileSchema,
  insertCaseSchema,
  insertOBSchema,
  insertLicensePlateSchema,
  insertEvidenceSchema,
  insertGeofileSchema,
  insertReportSchema,
  insertPoliceVehicleSchema
} from "../shared/schema.js";
import { randomBytes } from "crypto";

// Authentication middleware
export const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Admin middleware
export const requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export async function registerRoutes(app) {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'police-system-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Authentication routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: "Account is deactivated" });
      }

      await storage.updateLastLogin(user.id);
      req.session.userId = user.id;
      req.session.user = user;

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post('/api/auth/register', requireAuth, requireAdmin, async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(409).json({ message: "Email already exists" });
      }

      // Create user (remove confirmPassword before saving)
      const { confirmPassword, ...userToCreate } = userData;
      const newUser = await storage.createUser(userToCreate);

      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { username } = forgotPasswordSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        // Don't reveal if user exists or not
        return res.json({ message: "If the username exists, a reset token has been generated" });
      }

      const token = randomBytes(32).toString('hex');
      await storage.createPasswordResetToken(user.id, token);

      // In production, send email here
      // For development, return the token
      res.json({ 
        message: "Password reset token generated",
        token // Remove this in production
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      
      const resetData = await storage.getPasswordResetToken(token);
      if (!resetData) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      await storage.updateUserPassword(resetData.userId, password);
      await storage.deletePasswordResetToken(token);

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/me', requireAuth, async (req, res) => {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  // Profile routes
  app.put('/api/profile', requireAuth, async (req, res) => {
    try {
      const updates = updateProfileSchema.parse(req.body);
      const updatedUser = await storage.updateUser(req.session.userId, updates);
      
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // User management routes (Admin only)
  app.get('/api/users', requireAuth, requireAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json({ users: usersWithoutPasswords });
  });

  app.delete('/api/users/:id', requireAuth, requireAdmin, async (req, res) => {
    const userId = parseInt(req.params.id);
    
    if (userId === req.session.userId) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    try {
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(404).json({ message: "User not found" });
    }
  });

  app.post('/api/cases', requireAuth, async (req, res) => {
    try {
      const caseData = insertCaseSchema.parse(req.body);
      const newCase = await storage.createCase({
        ...caseData,
        createdById: req.session.userId
      });
      res.status(201).json({ case: newCase });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.put('/api/cases/:id', requireAuth, async (req, res) => {
    try {
      const caseId = parseInt(req.params.id);
      const updates = req.body;
      const updatedCase = await storage.updateCase(caseId, updates);
      res.json({ case: updatedCase });
    } catch (error) {
      res.status(404).json({ message: "Case not found" });
    }
  });

  app.delete('/api/cases/:id', requireAuth, async (req, res) => {
    try {
      const caseId = parseInt(req.params.id);
      await storage.deleteCase(caseId);
      res.json({ message: "Case deleted successfully" });
    } catch (error) {
      res.status(404).json({ message: "Case not found" });
    }
  });

  // OB Entry routes
  app.get('/api/ob-entries', requireAuth, async (req, res) => {
    const obEntries = await storage.getOBEntries();
    res.json({ obEntries });
  });

  app.post('/api/ob-entries', requireAuth, async (req, res) => {
    try {
      const obData = insertOBSchema.parse(req.body);
      const newOBEntry = await storage.createOBEntry({
        ...obData,
        recordingOfficerId: req.session.userId
      });
      res.status(201).json({ obEntry: newOBEntry });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.put('/api/ob-entries/:id', requireAuth, async (req, res) => {
    try {
      const obId = parseInt(req.params.id);
      const updates = req.body;
      const updatedOBEntry = await storage.updateOBEntry(obId, updates);
      res.json({ obEntry: updatedOBEntry });
    } catch (error) {
      res.status(404).json({ message: "OB Entry not found" });
    }
  });

  app.delete('/api/ob-entries/:id', requireAuth, async (req, res) => {
    try {
      const obId = parseInt(req.params.id);
      await storage.deleteOBEntry(obId);
      res.json({ message: "OB Entry deleted successfully" });
    } catch (error) {
      res.status(404).json({ message: "OB Entry not found" });
    }
  });

  // License Plate routes
  app.get('/api/license-plates', requireAuth, async (req, res) => {
    const licensePlates = await storage.getLicensePlates();
    res.json({ licensePlates });
  });

  app.get('/api/license-plates/search/:plateNumber', requireAuth, async (req, res) => {
    const plateNumber = req.params.plateNumber;
    const licensePlate = await storage.getLicensePlateByNumber(plateNumber);
    
    if (!licensePlate) {
      return res.status(404).json({ message: "License plate not found" });
    }

    res.json({ licensePlate });
  });

  app.post('/api/license-plates', requireAuth, async (req, res) => {
    try {
      const plateData = insertLicensePlateSchema.parse(req.body);
      const newPlate = await storage.createLicensePlate({
        ...plateData,
        addedById: req.session.userId
      });
      res.status(201).json({ licensePlate: newPlate });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.put('/api/license-plates/:id', requireAuth, async (req, res) => {
    try {
      const plateId = parseInt(req.params.id);
      const updates = req.body;
      const updatedPlate = await storage.updateLicensePlate(plateId, updates);
      res.json({ licensePlate: updatedPlate });
    } catch (error) {
      res.status(404).json({ message: "License plate not found" });
    }
  });

  app.delete('/api/license-plates/:id', requireAuth, async (req, res) => {
    try {
      const plateId = parseInt(req.params.id);
      await storage.deleteLicensePlate(plateId);
      res.json({ message: "License plate deleted successfully" });
    } catch (error) {
      res.status(404).json({ message: "License plate not found" });
    }
  });

  // Officers management endpoints
  app.get('/api/officers', requireAuth, requireAdmin, async (req, res) => {
    try {
      const officers = await storage.getAllUsers();
      res.json(officers);
    } catch (error) {
      console.error('Error fetching officers:', error);
      res.status(500).json({ message: 'Failed to fetch officers' });
    }
  });

  app.post('/api/officers', requireAuth, requireAdmin, async (req, res) => {
    try {
      const officerData = req.body;
      const newOfficer = await storage.createUser({
        ...officerData,
        username: officerData.badgeNumber || `officer_${Date.now()}`,
        password: 'changeme123',
        role: 'user',
        isActive: true
      });
      res.status(201).json(newOfficer);
    } catch (error) {
      console.error('Error creating officer:', error);
      res.status(500).json({ message: 'Failed to create officer' });
    }
  });

  app.put('/api/officers/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const officerData = req.body;
      const updatedOfficer = await storage.updateUser(parseInt(id), officerData);
      res.json(updatedOfficer);
    } catch (error) {
      console.error('Error updating officer:', error);
      res.status(500).json({ message: 'Failed to update officer' });
    }
  });

  app.delete('/api/officers/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(parseInt(id));
      res.json({ message: 'Officer deleted successfully' });
    } catch (error) {
      console.error('Error deleting officer:', error);
      res.status(500).json({ message: 'Failed to delete officer' });
    }
  });

  // Cases endpoint using storage
  app.get('/api/cases', requireAuth, async (req, res) => {
    try {
      const cases = await storage.getCases();
      res.json({ cases });
    } catch (error) {
      console.error('Error fetching cases:', error);
      res.status(500).json({ message: 'Failed to fetch cases' });
    }
  });

  // Evidence routes
  app.get('/api/evidence', requireAuth, async (req, res) => {
    try {
      const evidence = await storage.getEvidence();
      res.json({ evidence });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch evidence' });
    }
  });

  app.get('/api/evidence/:id', requireAuth, async (req, res) => {
    try {
      const evidenceItem = await storage.getEvidenceItem(parseInt(req.params.id));
      if (!evidenceItem) {
        return res.status(404).json({ message: 'Evidence not found' });
      }
      res.json(evidenceItem);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch evidence' });
    }
  });

  app.post('/api/evidence', requireAuth, async (req, res) => {
    try {
      const evidenceData = insertEvidenceSchema.parse(req.body);
      const newEvidence = await storage.createEvidence(evidenceData);
      res.status(201).json(newEvidence);
    } catch (error) {
      res.status(400).json({ message: 'Invalid evidence data' });
    }
  });

  app.put('/api/evidence/:id', requireAuth, async (req, res) => {
    try {
      const evidenceData = insertEvidenceSchema.parse(req.body);
      const updatedEvidence = await storage.updateEvidence(parseInt(req.params.id), evidenceData);
      res.json(updatedEvidence);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update evidence' });
    }
  });

  app.delete('/api/evidence/:id', requireAuth, async (req, res) => {
    try {
      await storage.deleteEvidence(parseInt(req.params.id));
      res.json({ message: 'Evidence deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete evidence' });
    }
  });

  // Geofiles routes
  app.get('/api/geofiles', requireAuth, async (req, res) => {
    try {
      const geofiles = await storage.getGeofiles();
      res.json({ geofiles });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch geofiles' });
    }
  });

  app.get('/api/geofiles/:id', requireAuth, async (req, res) => {
    try {
      const geofile = await storage.getGeofile(parseInt(req.params.id));
      if (!geofile) {
        return res.status(404).json({ message: 'Geofile not found' });
      }
      res.json(geofile);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch geofile' });
    }
  });

  app.post('/api/geofiles', requireAuth, async (req, res) => {
    try {
      const geofileData = insertGeofileSchema.parse(req.body);
      const newGeofile = await storage.createGeofile(geofileData);
      res.status(201).json(newGeofile);
    } catch (error) {
      res.status(400).json({ message: 'Invalid geofile data' });
    }
  });

  app.put('/api/geofiles/:id', requireAuth, async (req, res) => {
    try {
      const geofileData = insertGeofileSchema.parse(req.body);
      const updatedGeofile = await storage.updateGeofile(parseInt(req.params.id), geofileData);
      res.json(updatedGeofile);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update geofile' });
    }
  });

  app.delete('/api/geofiles/:id', requireAuth, async (req, res) => {
    try {
      await storage.deleteGeofile(parseInt(req.params.id));
      res.json({ message: 'Geofile deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete geofile' });
    }
  });

  // Reports routes
  app.get('/api/reports', requireAuth, async (req, res) => {
    try {
      const reports = await storage.getReports();
      res.json({ reports });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch reports' });
    }
  });

  app.get('/api/reports/:id', requireAuth, async (req, res) => {
    try {
      const report = await storage.getReport(parseInt(req.params.id));
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch report' });
    }
  });

  app.post('/api/reports', requireAuth, async (req, res) => {
    try {
      const reportData = insertReportSchema.parse(req.body);
      const newReport = await storage.createReport({
        ...reportData,
        requestedBy: req.session.userId
      });
      res.status(201).json(newReport);
    } catch (error) {
      res.status(400).json({ message: 'Invalid report data' });
    }
  });

  app.put('/api/reports/:id', requireAuth, async (req, res) => {
    try {
      const reportData = insertReportSchema.parse(req.body);
      const updatedReport = await storage.updateReport(parseInt(req.params.id), reportData);
      res.json(updatedReport);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update report' });
    }
  });

  app.delete('/api/reports/:id', requireAuth, async (req, res) => {
    try {
      await storage.deleteReport(parseInt(req.params.id));
      res.json({ message: 'Report deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete report' });
    }
  });

  // Police Vehicles routes
  app.get('/api/police-vehicles', requireAuth, async (req, res) => {
    try {
      const vehicles = await storage.getPoliceVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch police vehicles' });
    }
  });

  app.get('/api/police-vehicles/:id', requireAuth, async (req, res) => {
    try {
      const vehicle = await storage.getPoliceVehicle(parseInt(req.params.id));
      if (!vehicle) {
        return res.status(404).json({ message: 'Police vehicle not found' });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch police vehicle' });
    }
  });

  app.post('/api/police-vehicles', requireAuth, async (req, res) => {
    try {
      const vehicleData = insertPoliceVehicleSchema.parse(req.body);
      const newVehicle = await storage.createPoliceVehicle(vehicleData);
      res.status(201).json(newVehicle);
    } catch (error) {
      res.status(400).json({ message: 'Invalid police vehicle data' });
    }
  });

  app.put('/api/police-vehicles/:id', requireAuth, async (req, res) => {
    try {
      const vehicleData = insertPoliceVehicleSchema.parse(req.body);
      const updatedVehicle = await storage.updatePoliceVehicle(parseInt(req.params.id), vehicleData);
      res.json(updatedVehicle);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update police vehicle' });
    }
  });

  app.patch('/api/police-vehicles/:id/location', requireAuth, async (req, res) => {
    try {
      const { location } = req.body;
      if (!location || !Array.isArray(location) || location.length !== 2) {
        return res.status(400).json({ message: 'Invalid location format. Expected [longitude, latitude]' });
      }
      const updatedVehicle = await storage.updateVehicleLocation(parseInt(req.params.id), location);
      res.json(updatedVehicle);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update vehicle location' });
    }
  });

  app.patch('/api/police-vehicles/:id/status', requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !['available', 'on_patrol', 'responding', 'out_of_service'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be one of: available, on_patrol, responding, out_of_service' });
      }
      const updatedVehicle = await storage.updateVehicleStatus(parseInt(req.params.id), status);
      res.json(updatedVehicle);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update vehicle status' });
    }
  });

  app.delete('/api/police-vehicles/:id', requireAuth, async (req, res) => {
    try {
      await storage.deletePoliceVehicle(parseInt(req.params.id));
      res.json({ message: 'Police vehicle deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete police vehicle' });
    }
  });

  const server = createServer(app);
  return server;
}