'use client';

import { useState, useEffect, useRef, MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardContent } from '@/components/ui/card';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  PenTool,
  TrendingUp,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { IGetBlog } from '@/types/blog';
import { useFormatter } from 'next-intl';
import { Link } from '@/navigation';

type MainFeatureProps = {
  blogs: IGetBlog[];
};

const MainFeature = ({ blogs }: MainFeatureProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isForward, setIsForward] = useState(true); // true for forward, false for backward
  console.log('🚀 ~ MainFeature ~ isForward:', isForward);
  const sliderRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const format = useFormatter();

  const handleMouseDown = (e: MouseEvent) => {
    if (currentSlide === 0 && e.pageX > startX) return; // Prevent dragging right at the first slide
    if (currentSlide === blogs.length - 1 && e.pageX < startX) return; // Prevent dragging left at the last slide
    setIsDragging(true);
    setStartX(e.pageX - translateX);
    if (contentRef.current) {
      contentRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const currentX = e.pageX - startX;
    setTranslateX(currentX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = (sliderRef.current?.offsetWidth || 0) * 0.2;
    const slideWidth = sliderRef.current?.offsetWidth || 0;

    if (Math.abs(translateX) > threshold) {
      if (translateX > 0 && currentSlide > 0) {
        // Sağa kaydırma
        setIsForward(false);
        setCurrentSlide(currentSlide - 1);
      } else if (translateX < 0 && currentSlide < blogs.length - 1) {
        // Sola kaydırma
        setIsForward(true);
        setCurrentSlide(currentSlide + 1);
      }
    }

    setTranslateX(0);
    if (contentRef.current) {
      contentRef.current.style.cursor = 'auto';
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  const handleMouseEnter = () => {
    if (contentRef.current) {
      contentRef.current.style.cursor = 'grab';
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setTranslateX(0);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      if (prev < blogs.length - 1) {
        setIsForward(true);
        return prev + 1;
      } else {
        setIsForward(false);
        return prev - 1;
      }
    });
    setTranslateX(0);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      if (prev > 0) {
        setIsForward(false);
        return prev - 1;
      } else {
        setIsForward(true);
        return prev + 1;
      }
    });
    setTranslateX(0);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isDragging) {
        if (isForward) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }, 5000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, blogs.length, isForward]);

  // Limit blogs to a maximum of 10 items
  const limitedBlogs = blogs.slice(0, 10);

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold mb-6">Welcome to My Blog Site</h1>

        <section className="mb-12 relative">
          <h2 className="text-2xl font-semibold mb-4">Featured Posts</h2>
          <div
            ref={sliderRef}
            className="relative h-[400px] overflow-hidden rounded-lg"
          >
            <div
              className="group flex h-full transition-transform ease-out duration-500"
              style={{ transform: `translateX(${-currentSlide * 100}%)` }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onMouseEnter={handleMouseEnter}
            >
              {limitedBlogs.map((blog) => (
                <div
                  ref={contentRef}
                  key={blog.id + Math.random()}
                  className="min-w-full h-full relative"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                  <div className="absolute z-10 bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 cursor-auto">
                    <Link
                      href={`/blog/${blog.slug}`}
                      className="text-2xl font-bold text-white mb-2 border-b-2 border-transparent group-hover:border-white"
                      dangerouslySetInnerHTML={{ __html: blog.title }}
                    />
                    <p
                      className="text-white mb-2"
                      dangerouslySetInnerHTML={{
                        __html: blog.content.substring(0, 100),
                      }}
                    />
                    <div className="flex items-center text-white">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>
                          <User className="text-black dark:text-white" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="mr-2">
                        {blog.author?.name || 'Anonim'}
                      </span>
                      <span>
                        {format.relativeTime(new Date(blog.updatedAt))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlide === blogs.length - 1}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {limitedBlogs.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full ${
                    currentSlide === index
                      ? 'bg-white'
                      : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Latest Posts</h2>
            <Button asChild>
              <Link href="/blog/add" className="flex items-center">
                <PenTool className="mr-2 h-4 w-4" /> New Post
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((post) => (
              <Card key={post.id + Math.random()}>
                <CardContent className="p-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <CardTitle className="text-lg font-semibold mb-2">
                      {post.title}
                    </CardTitle>
                    <p
                      className="text-gray-600 mb-4"
                      dangerouslySetInnerHTML={{
                        __html: post.content.substring(0, 100),
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback>
                            <User />
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-gray-900">
                          {post.author?.name || 'Anonim'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {format.relativeTime(new Date(post.createdAt))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Trending Topics</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              'Web Development',
              'Machine Learning',
              'Cybersecurity',
              'Cloud Computing',
            ].map((topic, index) => (
              <Card key={index}>
                <CardContent className="p-4 flex items-center">
                  <TrendingUp className="h-6 w-6 mr-2 text-blue-500" />
                  <span className="font-medium">{topic}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default MainFeature;
