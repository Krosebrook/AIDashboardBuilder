import HeroSection from '@/components/sections/HeroSection';
import Diagrams from '@/components/Diagrams';
import type { DiagramData } from '@/types/components';

export default function Home() {
  // Sample data for diagrams
  const flowchartData: DiagramData = {
    nodes: [
      { id: '1', label: 'Start', position: { x: 50, y: 50 } },
      { id: '2', label: 'Process', position: { x: 250, y: 50 } },
      { id: '3', label: 'End', position: { x: 450, y: 50 } },
    ],
    edges: [
      { id: 'e1', source: '1', target: '2', label: 'Input' },
      { id: 'e2', source: '2', target: '3', label: 'Output' },
    ],
  };

  const architectureData: DiagramData = {
    nodes: [
      { id: '1', label: 'React UI', type: 'frontend' },
      { id: '2', label: 'Next.js', type: 'frontend' },
      { id: '3', label: 'API Gateway', type: 'api' },
      { id: '4', label: 'AI Service', type: 'api' },
      { id: '5', label: 'Database', type: 'data' },
      { id: '6', label: 'Cache', type: 'data' },
    ],
    edges: [
      { id: 'e1', source: '1', target: '3' },
      { id: 'e2', source: '2', target: '3' },
      { id: 'e3', source: '3', target: '4' },
      { id: 'e4', source: '4', target: '5' },
      { id: 'e5', source: '4', target: '6' },
    ],
  };

  return (
    <main className="min-h-screen">
      <HeroSection
        title="AI Dashboard Builder"
        subtitle="Production-grade AI orchestration with GPU acceleration, streaming, and intelligent caching"
        ctaText="Get Started"
        ctaHref="#features"
        enableParallax={true}
      />

      <section id="features" className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">
          System Architecture
        </h2>
        
        <div className="mb-16">
          <h3 className="text-2xl font-semibold mb-6">Process Flow</h3>
          <Diagrams
            type="flowchart"
            data={flowchartData}
            lazyLoad={true}
          />
        </div>

        <div className="mb-16">
          <h3 className="text-2xl font-semibold mb-6">Architecture Overview</h3>
          <Diagrams
            type="architecture"
            data={architectureData}
            lazyLoad={true}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4 text-primary-600">
              🚀 GPU Acceleration
            </h3>
            <p className="text-gray-700">
              Leverage vLLM and Triton for high-performance inference with GPU optimization.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4 text-primary-600">
              💨 Streaming Responses
            </h3>
            <p className="text-gray-700">
              Real-time streaming support for both Claude and OpenAI models with efficient token handling.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4 text-primary-600">
              🧠 Intelligent Caching
            </h3>
            <p className="text-gray-700">
              Redis and LRU-based caching with TTL management for optimal performance.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4 text-primary-600">
              🔄 Auto Retry & Fallback
            </h3>
            <p className="text-gray-700">
              Exponential backoff with automatic fallback to secondary models on failures.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4 text-primary-600">
              🔒 Enterprise Security
            </h3>
            <p className="text-gray-700">
              Input sanitization, prompt injection prevention, and OWASP compliance.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4 text-primary-600">
              📊 Usage Tracking
            </h3>
            <p className="text-gray-700">
              Comprehensive token counting, cost estimation, and performance metrics.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
