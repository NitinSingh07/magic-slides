import { getClassificationColor } from "@/app/lib/utils";

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

export default function EmailCard({ email, onEmailSelect }: EmailCardProps) {
  const classificationColor = getClassificationColor(email.classification);

  return (
    <div
      className="bg-white p-2 border border-black cursor-pointer"
      onClick={() => onEmailSelect(email)}
    >
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-normal text-base text-gray-900 pr-2">
          {email.from}
        </h3>
        {email.classification && (
          <span
            className={`px-1 py-0.5 text-xs font-normal ${classificationColor} whitespace-nowrap border border-black`}
          >
            {email.classification}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-700 leading-tight">{email.subject}</p>
      <p className="text-xs text-gray-600 leading-tight mt-1 line-clamp-2">
        {email.body.substring(0, 100)}...
      </p>
    </div>
  );
}
