import { ChatReference, ChatReferenceType } from "@/types";
import { fetchWebContent, searchWebByQuery } from "./webSearcher";

export const enhanceReference = async (
  reference: ChatReference
): Promise<ChatReference> => {
  if (reference.referenceType === ChatReferenceType.WEB) {
    const webSearchResult = await fetchWebContent(reference.referenceTarget);
    reference.referenceContent = webSearchResult;
  }

  return reference;
};
