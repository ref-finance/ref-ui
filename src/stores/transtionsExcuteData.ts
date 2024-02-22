import { create } from 'zustand';

export const constTransactionPage = {
  swap: 'swap',
  limitOrder: 'limitOrder',
  pool: 'pool',
  farm: 'farm',
  xref: 'xref',
  meme: 'meme',
};

export type IExcuteStatus = 'pending' | 'resolved' | 'rejected' | 'none';

type IActionData = {
  status: 'pending' | 'success' | 'error';
  page?: string;
  data?: any;
  onClose?: () => any;
  transactionId?: number | string;
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
  processTransactionPending: (p: {
    data?: any;
    page?: string;
    transactionId: string;
    onClose?: Function;
  }) => void;
  processTransactionSuccess: (p: {
    transactionResponse: any;
    transactionId: string;
    onClose?: () => any;
    headerText?: string;
  }) => void;
  processTransactionError: (p: {
    error: any;
    transactionId: string;
    data?: any;
  }) => void;
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
    processTransactionPending: ({ data, page, transactionId, onClose }) =>
      set({
        actionData: {
          onClose,
          status: 'pending',
          transactionId,
          page,
          data,
        },
        actionStatus: 'pending',
      }),
    processTransactionSuccess: ({
      transactionResponse,
      transactionId,
      headerText,
    }) =>
      set((state) => {
        const oriActionData = state?.actionData || {};
        if (headerText && oriActionData?.data) {
          oriActionData.data.headerText = headerText;
        }
        delete oriActionData.transactionId;
        return {
          actionData: {
            ...oriActionData,
            status: 'success',
            transactionId,
            transactionResponse,
          },
          actionStatus: 'resolved',
        };
      }),
    processTransactionError: ({ error, transactionId, data }) =>
      set((state) => {
        const toUpdate: any = {
          actionData: {
            status: 'error',
            transactionId,
            transactionError: {
              message: error?.message,
              transactionId,
            },
            data,
          },
          actionStatus: 'rejected',
        };
        // prevent to show loading spinner when user rejected
        // const isUserRejected = error?.message
        //   .toLowerCase()
        //   .startsWith('user reject');
        // if (!isUserRejected) {
        //   toUpdate.actionStatus = 'rejected';
        // }
        return toUpdate;
      }),
    removeActionData: () => set({ actionData: null }),
    getActionPage: () => get().actionPage,
    getActionStatus: () => get().actionStatus,
    getActionData: () => get().actionData,
    getActionCallBackData: () => get().actionCallBackData,
  })
);
