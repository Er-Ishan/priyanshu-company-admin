interface User {
  id: string
  email: string
  name: string
  // Extend to include company features
  company_id?: number;
  company_name?: string;
}

export async function getUserFromDb(identifier: string, password: string): Promise<User | null> {
  try {
    const backendUrl =
      process.env.API_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:9000";
    const url = `${backendUrl}/api/admin/login`;

    console.log("[AUTH] Calling backend login:", { url, identifier });

    // Call the new backend admin login endpoint
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Backend accepts either `email` or `name` (username)
      body: JSON.stringify({ email: identifier, name: identifier, password }),
    });

    console.log("[AUTH] Backend response status:", res.status);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[AUTH] Backend admin login failed", {
        url,
        status: res.status,
        body: text?.slice(0, 500),
      });
      return null;
    }

    const data = await res.json();
    console.log("[AUTH] Backend login successful, user found:", !!data.user);
    return data.user || null;
  } catch (error) {
    console.error("Error logging in via backend:", error);
    return null;
  }
}
