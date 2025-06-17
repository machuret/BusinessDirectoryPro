import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let text: string;
    try {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const json = await res.json();
        text = json.message || json.error || JSON.stringify(json);
      } else {
        const responseText = await res.text();
        // Check if we received HTML instead of JSON (common routing issue)
        if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
          text = 'Received HTML instead of JSON - this may be a routing configuration issue';
        } else {
          text = responseText || res.statusText;
        }
      }
    } catch (e) {
      text = res.statusText;
    }
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const absoluteUrl = ensureAbsoluteUrl(url);
  const res = await fetch(absoluteUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
// Helper function to ensure absolute URLs
function ensureAbsoluteUrl(url: string): string {
  // If URL already starts with /, it's absolute
  if (url.startsWith('/')) {
    return url;
  }
  
  // If URL starts with http, it's already a full URL
  if (url.startsWith('http')) {
    return url;
  }
  
  // Otherwise, make it absolute by adding leading slash
  return `/${url}`;
}

// Custom fetch function that suppresses console errors for auth endpoints
async function silentFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (error) {
    // For auth endpoints, suppress network errors in console
    if (url.includes('/api/auth/')) {
      // Create a mock response for 401 to prevent console errors
      return new Response(null, { status: 401, statusText: 'Unauthorized' });
    }
    throw error;
  }
}

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const absoluteUrl = ensureAbsoluteUrl(queryKey[0] as string);
    const isAuthEndpoint = absoluteUrl.includes('/api/auth/');
    
    const res = await (isAuthEndpoint ? silentFetch : fetch)(absoluteUrl, {
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
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
