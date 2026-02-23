import DOMPurify from "dompurify";

/**
 * Sanitize a chat message completely
 * Removes:
 * - All HTML tags
 * - All attributes
 * - Script, style, iframe, onclick, onerror, etc.
 * - Any dangerous code
 * 
 * @param {string} message
 * @returns {string}
 */
export const sanitizeMessage = (message) => {

  console.log(message, "message")
  return DOMPurify.sanitize(message, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover', 'style'],
    KEEP_CONTENT: true,
    RETURN_TRUSTED_TYPE: false 
  }).trim(); 
};
