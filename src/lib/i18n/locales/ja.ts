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
      kicker: string;
      title: string;
      subtitle: string;
      cta: string;
      secondaryCta: string;
      statArticles: string;
      statArticlesLabel: string;
      statModes: string;
      statModesLabel: string;
      statSignals: string;
      statSignalsLabel: string;
    };
    features: {
      title: string;
      subtitle: string;
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
      audience: {
        title: string;
        description: string;
      };
      organize: {
        title: string;
        description: string;
      };
      notify: {
        title: string;
        description: string;
      };
    };
    workflow: {
      kicker: string;
      title: string;
      subtitle: string;
      draft: {
        label: string;
        title: string;
        description: string;
      };
      publish: {
        label: string;
        title: string;
        description: string;
      };
      learn: {
        label: string;
        title: string;
        description: string;
      };
    };
    cta: {
      title: string;
      description: string;
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
    subscription: string;
    subscriptionDescription: string;
    billing: string;
    currentPlan: string;
    planFree: string;
    planBasic: string;
    planPremium: string;
    planBasicDescription: string;
    planPremiumDescription: string;
    switchPlan: string;
    cancelSubscription: string;
    cancelConfirm: string;
    currentPlanBadge: string;
    renewsOn: string;
    cancelsOn: string;
    switchSuccess: string;
    checkoutRedirecting: string;
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
      kicker: "Markdownで書き、読者に届け、反応を育てる",
      title: "あなたの知識を共有しよう",
      subtitle: "記事の執筆、公開、検索、コメント、リアクション、ブックマークまでをひとつにまとめたブログプラットフォーム。",
      cta: "無料で始める",
      secondaryCta: "ログイン",
      statArticles: "Markdown",
      statArticlesLabel: "快適な執筆",
      statModes: "Public / Draft",
      statModesLabel: "公開管理",
      statSignals: "Comments + Reactions",
      statSignalsLabel: "読者の反応",
    },
    features: {
      title: "Blogでできること",
      subtitle: "個人の学習メモから公開記事まで、書いたあとに必要になる運用もまとめて扱えます。",
      markdown: {
        title: "Markdownで執筆",
        description: "プレビューを見ながら、画像付きの記事を素早く整えられます。",
      },
      share: {
        title: "簡単に共有",
        description: "公開記事は検索、カテゴリ、タグから見つけやすくなります。",
      },
      monetize: {
        title: "収益化",
        description: "有料記事を見据えたコンテンツ管理にも対応できます。",
      },
      audience: {
        title: "読者との接点",
        description: "コメント、リアクション、通知で記事への反応を追えます。",
      },
      organize: {
        title: "保存と整理",
        description: "ブックマークとコレクションで読み返したい記事を管理できます。",
      },
      notify: {
        title: "運用を見逃さない",
        description: "フォローやコメントなどの更新を通知で確認できます。",
      },
    },
    workflow: {
      kicker: "記事公開の流れ",
      title: "公開までの流れをシンプルに",
      subtitle: "書く前後の作業を分断せず、記事を継続的に改善しやすい形に整えています。",
      draft: {
        label: "01",
        title: "下書きを作る",
        description: "Markdown、画像、カテゴリ、タグをまとめて編集します。",
      },
      publish: {
        label: "02",
        title: "公開して届ける",
        description: "検索や共有から読者に届く公開記事として配信します。",
      },
      learn: {
        label: "03",
        title: "反応を見て育てる",
        description: "コメント、リアクション、ブックマークを手がかりに改善します。",
      },
    },
    cta: {
      title: "最初の記事を公開しよう",
      description: "学んだこと、試したこと、誰かに残したい知識をすぐに記事にできます。",
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
    subscription: "サブスクリプション",
    subscriptionDescription: "現在のプランと請求情報",
    billing: "プラン・お支払い",
    currentPlan: "現在のプラン",
    planFree: "フリー",
    planBasic: "Basic",
    planPremium: "Premium",
    planBasicDescription: "基本機能をすべて利用できるスタンダードプラン",
    planPremiumDescription: "すべての機能を制限なく利用できるプレミアムプラン",
    switchPlan: "このプランに切り替え",
    cancelSubscription: "解約する",
    cancelConfirm: "サブスクリプションを解約しますか？現在の期間終了後に解約されます。",
    currentPlanBadge: "現在のプラン",
    renewsOn: "次回更新日: {date}",
    cancelsOn: "解約予定日: {date}",
    switchSuccess: "プランを切り替えました",
    checkoutRedirecting: "決済ページへ移動中...",
  },

  // About Page
  about: {
    title: "作成者について",
    authorName: "ゆんぼう | yunbow",
    serviceTitle: "このサービスについて",
    serviceDescription: "このサービスは、個人の学習目的で作成されたブログアプリケーションです。Next.js、TypeScript、Prisma、NextAuthなどのモダンな技術スタックを使用して開発されています。",
  },
};
