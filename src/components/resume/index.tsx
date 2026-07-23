'use client';

import HeaderBlock from './header-block';
import WorkExperience from './work-experience';
import Education from './education';
import TechnicalSkills from './technical-skills';

export default function Resume() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 pb-20 pt-32 sm:px-8 lg:px-20">
      <HeaderBlock />

      {/* Separator */}
      {/* <div className="my-10 border-t border-neutral-500/20" /> */}
      <WorkExperience />

      {/* Separator */}
      {/* <div className="my-10 border-t border-neutral-500/20" /> */}
      <Education />

      {/* Separator */}
      {/* <div className="my-10 border-t border-neutral-500/20" /> */}
      <TechnicalSkills />
    </div>
  );
}
