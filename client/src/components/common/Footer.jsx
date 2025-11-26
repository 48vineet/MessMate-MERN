// src/components/common/Footer.jsx
import { Link } from "react-router-dom";
import Icons from "./Icons";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    quickLinks: [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Menu", href: "/menu" },
      { name: "My Bookings", href: "/bookings" },
      { name: "Wallet", href: "/wallet" },
    ],
    support: [
      { name: "Help & Support", href: "/help-support" },
      { name: "Contact Us", href: "/contact" },
      { name: "FAQ", href: "/help-support" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  };

  const socialLinks = [
    {
      name: "WhatsApp",
      href: "https://wa.me/917038738012",
      icon: Icons.message,
    },
    { name: "Email", href: "mailto:7038vineet@gmail.com", icon: Icons.mail },
    { name: "Phone", href: "tel:+917038738012", icon: Icons.phone },
    { name: "GitHub", href: "https://github.com/48vineet", icon: Icons.share },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/in/48-vineet",
      icon: Icons.users,
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-2xl font-bold">MessMate</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Revolutionizing hostel dining with smart technology, seamless
              payments, and an amazing user experience. Making every meal
              memorable for students.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center">
                <Icons.mail className="h-4 w-4 mr-2" />
                <a
                  href="mailto:7038vineet@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  7038vineet@gmail.com
                </a>
              </div>
              <div className="flex items-center">
                <Icons.phone className="h-4 w-4 mr-2" />
                <a
                  href="tel:+917038738012"
                  className="hover:text-white transition-colors"
                >
                  +91 70387 38012
                </a>
              </div>
              <div className="flex items-center">
                <Icons.location className="h-4 w-4 mr-2" />
                <span>Tech Park, Bangalore, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-base text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-base text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Copyright */}
            <div className="flex items-center text-gray-400 mb-4 md:mb-0">
              <span>© {currentYear} MessMate. All rights reserved.</span>
              <span className="mx-2">•</span>
              <span className="flex items-center">
                Made with{" "}
                <Icons.heart className="h-4 w-4 text-red-500 mx-1 fill-red-500" />{" "}
                for students
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.name}
                >
                  <social.icon className="h-5 w-5" />
                  <span className="sr-only">{social.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Legal Links */}
          <div className="mt-4 pt-4 border-t border-gray-800 flex flex-wrap justify-center space-x-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
