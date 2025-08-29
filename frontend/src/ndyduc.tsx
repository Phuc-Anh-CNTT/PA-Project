// @ts-ignore
import React from "react";
import { Github, Twitter, Instagram, Phone } from "lucide-react";

export default function ndyduc() {
  return (
    <footer className="w-full bg-gray-900 text-white py-6 pr-6 pl-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        {/* Thông tin dev */}
        <p className="text-sm mb-4 md:mb-0">
          © 2025 Được phát triển bởi{" "}
          <span className="font-semibold">_ndyduc_</span>
        </p>

        {/* Social links */}
        <div className="flex space-x-6">
          <a
            href="https://github.com/ndyduc"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
          <a
            href="https://twitter.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition-colors"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <a
            href="https://instagram.com/_ndyduc_"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-400 transition-colors"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a
            href="https://wa.me/84349583748"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-400 transition-colors"
          >
            <Phone className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}