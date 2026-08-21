'use client';

import Giscus from '@giscus/react';

import useDarkModeObserver from '@/hooks/window/use-dark-mode-observer';

export default function Comments() {
  const { isDark } = useDarkModeObserver();

  const giscusTheme = isDark ? 'dark' : 'light';

  return (
    <Giscus
      id="comments"
      repo="yizzycool/blog-comments"
      repoId="R_kgDOT_upiw"
      category="Comments"
      categoryId="DIC_kwDOT_upi84DD4Uc"
      mapping="pathname"
      strict="1"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={giscusTheme}
      lang="zh-TW"
      loading="lazy"
    />
  );
}
