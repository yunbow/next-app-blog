import type { Translations } from "./ja";

export const en: Translations = {
  // Metadata (for SEO)
  metadata: {
    siteTitle: "Blog - Blogging Platform",
    siteDescription: "A blogging platform where you can write and share articles in Markdown",
  },

  // Common
  common: {
    search: "Search...",
    login: "Login",
    logout: "Logout",
    register: "Sign Up",
    cancel: "Cancel",
    or: "or",
    view: "View",
    nameNotSet: "No Name",
    getStarted: "Get Started",
    submitting: "Submitting...",
    loading: "Loading...",
    appName: "Blog",
  },

  // Theme
  theme: {
    light: "Light",
    dark: "Dark",
    system: "System",
  },

  // Language
  language: {
    ja: "日本語",
    en: "English",
  },

  // Navigation
  nav: {
    home: "Home",
    dashboard: "Dashboard",
    search: "Search",
    newArticle: "New Article",
    bookmarks: "Bookmarks",
    notifications: "Notifications",
    profile: "Profile",
    settings: "Settings",
    expand: "Expand",
    collapse: "Collapse",
    unreadNotifications: "{count} unread notifications",
  },

  // Accessibility
  accessibility: {
    showPassword: "Show password",
    hidePassword: "Hide password",
    switchLanguage: "Switch language",
    switchTheme: "Switch theme",
    required: "Required",
    homeLink: "Back to home",
    footerNavigation: "Footer navigation",
    skipToContent: "Skip to main content",
    userMenu: "User menu",
    mobileNavigation: "Mobile navigation",
    selectLanguage: "Select language",
    selectTheme: "Select theme",
    selectFontSize: "Select font size",
    selectColorVision: "Select color vision mode",
    opensInNewTab: "Open {name} in a new tab",
  },

  // Footer
  footer: {
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    cookies: "Cookie Policy",
    about: "About",
    copyright: "© 2026 Blog. All rights reserved.",
  },

  // Login
  login: {
    title: "Login",
    description: "Sign in to your account",
    email: "Email",
    emailPlaceholder: "email@example.com",
    password: "Password",
    submit: "Login",
    submitting: "Logging in...",
    noAccount: "Don't have an account?",
    invalidCredentials: "Invalid email or password",
    failed: "Login failed",
    continueWithGoogle: "Continue with Google",
    continueWithGithub: "Continue with GitHub",
  },

  // Registration
  registration: {
    success: "Registration complete. Please log in.",
    failed: "Registration failed",
    submitting: "Registering...",
    complete: "Complete registration",
    sendEmail: "Send registration email",
    sending: "Sending...",
    title: "Sign Up",
    description: "Enter your email to get started",
    emailSent: "Verification email sent",
    emailSentDescription: "Click the link in the email to complete your registration.",
    devPreview: "Development: Email preview",
    devTo: "To",
    devSubject: "Subject",
    devBody: "Body",
    devBodyText: "Thank you for registering with Blog. Click the link below to complete your registration.",
    devLinkValid: "This link is valid for 24 hours.",
    backToLogin: "Back to login",
    alreadyHaveAccount: "Already have an account?",
    termsAgreePrefix: "By creating an account, you agree to the ",
    termsConnector: " and ",
    termsIncludingCookie: " (including {cookie})",
    termsAgreeSuffix: ".",
    termsLink: "Terms of Service",
    privacyLink: "Privacy Policy",
    cookieLink: "Cookie use",
  },

  // Landing Page
  landing: {
    hero: {
      title: "Share Your Knowledge",
      subtitle: "Write articles in Markdown and share with the world. Monetize your content on our blogging platform.",
      cta: "Get started for free",
    },
    features: {
      title: "What you can do with Blog",
      markdown: {
        title: "Write in Markdown",
        description: "Create articles with simple and powerful Markdown syntax",
      },
      share: {
        title: "Easy Sharing",
        description: "Publish articles and connect with readers",
      },
      monetize: {
        title: "Monetization",
        description: "Turn your knowledge into revenue with paid articles",
      },
    },
  },

  // Cookie Consent
  cookieConsent: {
    message: "We use cookies to improve our service. By clicking 'Accept', you agree to our use of cookies.",
    accept: "Accept",
    decline: "Decline",
  },

  // Logout
  logout: {
    title: "Logout",
    confirm: "Are you sure you want to logout?",
  },

  // Settings
  settings: {
    title: "Settings",
    appearance: "Appearance",
    appearanceDescription: "Language and theme settings",
    language: "Display Language",
    languageDescription: "Select display language",
    theme: "Theme",
    themeDescription: "Light, dark, or system preference",
    fontSize: "Font Size",
    fontSizeDescription: "Adjust text size",
    fontSizeSmall: "Small",
    fontSizeMedium: "Medium",
    fontSizeLarge: "Large",
    colorVision: "Visual Support",
    colorVisionDescription: "Display for color vision characteristics",
    colorVisionNormal: "Normal",
    colorVisionProtanopia: "Protanopia (Red)",
    colorVisionDeuteranopia: "Deuteranopia (Green)",
    colorVisionTritanopia: "Tritanopia (Blue)",
    account: "Account Information",
    accountDescription: "Email, user ID, and account deletion",
    loginHistory: "Login History",
    loginHistoryDescription: "View recent login history",
    changePassword: "Change Password",
    changePasswordDescription: "Change your password",
  },

  // About Page
  about: {
    title: "About the Creator",
    authorName: "yunbow",
    serviceTitle: "About This Service",
    serviceDescription: "This service is a blog application created for personal learning purposes. It is developed using modern technology stacks such as Next.js, TypeScript, Prisma, and NextAuth.",
  },
};
