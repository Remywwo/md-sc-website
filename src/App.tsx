import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { DemoReact } from './components/DemoReact';
import { Footer } from './components/Footer';

export function App() {
  return (
    <main className="website">
      <Nav />
      <Hero />
      <Features />
      <DemoReact />
      <Footer />
    </main>
  );
}
