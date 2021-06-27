export interface ContentObject {
  language: string,
  minFontSize: number,
  mode: string
}

export interface ContentResponse {
  received: boolean,
  multipleFrames: boolean
}

export interface ValidityCheck {
  valid: boolean,
  message: string | undefined
}

export interface TabInfo { 
  tabId: number;
  browserValid: ValidityCheck;
  urlValid: ValidityCheck
}

export interface StoredData {
  minFontSize: number;
  language: string
}

export interface FontSizeObject {
  minFontSize: number;
}

export interface LanguageObject {
  language: string;
}

export interface ErrorMessageType {
  errorMessage: string
}

export interface LowerProps {
  minFontSize: number,
  changeHandler: handleFSChange,
  iFrames: boolean
}

export interface FontSizeButtonsProps {
  minFontSize: number;
  changeHandler: handleFSChange
}

export interface NotificationProps {
  iFrames: boolean
}

export interface UpperProps {
  language: string;
  changeHandler: handleLangChange
}

export interface LangSelectProps {
  language: string;
  changeHandler: handleLangChange
}

export type ErrorCallbackFunc = (
  injectionError: string | undefined,
  contentResponse: ContentResponse
) => void;

export type GetQueryResult = () => Promise<chrome.tabs.Tab[]>

export type fetchStoredData = () => StoredData;

export type fetchTabInfo = () => TabInfo;

export type handleLangChange = (newLanguage: string) => void;

export type handleFSChange = (minFontSize: number) => void;