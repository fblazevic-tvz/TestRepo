import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import {
  checkAuthStatus as checkAuthApi,
  logoutUser as logoutApi,
} from "../services/authService";
import { fetchMyVotedSuggestionIds } from "../services/voteService";
import { fetchUserById } from "../services/userService";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const [votedSuggestionIds, setVotedSuggestionIds] = useState(new Set());

  const loadUserVotes = useCallback(async () => {
    const currentToken = accessToken;
    if (!currentToken) {
      console.log(
        "[AuthContext] No access token in state, skipping user votes load."
      );
      if (votedSuggestionIds.size > 0) {
        setVotedSuggestionIds(new Set());
        console.log("[AuthContext] Cleared votes due to missing token.");
      }
      return;
    }
    console.log("[AuthContext] Attempting to load user votes...");
    try {
      const ids = await fetchMyVotedSuggestionIds();
      setVotedSuggestionIds(new Set(ids));
      console.log("[AuthContext] User votes loaded:", ids.length, "votes");
    } catch (error) {
      console.error("[AuthContext] Failed to load user votes:", error);
    }
  }, [accessToken]);

  // Function to fetch and update user avatar
  const loadUserAvatar = useCallback(async (userId) => {
    try {
      const userData = await fetchUserById(userId);
      if (userData && userData.avatarUrl) {
        setUser(prevUser => ({
          ...prevUser,
          avatarUrl: userData.avatarUrl
        }));
        console.log("[AuthContext] User avatar loaded:", userData.avatarUrl);
      }
    } catch (error) {
      console.error("[AuthContext] Failed to load user avatar:", error);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      console.log("[AuthContext] Axios header set.");
      loadUserVotes();
      // Load user avatar when token is set
      if (user?.userId) {
        loadUserAvatar(user.userId);
      }
    } else {
      delete api.defaults.headers.common["Authorization"];
      console.log("[AuthContext] Axios header cleared.");
      setVotedSuggestionIds(new Set());
      console.log("[AuthContext] Cleared votes due to token removal.");
    }
  }, [accessToken, loadUserVotes, loadUserAvatar, user?.userId]);

  useEffect(() => {
    let isMounted = true;
    const verifyUser = async () => {
      console.log("[AuthContext] verifyUser started (initial load/refresh).");
      try {
        const { accessToken: newAccessToken, user: loggedInUser } =
          await checkAuthApi();
        if (isMounted) {
          console.log(
            "[AuthContext] verifyUser success. Setting user and token state:",
            loggedInUser
          );
          setUser(loggedInUser);
          setAccessToken(newAccessToken);
          // Load avatar after initial verification
          if (loggedInUser?.userId) {
            loadUserAvatar(loggedInUser.userId);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.log("[AuthContext] verifyUser failed. Clearing state.");
          setUser(null);
          setAccessToken(null);
        }
      } finally {
        if (isMounted) {
          console.log("[AuthContext] verifyUser finished.");
          setIsLoading(false);
        }
      }
    };
    verifyUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(
    async (loginData, redirectTo = "/dashboard") => {
      console.log("[AuthContext] login function started...");
      const userData = {
        userId: loginData.userId,
        username: loginData.username,
        role: loginData.role,
      };

      setUser(userData);
      console.log("[AuthContext] User state set:", userData);
      console.log(
        "[AuthContext] Setting access token to trigger vote loading..."
      );
      setAccessToken(loginData.accessToken);
      
      // Load user avatar after login
      loadUserAvatar(loginData.userId);
      
      console.log(
        "[AuthContext] Navigating to",
        redirectTo,
        "(votes loading might be async)..."
      );
      try {
        navigate(redirectTo);
      } catch (navError) {
        console.error("[AuthContext] Error during navigation:", navError);
      }
    },
    [navigate, loadUserAvatar]
  );

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Backend logout failed:", error);
    } finally {
      setAccessToken(null);
      setUser(null);
      setVotedSuggestionIds(new Set());
      window.location.href = "/";
    }
  }, []);

  const updateUserVoteStatus = useCallback((suggestionId, hasVoted) => {
    setVotedSuggestionIds((prevSet) => {
      const newSet = new Set(prevSet);
      if (hasVoted) {
        newSet.add(suggestionId);
      } else {
        newSet.delete(suggestionId);
      }
      console.log(
        "[AuthContext] Updated vote status via callback:",
        suggestionId,
        hasVoted,
        newSet
      );
      return newSet;
    });
  }, []);

  // Function to update user avatar URL
  const updateUserAvatar = useCallback((avatarUrl) => {
    setUser(prevUser => ({
      ...prevUser,
      avatarUrl
    }));
    console.log("[AuthContext] User avatar updated:", avatarUrl);
  }, []);

  const value = useMemo(
    () => ({
      accessToken,
      user,
      isAuthenticated: !!accessToken && !!user,
      isLoading,
      votedSuggestionIds,
      updateUserVoteStatus,
      updateUserAvatar,
      login,
      logout,
    }),
    [
      accessToken,
      user,
      isLoading,
      votedSuggestionIds,
      updateUserVoteStatus,
      updateUserAvatar,
      login,
      logout,
    ]
  );

  useEffect(() => {
    const handleTokenRefreshed = (event) => {
      const { accessToken: newAccessToken, user: userData } = event.detail;
      console.log("AuthContext handling token refresh event.");
      setUser(userData);
      setAccessToken(newAccessToken);
      // Reload avatar after token refresh
      if (userData?.userId) {
        loadUserAvatar(userData.userId);
      }
    };
    window.addEventListener("token-refreshed", handleTokenRefreshed);
    return () =>
      window.removeEventListener("token-refreshed", handleTokenRefreshed);
  }, [loadUserAvatar]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};