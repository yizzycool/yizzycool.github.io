import { type BlogCategoryData } from '@/types/blog/category';

import { cn } from '@/utils/cn';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { map } from 'lodash';

import strapiUtils from '@/utils/strapi-utils';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';

type Props = {
  category: BlogCategoryData;
  onClick?: () => void;
};

export default function CategoryAccordionItem({
  category,
  onClick = () => {},
}: Props) {
  const pathname = usePathname();
  const { getFadeUpClass } = useGetTransitionClass();

  const categoryUrl = strapiUtils.toBlogCategoryUrl(category.slug);
  const articleUrlPrefix = strapiUtils.toBlogCategoryArticleUrl(
    category.slug,
    ''
  );
  const isActive =
    pathname === categoryUrl || pathname.startsWith(articleUrlPrefix);

  const [isOpen, setIsOpen] = useState(isActive);

  // Sync open state with pathname changes to ensure active category is expanded
  useEffect(() => {
    if (!isActive) return;
    setIsOpen(true);
  }, [isActive]);

  const handleCategoryClick = () => setIsOpen((prev) => !prev);

  return (
    <li>
      <h2>
        <button
          className={cn(
            'group mt-1 flex w-full items-center justify-between rounded-md p-2 font-bold',
            'hover:bg-sky-600/10',
            'data-[active=true]:bg-sky-600/10 data-[active-article=true]:text-sky-500',
            getFadeUpClass('animate-delay-150')
          )}
          data-active={pathname === categoryUrl}
          data-active-article={isActive}
          onClick={handleCategoryClick}
        >
          {category.name}
          <ChevronDown
            size={16}
            className={cn(
              'text-neutral-400 transition-transform duration-300',
              isOpen && 'rotate-180'
            )}
          />
        </button>
      </h2>
      <motion.ul
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: 1,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'ml-4 overflow-hidden border-neutral-400/50 pl-1 lg:border-l',
          getFadeUpClass('animate-delay-200')
        )}
      >
        {map(category.articles, (article) => {
          const articleUrl = strapiUtils.toBlogCategoryArticleUrl(
            category.slug,
            article.slug
          );
          return (
            <li key={article.shortTitle}>
              <Link
                className={cn(
                  'my-1 flex cursor-pointer items-center rounded-md p-2 text-sm',
                  'hover:bg-sky-600/10',
                  'data-[active=true]:bg-sky-600/10 data-[active=true]:text-sky-500'
                )}
                href={articleUrl}
                data-active={pathname === articleUrl}
                onClick={onClick}
              >
                {article.shortTitle}
              </Link>
            </li>
          );
        })}
      </motion.ul>
    </li>
  );
}
