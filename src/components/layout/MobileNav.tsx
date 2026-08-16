"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden flex items-center">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md bg-truf-lime text-truf-dark hover:bg-truf-lime/90 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="absolute top-20 left-0 right-0 bg-truf-dark border-b border-white/10 shadow-xl p-4 flex flex-col gap-4 z-50 animate-in slide-in-from-top-2">
          <a
            href="#sports"
            onClick={() => setIsOpen(false)}
            className="px-4 py-3 text-lg font-medium text-white hover:bg-white/5 rounded-md"
          >
            Sports
          </a>
          <a
            href="#availability"
            onClick={() => setIsOpen(false)}
            className="px-4 py-3 text-lg font-medium text-white hover:bg-white/5 rounded-md"
          >
            Availability
          </a>
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="px-4 py-3 text-lg font-medium text-white hover:bg-white/5 rounded-md"
          >
            Profile
          </Link>
        </div>
      )}
    </div>
  );
}
