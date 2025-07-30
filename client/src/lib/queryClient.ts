import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Import api dynamically to avoid circular dependencies
    const { api } = await import('./api');
    const endpoint = queryKey.join("/") as string;
    
    // Handle new API endpoints
    if (endpoint.startsWith('/api/')) {
      try {
        switch (endpoint) {
          case '/api/auth/user':
            return await api.getUser();
          case '/api/dashboard':
            return await api.getDashboard();
          case '/api/practice-hours':
            return await api.getPracticeHours();
          case '/api/cpd':
            return await api.getCpdRecords();
          case '/api/documents':
            return await api.getDocuments();
          case '/api/progress':
            return await api.getProgress();
          case '/api/competencies':
            return await api.getCompetencies();
          default:
            // Fallback to fetch for unknown endpoints
            const res = await fetch(endpoint, {
              credentials: "include",
            });

            if (unauthorizedBehavior === "returnNull" && res.status === 401) {
              return null;
            }

            await throwIfResNotOk(res);
            return await res.json();
        }
      } catch (error: any) {
        if (unauthorizedBehavior === "returnNull" && error.message?.includes('Unauthorized')) {
          return null;
        }
        throw error;
      }
    }
    
    // Non-API endpoints
    const res = await fetch(endpoint, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
