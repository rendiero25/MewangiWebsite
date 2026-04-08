"use client";

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

import sitiAvatar from "../../assets/sitinurhaliza.jpg";
import raraAvatar from "../../assets/rarajonggrang.jpg";
import dwiAvatar from "../../assets/dwisasongko.jpg";

import Avatar from "../../components/common/Avatar";

gsap.registerPlugin(ScrollTrigger, TextPlugin);



const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface Article { _id: string; title: string; slug: string; category: string; coverImage?: string; author: { username: string; avatar?: string }; createdAt: string; excerpt?: string; }
interface Review { _id: string; title: string; image?: string; author: { username: string; avatar?: string }; rating: { overall: number }; createdAt: string; }


interface Topic { _id: string; title: string; slug: string; category: { name: string }; author: { username: string; avatar?: string }; replyCount: number; createdAt: string; }
interface Stats { totalUsers: number; totalReviews: number; totalTopics: number; totalArticles: number; totalPerfumes: number; }

export default function Home() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroBadgeRef = useRef<HTMLDivElement>(null);
  const heroDescRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const showcaseStatsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [latestReviews, setLatestReviews] = useState<Review[]>([]);
  const [latestTopics, setLatestTopics] = useState<Topic[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const [artRes, revRes, topicRes, statsRes] = await Promise.allSettled([
          axios.get(`${API_URL}/articles?limit=3&status=approved`),
          axios.get(`${API_URL}/reviews?limit=3&status=approved`),
          axios.get(`${API_URL}/forum?limit=5&status=approved`),
          axios.get(`${API_URL}/stats`),
        ]);
        if (artRes.status === 'fulfilled') setLatestArticles(artRes.value.data.articles || artRes.value.data || []);
        if (revRes.status === 'fulfilled') setLatestReviews(revRes.value.data.reviews || revRes.value.data || []);
        if (topicRes.status === 'fulfilled') setLatestTopics(topicRes.value.data.topics || topicRes.value.data || []);
        if (statsRes.status === 'fulfilled') {
          console.log('Stats fetched:', statsRes.value.data);
          setStats(statsRes.value.data);
        } else {
          console.error('Stats fetch failed:', statsRes.reason);
        }
      } catch (err) {
        console.error('Failed to fetch latest content:', err);
      }
    };
    fetchLatest();
  }, []);

  useEffect(() => {
    // ScrollTrigger - Hero Section Animations
    const ctx = gsap.context(() => {
      // Timeline untuk Hero Section
      const heroTimeline = gsap.timeline();

      // SVG Circle animations dengan MotionPath-like effect
      gsap.utils.toArray<HTMLElement>(".svg-float").forEach((el, i) => {
        gsap.to(el, {
          y: -30 + i * 10,
          x: 20 - i * 5,
          rotation: 360,
          duration: 8 + i,
          repeat: -1,
          ease: "sine.inOut",
        });
      });

      // SVG dots floating animation
      gsap.utils.toArray<HTMLElement>(".svg-dot").forEach((el, i) => {
        gsap.to(el, {
          y: -50 - i * 15,
          x: 30 + i * 12,
          opacity: 0.3,
          duration: 6 + i * 0.5,
          repeat: -1,
          ease: "sine.inOut",
          delay: i * 0.3,
        });
      });

      // SVG pulse animation
      gsap.to(".svg-pulse", {
        r: 4,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Badge animation - Scramble effect
      heroTimeline.fromTo(
        heroBadgeRef.current,
        { opacity: 0, y: -20, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out" },
        0
      );

      // Title animation - SplitText effect (simulasi dengan stagger)
      heroTimeline.fromTo(
        heroTitleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
        },
        0.2
      );

      // Description animation
      heroTimeline.fromTo(
        heroDescRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        0.4
      );

      // Buttons animation
      const buttons = buttonsRef.current?.querySelectorAll("a");
      if (buttons) {
        heroTimeline.fromTo(
          buttons,
          { opacity: 0, y: 15, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.15, ease: "back.out" },
          0.6
        );
      }

      // Note: Hero stats animation moved to a separate useEffect to handle dynamic data

      // ScrollTrigger - Parallax effect untuk decorative elements
      const decoratives = document.querySelectorAll(".decorative-circle");
      decoratives.forEach((el) => {
        gsap.to(el, {
          y: 100,
          rotation: 45,
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top center",
            end: "center center",
            scrub: 1,
            markers: false,
          },
        });
      });

      // Animated scroll indicator
      gsap.to(scrollIndicatorRef.current, {
        y: 10,
        repeat: -1,
        yoyo: true,
        duration: 1.5,
        ease: "sine.inOut",
      });

      // Features Section - ScrollTrigger animations
      gsap.utils.toArray<HTMLElement>(".feature-card").forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 60, rotationX: -10 },
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: card,
              start: "top 80%",
              end: "top 50%",
              scrub: 0.5,
              markers: false,
            },
          }
        );

        // Hover animation
        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            scale: 1.05,
            duration: 0.3,
            overwrite: "auto",
          });
        });

        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            scale: 1,
            duration: 0.3,
            overwrite: "auto",
          });
        });
      });

      // Step cards animation with Flip-like effect
      gsap.utils.toArray<HTMLElement>(".step-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, x: (i % 2 === 0 ? -50 : 50), rotate: (i % 2 === 0 ? -5 : 5) },
          {
            opacity: 1,
            x: 0,
            rotate: 0,
            duration: 0.8,
            delay: i * 0.2,
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              end: "top 55%",
              scrub: 0.3,
              markers: false,
            },
          }
        );
      });

      // Stat cards animation
      gsap.utils.toArray<HTMLElement>(".stat-item").forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "back.out",
            scrollTrigger: {
              trigger: showcaseStatsRef.current || item,
              start: "top 80%",
              end: "top 50%",
              scrub: 0.3,
              markers: false,
            },
          }
        );
      });

      // CTA Section - ScrollTrigger reveal
      gsap.fromTo(
        ".cta-section",
        { opacity: 0, scale: 0.95, y: 40 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".cta-section",
            start: "top 75%",
            end: "top 45%",
            scrub: 0.5,
            markers: false,
          },
        }
      );

      // Highlight text animation
      gsap.utils.toArray<HTMLElement>(".highlight-text").forEach((text) => {
        // text.textContent for reference
        gsap.fromTo(
          text,
          { color: "currentColor" },
          {
            color: "#009545",
            duration: 0.5,
            repeat: 1,
            yoyo: true,
            scrollTrigger: {
              trigger: text,
              start: "top center",
              end: "center center",
              scrub: 1,
              markers: false,
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  // Dedicated useEffect for stats animations to handle re-renders/dynamic data
  useEffect(() => {
    if (!stats) return;

    const ctx = gsap.context(() => {
      // Hero Stats Animation
      const heroStats = statsRef.current?.querySelectorAll(".stat-item");
      if (heroStats && heroStats.length > 0) {
        gsap.fromTo(
          heroStats,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out" }
        );
      }

      // Showcase Stats Animation (Bottom Section)
      const showcaseStats = showcaseStatsRef.current?.querySelectorAll(".stat-item");
      if (showcaseStats && showcaseStats.length > 0) {
        gsap.fromTo(
          showcaseStats,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "back.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: showcaseStatsRef.current,
              start: "top 80%",
              end: "top 50%",
              scrub: 0.3,
            },
          }
        );
      }

      ScrollTrigger.refresh();
    }); // Scope is global or can be refined later if needed

    return () => ctx.revert();
  }, [stats]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-white"
      >
        {/* Orbiting Gradient Glow Background */}
        <style>{`
          @keyframes orbit-1 {
            0%   { transform: translate(0px, 0px) scale(0.7); opacity: 0.12; }
            25%  { transform: translate(300px, 80px) scale(1.15); opacity: 0.18; }
            50%  { transform: translate(200px, 250px) scale(0.8); opacity: 0.10; }
            75%  { transform: translate(-80px, 150px) scale(1.2); opacity: 0.22; }
            100% { transform: translate(0px, 0px) scale(0.7); opacity: 0.12; }
          }
          @keyframes orbit-2 {
            0%   { transform: translate(0px, 0px) scale(1.1); opacity: 0.15; }
            25%  { transform: translate(-250px, 120px) scale(0.65); opacity: 0.08; }
            50%  { transform: translate(-150px, -100px) scale(1.25); opacity: 0.20; }
            75%  { transform: translate(120px, -80px) scale(0.75); opacity: 0.12; }
            100% { transform: translate(0px, 0px) scale(1.1); opacity: 0.15; }
          }
          .hero-orb-1 { animation: orbit-1 12s ease-in-out infinite; }
          .hero-orb-2 { animation: orbit-2 16s ease-in-out infinite; }
        `}</style>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-orb-1 absolute top-0 left-0 w-[580px] h-[580px] rounded-full bg-primary blur-[130px]" />
          <div className="hero-orb-2 absolute top-10 right-0 w-[520px] h-[520px] rounded-full bg-secondary blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] rounded-full bg-primary/5 blur-[80px]" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(0,149,69,0.05) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24 lg:pb-36">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge dengan animation */}
            <div
              ref={heroBadgeRef}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-primary mb-6"
            >
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>Komunitas Parfum Pertama di Indonesia</span>
            </div>

            {/* Title dengan SplitText effect */}
            <h1
              ref={heroTitleRef}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold text-black leading-tight mb-6"
            >
              Temukan Dunia{" "}
              <span className="text-primary">
                Parfum
              </span>{" "}
              Favoritmu
            </h1>

            {/* Description dengan animation */}
            <p
              ref={heroDescRef}
              className="text-lg sm:text-2xl text-black max-w-2xl xl:max-w-4xl mx-auto mb-10 leading-relaxed"
            >
              Gabung bersama ribuan pecinta parfum Indonesia. Diskusikan,
              review, dan bagikan pengalaman parfum terbaikmu di Mewangi dengan
              komunitas yang passionate dan supportif.
            </p>

            {/* CTA Buttons dengan animation */}
            <div
              ref={buttonsRef}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-linear-to-r from-primary to-secondary rounded-xl hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-300"
              >
                Gabung Sekarang
              </Link>
              <Link
                to="/forum"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:border-primary/30 hover:text-primary transition-all duration-300"
              >
                Jelajahi Forum
              </Link>
            </div>

            {/* Stats dengan counting animation */}
            <div
              ref={statsRef}
              className="flex items-center justify-center gap-8 sm:gap-16 mt-16 flex-wrap"
            >
              {[
                { value: stats?.totalUsers.toLocaleString('id-ID') || "", label: "Member Aktif" },
                { value: stats?.totalTopics.toLocaleString('id-ID') || "", label: "Total Forum" },
                { value: stats?.totalReviews.toLocaleString('id-ID') || "", label: "Review Produk" },
                { value: stats?.totalArticles.toLocaleString('id-ID') || "", label: "Total Artikel" },
              ].map((stat) => (
                <div key={stat.label} className="stat-item text-center">
                  <p className="text-2xl sm:text-3xl lg:text-6xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-lg text-black mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll Indicator dengan animation */}
          <div
            ref={scrollIndicatorRef}
            className="flex flex-col items-center justify-center mt-20"
          >
            <p className="text-md text-primary mb-2">
              Scroll untuk lanjut
            </p>
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section dengan ScrollTrigger */}
      <section
        ref={featuresRef}
        className="py-20 bg-third/25"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title dengan animation */}
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              <span className="highlight-text text-secondary">Kenapa Mewangi?</span>
            </h2>
            <p className="text-black max-w-2xl mx-auto text-lg leading-relaxed">
              Platform lengkap untuk para pecinta parfum di Indonesia. Dengan
              fitur-fitur canggih, moderasi terbaik, dan komunitas yang ramah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {[
              {
                icon: (
                  <svg
                    className="w-15 h-15"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                    />
                  </svg>
                ),
                title: "Forum Diskusi Aktif",
                desc: "Diskusikan parfum favoritmu, minta rekomendasi personal, dan berbagi tips dengan komunitas yang passionate. Lebih dari 5000 topik diskusi aktif setiap bulan.",
                color: "from-primary to-emerald-400",
                icon_bg: "from-primary/20 to-emerald-400/20",
              },
              {
                icon: (
                  <svg
                    className="w-15 h-15"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                ),
                title: "Review Jujur",
                desc: "Baca dan tulis review terstruktur dengan rating longevity, sillage, value for money, dan notes. Bantu komunitas membuat keputusan pembelian yang tepat.",
                color: "from-amber-400 to-orange-500",
                icon_bg: "from-amber-400/20 to-orange-500/20",
              },
              {
                icon: (
                  <svg
                    className="w-15 h-15"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                ),
                title: "Blog & Artikel",
                desc: "Baca artikel edukatif tentang dunia parfum atau tulis artikelmu sendiri. Dari fragrance notes hingga tips merawat parfum dari master penulismu.",
                color: "from-blue-500 to-indigo-500",
                icon_bg: "from-blue-500/20 to-indigo-500/20",
              },
              {
                icon: (
                  <svg
                    className="w-15 h-15"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                title: "Leaderboard & Points",
                desc: "Raih poin dari setiap kontribusi (review, diskusi, artikel). Naikkan level dan bersaing di leaderboard dengan reward eksklusif.",
                color: "from-purple-500 to-pink-500",
                icon_bg: "from-purple-500/20 to-pink-500/20",
              },
              {
                icon: (
                  <svg
                    className="w-15 h-15"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ),
                title: "Moderasi Ketat",
                desc: "Komunitas yang aman dan sehat. Tim moderator profesional memastikan diskusi tetap berkualitas dan bebas spam.",
                color: "from-teal-400 to-cyan-500",
                icon_bg: "from-teal-400/20 to-cyan-500/20",
              },
              {
                icon: (
                  <svg
                    className="w-15 h-15"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M14.828 14.828a4 4 0 01-5.656 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ),
                title: "Profil Komunitas",
                desc: "Bangun profil unikmu, tunjukkan koleksi parfum favoritmu, dan connect dengan perfume enthusiast lainnya di seluruh Indonesia.",
                color: "from-rose-400 to-red-500",
                icon_bg: "from-rose-400/20 to-red-500/20",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="feature-card group p-8 rounded-2xl bg-white border border-primary hover:border-secondary hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300"
              >
                <div
                  className={`w-16 h-16 rounded-xl bg-linear-to-br ${feature.icon_bg} flex items-center justify-center text-white mb-5 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}
                  style={{
                    backgroundImage: `linear-gradient(135deg, rgb(var(--color-start)), rgb(var(--color-end)))`,
                  }}
                >
                  <div
                    className={`text-primary group-hover:text-secondary transition-colors`}
                  >
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-black mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - The Perfect Journey */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              <span className="highlight-text text-black">
                Perjalanan Sempurna Kamu di{" "}Mewangi</span>
            </h2>
            <p className="text-black max-w-2xl mx-auto text-lg">
              Bergabunglah dalam 4 langkah mudah dan mulai jelajahi dunia
              parfum bersama ribuan enthusiast lainnya.
            </p>
          </div>

          {/* Steps with Flip-like animation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {[
              {
                step: "01",
                title: "Daftar Gratis",
                desc: "Buat akun dengan email atau Google. Verifikasi email Anda dan selesai.",
                icon: "👤",
                details: "Proses hanya membutuhkan 2 menit. Gratis selamanya.",
              },
              {
                step: "02",
                title: "Lengkapi Profil",
                desc: "Isi preferensi parfum Anda dan tambahkan foto profil yang menarik.",
                icon: "✨",
                details: "Tunjukkan kepribadian unikmu kepada komunitas.",
              },
              {
                step: "03",
                title: "Jelajahi & Diskusi",
                desc: "Buka forum, baca review, atau cari parfum yang Anda minati.",
                icon: "🔍",
                details: "Temukan fragrance impianmu atau minta rekomendasi.",
              },
              {
                step: "04",
                title: "Berkontribusi & Raih Poin",
                desc: "Tulis review, buat topik diskusi, atau bagikan artikel.",
                icon: "⭐",
                details: "Dapatkan poin dan naikkan level membership Anda.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="step-card relative group p-8 rounded-2xl bg-white border border-primary hover:border-secondary hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 dark:border-primary"
              >
                <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <span className="text-sm font-black text-primary">
                    {item.step}
                  </span>
                </div>

                {/* Icon emoji */}
                <div className="text-4xl mb-3 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300">
                  {item.icon}
                </div>

                <h3 className="text-xl font-bold text-black mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {item.desc}
                </p>

                {/* Details reveal on hover */}
                <div className="pt-4 border-t border-gray-300 dark:border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-xs dark:text-black italic">
                    {item.details}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Visual connector lines */}
          <div className="hidden lg:block relative mt-12 h-1 bg-linear-to-r from-transparent via-primary/20 to-transparent"></div>
        </div>
      </section>

      {/* Testimonials Section dengan scroll animation */}
      <section className="pb-20 bg-linear-to-b from-white to-third/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              <span className="highlight-text text-black">Apa Kata Komunitas?</span>
            </h2>
            <p className="text-black max-w-2xl mx-auto">
              Dengarkan pengalaman ribuan pengguna Mewangi yang telah menemukan
              parfum impian mereka.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                author: "Siti Nurhaliza",
                role: "Perfume Enthusiast",
                city: "Jakarta",
                content:
                  "Mewangi benar-benar mengubah cara saya memilih parfum. Reviewnya detail dan komunitynya sangat helpful!",
                rating: 5,
                avatar: sitiAvatar,
              },
              {
                author: "Rara Jonggrang",
                role: "Content Creator",
                city: "Surabaya",
                content:
                  "Platform terbaik untuk share fragrance knowledge. Moderatornya profesional dan diskusinya berkualitas.",
                rating: 5,
                avatar: raraAvatar,
              },
              {
                author: "Dwi Sasongko",
                role: "Business Owner",
                city: "Bandung",
                content:
                  "Sebagai seller, Mewangi membantu saya understand customer preferences dengan lebih baik.",
                rating: 5,
                avatar: dwiAvatar,
              },
            ].map((testimonial) => (
              <div
                key={testimonial.author}
                className="feature-card p-8 rounded-2xl bg-white border border-primary hover:border-secondary hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i} className="text-lg">
                      ⭐
                    </span>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-black italic mb-6 font-medium">
                  &quot;{testimonial.content}&quot;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.author} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <p className="font-bold text-black">
                      {testimonial.author}
                    </p>
                    <p className="text-xs text-black">
                      {testimonial.role} • {testimonial.city}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LATEST CONTENT SECTIONS ===== */}

      {/* Latest Reviews */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-xs font-bold text-amber-600 mb-3">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                Terbaru
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-black">Review <span className="text-amber-500">Terpilih</span></h2>
              <p className="text-black mt-2 text-sm">Review parfum terbaru dari komunitas Mewangi.</p>
            </div>
            <Link to="/review" className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-secondary transition-colors group">
              Lihat Semua
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>

          {latestReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestReviews.slice(0, 3).map((review, idx) => (
                <div key={review._id} 
                  onClick={() => navigate(`/review/${review._id}`)}
                  className="group flex flex-col bg-white border border-gray-100 rounded-2xl hover:shadow-2xl hover:shadow-amber-100/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  {/* Review Image */}
                  <div className="h-44 overflow-hidden bg-liniear-to-br from-amber-400/10 to-orange-500/10 relative shrink-0">
                    {review.image ? (
                      <img
                        src={review.image.startsWith('http') ? review.image : `${import.meta.env.VITE_API_URL?.replace(/\/api$/, '').replace(/\/api\/$/, '') || 'http://localhost:3000'}${review.image.startsWith('/') ? review.image : `/${review.image}`}`}
                        alt={review.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center group-hover:from-amber-400/20 group-hover:to-orange-500/20 transition-all">
                         <svg className="w-12 h-12 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                         </svg>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-lg text-[10px] font-black text-amber-600 shadow-sm border border-amber-100">
                      RANK #{idx + 1}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1 relative">

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(s => (
                          <svg key={s} className={`w-4 h-4 ${s <= Math.round(review.rating?.overall || 0) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-[16px] text-gray-400 font-medium">#{idx + 1}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-3 leading-snug group-hover:text-amber-600 transition-colors line-clamp-2">{review.title}</h3>
                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-50">
                      <Avatar 
                        src={review.author?.avatar}
                        username={review.author?.username}
                        size="sm"
                        disableLink={true}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-black truncate">{review.author?.username || 'Anonymous'}</p>
                        <p className="text-[10px] text-primary">{new Date(review.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-50 rounded-2xl animate-pulse border border-gray-100" />)}
            </div>
          )}
          <div className="mt-6 text-center sm:hidden">
            <Link to="/review" className="inline-flex items-center gap-2 text-sm font-bold text-primary">Lihat Semua Review →</Link>
          </div>
        </div>
      </section>

      {/* Latest Forum Topics */}
      <section className="py-20 bg-third/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-bold text-emerald-600 mb-3">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Diskusi Aktif
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-black">Topik <span className="text-primary">Forum</span></h2>
              <p className="text-black mt-2 text-sm">Ikut bergabung dalam diskusi parfum terkini.</p>
            </div>
            <Link to="/forum" className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-secondary transition-colors group">
              Lihat Semua
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>

          {latestTopics.length > 0 ? (
            <div className="space-y-4">
              {latestTopics.slice(0, 5).map((topic, idx) => (

                <Link key={topic._id} to={`/forum/${topic._id}`}
                  className="group flex items-center gap-5 bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-xl hover:shadow-emerald-100/40 hover:-translate-y-0.5 hover:border-primary/20 transition-all duration-300"
                >
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary/20">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate group-hover:text-primary transition-colors">{topic.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-black">{topic.author?.username || 'Anonymous'}</span>
                      {topic.category?.name && (
                        <span className="text-[10px] px-2 py-0.5 bg-primary/5 text-primary rounded-full font-bold">{topic.category.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-center">
                    <p className="text-lg font-black text-gray-700">{topic.replyCount || 0}</p>
                    <p className="text-[10px] text-gray-400 font-medium">Balasan</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
            </div>
          )}
          <div className="mt-6 text-center sm:hidden">
            <Link to="/forum" className="inline-flex items-center gap-2 text-sm font-bold text-primary">Lihat Semua Topik →</Link>
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold text-indigo-600 mb-3">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                Blog & Edukasi
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-black">Artikel <span className="text-indigo-600">Terbaru</span></h2>
              <p className="text-black mt-2 text-sm">Perluas pengetahuanmu seputar dunia parfum.</p>
            </div>
            <Link to="/blog" className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-secondary transition-colors group">
              Lihat Semua
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>

          {latestArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestArticles.slice(0, 3).map((article) => (
                <div key={article._id}
                  onClick={() => navigate(`/blog/${article.slug}`)}
                  className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div className="h-44 overflow-hidden bg-gradient-to-br from-indigo-500/10 to-blue-500/10 relative">
                    {article.coverImage ? (
                      <img
                        src={article.coverImage.startsWith('http') ? article.coverImage : `${import.meta.env.VITE_API_URL?.replace(/\/api$/, '').replace(/\/api\/$/, '') || 'http://localhost:3000'}${article.coverImage.startsWith('/') ? article.coverImage : `/${article.coverImage}`}`}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center group-hover:from-indigo-500/20 group-hover:to-blue-500/20 transition-all">
                        <svg className="w-16 h-16 text-indigo-200 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    {article.category && (
                      <span className="inline-block text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-bold mb-3">{article.category}</span>
                    )}
                    <h3 className="font-bold text-gray-900 leading-snug mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">{article.title}</h3>
                    {article.excerpt && <p className="text-xs text-black line-clamp-2 mb-4 leading-relaxed">{article.excerpt}</p>}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                      <Avatar 
                        src={article.author?.avatar}
                        username={article.author?.username}
                        size="sm"
                        disableLink={true}
                      />
                      <p className="text-xs text-black font-medium">{article.author?.username || 'Anonymous'}</p>

                      <span className="text-black">·</span>
                      <p className="text-xs text-primary">{new Date(article.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-50 rounded-2xl animate-pulse border border-gray-100" />)}
            </div>
          )}
          <div className="mt-6 text-center sm:hidden">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-primary">Lihat Semua Artikel →</Link>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section dengan ScrollTrigger */}
      <section className="cta-section pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-xl bg-linear-to-r from-primary via-secondary to-primary p-12 sm:p-16 lg:p-20 text-center">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-30">
              <svg
                className="w-full h-full"
                viewBox="0 0 400 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ filter: "drop-shadow(0 0 20px rgba(255,255,255,0.3))" }}
              >
                <circle cx="50" cy="50" r="30" fill="white" opacity="0.1" className="svg-pulse" />
                <circle cx="350" cy="250" r="50" fill="white" opacity="0.1" className="svg-pulse" />
                <path
                  d="M0 150 Q 100 100, 200 150 T 400 150"
                  stroke="white"
                  strokeWidth="2"
                  opacity="0.2"
                />
              </svg>
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Siap Menemukan Parfum Impianmu?
              </h2>
              <p className="text-white/90 max-w-2xl mx-auto mb-10 text-lg leading-relaxed">
                Bergabung dengan 1,250+ member komunitas Mewangi. Gratis
                selamanya, tanpa biaya tersembunyi. Mulai perjalanan olfactory
                journey-mu sekarang juga.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-3 px-8 py-4 text-base font-semibold text-primary bg-white rounded-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <span>Daftar Sekarang - Gratis!</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
                <Link
                  to="/forum"
                  className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white border-2 border-white rounded-xl hover:bg-white/10 transition-all duration-300"
                >
                  Jelajahi Forum Sekarang
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-12 flex items-center justify-center gap-6 flex-wrap text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>100% Aman & Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>No Credit Card Needed</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Instant Activation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section untuk membantu konversi */}
      <section className="py-20 bg-linear-to-b from-third/25 via-third/25 to-transparent">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              Pertanyaan Umum
            </h2>
            <p className="text-black">
              Jawaban untuk pertanyaan yang sering ditanyakan oleh anggota baru.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Apakah Mewangi benar-benar gratis?",
                a: "Ya, 100% gratis untuk semua fitur dasar. Tidak ada biaya tersembunyi atau upgrade paksa.",
              },
              {
                q: "Bagaimana dengan privasi dan keamanan data saya?",
                a: "Kami menggunakan enkripsi level enterprise. Data Anda tidak dijual atau dibagikan ke pihak ketiga.",
              },
              {
                q: "Bisa mulai kapan?",
                a: "Kapan saja! Daftar cukup 2 menit. Mulai dari sekarang dan jelajahi ribuan review parfum.",
              },
              {
                q: "Apakah saya bisa menjual parfum di Mewangi?",
                a: "Mewangi adalah platform komunitas, bukan marketplace. Tapi Anda bisa share koleksi dan rekomendasi.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="feature-card group p-6 rounded-xl bg-white border border-gray-200 hover:border-primary/30 cursor-pointer transition-all duration-300"
              >
                <summary className="flex items-center justify-between font-bold text-black group-hover:text-primary transition-colors">
                  {faq.q}
                  <span className="text-primary group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="text-primary mt-4">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
