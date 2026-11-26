export async function request(
  url,
  options = {},
  fallbackMessage = "Unable to connect to the server. Please try again.",
  parseJson = true,
  includeAuth = true,
) {
  const token = includeAuth ? localStorage.getItem("token") : null;
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    throw new Error(fallbackMessage, { cause: error });
  }

  if (includeAuth && response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-expired"));
  }

  let data = {};
  if (parseJson) {
    try {
      data = await response.json();
    } catch (error) {
      if (response.ok) {
        throw new Error("The server returned an invalid response. Please try again.", {
          cause: error,
        });
      }
    }
  }

  return {
    response,
    data,
    fallbackMessage,
  };
}
