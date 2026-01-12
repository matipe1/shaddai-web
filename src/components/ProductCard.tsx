import { Link } from "react-router-dom";

interface Props {
  id: number;
  title: string;
  price: number;
  image_url: string;
}

export function ProductCard({ id, title, price, image_url }: Props) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group flex flex-col h-full">
      {/* Hacemos que la imagen también sea clickeable */}
      <Link
        to={`/producto/${id}`}
        className="h-64 overflow-hidden bg-gray-100 relative block"
      >
        <img
          src={image_url}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      <div className="p-4 flex flex-col grow">
        <h3 className="text-lg font-medium text-gray-800 mb-2 truncate">
          {title}
        </h3>
        <div className="mt-auto flex justify-between items-center">
          <span className="text-xl font-bold text-amber-600">
            {formatPrice(price)}
          </span>
          {/* El botón ahora es un Link */}
          <Link
            to={`/producto/${id}`}
            className="bg-neutral-900 text-white px-3 py-1.5 rounded text-sm hover:bg-neutral-800 transition"
          >
            Ver detalle
          </Link>
        </div>
      </div>
    </div>
  );
}
