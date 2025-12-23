import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollProgress.css';

gsap.registerPlugin(ScrollTrigger);

const ScrollProgress = () => {
    const trackRef = useRef(null);
    const thumbRef = useRef(null);
    const location = useLocation(); // Hook to track route changes

    useEffect(() => {
        let ctx;
        let resizeObserver;

        // Small delay to ensure the new page DOM is rendered before calculating height
        const timer = setTimeout(() => {
            const thumb = thumbRef.current;
            
            // Clean up any old triggers to prevent conflicts
            ScrollTrigger.getAll().forEach(t => t.kill());

            ctx = gsap.context(() => {
                gsap.fromTo(thumb, 
                    { height: '0%' }, 
                    {
                        height: '100%',
                        ease: 'none',
                        scrollTrigger: {
                            trigger: document.documentElement, // Targets the whole page
                            start: 'top top',
                            end: 'bottom bottom',
                            scrub: 0.5, // Smooth scrubbing effect
                            invalidateOnRefresh: true, // Recalculate values on resize/refresh
                        },
                    }
                );
            });

            // Force a refresh to calculate correct start/end points immediately
            ScrollTrigger.refresh();

            // Watch for body height changes (e.g., when data loads or accordions open)
            resizeObserver = new ResizeObserver(() => {
                ScrollTrigger.refresh();
            });
            resizeObserver.observe(document.body);

        }, 100); // 100ms delay matches typical React render cycles

        // Cleanup function
        return () => {
            clearTimeout(timer);
            if (ctx) ctx.revert();
            if (resizeObserver) resizeObserver.disconnect();
        };
    }, [location.pathname]); // Re-run this effect whenever the URL path changes

    return (
        <div ref={trackRef} className="scroll-track">
            <div ref={thumbRef} className="scroll-thumb"></div>
        </div>
    );
};

export default ScrollProgress;