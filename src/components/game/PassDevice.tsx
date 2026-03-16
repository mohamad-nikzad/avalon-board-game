import { motion } from "framer-motion";

interface PassDeviceProps {
  playerName: string;
  onConfirm: () => void;
  subtitle?: string;
}

export function PassDevice({ playerName, onConfirm, subtitle }: PassDeviceProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-6 z-50 px-6"
    >
      <p className="text-label text-muted-foreground">PASS DEVICE TO</p>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
        className="text-display text-4xl text-center"
      >
        {playerName}
      </motion.h1>
      {subtitle && <p className="text-status">{subtitle}</p>}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={onConfirm}
        className="btn-primary mt-8"
      >
        I AM {playerName.toUpperCase()}
      </motion.button>
    </motion.div>
  );
}
