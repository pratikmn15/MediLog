import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { Link } from "react-router-dom";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // Handle login logic here
  }

  return (
    <section className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div className="w-full max-w-md p-8 mx-4 rounded-2xl shadow-2xl 
        bg-white/20 dark:bg-slate-900/20 backdrop-blur-lg 
        border border-white/30 dark:border-slate-700/30
        relative overflow-hidden">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-green-200 to-blue-200 dark:from-green-900 dark:to-blue-900 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-green-500 to-green-600 flex items-center justify-center mb-3 shadow-lg">
            <svg width={38} height={38} viewBox="0 0 38 38" className="text-white">
              <circle cx={19} cy={19} r={15} fill="currentColor" fillOpacity={0.2} />
              <circle cx={19} cy={19} r={19} stroke="currentColor" strokeWidth={2} fill="none" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-1">Welcome back</h2>
          <span className="text-sm text-slate-600 dark:text-slate-400">Please enter your details to sign in</span>
        </div>

        <button 
          className="w-full mb-6 py-2.5 px-4 border border-slate-300 dark:border-slate-700 rounded-lg 
            flex items-center justify-center gap-2 bg-white/50 dark:bg-slate-800/50 
            hover:bg-white/80 dark:hover:bg-slate-700/50 
            transition-all duration-200 shadow-sm 
            text-slate-700 dark:text-slate-300 font-medium"
        >
          <FaGoogle className="text-xl text-blue-500 dark:text-blue-400" />
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center mb-6">
          <div className="flex-grow h-px bg-slate-300/50 dark:bg-slate-700/50"></div>
          <span className="mx-4 text-sm text-slate-500 dark:text-slate-400">or</span>
          <div className="flex-grow h-px bg-slate-300/50 dark:bg-slate-700/50"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 
                border border-slate-300/80 dark:border-slate-700/80 
                rounded-lg focus:ring-2 focus:ring-green-400 dark:focus:ring-green-500 
                focus:border-transparent outline-none transition duration-200
                text-slate-900 dark:text-slate-100
                placeholder:text-slate-500 dark:placeholder:text-slate-400"
              placeholder="Enter your email..."
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 
                border border-slate-300/80 dark:border-slate-700/80 
                rounded-lg focus:ring-2 focus:ring-green-400 dark:focus:ring-green-500 
                focus:border-transparent outline-none transition duration-200
                text-slate-900 dark:text-slate-100
                placeholder:text-slate-500 dark:placeholder:text-slate-400"
              placeholder="••••••••••••"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm select-none text-slate-600 dark:text-slate-400">
              <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 mr-2 
                focus:ring-green-400 dark:focus:ring-green-500" />
              Remember me
            </label>
            <a href="#" className="text-sm text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300 transition-colors">
              Forgot password?
            </a>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 
              dark:from-green-600 dark:to-green-700
              text-white text-sm rounded-lg font-semibold 
              hover:from-green-600 hover:to-green-700
              dark:hover:from-green-500 dark:hover:to-green-600 
              transition-all duration-300 shadow-lg"
          >
            Sign in
          </button>
        </form>
        <p className="mt-8 text-sm text-center text-slate-600 dark:text-slate-400">
          Don't have an account yet?{" "}
          <Link to="/register">Sign up</Link>
        </p>
      </div>
    </section>
  );
}
