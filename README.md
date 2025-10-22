# Email Classification Application

## Project Overview

This is a Next.js application designed to fetch emails from Gmail, classify them using OpenAI's API, and display them in a user-friendly interface. It allows users to log in with their Google account, specify the number of emails to retrieve, and view email classifications (Important, Marketing, Spam).

## Features

- **Google Authentication:** Secure login using NextAuth.js with Google Provider.
- **Gmail Integration:** Fetches emails from the user's Gmail account.
- **OpenAI Email Classification:** Classifies fetched emails into "Important", "Marketing", or "Spam" categories using the OpenAI GPT-4o model.
- **Dynamic Email Display:** Users can select the number of emails (10, 20, 50) to display.
- **Email List View:** Displays a list of emails with sender, subject, and classification tags.
- **Email Detail View:** A right-sliding panel to view the full content of a selected email, including its classification.
- **Responsive UI:** Built with Tailwind CSS for a modern and responsive user experience.

## Setup

Follow these steps to set up the project locally:

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd assignement
```

### 2. Install Dependencies

This project uses `pnpm` as its package manager. If you don't have `pnpm` installed, you can install it globally:

```bash
npm install -g pnpm
```

Then, install the project dependencies:

```bash
pnpm install
```

### 3. Environment Variables

Create a `.env.local` file in the root of your project and add the following environment variables:

```env
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
NEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

- **`GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`**: Obtain these from the Google Cloud Console by setting up an OAuth 2.0 Client ID for a Web application. Make sure to add `http://localhost:3000/api/auth/callback/google` as an Authorized redirect URI.
- **`NEXTAUTH_SECRET`**: A random string used to hash tokens, sign/encrypt cookies, and generate cryptographically secure URLs. You can generate a strong secret using `openssl rand -base64 32` or a similar tool.
- **`OPENAI_API_KEY`**: Obtain your API key from the OpenAI developer platform.

### 4. Run the Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. **Login with Google:** Click the "Login with Google" button to authenticate your Google account.
2. **Enter OpenAI API Key:** (If prompted, though API calls are server-side now, the input is still present for local storage of a key if needed for other functionality later on).
3. **Select Number of Emails:** Use the dropdown in the header to choose how many emails you want to fetch (10, 20, or 50).
4. **Classify Emails:** Click the "Classify" button to analyze your fetched emails using OpenAI.
5. **View Email Details:** Click on any email in the list to open a side panel displaying its full content and classification.
