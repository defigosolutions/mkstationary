import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import AdminPanel from "./components/AdminPanel";
import {
  User,
  MessageSquare,
  Menu,
  X,
  Phone,
  MapPin,
  Mail,
  Clock,
  Scissors,
  Star,
  Sparkles,
  CalendarCheck,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import heroMainImg from "./assets/images/hero_main.jpg";
import signatureImg from "./assets/images/signature.jpg";
import braidBasicImg from "./assets/images/braid_basic.jpg";
import braidStandardImg from "./assets/images/braid_standard.jpg";
import braidPremiumImg from "./assets/images/braid_premium.jpg";
import testimonialImg from "./assets/images/testimonial.jpg";
import customerAvatarImg from "./assets/images/customer_avatar.jpg";
import gallery1 from "./assets/images/gallery_1.jpg";

const gallery = [
  gallery1,
  signatureImg,
  braidPremiumImg,
  braidStandardImg,
];

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  if (currentPath === "/mkscms") {
    return <AdminPanel />;
  }

  const [openFaq, setOpenFaq] = useState(0);
  const [open, setOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showBooking, setShowBooking] = useState(false);

  // Dynamic Content CMS States
  const [servicesList, setServicesList] = useState([
    { id: "1", title: "Men Haircut", desc: "Clean, sharp and stylish haircut for everyday confidence.", price: "$25" },
    { id: "2", title: "Hair Styling", desc: "Modern styling, blow dry, texture and finishing.", price: "$35" },
    { id: "3", title: "Beard Trim", desc: "Professional beard shaping, line-up and grooming.", price: "$15" },
    { id: "4", title: "Hair Color", desc: "Natural-looking color, touch-up and creative color work.", price: "$60" },
    { id: "5", title: "Kids Haircut", desc: "Comfortable haircut experience for kids.", price: "$18" },
    { id: "6", title: "Natural Hair Care", desc: "Care, styling and guidance for healthy natural hair.", price: "$45" }
  ]);

  const [faqsList, setFaqsList] = useState([
    {
      id: "1",
      q: "How can I book an appointment?",
      a: "You can book an appointment by filling the booking form, calling us directly, or visiting our salon during working hours.",
    },
    {
      id: "2",
      q: "How often do you update your services menu?",
      a: "We update our services whenever new styles, treatments, or seasonal offers are available.",
    },
    {
      id: "3",
      q: "How can I change or cancel my booking?",
      a: "You can call us before your appointment time and our team will help you reschedule or cancel your booking.",
    },
    {
      id: "4",
      q: "What special packages or offers are available?",
      a: "We offer haircut, styling, beard trim, hair color and natural hair care packages. Final offers can be updated later.",
    }
  ]);

  const [contentSettings, setContentSettings] = useState({
    heroTitle: "Sharp Cuts, \nFresh Style",
    heroDesc: "Welcome to MK Stationary Hair CT, your trusted hair salon for clean haircuts, styling, beard trims, color and natural hair care.",
    phone: "203-430-0975",
    email: "mkstationaryhair@gmail.com",
    address: "57 Ellsworth Ave, New Haven, CT 06511",
    hours: "Open 6 days a week"
  });

  const [metaTags, setMetaTags] = useState({
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
  });

  const [menusList, setMenusList] = useState([]);
  const [pagesList, setPagesList] = useState([]);

  // Monitor popstate for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (path, hashId = null) => {
    window.history.pushState(null, "", path);
    setCurrentPath(path);
    if (hashId) {
      setTimeout(() => {
        scrollToSection(hashId);
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Fetch Page Content & SEO Configs on mount
  useEffect(() => {
    fetch("/api/content")
      .then((res) => {
        if (res.ok) return res.json();
      })
      .then((data) => {
        if (data) {
          if (data.services) setServicesList(data.services);
          if (data.faqs) setFaqsList(data.faqs);
          if (data.settings) setContentSettings(data.settings);
        }
      })
      .catch((err) => console.error("Error fetching dynamic content:", err));

    fetch("/api/seo")
      .then((res) => {
        if (res.ok) return res.json();
      })
      .then((data) => {
        if (data) setMetaTags(data);
      })
      .catch((err) => console.error("Error fetching SEO settings:", err));

    fetch("/api/menus")
      .then((res) => {
        if (res.ok) return res.json();
      })
      .then((data) => {
        if (data) setMenusList(data);
      })
      .catch((err) => console.error("Error fetching menus:", err));

    fetch("/api/pages")
      .then((res) => {
        if (res.ok) return res.json();
      })
      .then((data) => {
        if (data) setPagesList(data);
      })
      .catch((err) => console.error("Error fetching pages:", err));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = ["home", "about", "services", "pricing", "gallery", "contact"];
    
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -65% 0px",
      threshold: 0
    };

    const observerCallback = (entries) => {
      if (window.location.pathname !== "/") return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (metaTags[id]) {
            document.title = metaTags[id].title;
            
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
              metaDesc = document.createElement('meta');
              metaDesc.name = "description";
              document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute("content", metaTags[id].desc);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, [metaTags]);

  const matchedPage = pagesList.find((p) => p.slug === currentPath);
  const isCustomPage = currentPath !== "/" && currentPath !== "/mkscms" && matchedPage;

  useEffect(() => {
    if (currentPath === "/") {
      document.title = metaTags.home?.title || "MK Stationary Hair CT | Premium Haircut Salon in New Haven, CT";
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", metaTags.home?.desc || "");
      }
    } else if (matchedPage) {
      document.title = `${matchedPage.title} | MK Stationary Hair CT`;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", `${matchedPage.title} - Custom page content on MK Stationary Hair CT.`);
      }
    } else if (currentPath !== "/mkscms") {
      document.title = "404 Page Not Found | MK Stationary Hair CT";
    }
  }, [currentPath, matchedPage, metaTags]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const bookingData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone") || "",
      date: formData.get("date"),
      service: formData.get("service"),
      message: formData.get("message") || ""
    };

    if (!bookingData.name || !bookingData.date || !bookingData.service || bookingData.service === "Service type") {
      alert("Please fill in all required fields (Name, Date, and Service Type).");
      return;
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });
      if (res.ok) {
        alert("Your appointment request has been submitted successfully!");
        e.target.reset();
        setShowBooking(false);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit booking.");
      }
    } catch (err) {
      alert("Server connection error. Please try again or call us directly.");
    }
  };

  const scrollToSection = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const formattedPhoneLink = `tel:${contentSettings.phone.replace(/[^0-9]/g, "")}`;

  const defaultMenus = [
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
  ];
  const menusToRender = menusList.length > 0 ? menusList : defaultMenus;

  const parentMenus = menusToRender.filter((m) => !m.parent_id);
  const getChildren = (parentId) => menusToRender.filter((m) => m.parent_id === parentId).sort((a, b) => a.menu_order - b.menu_order);

  return (
    <div className="site">
      <header className={`navbar nav-show ${lastScrollY > 20 ? "nav-glass" : "nav-solid"}`}>
        <div
          className="logo"
          onClick={() => {
            if (currentPath !== "/") {
              navigateTo("/", "home");
            } else {
              scrollToSection("home");
            }
          }}
          style={{ cursor: "pointer" }}
        >
          <div className="logo-mark">MK</div>
          <div>
            <h1>MK STATIONARY HAIR CT</h1>
            <p>IN OUT • NO LONG WAIT</p>
          </div>
        </div>

        <nav className={open ? "nav-links active" : "nav-links"}>
          {parentMenus.map((parent) => {
            const children = getChildren(parent.id);
            const isParentAnchor = !parent.page_id && !parent.url.startsWith("/");
            
            if (children.length > 0) {
              return (
                <div className="nav-dropdown" key={parent.id}>
                  <button
                    onClick={() => {
                      if (isParentAnchor) {
                        if (currentPath !== "/") {
                          navigateTo("/", parent.url);
                        } else {
                          scrollToSection(parent.url);
                        }
                      } else {
                        navigateTo(parent.url);
                      }
                      setOpen(false);
                    }}
                  >
                    {parent.label}
                  </button>
                  <div className="dropdown-menu">
                    {children.map((child) => {
                      const isChildAnchor = !child.page_id && !child.url.startsWith("/");
                      return (
                        <button
                          key={child.id}
                          onClick={() => {
                            if (isChildAnchor) {
                              if (currentPath !== "/") {
                                navigateTo("/", child.url);
                              } else {
                                scrollToSection(child.url);
                              }
                            } else {
                              navigateTo(child.url);
                            }
                            setOpen(false);
                          }}
                        >
                          {child.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return (
              <button
                key={parent.id}
                onClick={() => {
                  if (isParentAnchor) {
                    if (currentPath !== "/") {
                      navigateTo("/", parent.url);
                    } else {
                      scrollToSection(parent.url);
                    }
                  } else {
                    navigateTo(parent.url);
                  }
                  setOpen(false);
                }}
              >
                {parent.label}
              </button>
            );
          })}
        </nav>

        <a className="call-btn" href={formattedPhoneLink}>
          <Phone size={18} /> Call Now
        </a>

        <button className="menu-btn" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </header>

      {!isCustomPage && currentPath !== "/" && currentPath !== "/mkscms" ? (
        <section className="section 404-page" style={{ paddingTop: "160px", paddingBottom: "100px", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div>
            <span className="small-title">Error 404</span>
            <h2 className="section-heading">Page Not Found</h2>
            <p style={{ color: "#b3b3b3", marginBottom: "30px" }}>The page you are looking for does not exist.</p>
            <button onClick={() => navigateTo("/")} className="primary-btn" style={{ margin: "0 auto" }}>
              Return to Home
            </button>
          </div>
        </section>
      ) : isCustomPage ? (
        <section className="section custom-page" style={{ paddingTop: "140px", paddingBottom: "100px", minHeight: "60vh" }}>
          <div className="container" style={{ maxWidth: "900px", margin: "0 auto", padding: "0 20px" }}>
            <span className="small-title">{matchedPage.title}</span>
            <h2 className="section-heading" style={{ textAlign: "left", marginBottom: "40px" }}>{matchedPage.title}</h2>
            <div 
              className="custom-page-body-html"
              dangerouslySetInnerHTML={{ __html: matchedPage.content_html }}
              style={{
                color: "var(--admin-text-secondary, #b3b3b3)",
                lineHeight: "1.8",
                fontSize: "16px"
              }}
            />
          </div>
        </section>
      ) : (
        <>
          {/* Hero Section */}
          <section className="home-hero" id="home">
            <div className="hero-bg-blur"></div>

            <motion.div
              className="hero-content"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <span className="hero-tag">
                <Sparkles size={16} />
                Premium Haircut Salon in New Haven
              </span>

              <h1>
                {contentSettings.heroTitle.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < contentSettings.heroTitle.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </h1>

              <p>{contentSettings.heroDesc}</p>

              <div className="hero-buttons">
                <button onClick={() => setShowBooking(true)} className="primary-btn">
                  Book Appointment <ArrowRight size={18} />
                </button>

                <a className="secondary-btn" href={formattedPhoneLink}>
                  Call {contentSettings.phone}
                </a>
              </div>
            </motion.div>

            <motion.div
              className="hero-image-wrap"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2 }}
            >
              <img
                src={heroMainImg}
                alt="Beauty Salon"
                className="hero-main-img"
              />

              <div className="floating-card card-one">
                <Scissors size={18} />
                Hair Styling
              </div>

              <div className="floating-card card-two">
                <Star size={18} />
                10–20 Years Experience
              </div>
            </motion.div>
          </section>

          {/* Signature Services section (dynamic sync first 3) */}
          <section className="signature-service">
            <div className="signature-image">
              <img
                src={signatureImg}
                alt="Professional haircut service"
              />
            </div>

            <div className="signature-content">
              <span className="signature-script">fresh look</span>
              <h2>Signature Grooming Services</h2>

              <div className="signature-list">
                {servicesList.slice(0, 3).map((item) => (
                  <div className="signature-item" key={item.id || item.title}>
                    <div>
                      <h3>
                        {item.title}{" "}
                        {item.title.toLowerCase().includes("beard") && <span>Popular</span>}
                      </h3>
                      <p>{item.desc}</p>
                    </div>
                    <strong>{item.price}</strong>
                  </div>
                ))}
              </div>

              <button onClick={() => setShowBooking(true)} className="signature-btn">
                Book Appointment
              </button>
            </div>
          </section>

          <section className="intro-strip"></section>
          <section className="intro-strip">
            <div><Star /> 10–20 Years Experienced Staff</div>
            <div><CheckCircle2 /> Natural Hair Care</div>
            <div><CalendarCheck /> Easy Booking</div>
          </section>

          {/* Services Grid Section */}
          <section className="section services" id="services">
            <span className="small-title center">Our Services</span>
            <h2 className="section-heading">Haircut, styling and grooming services</h2>

            <div className="service-grid">
              {servicesList.map((item, index) => (
                <div className="service-card" key={item.id || item.title}>
                  <div className="service-icon"><Scissors size={24} /></div>
                  <span>0{index + 1}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing list section */}
          <section className="section pricing" id="pricing">
            <div>
              <span className="small-title">Service Pricing</span>
              <h2>Popular haircut salon prices</h2>
              <p>View our updated service rates below. Secure a seat today.</p>
            </div>

            <div className="price-list">
              {servicesList.map((item) => (
                <div className="price-row" key={item.id || item.title}>
                  <span>{item.title}</span>
                  <b>{item.price}</b>
                </div>
              ))}
            </div>
          </section>

          {/* Gallery Section */}
          <section className="section braid-services" id="gallery">
            <span className="small-title center">Our Hair Styles</span>
            <h2 className="section-heading">
              Premium braid & natural hair styling services
            </h2>

            <div className="braid-grid">
              <div className="braid-card">
                <img
                  src={braidBasicImg}
                  alt="Basic braid style"
                />
                <div className="braid-content">
                  <h3>Basic</h3>
                  <p>Book today and experience the top-notch quality of our service firsthand.</p>
                  <button onClick={() => setShowBooking(true)}>Contact us</button>
                </div>
              </div>

              <div className="braid-card">
                <img
                  src={braidStandardImg}
                  alt="Standard braid style"
                />
                <div className="braid-content">
                  <h3>Standard</h3>
                  <p>We’ll help you create the style and design that’s specific to your needs and wants.</p>
                  <button onClick={() => setShowBooking(true)}>Contact us</button>
                </div>
              </div>

              <div className="braid-card">
                <img
                  src={braidPremiumImg}
                  alt="Premium braid style"
                />
                <div className="braid-content">
                  <h3>Premium</h3>
                  <p>Our team works around the clock to make sure we deliver on time, every time.</p>
                  <button onClick={() => setShowBooking(true)}>Contact us</button>
                </div>
              </div>
            </div>
          </section>

          {/* CTA section */}
          <section className="cta">
            <h2>Ready for a fresh haircut?</h2>
            <p>Walk in or call us before visiting. In out, no long wait.</p>
            <a href={formattedPhoneLink} className="primary-btn">
              Call Now
            </a>
          </section>

          {/* Testimonials */}
          <section className="testimonial-section">
            <div className="testimonial-image">
              <img
                src={testimonialImg}
                alt="Happy salon customers"
              />
            </div>

            <div className="testimonial-content">
              <span className="testimonial-script">reviews</span>
              <h2>What Our Customers Say</h2>
              <div className="stars">★★★★★</div>
              <p className="review-text">
                “The service was smooth, professional and friendly. My haircut looked
                fresh, clean and exactly how I wanted it. I’ll definitely visit again.”
              </p>
              <div className="review-user">
                <img
                  src={customerAvatarImg}
                  alt="Customer"
                />
                <div>
                  <h4>Jessica Brown</h4>
                  <span>Customer</span>
                </div>
              </div>

              <div className="review-dots">
                <span></span>
                <span></span>
                <span className="active"></span>
              </div>
            </div>
          </section>

          {/* FAQs Section */}
          <section className="faq-section">
            <div className="faq-bg-glow"></div>

            <span className="faq-script">questions</span>
            <h2>Common Questions</h2>

            <div className="faq-list">
              {faqsList.map((item, index) => (
                <div className={`faq-item ${openFaq === index ? "active" : ""}`} key={item.id || index}>
                  <button
                    className="faq-question"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span>{item.q}</span>
                    <b>{openFaq === index ? "↑" : "→"}</b>
                  </button>

                  <div className="faq-answer">
                    <p>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <section className="section contact" id="contact">
            <div className="contact-info">
              <span className="small-title">Contact</span>
              <h2>Visit MK Stationary Hair CT</h2>
              <p><MapPin /> {contentSettings.address}</p>
              <p><Phone /> <a href={formattedPhoneLink}>{contentSettings.phone}</a></p>
              <p><Mail /> <a href={`mailto:${contentSettings.email}`}>{contentSettings.email}</a></p>
              <p><Clock /> {contentSettings.hours}</p>
            </div>

            <form className="booking-form reserve-form" onSubmit={handleBookingSubmit}>
              <span className="reserve-script">reserve</span>
              <h3>Book A Seat</h3>

              <div className="reserve-row">
                <div className="reserve-field">
                  <User size={22} />
                  <input name="name" placeholder="Your Name" required />
                </div>

                <div className="reserve-field">
                  <Mail size={22} />
                  <input name="email" type="email" placeholder="Your Email" required />
                </div>
              </div>

              <div className="reserve-row">
                <div className="reserve-field">
                  <CalendarCheck size={22} />
                  <input name="date" type="date" required />
                </div>

                <div className="reserve-field">
                  <Scissors size={22} />
                  <select name="service" required defaultValue="">
                    <option value="" disabled>Service type</option>
                    {servicesList.map((s) => (
                      <option key={s.id || s.title} value={s.title}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="reserve-message">
                <MessageSquare size={22} />
                <textarea name="message" placeholder="How can we help you? Feel free to get in touch!"></textarea>
              </div>

              <div className="reserve-bottom">
                <button type="submit">Submit</button>

                <label>
                  <input type="checkbox" required />
                  <span>I agree that my submitted data is collected and stored.</span>
                </label>
              </div>
            </form>
          </section>

          {/* Map Section */}
          <section className="map-section">
            <iframe
              title="MK Stationary Hair CT Location"
              src={`https://www.google.com/maps?q=${encodeURIComponent(contentSettings.address)}&output=embed`}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>

            <div className="map-overlay-card">
              <h3>Visit Our Salon</h3>
              <p>{contentSettings.address}</p>
              <a href={formattedPhoneLink}>Call Now</a>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="luxury-footer">
        <div className="footer-left">
          <h3>Website Map</h3>
          <div className="footer-links-grid">
            {menusToRender.map((menu) => {
              const isAnchor = !menu.page_id && !menu.url.startsWith("/");
              return (
                <button
                  key={menu.id}
                  onClick={() => {
                    if (isAnchor) {
                      if (currentPath !== "/") {
                        navigateTo("/", menu.url);
                      } else {
                        scrollToSection(menu.url);
                      }
                    } else {
                      navigateTo(menu.url);
                    }
                  }}
                >
                  {menu.label}
                </button>
              );
            })}
            <button onClick={() => setShowBooking(true)}>For Booking</button>
          </div>

          <h3 className="newsletter-title">Newsletter</h3>
          <div className="newsletter-box">
            <input type="email" placeholder="Your email address" />
            <button>➤</button>
          </div>

          <label className="privacy-check">
            <input type="checkbox" />
            <span>I agree to the Privacy Policy</span>
          </label>
          <p className="copyright">© 2026 MK Stationary Hair CT, all rights reserved.</p>
        </div>

        <div className="footer-center">
          <p>Drop us a line for fresh style, haircut and natural hair care.</p>
          <div className="footer-brand">
            <span>MK</span>
            <h2>Stationary Hair CT</h2>
          </div>
        </div>

        <div className="footer-right">
          <h3>Contact</h3>
          <p>{contentSettings.address}</p>
          <p>
            <b>P:</b> <a href={formattedPhoneLink}>{contentSettings.phone}</a><br />
            <b>E:</b> <a href={`mailto:${contentSettings.email}`}>{contentSettings.email}</a>
          </p>

          <h3 className="follow-title">Follow</h3>
          <div className="social-icons">
            <a href="#">X</a>
            <a href="#">f</a>
            <a href="#">◎</a>
            <a href="#">in</a>
          </div>

          <div className="footer-policy">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms & Conditions</a>
          </div>
        </div>
      </footer>

      {/* Popup Form Modal */}
      {showBooking && (
        <div className="booking-popup-overlay" onClick={() => setShowBooking(false)}>
          <div className="booking-popup-box" onClick={(e) => e.stopPropagation()}>
            <button className="booking-popup-close" onClick={() => setShowBooking(false)}>
              <X size={22} />
            </button>

            <span className="reserve-script">appointment</span>
            <h3>Book An Appointment</h3>

            <form className="booking-popup-form" onSubmit={handleBookingSubmit}>
              <input name="name" type="text" placeholder="Your Name" required />
              <input name="email" type="email" placeholder="Your Email" required />
              <input name="phone" type="tel" placeholder="Phone Number" required />

              <div className="popup-row">
                <input name="date" type="date" required />
                <select name="service" required defaultValue="">
                  <option value="" disabled>Select Service</option>
                  {servicesList.map((s) => (
                    <option key={s.id || s.title} value={s.title}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <textarea name="message" placeholder="Message / Preferred time"></textarea>
              <button type="submit">Submit Appointment</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;