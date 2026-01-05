'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  Phone, 
  Mail, 
  Heart
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto mobile-padding-x py-8 sm:py-12 md:py-16">
        {/* Logo and Contact Info */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 sm:mb-8 gap-6 sm:gap-8">
          {/* Logo */}
          <Link href="/" className="inline-block mb-4 md:mb-0 group bg-black p-2 sm:p-3 rounded-2xl sm:rounded-3xl no-tap-highlight">
            <Image
              src="/images/logo.png"
              alt="FoodFly"
              width={400}
              height={120}
              className="h-24 sm:h-28 md:h-36 w-auto group-hover:scale-105 transition-transform duration-300 bg-[#232323] rounded-xl sm:rounded-2xl p-2 sm:p-3 border-2 sm:border-4 border-black"
            />
          </Link>

          {/* Contact Information */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-12 w-full md:w-auto">
            <a 
              href="tel:+919090020245" 
              className="flex items-center space-x-3 sm:space-x-4 group justify-center sm:justify-start touch-target no-tap-highlight"
            >
              <div className="p-2.5 sm:p-3 bg-gray-800 rounded-full group-hover:bg-red-600 transition-all duration-300 flex-shrink-0">
                <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="mobile-text text-gray-400">Call Us</p>
                <p className="text-white mobile-text font-medium">+91 9090020245</p>
              </div>
            </a>
            <a 
              href="mailto:info@therobustrix.com" 
              className="flex items-center space-x-3 sm:space-x-4 group justify-center sm:justify-start touch-target no-tap-highlight"
            >
              <div className="p-2.5 sm:p-3 bg-gray-800 rounded-full group-hover:bg-red-600 transition-all duration-300 flex-shrink-0">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="mobile-text text-gray-400">Email Us</p>
                <p className="text-white mobile-text font-medium break-all">info@therobustrix.com</p>
              </div>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-gray-800 text-center space-y-2">
          <p className="text-yellow-400 mobile-text font-bold">© 2025 Foodfly.com — All rights reserved.</p>
          <p className="text-yellow-400 mobile-text font-bold px-4">
            Crafted with care and innovation in partnership with Robustrix / ब्रह्मांड AI (The Intelligence of the Cosmos).
          </p>
        </div>
      </div>
    </footer>
  );
} 