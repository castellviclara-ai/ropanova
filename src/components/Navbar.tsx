import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Logo } from "./Logo";

export function Navbar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const onAdmin = path.startsWith("/admin");
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="z-40"
    >
      <div className="px-6 py-6">
        <div className="flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link to="/">
              <Logo />
            </Link>
          </motion.div>
          <nav className="flex items-center gap-6 text-[11px] uppercase tracking-[0.25em] text-white/50">
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to="/"
                className="relative px-4 py-2 transition-colors duration-300 hover:text-white/90 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-white/50 after:transition-all hover:after:w-full"
              >
                Rastrear
              </Link>
            </motion.div>
            <AnimatePresence mode="wait">
              {onAdmin ? (
                <motion.div
                  key="panel"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -2 }}
                >
                  <Link
                    to="/admin"
                    className="relative px-4 py-2 transition-colors duration-300 hover:text-white/90 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-white/50 after:transition-all hover:after:w-full"
                  >
                    Panel
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -2 }}
                >
                  <Link
                    to="/admin/login"
                    className="relative px-5 py-2 transition-colors duration-300 hover:text-white/90 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-white/50 after:transition-all hover:after:w-full"
                  >
                    Admin
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>
        </div>
      </div>
    </motion.header>
  );
}
