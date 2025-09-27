// API scaffold with basic GET/POST helpers and error handling

(function () {
  const BASE_URL = "";

  async function request(path, options) {
    const url = BASE_URL + path;
    const defaultHeaders = { "Content-Type": "application/json" };
    const finalOptions = Object.assign({ headers: {} }, options || {});
    finalOptions.headers = Object.assign(
      {},
      defaultHeaders,
      finalOptions.headers || {}
    );

    try {
      const response = await fetch(url, finalOptions);
      const contentType = response.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const body = isJson ? await response.json() : await response.text();
      if (!response.ok) {
        const message =
          isJson && body && body.message ? body.message : response.statusText;
        throw new Error(message || "Request failed");
      }
      return body;
    } catch (err) {
      console.error("API error:", err);
      throw err;
    }
  }

  function get(path) {
    return request(path, { method: "GET", credentials: "include" });
  }

  function post(path, data) {
    return request(path, {
      method: "POST",
      body: JSON.stringify(data),
      credentials: "include",
    });
  }

  function put(path, data) {
    return request(path, {
      method: "PUT",
      body: JSON.stringify(data),
      credentials: "include",
    });
  }

  function del(path) {
    return request(path, { method: "DELETE", credentials: "include" });
  }

  window.API = { get, post, put, del };
})();
