import { useState, useEffect, memo } from 'react';
import { useSelector } from 'react-redux';
import { format } from 'timeago.js';

import { commentOnSong, getCommentsOnSong, addCommentReply, getReply } from '~/apis/songApi';
import NoAvatar from '~/assets/image/noAvatar.png';
import './CommentsSection.sass';

// Component CommentItem
const CommentItem = memo(
    ({
        item,
        depth = 0,
        showReplies,
        showReplyBox,
        replyInputs,
        reduxUser,
        reduxIsRight,
        reduxExtendedFullRight,
        toggleReplyBox,
        toggleShowReplies,
        handleReplyChange,
        cancelReply,
        submitReply,
        isLastReply = false,
    }) => (
        <div
            className={`comment ${depth > 0 ? 'replyItem' : ''} ${isLastReply ? 'lastReply' : ''} ${
                reduxIsRight && !reduxExtendedFullRight && depth < 2 ? 'rightActive' : ''
            }`}
            data-id={item.comment.id}
            data-depth={depth}>
            <div className="leftComment">
                <div className="userAvatar">
                    <img src={item.user.urlAvatar || NoAvatar} alt={item.user.username} />
                </div>
            </div>

            <div className="rightComment">
                <div className="titleComment">
                    <span className="username">{item.user.username}</span>
                    <span className="commentTime">{format(item.comment.createdAt)}</span>
                </div>

                <p className="text">{item.comment.content}</p>

                <div className="commentActions">
                    {!(reduxIsRight && !reduxExtendedFullRight && depth >= 2) && (
                        <button onClick={() => toggleReplyBox(item.comment.id)}>Trả lời</button>
                    )}
                    {item.comment.replyCount > 0 && !(reduxIsRight && !reduxExtendedFullRight && depth >= 2) && (
                        <button onClick={() => toggleShowReplies(item.comment.id)}>
                            {showReplies[item.comment.id] ? 'Ẩn' : 'Xem'} {item.comment.replyCount} phản hồi
                        </button>
                    )}
                </div>

                {showReplyBox[item.comment.id] && (
                    <div className="replyInputContainer" data-id={item.comment.id}>
                        <img className="replyAvatar" src={reduxUser?.urlAvatar || NoAvatar} alt="avatar" />
                        <div className="replyInputWrapper">
                            <input
                                type="text"
                                placeholder="Viết phản hồi..."
                                value={replyInputs[item.comment.id] || ''}
                                onChange={(e) => handleReplyChange(item.comment.id, e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && submitReply(item.comment.id)}
                            />
                            <div className="replyActions">
                                <button onClick={() => cancelReply(item.comment.id)}>Hủy</button>
                                <button
                                    className={`sendReplyButton ${replyInputs[item.comment.id]?.trim() ? 'active' : ''}`}
                                    onClick={() => submitReply(item.comment.id)}
                                    disabled={!replyInputs[item.comment.id]?.trim()}>
                                    Gửi
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showReplies[item.comment.id] && item.replies?.length > 0 && (reduxExtendedFullRight || depth < 2) && (
                    <div className="repliesContainer" data-depth={depth + 1}>
                        {item.replies.map((reply, index) => (
                            <CommentItem
                                key={reply.comment.id}
                                item={reply}
                                depth={depth + 1}
                                showReplies={showReplies}
                                showReplyBox={showReplyBox}
                                replyInputs={replyInputs}
                                reduxUser={reduxUser}
                                reduxIsRight={reduxIsRight}
                                reduxExtendedFullRight={reduxExtendedFullRight}
                                toggleReplyBox={toggleReplyBox}
                                toggleShowReplies={toggleShowReplies}
                                handleReplyChange={handleReplyChange}
                                cancelReply={cancelReply}
                                submitReply={submitReply}
                                isLastReply={index === item.replies.length - 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
);

CommentItem.displayName = 'CommentItem';

// Component CommentsSection
const CommentsSection = ({ currentSong }) => {
    const reduxUser = useSelector((state) => state.auth.reduxUser);
    const reduxIsRight = useSelector((state) => state.songNotWhite.reduxIsRight);
    const reduxExtendedFullRight = useSelector((state) => state.songNotWhite.reduxExtendedFullRight);

    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [showReplies, setShowReplies] = useState({});
    const [showReplyBox, setShowReplyBox] = useState({});
    const [replyInputs, setReplyInputs] = useState({});

    const fetchComments = async () => {
        if (currentSong?.song?.id) {
            try {
                const fetchedComments = await getCommentsOnSong(currentSong.song.id);
                setComments(fetchedComments);
            } catch (error) {
                console.error('Failed to fetch comments:', error);
            }
        }
    };

    useEffect(() => {
        fetchComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSong?.song?.id]);

    const submitComment = async () => {
        if (currentSong?.song?.id && commentText.trim()) {
            try {
                await commentOnSong(currentSong.song.id, commentText.trim());
                setCommentText('');
                await fetchComments();
            } catch (error) {
                console.error('Failed to submit comment:', error);
            }
        }
    };

    const loadRepliesRecursive = async (commentId) => {
        try {
            const replies = await getReply(commentId);
            return replies;
        } catch (err) {
            console.error('Failed to load replies', err);
            return [];
        }
    };

    const updateRepliesInTree = (items, targetId, newReplies) =>
        items.map((item) => {
            if (item.comment.id === targetId) return { ...item, replies: newReplies };
            if (item.replies?.length > 0)
                return { ...item, replies: updateRepliesInTree(item.replies, targetId, newReplies) };
            return item;
        });

    const updateReplyCount = (items, targetId, count) =>
        items.map((item) => {
            if (item.comment.id === targetId) return { ...item, comment: { ...item.comment, replyCount: count } };
            if (item.replies?.length > 0) return { ...item, replies: updateReplyCount(item.replies, targetId, count) };
            return item;
        });

    const toggleShowReplies = async (commentId) => {
        const isShowing = showReplies[commentId];
        if (isShowing) {
            setShowReplies((prev) => ({ ...prev, [commentId]: false }));

            const container = document.querySelector(`.repliesContainer[data-depth][data-id='${commentId}']`);
            const commentEl = document.querySelector(`.comment[data-id='${commentId}'] .repliesContainer`);
            const target = container || commentEl;
            if (target) {
                target.classList.add('fadeOut');
                setTimeout(() => {
                    setShowReplies((prev) => ({ ...prev, [commentId]: false }));
                }, 300);
            }
        } else {
            const replies = await loadRepliesRecursive(commentId);
            setComments((prev) => updateRepliesInTree(prev, commentId, replies));
            setShowReplies((prev) => ({ ...prev, [commentId]: true }));
        }
    };

    const cancelReply = (commentId) => {
        const replyBox = document.querySelector(`.replyInputContainer[data-id='${commentId}']`);
        if (replyBox) {
            replyBox.classList.add('fadeOut');
            setTimeout(() => {
                setReplyInputs((prev) => ({ ...prev, [commentId]: '' }));
                setShowReplyBox((prev) => ({ ...prev, [commentId]: false }));
            }, 250);
        } else {
            setReplyInputs((prev) => ({ ...prev, [commentId]: '' }));
            setShowReplyBox((prev) => ({ ...prev, [commentId]: false }));
        }
    };

    const toggleReplyBox = (commentId) => {
        setShowReplyBox((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
    };

    const handleReplyChange = (commentId, value) => {
        setReplyInputs((prev) => ({ ...prev, [commentId]: value }));
    };

    const submitReply = async (commentId) => {
        const content = replyInputs[commentId]?.trim();
        if (!content) return;
        try {
            await addCommentReply(commentId, content);
            setReplyInputs((prev) => ({ ...prev, [commentId]: '' }));
            setShowReplyBox((prev) => ({ ...prev, [commentId]: false }));
            const replies = await loadRepliesRecursive(commentId);
            setComments((prev) => updateRepliesInTree(prev, commentId, replies));
            setComments((prev) => updateReplyCount(prev, commentId, replies.length));
            setShowReplies((prev) => ({ ...prev, [commentId]: true }));
        } catch (err) {
            console.error('Failed to post reply', err);
        }
    };

    return (
        <div
            className={`comments ${
                reduxIsRight && !reduxExtendedFullRight ? 'rightActive' : ''
            } ${reduxExtendedFullRight ? 'extendedFull' : ''}`}>
            <div className="commentInput">
                <div className="header">
                    <img src={reduxUser?.urlAvatar || NoAvatar} alt="User Avatar" />
                    <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && commentText.trim()) {
                                e.preventDefault();
                                submitComment();
                            }
                        }}
                    />
                </div>
                <div className="bottom">
                    <button onClick={() => setCommentText('')}>Cancel</button>
                    <button className={`sendCommentButton ${commentText.trim() ? 'send' : ''}`} onClick={submitComment}>
                        Comment
                    </button>
                </div>
            </div>

            <div className="title">
                <span className="commentsCount">{comments.length} Comments</span>
            </div>

            <div className="listComments">
                {comments.length > 0 ? (
                    comments.map((item) => (
                        <CommentItem
                            key={item.comment.id}
                            item={item}
                            showReplies={showReplies}
                            showReplyBox={showReplyBox}
                            replyInputs={replyInputs}
                            reduxUser={reduxUser}
                            reduxIsRight={reduxIsRight}
                            reduxExtendedFullRight={reduxExtendedFullRight}
                            toggleReplyBox={toggleReplyBox}
                            toggleShowReplies={toggleShowReplies}
                            handleReplyChange={handleReplyChange}
                            cancelReply={cancelReply}
                            submitReply={submitReply}
                        />
                    ))
                ) : (
                    <p className="noComment">No comments yet.</p>
                )}
            </div>
        </div>
    );
};

export default memo(CommentsSection);
