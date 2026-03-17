import { Platform } from "react-native";

// Use local network IP for physical devices/emulators
// Change this to your computer's local IP address
const LOCAL_IP = "192.168.1.139";

const getApiUrl = () => {
  if (Platform.OS === "android") {
    return `http://${LOCAL_IP}:4000/api`;
  }
  return "http://localhost:4000/api";
};

const API_URL = getApiUrl();

// Token getter and clear functions (set by authService to avoid circular dependency)
let getTokenFn: (() => Promise<string | null>) | null = null;
let clearTokenFn: (() => Promise<void>) | null = null;

export const setTokenGetter = (fn: () => Promise<string | null>) => {
  getTokenFn = fn;
};

export const setTokenClearer = (fn: () => Promise<void>) => {
  clearTokenFn = fn;
};

const handleServerError = (status: number): void => {
  if (status === 500 && clearTokenFn) {
    clearTokenFn();
  }
};

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): Promise<string | null> {
    if (getTokenFn) {
      return getTokenFn();
    }
    return Promise.resolve(null);
  }

  private getHeaders(includeAuth: boolean = false): Promise<HeadersInit> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      return this.getAuthToken().then((token) => {
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        return headers;
      });
    }

    return Promise.resolve(headers);
  }

  public get<T>(endpoint: string, authenticated: boolean = false): Promise<T> {
    return this.getHeaders(authenticated)
      .then((headers) => {
        return fetch(`${this.baseUrl}${endpoint}`, {
          method: "GET",
          headers,
        });
      })
      .then((response) => {
        if (response.status === 401) {
          // Clear invalid token on authentication errors only
          if (clearTokenFn) {
            clearTokenFn();
          }
          throw new Error("Unauthorized");
        }
        if (response.status === 403) {
          // Forbidden - don't clear token, just throw error
          throw new Error("Forbidden");
        }
        if (!response.ok) {
          handleServerError(response.status);
          return response
            .json()
            .then((error) => {
              console.error("API Error Response:", error);
              throw new Error(
                error.error || `Request failed with status ${response.status}`,
              );
            })
            .catch((parseError) => {
              console.error("Failed to parse error response:", parseError);
              throw new Error(`Request failed with status ${response.status}`);
            });
        }
        return response.json();
      })
      .then((data) => data as T)
      .catch((error) => {
        if (error.message !== "Unauthorized" && error.message !== "Forbidden") {
          console.error("API GET Error:", endpoint, error.message || error);
        }
        if (error.message && error.message.includes("Network request failed")) {
          throw new Error(
            "Cannot connect to server. Make sure backend is running and network is accessible.",
          );
        }
        throw error;
      });
  }

  public post<T>(
    endpoint: string,
    body: any,
    authenticated: boolean = false,
  ): Promise<T> {
    return this.getHeaders(authenticated)
      .then((headers) => {
        return fetch(`${this.baseUrl}${endpoint}`, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
      })
      .then((response) => {
        if (response.status === 401) {
          // Clear invalid token on authentication errors only
          if (clearTokenFn) {
            clearTokenFn();
          }
          throw new Error("Unauthorized");
        }
        if (!response.ok) {
          handleServerError(response.status);
          return response
            .json()
            .then((error) => {
              console.error(
                "API Error Response (status " + response.status + "):",
                JSON.stringify(error, null, 2),
              );
              // Handle changeset errors (422 with errors object)
              if (error.errors && typeof error.errors === "object") {
                const errorMessages = Object.entries(error.errors)
                  .map(
                    ([field, messages]) =>
                      `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`,
                  )
                  .join("; ");
                throw new Error(errorMessages || "Validation failed");
              }
              throw new Error(
                error.error || `Request failed with status ${response.status}`,
              );
            })
            .catch((parseError) => {
              // If we can't parse the error, check if it's a 403
              if (response.status === 403) {
                throw new Error("You are no longer connected with this person");
              }
              // If parseError is already an Error with a message, re-throw it
              if (
                parseError instanceof Error &&
                parseError.message !==
                  `Request failed with status ${response.status}`
              ) {
                throw parseError;
              }
              console.error("Failed to parse error response:", parseError);
              throw new Error(`Request failed with status ${response.status}`);
            });
        }
        return response.json();
      })
      .then((data) => data as T)
      .catch((error) => {
        console.error("API POST Error:", error);
        throw error;
      });
  }

  public put<T>(
    endpoint: string,
    body: any,
    authenticated: boolean = false,
  ): Promise<T> {
    return this.getHeaders(authenticated)
      .then((headers) => {
        return fetch(`${this.baseUrl}${endpoint}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(body),
        });
      })
      .then((response) => {
        if (response.status === 401) {
          // Clear invalid token on authentication errors only
          if (clearTokenFn) {
            clearTokenFn();
          }
          throw new Error("Unauthorized");
        }
        if (!response.ok) {
          handleServerError(response.status);
          return response
            .json()
            .then((error) => {
              console.error(
                "API Error Response (status " + response.status + "):",
                JSON.stringify(error, null, 2),
              );
              // Handle changeset errors (422 with errors object)
              if (error.errors && typeof error.errors === "object") {
                const errorMessages = Object.entries(error.errors)
                  .map(
                    ([field, messages]) =>
                      `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`,
                  )
                  .join("; ");
                throw new Error(errorMessages || "Validation failed");
              }
              throw new Error(
                error.error || `Request failed with status ${response.status}`,
              );
            })
            .catch((parseError) => {
              // If we can't parse the error, check if it's a 403
              if (response.status === 403) {
                throw new Error("You are no longer connected with this person");
              }
              // If parseError is already an Error with a message, re-throw it
              if (
                parseError instanceof Error &&
                parseError.message !==
                  `Request failed with status ${response.status}`
              ) {
                throw parseError;
              }
              console.error("Failed to parse error response:", parseError);
              throw new Error(`Request failed with status ${response.status}`);
            });
        }
        return response.json();
      })
      .then((data) => data as T)
      .catch((error) => {
        console.error("API PUT Error:", error);
        throw error;
      });
  }

  /**
   * Uploads a file (multipart/form-data)
   */
  public upload<T>(
    endpoint: string,
    formData: FormData,
    authenticated: boolean = false,
    onProgress?: (progress: number) => void,
  ): Promise<T> {
    return this.getAuthToken()
      .then((token) => {
        const headers: HeadersInit = {};
        // Don't set Content-Type for multipart/form-data - browser will set it with boundary
        if (authenticated && token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        return new Promise<Response>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          // Track upload progress
          if (onProgress) {
            xhr.upload.addEventListener("progress", (e) => {
              if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                onProgress(percentComplete);
              }
            });
          }

          xhr.addEventListener("load", () => {
            if (xhr.status === 401) {
              if (clearTokenFn) {
                clearTokenFn();
              }
              reject(new Error("Unauthorized"));
            } else if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                resolve(data as any);
              } catch (e) {
                resolve(xhr.response as any);
              }
            } else {
              try {
                const error = JSON.parse(xhr.responseText);
                reject(
                  new Error(
                    error.error || `Upload failed with status ${xhr.status}`,
                  ),
                );
              } catch (e) {
                reject(new Error(`Upload failed with status ${xhr.status}`));
              }
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Network error during upload"));
          });

          xhr.addEventListener("abort", () => {
            reject(new Error("Upload aborted"));
          });

          xhr.open("POST", `${this.baseUrl}${endpoint}`);

          // Set auth header
          if (authenticated && token) {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          }

          xhr.send(formData);
        });
      })
      .then((data) => data as T)
      .catch((error) => {
        console.error("API Upload Error:", error);
        throw error;
      });
  }

  public delete<T>(
    endpoint: string,
    authenticated: boolean = false,
  ): Promise<T> {
    return this.getHeaders(authenticated)
      .then((headers) => {
        return fetch(`${this.baseUrl}${endpoint}`, {
          method: "DELETE",
          headers,
        });
      })
      .then((response) => {
        if (response.status === 401) {
          // Clear invalid token on authentication errors only
          if (clearTokenFn) {
            clearTokenFn();
          }
          throw new Error("Unauthorized");
        }
        if (response.status === 403) {
          // Forbidden - don't clear token, just throw error
          throw new Error("Forbidden");
        }
        if (!response.ok) {
          handleServerError(response.status);
          return response
            .json()
            .then((error) => {
              throw new Error(error.error || "Request failed");
            })
            .catch(() => {
              throw new Error("Request failed");
            });
        }
        if (response.status === 204) {
          return undefined as T;
        }
        return response.json();
      })
      .then((data) => data as T)
      .catch((error) => {
        console.error("API DELETE Error:", error);
        throw error;
      });
  }
}

export const api = new ApiService(API_URL);
export default api;
