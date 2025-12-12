import GlimmerBackground from '@/components/common/glimmer-background';
import GlimmerBackgroundConfigs from '@/data/glimmer-background-config/home';
import Home from '@/components/home';

export default function HomePage() {
  return (
    <>
      <GlimmerBackground configs={GlimmerBackgroundConfigs} />
      <Home />
    </>
  );
}
