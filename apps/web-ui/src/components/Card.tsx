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
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <img src={image} alt={title} className="rounded-lg mb-4 w-full aspect-[4/3] object-cover" />
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      <p className="text-sm text-slate-500 mt-1 mb-4 flex-1">{description}</p>
      <Link
        to={linkTo}
        className="inline-block text-center bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        {buttonLabel}
      </Link>
    </div>
  );
}
