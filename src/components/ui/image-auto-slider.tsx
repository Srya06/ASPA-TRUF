"use client";

import React from 'react';
import { SectionReveal } from "@/components/motion/SectionReveal";

export const ImageAutoSlider = () => {
  // Images for the infinite scroll - using sports/turf related Unsplash URLs
  const images = [
    "https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524799526615-766a9833dec0?q=80&w=1935&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=2126&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1482881497185-d4a9ddbe4151?q=80&w=1965&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&q=80",
    "https://images.unsplash.com/photo-1574629810360-7abbc94d50a5?w=800&q=80",
    "https://images.unsplash.com/photo-1626224583764-f87db7ac2ed9?w=800&q=80",
    "https://images.unsplash.com/photo-1592656094267-764a45160876?w=1200&q=80"
  ];

  // Duplicate images for seamless loop
  const duplicatedImages = [...images, ...images];

  return (
    <section className="relative w-full bg-truf-dark py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12">
        <SectionReveal>
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-truf-lime">
              The APSA Experience
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Venue Showcase
            </h2>
          </div>
        </SectionReveal>
      </div>

      <style>{`
        @keyframes scroll-right {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .infinite-scroll {
          animation: scroll-right 30s linear infinite;
        }

        .scroll-container {
          mask: linear-gradient(
            90deg,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );
          -webkit-mask: linear-gradient(
            90deg,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );
        }
      `}</style>
      
      <div className="relative z-10 w-full flex items-center justify-center py-8">
        <div className="scroll-container w-full max-w-[100vw]">
          <div className="infinite-scroll flex gap-6 w-max">
            {duplicatedImages.map((image, index) => (
              <div
                key={index}
                className="group flex-shrink-0 w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-2xl overflow-hidden shadow-2xl border border-white/5"
              >
                <img
                  src={image}
                  alt={`Gallery image ${(index % images.length) + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </section>
  );
};
