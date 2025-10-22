import EmailCard from "@/app/components/EmailCard";

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  classification?: string;
}

interface EmailListProps {
  emails: Email[];
  onEmailSelect: (email: Email) => void; // New prop for handling email selection
}

export default function EmailList({ emails, onEmailSelect }: EmailListProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {emails.map((email) => (
        <EmailCard key={email.id} email={email} onEmailSelect={onEmailSelect} />
      ))}
    </div>
  );
}
