"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";

export function HeroSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex min-h-[500px] flex-col items-center justify-center px-4 py-16 text-center"
    >
      <motion.h1
        variants={itemVariants}
        className="pt-36 mb-6 text-6xl font-bold tracking-tight md:text-7xl"
      >
        Ai Destekli Tasarım Akışları
        <br />
        <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Yönetim Sistemi
        </span>
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="mb-8 max-w-2xl text-lg text-[var(--foreground)]/70"
      >
        Tasarım taleplerini yönetin, AI önerileriyle iş akışınızı hızlandırın, <br /> ekibinizle kusursuz iş birliği yapın.
      </motion.p>

      <motion.div variants={itemVariants} className="flex gap-4">
        <Link href="/signup">
          <span className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-white transition-opacity hover:opacity-90">
            Hemen Başla
          </span>
        </Link>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mt-12 flex items-center justify-center gap-8 text-sm text-[var(--foreground)]/60 flex-wrap"
      >
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--foreground)]">
            1k+
          </div>
          <div>Kullanıcı</div>
        </div>
        <div className="hidden sm:block h-8 w-px bg-[var(--border)]" />
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--foreground)]">50+</div>
          <div>Tasarım Aracı</div>
        </div>
        <div className="hidden sm:block h-8 w-px bg-[var(--border)]" />
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--foreground)]">
            %100
          </div>
          <div>Güvenli</div>
        </div>
      </motion.div>
    </motion.div>
  );
}
