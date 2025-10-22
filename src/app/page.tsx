"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import EmailList from "@/app/components/EmailList";
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 p-10 rounded-lg shadow-2xl text-center max-w-lg w-full transform hover:scale-105 transition-transform duration-300">
          <h1 className="text-5xl font-extrabold mb-6 text-white tracking-tight">
            MagicSlides
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Your smart email classifier. Please log in to get started.
          </p>
          <button
            onClick={() => signIn("google")}
            className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Login with Google
          </button>
          {isClient && (
            <>
              <div className="mt-4 text-gray-400">OR</div>
              <input
                type="password"
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
                placeholder="Enter OpenAI API KEY"
                className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 mt-4"
              />
              <button
                onClick={handleApiKeySave}
                className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 mt-4"
              >
                Save API Key
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 sm:p-10 font-sans">
      <header className="flex justify-between items-center py-4 px-6 bg-gray-800 shadow-md">
        <h1 className="text-2xl font-bold text-white">Email Classifier</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-300">
            Standpoint {session.user?.email}
          </span>
          <button
            onClick={() => signOut()}
            className="bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 transition duration-300"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto flex mt-8">
        <div className="w-full lg:w-2/3 pr-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-bold mb-4 text-white">Settings</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label
                  htmlFor="numEmails"
                  className="block text-gray-300 text-sm font-bold mb-2"
                >
                  Select number of emails to classify:
                </label>
                <select
                  id="numEmails"
                  value={numberOfEmails}
                  onChange={(e) => setNumberOfEmails(Number(e.target.value))}
                  className="block w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col space-y-4">
              <button
                onClick={fetchEmails}
                disabled={loading}
                className="w-full bg-purple-600 text-white font-semibold py-3 px-5 rounded-md hover:bg-purple-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Fetching...
                  </span>
                ) : (
                  `Fetch Last ${numberOfEmails} Emails`
                )}
              </button>
              <button
                onClick={classifyAllEmails}
                disabled={loading || emails.length === 0}
                className="w-full bg-yellow-500 text-white font-semibold py-3 px-5 rounded-md hover:bg-yellow-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Classifying...
                  </span>
                ) : (
                  "Classify Emails"
                )}
              </button>
            </div>
          </div>

          {emails.length > 0 && (
            <EmailList emails={emails} onEmailSelect={handleEmailSelect} />
          )}
        </div>
        <div className="w-full lg:w-1/3 pl-6">
          {/* Side panel for detailed email view */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-3 text-white">
              Selected Email
            </h2>
            {selectedEmail ? (
              <div>
                <p className="text-gray-300">From: {selectedEmail.from}</p>
                <p className="text-gray-300">
                  Subject: {selectedEmail.subject}
                </p>
                {selectedEmail.classification && (
                  <p className="text-gray-300">
                    Classification: {selectedEmail.classification}
                  </p>
                )}
                <div className="mt-4 p-4 bg-gray-700 rounded-md max-h-96 overflow-y-auto">
                  <p className="text-gray-200 whitespace-pre-wrap">
                    {selectedEmail.body}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">
                Click on an email to view its full content here.
              </p>
            )}
          </div>
        </div>
      </main>

      {error && (
        <div className="fixed bottom-0 left-0 right-0 bg-red-800 text-white px-5 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <strong className="font-bold">1 Issue:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-white opacity-75 hover:opacity-100 focus:outline-none"
          >
            X
          </button>
        </div>
      )}
    </div>
  );
}
