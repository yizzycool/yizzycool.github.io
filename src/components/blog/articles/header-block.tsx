'use client';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { cn } from '@/utils/cn';

export default function HeaderBlock() {
  const { getFadeUpClass } = useGetTransitionClass();

  return (
    <div className="text-left">
      <h1
        className={cn(
          'text-3xl font-black tracking-tight text-slate-900 md:text-4xl dark:text-white',
          getFadeUpClass('animate-delay-100')
        )}
      >
        開發筆記
      </h1>
      <p
        className={cn(
          'mt-3 max-w-2xl text-base font-light text-slate-500 sm:text-lg dark:text-slate-400',
          getFadeUpClass('animate-delay-200')
        )}
      >
        整理前端工程、Web API、AI、MarTech 與演算法的原理拆解與實作紀錄。
      </p>
    </div>
  );
}
