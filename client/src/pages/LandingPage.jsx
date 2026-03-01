import {
  ArrowRightIcon,
  Bars3Icon,
  BellAlertIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  StarIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/common/Logo";
import useAuth from "../hooks/useAuth";

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: CalendarDaysIcon,
      title: "Advance Meal Booking",
      description:
        "Reserve breakfast, lunch, and dinner in seconds before cutoff time.",
    },
    {
      icon: QrCodeIcon,
      title: "Quick QR Check-in",
      description:
        "Show your QR at the counter and complete verification instantly.",
    },
    {
      icon: CreditCardIcon,
      title: "Wallet + UPI Payments",
      description:
        "Recharge easily, pay securely, and view transparent transaction history.",
    },
    {
      icon: BellAlertIcon,
      title: "Smart Notifications",
      description:
        "Get reminders for booking windows, menu updates, and important alerts.",
    },
    {
      icon: ChartBarIcon,
      title: "Usage Insights",
      description:
        "Track meals, spending, and attendance trends from one dashboard.",
    },
    {
      icon: ShieldCheckIcon,
      title: "Role-based Access",
      description:
        "Separate student and admin access with secure permission controls.",
    },
  ];

  const steps = [
    {
      title: "Set up your mess profile",
      text: "Create your hostel setup, meal timings, and booking windows.",
    },
    {
      title: "Students book in advance",
      text: "Users select meals with transparent cutoff rules and confirmations.",
    },
    {
      title: "Serve faster with QR",
      text: "Scan at the counter, track attendance instantly, and avoid manual errors.",
    },
  ];

  const testimonials = [
    {
      name: "Aarav Sharma",
      role: "Hostel Committee Lead",
      quote:
        "MessMate reduced daily meal queue issues and made booking discipline much better.",
    },
    {
      name: "Priya Nair",
      role: "Student User",
      quote:
        "The QR check-in and wallet flow are simple. I can manage meals in under a minute.",
    },
    {
      name: "Ritika Singh",
      role: "Mess Admin",
      quote:
        "Attendance and payment reconciliation used to take hours; now it is mostly automatic.",
    },
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/30 to-violet-50/30 text-slate-900"
      style={{ fontSize: "101.3%" }}
    >
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo size="md" showText={true} />

          <nav className="hidden items-center gap-7 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              How It Works
            </a>
            <a
              href="#solutions"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Solutions
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Sign up
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((previous) => !previous)}
              className="rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <Bars3Icon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
              <a
                href="#features"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#solutions"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Solutions
              </a>
              <a
                href="#faq"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </a>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
            <div>
              <p className="mb-4 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                Enterprise-ready Mess Management Platform
              </p>
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                Professional dining operations for hostels, campuses, and PGs.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
                MessMate helps your team manage meal booking, QR attendance,
                payments, and communication in one connected system built for
                high-volume daily operations.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      Start Free Trial
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center rounded-md border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-100"
                    >
                      Sign In
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Open Dashboard
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                )}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 sm:max-w-lg">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Active students</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">5,000+</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Meals served</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">100K+</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Daily bookings</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    12,000+
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Satisfaction score</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">4.8/5</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm lg:p-8">
              <h2 className="text-lg font-semibold text-slate-900">
                Why operations teams choose MessMate
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 text-green-600" />
                  Accurate pre-booking helps control wastage and improve
                  planning.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 text-green-600" />
                  QR attendance removes manual queue bottlenecks.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 text-green-600" />
                  Payment tracking is centralized with clear audit trails.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 text-green-600" />
                  Student communication, menu updates, and feedback stay
                  aligned.
                </li>
              </ul>

              <div className="mt-6 rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900">
                <p className="font-semibold">Built for real workflows</p>
                <p className="mt-1 text-indigo-800">
                  Faster service, better forecasting, and smoother shift
                  handovers.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
              Trusted by growing mess teams and campus communities
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
              <div className="rounded-md border border-slate-200 bg-slate-50 py-2 text-sm font-medium text-slate-600">
                Campus Central
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 py-2 text-sm font-medium text-slate-600">
                Urban Hostels
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 py-2 text-sm font-medium text-slate-600">
                UniLiving Group
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 py-2 text-sm font-medium text-slate-600">
                Metro PG Network
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Powerful features for modern dining operations
            </h2>
            <p className="mt-3 text-gray-600">
              Build reliable meal processes with transparent controls,
              automation-ready workflows, and high adoption across users.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 inline-flex rounded-lg bg-violet-50 p-2.5 text-violet-700">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-y border-slate-200 bg-white"
        >
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-8 max-w-2xl">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                How MessMate works
              </h2>
              <p className="mt-3 text-slate-600">
                Simple setup, quick adoption, and predictable execution.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <article
                  key={step.title}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-6"
                >
                  <p className="text-sm font-semibold text-indigo-700">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {step.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="solutions"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="mb-4 inline-flex rounded-lg bg-violet-50 p-2.5 text-violet-700">
                <UserGroupIcon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                For Students
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Manage meals on time, avoid missing slots, and use fast QR
                check-in with transparent payment history.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckBadgeIcon className="h-4 w-4 text-green-600" />
                  Book and cancel within policy windows
                </li>
                <li className="flex items-center gap-2">
                  <CheckBadgeIcon className="h-4 w-4 text-green-600" />
                  Receive reminder alerts before cutoff
                </li>
                <li className="flex items-center gap-2">
                  <CheckBadgeIcon className="h-4 w-4 text-green-600" />
                  Track wallet, recharge, and refund status
                </li>
              </ul>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="mb-4 inline-flex rounded-lg bg-indigo-50 p-2.5 text-indigo-700">
                <BuildingOffice2Icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                For Admin Teams
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Control menus, monitor attendance in real time, and improve cost
                planning with accurate booking data.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckBadgeIcon className="h-4 w-4 text-green-600" />
                  Forecast daily meal demand effectively
                </li>
                <li className="flex items-center gap-2">
                  <CheckBadgeIcon className="h-4 w-4 text-green-600" />
                  Reduce wastage through better visibility
                </li>
                <li className="flex items-center gap-2">
                  <CheckBadgeIcon className="h-4 w-4 text-green-600" />
                  Access actionable analytics and reports
                </li>
              </ul>
            </article>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-8 max-w-2xl">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Reliability and controls
              </h2>
              <p className="mt-3 text-slate-600">
                Built for consistent daily usage and secure handling of user
                data.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <ShieldCheckIcon className="h-6 w-6 text-violet-700" />
                <h3 className="mt-3 font-semibold text-slate-900">
                  Secure access
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Token-based auth and role-bound routes for students and
                  admins.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <ClockIcon className="h-6 w-6 text-violet-700" />
                <h3 className="mt-3 font-semibold text-slate-900">
                  Operational speed
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Faster check-in and live attendance visibility at serving
                  points.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <ChartBarIcon className="h-6 w-6 text-violet-700" />
                <h3 className="mt-3 font-semibold text-slate-900">
                  Decision support
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Clear reports for usage trends, payment flow, and planning.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              What customers say
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.name}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex">
                  {[...Array(5)].map((_, index) => (
                    <StarIcon key={index} className="h-4 w-4 text-amber-500" />
                  ))}
                </div>
                <p className="text-sm leading-6 text-slate-700">
                  "{testimonial.quote}"
                </p>
                <p className="mt-4 font-semibold text-slate-900">
                  {testimonial.name}
                </p>
                <p className="text-xs text-slate-500">{testimonial.role}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-8 max-w-2xl">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Frequently asked questions
              </h2>
            </div>
            <div className="space-y-3">
              <details className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <summary className="cursor-pointer font-medium text-slate-900">
                  Is MessMate suitable for both hostels and PGs?
                </summary>
                <p className="mt-2 text-sm text-slate-600">
                  Yes. You can configure meal windows, capacities, and workflows
                  for different accommodation setups.
                </p>
              </details>
              <details className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <summary className="cursor-pointer font-medium text-slate-900">
                  Can students pay through UPI and wallet?
                </summary>
                <p className="mt-2 text-sm text-slate-600">
                  Yes. MessMate supports wallet flow and UPI-friendly payment
                  handling with transaction history.
                </p>
              </details>
              <details className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <summary className="cursor-pointer font-medium text-slate-900">
                  How fast is onboarding for a new campus?
                </summary>
                <p className="mt-2 text-sm text-slate-600">
                  Most teams can complete initial setup quickly and start using
                  booking + QR workflows in a short rollout period.
                </p>
              </details>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-indigo-700 via-violet-700 to-purple-700">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 py-12 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Ready to modernize your dining operations?
              </h2>
              <p className="mt-2 text-violet-100">
                Launch with MessMate and deliver a better student dining
                experience.
              </p>
            </div>
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
              >
                Open Dashboard
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
              >
                Get Started
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-slate-600 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div className="lg:col-span-2">
            <Logo size="md" showText={true} />
            <p className="mt-3 max-w-md text-slate-600">
              MessMate is a modern platform for hostel dining operations,
              combining booking, attendance, payments, and communication.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Product</p>
            <ul className="mt-3 space-y-2">
              <li>
                <a href="#features" className="hover:text-slate-900">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-slate-900">
                  How it works
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-slate-900">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Access</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link to="/login" className="hover:text-slate-900">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-slate-900">
                  Sign up
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-slate-900">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 px-4 py-4 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
          © 2026 MessMate. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
