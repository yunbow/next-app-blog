export type Translations = {
  metadata: {
    siteTitle: string;
    siteDescription: string;
  };
  common: {
    search: string;
    login: string;
    logout: string;
    register: string;
    cancel: string;
    or: string;
    view: string;
    nameNotSet: string;
    getStarted: string;
    submitting: string;
    loading: string;
    appName: string;
  };
  theme: {
    light: string;
    dark: string;
    system: string;
  };
  language: {
    ja: string;
    en: string;
  };
  nav: {
    home: string;
    dashboard: string;
    search: string;
    newArticle: string;
    bookmarks: string;
    notifications: string;
    profile: string;
    settings: string;
    expand: string;
    collapse: string;
    unreadNotifications: string;
  };
  accessibility: {
    showPassword: string;
    hidePassword: string;
    switchLanguage: string;
    switchTheme: string;
    required: string;
    homeLink: string;
    footerNavigation: string;
    skipToContent: string;
    userMenu: string;
    mobileNavigation: string;
    selectLanguage: string;
    selectTheme: string;
    selectFontSize: string;
    selectColorVision: string;
    opensInNewTab: string;
  };
  footer: {
    terms: string;
    privacy: string;
    cookies: string;
    about: string;
    copyright: string;
  };
  login: {
    title: string;
    description: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    submit: string;
    submitting: string;
    noAccount: string;
    invalidCredentials: string;
    failed: string;
    continueWithGoogle: string;
    continueWithGithub: string;
  };
  registration: {
    success: string;
    failed: string;
    submitting: string;
    complete: string;
    sendEmail: string;
    sending: string;
    title: string;
    description: string;
    emailSent: string;
    emailSentDescription: string;
    devPreview: string;
    devTo: string;
    devSubject: string;
    devBody: string;
    devBodyText: string;
    devLinkValid: string;
    backToLogin: string;
    alreadyHaveAccount: string;
    termsAgreePrefix: string;
    termsConnector: string;
    termsIncludingCookie: string;
    termsAgreeSuffix: string;
    termsLink: string;
    privacyLink: string;
    cookieLink: string;
  };
  landing: {
    hero: {
      title: string;
      subtitle: string;
      cta: string;
    };
    features: {
      title: string;
      markdown: {
        title: string;
        description: string;
      };
      share: {
        title: string;
        description: string;
      };
      monetize: {
        title: string;
        description: string;
      };
    };
  };
  cookieConsent: {
    message: string;
    accept: string;
    decline: string;
  };
  logout: {
    title: string;
    confirm: string;
  };
  settings: {
    title: string;
    appearance: string;
    appearanceDescription: string;
    language: string;
    languageDescription: string;
    theme: string;
    themeDescription: string;
    fontSize: string;
    fontSizeDescription: string;
    fontSizeSmall: string;
    fontSizeMedium: string;
    fontSizeLarge: string;
    colorVision: string;
    colorVisionDescription: string;
    colorVisionNormal: string;
    colorVisionProtanopia: string;
    colorVisionDeuteranopia: string;
    colorVisionTritanopia: string;
    account: string;
    accountDescription: string;
    loginHistory: string;
    loginHistoryDescription: string;
    changePassword: string;
    changePasswordDescription: string;
  };
  about: {
    title: string;
    authorName: string;
    serviceTitle: string;
    serviceDescription: string;
  };
};

