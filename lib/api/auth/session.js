import Cookies from "js-cookie";

export function decodeAccessToken(token) {
  if (!token || typeof token !== "string" || token.split(".").length !== 3) return null;
  try {
    const payloadBase64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(payloadBase64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(json);

    // FIX: Properly extract the ASP.NET Core Role Claim
    const roleClaim =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"] ||
      payload.role ||
      payload.Role;

    let parsedRole = null;
    if (Array.isArray(roleClaim)) {
      if (roleClaim.includes("Admin")) parsedRole = "Admin";
      else if (roleClaim.includes("ContentCreator")) parsedRole = "ContentCreator";
      else if (roleClaim.includes("Student")) parsedRole = "Student";
    } else {
      parsedRole = roleClaim;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      role: parsedRole,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const decoded = decodeAccessToken(token);
  if (!decoded || !decoded.exp) return true;
  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime >= decoded.exp - 30; // buffer of 30 seconds
}

export function persistSessionFromAuthResult(authResult) {
  if (!authResult?.accessToken) return { role: null, userId: null, email: null };

  const decoded = decodeAccessToken(authResult.accessToken);

  if (decoded?.role) {
    Cookies.set("cessa_role", decoded.role, {
      path: "/",
      sameSite: "Lax",
      secure: true,
      expires: 7,
    });
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("cessa_role", decoded?.role || "");
    localStorage.setItem("cessa_access_token", authResult.accessToken);
    if (authResult.refreshToken) {
        localStorage.setItem("cessa_refresh_token", authResult.refreshToken);
    }

    if (decoded) {
      localStorage.setItem(
        "cessa_user",
        JSON.stringify({ id: decoded.sub, email: decoded.email })
      );
    }
  }

  return {
    role: decoded?.role || null,
    userId: decoded?.sub || null,
    email: decoded?.email || null,
  };
}

export function clearClientSession() {
  Cookies.remove("cessa_role", { path: "/" });
  if (typeof window !== "undefined") {
    localStorage.removeItem("cessa_role");
    localStorage.removeItem("cessa_access_token");
    localStorage.removeItem("cessa_refresh_token");
    localStorage.removeItem("cessa_user");
  }
}
