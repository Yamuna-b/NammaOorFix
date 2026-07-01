import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="landing min-h-screen bg-gradient-to-br from-red-500 via-orange-400 to-yellow-300 text-white relative overflow-hidden">
      {/* Animated Background Circles */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse" />

      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 relative z-10">
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-extrabold tracking-wide drop-shadow-lg"
        >
          NammaOorFix
        </motion.h1>
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-x-4"
        >
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg bg-white text-red-600 font-semibold hover:bg-gray-100 shadow-md transition"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-lg bg-red-700 text-white font-semibold hover:bg-red-800 shadow-md transition"
          >
            Sign Up
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center mt-20 text-center px-4 relative z-10">
        <motion.h2
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg"
        >
          Report. Resolve. Connect.
        </motion.h2>
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-xl max-w-2xl mb-10"
        >
          Join your community in making your neighborhood better. Report issues,
          follow others, and track progress together.
        </motion.p>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link
            to="/register"
            className="px-8 py-3 rounded-full bg-white text-red-600 font-bold text-lg shadow-lg hover:shadow-2xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-300"
          >
            Get Started
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-32 px-4 pb-20 relative z-10">
        {[
          {
            icon: "📍",
            title: "Location-Based Reporting",
            text: "Pinpoint issues on an interactive map and help authorities respond faster.",
            color: "from-red-500 to-pink-500",
          },
          {
            icon: "👥",
            title: "Community Building",
            text: "Follow other active citizens and build a network of community advocates.",
            color: "from-blue-500 to-purple-500",
          },
          {
            icon: "📊",
            title: "Track Progress",
            text: "Monitor the status of reported issues and celebrate community victories.",
            color: "from-green-500 to-teal-500",
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            viewport={{ once: true }}
            className={`p-6 rounded-xl backdrop-blur-md bg-gradient-to-tr ${feature.color} text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300`}
          >
            <div className="text-5xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-white/90">{feature.text}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
