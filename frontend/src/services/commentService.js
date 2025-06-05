import { api } from './api'; 

function isAxiosError(error) {
  return typeof error === 'object' && error !== null && error.isAxiosError === true;
}

export const createComment = async (commentData) => {
  if (!commentData || !commentData.content || !commentData.suggestionId) {
      return Promise.reject(new Error("Content and Suggestion ID are required to create a comment."));
  }
  try {
    const response = await api.post('/comments', commentData);
    return response.data; 
  } catch (error) {
    console.error('Failed to create comment:', error);
    let errorMessage = 'An unexpected error occurred while creating the comment.';
    if (isAxiosError(error) && error.response?.data) {
        errorMessage = error.response.data.message
                    || error.response.data.title
                    || (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data));
    } else if (error.message) {
        errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
};

export const updateComment = async (commentId, commentData) => {
  if (!commentId || !commentData?.content) {
      return Promise.reject(new Error("Comment ID and content are required for update."));
  }
  try {
    await api.put(`/comments/${commentId}`, commentData);
  } catch (error) {
    console.error(`Failed to update comment ${commentId}:`, error);
    let errorMessage = `An unexpected error occurred while updating comment ${commentId}.`;
    if (isAxiosError(error)) {
        if (error.response?.status === 403) {
            errorMessage = "Niste ovlašteni ažurirati ovaj komentar."; 
        } else if (error.response?.status === 404) {
            errorMessage = "Komentar nije pronađen."; 
        } else if (error.response?.data) {
             errorMessage = error.response.data.message
                    || error.response.data.title
                    || (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data));
        } else if (error.message) {
            errorMessage = error.message;
        }
    }
    throw new Error(errorMessage);
  }
};

export const deleteComment = async (commentId) => {
   if (!commentId || isNaN(parseInt(commentId, 10))) {
      return Promise.reject(new Error("Valid Comment ID is required for deletion."));
  }
  try {
    await api.delete(`/comments/${commentId}`);
  } catch (error) {
    console.error(`Failed to delete comment ${commentId}:`, error);
    let errorMessage = `An unexpected error occurred while deleting comment ${commentId}.`;
     if (isAxiosError(error)) {
        if (error.response?.status === 403) {
            errorMessage = "Niste ovlašteni obrisati ovaj komentar."; 
        } else if (error.response?.status === 404) {
            errorMessage = "Komentar nije pronađen."; 
        } else if (error.response?.data) {
             errorMessage = error.response.data.message
                    || error.response.data.title
                    || (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data));
        } else if (error.message) {
             errorMessage = error.message;
        }
    }
    throw new Error(errorMessage);
  }
};