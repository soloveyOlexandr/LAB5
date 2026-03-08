export default function MovieCard({ film }) {
  return (
    <a
      href={film.link}
      target="_blank"
      rel="noreferrer"
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full transform hover:-translate-y-1"
    >
      <div className="relative overflow-hidden aspect-[2/3]">
        <img
          src={film.poster}
          alt={film.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/200x300?text=No+Poster';
          }}
        />
        {film.rating > 0 && (
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-yellow-400 px-2 py-1 rounded-lg font-bold text-sm shadow-lg">
            ★ {film.rating}
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-xl leading-tight mb-2 text-gray-900 group-hover:text-orange-600 transition-colors">
          {film.title}
        </h3>
        {film.review && film.review !== 'Watched' && (
          <p className="text-sm text-gray-600 line-clamp-3 mt-auto relative pl-3 border-l-2 border-orange-200 italic">
            &ldquo;{film.review}&rdquo;
          </p>
        )}
      </div>
    </a>
  );
}
