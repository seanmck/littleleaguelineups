// components/Card.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface CardProps {
  image: string;
  title: string;
  description: string;
  buttonLabel: string;
  onClick?: () => void;
  linkTo: string;
}

export default function Card({ image, title, description, buttonLabel, linkTo }: CardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <img src={image} alt={title} className="rounded mb-4 w-full object-cover" />
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link
        to={linkTo}
        className="inline-block bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
      >
        {buttonLabel}
      </Link>
    </div>
  );
}
