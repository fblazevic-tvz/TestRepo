import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { checkAuthStatus as checkAuthApi, logoutUser as logoutApi } from '../services/authService';
import { fetchMyVotedSuggestionIds } from '../services/voteService';

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
      console.log("[AuthContext] No access token in state, skipping user votes load.");
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


  useEffect(() => {
    if (accessToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      console.log("[AuthContext] Axios header set.");
      loadUserVotes();
    } else {
      delete api.defaults.headers.common['Authorization'];
      console.log("[AuthContext] Axios header cleared.");
      setVotedSuggestionIds(new Set());
      console.log("[AuthContext] Cleared votes due to token removal.");
    }
  }, [accessToken, loadUserVotes]);

  useEffect(() => {
    let isMounted = true;
    const verifyUser = async () => {
      console.log("[AuthContext] verifyUser started (initial load/refresh).");
      try {
        const { accessToken: newAccessToken, user: loggedInUser } = await checkAuthApi();
        if (isMounted) {
          console.log("[AuthContext] verifyUser success. Setting user and token state:", loggedInUser);
          setUser(loggedInUser);
          setAccessToken(newAccessToken);
        }
      } catch (error) {
        if (isMounted) {
          console.log('[AuthContext] verifyUser failed. Clearing state.');
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
    return () => { isMounted = false; };
  }, []);

  const login = useCallback(async (loginData) => {
    console.log("[AuthContext] login function started...");
    const userData = {
      userId: loginData.userId,
      username: loginData.username,
      role: loginData.role
    };

    setUser(userData);
    console.log("[AuthContext] User state set:", userData);
    console.log("[AuthContext] Setting access token to trigger vote loading...");
    setAccessToken(loginData.accessToken);
    console.log("[AuthContext] Navigating to /dashboard (votes loading might be async)...");
    try { navigate('/dashboard'); }
    catch (navError) { console.error("[AuthContext] Error during navigation:", navError); }

  }, [navigate]);

  const logout = useCallback(async () => {
    try { await logoutApi(); }
    catch (error) { console.error("Backend logout failed:", error); }
    finally {
      setAccessToken(null);
      setUser(null);
      setVotedSuggestionIds(new Set());
      window.location.href = '/';
    }
  }, []);

  const updateUserVoteStatus = useCallback((suggestionId, hasVoted) => {
    setVotedSuggestionIds(prevSet => {
      const newSet = new Set(prevSet);
      if (hasVoted) { newSet.add(suggestionId); }
      else { newSet.delete(suggestionId); }
      console.log("[AuthContext] Updated vote status via callback:", suggestionId, hasVoted, newSet);
      return newSet;
    });
  }, []);

  const value = useMemo(() => ({
    accessToken,
    user,
    isAuthenticated: !!accessToken && !!user,
    isLoading,
    votedSuggestionIds,
    updateUserVoteStatus,
    login,
    logout,
  }), [accessToken, user, isLoading, votedSuggestionIds, updateUserVoteStatus, login, logout]);

  useEffect(() => {
    const handleTokenRefreshed = (event) => {
      const { accessToken: newAccessToken, user: userData } = event.detail;
      console.log("AuthContext handling token refresh event.");
      setUser(userData);
      setAccessToken(newAccessToken);
    };
    window.addEventListener('token-refreshed', handleTokenRefreshed);
    return () => window.removeEventListener('token-refreshed', handleTokenRefreshed);
  }, []);


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};