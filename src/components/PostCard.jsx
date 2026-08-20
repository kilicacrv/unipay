import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Send, MapPin, Flag, Percent } from 'lucide-react';

const getRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Az önce';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} dk önce`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} saat önce`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} gün önce`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} hafta önce`;
  
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
};

const PostCard = ({ post, currentUserId, onLike, onComment }) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const hasLiked = post.hasLiked;
  
  const handleLike = () => {
    onLike(post.id, !hasLiked);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    await onComment(post.id, commentText);
    setCommentText('');
    setIsSubmittingComment(false);
  };

  const handleReport = () => {
    alert('Gönderi bildirildi. İnceleyeceğiz.');
  };

  // Safe access to data
  const userName = post.profiles?.full_name || post.profiles?.username || 'Kullanıcı';
  const initial = userName.charAt(0).toUpperCase();
  const venueName = post.venues?.name || 'Mekan';
  const discountRate = post.venues?.discount_rate || 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#FFD600] flex items-center justify-center font-bold text-gray-900 shadow-sm">
            {initial}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{userName}</h3>
            <div className="flex items-center text-xs text-gray-500 space-x-1 mt-0.5">
              <span>{getRelativeTime(post.created_at)}</span>
              <span>•</span>
              <div className="flex items-center text-[#FFD600] font-medium bg-yellow-50 px-1.5 py-0.5 rounded-md">
                <MapPin className="w-3 h-3 mr-1" />
                <span>{venueName}</span>
                {discountRate > 0 && (
                  <span className="ml-1 text-xs">%{discountRate}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <button onClick={handleReport} className="text-gray-400 hover:text-gray-600 p-1">
          <Flag className="w-4 h-4" />
        </button>
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="w-full bg-gray-50 max-h-[300px] overflow-hidden">
          <img 
            src={post.image_url} 
            alt="Gönderi" 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {post.caption && (
          <p className="text-sm text-gray-800 mb-3 whitespace-pre-wrap">{post.caption}</p>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-4 mb-4">
          <motion.button 
            whileTap={{ scale: 0.8 }}
            onClick={handleLike}
            className="flex items-center space-x-1.5 text-gray-600"
          >
            <Heart 
              className={`w-6 h-6 ${hasLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
            />
            <span className="text-sm font-medium">{post.likeCount || 0}</span>
          </motion.button>
          
          <div className="flex items-center space-x-1.5 text-gray-600">
            <MessageCircle className="w-6 h-6" />
            <span className="text-sm font-medium">{post.commentCount || 0}</span>
          </div>
        </div>

        {/* Comments section */}
        {post.recentComments && post.recentComments.length > 0 && (
          <div className="space-y-2 mb-3">
            {post.recentComments.map((comment) => (
              <div key={comment.id} className="text-sm">
                <span className="font-semibold mr-2">{comment.profiles?.full_name || comment.profiles?.username || 'Kullanıcı'}</span>
                <span className="text-gray-700">{comment.content}</span>
              </div>
            ))}
            {(post.commentCount || 0) > 2 && (
              <button className="text-gray-500 text-sm mt-1">
                Tüm {post.commentCount} yorumu gör
              </button>
            )}
          </div>
        )}

        {/* Comment input */}
        <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2 mt-4 pt-3 border-t border-gray-100">
          <input
            type="text"
            placeholder="Yorum ekle..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-gray-50 border-none focus:ring-0 text-sm rounded-full px-4 py-2"
          />
          <button 
            type="submit" 
            disabled={!commentText.trim() || isSubmittingComment}
            className={`p-2 rounded-full ${commentText.trim() ? 'text-[#FFD600]' : 'text-gray-300'}`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostCard;
