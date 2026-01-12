import { Hero } from "../sections/Hero";
import { FeaturedProducts } from "../sections/FeaturedProducts";

export function Home() {

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <Hero />
        <FeaturedProducts />
      </main>
    </div>
  );
}