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

interface HeaderContextType {
  title: string;
  setTitle: (title: string) => void;
}

interface HelperContextType {
  setAlert: ReturnType<typeof useAlertContext>;
  setFullLoading: (value: boolean, useDino?: boolean) => boolean;
  backendClient: BackendClient;
  router: ReturnType<typeof useRouter>;
  userInfo: GetUserInfoResponse | undefined;
  setUserInfo: Dispatch<SetStateAction<GetUserInfoResponse | undefined>>;
  header: HeaderContextType;
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
    header: {
      title: "",
      setTitle: () => {},
    },
  };
});

export function HelperProvider({ children }: { children: ReactNode }) {
  const setAlert = useAlertContext();
  const setFullLoading = useFullLoadingContext();
  const router = useRouter();
  const [title, setTitle] = useState<string>("");

  const [userInfo, setUserInfo] = useState<GetUserInfoResponse | undefined>(
    () => {
      try {
        const storedUserInfo = getItem("user_info");
        if (!storedUserInfo) {
          return undefined;
        }
        if (typeof storedUserInfo === "string") {
          return JSON.parse(storedUserInfo) as GetUserInfoResponse;
        }
        return storedUserInfo as GetUserInfoResponse;
      } catch (e) {
        console.log(e);
        localStorage.removeItem("user_info");
        return undefined;
      }
    },
  );

  useEffect(() => {
    if (!userInfo) {
      router.push("/");
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
      header: {
        title,
        setTitle,
      },
    }),
    [setAlert, setFullLoading, router, userInfo?.user_id, title],
  );

  return (
    <HelperContext.Provider value={useHelper}>
      {children}
    </HelperContext.Provider>
  );
}

export const useHelperContext = () => useContext(HelperContext);
