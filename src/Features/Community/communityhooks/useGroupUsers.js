import { useState, useRef } from "react";
import { useLazyGetUsersQuery } from "../communityApiSlice";

/**
 * useGroupUsers
 * Handles paginated user fetching for a selected group.
 */
const useGroupUsers = (selectedGroup) => {
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [totalUsers, setTotalUsers]         = useState(0);
  const [userPage, setUserPage]             = useState(1);
  const [totalPages, setTotalPages]         = useState(1);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingMoreUsers, setIsLoadingMoreUsers] = useState(false);
  const [hasMoreUsers, setHasMoreUsers]     = useState(true);

  const isLoadingUsersRef    = useRef(false);
  const lastScrollDirection  = useRef(null);

  const [fetchUsers] = useLazyGetUsersQuery();

  const fetchUsersPage = async (page) => {
    if (isLoadingUsersRef.current) return;
    if (page < 1 || (totalPages > 0 && page > totalPages)) return;
    if (!selectedGroup?.chatId) return;

    isLoadingUsersRef.current = true;
    setIsLoadingUsers(true);

    try {
      const result = await fetchUsers({
        page,
        limit: 10,
        chatId: selectedGroup.chatId,
      }).unwrap();

      setDisplayedUsers(result.users || []);
      setUserPage(page);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoadingUsers(false);
      isLoadingUsersRef.current = false;
    }
  };

  const loadMoreUsers = async () => {
    if (isLoadingMoreUsers || !hasMoreUsers) return;
    setIsLoadingMoreUsers(true);
    const nextPage = userPage + 1;
    try {
      const result = await fetchUsers({ page: nextPage, limit: 10 }).unwrap();
      setUserPage(nextPage);
      setHasMoreUsers(result.hasMore);
    } catch (error) {
      console.error("Failed to load more users:", error);
    } finally {
      setIsLoadingMoreUsers(false);
    }
  };

  const resetUsers = () => {
    setDisplayedUsers([]);
    setUserPage(1);
    setTotalPages(1);
    setIsLoadingUsers(false);
    isLoadingUsersRef.current = false;
    lastScrollDirection.current = null;
  };

  return {
    displayedUsers,
    totalUsers,
    setTotalUsers,
    userPage,
    totalPages,
    isLoadingUsers,
    isLoadingMoreUsers,
    hasMoreUsers,
    fetchUsersPage,
    loadMoreUsers,
    resetUsers,
  };
};

export default useGroupUsers;