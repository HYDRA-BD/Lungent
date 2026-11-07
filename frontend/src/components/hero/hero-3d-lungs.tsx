'use client'

import React from 'react'
import Image from 'next/image'
import { motion, type MotionValue } from 'motion/react'
import { Database, FileText } from 'lucide-react'

interface Hero3DLungsProps {
  parallaxY?: MotionValue<number>
  parallaxOpacity?: MotionValue<number>
}

export function Hero3DLungs({ parallaxY, parallaxOpacity }: Hero3DLungsProps) {
  return (
    <div
      style={{ perspective: 1000 }}
      className="relative w-full max-w-[320px] xl:max-w-[380px] select-none"
    >
      {/* Scroll Parallax Wrapper */}
      <motion.div
        style={{
          y: parallaxY,
          opacity: parallaxOpacity,
        }}
        className="w-full flex items-center justify-start"
      >
        {/* Floating, Entrance & Interactive 3D Tilt Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -15, 0],
          }}
          transition={{
            opacity: { duration: 0.55, ease: 'easeOut' },
            scale: { duration: 0.55, ease: 'easeOut' },
            y: {
              duration: 3.9,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
          whileHover={{
            rotateY: -15,
            rotateX: 10,
            scale: 1.05,
            transition: { duration: 0.25, ease: 'easeOut' },
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative group rounded-3xl border border-white/70 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 p-4 sm:p-5 backdrop-blur-xl shadow-2xl shadow-teal-950/10 dark:shadow-teal-950/30 transition-shadow duration-300 hover:shadow-teal-500/20"
        >
          {/* Ambient Glow */}
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-teal-500/15 via-sky-500/10 to-emerald-500/15 blur-2xl -z-10 group-hover:opacity-100 transition-opacity pointer-events-none" />

          {/* Top Pill / Status Tag */}
          <div className="flex flex-row items-center justify-between gap-2 pb-3 mb-2 border-b border-border/40 w-full">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex size-2 rounded-full bg-teal-500 animate-ping shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider whitespace-nowrap">
                RISK MODEL
              </span>
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 whitespace-nowrap">
              <FileText className="size-3 text-teal-600 dark:text-teal-400 shrink-0" />
              Non-Imaging
            </span>
          </div>

          {/* 3D Rendered Lungs Illustration */}
          <div className="relative w-full aspect-square max-h-[280px] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-teal-50/40 via-sky-50/20 to-transparent dark:from-teal-950/20 dark:via-slate-900/40 dark:to-transparent">
            <Image
              src="/images/3d-lungs.png"
              alt="Human lungs 3D anatomical model"
              width={400}
              height={400}
              priority
              className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-300 pointer-events-none select-none"
            />
          </div>

          {/* Bottom Clinical Metadata */}
          <div className="mt-3 flex flex-row items-center justify-between gap-2 text-xs text-muted-foreground pt-2 border-t border-border/30 w-full">
            <span className="flex items-center gap-1.5 font-medium whitespace-nowrap text-[11px] sm:text-xs">
              <Database className="size-3.5 text-teal-500 shrink-0" />
              BRFSS Dataset
            </span>
            <span className="font-mono text-[10px] sm:text-[11px] text-teal-700 dark:text-teal-300 font-semibold tracking-tight whitespace-nowrap">
              3-Tier Policy
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

