import { BlogArticle } from '@/types/blog';
import Title from '@/components/tools/components/title';
import Markdown, { ExtraProps } from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import _get from 'lodash/get';

export default function Article({ article }: { article: BlogArticle }) {
  // TODO: render component
  console.log('article:', article);
  const data = _get(article, ['data', '0']) || {};
  const { title, content } = data;

  return (
    <div className="mx-auto max-w-screen-lg px-5 lg:px-8">
      <Title>{title}</Title>
      <Markdown
        className="all-revert my-8"
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
