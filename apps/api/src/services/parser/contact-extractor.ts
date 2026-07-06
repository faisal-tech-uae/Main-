const EMAIL_FIND_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_FIND_REGEX = /\+?\d{1,3}?[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g;
const LINKEDIN_FIND_REGEX = /(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/(?:in|pub)\/[a-zA-Z0-9-_%]+/gi;

export interface ExtractedContact {
  emails: string[];
  phones: string[];
  linkedinUrls: string[];
}

export function extractContactInfo(rawText: string): ExtractedContact {
  const emails = [...new Set(rawText.match(EMAIL_FIND_REGEX) ?? [])];
  const linkedinUrls = [...new Set(rawText.match(LINKEDIN_FIND_REGEX) ?? [])];

  const rawPhoneMatches = rawText.match(PHONE_FIND_REGEX) ?? [];
  const phones = [...new Set(rawPhoneMatches.filter((p) => p.replace(/\D/g, "").length >= 7))];

  return { emails, phones, linkedinUrls };
}
