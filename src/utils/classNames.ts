/**
 * Utility function to conditionally join class names
 * @param classes - Array of class names or objects with boolean values
 * @returns Joined class names string
 */
export const classNames = (...classes: (string | boolean | undefined | null | Record<string, boolean>)[]): string => {
  return classes
    .filter(Boolean)
    .map((cls) => {
      if (typeof cls === "string") return cls;
      if (typeof cls === "object" && cls !== null) {
        return Object.entries(cls)
          .filter(([, value]) => value)
          .map(([key]) => key)
          .join(" ");
      }
      return "";
    })
    .join(" ")
    .trim();
};

/**
 * Utility for creating conditional class names with a base class
 * @param baseClass - Base class name
 * @param conditionalClasses - Object with conditional classes
 * @returns Joined class names string
 */
export const conditionalClass = (
  baseClass: string,
  conditionalClasses: Record<string, boolean> = {}
): string => {
  return classNames(baseClass, conditionalClasses);
}; 