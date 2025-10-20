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
                // Fetch profile data for each user to get real avatars
                const usersWithProfiles = await Promise.all(
                    result.users.map(async (user) => {
                        try {
                            const profileResult = await this.userApi.getUserProfile(user.username);
                            if (profileResult.success && profileResult.profile) {
                                return {
                                    ...user,
                                    profile: profileResult.profile
                                };
                            }
                        } catch (error) {
                            console.warn(`Failed to fetch profile for ${user.username}:`, error);
                        }
                        return user;
                    })
                );
                
                return {
                    success: true,
                    users: usersWithProfiles,
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
