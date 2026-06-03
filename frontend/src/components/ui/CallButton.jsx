import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PHONE_NUMBER = '7019205772' // 👈 Change this to your real number

export default function CallButton() {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* Tooltip card */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl p-4 border border-green-100 min-w-[220px]"
          >
            <p className="text-xs text-gray-500 mb-1">📞 Call us to order</p>
            <p className="text-lg font-bold text-green-700">+91 {PHONE_NUMBER}</p>
            <p className="text-xs text-gray-400 mt-1">Mon–Sat, 8AM – 8PM</p>
            <a
              href={`tel:+91${PHONE_NUMBER}`}
              className="mt-3 block w-full text-center bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-xl transition-all"
            >
              Call Now 📲
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating call button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ boxShadow: ['0 0 0 0 rgba(34,197,94,0.4)', '0 0 0 15px rgba(34,197,94,0)', '0 0 0 0 rgba(34,197,94,0)'] }}
        transition={{ repeat: Infinity, duration: 2 }}
        onClick={() => setShowTooltip(!showTooltip)}
        className="w-16 h-16 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center shadow-xl text-2xl"
        title={`Call: +91 ${PHONE_NUMBER}`}
      >
        📞
      </motion.button>
    </div>
  )
}
