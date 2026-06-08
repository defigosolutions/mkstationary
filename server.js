import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import mysql from "mysql2/promise";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Secrets
const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || crypto.randomBytes(32).toString("hex");
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");

// Middleware
app.use(cors());
app.use(express.json());

// JSON File Database Configuration
const DB_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DB_DIR, "db.json");

const defaultDb = {
  admins: [],
  bookings: [],
  seo: {
    home: {
      title: "MK Stationary Hair CT | Premium Haircut Salon in New Haven, CT",
      desc: "Welcome to MK Stationary Hair CT, New Haven's premier hair salon for sharp cuts, modern styling, beard trims, natural hair care, and coloring."
    },
    about: {
      title: "About Our Salon | MK Stationary Hair CT New Haven",
      desc: "Learn about MK Stationary Hair CT in New Haven, CT. Our experienced barbers and stylists deliver premium haircuts and professional hair styling."
    },
    services: {
      title: "Haircut, Styling & Grooming Services | New Haven, CT",
      desc: "Explore our professional salon services in New Haven: men's haircuts, texturized styling, sharp beard trims, natural hair coloring, and specialized hair care."
    },
    pricing: {
      title: "Haircut & Salon Pricing | MK Stationary Hair CT New Haven",
      desc: "Affordable and premium hair styling rates. View our pricing for haircuts, styling, coloring, and beard trims in New Haven, CT."
    },
    gallery: {
      title: "Hair Style Lookbook & Gallery | MK Stationary Hair CT",
      desc: "Browse our salon gallery of professional hair styles, custom braids, and modern haircuts created by our stylists in New Haven, CT."
    },
    contact: {
      title: "Book Appointment & Contact | MK Stationary Hair CT New Haven",
      desc: "Book a seat or visit us at 57 Ellsworth Ave, New Haven, CT. Call 203-430-0975 for fresh styling, premium cuts, and natural hair care."
    }
  },
  smtp: {
    host: "",
    port: 587,
    secure: false,
    user: "",
    pass: "",
    fromEmail: "mkstationaryhair@gmail.com",
    toEmail: "mkstationaryhair@gmail.com",
    enabled: false
  },
  content: {
    heroTitle: "Sharp Cuts, \nFresh Style",
    heroDesc: "Welcome to MK Stationary Hair CT, your trusted hair salon for clean haircuts, styling, beard trims, color and natural hair care.",
    phone: "203-430-0975",
    email: "mkstationaryhair@gmail.com",
    address: "57 Ellsworth Ave, New Haven, CT 06511",
    hours: "Open 6 days a week"
  },
  services: [
    { id: "1", title: "Men Haircut", desc: "Clean, sharp and stylish haircut for everyday confidence.", price: "$25" },
    { id: "2", title: "Hair Styling", desc: "Modern styling, blow dry, texture and finishing.", price: "$35" },
    { id: "3", title: "Beard Trim", desc: "Professional beard shaping, line-up and grooming.", price: "$15" },
    { id: "4", title: "Hair Color", desc: "Natural-looking color, touch-up and creative color work.", price: "$60" },
    { id: "5", title: "Kids Haircut", desc: "Comfortable haircut experience for kids.", price: "$18" },
    { id: "6", title: "Natural Hair Care", desc: "Care, styling and guidance for healthy natural hair.", price: "$45" }
  ],
  faqs: [
    {
      id: "1",
      q: "How can I book an appointment?",
      a: "You can book an appointment by filling the booking form, calling us directly, or visiting our salon during working hours."
    },
    {
      id: "2",
      q: "How often do you update your services menu?",
      a: "We update our services whenever new styles, treatments, or seasonal offers are available."
    },
    {
      id: "3",
      q: "How can I change or cancel my booking?",
      a: "You can call us before your appointment time and our team will help you reschedule or cancel your booking."
    },
    {
      id: "4",
      q: "What special packages or offers are available?",
      a: "We offer haircut, styling, beard trim, hair color and natural hair care packages. Final offers can be updated later."
    }
  ],
  menus: [
    { id: "1", label: "Home", url: "home", menu_order: 1, page_id: null, parent_id: null },
    { id: "c1", label: "Welcome", url: "home", menu_order: 1, page_id: null, parent_id: "1" },
    { id: "c2", label: "Our Legacy", url: "about", menu_order: 2, page_id: null, parent_id: "1" },
    { id: "c3", label: "The Experience", url: "gallery", menu_order: 3, page_id: null, parent_id: "1" },
    { id: "2", label: "About", url: "about", menu_order: 2, page_id: null, parent_id: null },
    { id: "3", label: "Services", url: "services", menu_order: 3, page_id: null, parent_id: null },
    { id: "c4", label: "Signature Haircut", url: "services", menu_order: 1, page_id: null, parent_id: "3" },
    { id: "c5", label: "Grooming & Shaves", url: "services", menu_order: 2, page_id: null, parent_id: "3" },
    { id: "c6", label: "Beard Detailing", url: "services", menu_order: 3, page_id: null, parent_id: "3" },
    { id: "c7", label: "Color Treatments", url: "services", menu_order: 4, page_id: null, parent_id: "3" },
    { id: "c8", label: "Organic Hair Care", url: "services", menu_order: 5, page_id: null, parent_id: "3" },
    { id: "4", label: "Pricing", url: "pricing", menu_order: 4, page_id: null, parent_id: null },
    { id: "c9", label: "Service Rates", url: "pricing", menu_order: 1, page_id: null, parent_id: "4" },
    { id: "c10", label: "Grooming Packages", url: "pricing", menu_order: 2, page_id: null, parent_id: "4" },
    { id: "c11", label: "Secure A Seat", url: "contact", menu_order: 3, page_id: null, parent_id: "4" },
    { id: "5", label: "Gallery", url: "gallery", menu_order: 5, page_id: null, parent_id: null },
    { id: "6", label: "Contact", url: "contact", menu_order: 6, page_id: null, parent_id: null }
  ],
  pages: [],
  logs: [],
  config: {
    logRetentionDays: 60
  }
};

