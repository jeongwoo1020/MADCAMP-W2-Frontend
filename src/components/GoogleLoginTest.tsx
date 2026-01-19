
import React, { useState } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = "1003047877852-lum73alc3idng2m6bf8k92ol9l98j2tj.apps.googleusercontent.com";

const LoginContent = () => {
    const [result, setResult] = useState<any>(null);

    const login = useGoogleLogin({
        onSuccess: async (codeResponse) => {
            console.log("Google Login Success:", codeResponse);
            setResult({ status: 'Getting Token...', code: codeResponse.code });

            try {
                const response = await fetch('http://localhost:8000/api/auth/google_login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token: codeResponse.code }),
                });

                const data = await response.json();
                console.log("Backend Response:", data);
                setResult(data);
            } catch (error) {
                console.error("Backend Error:", error);
                setResult({ error: "Backend request failed", details: error });
            }
        },
        onError: (error) => {
            console.error("Google Login Error:", error);
            setResult({ error: "Google Login failed", details: error });
        },
        flow: 'auth-code',
    });

    return (
        <div className="p-10 flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Google Login Test</h1>
            <p className="mb-4 text-gray-500">Client ID: {GOOGLE_CLIENT_ID.slice(0, 15)}...</p>
            <button
                onClick={() => login()}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#4285F4',
                    color: 'white',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    marginTop: '20px'
                }}
            >
                Sign in with Google
            </button>

            {result && (
                <div className="mt-8 p-4 bg-gray-100 rounded w-full max-w-lg overflow-auto">
                    <h3 className="font-semibold mb-2">Backend Response:</h3>
                    <pre className="text-sm bg-gray-200 p-4 rounded overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default function GoogleLoginTest() {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <LoginContent />
        </GoogleOAuthProvider>
    );
}
