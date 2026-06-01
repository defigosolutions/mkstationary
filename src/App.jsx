import { motion } from "framer-motion";
import { useEffect, useState } from "react";
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

const services = [
  { title: "Men Haircut", desc: "Clean, sharp and stylish haircut for everyday confidence.", price: "$25" },
  { title: "Hair Styling", desc: "Modern styling, blow dry, texture and finishing.", price: "$35" },
  { title: "Beard Trim", desc: "Professional beard shaping, line-up and grooming.", price: "$15" },
  { title: "Hair Color", desc: "Natural-looking color, touch-up and creative color work.", price: "$60" },
  { title: "Kids Haircut", desc: "Comfortable haircut experience for kids.", price: "$18" },
  { title: "Natural Hair Care", desc: "Care, styling and guidance for healthy natural hair.", price: "$45" },
];

const gallery = [
  gallery1,
  signatureImg,
  braidPremiumImg,
  braidStandardImg,
];

function App() {
  const [openFaq, setOpenFaq] = useState(0);
  const faqs = [
  {
    q: "How can I book an appointment?",
    a: "You can book an appointment by filling the booking form, calling us directly, or visiting our salon during working hours.",
  },
  {
    q: "How often do you update your services menu?",
    a: "We update our services whenever new styles, treatments, or seasonal offers are available.",
  },
  {
    q: "How can I change or cancel my booking?",
    a: "You can call us before your appointment time and our team will help you reschedule or cancel your booking.",
  },
  {
    q: "What special packages or offers are available?",
    a: "We offer haircut, styling, beard trim, hair color and natural hair care packages. Final offers can be updated later.",
  },
];
  const [open, setOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = ["home", "about", "services", "pricing", "gallery", "contact"];
    
    const metaTags = {
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
    };

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -65% 0px",
      threshold: 0
    };

    const observerCallback = (entries) => {
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
  }, []);

  const [showBooking, setShowBooking] = useState(false);

  const scrollToSection = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="site">
      <header className={`navbar nav-show ${lastScrollY > 20 ? "nav-glass" : "nav-solid"}`}>
        <div className="logo" onClick={() => scrollToSection("home")}>
          <div className="logo-mark">MK</div>
          <div>
            <h1>MK STATIONARY HAIR CT</h1>
            <p>IN OUT • NO LONG WAIT</p>
          </div>
        </div>

      <nav className={open ? "nav-links active" : "nav-links"}>
  <div className="nav-dropdown">
    <button onClick={() => scrollToSection("home")}>Home</button>

    <div className="dropdown-menu">
      <button onClick={() => scrollToSection("home")}>Welcome</button>
      <button onClick={() => scrollToSection("about")}>Our Legacy</button>
      <button onClick={() => scrollToSection("gallery")}>The Experience</button>
    </div>
  </div>

  <button onClick={() => scrollToSection("about")}>About</button>

  <div className="nav-dropdown">
    <button onClick={() => scrollToSection("services")}>Services</button>

    <div className="dropdown-menu">
      <button onClick={() => scrollToSection("services")}>Signature Haircut</button>
      <button onClick={() => scrollToSection("services")}>Grooming & Shaves</button>
      <button onClick={() => scrollToSection("services")}>Beard Detailing</button>
      <button onClick={() => scrollToSection("services")}>Color Treatments</button>
      <button onClick={() => scrollToSection("services")}>Organic Hair Care</button>
    </div>
  </div>

  <div className="nav-dropdown">
    <button onClick={() => scrollToSection("pricing")}>Pricing</button>

    <div className="dropdown-menu">
      <button onClick={() => scrollToSection("pricing")}>Service Rates</button>
      <button onClick={() => scrollToSection("pricing")}>Grooming Packages</button>
      <button onClick={() => scrollToSection("contact")}>Secure A Seat</button>
    </div>
  </div>

  <button onClick={() => scrollToSection("gallery")}>Gallery</button>
  <button onClick={() => scrollToSection("contact")}>Contact</button>