// Cryptography Helpers
function hashPassword(password, salt) {
  if (!salt) salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return { salt, hash };
}

function signToken(email) {
  const expires = Date.now() + 8 * 60 * 60 * 1000; // 8 hours
  const signature = crypto.createHmac("sha256", JWT_SECRET)
    .update(`${email}:${expires}`)
    .digest("hex");
  return `${email}:${expires}:${signature}`;
}

function verifyToken(token) {
  if (!token) return null;
  const parts = token.split(":");
  if (parts.length !== 3) return null;
  const [email, expires, signature] = parts;

  if (Date.now() > parseInt(expires)) return null;

  const expectedSignature = crypto.createHmac("sha256", JWT_SECRET)
    .update(`${email}:${expires}`)
    .digest("hex");

  if (signature !== expectedSignature) return null;
  return email;
}

function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 15) + 2;
  const num2 = Math.floor(Math.random() * 10) + 2;
  const answer = (num1 + num2).toString();
  const expires = Date.now() + 5 * 60 * 1000; // 5 mins
  
  const hash = crypto.createHmac("sha256", CAPTCHA_SECRET)
    .update(`${answer}:${expires}`)
    .digest("hex");
    
  return { question: `Verify: What is ${num1} + ${num2}?`, token: `${expires}:${hash}` };
}

function verifyCaptcha(answer, token) {
  if (!token || !answer) return false;
  const parts = token.split(":");
  if (parts.length !== 2) return false;
  const [expires, hash] = parts;
  
  if (Date.now() > parseInt(expires)) return false; // Expired
  
  const expectedHash = crypto.createHmac("sha256", CAPTCHA_SECRET)
    .update(`${answer}:${expires}`)
    .digest("hex");
    
  return hash === expectedHash;
}

// Storage Driver States
let dbPool = null;
let useMySQL = false;

if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME) {
  useMySQL = true;
}

function readDb() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      // Seed default admin in defaultDb before writing
      const seeded = hashPassword("Defigo@123");
      defaultDb.admins.push({
        email: "admin@mkstationary.com",
        password_hash: seeded.hash,
        salt: seeded.salt,
        created_at: new Date().toISOString()
      });
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), "utf8");
      return defaultDb;
    }
    const data = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(data);
    
    // Schema Migrations
    if (!parsed.admins || parsed.admins.length === 0) {
      const seeded = hashPassword("Defigo@123");
      parsed.admins = [{
        email: "admin@mkstationary.com",
        password_hash: seeded.hash,
        salt: seeded.salt,
        created_at: new Date().toISOString()
      }];
      writeDb(parsed);
    }
    if (!parsed.menus || parsed.menus.length <= 6) {
      parsed.menus = defaultDb.menus;
      writeDb(parsed);
    }
    if (!parsed.pages) parsed.pages = defaultDb.pages;
    if (!parsed.logs) parsed.logs = defaultDb.logs;
    if (!parsed.config) parsed.config = defaultDb.config;
    if (!parsed.content) parsed.content = defaultDb.content;
    if (!parsed.services) parsed.services = defaultDb.services;
    if (!parsed.faqs) parsed.faqs = defaultDb.faqs;
    
    return parsed;
  } catch (err) {
    console.error("Database read error:", err);
    return defaultDb;
  }
}

function writeDb(data) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Database write error:", err);
  }
}

// Database Helper Functions
async function getBookings() {
  if (useMySQL) {
    const [rows] = await dbPool.query("SELECT * FROM bookings ORDER BY createdAt DESC");
    return rows;
  } else {
    return readDb().bookings || [];
  }
}

async function addBooking(booking) {
  if (useMySQL) {
    await dbPool.query(
      "INSERT INTO bookings (id, name, email, phone, date, service, message, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [booking.id, booking.name, booking.email, booking.phone, booking.date, booking.service, booking.message, booking.status, booking.createdAt]
    );
  } else {
    const db = readDb();
    if (!db.bookings) db.bookings = [];
    db.bookings.push(booking);
    writeDb(db);
  }
}

async function updateBookingStatus(id, status) {
  if (useMySQL) {
    const [res] = await dbPool.query("UPDATE bookings SET status = ? WHERE id = ?", [status, id]);
    return res.affectedRows > 0;
  } else {
    const db = readDb();
    const booking = db.bookings?.find((b) => b.id === id);
    if (booking) {
      booking.status = status;
      writeDb(db);
      return true;
    }
    return false;
  }
}

async function deleteBooking(id) {
  if (useMySQL) {
    const [res] = await dbPool.query("DELETE FROM bookings WHERE id = ?", [id]);
    return res.affectedRows > 0;
  } else {
    const db = readDb();
    const idx = db.bookings?.findIndex((b) => b.id === id);
    if (idx !== undefined && idx > -1) {
      db.bookings.splice(idx, 1);
      writeDb(db);
      return true;
    }
    return false;
  }
}

async function getPageContent() {
  if (useMySQL) {
    const [settingsRows] = await dbPool.query("SELECT * FROM content_settings");
    const settings = {};
    settingsRows.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });

    const [servicesRows] = await dbPool.query("SELECT * FROM services");
    const services = servicesRows.map((s) => ({
      id: s.id,
      title: s.title,
      desc: s.desc_text,
      price: s.price
    }));

    const [faqsRows] = await dbPool.query("SELECT * FROM faqs");

    return { settings, services, faqs: faqsRows };
  } else {
    const db = readDb();
    return {
      settings: db.content || {},
      services: db.services || [],
      faqs: db.faqs || []
    };
  }
}

