import { BranchMapping } from "@/types/database";

type BranchMappingPayload = Omit<BranchMapping, "index">;

const withJsonHeaders = (init: RequestInit = {}) => ({
  ...init,
  headers: {
    "Content-Type": "application/json",
    ...(init.headers ?? {}),
  },
});

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let message = response.statusText;
    try {
      const data = await response.json();
      if (typeof data.message === "string") {
        message = data.message;
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const fetchBranchMappings = async (): Promise<BranchMapping[]> => {
  const response = await fetch("/api/branch-mapping", {
    method: "GET",
  });
  return parseJsonResponse<BranchMapping[]>(response);
};

export const fetchBranchMappingsByShop = async (
  shopBr: string,
): Promise<BranchMapping[]> => {
  const response = await fetch(
    `/api/branch-mapping?shop_br=${encodeURIComponent(shopBr)}`,
    {
      method: "GET",
    },
  );
  return parseJsonResponse<BranchMapping[]>(response);
};

export const createBranchMapping = async (
  payload: BranchMappingPayload,
): Promise<BranchMapping> => {
  const response = await fetch(
    "/api/branch-mapping",
    withJsonHeaders({
      method: "POST",
      body: JSON.stringify(payload),
    }),
  );
  return parseJsonResponse<BranchMapping>(response);
};

export const updateBranchMapping = async (
  originalShopBr: string,
  shopBr: string,
  shopName: string,
) => {
  const response = await fetch(
    "/api/branch-mapping",
    withJsonHeaders({
      method: "PUT",
      body: JSON.stringify({
        originalShopBr,
        shopBr,
        shopName,
      }),
    }),
  );

  return parseJsonResponse<BranchMapping[]>(response);
};

export const deleteBranchMapping = async (index: number) => {
  const response = await fetch(
    "/api/branch-mapping",
    withJsonHeaders({
      method: "DELETE",
      body: JSON.stringify({ index }),
    }),
  );

  await parseJsonResponse<{ success: boolean }>(response);
};

export const addActivityLogs = async (
  message: string,
  ref: string,
  refId: string,
) => {
  await fetch(
    "/api/activity-logs",
    withJsonHeaders({
      method: "POST",
      body: JSON.stringify({ message, ref, refId }),
    }),
  ).then(parseJsonResponse);
};

export const fetchActivityLogs = async (ref: string, refId: string) => {
  const response = await fetch(
    `/api/activity-logs?ref=${encodeURIComponent(ref)}&refId=${encodeURIComponent(refId)}`,
    {
      method: "GET",
    },
  );

  return parseJsonResponse<
    Array<{
      id: number;
      message: string;
      ref: string;
      ref_id: string;
      created_at: string;
    }>
  >(response);
};
