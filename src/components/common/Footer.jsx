// components/common/Footer.jsx
import React from 'react';
import { ShoppingBag, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <ShoppingBag className="w-6 h-6" />
              <h3 className="text-xl font-bold">Thapasya Bangles</h3>
            </div>
            <p className="text-gray-300">
              Handcrafted bangles with traditional artistry and modern designs.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Craftsmanship</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Care Guide</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Traditional</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contemporary</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Designer</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bridal Collection</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                <span>+91 9180740 86883</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>thapasyabangles@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Mangalagiri, Andhra Pradesh</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2025 Thapasya Bangles. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;