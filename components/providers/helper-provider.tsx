"use client";

import { BackendClient } from "@/lib/request";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { useAlertContext } from "./alert-provider";
import { useFullLoadingContext } from "./full-loading-provider";
import { getItem } from "@/lib/storage";
import { GetUserInfoResponse } from "@/types/lark";

interface HelperContextType {
  setAlert: ReturnType<typeof useAlertContext>;
  setFullLoading: (value: boolean, useDino?: boolean) => boolean;
  backendClient: BackendClient;
  router: ReturnType<typeof useRouter>;
  userInfo: GetUserInfoResponse | undefined;
  setUserInfo: Dispatch<SetStateAction<GetUserInfoResponse | undefined>>;
}

const HelperContext = createContext<() => HelperContextType>(() => {
  return {
    setAlert: (
      title: string,
      text: string,
      action: undefined | (() => void),
      canCancel: boolean,
    ) => [title, text, action, canCancel],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setFullLoading: (value: boolean, useDino: boolean = false) => value,
    backendClient: new BackendClient(
      (
        message: string,
        type: string,
        action: (() => void) | undefined,
        isOpen: boolean,
      ) => {
        void message;
        void type;
        void action;
        void isOpen;
      },
    ),
    router: {} as ReturnType<typeof useRouter>,
    userInfo: undefined,
    setUserInfo: (() => undefined) as Dispatch<
      SetStateAction<GetUserInfoResponse | undefined>
    >,
  };
});

export function HelperProvider({ children }: { children: ReactNode }) {
  const setAlert = useAlertContext();
  const setFullLoading = useFullLoadingContext();
  const router = useRouter();

  const [userInfo, setUserInfo] = useState<GetUserInfoResponse | undefined>(
    () => {
      try {
        const storedUserInfo = getItem("user_info");
        if (storedUserInfo) {
          return JSON.parse(storedUserInfo);
        }
      } catch (e) {
        console.log(e);
        localStorage.removeItem("user_info");
      }
      return undefined;
    },
  );

  useEffect(() => {
    if (!userInfo) {
      router.push("/login");
    }
  }, [userInfo, router]);

  const useHelper = useCallback(
    () => ({
      setAlert,
      setFullLoading,
      backendClient: new BackendClient(setAlert),
      router,
      userInfo,
      setUserInfo,
    }),
    [setAlert, setFullLoading, router, userInfo],
  );

  return (
    <HelperContext.Provider value={useHelper}>
      {children}
    </HelperContext.Provider>
  );
}

export const useHelperContext = () => useContext(HelperContext);
