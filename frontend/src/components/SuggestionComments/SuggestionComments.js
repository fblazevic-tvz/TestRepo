import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'; 
import CommentItem from '../CommentItem/CommentItem';
import { useAuth } from '../../context/AuthContext'; 
import { createComment } from '../../services/commentService'; 
import './SuggestionComments.css';


function SuggestionComments({ suggestionId, initialComments = [] }) {
    const { isAuthenticated } = useAuth();
    const [comments, setComments] = useState([]); 
    const [newCommentContent, setNewCommentContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');


     useEffect(() => {
        const sortedInitial = [...initialComments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setComments(sortedInitial);
        console.log("SuggestionComments received initial comments:", sortedInitial.length); 
    }, [initialComments]); 


    const handleNewCommentChange = (event) => {
        setNewCommentContent(event.target.value);
        setSubmitError('');
    };

    const handleCommentSubmit = async (event) => {
        event.preventDefault();
        if (!newCommentContent.trim()) {
            setSubmitError("Komentar ne može biti prazan.");
            return;
        }
        if (!suggestionId) {
             setSubmitError("Nije moguće poslati komentar: ID prijedloga nedostaje.");
             console.error("Missing suggestionId in handleCommentSubmit");
             return;
        }
        if (!isAuthenticated) {
            setSubmitError("Morate biti prijavljeni da biste komentirali.");
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            const commentData = {
                content: newCommentContent.trim(),
                suggestionId: suggestionId,
                parentCommentId: null 
            };
            console.log("Submitting comment:", commentData); 
            const createdComment = await createComment(commentData);
            console.log("Comment created successfully:", createdComment); 

            setComments(prevComments =>
                [createdComment, ...prevComments] 
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) 
            );

            setNewCommentContent(''); 
        } catch (err) {
            console.error("Failed to submit comment:", err);
            setSubmitError(err.message || "Slanje komentara nije uspjelo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCommentUpdated = useCallback((updatedComment) => {
        console.log("Handling update in parent:", updatedComment.id);
        const updateRecursively = (commentsArray) => {
             return commentsArray.map(c => {
                if (c.id === updatedComment.id) {
                    return updatedComment;
                } else if (c.replies && c.replies.length > 0) {
                    return { ...c, replies: updateRecursively(c.replies) };
                }
                return c; 
            });
        };
        setComments(prevComments => {
             const updatedList = updateRecursively(prevComments);
             return updatedList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });
    }, []);

     const handleCommentDeleted = useCallback((deletedComment) => {
         console.log("Handling delete in parent:", deletedComment.id);
         handleCommentUpdated(deletedComment);

    }, [handleCommentUpdated]);

    const handleReplyAdded = useCallback((newReply, parentId) => {
        console.log(`Reply added (parentId: ${parentId}):`, newReply);
        const addReplyRecursively = (commentsArray, replyToAdd, targetParentId) => {
            return commentsArray.map(comment => {
                if (comment.id === targetParentId) {
                    const updatedReplies = comment.replies ? [...comment.replies, replyToAdd] : [replyToAdd];
                    updatedReplies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    return { ...comment, replies: updatedReplies };
                } else if (comment.replies && comment.replies.length > 0) {
                    return { ...comment, replies: addReplyRecursively(comment.replies, replyToAdd, targetParentId) };
                }
                return comment; 
            });
        };

        setComments(prevComments => {
            const updatedComments = addReplyRecursively(prevComments, newReply, parentId);
            return updatedComments;
        });
    }, []); 

    const topLevelComments = comments.filter(comment => !comment.parentCommentId);

    return (
        <div className="suggestion-comments">

            <h2>Komentari ({comments?.length || 0})</h2>

            {isAuthenticated ? (
                <form onSubmit={handleCommentSubmit} className="comment-form"> 
                    <textarea
                        placeholder="Napišite komentar..."
                        rows="3"
                        value={newCommentContent}
                        onChange={handleNewCommentChange}
                        disabled={isSubmitting}
                        aria-label="Novi komentar" 
                        required 
                    />
                     {submitError && <p className="comment-error">{submitError}</p>}
                    <button
                        type="submit" 
                        className='button-primary comment-submit-button'
                        disabled={isSubmitting || !newCommentContent.trim()}
                    >
                        {isSubmitting ? 'Slanje...' : 'Pošalji Komentar'}
                    </button>
                </form>
            ) : (
                 <p className="login-prompt">Morate biti prijavljeni da biste komentirali. <Link to="/login">Prijavi se</Link></p>
             )}


            <div className="comment-list">
                {topLevelComments.length > 0 ? (
                    topLevelComments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            suggestionId={suggestionId} 
                            onCommentUpdated={handleCommentUpdated} 
                            onCommentDeleted={handleCommentDeleted} 
                            onReplyAdded={handleReplyAdded} 
                        />
                    ))
                ) : (
                    <p className="no-comments-message">Nema komentara za ovaj prijedlog. Budite prvi!</p>
                )}
            </div>
        </div>
    );
}

SuggestionComments.propTypes = {
    suggestionId: PropTypes.number, 
    initialComments: PropTypes.arrayOf(PropTypes.object), 
};

export default SuggestionComments;