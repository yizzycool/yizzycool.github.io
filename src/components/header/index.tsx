import { fetchCategoryArticles } from '@/utils/strapi-utils';
import Navbar from './navbar';

export default async function Header() {
  const categoryArticles = await fetchCategoryArticles();

  return <Navbar categoryArticles={categoryArticles} />;
}
