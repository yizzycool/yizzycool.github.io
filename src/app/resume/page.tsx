import GlimmerBackground from '@/components/common/glimmer-background';
import GlimmerBackgroundConfigs from '@/data/glimmer-background-config/resume';
import Resume from '@/components/resume';

export default function ResumePage() {
  return (
    <>
      <GlimmerBackground configs={GlimmerBackgroundConfigs} />
      <Resume />
    </>
  );
}
