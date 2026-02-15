import { useBookmarkStore } from "@/store/bookmarkStore";
import { useReactConfStore } from "@/store/reactConfStore";
import { formatSession } from "@/utils/sessions";
import { Session } from "@/types";

export function useBookmark() {
  const toggleBookmarked = useBookmarkStore((state) => state.toggleBookmarked);
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const allSessions = useReactConfStore((state) => state.allSessions);

  const toggleBookmark = async (session: Session, _withHaptics = true) => {
    const currentBookmark = bookmarks.find((b) => b.sessionId === session.id);

    if (currentBookmark) {
      toggleBookmarked(session.id);
    } else {
      toggleBookmarked(session.id, undefined);
    }
  };

  const isBookmarked = (sessionId: string) => {
    return bookmarks.some((b) => b.sessionId === sessionId);
  };

  const getBookmark = (sessionId: string) => {
    return bookmarks.find((b) => b.sessionId === sessionId);
  };

  const getSessionById = (sessionId: string): Session | undefined => {
    const apiSession = allSessions.sessions.find(
      (session) => session.id === sessionId,
    );
    if (apiSession) {
      return formatSession(apiSession, allSessions);
    }
    return undefined;
  };

  const toggleBookmarkById = async (sessionId: string, withHaptics = true) => {
    const session = getSessionById(sessionId);
    if (session) {
      await toggleBookmark(session, withHaptics);
    }
  };

  return {
    toggleBookmark,
    toggleBookmarkById,
    isBookmarked,
    getBookmark,
    getSessionById,
    bookmarks,
  };
}
