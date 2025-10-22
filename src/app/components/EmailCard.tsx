interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  classification?: string;
}

interface EmailCardProps {
  email: Email;
  onEmailSelect: (email: Email) => void; // Add this line
}

const getClassificationColor = (classification?: string) => {
  switch (classification?.toLowerCase()) {
    case "important":
      return "bg-red-600"; // Red for Important
    case "marketing":
      return "bg-orange-500"; // Orange for Marketing
    case "spam":
      return "bg-gray-500"; // Gray for Spam
    case "general":
      return "bg-gray-400"; // Lighter gray for General, as in mockup
    default:
      return "bg-gray-500"; // Default neutral color
  }
};

export default function EmailCard({ email, onEmailSelect }: EmailCardProps) {
  const classificationColor = getClassificationColor(email.classification);

  return (
    <div
      className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-200"
      onClick={() => onEmailSelect(email)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-base text-gray-900 pr-2">
          {email.subject}
        </h3>
        {email.classification && (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${classificationColor} text-white whitespace-nowrap`}
          >
            {email.classification}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-2">
        From: <span className="font-medium">{email.from}</span>
      </p>
      <p className="text-sm text-gray-700 line-clamp-2">
        {email.body.substring(0, 100)}...
      </p>
    </div>
  );
}
