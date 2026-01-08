'use client';

/**
 * Hero Section with optimized parallax animation
 * Features:
 * - Smooth scroll-synced transitions with requestAnimationFrame
 * - Responsive text scaling
 * - Throttled scroll listeners
 * - ARIA compliance and keyboard navigation
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import type { HeroSectionProps } from '@/types/components';
import { logUserInteraction } from '@/lib/logger';

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  ctaText = 'Get Started',
  ctaHref = '#',
  backgroundImage,
  enableParallax = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Scroll animation with spring physics for smoothness
  const { scrollY } = useScroll();
  const y = useSpring(
    useTransform(scrollY, [0, 500], [0, enableParallax ? -150 : 0]),
    {
      stiffness: 100,
      damping: 30,
      restDelta: 0.001,
    }
  );

  const opacity = useSpring(
    useTransform(scrollY, [0, 300], [1, 0]),
    {
      stiffness: 100,
      damping: 30,
    }
  );

  const scale = useSpring(
    useTransform(scrollY, [0, 300], [1, 0.95]),
    {
      stiffness: 100,
      damping: 30,
    }
  );

  // Intersection Observer for visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            logUserInteraction({
              event: 'hero_section_visible',
              component: 'HeroSection',
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // CTA click handler
  const handleCtaClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    logUserInteraction({
      event: 'hero_cta_click',
      component: 'HeroSection',
      metadata: { href: ctaHref },
    });

    // Smooth scroll for anchor links
    if (ctaHref.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(ctaHref);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [ctaHref]);

  // Memoized styles for performance
  const backgroundStyle = useMemo(() => ({
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }), [backgroundImage]);

  return (
    <motion.section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        y: enableParallax ? y : 0,
        ...backgroundStyle,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.8 }}
      role="banner"
      aria-label="Hero section"
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-transparent" />

      {/* Content Container */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        style={{
          opacity,
          scale,
        }}
      >
        {/* Title with responsive scaling */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 leading-tight"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: isVisible ? 0 : 30, opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: isVisible ? 0 : 30, opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {subtitle}
          </motion.p>
        )}

        {/* CTA Button */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: isVisible ? 0 : 30, opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <a
            href={ctaHref}
            onClick={handleCtaClick}
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-500 focus:ring-offset-2"
            aria-label={ctaText}
          >
            {ctaText}
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -10 }}
        transition={{
          duration: 0.8,
          delay: 1,
          repeat: Infinity,
          repeatType: 'reverse',
          repeatDelay: 0.5,
        }}
        aria-label="Scroll down indicator"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </motion.div>
    </motion.section>
  );
};

export default HeroSection;