export const ja: Translations = {
  // Metadata (for SEO)
  metadata: {
    siteTitle: "Blog - ブログプラットフォーム",
    siteDescription: "Markdownで記事を投稿・共有できるブログプラットフォーム",
  },

  // Common
  common: {
    search: "検索...",
    login: "ログイン",
    logout: "ログアウト",
    register: "新規登録",
    cancel: "キャンセル",
    or: "または",
    view: "見る",
    nameNotSet: "名前未設定",
    getStarted: "始める",
    submitting: "送信中...",
    loading: "読み込み中...",
    appName: "Blog",
  },

  // Theme
  theme: {
    light: "ライト",
    dark: "ダーク",
    system: "システム",
  },

  // Language
  language: {
    ja: "日本語",
    en: "English",
  },

  // Navigation
  nav: {
    home: "ホーム",
    dashboard: "ダッシュボード",
    search: "検索",
    newArticle: "新規記事",
    bookmarks: "ブックマーク",
    notifications: "通知",
    profile: "プロフィール",
    settings: "設定",
    expand: "展開",
    collapse: "折りたたむ",
    unreadNotifications: "{count}件の未読通知",
  },

  // Accessibility
  accessibility: {
    showPassword: "パスワードを表示",
    hidePassword: "パスワードを隠す",
    switchLanguage: "言語を切り替え",
    switchTheme: "テーマを切り替え",
    required: "必須",
    homeLink: "ホームへ戻る",
    footerNavigation: "フッターナビゲーション",
    skipToContent: "メインコンテンツへスキップ",
    userMenu: "ユーザーメニュー",
    mobileNavigation: "モバイルナビゲーション",
    selectLanguage: "言語を選択",
    selectTheme: "テーマを選択",
    selectFontSize: "フォントサイズを選択",
    selectColorVision: "色覚モードを選択",
    opensInNewTab: "{name}を新しいタブで開く",
  },

  // Footer
  footer: {
    terms: "利用規約",
    privacy: "プライバシーポリシー",
    cookies: "Cookieポリシー",
    about: "作成者",
    copyright: "© 2026 Blog. All rights reserved.",
  },

  // Login
  login: {
    title: "ログイン",
    description: "アカウントにログインしてください",
    email: "メールアドレス",
    emailPlaceholder: "email@example.com",
    password: "パスワード",
    submit: "ログイン",
    submitting: "ログイン中...",
    noAccount: "アカウントをお持ちでないですか？",
    invalidCredentials: "メールアドレスまたはパスワードが正しくありません",
    failed: "ログインに失敗しました",
    continueWithGoogle: "Google でログイン",
    continueWithGithub: "GitHub でログイン",
  },

  // Registration
  registration: {
    success: "登録が完了しました。ログインしてください。",
    failed: "登録に失敗しました",
    submitting: "登録中...",
    complete: "登録を完了する",
    sendEmail: "登録メールを送信",
    sending: "送信中...",
    title: "新規登録",
    description: "メールアドレスを入力して登録を開始",
    emailSent: "確認メールを送信しました",
    emailSentDescription: "メールに記載されたリンクをクリックして、登録を完了してください。",
    devPreview: "開発環境: メールプレビュー",
    devTo: "宛先",
    devSubject: "件名",
    devBody: "本文",
    devBodyText: "Blogへのご登録ありがとうございます。以下のリンクをクリックして、登録を完了してください。",
    devLinkValid: "このリンクは24時間有効です。",
    backToLogin: "ログインページへ戻る",
    alreadyHaveAccount: "既にアカウントをお持ちですか？",
    termsAgreePrefix: "アカウントを登録することにより、",
    termsConnector: "と",
    termsIncludingCookie: "（{cookie}を含む）",
    termsAgreeSuffix: "に同意したとみなされます。",
    termsLink: "利用規約",
    privacyLink: "プライバシーポリシー",
    cookieLink: "Cookieの使用",
  },

  // Landing Page
  landing: {
    hero: {
      title: "あなたの知識を共有しよう",
      subtitle: "Markdownで記事を書いて、世界中の人と共有。収益化も可能なブログプラットフォーム。",
      cta: "無料で始める",
    },
    features: {
      title: "Blogでできること",
      markdown: {
        title: "Markdownで執筆",
        description: "シンプルで強力なMarkdown記法で記事を作成",
      },
      share: {
        title: "簡単に共有",
        description: "記事を公開して、読者とつながる",
      },
      monetize: {
        title: "収益化",
        description: "有料記事で知識を収益に変える",
      },
    },
  },

  // Cookie Consent
  cookieConsent: {
    message: "このサイトでは、サービスの向上のためにCookieを使用しています。Cookieの使用に同意いただける場合は「同意する」をクリックしてください。",
    accept: "同意する",
    decline: "拒否する",
  },

  // Logout
  logout: {
    title: "ログアウト",
    confirm: "ログアウトしますか？",
  },

  // Settings
  settings: {
    title: "設定",
    appearance: "外観",
    appearanceDescription: "表示言語とテーマの設定",
    language: "表示言語",
    languageDescription: "表示言語を選択",
    theme: "テーマ",
    themeDescription: "ライト、ダーク、またはシステム設定",
    fontSize: "フォントサイズ",
    fontSizeDescription: "テキストの大きさを調整",
    fontSizeSmall: "小",
    fontSizeMedium: "中",
    fontSizeLarge: "大",
    colorVision: "視覚サポート",
    colorVisionDescription: "色覚特性に応じた表示",
    colorVisionNormal: "標準",
    colorVisionProtanopia: "1型色覚（赤）",
    colorVisionDeuteranopia: "2型色覚（緑）",
    colorVisionTritanopia: "3型色覚（青）",
    account: "アカウント情報",
    accountDescription: "メールアドレス、ユーザーID、アカウント削除",
    loginHistory: "ログイン履歴",
    loginHistoryDescription: "最近のログイン履歴を確認",
    changePassword: "パスワード変更",
    changePasswordDescription: "パスワードを変更",
  },

  // About Page
  about: {
    title: "作成者について",
    authorName: "ゆんぼう | yunbow",
    serviceTitle: "このサービスについて",
    serviceDescription: "このサービスは、個人の学習目的で作成されたブログアプリケーションです。Next.js、TypeScript、Prisma、NextAuthなどのモダンな技術スタックを使用して開発されています。",
  },
};
