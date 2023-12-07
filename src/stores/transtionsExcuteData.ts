import { create } from 'zustand';

export type IExcuteStatus =
  | 'pending'
  | 'success'
  | 'error'
  | 'resolved'
  | 'rejected'
  | 'none';

type IActionCallBackData = {
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
  setActionData: (p: any) => void;
  setactionCallBackData: (p: IActionCallBackData) => void;
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
    setActionData: (data) => set({ actionData: data }),
    setactionCallBackData: (data) => set({ actionCallBackData: data }),
    getActionPage: () => get().actionPage,
    getActionStatus: () => get().actionStatus,
    getActionData: () => get().actionData,
    getActionCallBackData: () => get().actionCallBackData,
  })
);
