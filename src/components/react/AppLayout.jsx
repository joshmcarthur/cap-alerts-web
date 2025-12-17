import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  Filter,
  Map as MapIcon,
  List as ListIcon,
} from "lucide-react";
import clsx from "clsx";
import { motion } from "framer-motion";

export default function AppLayout({
  children,
  sidebar,
  detailsPanel,
  isSidebarOpen,
  onToggleSidebar,
  onCloseDetails,
  floatingControls,
}) {
  const [isDesktop, setIsDesktop] = useState(true);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.matchMedia("(min-width: 768px)").matches);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const sidebarVariants = {
    open: isDesktop ? { x: 0, y: 0 } : { x: 0, y: 0 },
    closed: isDesktop ? { x: "-100%", y: 0 } : { x: 0, y: "calc(100% - 60px)" },
  };

  const handleDragEnd = (event, info) => {
    if (isDesktop) return;

    const threshold = 50; // Reduced threshold for easier toggle
    // If dragging down (positive y) and open -> close
    if (info.offset.y > threshold && isSidebarOpen) {
      onToggleSidebar();
    }
    // If dragging up (negative y) and closed -> open
    else if (info.offset.y < -threshold && !isSidebarOpen) {
      onToggleSidebar();
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Full Screen Map Background */}
      <div className="absolute inset-0 z-0">{children}</div>

      {/* Floating Controls Layer (Z-20) - Above Sidebar */}
      {floatingControls && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {floatingControls}
        </div>
      )}

      {/* Floating Header/Controls (Mobile) */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center md:hidden pointer-events-none">
        <div className="glass rounded-full p-1 pointer-events-auto shadow-lg">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors"
            aria-label="Toggle Menu"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Sidebar: Blended on Desktop, Bottom Sheet on Mobile */}
      <motion.aside
        ref={sidebarRef}
        initial={false}
        animate={isSidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        drag={!isDesktop && "y"}
        dragConstraints={{ top: -2000, bottom: 0 }}
        dragElastic={0.1}
        dragMomentum={false}
        whileDrag={{
          transition: { duration: 0 },
          // Override animation during drag to allow free movement
        }}
        onDragEnd={handleDragEnd}
        className={clsx(
          "absolute z-10 glass",
          // Desktop Styles: Attached to left, full height
          "md:top-0 md:left-0 md:bottom-0 md:w-96 md:border-r md:shadow-xl",
          // Mobile Styles: Bottom Sheet - tall enough to only leave close button visible with padding
          "inset-x-0 bottom-0 top-20 rounded-t-2xl border-t shadow-2xl",
        )}
      >
        {/* Drag Handle (Mobile only) */}
        <div className="w-full h-6 flex items-center justify-center md:hidden cursor-grab active:cursor-grabbing touch-none pointer-events-auto">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
        </div>

        {/* Sidebar Content */}
        <div className="h-full w-full overflow-hidden flex flex-col">
          {sidebar}
        </div>
      </motion.aside>

      {/* Details Panel */}
      {detailsPanel && (
        <div
          className={clsx(
            "absolute z-30 transition-all duration-300",
            // Mobile: Full screen overlay
            "inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4",
            // Desktop: Right side panel positioning
            "md:inset-y-0 md:right-0 md:left-auto md:w-96 md:block md:p-0 md:bg-transparent md:backdrop-blur-none",
          )}
          onClick={(e) => {
            if (e.target === e.currentTarget && onCloseDetails) {
              onCloseDetails();
            }
          }}
        >
          <div
            className={clsx(
              "w-full overflow-hidden flex flex-col",
              // Mobile Card
              "max-w-2xl max-h-[90vh] glass rounded-2xl shadow-2xl",
              // Desktop Panel Content
              "md:w-full md:h-full md:max-w-none md:max-h-none md:rounded-none md:shadow-xl md:bg-white md:dark:bg-slate-900 md:border-l",
            )}
          >
            {detailsPanel}
          </div>
        </div>
      )}
    </div>
  );
}
