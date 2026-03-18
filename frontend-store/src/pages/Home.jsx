import HeroScroll from '../components/animations/HeroScroll';

export default function Home() {
  return (
    <div className="bg-black min-h-screen">
      <HeroScroll />
      
      {/* Feature Highlights Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-black relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="glass p-10 rounded-[3rem] flex flex-col justify-between h-[500px] group transition-all duration-500 hover:bg-white/10">
              <div>
                <span className="text-blue-500 font-semibold mb-4 block">Performance</span>
                <h3 className="text-4xl font-bold tracking-tight">The A17 Pro chip. <br/> A monster win for gaming.</h3>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                A new Pro-class GPU makes iPhone 15 Pro the most powerful gaming device in your pocket.
              </p>
            </div>

            {/* Card 2 */}
            <div className="glass p-10 rounded-[3rem] flex flex-col justify-between h-[500px] border-blue-500/20">
              <div>
                <span className="text-pink-500 font-semibold mb-4 block">Camera</span>
                <h3 className="text-4xl font-bold tracking-tight">A camera that captures your wildest imagination.</h3>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                From even more flexibility to next-generation portraits, see what you can do with our most powerful iPhone camera system.
              </p>
            </div>

            {/* Card 3 - Large Highlight */}
            <div className="md:col-span-2 lg:col-span-1 glass p-10 rounded-[3rem] flex flex-col justify-between h-[500px]">
              <div>
                <span className="text-orange-500 font-semibold mb-4 block">Titanium</span>
                <h3 className="text-4xl font-bold tracking-tight">Forged in titanium. <br/> From the stars to your hands.</h3>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                Using the same alloy used in spacecraft for missions to Mars, iPhone 15 Pro is light, strong, and unmistakably Pro.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-40 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8">
          The iPhone collection.
        </h2>
        <a 
          href="/catalog"
          className="bg-white text-black px-10 py-4 rounded-full font-bold text-xl hover:bg-gray-200 transition-all hover:scale-105"
        >
          Explore All Models
        </a>
      </section>
    </div>
  );
}
