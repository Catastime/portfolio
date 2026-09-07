import Dither from '@/components/Dither'

function App() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="fixed inset-0 z-0">
        <Dither
          waveColor={[0.5, 0.5, 0.5]}
          backgroundColor={[0, 0, 0]}
          disableAnimation={false}
          enableMouseInteraction={true}
          mouseRadius={0.3}
          colorNum={4}
          waveAmplitude={0.3}
          waveFrequency={3}
          waveSpeed={0.05}
        />
      </div>

      <main className="pointer-events-none relative z-10 flex min-h-screen w-full items-center justify-center">
        <div className="pointer-events-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Portfolio</h1>
          <p className="mt-4 text-base text-neutral-400 sm:text-lg">
            Clean slate. Ready for components.
          </p>
        </div>
      </main>
    </div>
  )
}

export default App
