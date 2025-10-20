/**
 * User Service
 * Business logic for user operations
 */

export class UserService {
    constructor(userApi) {
        this.userApi = userApi;
    }

    async addUser(username) {
        try {
            const result = await this.userApi.addUser(username);
            if (result.success) {
                return { success: true, message: `User ${username} added successfully` };
            } else {
                return { success: false, message: result.message || 'Failed to add user' };
            }
        } catch (error) {
            return { success: false, message: `Error adding user: ${error.message}` };
        }
    }

    async removeUser(username) {
        try {
            const result = await this.userApi.removeUser(username);
            if (result.success) {
                return { success: true, message: `User @${username} removed successfully` };
            } else {
                return { success: false, message: result.message || 'Failed to remove user' };
            }
        } catch (error) {
            return { success: false, message: `Error removing user: ${error.message}` };
        }
    }

    async getUserData(username) {
        try {
            const [watchData, summary, profile] = await Promise.all([
                this.userApi.getWatchedUsers(),
                this.userApi.getUserSummary(username),
                this.userApi.getUserProfile(username).catch(() => null)
            ]);

            const user = watchData.users?.find(u => u.username === username);
            
            return {
                success: true,
                user: user || { username },
                summary,
                profile
            };
        } catch (error) {
            return {
                success: false,
                message: `Error loading user data: ${error.message}`,
                user: null,
                summary: null,
                profile: null
            };
        }
    }

    async getWatchedUsers() {
        try {
            const result = await this.userApi.getWatchedUsers();
            if (result.success && result.users) {
                // Fetch profile data and recent tweets for each user
                const usersWithData = await Promise.all(
                    result.users.map(async (user) => {
                        try {
                            const [profileResult, summaryResult] = await Promise.all([
                                this.userApi.getUserProfile(user.username).catch(() => null),
                                this.userApi.getUserSummary(user.username).catch(() => null)
                            ]);

                            const userData = { ...user };
                            
                            if (profileResult && profileResult.success && profileResult.profile) {
                                userData.profile = profileResult.profile;
                            }

                            // Get most recent tweet from summary
                            if (summaryResult && summaryResult.success && summaryResult.conversations) {
                                const recentTweet = summaryResult.conversations
                                    .filter(conv => conv.originalPost || conv.text)
                                    .sort((a, b) => {
                                        const dateA = new Date(a.created_at || a.originalPost?.created_at || 0);
                                        const dateB = new Date(b.created_at || b.originalPost?.created_at || 0);
                                        return dateB - dateA;
                                    })[0];

                                if (recentTweet) {
                                    userData.recentTweet = {
                                        text: recentTweet.text || recentTweet.originalPost?.text || '',
                                        created_at: recentTweet.created_at || recentTweet.originalPost?.created_at,
                                        likes: recentTweet.likes || recentTweet.originalPost?.likes || 0,
                                        retweets: recentTweet.retweets || recentTweet.originalPost?.retweets || 0,
                                        replies: recentTweet.replies?.length || 0
                                    };
                                }
                            }

                            return userData;
                        } catch (error) {
                            console.warn(`Failed to fetch data for ${user.username}:`, error);
                            return user;
                        }
                    })
                );
                
                return {
                    success: true,
                    users: usersWithData,
                    message: result.message
                };
            }
            return {
                success: result.success,
                users: result.users || [],
                message: result.message
            };
        } catch (error) {
            return {
                success: false,
                users: [],
                message: `Error loading watched users: ${error.message}`
            };
        }
    }
}
