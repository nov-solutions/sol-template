import { AuthProvider } from "@/contexts/auth-context";
import { GoogleAnalyticsProvider } from "@/providers/google-analytics-provider";
import ProgressBarProvider from "@/providers/progressBarProvider";
import { ThemeProvider } from "@/providers/theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleAnalyticsProvider>
      <ProgressBarProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </ProgressBarProvider>
    </GoogleAnalyticsProvider>
  );
}
