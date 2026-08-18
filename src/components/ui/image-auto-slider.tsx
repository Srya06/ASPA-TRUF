"use client";

import React from 'react';
import { SectionReveal } from "@/components/motion/SectionReveal";

export const ImageAutoSlider = () => {
  // Images for the infinite scroll - using the newly uploaded venue photos
  const images = [
    "/images/showcase/showcase-1.jpg",
    "/images/showcase/showcase-2.jpg",
    "/images/showcase/showcase-3.jpg",
    "/images/showcase/showcase-4.jpg",
    "/images/showcase/showcase-5.jpg"
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
