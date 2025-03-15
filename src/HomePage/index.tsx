import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate("/ppl");
  };

  return (
    <div className="flex flex-col justify-center items-center p-6 text-center">
      <h1 className="text-3xl font-bold">Select an activity</h1>
      <button
        onClick={handleButtonClick}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 max-w-lg w-full"
      >
        PPL
      </button>
    </div>
  );
};

export default HomePage;
