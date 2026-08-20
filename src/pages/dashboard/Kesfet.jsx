import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Plus, Compass } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import StudentBottomNav from '../../components/StudentBottomNav';
import PostCard from '../../components/PostCard';

const Kesfet = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchUserAndPosts();
  }, []);

  const fetchUserAndPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      await fetchPosts(user?.id);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchPosts = async (userId) => {
    try {
      // Note: This relies on specific table structures (posts, post_likes, post_comments). 
      // Adjust queries if database schema is different.
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id(id, full_name, username),
          venues:venue_id(id, name, discount_rate)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (postsError) throw postsError;

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const postIds = postsData.map(p => p.id);

      // Fetch likes
      const { data: likesData, error: likesError } = await supabase
        .from('post_likes')
        .select('post_id, user_id')
        .in('post_id', postIds);

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('post_comments')
        .select(`
          id, post_id, user_id, content, created_at,
          profiles:user_id(full_name, username)
        `)
        .in('post_id', postIds)
        .order('created_at', { ascending: false });

      if (likesError) console.error(likesError);
      if (commentsError) console.error(commentsError);

      const enrichedPosts = postsData.map(post => {
        const postLikes = likesData?.filter(l => l.post_id === post.id) || [];
        const postComments = commentsData?.filter(c => c.post_id === post.id) || [];
        
        return {
          ...post,
          likeCount: postLikes.length,
          hasLiked: userId ? postLikes.some(l => l.user_id === userId) : false,
          commentCount: postComments.length,
          recentComments: postComments.slice(0, 2).reverse() // Get latest 2
        };
      });

      setPosts(enrichedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts(currentUser?.id);
  };

  const handleLike = async (postId, newLikeState) => {
    if (!currentUser) return;
    
    // Optimistic UI update
    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            hasLiked: newLikeState,
            likeCount: newLikeState ? post.likeCount + 1 : post.likeCount - 1
          };
        }
        return post;
      })
    );

    try {
      if (newLikeState) {
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: currentUser.id });
      } else {
        await supabase
          .from('post_likes')
          .delete()
          .match({ post_id: postId, user_id: currentUser.id });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error by refetching
      fetchPosts(currentUser.id);
    }
  };

  const handleComment = async (postId, content) => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          content: content
        })
        .select(`
          id, post_id, user_id, content, created_at,
          profiles:user_id(full_name, username)
        `)
        .single();

      if (error) throw error;

      // Update UI with new comment
      setPosts(currentPosts => 
        currentPosts.map(post => {
          if (post.id === postId) {
            const newRecentComments = [...(post.recentComments || []), data].slice(-2);
            return {
              ...post,
              commentCount: post.commentCount + 1,
              recentComments: newRecentComments
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Yorum eklenirken bir hata oluştu.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gray-900 text-white sticky top-0 z-20 shadow-md">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Compass className="text-[#FFD600] w-6 h-6" />
            <h1 className="text-xl font-bold">Keşfet</h1>
          </div>
          <button 
            onClick={handleRefresh}
            className={`p-2 rounded-full hover:bg-gray-800 transition-colors ${refreshing ? 'animate-spin text-[#FFD600]' : 'text-gray-300'}`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 relative min-h-[calc(100vh-140px)]">
        {loading ? (
          // Skeleton Loading
          <div className="space-y-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          // Feed
          <div>
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post}
                currentUserId={currentUser?.id}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))}
            <div className="text-center py-6 text-gray-500 text-sm">
              Tüm gönderileri gördün 🎉
            </div>
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center h-64 text-center px-4 mt-12">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
              <Compass className="w-12 h-12 text-[#FFD600]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Henüz gönderi yok 🌟</h2>
            <p className="text-gray-500 mb-6 max-w-[250px]">
              İlk paylaşımı sen yap! Bir mekanda QR okutup deneyimini paylaş.
            </p>
          </div>
        )}

        {/* Floating Action Button */}
        <Link 
          to="/dashboard/create-post"
          className="fixed bottom-24 right-4 md:right-auto md:left-[calc(50%+140px)] w-14 h-14 bg-[#FFD600] text-gray-900 rounded-full shadow-lg flex items-center justify-center hover:bg-yellow-400 transition-transform active:scale-95 z-10"
        >
          <Plus className="w-7 h-7" />
        </Link>
      </div>

      <StudentBottomNav />
    </div>
  );
};

export default Kesfet;
