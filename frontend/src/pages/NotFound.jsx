import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'

export default function NotFound() {
  return (
    <>
      <Helmet><title>Page Not Found — AgroMart</title></Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="text-8xl mb-6">🌾</div>
          <h1 className="font-heading text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Oops! Look like you're lost in the fields.
          </h1>
          <p className="text-gray-500 text-lg mb-8">
            We couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn btn-primary btn-lg shadow-green">
              ← Back to Home
            </Link>
            <Link to="/products" className="btn btn-outline btn-lg">
              Browse Products
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  )
}
