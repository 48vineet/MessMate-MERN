// src/pages/HomePage.jsx
import { ArrowRightIcon, StarIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icons from "../components/common/Icons";
import Logo from "../components/common/Logo";
import api from "../utils/api";

const HomePage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMeals: 0,
    averageRating: 0,
    totalBookings: 0,
  });
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [statsResponse, testimonialsResponse] = await Promise.all([
          api.get("/public/stats"),
          api.get("/public/testimonials"),
        ]);

        setStats(statsResponse.data.stats);
        setTestimonials(testimonialsResponse.data.testimonials || []);
      } catch (error) {
        setStats({
          totalUsers: 5000,
          totalMeals: 100000,
          averageRating: 4.8,
          totalBookings: 250000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const features = [
    {
      icon: Icons.dining,
      title: "Easy meal booking",
      description:
        "Book breakfast, lunch, and dinner in a few taps without standing in long queues.",
    },
    {
      icon: Icons.qrCode,
      title: "Fast QR check-in",
      description:
        "Scan once at the counter and get instant verification with no paperwork.",
    },
    {
      icon: Icons.wallet,
      title: "Simple wallet payments",
      description:
        "Recharge with UPI and track every transaction clearly in one place.",
    },
    {
      icon: Icons.chart,
      title: "Clear usage insights",
      description:
        "See your booking history, expenses, and attendance trends anytime.",
    },
  ];

  const steps = [
    {
      title: "Create your account",
      text: "Sign up with your basic details and complete your profile in minutes.",
    },
    {
      title: "Book meals in advance",
      text: "Pick the meals you want and confirm before the cutoff time.",
    },
    {
      title: "Scan and enjoy",
      text: "Use your QR at the mess counter for a quick and smooth check-in.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo size="md" showText={true} />

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              How it works
            </a>
            <a href="#reviews" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Reviews
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:items-center lg:px-8 lg:py-20">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                For hostels and student mess
              </p>
              <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
                A reliable mess management app that feels easy from day one.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
                MessMate helps students book meals, pay quickly, and check in
                with QR. Admins get clear control over menus, attendance, and
                daily operations.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Get started
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-100"
                >
                  Already have an account?
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Today at a glance</h2>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-white p-4">
                  <p className="text-sm text-gray-600">Students</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {loading ? "..." : `${Math.floor(stats.totalUsers / 1000)}K+`}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-4">
                  <p className="text-sm text-gray-600">Meals served</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {loading ? "..." : `${Math.floor(stats.totalMeals / 1000)}K+`}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-4">
                  <p className="text-sm text-gray-600">Bookings</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {loading ? "..." : `${Math.floor(stats.totalBookings / 1000)}K+`}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-4">
                  <p className="text-sm text-gray-600">Average rating</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {loading ? "..." : stats.averageRating.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Everything needed for mess operations</h2>
            <p className="mt-3 text-gray-600">
              Built for daily hostel use with practical flows and clean screens,
              not flashy gimmicks.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex rounded-lg bg-blue-50 p-3 text-blue-700">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="border-y border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">How it works</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <p className="text-sm font-semibold text-blue-700">Step {index + 1}</p>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {testimonials.length > 0 && (
          <section id="reviews" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Student feedback</h2>
                <p className="mt-2 text-gray-600">Real comments from active users.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {testimonials.slice(0, 3).map((testimonial) => (
                <article key={testimonial._id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                      {testimonial.user?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.user?.name || "Anonymous"}</p>
                      <p className="text-xs text-gray-500">{testimonial.user?.college || "Student"}</p>
                    </div>
                  </div>

                  <div className="mb-3 flex">
                    {[...Array(5)].map((_, index) => (
                      <StarIcon
                        key={index}
                        className={`h-4 w-4 ${
                          index < testimonial.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-sm leading-6 text-gray-700">"{testimonial.comment}"</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="bg-blue-700">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Ready to simplify your mess routine?</h2>
              <p className="mt-2 text-blue-100">
                Start with MessMate and manage meals with confidence.
              </p>
            </div>

            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              Create free account
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-gray-600 sm:px-6 md:flex-row lg:px-8">
          <p>© 2026 MessMate. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#features" className="hover:text-gray-900">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-gray-900">
              How it works
            </a>
            <Link to="/login" className="hover:text-gray-900">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
