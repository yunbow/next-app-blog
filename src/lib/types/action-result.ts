/** 成功レスポンス */
export type ActionSuccess<T> = T extends void
  ? { success: true; data?: undefined }
  : { success: true; data: T };

/** エラーレスポンス */
export type ActionFailure = {
  success: false;
  error: string;
};

/** 統合型（Discriminated Union） */
export type ActionResult<T = void> = ActionSuccess<T> | ActionFailure;
