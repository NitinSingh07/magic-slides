"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import EmailList from "@/app/components/EmailList";
import { getClassificationColor } from "@/app/lib/utils";
// Removed import for classifyEmails as it's now handled by API route
// import { classifyEmails } from "@/app/lib/openai"

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  classification?: string;
}

export default function Home() {
  const { data: session } = useSession();
  const [openaiApiKey, setOpenaiApiKey] = useState<string>("");
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [numberOfEmails, setNumberOfEmails] = useState<number>(10); // New state for number of emails
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null); // New state for selected email
  const [isClient, setIsClient] = useState<boolean>(false); // New state for client-side rendering check

  useEffect(() => {
    const key = localStorage.getItem("openaiApiKey");
    if (key) {
      setOpenaiApiKey(key);
    }
    setIsClient(true); // Set isClient to true after component mounts
  }, []);

  useEffect(() => {
    if (session?.accessToken && isClient) {
      fetchEmails();
    }
  }, [session, isClient, numberOfEmails]); // Added numberOfEmails as a dependency

  const handleApiKeySave = () => {
    localStorage.setItem("openaiApiKey", openaiApiKey);
    alert(
      "OpenAI API Key saved locally! (Note: API calls are now server-side.)"
    );
  };

  const fetchEmails = async () => {
    if (!session?.accessToken) {
      setError("Not authenticated or missing access token.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/emails?maxResults=${numberOfEmails}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || response.statusText);
      }
      const data = await response.json();
      setEmails(data.emails);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const classifyAllEmails = async () => {
    if (emails.length === 0) {
      alert("Please fetch emails first before classifying.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emails }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || response.statusText);
      }

      const data = await response.json();
      setEmails(data.classifiedEmails);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email);
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className=" p-8 max-w-sm w-full border border-gray-200">
          <button
            onClick={() => signIn("google")}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-6 hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Login with Google
          </button>
          {isClient && (
            <>
              <div className="relative flex py-5 items-center">
                <div className="grow border-t border-gray-300"></div>
                <div className="grow border-t border-gray-300"></div>
              </div>
              <input
                type="password"
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
                placeholder="Enter OpenAI API Key"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleApiKeySave}
                className="w-full bg-green-600 text-white font-semibold py-3 px-6  hover:bg-green-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 mt-4"
              >
                Enter OpenAI Key
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <header className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between mx-auto max-w-7xl">
        <div className="flex items-start space-x-4">
          <div className="h-8 w-8 rounded-full border border-black flex items-center justify-center bg-white"></div>
          <div className="flex flex-col items-start">
            <p className="font-bold text-gray-900">
              {session.user?.name || "Deadpool"}
            </p>
            <p className="text-sm text-gray-600">
              {session.user?.email || "peterparker@marvel.com"}
            </p>
            <div className="relative flex items-center border border-black px-2 py-0.5 bg-white text-sm leading-none w-10 justify-center mt-1">
              <span className="text-gray-800">{numberOfEmails}</span>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pl-1 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="border border-black px-4 py-2 text-gray-800 bg-white hover:bg-gray-100 transition duration-200"
        >
          Login/Logout
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex justify-end mb-4">
          <button
            onClick={classifyAllEmails}
            disabled={loading || emails.length === 0}
            className="border border-black px-4 py-2 text-gray-800 bg-white hover:bg-gray-100 transition duration-200"
          >
            Classify
          </button>
        </div>

        {error && (
          <div
            className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 relative"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <svg
                className="fill-current h-6 w-6 text-red-500"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                onClick={() => setError(null)}
              >
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 2.65a1.2 1.2 0 1 1-1.697-1.697l2.651-2.651-2.651-2.65a1.2 1.2 0 0 1 1.697-1.697L10 8.183l2.651-2.651a1.2 1.2 0 1 1 1.697 1.697l-2.651 2.651 2.651 2.651a1.2 1.2 0 0 1 0 1.697z" />
              </svg>
            </span>
          </div>
        )}

        {emails.length > 0 && (
          <EmailList emails={emails} onEmailSelect={handleEmailSelect} />
        )}
      </main>

      {/* Right-to-left sliding email detail popup */}
      {selectedEmail && (
        <div
          className={`fixed inset-y-0 right-0 w-full md:w-1/2 lg:w-1/3 bg-white border-l border-black shadow-lg transform transition-transform duration-300 ease-in-out ${
            selectedEmail ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-4">
            <button
              onClick={() => setSelectedEmail(null)}
              className="absolute top-2 left-2 text-gray-800 hover:text-gray-900 border border-black px-2 py-1 bg-white"
            >
              Close
            </button>
            <div className="mt-10">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold text-base text-gray-900">
                  {selectedEmail.from}
                </h2>
                {selectedEmail.classification && (
                  <span
                    className={`px-1 py-0.5 text-xs font-normal ${getClassificationColor(
                      selectedEmail.classification
                    )} whitespace-nowrap border border-black`}
                  >
                    {selectedEmail.classification}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 leading-tight mb-2">
                {selectedEmail.subject}
              </p>
              <div className="p-2 border border-black overflow-y-auto max-h-96 text-sm text-gray-800 whitespace-pre-wrap">
                {selectedEmail.body}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
