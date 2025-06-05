import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { formatDateCroatian } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { updateComment, deleteComment, createComment } from '../../services/commentService';
import './CommentItem.css';

function CommentItem({ comment, suggestionId, onCommentUpdated, onCommentDeleted, onReplyAdded }) {
    const { user: currentUser, isAuthenticated } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(comment?.content || '');
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isReplyLoading, setIsReplyLoading] = useState(false);

    const {
        id: commentId,
        author = null,
        content = "[Sadržaj nije dostupan]",
        createdAt = null,
        updatedAt = null,
        replies = [],
        authorId = null
    } = comment || {};

    const authorName = author?.userName || "Anonimno";
    const displayDate = updatedAt || createdAt;
    const isEditedIndicator = !!updatedAt && new Date(updatedAt).getTime() !== new Date(createdAt).getTime();
    const isOwner = isAuthenticated &&
                    currentUser?.userId != null &&
                    authorId != null &&
                    String(authorId) === String(currentUser.userId);
    const canModify = isOwner;
    const isDeleted = !authorId && content === "[Komentar obrisan]";

    useEffect(() => {
        if (!isEditing) {
            setEditedContent(comment?.content || '');
        }
        setError('');
    }, [comment?.content, isEditing]);

    const handleEdit = () => {
        setError('');
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedContent(content);
        setError('');
    };

    const handleSaveEdit = async () => {
        if (editedContent.trim() === content.trim()) {
            setIsEditing(false);
            setError('');
            return;
        }
        if (!editedContent.trim()) {
            setError("Komentar ne može biti prazan.");
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            await updateComment(commentId, { content: editedContent.trim() });
            setIsEditing(false);
            const pseudoUpdatedComment = {
                ...comment,
                content: editedContent.trim(),
                updatedAt: new Date().toISOString(),
                author: comment.author,
                authorId: comment.authorId
            };
            onCommentUpdated(pseudoUpdatedComment);
        } catch (err) {
            console.error("Failed to save comment edit:", err);
            setError(err.message || "Spremanje izmjena nije uspjelo.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Jeste li sigurni da želite obrisati ovaj komentar? Akcija je nepovratna.")) {
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            await deleteComment(commentId);
            const pseudoDeletedComment = {
                ...comment,
                content: "[Komentar obrisan]",
                author: null,
                authorId: null,
                updatedAt: new Date().toISOString()
            };
            onCommentDeleted(pseudoDeletedComment);
        } catch (err) {
            console.error("Failed to delete comment:", err);
            setError(err.message || "Brisanje komentara nije uspjelo.");
            setIsLoading(false);
        }
    };

    const handleToggleReply = () => {
        setIsReplying(!isReplying);
        setReplyContent('');
        setError('');
    };

    const handleReplyContentChange = (event) => {
        setReplyContent(event.target.value);
        setError('');
    };

    const handleReplySubmit = async () => {
        if (!replyContent.trim()) {
            setError("Odgovor ne može biti prazan.");
            return;
        }
        if (!suggestionId) {
            setError("Nije moguće odgovoriti: ID prijedloga nedostaje.");
            return;
        }
        if (!isAuthenticated) {
            setError("Morate biti prijavljeni da biste odgovorili.");
            return;
        }

        setIsReplyLoading(true);
        setError('');
        try {
            const replyData = {
                content: replyContent.trim(),
                suggestionId: suggestionId,
                parentCommentId: commentId
            };
            const createdReply = await createComment(replyData);
            onReplyAdded(createdReply, commentId);
            setIsReplying(false);
            setReplyContent('');
        } catch (err) {
            console.error("Failed to submit reply:", err);
            setError(err.message || "Slanje odgovora nije uspjelo.");
        } finally {
            setIsReplyLoading(false);
        }
    };

    return (
        <div className={`comment-item ${isDeleted ? 'deleted' : ''}`}>
            <div className="comment-avatar">
                <div className="comment-user-icon"></div>
            </div>

            <div className="comment-content-container">
                <div className="comment-header">
                    <span className="comment-author">{authorName}</span>
                    <span className="comment-date">
                        {formatDateCroatian(displayDate)}
                        {isEditedIndicator && !isDeleted && <span className="comment-edited-indicator">(uređeno)</span>}
                        {isDeleted && <span className="comment-edited-indicator">(obrisano)</span>}
                    </span>
                </div>

                {isEditing ? (
                    <div className="comment-edit-form">
                        <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            rows="3"
                            className="comment-edit-textarea"
                            disabled={isLoading}
                            aria-label="Uredi komentar"
                        />
                        {error && <p className="comment-error">{error}</p>}
                        <div className="comment-edit-actions">
                            <button onClick={handleSaveEdit} disabled={isLoading} className="button-primary save-button">
                                {isLoading ? 'Spremanje...' : 'Spremi'}
                            </button>
                            <button onClick={handleCancelEdit} disabled={isLoading} className="button-secondary cancel-button">
                                Odustani
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="comment-text">{content}</p>
                )}

                {!isEditing && !isDeleted && (
                    <div className="comment-actions">
                        {canModify && (
                            <>
                                <button onClick={handleEdit} className="comment-action-button edit-button" disabled={isLoading}>Uredi</button>
                                <button onClick={handleDelete} className="comment-action-button delete-button" disabled={isLoading}>Obriši</button>
                            </>
                        )}
                        {isAuthenticated && (
                            <button onClick={handleToggleReply} className="comment-action-button reply-button" disabled={isLoading || isReplyLoading}>
                                {isReplying ? 'Odustani' : 'Odgovori'}
                            </button>
                        )}
                    </div>
                )}
                {!isEditing && !isReplying && error && <p className="comment-error">{error}</p>}

                {isReplying && (
                    <div className="comment-reply-form">
                        <textarea
                            placeholder={`Odgovor na ${authorName}...`}
                            rows="2"
                            value={replyContent}
                            onChange={handleReplyContentChange}
                            disabled={isReplyLoading}
                            className="comment-reply-textarea"
                            aria-label={`Odgovori na komentar od ${authorName}`}
                        />
                        {error && <p className="comment-error">{error}</p>}
                        <div className="comment-reply-actions">
                            <button onClick={handleReplySubmit} className="button-primary reply-submit-button" disabled={isReplyLoading || !replyContent.trim()}>
                                {isReplyLoading ? 'Slanje...' : 'Pošalji Odgovor'}
                            </button>
                        </div>
                    </div>
                )}

                {replies && replies.length > 0 && (
                    <div className="comment-replies">
                        {replies
                            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                            .map(reply => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    suggestionId={suggestionId}
                                    onCommentUpdated={onCommentUpdated}
                                    onCommentDeleted={onCommentDeleted}
                                    onReplyAdded={onReplyAdded}
                                />
                            ))
                        }
                    </div>
                )}
            </div>
        </div>
    );
}

CommentItem.propTypes = {
    comment: PropTypes.shape({
        id: PropTypes.number.isRequired,
        content: PropTypes.string,
        createdAt: PropTypes.string,
        updatedAt: PropTypes.string,
        author: PropTypes.shape({ id: PropTypes.number, userName: PropTypes.string }),
        authorId: PropTypes.number,
        replies: PropTypes.array,
        parentCommentId: PropTypes.number,
    }).isRequired,
    suggestionId: PropTypes.number.isRequired,
    onCommentUpdated: PropTypes.func.isRequired,
    onCommentDeleted: PropTypes.func.isRequired,
    onReplyAdded: PropTypes.func.isRequired,
};

export default CommentItem;
