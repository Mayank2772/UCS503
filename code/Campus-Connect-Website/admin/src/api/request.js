export async function request(
  url,
  options = {},
  fallbackMessage = "Request failed",
  parseJson = true,
) {
  const token = localStorage.getItem("token");
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-expired"));
  }

  return {
    response,
    data: parseJson ? await response.json().catch(() => ({})) : {},
    fallbackMessage,
  };
}
