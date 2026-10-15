import { Course } from '@/types/auth/Course';

const filterByTajweed = (tags: string[], title: string, desc: string, slug: string) => {
  return (
    tags.some(
      (tag) =>
        tag.includes('tajweed') ||
        tag.includes('recitation') ||
        tag.includes('تجوید') ||
        tag.includes('تلاوة') ||
        tag.includes('روخوانی'),
    ) ||
    title.includes('tajweed') ||
    title.includes('recitation') ||
    title.includes('تجوید') ||
    title.includes('روخوانی') ||
    title.includes('تلاوة') ||
    title.includes('ترتیل') ||
    desc.includes('tajweed') ||
    desc.includes('تجوید') ||
    slug.includes('tajweed')
  );
};

const filterByTafsir = (tags: string[], title: string, desc: string, slug: string) => {
  return (
    tags.some(
      (tag) =>
        tag.includes('tafsir') ||
        tag.includes('reflection') ||
        tag.includes('تدبر') ||
        tag.includes('تفسیر') ||
        tag.includes('تفسير'),
    ) ||
    title.includes('tafsir') ||
    title.includes('reflection') ||
    title.includes('تدبر') ||
    title.includes('تفسیر') ||
    title.includes('تفسير') ||
    desc.includes('tafsir') ||
    desc.includes('تدبر') ||
    desc.includes('تفسیر') ||
    slug.includes('tafsir')
  );
};

const filterByArabic = (tags: string[], title: string, desc: string, slug: string) => {
  return (
    tags.some(
      (tag) =>
        tag.includes('arabic') ||
        tag.includes('vocabulary') ||
        tag.includes('عربی') ||
        tag.includes('واژگان') ||
        tag.includes('مفردات') ||
        tag.includes('لغة'),
    ) ||
    title.includes('arabic') ||
    title.includes('vocabulary') ||
    title.includes('عربی') ||
    title.includes('واژگان') ||
    title.includes('مفردات') ||
    desc.includes('arabic') ||
    desc.includes('عربی') ||
    desc.includes('واژگان') ||
    slug.includes('arabic')
  );
};

const matchesCategory = (course: Course, category: string) => {
  const tags = (course.tags || []).map((tag) => tag.toLowerCase());
  const title = (course.title || '').toLowerCase();
  const desc = (course.description || '').toLowerCase();
  const slug = (course.slug || '').toLowerCase();

  if (category === 'tajweed') {
    return filterByTajweed(tags, title, desc, slug);
  }
  if (category === 'tafsir') {
    return filterByTafsir(tags, title, desc, slug);
  }
  if (category === 'arabic') {
    return filterByArabic(tags, title, desc, slug);
  }
  return true;
};

const matchesSearch = (course: Course, query: string) => {
  const titleMatch = course.title?.toLowerCase().includes(query);
  const descMatch = course.description?.toLowerCase().includes(query);
  const authorMatch = course.authors?.some((a) => a.author?.name?.toLowerCase().includes(query));
  const tagMatch = course.tags?.some((tag) => tag?.toLowerCase().includes(query));
  return titleMatch || descMatch || authorMatch || tagMatch;
};

const filterCourses = (courses: Course[], searchQuery: string, activeFilter: string): Course[] => {
  let result = courses;

  if (searchQuery.trim()) {
    const query = searchQuery.trim().toLowerCase();
    result = result.filter((course) => matchesSearch(course, query));
  }

  if (activeFilter && activeFilter !== 'all') {
    const filterLower = activeFilter.toLowerCase();
    result = result.filter((course) => matchesCategory(course, filterLower));
  }

  return result;
};

export default filterCourses;
