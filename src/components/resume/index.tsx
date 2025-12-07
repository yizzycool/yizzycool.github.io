'use client';

import GradientBackground from './components/gradient-background';
import HeaderBlock from './components/header-block';
import WorkExperience from './components/work-experience';
import Education from './components/education';

export default function Resume() {
  return (
    <div className="px-4 pb-20 pt-32 sm:px-8 lg:px-20">
      <GradientBackground />
      <HeaderBlock />

      {/* Separator */}
      <div className="my-20 border-t border-neutral-500/30" />
      <WorkExperience />

      {/* Separator */}
      <div className="my-20 border-t border-transparent" />
      <Education />
    </div>
  );
}
