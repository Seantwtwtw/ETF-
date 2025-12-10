import React, { useState, useRef, useEffect } from 'react';
import { Mail, ArrowRight, LineChart, Lock, Loader2, Sparkles } from 'lucide-react';

interface Props {
  onRegister: (email: string) => void;
}

const RegistrationPage: React.FC<Props> = ({ onRegister }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs
  const divRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Spotlight State
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  // Spotlight Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  // Form Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !email.includes('@')) {
      setError('請輸入有效的電子郵件地址。');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      onRegister(email);
      setIsLoading(false);
    }, 1500);
  };

  // --- Canvas Particle Animation Effect (Enhanced Mode) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    // Mouse interaction tracking
    const mouse = { x: -9999, y: -9999 };

    const handleWindowResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      initParticles();
    };

    const handleWindowMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('mousemove', handleWindowMouseMove);

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      baseSize: number;

      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        // Increased velocity for more dynamic movement
        this.vx = (Math.random() - 0.5) * 1.2; 
        this.vy = (Math.random() - 0.5) * 1.2;
        // Larger particles
        this.baseSize = Math.random() * 2.5 + 1.5; 
        this.size = this.baseSize;
        
        // Brighter, neon colors (Cyan, Blue, Purple)
        const colors = [
            'rgba(6, 182, 212, ',   // Cyan-500
            'rgba(59, 130, 246, ',  // Blue-500
            'rgba(139, 92, 246, ',  // Violet-500
            'rgba(236, 72, 153, '   // Pink-500 (Accessory)
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;

        // Mouse interaction (Stronger repulsion/attraction mix)
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Grow when near mouse
        if (distance < 200) {
            this.size = this.baseSize + (200 - distance) * 0.03;
        } else {
            this.size = this.baseSize;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        // Higher opacity for visibility
        ctx.fillStyle = this.color + '0.8)'; 
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      // Increase density slightly
      const particleCount = Math.min(Math.floor((w * h) / 9000), 130); 
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      
      // Critical: Additive blending makes overlapping particles glow
      ctx.globalCompositeOperation = 'lighter';

      // Draw Particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw Connections
      particles.forEach((a, index) => {
        // Connect to other particles
        for (let j = index + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Increased connection distance and opacity
          if (dist < 140) {
            ctx.beginPath();
            // Cyan/Blue mix for lines
            const alpha = (1 - dist / 140) * 0.4; // Max opacity 0.4
            ctx.strokeStyle = `rgba(100, 200, 255, ${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        
        // Connect to mouse (Strong Interaction)
        const dx = a.x - mouse.x;
        const dy = a.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 250) {
            ctx.beginPath();
            const alpha = (1 - dist / 250) * 0.8; // Very strong connection to mouse
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
            ctx.lineWidth = 1.5;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('mousemove', handleWindowMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* --- Dynamic Canvas Background --- */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 opacity-100 pointer-events-none"
      />
      
      {/* Background Gradient overlay for depth (Subtler now to let particles shine) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/40 pointer-events-none"></div>

      {/* --- Main Card Container with Spotlight --- */}
      <div 
        ref={divRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="max-w-md w-full relative z-10 group"
      >
        {/* Spotlight Border Glow */}
        <div 
          className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300"
          style={{
            opacity,
            background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(59, 130, 246, 0.5), transparent 40%)`
          }}
        />

        {/* The Card Content */}
        <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl overflow-hidden ring-1 ring-white/10">
          
          {/* Decorative Top Highlight */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-70"></div>

          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-slate-800/40 rounded-2xl mb-4 shadow-[0_0_25px_rgba(59,130,246,0.3)] ring-1 ring-slate-600/50 relative group-hover:scale-110 transition-transform duration-500">
              <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <LineChart className="text-blue-400 w-10 h-10 relative z-10 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            </div>
            
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2 drop-shadow-lg">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-400">
                QuantBacktest
              </span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 font-extrabold animate-pulse drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                Pro
              </span>
            </h1>
            
            <div className="flex items-center justify-center gap-2 text-slate-300 text-sm mt-3 font-medium">
              <Sparkles size={14} className="text-yellow-400 animate-spin-slow" />
              <span>次世代量化回測引擎</span>
              <Sparkles size={14} className="text-yellow-400 animate-spin-slow" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-20">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold text-cyan-300 ml-1 block uppercase tracking-wider shadow-black drop-shadow-md">
                Access ID / Email
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within/input:text-cyan-400 transition-colors duration-300" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3.5 bg-slate-950/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 
                             focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:bg-slate-900/90
                             transition-all duration-300 backdrop-blur-md shadow-inner"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
                {/* Glow under input */}
                <div className="absolute inset-0 rounded-xl bg-cyan-500/10 opacity-0 group-focus-within/input:opacity-100 pointer-events-none transition-opacity duration-500 blur-sm"></div>
              </div>
              {error && (
                <p className="text-red-400 text-xs mt-2 ml-1 flex items-center gap-1 animate-bounce font-bold">
                  <Lock size={12} /> {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-4 relative overflow-hidden group/btn rounded-xl font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-300 transform 
                ${isLoading 
                  ? 'bg-slate-800 cursor-wait' 
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] hover:bg-right hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:scale-[1.02]'}`
              }
            >
              {/* Button Shine Effect */}
              {!isLoading && (
                <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>
              )}

              <div className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin text-cyan-300" />
                    <span className="text-cyan-100">建立安全連線中...</span>
                  </>
                ) : (
                  <>
                    啟動儀表板 <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity cursor-default">
              Quantitative Analysis System v2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;