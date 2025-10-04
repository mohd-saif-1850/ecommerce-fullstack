import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { ShoppingCart } from "lucide-react";

const Items = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/admin/get-all-items`
        );

        const found = res.data.items.find((i) => i._id === id);
        setItem(found || null);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setItem(null);
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (loading) {
    return <p className="text-center mt-10 text-gray-500 dark:text-gray-400">Loading...</p>;
  }

  if (!item) {
    return <p className="text-center mt-10 text-red-500 dark:text-red-400">Item not found!</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-5 md:p-10 flex flex-col md:flex-row gap-8">
      <div className="flex-1">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-96 object-cover rounded-lg shadow-md"
          />
        ) : (
          <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {item.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{item.description || "No description available"}</p>
          <p className="text-xl font-semibold text-cyan-600 mb-2">Price: ${item.price}</p>
          <p className="text-gray-700 dark:text-gray-200 mb-4">Quantity: {item.quantity}</p>
        </div>

        <button className="flex items-center cursor-pointer gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg shadow-md transition w-full md:w-auto">
          <ShoppingCart className="w-5 h-5" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default Items;
