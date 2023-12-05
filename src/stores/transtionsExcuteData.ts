import { create } from 'zustand';

export type IExcuteStatus = 'pending' | 'resolved' | 'rejected' | 'none';

type ITranstionsExcuteDataStore = {
  actionPage: string;
  actionStatus: IExcuteStatus;
  actionCallBackData: any;
  setActionPage: (p: string) => void;
  setActionStatus: (p: IExcuteStatus) => void;
  setactionCallBackData: (p: any) => void;
  getActionPage: () => any;
  getActionStatus: () => any;
  getActionCallBackData: () => any;
};
export const useTranstionsExcuteDataStore = create<ITranstionsExcuteDataStore>(
  (set, get: any) => ({
    actionPage: '',
    actionStatus: 'none',
    actionCallBackData: undefined,
    setActionPage: (name) => set({ actionPage: name }),
    setActionStatus: (status: IExcuteStatus) => set({ actionStatus: status }),
    setactionCallBackData: (data) => set({ actionCallBackData: data }),
    getActionPage: () => get().actionPage,
    getActionStatus: () => get().actionStatus,
    getActionCallBackData: () => get().actionCallBackData,
  })
);
