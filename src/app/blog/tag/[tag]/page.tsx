import { BlogCategory } from '@/types/blog';
import strapiUtils from '@/utils/strapi-utils';
import Articles from '@/components/blog/articles';
import _get from 'lodash/get';
import _size from 'lodash/size';
import _map from 'lodash/map';

type Slug = { tag: string };

export async function generateStaticParams() {
  const queryString =
    strapiUtils.staticParams.generateTagsQueryStringForTagPage({
      articles: {
        '$notNull': true,
      },
    });
  const response = await fetch(
    `${process.env.STRAPI_URL}/api/tags?${queryString}`
  );
  const categoryArticleData: BlogCategory = await response.json();
  const { data } = categoryArticleData;

  return _map(data, ({ slug }) => ({
    tag: slug,
  }));
}

const fetchArticle = async (tagSlug: string) => {
  const queryString = strapiUtils.fetch.generateArticlesQueryString({
    tags: {
      slug: {
        '$in': tagSlug,
      },
    },
  });
  const response = await fetch(
    `${process.env.STRAPI_URL}/api/articles?${queryString}`
  );
  const data = await response.json();
  return data;
};

export default async function Page({ params }: { params: Promise<Slug> }) {
  const { tag: tagSlug } = await params;
  const articles = await fetchArticle(tagSlug);

  return <Articles articles={articles} tagSlug={tagSlug} />;
}
