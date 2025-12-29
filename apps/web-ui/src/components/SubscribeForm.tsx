// components/SubscribeForm.tsx
import React from 'react';

export default function SubscribeForm() {
  return (
    <section className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-2">Subscribe for Updates</h2>
      <p className="text-gray-600 mb-4">Stay informed with the latest news and tips.</p>
      <form className="flex flex-col md:flex-row gap-4">
        <input type="text" placeholder="First name" className="border rounded px-4 py-2 flex-1" />
        <input type="email" placeholder="Email address" className="border rounded px-4 py-2 flex-1" />
        <button type="submit" className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 transition">
          Subscribe
        </button>
      </form>
    </section>
  );
}
