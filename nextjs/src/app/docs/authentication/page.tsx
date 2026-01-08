export default function AuthenticationPage() {
  return (
    <div>
      <h1>Authentication</h1>
      <p className="lead">
        Sol uses session-based authentication with django-allauth, supporting
        both email/password and Google OAuth.
      </p>

      <h2>Overview</h2>
      <p>The authentication system includes:</p>
      <ul>
        <li>Email/password registration and login</li>
        <li>Google OAuth integration</li>
        <li>Email verification (optional but encouraged)</li>
        <li>Password reset via email</li>
        <li>Session-based auth with CSRF protection</li>
      </ul>

      <h2>API Endpoints</h2>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Endpoint</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>POST</td>
            <td>
              <code>/api/auth/register/</code>
            </td>
            <td>Create new account</td>
          </tr>
          <tr>
            <td>POST</td>
            <td>
              <code>/api/auth/login/</code>
            </td>
            <td>Login with email/password</td>
          </tr>
          <tr>
            <td>POST</td>
            <td>
              <code>/api/auth/logout/</code>
            </td>
            <td>Logout (clear session)</td>
          </tr>
          <tr>
            <td>GET</td>
            <td>
              <code>/api/auth/user/</code>
            </td>
            <td>Get current user</td>
          </tr>
          <tr>
            <td>POST</td>
            <td>
              <code>/api/auth/forgot-password/</code>
            </td>
            <td>Request password reset</td>
          </tr>
          <tr>
            <td>POST</td>
            <td>
              <code>/api/auth/reset-password/</code>
            </td>
            <td>Reset password with token</td>
          </tr>
          <tr>
            <td>GET</td>
            <td>
              <code>/api/auth/verify-email/&lt;token&gt;/</code>
            </td>
            <td>Verify email address</td>
          </tr>
          <tr>
            <td>POST</td>
            <td>
              <code>/api/auth/resend-verification/</code>
            </td>
            <td>Resend verification email</td>
          </tr>
          <tr>
            <td>GET</td>
            <td>
              <code>/api/auth/google/login/</code>
            </td>
            <td>Start Google OAuth flow</td>
          </tr>
        </tbody>
      </table>

      <h2>Frontend Usage</h2>
      <p>
        Use the <code>useAuth</code> hook to access authentication state and
        methods:
      </p>

      <pre>
        <code>{`import { useAuth } from "@/hooks/use-auth";

function MyComponent() {
  const { user, loading, login, logout, register } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <button onClick={() => login(email, password)}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}`}</code>
      </pre>

      <h3>Auth Context Methods</h3>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>login(email, password)</code>
            </td>
            <td>Login with credentials</td>
          </tr>
          <tr>
            <td>
              <code>register(email, password)</code>
            </td>
            <td>Create new account</td>
          </tr>
          <tr>
            <td>
              <code>logout()</code>
            </td>
            <td>End current session</td>
          </tr>
          <tr>
            <td>
              <code>refreshUser()</code>
            </td>
            <td>Reload user data</td>
          </tr>
        </tbody>
      </table>

      <h2>Route Protection</h2>
      <p>
        Routes are protected using Next.js middleware. Protected routes redirect
        unauthenticated users to the login page.
      </p>

      <pre>
        <code>{`// middleware.ts
const protectedPaths = ["/dashboard"];
const authPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("sessionid");
  const path = request.nextUrl.pathname;

  // Redirect to login if accessing protected route without session
  if (protectedPaths.some(p => path.startsWith(p)) && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect to dashboard if accessing auth pages while logged in
  if (authPaths.some(p => path.startsWith(p)) && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
}`}</code>
      </pre>

      <h2>Email Verification</h2>
      <p>
        Email verification is optional but recommended. Users can log in without
        verifying their email, but unverified accounts are deleted after 7 days.
      </p>
      <p>
        A verification email is sent automatically on registration. Users can
        request a new verification email from their account settings.
      </p>

      <h2>Google OAuth Setup</h2>
      <p>To enable Google OAuth:</p>
      <ol>
        <li>
          Go to the{" "}
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener"
          >
            Google Cloud Console
          </a>
        </li>
        <li>Create a new OAuth 2.0 Client ID</li>
        <li>
          Set the authorized redirect URI to{" "}
          <code>https://yourdomain.com/api/auth/google/callback/</code>
        </li>
        <li>
          Add the credentials to your <code>.env</code> file:
        </li>
      </ol>

      <pre>
        <code>{`GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret`}</code>
      </pre>

      <h2>Password Requirements</h2>
      <ul>
        <li>Minimum 8 characters</li>
        <li>Validated on both frontend and backend</li>
      </ul>

      <h2>Session Configuration</h2>
      <p>
        Sessions are stored in Redis with a 2-week expiration. The session
        cookie is HTTP-only and secure in production.
      </p>

      <pre>
        <code>{`# settings/components/redis.py
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"
SESSION_COOKIE_AGE = 60 * 60 * 24 * 14  # 2 weeks`}</code>
      </pre>

      <h2>Next Steps</h2>
      <ul>
        <li>
          Configure <a href="/docs/stripe-setup">Stripe Payments</a>
        </li>
        <li>
          Set up <a href="/docs/environment-variables">Environment Variables</a>
        </li>
      </ul>
    </div>
  );
}
