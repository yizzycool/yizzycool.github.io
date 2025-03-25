import { BlogArticle } from '@/types/blog';
import { useMemo } from 'react';
import strapiUtils from '@/utils/strapi-utils';
import Image from 'next/image';
import Tags from './components/tags';
import Markdown, { ExtraProps } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import _get from 'lodash/get';

export default function Article({ article }: { article: BlogArticle }) {
  const data = _get(article, 'data.0') || {};
  const { title, content, banner } = data;

  const bannerUrl = useMemo(() => {
    const largePath = _get(banner, 'formats.large.url') || '';
    if (largePath) {
      return strapiUtils.toMediaUrl(largePath);
    }
    const mediumPath = _get(banner, 'formats.medium.url') || '';
    if (mediumPath) {
      return strapiUtils.toMediaUrl(mediumPath);
    }
    const originalPath = _get(banner, 'url') || '';
    if (originalPath) {
      return strapiUtils.toMediaUrl(originalPath);
    }
    return '';
  }, [banner]);

  return (
    <div className="mx-auto max-w-screen-lg px-5 lg:px-8">
      <h1 className="mx-auto mt-10 text-4xl font-bold">{title}</h1>
      <div className="mt-4">
        <Tags article={article} />
      </div>
      <div className="mt-10">
        <Image
          className="aspect-video w-full object-cover"
          src={bannerUrl}
          width="1600"
          height="900"
          alt="banner"
        />
      </div>
      <Markdown
        className="all-revert my-20 !leading-8"
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
        components={{
          code(props) {
            return Code(props);
          },
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}

const Code = (
  props: React.ClassAttributes<HTMLElement> &
    React.HTMLAttributes<HTMLElement> &
    ExtraProps
) => {
  const { ref, children, className, node, ...rest } = props;
  const match = /language-(\w+)/.exec(className || '');
  return match ? (
    // @ts-expect-error - known issue about react-syntax-highlighter
    <SyntaxHighlighter
      {...rest}
      PreTag="div"
      language={match[1]}
      style={vscDarkPlus}
      showLineNumbers={true}
    >
      {children}
    </SyntaxHighlighter>
  ) : (
    <code {...rest} className={className}>
      {children}
    </code>
  );
};
