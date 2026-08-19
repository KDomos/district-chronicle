const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

class ApiError extends Error {
  constructor(message, status, detail) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

async function request(path, { method = "GET", body, isForm = false, params } = {}) {
  let url = `${API_URL}${path}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const opts = {
    method,
    credentials: "include",
    headers: {},
  };

  if (body !== undefined) {
    if (isForm) {
      opts.body = body;
    } else {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
  }

  const res = await fetch(url, opts);

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message = (data && data.detail) || res.statusText || "Request failed";
    throw new ApiError(message, res.status, data && data.detail);
  }

  return data;
}

export const api = {
  get: (path, params) => request(path, { method: "GET", params }),
  post: (path, body) => request(path, { method: "POST", body }),
  postQuery: (path, params) => request(path, { method: "POST", params }),
  put: (path, body) => request(path, { method: "PUT", body }),
  del: (path) => request(path, { method: "DELETE" }),
  upload: (path, file) => {
    const form = new FormData();
    form.append("file", file);
    return request(path, { method: "POST", body: form, isForm: true });
  },
};

export function fileUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = API_URL.replace(/\/api\/?$/, "");
  return `${base}${path}`;
}

export { ApiError, API_URL };