async function savePageSettings(settings) {
  if (useMySQL) {
    for (const [key, val] of Object.entries(settings)) {
      await dbPool.query(
        "INSERT INTO content_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
        [key, val, val]
      );
    }
  } else {
    const db = readDb();
    db.content = { ...(db.content || {}), ...settings };
    writeDb(db);
  }
}

async function saveService(service) {
  if (useMySQL) {
    await dbPool.query(
      `INSERT INTO services (id, title, desc_text, price) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE title = ?, desc_text = ?, price = ?`,
      [service.id, service.title, service.desc, service.price, service.title, service.desc, service.price]
    );
  } else {
    const db = readDb();
    if (!db.services) db.services = [];
    const idx = db.services.findIndex((s) => s.id === service.id);
    if (idx > -1) {
      db.services[idx] = service;
    } else {
      db.services.push(service);
    }
    writeDb(db);
  }
}

async function deleteService(id) {
  if (useMySQL) {
    await dbPool.query("DELETE FROM services WHERE id = ?", [id]);
  } else {
    const db = readDb();
    if (db.services) {
      db.services = db.services.filter((s) => s.id !== id);
      writeDb(db);
    }
  }
}

async function saveFaq(faq) {
  if (useMySQL) {
    await dbPool.query(
      `INSERT INTO faqs (id, q, a) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE q = ?, a = ?`,
      [faq.id, faq.q, faq.a, faq.q, faq.a]
    );
  } else {
    const db = readDb();
    if (!db.faqs) db.faqs = [];
    const idx = db.faqs.findIndex((f) => f.id === faq.id);
    if (idx > -1) {
      db.faqs[idx] = faq;
    } else {
      db.faqs.push(faq);
    }
    writeDb(db);
  }
}

async function deleteFaq(id) {
  if (useMySQL) {
    await dbPool.query("DELETE FROM faqs WHERE id = ?", [id]);
  } else {
    const db = readDb();
    if (db.faqs) {
      db.faqs = db.faqs.filter((f) => f.id !== id);
      writeDb(db);
    }
  }
}

async function getSeo() {
  if (useMySQL) {
    const [rows] = await dbPool.query("SELECT * FROM seo");
    const seo = {};
    rows.forEach((row) => {
      seo[row.section_key] = {
        title: row.title,
        desc: row.meta_description
      };
    });
    return seo;
  } else {
    return readDb().seo || {};
  }
}

async function saveSeo(seo) {
  if (useMySQL) {
    for (const [key, value] of Object.entries(seo)) {
      await dbPool.query(
        `INSERT INTO seo (section_key, title, meta_description) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE title = ?, meta_description = ?`,
        [key, value.title, value.desc, value.title, value.desc]
      );
    }
  } else {
    const db = readDb();
    db.seo = { ...(db.seo || {}), ...seo };
    writeDb(db);
  }
}

async function getSmtp() {
  if (useMySQL) {
    const [rows] = await dbPool.query("SELECT * FROM smtp_config WHERE id = 1");
    if (rows.length > 0) {
      const row = rows[0];
      return {
        host: row.host,
        port: row.port,
        secure: row.secure === 1,
        user: row.user,
        pass: row.pass,
        fromEmail: row.fromEmail,
        toEmail: row.toEmail,
        enabled: row.enabled === 1
      };
    }
    return defaultDb.smtp;
  } else {
    return readDb().smtp || {};
  }
}

async function saveSmtp(smtp) {
  if (useMySQL) {
    if (smtp.pass) {
      await dbPool.query(
        `INSERT INTO smtp_config (id, host, port, secure, user, pass, fromEmail, toEmail, enabled)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE host = ?, port = ?, secure = ?, user = ?, pass = ?, fromEmail = ?, toEmail = ?, enabled = ?`,
        [smtp.host, smtp.port, smtp.secure ? 1 : 0, smtp.user, smtp.pass, smtp.fromEmail, smtp.toEmail, smtp.enabled ? 1 : 0,
         smtp.host, smtp.port, smtp.secure ? 1 : 0, smtp.user, smtp.pass, smtp.fromEmail, smtp.toEmail, smtp.enabled ? 1 : 0]
      );
    } else {
      await dbPool.query(
        `INSERT INTO smtp_config (id, host, port, secure, user, fromEmail, toEmail, enabled)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE host = ?, port = ?, secure = ?, user = ?, fromEmail = ?, toEmail = ?, enabled = ?`,
        [smtp.host, smtp.port, smtp.secure ? 1 : 0, smtp.user, smtp.fromEmail, smtp.toEmail, smtp.enabled ? 1 : 0,
         smtp.host, smtp.port, smtp.secure ? 1 : 0, smtp.user, smtp.fromEmail, smtp.toEmail, smtp.enabled ? 1 : 0]
      );
    }
  } else {
    const db = readDb();
    if (!db.smtp) db.smtp = {};
    const updated = { ...db.smtp, ...smtp };
    if (!smtp.pass) {
      updated.pass = db.smtp.pass;
    }
    db.smtp = updated;
    writeDb(db);
  }
}

// Database Initialization & Table Auto-Creation
async function initDatabase() {
  if (!useMySQL) {
    console.log("Database Mode: JSON File fallback (data/db.json)");
    readDb();
    await pruneLogs();
    return;
  }

  console.log("Database Mode: Production MySQL");
  try {
    dbPool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const connection = await dbPool.getConnection();
    console.log("MySQL connection established successfully.");
    connection.release();

    await createTables();
    await pruneLogs();
  } catch (err) {
    console.error("MySQL connection failed! Falling back to JSON database.", err);
    useMySQL = false;
    readDb();
    await pruneLogs();
  }
}

