// 'use client';

import { fetchCategoryArticles } from '@/app/blog/layout';
import Navbar from './components/navbar';

export default async function Header() {
  const categoryArticles = await fetchCategoryArticles();

  return <Navbar categoryArticles={categoryArticles} />;
}
