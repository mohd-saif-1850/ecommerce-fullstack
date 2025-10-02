import { useEffect, useState } from "react";
import axios from "axios";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/get-all-items`);
        setItems(res.data.items);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchItems();
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {items.map((item) => (
        <li
          key={item._id}
          id={item._id} // for scroll if needed
          className="flex flex-col bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden hover:scale-[1.02] hover:shadow-2xl transition duration-300"
        >
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-48 object-cover cursor-pointer"
              onClick={() => navigate(`/items/${item._id}`)}
            />
          ) : (
            <div
              className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
              onClick={() => navigate(`/items/${item._id}`)}
            >
              No Image
            </div>
          )}

          <div className="p-5 flex flex-col justify-between flex-grow">
            <h2 className="font-semibold text-lg mb-1 text-gray-800 dark:text-gray-100">{item.name}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
              {item.description || "No description available"}
            </p>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                <p className="font-bold text-xl text-cyan-600">${item.price}</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg shadow-md transition">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default Home;