async function createTables() {
  // Admins Registry Table
  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      email VARCHAR(255) PRIMARY KEY,
      password_hash VARCHAR(255) NOT NULL,
      salt VARCHAR(255) NOT NULL,
      created_at DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Bookings Table
  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(50),
      date VARCHAR(50) NOT NULL,
      service VARCHAR(255) NOT NULL,
      message TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      createdAt VARCHAR(50) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // SEO Configurations Table
  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS seo (
      section_key VARCHAR(50) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      meta_description TEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // SMTP Configuration Table
  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS smtp_config (
      id INT PRIMARY KEY DEFAULT 1,
      host VARCHAR(255) DEFAULT '',
      port INT DEFAULT 587,
      secure TINYINT(1) DEFAULT 0,
      user VARCHAR(255) DEFAULT '',
      pass VARCHAR(255) DEFAULT '',
      fromEmail VARCHAR(255) DEFAULT 'mkstationaryhair@gmail.com',
      toEmail VARCHAR(255) DEFAULT 'mkstationaryhair@gmail.com',
      enabled TINYINT(1) DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Content Settings Table (Key-Value)
  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS content_settings (
      setting_key VARCHAR(50) PRIMARY KEY,
      setting_value TEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Services Menu Table
  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS services (
      id VARCHAR(50) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      desc_text TEXT NOT NULL,
      price VARCHAR(50) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // FAQs Table
  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS faqs (
      id VARCHAR(50) PRIMARY KEY,
      q TEXT NOT NULL,
      a TEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Navigation Menus Table
  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS menus (
      id VARCHAR(50) PRIMARY KEY,
      label VARCHAR(255) NOT NULL,
      url VARCHAR(255) NOT NULL,
      menu_order INT NOT NULL,
      page_id VARCHAR(50) DEFAULT NULL,
      parent_id VARCHAR(50) DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  try {
    await dbPool.query("ALTER TABLE menus ADD COLUMN parent_id VARCHAR(50) DEFAULT NULL");
  } catch (err) {
    // Column already exists, ignore
  }

  // Custom Pages Table
  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS pages (
      id VARCHAR(50) PRIMARY KEY,
      slug VARCHAR(255) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      content_html TEXT NOT NULL,
      created_at DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Activity Audit Logs Table
  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id VARCHAR(50) PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      action TEXT NOT NULL,
      ip_address VARCHAR(50) NOT NULL,
      timestamp DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Config Settings Table
  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS config_settings (
      setting_key VARCHAR(50) PRIMARY KEY,
      setting_value VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Seeds validations
  const [adminRows] = await dbPool.query("SELECT COUNT(*) as count FROM admins");
  if (adminRows[0].count === 0) {
    const seeded = hashPassword("Defigo@123");
    await dbPool.query(
      "INSERT INTO admins (email, password_hash, salt, created_at) VALUES (?, ?, ?, NOW())",
      ["admin@mkstationary.com", seeded.hash, seeded.salt]
    );
  }

  const [seoRows] = await dbPool.query("SELECT COUNT(*) as count FROM seo");
  if (seoRows[0].count === 0) {
    for (const [key, value] of Object.entries(defaultDb.seo)) {
      await dbPool.query("INSERT INTO seo (section_key, title, meta_description) VALUES (?, ?, ?)", [key, value.title, value.desc]);
    }
  }

  const [smtpRows] = await dbPool.query("SELECT COUNT(*) as count FROM smtp_config");
  if (smtpRows[0].count === 0) {
    await dbPool.query(
      `INSERT INTO smtp_config (id, host, port, secure, user, pass, fromEmail, toEmail, enabled)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [defaultDb.smtp.host, defaultDb.smtp.port, defaultDb.smtp.secure ? 1 : 0, defaultDb.smtp.user, defaultDb.smtp.pass, defaultDb.smtp.fromEmail, defaultDb.smtp.toEmail, defaultDb.smtp.enabled ? 1 : 0]
    );
  }

  const [settingsRows] = await dbPool.query("SELECT COUNT(*) as count FROM content_settings");
  if (settingsRows[0].count === 0) {
    for (const [key, value] of Object.entries(defaultDb.content)) {
      await dbPool.query("INSERT INTO content_settings (setting_key, setting_value) VALUES (?, ?)", [key, value]);
    }
  }

  const [servicesRows] = await dbPool.query("SELECT COUNT(*) as count FROM services");
  if (servicesRows[0].count === 0) {
    for (const s of defaultDb.services) {
      await dbPool.query("INSERT INTO services (id, title, desc_text, price) VALUES (?, ?, ?, ?)", [s.id, s.title, s.desc, s.price]);
    }
  }

  const [faqsRows] = await dbPool.query("SELECT COUNT(*) as count FROM faqs");
  if (faqsRows[0].count === 0) {
    for (const f of defaultDb.faqs) {
      await dbPool.query("INSERT INTO faqs (id, q, a) VALUES (?, ?, ?)", [f.id, f.q, f.a]);
    }
  }

  const [menusRows] = await dbPool.query("SELECT COUNT(*) as count FROM menus");
  if (menusRows[0].count === 0) {
    for (const m of defaultDb.menus) {
      await dbPool.query("INSERT INTO menus (id, label, url, menu_order, page_id, parent_id) VALUES (?, ?, ?, ?, ?, ?)", [m.id, m.label, m.url, m.menu_order, m.page_id, m.parent_id]);
    }
  }

  const [configRows] = await dbPool.query("SELECT COUNT(*) as count FROM config_settings");
  if (configRows[0].count === 0) {
    await dbPool.query("INSERT INTO config_settings (setting_key, setting_value) VALUES ('log_retention_days', '60')");
  }
}

// Log Hook
async function logActivity(email, action, req) {
  const ip = req ? req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1" : "system";
  const timestamp = new Date().toISOString();
  const id = Date.now().toString() + Math.floor(Math.random() * 1000).toString();

  if (useMySQL) {
    try {
      await dbPool.query(
        "INSERT INTO activity_logs (id, email, action, ip_address, timestamp) VALUES (?, ?, ?, ?, NOW())",
        [id, email, action, ip]
      );
    } catch (err) {
      console.error("SQL Log Write Error:", err);
    }
  } else {
    const db = readDb();
    if (!db.logs) db.logs = [];
    db.logs.push({ id, email, action, ip_address: ip, timestamp });
    writeDb(db);
  }
}

// Log Cleanup Pruning
async function pruneLogs() {
  let retentionDays = 60;
  if (useMySQL) {
    try {
      const [rows] = await dbPool.query("SELECT setting_value FROM config_settings WHERE setting_key = 'log_retention_days'");
      if (rows.length > 0) {
        retentionDays = parseInt(rows[0].setting_value) || 60;
      }
      await dbPool.query(
        "DELETE FROM activity_logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)",
        [retentionDays]
      );
      console.log(`Logs older than ${retentionDays} days cleared in MySQL.`);
    } catch (err) {
      console.error("MySQL log pruning error:", err);
    }
  } else {
    const db = readDb();
    retentionDays = parseInt(db.config?.logRetentionDays) || 60;
    const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    if (db.logs) {
      const beforeCount = db.logs.length;
      db.logs = db.logs.filter((log) => new Date(log.timestamp).getTime() > cutoff);
      if (db.logs.length !== beforeCount) {
        writeDb(db);
        console.log(`JSON logs older than ${retentionDays} days pruned. Deleted ${beforeCount - db.logs.length} entries.`);
      }
    }
  }
}

// Start daily cron-like intervals for log cleaning
setInterval(pruneLogs, 24 * 60 * 60 * 1000);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access denied" });

  const email = verifyToken(token);
  if (email) {
    req.adminEmail = email;
    next();
  } else {
    res.status(403).json({ error: "Invalid token" });
  }
};

// Send SMTP Emails
async function sendBookingEmail(booking, smtpConfig) {
  if (!smtpConfig || !smtpConfig.enabled || !smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
    return false;
  }
  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: parseInt(smtpConfig.port) || 587,
    secure: smtpConfig.secure === true,
    auth: { user: smtpConfig.user, pass: smtpConfig.pass }
  });

  const mailOptionsAdmin = {
    from: `"${booking.name}" <${smtpConfig.fromEmail}>`,
    to: smtpConfig.toEmail,
    subject: `New Salon Appointment: ${booking.service}`,
    html: `
      <h2>New Booking Request Received</h2>
      <p><strong>Name:</strong> ${booking.name}</p>
      <p><strong>Email:</strong> ${booking.email}</p>
      <p><strong>Phone:</strong> ${booking.phone || "N/A"}</p>
      <p><strong>Date:</strong> ${booking.date}</p>
      <p><strong>Service:</strong> ${booking.service}</p>
      <p><strong>Message:</strong> ${booking.message || "No additional message."}</p>
      <hr />
      <p>To manage bookings, log in to the admin panel at your website/mkscms</p>
    `
  };

  try {
    await transporter.sendMail(mailOptionsAdmin);
    return true;
  } catch (err) {
    console.error("Nodemailer error:", err);
    return false;
  }
}

// CAPTCHA API
app.get("/api/auth/captcha", (req, res) => {
  const captcha = generateCaptcha();
  res.json(captcha);
});

// Login Endpoint
app.post("/api/auth/login", async (req, res) => {
  const { email, password, captchaAnswer, captchaToken } = req.body;

  if (!email || !password || !captchaAnswer || !captchaToken) {
    return res.status(400).json({ error: "Username, Password, and Captcha are required." });
  }

  // Verify Captcha
  if (!verifyCaptcha(captchaAnswer, captchaToken)) {
    await logActivity(email, `Failed login attempt: Incorrect Captcha`, req);
    return res.status(400).json({ error: "Incorrect or expired Captcha puzzle." });
  }

  try {
    let admin = null;
    if (useMySQL) {
      const [rows] = await dbPool.query("SELECT * FROM admins WHERE email = ?", [email]);
      if (rows.length > 0) admin = rows[0];
    } else {
      const db = readDb();
      admin = db.admins.find((a) => a.email === email);
    }

    if (!admin) {
      await logActivity(email, `Failed login attempt: Admin username not found`, req);
      return res.status(400).json({ error: "Invalid username or password" });
    }

    // Hash comparison
    const hashed = hashPassword(password, admin.salt);
    if (hashed.hash === admin.password_hash) {
      const token = signToken(email);
      await logActivity(email, `Logged in successfully`, req);
      res.json({ token, email });
    } else {
      await logActivity(email, `Failed login attempt: Invalid Password`, req);
      res.status(400).json({ error: "Invalid username or password" });
    }
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal login failure" });
  }
});

// Administrators Management API
app.get("/api/admins", authenticateToken, async (req, res) => {
  try {
    let list = [];
    if (useMySQL) {
      const [rows] = await dbPool.query("SELECT email, created_at FROM admins");
      list = rows;
    } else {
      list = readDb().admins.map((a) => ({ email: a.email, created_at: a.created_at }));
    }
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to load admins" });
  }
});

app.post("/api/admins", authenticateToken, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

  const hashed = hashPassword(password);
  const createdAt = new Date().toISOString();

  try {
    if (useMySQL) {
      const [exist] = await dbPool.query("SELECT email FROM admins WHERE email = ?", [email]);
      if (exist.length > 0) return res.status(400).json({ error: "Administrator email already exists." });

      await dbPool.query(
        "INSERT INTO admins (email, password_hash, salt, created_at) VALUES (?, ?, ?, NOW())",
        [email, hashed.hash, hashed.salt]
      );
    } else {
      const db = readDb();
      const exist = db.admins.find((a) => a.email === email);
      if (exist) return res.status(400).json({ error: "Administrator email already exists." });

      db.admins.push({ email, password_hash: hashed.hash, salt: hashed.salt, created_at: createdAt });
      writeDb(db);
    }

    await logActivity(req.adminEmail, `Created new administrator: ${email}`, req);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save administrator" });
  }
});

app.delete("/api/admins/:email", authenticateToken, async (req, res) => {
  const { email } = req.params;
  if (email === req.adminEmail) {
    return res.status(400).json({ error: "You cannot delete your own account." });
  }

  try {
    let affected = false;
    if (useMySQL) {
      const [res] = await dbPool.query("DELETE FROM admins WHERE email = ?", [email]);
      affected = res.affectedRows > 0;
    } else {
      const db = readDb();
      const idx = db.admins.findIndex((a) => a.email === email);
      if (idx > -1) {
        db.admins.splice(idx, 1);
        writeDb(db);
        affected = true;
      }
    }

    if (affected) {
      await logActivity(req.adminEmail, `Deleted administrator account: ${email}`, req);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Admin not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to delete administrator" });
  }
});

// Logs & Retention Settings API
app.get("/api/logs", authenticateToken, async (req, res) => {
  try {
    let logs = [];
    let retention = 60;

    if (useMySQL) {
      const [logRows] = await dbPool.query("SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 500");
      logs = logRows;
      const [config] = await dbPool.query("SELECT setting_value FROM config_settings WHERE setting_key = 'log_retention_days'");
      if (config.length > 0) retention = parseInt(config[0].setting_value) || 60;
    } else {
      const db = readDb();
      logs = db.logs ? [...db.logs].reverse() : [];
      retention = db.config?.logRetentionDays || 60;
    }
    res.json({ logs, retention });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve logs" });
  }
});

app.post("/api/logs/retention", authenticateToken, async (req, res) => {
  const { days } = req.body;
  if (!days || isNaN(days) || days < 30 || days > 120) {
    return res.status(400).json({ error: "Log retention must be between 30 and 120 days." });
  }

  try {
    if (useMySQL) {
      await dbPool.query(
        "INSERT INTO config_settings (setting_key, setting_value) VALUES ('log_retention_days', ?) ON DUPLICATE KEY UPDATE setting_value = ?",
        [days.toString(), days.toString()]
      );
    } else {
      const db = readDb();
      if (!db.config) db.config = {};
      db.config.logRetentionDays = days;
      writeDb(db);
    }

    await logActivity(req.adminEmail, `Configured log retention window to ${days} days`, req);
    await pruneLogs(); // Immediately trigger pruning

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save settings" });
  }
});

// Menus API
app.get("/api/menus", async (req, res) => {
  try {
    let menus = [];
    if (useMySQL) {
      const [rows] = await dbPool.query("SELECT * FROM menus ORDER BY menu_order ASC");
      menus = rows;
    } else {
      menus = readDb().menus.sort((a, b) => a.menu_order - b.menu_order);
    }
    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve menus" });
  }
});

app.post("/api/menus/reorder", authenticateToken, async (req, res) => {
  const { reorderedMenus } = req.body;
  if (!Array.isArray(reorderedMenus)) return res.status(400).json({ error: "Reordered list must be an array." });

  try {
    if (useMySQL) {
      for (const m of reorderedMenus) {
        await dbPool.query("UPDATE menus SET menu_order = ? WHERE id = ?", [m.menu_order, m.id]);
      }
    } else {
      const db = readDb();
      reorderedMenus.forEach((m) => {
        const item = db.menus.find((x) => x.id === m.id);
        if (item) item.menu_order = m.menu_order;
      });
      writeDb(db);
    }

    await logActivity(req.adminEmail, "Reordered navigation menu hierarchy", req);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to reorder menus" });
  }
});

app.post("/api/menus", authenticateToken, async (req, res) => {
  const { id, label, url, menu_order, page_id, parent_id } = req.body;
  if (!label || !url) {
    return res.status(400).json({ error: "Label and URL are required." });
  }

  const menuId = id || Date.now().toString();
  const menuOrder = menu_order !== undefined ? parseInt(menu_order) : 1;
  const parentId = parent_id || null;
  const pageId = page_id || null;

  try {
    if (useMySQL) {
      await dbPool.query(
        `INSERT INTO menus (id, label, url, menu_order, page_id, parent_id)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE label = ?, url = ?, menu_order = ?, page_id = ?, parent_id = ?`,
        [menuId, label, url, menuOrder, pageId, parentId, label, url, menuOrder, pageId, parentId]
      );
    } else {
      const db = readDb();
      if (!db.menus) db.menus = [];
      const idx = db.menus.findIndex((m) => m.id === menuId);
      const newMenu = { id: menuId, label, url, menu_order: menuOrder, page_id: pageId, parent_id: parentId };
      if (idx > -1) {
        db.menus[idx] = newMenu;
      } else {
        db.menus.push(newMenu);
      }
      writeDb(db);
    }

    await logActivity(req.adminEmail, `Created/Updated menu item: ${label} (${url})`, req);
    res.json({ success: true, menu: { id: menuId, label, url, menu_order: menuOrder, page_id: pageId, parent_id: parentId } });
  } catch (err) {
    console.error("Save Menu Error:", err);
    res.status(500).json({ error: "Failed to save menu option" });
  }
});

app.delete("/api/menus/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    let affected = false;
    let label = "";

    if (useMySQL) {
      const [rows] = await dbPool.query("SELECT label FROM menus WHERE id = ?", [id]);
      if (rows.length > 0) {
        label = rows[0].label;
        await dbPool.query("DELETE FROM menus WHERE id = ?", [id]);
        await dbPool.query("UPDATE menus SET parent_id = NULL WHERE parent_id = ?", [id]);
        affected = true;
      }
    } else {
      const db = readDb();
      const idx = db.menus?.findIndex((m) => m.id === id);
      if (idx !== undefined && idx > -1) {
        label = db.menus[idx].label;
        db.menus.splice(idx, 1);
        db.menus.forEach((m) => {
          if (m.parent_id === id) m.parent_id = null;
        });
        writeDb(db);
        affected = true;
      }
    }

    if (affected) {
      await logActivity(req.adminEmail, `Deleted menu item: ${label}`, req);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Menu item not found" });
    }
  } catch (err) {
    console.error("Delete Menu Error:", err);
    res.status(500).json({ error: "Failed to delete menu option" });
  }
});

// Custom Pages API
app.get("/api/pages", async (req, res) => {
  try {
    let list = [];
    if (useMySQL) {
      const [rows] = await dbPool.query("SELECT * FROM pages ORDER BY created_at DESC");
      list = rows;
    } else {
      list = readDb().pages;
    }
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to load pages" });
  }
});

app.post("/api/pages", authenticateToken, async (req, res) => {
  const { id, title, slug, content_html } = req.body;

  if (!title || !slug || !content_html) {
    return res.status(400).json({ error: "Title, slug, and content are required fields." });
  }

  const pageId = id || Date.now().toString();
  const pageSlug = slug.startsWith("/") ? slug : `/${slug}`;
  const now = new Date().toISOString();

  // Validate slug uniqueness
  try {
    if (useMySQL) {
      const [exist] = await dbPool.query("SELECT id FROM pages WHERE slug = ? AND id != ?", [pageSlug, pageId]);
      if (exist.length > 0) return res.status(400).json({ error: "A page with this URL path slug already exists." });
      
      await dbPool.query(
        `INSERT INTO pages (id, slug, title, content_html, created_at)
         VALUES (?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE title = ?, content_html = ?`,
        [pageId, pageSlug, title, content_html, title, content_html]
      );
      
      // Update or add navigation link if dynamic page creation asks
      const [menuExist] = await dbPool.query("SELECT id FROM menus WHERE page_id = ?", [pageId]);
      if (menuExist.length === 0) {
        const [maxOrd] = await dbPool.query("SELECT MAX(menu_order) as maxOrder FROM menus");
        const nextOrder = (maxOrd[0].maxOrder || 0) + 1;
        await dbPool.query(
          "INSERT INTO menus (id, label, url, menu_order, page_id) VALUES (?, ?, ?, ?, ?)",
          [Date.now().toString(), title, pageSlug, nextOrder, pageId]
        );
      } else {
        await dbPool.query("UPDATE menus SET label = ?, url = ? WHERE page_id = ?", [title, pageSlug, pageId]);
      }
    } else {
      const db = readDb();
      if (!db.pages) db.pages = [];
      const exist = db.pages.find((p) => p.slug === pageSlug && p.id !== pageId);
      if (exist) return res.status(400).json({ error: "A page with this URL path slug already exists." });

      const pageIdx = db.pages.findIndex((p) => p.id === pageId);
      const newPage = { id: pageId, slug: pageSlug, title, content_html, created_at: now };
      if (pageIdx > -1) {
        db.pages[pageIdx] = newPage;
      } else {
        db.pages.push(newPage);
      }

      // Add to menu if new
      if (!db.menus) db.menus = [];
      const menuIdx = db.menus.findIndex((m) => m.page_id === pageId);
      if (menuIdx === -1) {
        const nextOrder = db.menus.length + 1;
        db.menus.push({ id: Date.now().toString(), label: title, url: pageSlug, menu_order: nextOrder, page_id: pageId });
      } else {
        db.menus[menuIdx].label = title;
        db.menus[menuIdx].url = pageSlug;
      }
      writeDb(db);
    }

    await logActivity(req.adminEmail, `Created/Updated custom page: ${pageSlug} (${title})`, req);
    res.json({ success: true });
  } catch (err) {
    console.error("Save Page Error:", err);
    res.status(500).json({ error: "Failed to save page" });
  }
});

app.delete("/api/pages/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    let pageSlug = "";
    if (useMySQL) {
      const [rows] = await dbPool.query("SELECT slug FROM pages WHERE id = ?", [id]);
      if (rows.length === 0) return res.status(404).json({ error: "Page not found" });
      pageSlug = rows[0].slug;

      await dbPool.query("DELETE FROM pages WHERE id = ?", [id]);
      await dbPool.query("DELETE FROM menus WHERE page_id = ?", [id]);
    } else {
      const db = readDb();
      const idx = db.pages.findIndex((p) => p.id === id);
      if (idx === -1) return res.status(404).json({ error: "Page not found" });
      pageSlug = db.pages[idx].slug;

      db.pages.splice(idx, 1);
      db.menus = db.menus.filter((m) => m.page_id !== id);
      writeDb(db);
    }

    await logActivity(req.adminEmail, `Deleted custom page: ${pageSlug}`, req);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete page" });
  }
});

// Bookings API
app.get("/api/bookings", authenticateToken, async (req, res) => {
  try {
    const list = await getBookings();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

app.post("/api/bookings", async (req, res) => {
  const { name, email, phone, date, service, message } = req.body;

  if (!name || !date || !service) {
    return res.status(400).json({ error: "Name, date, and service are required fields." });
  }

  const newBooking = {
    id: Date.now().toString(),
    name,
    email,
    phone,
    date,
    service,
    message,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  try {
    await addBooking(newBooking);

    getSmtp()
      .then((smtpConfig) => sendBookingEmail(newBooking, smtpConfig))
      .catch((err) => console.error("SMTP async error:", err));

    res.status(201).json({ success: true, booking: newBooking });
  } catch (err) {
    res.status(500).json({ error: "Failed to create booking" });
  }
});

app.put("/api/bookings/:id/status", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "confirmed", "cancelled"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value." });
  }

  try {
    const success = await updateBookingStatus(id, status);
    if (!success) {
      return res.status(404).json({ error: "Booking not found." });
    }
    await logActivity(req.adminEmail, `Updated booking ID ${id} status to ${status}`, req);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update booking status" });
  }
});

app.delete("/api/bookings/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const success = await deleteBooking(id);
    if (!success) return res.status(404).json({ error: "Booking not found." });
    await logActivity(req.adminEmail, `Deleted booking ID ${id}`, req);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

// Dynamic Content CMS APIs
app.get("/api/content", async (req, res) => {
  try {
    const data = await getPageContent();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch page content" });
  }
});

app.post("/api/content/settings", authenticateToken, async (req, res) => {
  try {
    await savePageSettings(req.body);
    await logActivity(req.adminEmail, "Modified homepage general settings", req);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save page settings" });
  }
});

app.post("/api/content/services", authenticateToken, async (req, res) => {
  const { id, title, desc, price } = req.body;
  if (!title || !desc || !price) return res.status(400).json({ error: "Title, desc, and price are required." });

  const service = { id: id || Date.now().toString(), title, desc, price };
  try {
    await saveService(service);
    await logActivity(req.adminEmail, `${id ? "Updated" : "Created"} service: ${title}`, req);
    res.json({ success: true, service });
  } catch (err) {
    res.status(500).json({ error: "Failed to save service" });
  }
});

app.delete("/api/content/services/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await deleteService(id);
    await logActivity(req.adminEmail, `Deleted service ID: ${id}`, req);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete service" });
  }
});

app.post("/api/content/faqs", authenticateToken, async (req, res) => {
  const { id, q, a } = req.body;
  if (!q || !a) return res.status(400).json({ error: "Question and Answer are required." });

  const faq = { id: id || Date.now().toString(), q, a };
  try {
    await saveFaq(faq);
    await logActivity(req.adminEmail, `${id ? "Updated" : "Created"} FAQ entry`, req);
    res.json({ success: true, faq });
  } catch (err) {
    res.status(500).json({ error: "Failed to save FAQ" });
  }
});

app.delete("/api/content/faqs/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await deleteFaq(id);
    await logActivity(req.adminEmail, `Deleted FAQ ID: ${id}`, req);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete FAQ" });
  }
});

// SEO Configurations API
app.get("/api/seo", async (req, res) => {
  try {
    const seoData = await getSeo();
    res.json(seoData);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch SEO configs" });
  }
});

app.post("/api/seo", authenticateToken, async (req, res) => {
  const { seo } = req.body;
  if (!seo) return res.status(400).json({ error: "SEO metadata is required." });
  try {
    await saveSeo(seo);
    await logActivity(req.adminEmail, "Modified SEO page configuration tags", req);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save SEO config" });
  }
});

// SMTP Configurations API
app.get("/api/smtp", authenticateToken, async (req, res) => {
  try {
    const config = await getSmtp();
    delete config.pass;
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch SMTP settings" });
  }
});

app.post("/api/smtp", authenticateToken, async (req, res) => {
  try {
    await saveSmtp(req.body);
    await logActivity(req.adminEmail, "Updated SMTP server configuration parameters", req);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save SMTP settings" });
  }
});

// SMTP Connection Test
app.post("/api/smtp/test", authenticateToken, async (req, res) => {
  const { host, port, secure, user, pass, fromEmail, toEmail } = req.body;

  try {
    const currentSmtp = await getSmtp();
    const testConfig = {
      host: host || currentSmtp.host,
      port: port || currentSmtp.port,
      secure: secure !== undefined ? secure : currentSmtp.secure,
      user: user || currentSmtp.user,
      pass: pass || currentSmtp.pass,
      fromEmail: fromEmail || currentSmtp.fromEmail,
      toEmail: toEmail || currentSmtp.toEmail
    };

    if (!testConfig.host || !testConfig.user || !testConfig.pass) {
      return res.status(400).json({ error: "Host, User, and Password are required to test connection." });
    }

    const transporter = nodemailer.createTransport({
      host: testConfig.host,
      port: parseInt(testConfig.port) || 587,
      secure: testConfig.secure === true || testConfig.secure === "true",
      auth: { user: testConfig.user, pass: testConfig.pass }
    });

    await transporter.verify();
    await transporter.sendMail({
      from: `"SMTP Test" <${testConfig.fromEmail}>`,
      to: testConfig.toEmail,
      subject: "SMTP Connection Test Success",
      text: "If you received this email, the SMTP configuration on your website was successful!",
      html: "<h3>SMTP Connection Test Success</h3><p>If you received this email, the SMTP configuration on your website was successful!</p>"
    });

    res.json({ success: true, message: "SMTP configuration verified & test email sent successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dynamic Sitemap Generator
app.get("/sitemap.xml", async (req, res) => {
  const host = req.get("host");
  const protocol = req.protocol;
  const baseUrl = `${protocol}://${host}`;

  // Fetch all custom sub-pages from database to build into sitemap
  let customPages = [];
  try {
    if (useMySQL) {
      const [rows] = await dbPool.query("SELECT slug, created_at FROM pages");
      customPages = rows.map((r) => ({ slug: r.slug, date: r.created_at.toISOString().split("T")[0] }));
    } else {
      const db = readDb();
      customPages = (db.pages || []).map((p) => ({ slug: p.slug, date: new Date(p.created_at).toISOString().split("T")[0] }));
    }
  } catch (e) {
    console.error("Sitemap pages query error:", e);
  }

  const todayStr = new Date().toISOString().split("T")[0];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/#home</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#about</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#services</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#pricing</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#gallery</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#contact</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;

  // Append custom pages to sitemap
  customPages.forEach((p) => {
    sitemap += `
  <url>
    <loc>${baseUrl}${p.slug}</loc>
    <lastmod>${p.date || todayStr}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
  });

  sitemap += `\n</urlset>`;

  res.header("Content-Type", "application/xml");
  res.send(sitemap);
});

// Production serving fallback
const distPath = path.join(__dirname, "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.url.startsWith("/api") && req.url !== "/sitemap.xml") {
      return res.sendFile(path.join(distPath, "index.html"));
    }
    next();
  });
}

// Initialize Database & Start Server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
