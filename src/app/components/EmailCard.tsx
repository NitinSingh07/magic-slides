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
    default:
      return "bg-gray-500"; // Default neutral color
  }
};

export default function EmailCard({ email, onEmailSelect }: EmailCardProps) {
  const classificationColor = getClassificationColor(email.classification);

  return (
    <div
      className="bg-gray-800 p-5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-700"
      onClick={() => onEmailSelect(email)}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-lg text-white truncate pr-4">
          {email.subject}
        </h3>
        {email.classification && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${classificationColor} text-white shadow-md`}
          >
            {email.classification}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-400 mb-3 font-medium">
        From: {email.from}
      </p>
      <p className="text-base text-gray-300 line-clamp-3 leading-relaxed">
        {email.body.substring(0, 150)}...
      </p>
    </div>
  );
}
