import { Size } from "../../types/common";

type LoadingSpinnerProps = {
  text?: string;
  size?: Size;
  className?: string;
  textClassName?: string;
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = "Duke u ngarkuar...",
  size = "md",
  className = "",
  textClassName = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const textSizeClasses = {
    sm: "text-base",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center ${className} h-full`}
    >
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-neutral-700 border-t-white`}
      />
      {text && (
        <p
          className={`text-gray-400 ${textSizeClasses[size]} ${textClassName}`}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
