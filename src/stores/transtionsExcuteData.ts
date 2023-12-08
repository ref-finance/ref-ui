import { create } from 'zustand';

export const constTransactionPage = {
  swap: 'swap',
  pool: 'pool',
  farm: 'farm',
  xref: 'xref',
};

export type IExcuteStatus = 'pending' | 'resolved' | 'rejected' | 'none';

type IActionData = {
  status: 'pending' | 'success' | 'error';
  page?: string;
  data?: any;
  onClose?: () => any;
  transactionResponse?: any;
  transactionError?: any;
};

type ITranstionsExcuteDataStore = {
  actionPage: string;
  actionStatus: IExcuteStatus;
  actionData: any;
  actionCallBackData: any;
  setActionPage: (p: string) => void;
  setActionStatus: (p: IExcuteStatus) => void;
  setActionData: (p: IActionData) => void;
  removeActionData: () => void;
  getActionPage: () => any;
  getActionStatus: () => any;
  getActionData: () => any;
  getActionCallBackData: () => any;
};
export const useTranstionsExcuteDataStore = create<ITranstionsExcuteDataStore>(
  (set, get: any) => ({
    actionPage: '',
    actionStatus: 'none',
    actionData: undefined,
    actionCallBackData: undefined,
    setActionPage: (name) => set({ actionPage: name }),
    setActionStatus: (status: IExcuteStatus) => set({ actionStatus: status }),
    setActionData: (data) =>
      set((state) => ({ actionData: { ...state.actionData, ...data } })),
    removeActionData: () => set({ actionData: null }),
    getActionPage: () => get().actionPage,
    getActionStatus: () => get().actionStatus,
    getActionData: () => get().actionData,
    getActionCallBackData: () => get().actionCallBackData,
  })
);
