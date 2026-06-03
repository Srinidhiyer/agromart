import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFeaturedProducts, fetchCategories } from '../../store/productSlice'
import ProductCard from '../../components/ui/ProductCard'
import ProductCardSkeleton from '../../components/ui/ProductCardSkeleton'
import StoreMapSection from '../../components/location/StoreMapSection'

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }
const stagger = { visible: { transition: { staggerChildren: 0.1 } } }

// ─── Hero Section ────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 hero-pattern">
      {/* Background decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-700/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="text-center lg:text-left"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-primary-800/60 border border-primary-600/40 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-300 text-sm font-medium">⚡ 2-3 Hour Doorstep Delivery</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6"
          >
            Farm Supplies,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-accent-300">
              Delivered Fast
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8 max-w-xl lg:max-w-none">
            India's most trusted platform for premium organic manures, agricultural pesticides, 
            and bio-fertilizers. Verified quality, transparent pricing, and lightning-fast delivery 
            to your farm.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link to="/products" id="hero-shop-btn" className="btn btn-primary btn-xl shadow-green animate-pulse-green">
              🛒 Shop Now
            </Link>
            <Link to="/products?category=organic-manure" className="btn border-2 border-white/30 text-white hover:bg-white/10 btn-xl backdrop-blur-sm">
              🌱 Organic Manure
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={fadeUp} className="flex items-center gap-6 mt-10 justify-center lg:justify-start">
            {[
              { value: '10,000+', label: 'Happy Farmers' },
              { value: '500+', label: 'Products' },
              { value: '50+', label: 'Cities' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading font-bold text-2xl text-white">{stat.value}</p>
                <p className="text-gray-400 text-xs">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right — Hero Image Cards */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:block relative"
        >
          <div className="grid grid-cols-2 gap-4">
            {[
              { img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80', label: 'Vermicompost', price: '₹399/5kg', badge: '🌱 Organic' },
              { img: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&q=80', label: 'Cow Manure', price: '₹249/10kg', badge: '⚡ Fast Delivery' },
              { img: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&q=80', label: 'Bio-Fertilizer', price: '₹549/pack', badge: '🔬 Bio-Certified' },
              { img: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&q=80', label: 'Crop Protector', price: '₹320/L', badge: '🛡️ Certified' },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="card overflow-hidden group cursor-pointer"
              >
                <div className="relative h-40 overflow-hidden">
                  <img src={card.img} alt={card.label} className="product-img" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute top-2 left-2 badge badge-green text-xs">{card.badge}</span>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{card.label}</p>
                  <p className="text-primary-600 dark:text-primary-400 text-sm font-bold">{card.price}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Floating delivery pill */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 glass rounded-full px-5 py-3 flex items-center gap-3 shadow-xl border border-white/20"
          >
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-base">🚴</div>
            <div>
              <p className="text-white text-sm font-semibold">Delivery Partner Nearby</p>
              <p className="text-green-400 text-xs">Estimated arrival: 45 mins</p>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </motion.div>
        </motion.div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80L60 68C120 56 240 32 360 24C480 16 600 24 720 32C840 40 960 48 1080 44C1200 40 1320 24 1380 16L1440 8V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
            className="fill-white dark:fill-dark" />
        </svg>
      </div>
    </section>
  )
}

// ─── Categories Section ───────────────────────────────────────────────────────
function CategoriesSection({ categories }) {
  const displayCategories = [
    { name: 'Organic Manure', icon: '🌱', slug: 'organic-manure', color: 'from-green-500 to-emerald-600', count: '120+ Products' },
    { name: 'Pesticides', icon: '🛡️', slug: 'agricultural-pesticides', color: 'from-blue-500 to-blue-700', count: '80+ Products' },
    { name: 'Vermicompost', icon: '🪱', slug: 'vermicompost', color: 'from-amber-500 to-orange-600', count: '30+ Products' },
    { name: 'Bio-Fertilizers', icon: '🔬', slug: 'bio-fertilizers', color: 'from-purple-500 to-violet-700', count: '25+ Products' },
    { name: 'Insecticides', icon: '🐛', slug: 'insecticides', color: 'from-red-500 to-rose-600', count: '40+ Products' },
    { name: 'Fungicides', icon: '🍄', slug: 'fungicides', color: 'from-teal-500 to-cyan-600', count: '20+ Products' },
  ]

  return (
    <section className="py-20 bg-white dark:bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-12"
        >
          <motion.h2 variants={fadeUp} className="section-title">Shop by Category</motion.h2>
          <motion.p variants={fadeUp} className="section-subtitle mx-auto">
            Everything your farm needs, organized for quick access
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {displayCategories.map((cat, i) => (
            <motion.div key={cat.slug} variants={fadeUp}>
              <Link
                to={`/products?category=${cat.slug}`}
                id={`category-${cat.slug}`}
                className="group block"
              >
                <div className={`bg-gradient-to-br ${cat.color} rounded-2xl p-6 text-center text-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2`}>
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {cat.icon}
                  </div>
                  <p className="font-semibold text-sm">{cat.name}</p>
                  <p className="text-white/70 text-xs mt-1">{cat.count}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Featured Products ─────────────────────────────────────────────────────────
function FeaturedSection({ products, loading }) {
  return (
    <section className="py-20 bg-gray-50 dark:bg-dark-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4"
        >
          <div>
            <motion.h2 variants={fadeUp} className="section-title">Featured Products</motion.h2>
            <motion.p variants={fadeUp} className="section-subtitle">
              Top-rated products loved by thousands of farmers
            </motion.p>
          </div>
          <motion.div variants={fadeUp}>
            <Link to="/products?featured=true" className="btn btn-outline btn-md">
              View All →
            </Link>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array(4).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.slice(0, 4).map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))
          }
        </div>
      </div>
    </section>
  )
}

// ─── Benefits Section ─────────────────────────────────────────────────────────
function BenefitsSection() {
  const benefits = [
    {
      icon: '🌿',
      title: 'Certified Organic',
      desc: 'All organic products are certified by recognized bodies. No harmful chemicals, guaranteed.',
      color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    },
    {
      icon: '⚡',
      title: '2-3 Hour Delivery',
      desc: 'Lightning-fast doorstep delivery from nearby warehouses. No more waiting for your farm supplies.',
      color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    },
    {
      icon: '🔬',
      title: 'Lab Tested Quality',
      desc: 'Every product batch is lab-tested for purity, composition, and efficacy before dispatch.',
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    },
    {
      icon: '💰',
      title: 'Best Prices',
      desc: 'Direct-from-manufacturer pricing means you save more. No middlemen, no hidden costs.',
      color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    },
    {
      icon: '📞',
      title: '24/7 Expert Support',
      desc: 'Our agriculture experts are available round the clock to guide you with the right products.',
      color: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
    },
    {
      icon: '♻️',
      title: 'Eco-Friendly Packaging',
      desc: 'We use biodegradable and recyclable packaging to reduce our environmental footprint.',
      color: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',
    },
  ]

  return (
    <section className="py-20 bg-white dark:bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-14"
        >
          <motion.p variants={fadeUp} className="text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-widest text-sm mb-2">
            Why Choose AgroMart
          </motion.p>
          <motion.h2 variants={fadeUp} className="section-title">
            The Smart Way to Farm
          </motion.h2>
          <motion.p variants={fadeUp} className="section-subtitle mx-auto">
            We're committed to empowering Indian farmers with quality products and knowledge
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className={`${b.color} border rounded-2xl p-6 transition-shadow duration-300 hover:shadow-md`}
            >
              <div className="text-4xl mb-4">{b.icon}</div>
              <h3 className="font-heading font-semibold text-gray-900 dark:text-white text-lg mb-2">{b.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Delivery Section ─────────────────────────────────────────────────────────
function DeliverySection() {
  const steps = [
    { icon: '📱', title: 'Browse & Order', desc: 'Choose from 500+ verified products and place your order in seconds.' },
    { icon: '✅', title: 'Instant Confirmation', desc: 'Get SMS and email confirmation with a unique order ID instantly.' },
    { icon: '🚴', title: 'Out for Delivery', desc: 'Our delivery partner picks up your order and heads your way.' },
    { icon: '🏡', title: 'Delivered at Door', desc: 'Your order arrives fresh and safe, right at your doorstep.' },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-primary-900 to-primary-800 hero-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-14"
        >
          <motion.h2 variants={fadeUp} className="section-title text-white">
            How Delivery Works
          </motion.h2>
          <motion.p variants={fadeUp} className="text-green-200 text-lg mt-3 max-w-2xl mx-auto">
            From order to delivery in just a few hours — it's that simple
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {steps.map((step, i) => (
            <motion.div key={step.title} variants={fadeUp} className="relative">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center text-white h-full">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 shadow-green">
                  {step.icon}
                </div>
                <div className="absolute -top-3 -right-3 w-7 h-7 bg-accent-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
                  {i + 1}
                </div>
                <h3 className="font-heading font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-green-200 text-sm leading-relaxed">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 text-white/30 text-xl">→</div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Delivery cities */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-12 text-center"
        >
          <p className="text-green-300 text-sm mb-4">Available in 50+ cities across India</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'].map((city) => (
              <span key={city} className="bg-white/10 border border-white/20 text-white text-sm px-4 py-1.5 rounded-full">
                {city}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Ramesh Patel',
      location: 'Ahmedabad, Gujarat',
      avatar: 'https://ui-avatars.com/api/?name=Ramesh+Patel&background=16a34a&color=fff',
      rating: 5,
      text: 'AgroMart has transformed how I buy farm supplies. The vermicompost quality is exceptional and delivery was within 2 hours. My wheat yield increased by 30% this season!',
      crop: 'Wheat & Cotton Farmer',
    },
    {
      name: 'Sunita Devi',
      location: 'Ludhiana, Punjab',
      avatar: 'https://ui-avatars.com/api/?name=Sunita+Devi&background=15803d&color=fff',
      rating: 5,
      text: 'The bio-pesticides from AgroMart are completely safe for my vegetable garden. No harmful residues and my crops are pest-free. Love the easy app interface!',
      crop: 'Vegetable Farmer',
    },
    {
      name: 'Vijay Kumar',
      location: 'Nashik, Maharashtra',
      avatar: 'https://ui-avatars.com/api/?name=Vijay+Kumar&background=166534&color=fff',
      rating: 5,
      text: 'Excellent customer service and genuine products. I ordered Mancozeb fungicide and it worked brilliantly against leaf blight. Will definitely recommend to fellow farmers.',
      crop: 'Grape & Onion Farmer',
    },
    {
      name: 'Meena Krishnan',
      location: 'Coimbatore, Tamil Nadu',
      avatar: 'https://ui-avatars.com/api/?name=Meena+Krishnan&background=14532d&color=fff',
      rating: 4,
      text: 'Amazing platform for organic farming. The bio-fertilizer starter kit was exactly what I needed for my paddy fields. Prices are much better than local shops.',
      crop: 'Paddy & Coconut Farmer',
    },
  ]

  return (
    <section className="py-20 bg-gray-50 dark:bg-dark-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-12"
        >
          <motion.h2 variants={fadeUp} className="section-title">What Farmers Say</motion.h2>
          <motion.p variants={fadeUp} className="section-subtitle mx-auto">
            Real reviews from real farmers across India
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="card p-6 flex flex-col gap-4"
            >
              {/* Stars */}
              <div className="flex">
                {Array(5).fill(0).map((_, j) => (
                  <svg key={j} viewBox="0 0 24 24" className={`w-4 h-4 ${j < t.rating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'} fill-current`}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex-1">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-dark-border">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{t.name}</p>
                  <p className="text-xs text-primary-600 dark:text-primary-400">{t.crop}</p>
                  <p className="text-xs text-gray-500">{t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── CTA Banner ────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-20 bg-white dark:bg-dark">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-10 md:p-16 text-center overflow-hidden hero-pattern shadow-2xl"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full" />
          </div>

          <div className="relative z-10">
            <p className="text-green-200 font-semibold uppercase tracking-widest text-sm mb-3">
              🌾 Limited Time Offer
            </p>
            <h2 className="font-heading font-bold text-4xl md:text-5xl text-white mb-4">
              Get 20% Off Your First Order
            </h2>
            <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
              Register now and use code <strong className="bg-white/20 px-2 py-0.5 rounded font-mono">AGRO20</strong> at checkout to unlock exclusive savings on all products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" id="cta-register-btn" className="btn bg-white text-primary-700 hover:bg-gray-100 btn-xl font-bold shadow-xl">
                🚀 Start Shopping
              </Link>
              <Link to="/products" className="btn border-2 border-white/40 text-white hover:bg-white/10 btn-xl">
                Browse Products
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Main Home Page ───────────────────────────────────────────────────────────
export default function Home() {
  const dispatch = useDispatch()
  const { featuredProducts, categories, loading } = useSelector((s) => s.products)

  useEffect(() => {
    dispatch(fetchFeaturedProducts())
    dispatch(fetchCategories())
  }, [dispatch])

  return (
    <>
      <Helmet>
        <title>AgroMart — Premium Agriculture Supplies Delivered Fast</title>
        <meta name="description" content="Shop verified organic manures, pesticides, and bio-fertilizers online. 2-3 hour door-to-door delivery across India." />
      </Helmet>

      <HeroSection />
      <CategoriesSection categories={categories} />
      <FeaturedSection products={featuredProducts} loading={loading} />
      <BenefitsSection />
      <StoreMapSection />
      <DeliverySection />
      <TestimonialsSection />
      <CTASection />
    </>
  )
}
