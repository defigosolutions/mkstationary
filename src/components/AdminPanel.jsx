import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  Search,
  Mail,
  Lock,
  LogOut,
  Settings,
  Check,
  X,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Send,
  Sparkles,
  ChevronRight,
  FileText,
  Plus,
  Pencil,
  RefreshCw,
  Users,
  Menu
} from "lucide-react";
import "./AdminPanel.css";

function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [toast, setToast] = useState(null);

  // Captcha login states
  const [captcha, setCaptcha] = useState({ question: "", token: "" });
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  // Data States
  const [bookings, setBookings] = useState([]);
  const [seoConfig, setSeoConfig] = useState({});
  const [activeSeoTab, setActiveSeoTab] = useState("home");
  const [smtpConfig, setSmtpConfig] = useState({
    host: "",
    port: 587,
    secure: false,
    user: "",
    pass: "",
    fromEmail: "",
    toEmail: "",
    enabled: false
  });

  // Dynamic Content CMS States
  const [pageSettings, setPageSettings] = useState({
    heroTitle: "",
    heroDesc: "",
    phone: "",
    email: "",
    address: "",
    hours: ""
  });
  const [servicesList, setServicesList] = useState([]);
  const [faqsList, setFaqsList] = useState([]);
  const [activeContentSubTab, setActiveContentSubTab] = useState("settings");
  
  // Custom Pages, Drag Menu, Admins, Logs CMS States
  const [menusList, setMenusList] = useState([]);
  const [pagesList, setPagesList] = useState([]);
  const [adminsList, setAdminsList] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [retentionDays, setRetentionDays] = useState(60);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  // In-Progress Edit States / Modals
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  
  // New Admin creation modal
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: "", password: "" });

  // Testing & Filters States
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("mks_admin_token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      fetchCaptcha();
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchBookings();
      fetchSeo();
      fetchSmtp();
      fetchContent();
      fetchMenus();
      fetchPages();
      fetchAdmins();
      fetchLogs();
    }
  }, [isLoggedIn]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getHeaders = () => {
    const token = localStorage.getItem("mks_admin_token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  // API Requests
  const fetchCaptcha = async () => {
    try {
      const res = await fetch("/api/auth/captcha");
      if (res.ok) {
        const data = await res.json();
        setCaptcha(data);
        setCaptchaAnswer("");
      }
    } catch (e) {
      console.error("Captcha fetch error:", e);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings", { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const fetchSeo = async () => {
    try {
      const res = await fetch("/api/seo");
      if (res.ok) {
        const data = await res.json();
        setSeoConfig(data);
      }
    } catch (err) {
      console.error("Error fetching SEO:", err);
    }
  };

  const fetchSmtp = async () => {
    try {
      const res = await fetch("/api/smtp", { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSmtpConfig((prev) => ({ ...prev, ...data, pass: "" }));
      }
    } catch (err) {
      console.error("Error fetching SMTP:", err);
    }
  };

  const fetchContent = async () => {
    try {
      const res = await fetch("/api/content");
      if (res.ok) {
        const data = await res.json();
        setPageSettings(data.settings);
        setServicesList(data.services);
        setFaqsList(data.faqs);
      }
    } catch (err) {
      console.error("Error fetching page content:", err);
    }
  };

  const fetchMenus = async () => {
    try {
      const res = await fetch("/api/menus");
      if (res.ok) {
        const data = await res.json();
        setMenusList(data);
      }
    } catch (err) {
      console.error("Error fetching navigation menus:", err);
    }
  };

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/pages");
      if (res.ok) {
        const data = await res.json();
        setPagesList(data);
      }
    } catch (err) {
      console.error("Error fetching dynamic pages:", err);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admins", { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setAdminsList(data);
      }
    } catch (err) {
      console.error("Error fetching admin users:", err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs", { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setActivityLogs(data.logs);
        setRetentionDays(data.retention);
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          captchaAnswer,
          captchaToken: captcha.token
        })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("mks_admin_token", data.token);
        setIsLoggedIn(true);
        showToast("Authentication Successful");
      } else {
        showToast(data.error || "Login Failed", "error");
        fetchCaptcha(); // Refresh captcha on failure
      }
    } catch (err) {
      showToast("Server connection error", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("mks_admin_token");
    setIsLoggedIn(false);
    showToast("Logged Out Successfully");
    fetchCaptcha(); // Prime captcha for next login
  };

  // Actions
  const handleUpdateBookingStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setBookings(bookings.map((b) => (b.id === id ? { ...b, status } : b)));
        showToast(`Booking marked as ${status}`);
        fetchLogs();
      } else {
        const data = await res.json();
        showToast(data.error || "Update failed", "error");
      }
    } catch (err) {
      showToast("Server communication error", "error");
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking permanently?")) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (res.ok) {
        setBookings(bookings.filter((b) => b.id !== id));
        showToast("Booking deleted successfully");
        fetchLogs();
      } else {
        const data = await res.json();
        showToast(data.error || "Deletion failed", "error");
      }
    } catch (err) {
      showToast("Server communication error", "error");
    }
  };

  const handleSaveSeo = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/seo", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ seo: seoConfig })
      });
      if (res.ok) {
        showToast("SEO settings updated successfully!");
        fetchLogs();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to save SEO settings", "error");
      }
    } catch (err) {
      showToast("Server error during save", "error");
    }
  };

  const handleSaveSmtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/smtp", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(smtpConfig)
      });
      if (res.ok) {
        showToast("SMTP configuration saved!");
        fetchLogs();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to save SMTP settings", "error");
      }
    } catch (err) {
      showToast("Server error during save", "error");
    }
  };

  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    try {
      const res = await fetch("/api/smtp/test", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(smtpConfig)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Test email sent successfully!");
        fetchLogs();
      } else {
        showToast(data.error || "SMTP verification failed", "error");
      }
    } catch (err) {
      showToast("Server communication error", "error");
    } finally {
      setTestingSmtp(false);
    }
  };

  // Content settings updates
  const handleSavePageSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/content/settings", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(pageSettings)
      });
      if (res.ok) {
        showToast("Landing page configs saved successfully!");
        fetchLogs();
      } else {
        showToast("Failed to save content configurations", "error");
      }
    } catch (err) {
      showToast("Server communication error", "error");
    }
  };

  const handleOpenAddService = () => {
    setEditingService({ id: "", title: "", desc: "", price: "" });
    setServiceModalOpen(true);
  };

  const handleOpenEditService = (service) => {
    setEditingService({ ...service });
    setServiceModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/content/services", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(editingService)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (editingService.id) {
          setServicesList(servicesList.map((s) => (s.id === editingService.id ? data.service : s)));
          showToast("Service updated successfully");
        } else {
          setServicesList([...servicesList, data.service]);
          showToast("New service added successfully");
        }
        setServiceModalOpen(false);
        setEditingService(null);
        fetchLogs();
      } else {
        showToast(data.error || "Failed to save service", "error");
      }
    } catch (err) {
      showToast("Server connection error", "error");
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service permanently?")) return;
    try {
      const res = await fetch(`/api/content/services/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (res.ok) {
        setServicesList(servicesList.filter((s) => s.id !== id));
        showToast("Service deleted successfully");
        fetchLogs();
      } else {
        showToast("Failed to delete service", "error");
      }
    } catch (err) {
      showToast("Server error", "error");
    }
  };

  const handleOpenAddFaq = () => {
    setEditingFaq({ id: "", q: "", a: "" });
    setFaqModalOpen(true);
  };

  const handleOpenEditFaq = (faq) => {
    setEditingFaq({ ...faq });
    setFaqModalOpen(true);
  };

  const handleSaveFaq = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/content/faqs", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(editingFaq)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (editingFaq.id) {
          setFaqsList(faqsList.map((f) => (f.id === editingFaq.id ? data.faq : f)));
          showToast("FAQ updated successfully");
        } else {
          setFaqsList([...faqsList, data.faq]);
          showToast("New FAQ added successfully");
        }
        setFaqModalOpen(false);
        setEditingFaq(null);
        fetchLogs();
      } else {
        showToast(data.error || "Failed to save FAQ", "error");
      }
    } catch (err) {
      showToast("Server connection error", "error");
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm("Are you sure you want to delete this FAQ permanently?")) return;
    try {
      const res = await fetch(`/api/content/faqs/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (res.ok) {
        setFaqsList(faqsList.filter((f) => f.id !== id));
        showToast("FAQ deleted successfully");
        fetchLogs();
      } else {
        showToast("Failed to delete FAQ", "error");
      }
    } catch (err) {
      showToast("Server error", "error");
    }
  };

  // Drag-and-Drop ordering
  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    
    const newItems = [...menusList];
    const draggedItem = newItems[draggedItemIndex];
    newItems.splice(draggedItemIndex, 1);
    newItems.splice(index, 0, draggedItem);
    
    const updatedItems = newItems.map((item, idx) => ({
      ...item,
      menu_order: idx + 1
    }));
    
    setDraggedItemIndex(index);
    setMenusList(updatedItems);
  };

  const handleDragEnd = async () => {
    setDraggedItemIndex(null);
    try {
      const res = await fetch("/api/menus/reorder", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ reorderedMenus: menusList })
      });
      if (res.ok) {
        showToast("Navigation hierarchy saved successfully!");
        fetchLogs();
      } else {
        showToast("Failed to save menu ordering", "error");
      }
    } catch (err) {
      showToast("Server connection error during drag order", "error");
    }
  };

  // Dynamic custom pages CRUD
  const handleOpenAddPage = () => {
    setEditingPage({ id: "", title: "", slug: "", content_html: "" });
    setPageModalOpen(true);
  };

  const handleOpenEditPage = (page) => {
    setEditingPage({ ...page });
    setPageModalOpen(true);
  };

  const handleSavePage = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(editingPage)
      });
      if (res.ok) {
        showToast("Custom Page configuration saved!");
        setPageModalOpen(false);
        setEditingPage(null);
        fetchPages();
        fetchMenus();
        fetchLogs();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to save page settings", "error");
      }
    } catch (err) {
      showToast("Server connection error", "error");
    }
  };

  const handleDeletePage = async (id) => {
    if (!window.confirm("Deleting this page will also remove its dynamic navigation link. Proceed?")) return;
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (res.ok) {
        showToast("Page deleted successfully");
        fetchPages();
        fetchMenus();
        fetchLogs();
      } else {
        showToast("Failed to delete page", "error");
      }
    } catch (err) {
      showToast("Server error", "error");
    }
  };

  // Dynamic navigation menus CRUD
  const handleOpenAddMenu = () => {
    setEditingMenu({ id: "", label: "", url: "", parent_id: "", menu_order: menusList.length + 1 });
    setMenuModalOpen(true);
  };

  const handleOpenEditMenu = (menu) => {
    setEditingMenu({ ...menu, parent_id: menu.parent_id || "" });
    setMenuModalOpen(true);
  };

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/menus", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          ...editingMenu,
          parent_id: editingMenu.parent_id || null
        })
      });
      if (res.ok) {
        showToast("Navigation menu item saved!");
        setMenuModalOpen(false);
        setEditingMenu(null);
        fetchMenus();
        fetchLogs();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to save menu option", "error");
      }
    } catch (err) {
      showToast("Server connection error", "error");
    }
  };

  const handleDeleteMenu = async (id) => {
    if (!window.confirm("Are you sure you want to delete this menu item permanently? Any child dropdown items will be moved to the top level.")) return;
    try {
      const res = await fetch(`/api/menus/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (res.ok) {
        showToast("Menu option deleted successfully");
        fetchMenus();
        fetchLogs();
      } else {
        showToast("Failed to delete menu option", "error");
      }
    } catch (err) {
      showToast("Server error", "error");
    }
  };

  // Multi-Admin CRUD
  const handleOpenAddAdmin = () => {
    setNewAdmin({ email: "", password: "" });
    setAdminModalOpen(true);
  };

  const handleSaveAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(newAdmin)
      });
      if (res.ok) {
        showToast("Administrator registered successfully!");
        setAdminModalOpen(false);
        setNewAdmin({ email: "", password: "" });
        fetchAdmins();
        fetchLogs();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to create administrator", "error");
      }
    } catch (err) {
      showToast("Server connection error", "error");
    }
  };

  const handleDeleteAdmin = async (emailToDelete) => {
    if (!window.confirm(`Are you sure you want to delete administrator: ${emailToDelete}?`)) return;
    try {
      const res = await fetch(`/api/admins/${emailToDelete}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (res.ok) {
        showToast("Admin account deleted");
        fetchAdmins();
        fetchLogs();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to delete admin account", "error");
      }
    } catch (err) {
      showToast("Server error", "error");
    }
  };

  // Config retention
  const handleSaveRetention = async (days) => {
    try {
      const res = await fetch("/api/logs/retention", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ days })
      });
      if (res.ok) {
        setRetentionDays(days);
        showToast(`Log retention configured to ${days} days`);
        fetchLogs();
      } else {
        showToast("Failed to save configuration", "error");
      }
    } catch (err) {
      showToast("Server error", "error");
    }
  };

  // Stats Logic
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === "all") return true;
    return b.status === filterStatus;
  });

  const getRecentBookings = () => {
    return [...bookings]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login-overlay">
        <div className="admin-login-card">
          <div className="admin-login-logo">MK</div>
          <h2>Access Portal</h2>
          <p>Login to manage bookings, page layouts, and menu listings.</p>

          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="password-input-wrapper">
              <input
                type="email"
                placeholder="Enter Admin Username (Email)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: "16px", paddingRight: "16px" }}
              />
            </div>
            
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Captcha row */}
            <div className="captcha-row">
              <div className="captcha-question">{captcha.question || "Loading Captcha..."}</div>
              <button type="button" className="captcha-refresh" onClick={fetchCaptcha}>
                <RefreshCw size={18} />
              </button>
            </div>

            <div className="password-input-wrapper">
              <input
                type="text"
                placeholder="Enter Captcha Answer"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                required
                style={{ paddingLeft: "16px", paddingRight: "16px" }}
              />
            </div>

            <button type="submit" className="admin-login-btn">
              Authenticate Account
            </button>
          </form>
        </div>

        {toast && (
          <div className={`admin-toast ${toast.type}`}>
            {toast.type === "error" ? <X size={16} /> : <Check size={16} />}
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-brand">
            <div className="admin-brand-logo">MK</div>
            <div className="admin-brand-info">
              <h3>MK STATIONARY</h3>
              <p>ADMIN CONTROL</p>
            </div>
          </div>
        </div>

        <nav className="admin-nav-links">
          <button
            className={`admin-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button
            className={`admin-nav-item ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            <CalendarCheck size={18} />
            Bookings ({stats.pending} new)
          </button>

          <button
            className={`admin-nav-item ${activeTab === "content" ? "active" : ""}`}
            onClick={() => setActiveTab("content")}
          >
            <FileText size={18} />
            Page Content
          </button>

          <button
            className={`admin-nav-item ${activeTab === "navigation" ? "active" : ""}`}
            onClick={() => setActiveTab("navigation")}
          >
            <Menu size={18} />
            Menus & Pages
          </button>

          <button
            className={`admin-nav-item ${activeTab === "seo" ? "active" : ""}`}
            onClick={() => setActiveTab("seo")}
          >
            <Search size={18} />
            SEO Settings
          </button>

          <button
            className={`admin-nav-item ${activeTab === "admins" ? "active" : ""}`}
            onClick={() => setActiveTab("admins")}
          >
            <Users size={18} />
            Administrators
          </button>

          <button
            className={`admin-nav-item ${activeTab === "smtp" ? "active" : ""}`}
            onClick={() => setActiveTab("smtp")}
          >
            <Settings size={18} />
            SMTP configurations
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="admin-main-panel">
        <header className="admin-top-bar">
          <h2>
            {activeTab === "dashboard" && "Dashboard Overview"}
            {activeTab === "bookings" && "Bookings Management"}
            {activeTab === "content" && "Landing Page Content CMS"}
            {activeTab === "navigation" && "Menu Hierarchy & Custom Pages"}
            {activeTab === "seo" && "SEO Metadata Manager"}
            {activeTab === "admins" && "Administrator Registry"}
            {activeTab === "smtp" && "Mail Server Settings"}
          </h2>
          <div className="admin-top-bar-date">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </div>
        </header>

        <div className="admin-content-view">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div>
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-info">
                    <h4>Total Bookings</h4>
                    <p>{stats.total}</p>
                  </div>
                  <div className="admin-stat-icon">
                    <CalendarCheck size={24} />
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-info">
                    <h4>Pending Review</h4>
                    <p style={{ color: "var(--color-pending)" }}>{stats.pending}</p>
                  </div>
                  <div className="admin-stat-icon">
                    <Sparkles size={24} />
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-info">
                    <h4>Confirmed Seats</h4>
                    <p style={{ color: "var(--color-confirmed)" }}>{stats.confirmed}</p>
                  </div>
                  <div className="admin-stat-icon">
                    <Check size={24} />
                  </div>
                </div>
              </div>

              <div className="admin-panel-card">
                <div className="admin-panel-card-header">
                  <h3>Recent Booking Requests</h3>
                  <button className="admin-nav-item" onClick={() => setActiveTab("bookings")} style={{ padding: "6px 12px", background: "rgba(255,255,255,0.02)" }}>
                    View All <ChevronRight size={14} />
                  </button>
                </div>

                <div className="bookings-table-wrapper">
                  <table className="bookings-table">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Service</th>
                        <th>Preferred Date</th>
                        <th>Status</th>
                        <th>Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getRecentBookings().length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center", color: "var(--admin-text-secondary)" }}>
                            No bookings found.
                          </td>
                        </tr>
                      ) : (
                        getRecentBookings().map((booking) => (
                          <tr key={booking.id}>
                            <td>
                              <strong>{booking.name}</strong>
                              <br />
                              <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                                {booking.email || booking.phone}
                              </span>
                            </td>
                            <td>{booking.service}</td>
                            <td>{booking.date}</td>
                            <td>
                              <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                            </td>
                            <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="admin-panel-card">
              <div className="admin-panel-card-header">
                <h3>Appointments Registry</h3>
                <div style={{ display: "flex", gap: "10px" }}>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                      background: "var(--admin-bg)",
                      color: "var(--admin-text-primary)",
                      border: "1px solid var(--admin-border)",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      outline: "none"
                    }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="bookings-table-wrapper">
                <table className="bookings-table">
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Contact Info</th>
                      <th>Service Details</th>
                      <th>Preferred Date</th>
                      <th>Status</th>
                      <th>Message</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", color: "var(--admin-text-secondary)" }}>
                          No appointments found matching filters.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .map((booking) => (
                          <tr key={booking.id}>
                            <td>
                              <strong>{booking.name}</strong>
                            </td>
                            <td>
                              {booking.phone && <div>📞 {booking.phone}</div>}
                              {booking.email && <div>✉️ {booking.email}</div>}
                            </td>
                            <td>{booking.service}</td>
                            <td>{booking.date}</td>
                            <td>
                              <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                            </td>
                            <td style={{ maxWidth: "220px", whiteSpace: "normal", fontSize: "13px", color: "var(--admin-text-secondary)" }}>
                              {booking.message || "-"}
                            </td>
                            <td>
                              <div className="actions-cell">
                                {booking.status !== "confirmed" && (
                                  <button
                                    title="Confirm Booking"
                                    className="action-btn confirm"
                                    onClick={() => handleUpdateBookingStatus(booking.id, "confirmed")}
                                  >
                                    <Check size={16} />
                                  </button>
                                )}
                                {booking.status !== "cancelled" && (
                                  <button
                                    title="Cancel Booking"
                                    className="action-btn cancel"
                                    onClick={() => handleUpdateBookingStatus(booking.id, "cancelled")}
                                  >
                                    <X size={16} />
                                  </button>
                                )}
                                <button
                                  title="Delete Permanent"
                                  className="action-btn delete"
                                  onClick={() => handleDeleteBooking(booking.id)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Dynamic Content Tab */}
          {activeTab === "content" && (
            <div className="admin-panel-card">
              <div className="content-subtabs">
                <button
                  className={`content-subtab-btn ${activeContentSubTab === "settings" ? "active" : ""}`}
                  onClick={() => setActiveContentSubTab("settings")}
                >
                  General Settings
                </button>
                <button
                  className={`content-subtab-btn ${activeContentSubTab === "services" ? "active" : ""}`}
                  onClick={() => setActiveContentSubTab("services")}
                >
                  Services List
                </button>
                <button
                  className={`content-subtab-btn ${activeContentSubTab === "faqs" ? "active" : ""}`}
                  onClick={() => setActiveContentSubTab("faqs")}
                >
                  FAQs
                </button>
              </div>

              {/* General Settings */}
              {activeContentSubTab === "settings" && (
                <form onSubmit={handleSavePageSettings}>
                  <div className="admin-form-group">
                    <label>Hero Title (landing page)</label>
                    <textarea
                      rows="2"
                      value={pageSettings.heroTitle || ""}
                      onChange={(e) => setPageSettings({ ...pageSettings, heroTitle: e.target.value })}
                      placeholder="e.g. Sharp Cuts, \nFresh Style"
                      required
                    ></textarea>
                  </div>

                  <div className="admin-form-group">
                    <label>Hero Description</label>
                    <textarea
                      rows="3"
                      value={pageSettings.heroDesc || ""}
                      onChange={(e) => setPageSettings({ ...pageSettings, heroDesc: e.target.value })}
                      placeholder="Welcome statement on landing page..."
                      required
                    ></textarea>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Salon Contact Phone</label>
                      <input
                        type="text"
                        value={pageSettings.phone || ""}
                        onChange={(e) => setPageSettings({ ...pageSettings, phone: e.target.value })}
                        placeholder="203-430-0975"
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Salon Contact Email</label>
                      <input
                        type="email"
                        value={pageSettings.email || ""}
                        onChange={(e) => setPageSettings({ ...pageSettings, email: e.target.value })}
                        placeholder="owner@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Salon Location Address</label>
                      <input
                        type="text"
                        value={pageSettings.address || ""}
                        onChange={(e) => setPageSettings({ ...pageSettings, address: e.target.value })}
                        placeholder="57 Ellsworth Ave, New Haven, CT 06511"
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Business Operating Hours</label>
                      <input
                        type="text"
                        value={pageSettings.hours || ""}
                        onChange={(e) => setPageSettings({ ...pageSettings, hours: e.target.value })}
                        placeholder="Open 6 days a week"
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="admin-submit-btn">
                    <Save size={16} /> Save Settings
                  </button>
                </form>
              )}

              {/* Services List */}
              {activeContentSubTab === "services" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
                    <button className="admin-submit-btn" onClick={handleOpenAddService}>
                      <Plus size={16} /> Add New Service
                    </button>
                  </div>

                  <div className="cms-items-list">
                    {servicesList.length === 0 ? (
                      <p style={{ textAlign: "center", color: "var(--admin-text-secondary)" }}>No services registered.</p>
                    ) : (
                      servicesList.map((service) => (
                        <div className="cms-item-row" key={service.id}>
                          <div className="cms-item-details">
                            <h4>{service.title}</h4>
                            <p>{service.desc}</p>
                          </div>
                          <div className="cms-item-right-side">
                            <span className="cms-item-price">{service.price}</span>
                            <div className="cms-item-actions">
                              <button
                                title="Edit Service"
                                className="action-btn"
                                onClick={() => handleOpenEditService(service)}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                title="Delete Service"
                                className="action-btn delete"
                                onClick={() => handleDeleteService(service.id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* FAQs */}
              {activeContentSubTab === "faqs" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
                    <button className="admin-submit-btn" onClick={handleOpenAddFaq}>
                      <Plus size={16} /> Add New FAQ
                    </button>
                  </div>

                  <div className="cms-items-list">
                    {faqsList.length === 0 ? (
                      <p style={{ textAlign: "center", color: "var(--admin-text-secondary)" }}>No FAQs registered.</p>
                    ) : (
                      faqsList.map((faq) => (
                        <div className="cms-item-row" key={faq.id}>
                          <div className="cms-item-details">
                            <h4>Q: {faq.q}</h4>
                            <p>A: {faq.a}</p>
                          </div>
                          <div className="cms-item-right-side">
                            <div className="cms-item-actions">
                              <button
                                title="Edit FAQ"
                                className="action-btn"
                                onClick={() => handleOpenEditFaq(faq)}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                title="Delete FAQ"
                                className="action-btn delete"
                                onClick={() => handleDeleteFaq(faq.id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Menus & Pages Tab */}
          {activeTab === "navigation" && (
            <div>
              {/* Custom sub-pages table */}
              <div className="admin-panel-card" style={{ marginBottom: "32px" }}>
                <div className="admin-panel-card-header">
                  <h3>Custom Sub-Pages</h3>
                  <button className="admin-submit-btn" onClick={handleOpenAddPage}>
                    <Plus size={16} /> Create Custom Page
                  </button>
                </div>

                <div className="bookings-table-wrapper">
                  <table className="bookings-table">
                    <thead>
                      <tr>
                        <th>Page Title</th>
                        <th>Browser URL Slug</th>
                        <th>Created Timestamp</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagesList.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: "center", color: "var(--admin-text-secondary)" }}>
                            No custom sub-pages configured.
                          </td>
                        </tr>
                      ) : (
                        pagesList.map((page) => (
                          <tr key={page.id}>
                            <td><strong>{page.title}</strong></td>
                            <td><code style={{ color: "var(--admin-accent)" }}>{page.slug}</code></td>
                            <td>{new Date(page.created_at).toLocaleDateString()}</td>
                            <td>
                              <div className="actions-cell">
                                <button
                                  title="Edit Page Content"
                                  className="action-btn"
                                  onClick={() => handleOpenEditPage(page)}
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  title="Delete Page"
                                  className="action-btn delete"
                                  onClick={() => handleDeletePage(page.id)}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Drag & Drop Reordering navigation lists */}
              <div className="admin-panel-card">
                <div className="admin-panel-card-header">
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                    <div>
                      <h3>Header Navigation Hierarchy</h3>
                      <p style={{ fontSize: "13px", color: "var(--admin-text-secondary)", marginTop: "4px" }}>
                        Drag and drop rows to reorder. Sub-items are shown indented under their parents.
                      </p>
                    </div>
                    <button className="admin-submit-btn" onClick={handleOpenAddMenu}>
                      <Plus size={16} /> Add Menu Option
                    </button>
                  </div>
                </div>

                <div className="menu-drag-list">
                  {menusList.map((menu, index) => {
                    const isChild = !!menu.parent_id;
                    const parentItem = isChild ? menusList.find(p => p.id === menu.parent_id) : null;
                    
                    return (
                      <div
                        key={menu.id}
                        className={`menu-drag-item ${draggedItemIndex === index ? "dragging" : ""}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        style={{
                          marginLeft: isChild ? "30px" : "0px",
                          borderLeft: isChild ? "2px dashed var(--admin-accent)" : "none",
                          paddingLeft: isChild ? "15px" : "10px"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <span className="menu-drag-handle" style={{ marginRight: "10px", cursor: "grab" }}>☰</span>
                            <strong>
                              {isChild ? `└── ${menu.label}` : menu.label}
                            </strong>
                            {isChild && parentItem && (
                              <span style={{ fontSize: "11px", color: "var(--admin-text-secondary)", marginLeft: "8px" }}>
                                (Child of {parentItem.label})
                              </span>
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                            <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                              Target: <code style={{ color: "var(--admin-accent)" }}>{menu.url}</code>
                            </span>
                            <div className="actions-cell" style={{ display: "flex", gap: "5px" }}>
                              <button
                                title="Edit Menu"
                                className="action-btn"
                                onClick={() => handleOpenEditMenu(menu)}
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                title="Delete Menu"
                                className="action-btn delete"
                                onClick={() => handleDeleteMenu(menu.id)}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SEO Settings Tab */}
          {activeTab === "seo" && (
            <div className="admin-panel-card">
              <div className="seo-tabs-navigation">
                {Object.keys(seoConfig).map((sectionKey) => (
                  <button
                    key={sectionKey}
                    className={`seo-tab-btn ${activeSeoTab === sectionKey ? "active" : ""}`}
                    onClick={() => setActiveSeoTab(sectionKey)}
                  >
                    {sectionKey}
                  </button>
                ))}
              </div>

              {seoConfig[activeSeoTab] && (
                <form onSubmit={handleSaveSeo}>
                  <div className="admin-form-group">
                    <label>Page / Section Header Title</label>
                    <input
                      type="text"
                      value={seoConfig[activeSeoTab].title || ""}
                      onChange={(e) =>
                        setSeoConfig({
                          ...seoConfig,
                          [activeSeoTab]: {
                            ...seoConfig[activeSeoTab],
                            title: e.target.value
                          }
                        })
                      }
                      placeholder="e.g. Home Page SEO Title"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Meta Description</label>
                    <textarea
                      rows="4"
                      value={seoConfig[activeSeoTab].desc || ""}
                      onChange={(e) =>
                        setSeoConfig({
                          ...seoConfig,
                          [activeSeoTab]: {
                            ...seoConfig[activeSeoTab],
                            desc: e.target.value
                          }
                        })
                      }
                      placeholder="Enter search engine snippet description..."
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="admin-submit-btn">
                    <Save size={16} /> Save SEO configuration
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Administrators Management Tab */}
          {activeTab === "admins" && (
            <div className="admin-panel-card">
              <div className="admin-panel-card-header">
                <h3>Administrator Accounts</h3>
                <button className="admin-submit-btn" onClick={handleOpenAddAdmin}>
                  <Plus size={16} /> Add New Admin
                </button>
              </div>

              <div className="admin-users-list">
                {adminsList.map((a) => (
                  <div className="admin-user-row" key={a.email}>
                    <div>
                      <strong>{a.email}</strong>
                      <br />
                      <span style={{ fontSize: "11px", color: "var(--admin-text-secondary)" }}>
                        Created on: {new Date(a.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <button
                        title="Delete Admin"
                        className="action-btn delete"
                        onClick={() => handleDeleteAdmin(a.email)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SMTP Configurations Tab & Config Logs */}
          {activeTab === "smtp" && (
            <div>
              <div className="admin-panel-card" style={{ marginBottom: "32px" }}>
                <form onSubmit={handleSaveSmtp}>
                  <div className="smtp-status-box">
                    <div className="smtp-status-info">
                      <h4>Activate Email Notifications</h4>
                      <p>Trigger automated confirmation emails on new client booking submissions.</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={smtpConfig.enabled}
                        onChange={(e) => setSmtpConfig({ ...smtpConfig, enabled: e.target.checked })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>SMTP Relay Server Host</label>
                      <input
                        type="text"
                        value={smtpConfig.host}
                        onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                        placeholder="smtp.example.com"
                        required={smtpConfig.enabled}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>SMTP Port</label>
                      <input
                        type="number"
                        value={smtpConfig.port}
                        onChange={(e) => setSmtpConfig({ ...smtpConfig, port: parseInt(e.target.value) || 587 })}
                        placeholder="587"
                        required={smtpConfig.enabled}
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Authentication Username (Email)</label>
                      <input
                        type="text"
                        value={smtpConfig.user}
                        onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                        placeholder="user@example.com"
                        required={smtpConfig.enabled}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Authentication Password</label>
                      <input
                        type="password"
                        value={smtpConfig.pass}
                        onChange={(e) => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
                        placeholder="••••••••••••"
                        required={smtpConfig.enabled && !smtpConfig.host}
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Sender Address (From)</label>
                      <input
                        type="email"
                        value={smtpConfig.fromEmail}
                        onChange={(e) => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
                        placeholder="mkstationaryhair@gmail.com"
                        required={smtpConfig.enabled}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Notification Recipient Address (To)</label>
                      <input
                        type="email"
                        value={smtpConfig.toEmail}
                        onChange={(e) => setSmtpConfig({ ...smtpConfig, toEmail: e.target.value })}
                        placeholder="owner@example.com"
                        required={smtpConfig.enabled}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Security Encryption</label>
                    <select
                      value={smtpConfig.secure.toString()}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, secure: e.target.value === "true" })}
                      style={{ width: "100%" }}
                    >
                      <option value="false">STARTTLS (Port 587 or 25)</option>
                      <option value="true">SSL/TLS (Port 465)</option>
                    </select>
                  </div>

                  <div className="smtp-actions">
                    <button type="submit" className="admin-submit-btn">
                      <Save size={16} /> Save Mail Settings
                    </button>

                    <button
                      type="button"
                      className="admin-test-btn"
                      onClick={handleTestSmtp}
                      disabled={testingSmtp}
                    >
                      <Send size={16} />
                      {testingSmtp ? "Verifying Host..." : "Send Test Email"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Logs Viewer & Pruning settings */}
              <div className="admin-panel-card">
                <div className="logs-filter-row">
                  <div>
                    <h3>Security Logs & Audit Trails</h3>
                    <p style={{ fontSize: "13px", color: "var(--admin-text-secondary)", marginTop: "4px" }}>
                      Tracks system actions and failed authentication attempts.
                    </p>
                  </div>
                  <div className="logs-retention-box">
                    <label>Log Retention Window:</label>
                    <select
                      value={retentionDays}
                      onChange={(e) => handleSaveRetention(parseInt(e.target.value) || 60)}
                    >
                      <option value="30">30 Days</option>
                      <option value="45">45 Days</option>
                      <option value="60">60 Days</option>
                      <option value="90">90 Days</option>
                      <option value="120">120 Days</option>
                    </select>
                  </div>
                </div>

                <div className="bookings-table-wrapper" style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <table className="bookings-table log-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Administrator</th>
                        <th>Action Log</th>
                        <th>IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityLogs.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: "center", color: "var(--admin-text-secondary)" }}>
                            No log events recorded.
                          </td>
                        </tr>
                      ) : (
                        activityLogs.map((log) => (
                          <tr key={log.id}>
                            <td className="log-timestamp">{new Date(log.timestamp).toLocaleString()}</td>
                            <td><strong>{log.email}</strong></td>
                            <td>{log.action}</td>
                            <td className="log-ip">{log.ip_address}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Dynamic Page Create/Edit Modal */}
      {pageModalOpen && editingPage && (
        <div className="admin-dialog-overlay" onClick={() => setPageModalOpen(false)}>
          <div className="admin-dialog-box" style={{ maxWidth: "720px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-dialog-header">
              <h3>{editingPage.id ? "Edit Custom Page" : "Create Custom Page"}</h3>
              <button className="admin-dialog-close" onClick={() => setPageModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePage}>
              <div className="admin-form-group">
                <label>Page Title</label>
                <input
                  type="text"
                  value={editingPage.title}
                  onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                  placeholder="e.g. Terms and Conditions"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>URL Slug Path</label>
                <input
                  type="text"
                  value={editingPage.slug}
                  onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                  placeholder="e.g. /terms (must start with /)"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Rich Page Content (HTML allowed)</label>
                <textarea
                  rows="10"
                  value={editingPage.content_html}
                  onChange={(e) => setEditingPage({ ...editingPage, content_html: e.target.value })}
                  placeholder="<h2>Subheading</h2><p>Insert custom content paragraphs here...</p>"
                  required
                  style={{ fontFamily: "monospace", fontSize: "14px" }}
                ></textarea>
              </div>

              <div className="admin-dialog-actions">
                <button type="button" className="admin-btn-cancel" onClick={() => setPageModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-save">
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {serviceModalOpen && editingService && (
        <div className="admin-dialog-overlay" onClick={() => setServiceModalOpen(false)}>
          <div className="admin-dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-dialog-header">
              <h3>{editingService.id ? "Edit Service" : "Add Service"}</h3>
              <button className="admin-dialog-close" onClick={() => setServiceModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveService}>
              <div className="admin-form-group">
                <label>Service Title</label>
                <input
                  type="text"
                  value={editingService.title}
                  onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                  placeholder="e.g. Hair Wash & Blowout"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Price Rate</label>
                <input
                  type="text"
                  value={editingService.price}
                  onChange={(e) => setEditingService({ ...editingService, price: e.target.value })}
                  placeholder="e.g. $45"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Service Description</label>
                <textarea
                  rows="3"
                  value={editingService.desc}
                  onChange={(e) => setEditingService({ ...editingService, desc: e.target.value })}
                  placeholder="Provide details about session duration or finished look..."
                  required
                ></textarea>
              </div>

              <div className="admin-dialog-actions">
                <button type="button" className="admin-btn-cancel" onClick={() => setServiceModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-save">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {faqModalOpen && editingFaq && (
        <div className="admin-dialog-overlay" onClick={() => setFaqModalOpen(false)}>
          <div className="admin-dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-dialog-header">
              <h3>{editingFaq.id ? "Edit FAQ" : "Add FAQ"}</h3>
              <button className="admin-dialog-close" onClick={() => setFaqModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveFaq}>
              <div className="admin-form-group">
                <label>Question text</label>
                <input
                  type="text"
                  value={editingFaq.q}
                  onChange={(e) => setEditingFaq({ ...editingFaq, q: e.target.value })}
                  placeholder="e.g. What hours are you open?"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Answer text</label>
                <textarea
                  rows="4"
                  value={editingFaq.a}
                  onChange={(e) => setEditingFaq({ ...editingFaq, a: e.target.value })}
                  placeholder="Provide answer details..."
                  required
                ></textarea>
              </div>

              <div className="admin-dialog-actions">
                <button type="button" className="admin-btn-cancel" onClick={() => setFaqModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-save">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Creation Modal */}
      {adminModalOpen && (
        <div className="admin-dialog-overlay" onClick={() => setAdminModalOpen(false)}>
          <div className="admin-dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-dialog-header">
              <h3>Register New Administrator</h3>
              <button className="admin-dialog-close" onClick={() => setAdminModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAdmin}>
              <div className="admin-form-group">
                <label>Email Address / Username</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="newadmin@mkstationary.com"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Secure Password</label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <div className="admin-dialog-actions">
                <button type="button" className="admin-btn-cancel" onClick={() => setAdminModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-save">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Create/Edit Modal */}
      {menuModalOpen && editingMenu && (
        <div className="admin-dialog-overlay" onClick={() => setMenuModalOpen(false)}>
          <div className="admin-dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-dialog-header">
              <h3>{editingMenu.id ? "Edit Menu Option" : "Add Menu Option"}</h3>
              <button className="admin-dialog-close" onClick={() => setMenuModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveMenu}>
              <div className="admin-form-group">
                <label>Menu Label</label>
                <input
                  type="text"
                  value={editingMenu.label}
                  onChange={(e) => setEditingMenu({ ...editingMenu, label: e.target.value })}
                  placeholder="e.g. Signature Haircut"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>URL / Anchor Link Target</label>
                <input
                  type="text"
                  value={editingMenu.url}
                  onChange={(e) => setEditingMenu({ ...editingMenu, url: e.target.value })}
                  placeholder="e.g. services (anchor) or /tips (page)"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Parent Dropdown Menu (Optional)</label>
                <select
                  value={editingMenu.parent_id || ""}
                  onChange={(e) => setEditingMenu({ ...editingMenu, parent_id: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "var(--admin-bg)", border: "1px solid var(--admin-border)", color: "var(--admin-text-primary)" }}
                >
                  <option value="">None (Top-Level Menu)</option>
                  {menusList
                    .filter((m) => !m.parent_id && m.id !== editingMenu.id)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                </select>
              </div>

              <div className="admin-dialog-actions">
                <button type="button" className="admin-btn-cancel" onClick={() => setMenuModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-save">
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast popup */}
      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === "error" ? <X size={16} /> : <Check size={16} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
