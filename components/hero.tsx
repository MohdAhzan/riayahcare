export default function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 py-20 md:py-32 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-balance">
            World-Class Medical Care, Affordable Prices
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 text-balance">
            Connect with top hospitals and doctors worldwide. Get personalized treatment plans and affordable healthcare
            solutions.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition">
              Get Started
            </button>
            <button className="bg-blue-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-400 transition">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
