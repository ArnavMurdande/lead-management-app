import { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let mouseMoved = false;

    // Configuration parameters
    const pointer = {
      x: 0.5 * window.innerWidth,
      y: 0.5 * window.innerHeight,
    };
    
    const params = {
      pointsNumber: 20, // Reduced from 40 to shorten the tail
      widthFactor: 0.6,
      mouseThreshold: 0.6,
      spring: 0.4,
      friction: 0.5
    };

    // Initialize trail
    const trail = new Array(params.pointsNumber).fill(null).map(() => ({
      x: pointer.x,
      y: pointer.y,
      dx: 0,
      dy: 0,
    }));

    // Event Handlers
    const updateMousePosition = (eX, eY) => {
      pointer.x = eX;
      pointer.y = eY;
    };

    const handleMouseMove = (e) => {
      mouseMoved = true;
      // Use clientX/Y for fixed canvas to handle scrolling correctly
      updateMousePosition(e.clientX, e.clientY);
    };

    const handleTouchMove = (e) => {
      mouseMoved = true;
      const touch = e.targetTouches[0];
      updateMousePosition(touch.clientX, touch.clientY);
    };

    const handleTouchStart = (e) => {
      mouseMoved = true;
      const touch = e.targetTouches[0];
      updateMousePosition(touch.clientX, touch.clientY);
    };

    const handleClick = (e) => {
      updateMousePosition(e.clientX, e.clientY);
    };

    const setupCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Animation Loop
    const update = (t) => {

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#ffffff'; // Set cursor color to white
      
      trail.forEach((p, pIdx) => {
        const prev = pIdx === 0 ? pointer : trail[pIdx - 1];
        const spring = pIdx === 0 ? 0.4 * params.spring : params.spring;
        
        p.dx += (prev.x - p.x) * spring;
        p.dy += (prev.y - p.y) * spring;
        p.dx *= params.friction;
        p.dy *= params.friction;
        
        p.x += p.dx;
        p.y += p.dy;
      });

      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);

      for (let i = 1; i < trail.length - 1; i++) {
        const xc = 0.5 * (trail[i].x + trail[i + 1].x);
        const yc = 0.5 * (trail[i].y + trail[i + 1].y);
        ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
        ctx.lineWidth = params.widthFactor * (params.pointsNumber - i);
        ctx.stroke();
      }
      ctx.lineTo(trail[trail.length - 1].x, trail[trail.length - 1].y);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(update);
    };

    // Attach listeners
    window.addEventListener("click", handleClick);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchstart", handleTouchStart); // Handle initial touch
    window.addEventListener("resize", setupCanvas);

    // Initial setup
    setupCanvas();
    update(0);

    // Cleanup
    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("resize", setupCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none', // Crucial: lets clicks pass through to buttons
        zIndex: 9999 
      }} 
    />
  );
};

export default CustomCursor;