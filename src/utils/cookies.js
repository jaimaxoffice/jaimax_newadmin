// utils/cookies.js
export const setCookie = (name, value, days = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(
        typeof value === "object" ? JSON.stringify(value) : value
    )};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure`;
};

export const getCookie = (name) => {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(nameEQ)) {
            try {
                const value = decodeURIComponent(cookie.substring(nameEQ.length));
                return JSON.parse(value);
            } catch {
                return decodeURIComponent(cookie.substring(nameEQ.length));
            }
        }
    }
    return null;
};

export const removeCookie = (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict`;
};

export const clearAllCookies = () => {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        const name = cookie.split("=")[0].trim();
        removeCookie(name);
    }
};