/**
 * Seed script — creates default users and sample master data
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Institution = require('./models/Institution');
const Campus = require('./models/Campus');
const Department = require('./models/Department');
const Program = require('./models/Program');
const SeatMatrix = require('./models/SeatMatrix');

const connectDB = require('./config/db');

const seed = async () => {
  await connectDB();

  // Clear existing data (optional — comment out to preserve)
  await User.deleteMany({});
  console.log('Cleared users');

  // Create users via .create() so the pre-save password hash hook is triggered
  const admin   = await User.create({ name: 'Admin User',        email: 'admin@edumerge.com',      password: 'Admin@123',   role: 'admin' });
  const officer = await User.create({ name: 'Admission Officer', email: 'officer@edumerge.com',    password: 'Officer@123', role: 'admission_officer' });
  const mgmt    = await User.create({ name: 'Management View',   email: 'management@edumerge.com', password: 'Mgmt@123',    role: 'management' });
  console.log('Created users');

  // Check if sample data already exists
  const existingInst = await Institution.findOne({ code: 'SVCE' });
  if (!existingInst) {
    const institution = await Institution.create({
      name: 'Sample Valley College of Engineering',
      code: 'SVCE',
      address: '123 College Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      createdBy: admin._id
    });

    const campus = await Campus.create({
      institution: institution._id,
      name: 'Main Campus',
      code: 'MAIN',
      address: 'Bengaluru, Karnataka'
    });

    const dept = await Department.create({
      campus: campus._id,
      name: 'Computer Science & Engineering',
      code: 'CSE'
    });

    const program = await Program.create({
      department: dept._id,
      name: 'B.E. Computer Science',
      code: 'CSE',
      courseType: 'UG',
      entryType: 'Regular',
      admissionMode: 'Both',
      academicYear: '2026',
      totalIntake: 60
    });

    await SeatMatrix.create({
      program: program._id,
      academicYear: '2026',
      quotas: {
        KCET: { total: 30, allocated: 0 },
        COMEDK: { total: 10, allocated: 0 },
        Management: { total: 20, allocated: 0 }
      },
      supernumerary: { total: 0, allocated: 0 }
    });

    console.log('Created sample institution, campus, department, program, and seat matrix');
  }

  console.log('\n=== Seed Completed ===');
  console.log('Login credentials:');
  console.log('  Admin:            admin@edumerge.com      / Admin@123');
  console.log('  Admission Officer: officer@edumerge.com   / Officer@123');
  console.log('  Management View:  management@edumerge.com / Mgmt@123');
  process.exit(0);
};

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
