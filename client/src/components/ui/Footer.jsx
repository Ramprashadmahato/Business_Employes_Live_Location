import React from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import heroImage from "../../assets/Image/hero.webp";
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 text-gray-600 pt-12">
      {/* Main Footer Section */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 pb-10">
        
        {/* Company Info */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <img src={heroImage} alt="Business Sarthi Logo" className="h-10 w-10 rounded-full" />
            <h2 className="text-xl font-bold text-blue-600">Business Sarthi</h2>
          </div>
          <p className="text-sm leading-relaxed">
            Empowering businesses with innovative IT solutions, technology expertise, and digital growth strategies.
          </p>
          {/* Social Icons */}
          <div className="flex space-x-3 mt-4">
            <a href="#" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
              <FaFacebookF size={14} />
            </a>
            <a href="#" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
              <FaTwitter size={14} />
            </a>
            <a href="#" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
              <FaLinkedinIn size={14} />
            </a>
            <a href="#" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
              <FaInstagram size={14} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-blue-600 transition">Home</a></li>
            <li><a href="/about" className="hover:text-blue-600 transition">About Us</a></li>
            <li><a href="/services" className="hover:text-blue-600 transition">Services</a></li>
            <li><a href="/projects" className="hover:text-blue-600 transition">Projects</a></li>
            <li><a href="/contact" className="hover:text-blue-600 transition">Contact</a></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-4">Resources</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-blue-600 transition">Blog</a></li>
            <li><a href="#" className="hover:text-blue-600 transition">FAQs</a></li>
            <li><a href="#" className="hover:text-blue-600 transition">Help Center</a></li>
            <li><a href="#" className="hover:text-blue-600 transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-blue-600 transition">Terms of Service</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-4">Contact Us</h3>
          <ul className="text-sm space-y-2">
            <li><span className="font-medium">Email:</span> info@businesssarthi.com</li>
            <li><span className="font-medium">Phone:</span> +123 456 7890</li>
            <li><span className="font-medium">Address:</span> 123 Tech Avenue, Kathmandu, Nepal</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 py-4 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {currentYear} <span className="font-semibold text-blue-600">Business Sarthi</span>. All rights reserved.</p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-blue-600 transition">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition">Terms</a>
            <a href="#" className="hover:text-blue-600 transition">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
