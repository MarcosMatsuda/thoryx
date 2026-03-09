export type RootStackParamList = {
  'add-credit-card': undefined;
  'emergency': undefined;
  'add-document': { documentId?: string } | undefined;
  'document-details': { documentId: string };
  'emergency-details': undefined;
  'select-documents': undefined;
  'unlock': undefined;
  'home': undefined;
  'index': undefined;
  'modal': undefined;
  '(tabs)': undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