</nav>

        <a className="call-btn" href="tel:2034300975">
          <Phone size={18} /> Call Now
        </a>

        <button className="menu-btn" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </header>

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
            Sharp Cuts, <br />
            Fresh Style
          </h1>

          <p>
            Welcome to MK Stationary Hair CT, your trusted hair salon for clean haircuts,
            styling, beard trims, color and natural hair care.
          </p>

          <div className="hero-buttons">
           <button onClick={() => setShowBooking(true)} className="primary-btn">
  Book Appointment <ArrowRight size={18} />
</button>

            <a className="secondary-btn" href="tel:2034300975">
              Call 203-430-0975
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
      <div className="signature-item">
        <div>
          <h3>Classic Haircut</h3>
          <p>Clean finish • 30 mins session</p>
        </div>
        <strong>$25</strong>
      </div>

      <div className="signature-item">
        <div>
          <h3>Beard Shape & Trim <span>Popular</span></h3>
          <p>Sharp line-up • 20 mins session</p>
        </div>
        <strong>$15</strong>
      </div>

      <div className="signature-item">
        <div>
          <h3>Hair Styling</h3>
          <p>Modern styling • 35 mins session</p>
        </div>
        <strong>$35</strong>
      </div>
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


      <section className="section services" id="services">
        <span className="small-title center">Our Services</span>
        <h2 className="section-heading">Haircut, styling and grooming services</h2>

        <div className="service-grid">
          {services.map((item, index) => (
            <div className="service-card" key={item.title}>
              <div className="service-icon"><Scissors size={24} /></div>
              <span>0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section pricing" id="pricing">
        <div>
          <span className="small-title">Dummy Price List</span>
          <h2>Popular haircut salon prices</h2>
          <p>These prices are dummy for now. Replace after client confirms final rate.</p>
        </div>

        <div className="price-list">
          {services.map((item) => (
            <div className="price-row" key={item.title}>
              <span>{item.title}</span>
              <b>{item.price}</b>
            </div>
          ))}
        </div>
      </section>

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

        <p>
          Book today and experience the top-notch quality of our
          service firsthand.
        </p>

        <button onClick={() => setShowBooking(true)}>
          Contact us
        </button>
      </div>
    </div>

    <div className="braid-card">
      <img
        src={braidStandardImg}
        alt="Standard braid style"
      />

      <div className="braid-content">
        <h3>Standard</h3>

        <p>
          We’ll help you create the style and design that’s
          specific to your needs and wants.
        </p>

        <button onClick={() => setShowBooking(true)}>
          Contact us
        </button>
      </div>
    </div>

    <div className="braid-card">
      <img
        src={braidPremiumImg}
        alt="Premium braid style"
      />

      <div className="braid-content">
        <h3>Premium</h3>

        <p>
          Our team works around the clock to make sure we
          deliver on time, every time.
        </p>

        <button onClick={() => setShowBooking(true)}>
          Contact us
        </button>
      </div>
    </div>
  </div>
</section>

      <section className="cta">
        <h2>Ready for a fresh haircut?</h2>
        <p>Walk in or call us before visiting. In out, no long wait.</p>
        <a href="tel:2034300975" className="primary-btn">
          Call Now
        </a>
      </section>
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
<section className="faq-section">
  <div className="faq-bg-glow"></div>

  <span className="faq-script">questions</span>
  <h2>Common Questions</h2>

  <div className="faq-list">
    {faqs.map((item, index) => (
      <div className={`faq-item ${openFaq === index ? "active" : ""}`} key={index}>
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
      <section className="section contact" id="contact">
        <div className="contact-info">
          <span className="small-title">Contact</span>
          <h2>Visit MK Stationary Hair CT</h2>
          <p><MapPin /> 57 Ellsworth Ave, New Haven, CT 06511, New Haven</p>
          <p><Phone /> <a href="tel:2034300975">203-430-0975</a></p>
          <p><Mail /> <a href="mailto:mkstationaryhair@gmail.com">mkstationaryhair@gmail.com</a></p>
          <p><Clock /> Open 6 days a week</p>
        </div>

        <form className="booking-form reserve-form" onSubmit={(e) => e.preventDefault()}>
  <span className="reserve-script">reserve</span>
  <h3>Book A Seat</h3>

  <div className="reserve-row">
    <div className="reserve-field">
      <User size={22} />
      <input placeholder="Your Name" />
    </div>

    <div className="reserve-field">
      <Mail size={22} />
      <input placeholder="Your Email" />
    </div>
  </div>

  <div className="reserve-row">
    <div className="reserve-field">
      <CalendarCheck size={22} />
      <input type="date" />
    </div>

    <div className="reserve-field">
      <Scissors size={22} />
      <select>
        <option>Service type</option>
        <option>Men Haircut</option>
        <option>Hair Styling</option>
        <option>Beard Trim</option>
        <option>Hair Color</option>
        <option>Natural Hair Care</option>
      </select>
    </div>
  </div>

  <div className="reserve-message">
    <MessageSquare size={22} />
    <textarea placeholder="How can we help you? Feel free to get in touch!"></textarea>
  </div>

  <div className="reserve-bottom">
    <button type="submit">Submit</button>

    <label>
      <input type="checkbox" />
      <span>I agree that my submitted data is collected and stored.</span>
    </label>
  </div>
</form>
      </section>
    <section className="map-section">
  <iframe
    title="MK Stationary Hair CT Location"
    src="https://www.google.com/maps?q=57+Ellsworth+Ave,+New+Haven,+CT+06511&output=embed"
    allowFullScreen=""
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
  ></iframe>

  <div className="map-overlay-card">
    <h3>Visit Our Salon</h3>

    <p>
      57 Ellsworth Ave,<br />
      New Haven, CT 06511
    </p>

    <a href="tel:2034300975">Call Now</a>
  </div>
</section>
     <footer className="luxury-footer">
  <div className="footer-left">
    <h3>Website Map</h3>

    <div className="footer-links-grid">
      <button onClick={() => scrollToSection("home")}>Home</button>
      <button onClick={() => scrollToSection("about")}>About Us</button>
      <button onClick={() => setShowBooking(true)}>For Booking</button>
      <button onClick={() => scrollToSection("services")}>Services</button>
      <button onClick={() => scrollToSection("pricing")}>Pricing</button>
      <button onClick={() => scrollToSection("contact")}>Contact Us</button>
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

    <p>
      57 Ellsworth Ave,<br />
      New Haven, CT 06511
    </p>

    <p>
      <b>P:</b> <a href="tel:2034300975">203-430-0975</a><br />
      <b>E:</b> <a href="mailto:mkstationaryhair@gmail.com">mkstationaryhair@gmail.com</a>
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
{showBooking && (
  <div className="booking-popup-overlay" onClick={() => setShowBooking(false)}>
    <div className="booking-popup-box" onClick={(e) => e.stopPropagation()}>
      <button className="booking-popup-close" onClick={() => setShowBooking(false)}>
        <X size={22} />
      </button>

      <span className="reserve-script">appointment</span>
      <h3>Book An Appointment</h3>

      <form
        className="booking-popup-form"
        onSubmit={(e) => {
          e.preventDefault();
          alert("Appointment request submitted successfully!");
          setShowBooking(false);
        }}
      >
        <input type="text" placeholder="Your Name" required />
        <input type="email" placeholder="Your Email" required />
        <input type="tel" placeholder="Phone Number" required />

        <div className="popup-row">
          <input type="date" required />
          <select required defaultValue="">
            <option value="" disabled>Select Service</option>
            <option>Men Haircut</option>
            <option>Hair Styling</option>
            <option>Beard Trim</option>
            <option>Hair Color</option>
            <option>Natural Hair Care</option>
          </select>
        </div>

        <textarea placeholder="Message / Preferred time"></textarea>

        <button type="submit">Submit Appointment</button>
      </form>
    </div>
  </div>
)}
    </div>
  );
}

export default App;