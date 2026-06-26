import { useEffect, type RefObject } from 'react';

/**
 * A hook that tracks the active heading on scroll and highlights the corresponding link in the TOC.
 *
 * @param containerRef The ref of the container element containing TOC link elements.
 * @param tocDependency The TOC HTML string or state that triggers re-evaluation when modified.
 */
export default function useTocActive(
  containerRef: RefObject<HTMLElement | null>,
  tocDependency: string
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !tocDependency) return;

    // Get all anchor links in the TOC
    const links = container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
    if (links.length === 0) return;

    // Map to corresponding document heading elements
    const targets = Array.from(links)
      .map((link) => {
        const id = decodeURIComponent(link.getAttribute('href') || '').slice(1);
        return id ? document.getElementById(id) : null;
      })
      .filter((el): el is HTMLElement => el !== null);

    // Track intersection state of each heading ID
    const headingStates = new Map<string, boolean>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          headingStates.set(entry.target.id, entry.isIntersecting);
        });

        // Determine the active heading
        let activeId: string | null = null;

        // Choice 1: Find the first heading currently intersecting the watch zone
        for (const target of targets) {
          if (headingStates.get(target.id)) {
            activeId = target.id;
            break;
          }
        }

        // Choice 2: If none are intersecting, find the closest heading above the threshold (currently reading section)
        if (!activeId) {
          const threshold = 80; // top offset boundary
          for (let i = targets.length - 1; i >= 0; i--) {
            const rect = targets[i].getBoundingClientRect();
            if (rect.top <= threshold) {
              activeId = targets[i].id;
              break;
            }
          }
        }

        // Choice 3: Default to first heading if scrolled near the top
        if (!activeId && targets.length > 0) {
          activeId = targets[0].id;
        }

        const links =
          container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
        if (links.length === 0) return;

        // Update class list for all links
        if (activeId) {
          links.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${activeId}`) {
              link.classList.add('text-sky-500', 'font-medium');
            } else {
              link.classList.remove('text-sky-500', 'font-medium');
            }
          });
        }
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0,
      }
    );

    // Start observing targets
    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
    };
  }, [containerRef, tocDependency]);
}
