export const getClassificationColor = (classification?: string) => {
  switch (classification?.toLowerCase()) {
    case "important":
      return "text-black bg-green-200"; // Green for Important
    case "marketing":
      return "text-black bg-orange-200"; // Orange for Marketing
    case "spam":
      return "text-black bg-red-200"; // Red for Spam
    case "general":
      return "text-black bg-white"; // White background with black text for General
    default:
      return "text-black bg-white"; // Default neutral color (black text, white background)
  }
};
