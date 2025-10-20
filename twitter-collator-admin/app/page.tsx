"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  UserPlus,
  X,
  RefreshCw,
  MessageSquare,
  TrendingUp,
  Folder,
  FolderPlus,
  Plus,
  Heart,
  Repeat2,
  Eye,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  LinkIcon,
  Flame,
  Music,
  Instagram,
  Newspaper,
  Radio,
  Users,
  FolderOpen,
  Layers,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWatchedUsers, useCollections, useDistills, useCollectionAvatars } from "@/hooks/use-api-data"
import { type Distill, getRelativeTime } from "@/lib/api-client"

// Content channels for future expansion

const contentChannels = [
  { name: "Spotify", icon: Music, color: "green", description: "Music & Podcasts" },
  { name: "Reddit", icon: Radio, color: "orange", description: "Community Discussions" },
  { name: "Instagram", icon: Instagram, color: "pink", description: "Visual Content" },
  { name: "The New York Times", icon: Newspaper, color: "slate", description: "News & Articles" },
]

const getCollectionBadgeClass = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/15 text-blue-600 border-blue-500/30 hover:bg-blue-500/25",
    purple: "bg-purple-500/15 text-purple-600 border-purple-500/30 hover:bg-purple-500/25",
    green: "bg-green-500/15 text-green-600 border-green-500/30 hover:bg-green-500/25",
    amber: "bg-amber-500/15 text-amber-600 border-amber-500/30 hover:bg-amber-500/25",
  }
  return colorMap[color] || colorMap.blue
}

export default function TwitterCollatorAdmin() {
  // State management
  const [newUsername, setNewUsername] = useState("")
  const [collectionUsername, setCollectionUsername] = useState("")
  const [selectedCollection, setSelectedCollection] = useState("")
  const [newCollectionName, setNewCollectionName] = useState("")
  const [selectedDistill, setSelectedDistill] = useState<number | null>(null)
  const [sortFilter, setSortFilter] = useState<"recent" | "influence">("recent")
  const [theme, setTheme] = useState<"light" | "cyberpunk">("light")
  const [selectedChannel, setSelectedChannel] = useState("")
  const [managementTab, setManagementTab] = useState<"users" | "collections" | "channels">("users")
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [filterBy, setFilterBy] = useState<{ type: 'user' | 'collection' | null, name: string }>({ type: null, name: '' })

  // API data hooks
  const { 
    users: watchedUsers, 
    loading: usersLoading, 
    error: usersError, 
    addUser, 
    removeUser 
  } = useWatchedUsers()
  
  const { 
    collections, 
    loading: collectionsLoading, 
    error: collectionsError, 
    addUserToCollection 
  } = useCollections()
  
  const { 
    distills: distillsWithTweets, 
    loading: distillsLoading, 
    error: distillsError, 
    lastSyncTime, 
    syncAndSummarize 
  } = useDistills()
  
  const { collectionAvatars, fetchCollectionAvatar, clearCollectionAvatars } = useCollectionAvatars()
  

  useEffect(() => {
    document.body.className = theme
  }, [theme])

  // Fetch collection avatars when distills are loaded
  useEffect(() => {
    if (distillsWithTweets && distillsWithTweets.length > 0 && !collectionsLoading) {
      distillsWithTweets.forEach(distill => {
        if (distill.collection !== 'general' && distill.avatar === '/placeholder.svg?height=48&width=48') {
          // This is a collection that needs an avatar
          const collection = collections.find(c => c.name === distill.collection);
          if (collection && collection.accounts && collection.accounts.length > 0) {
            // Try to find a member that matches the collection name first
            let selectedMember = collection.accounts.find(account => 
              account.toLowerCase() === distill.collection.toLowerCase()
            );
            
            // If no exact match, use the first member
            if (!selectedMember) {
              selectedMember = collection.accounts[0];
            }
            
            console.log('📞 Fetching collection avatar for:', distill.collection, 'using member:', selectedMember);
            fetchCollectionAvatar(distill.collection, selectedMember);
          }
        }
      });
    }
  }, [distillsWithTweets, collections, collectionsLoading, fetchCollectionAvatar])

  // Clear collection avatars when collections change to force refresh
  useEffect(() => {
    if (collections && collections.length > 0) {
      // Clear existing avatars to force refresh with new logic
      console.log('🔄 Collections updated, clearing avatars to refresh');
      clearCollectionAvatars();
    }
  }, [collections, clearCollectionAvatars])

  const sortedDistills = useMemo(() => {
    let distillsCopy = [...distillsWithTweets]

    // Apply filtering
    if (filterBy.type && filterBy.name) {
      if (filterBy.type === 'user') {
        distillsCopy = distillsCopy.filter(distill => distill.account === filterBy.name)
      } else if (filterBy.type === 'collection') {
        distillsCopy = distillsCopy.filter(distill => distill.collection === filterBy.name)
      }
    }

    // Apply sorting
    if (sortFilter === "recent") {
      return distillsCopy.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    } else {
      // Sort by total influence (conversations + engagement)
      return distillsCopy.sort((a, b) => {
        const influenceA = a.conversations + a.engagement
        const influenceB = b.conversations + b.engagement
        return influenceB - influenceA
      })
    }
  }, [sortFilter, distillsWithTweets, filterBy])

  // Event handlers
  const handleUserClick = (username: string) => {
    setFilterBy({ type: 'user', name: username })
    setSelectedDistill(null) // Clear any selected distill
  }

  const handleCollectionClick = (collectionName: string) => {
    setFilterBy({ type: 'collection', name: collectionName })
    setSelectedDistill(null) // Clear any selected distill
  }

  const handleClearFilter = () => {
    setFilterBy({ type: null, name: '' })
  }

  const handleAddUser = async () => {
    if (!newUsername.trim()) return
    
    setIsAddingUser(true)
    try {
      const result = await addUser(newUsername.trim())
      if (result.success) {
        setNewUsername("")
        // Could show a success toast here
      } else {
        // Could show an error toast here
        console.error('Failed to add user:', result.message)
      }
    } finally {
      setIsAddingUser(false)
    }
  }

  const handleRemoveUser = async (username: string) => {
    try {
      const result = await removeUser(username)
      if (!result.success) {
        console.error('Failed to remove user:', result.message)
      }
    } catch (error) {
      console.error('Error removing user:', error)
    }
  }

  const handleSyncAndSummarize = async () => {
    setIsSyncing(true)
    try {
      console.log('[UI] Starting sync and summarize...')
      const result = await syncAndSummarize()
      if (result.success) {
        console.log('[UI] Sync completed successfully:', result.message)
        // The syncAndSummarize function already refreshes distills
        // We should also consider showing a success toast here
      } else {
        console.error('[UI] Sync failed:', result.message)
        // We should show an error toast here
      }
    } finally {
      setIsSyncing(false)
    }
  }

  const handleAddUserToCollection = async () => {
    if (!collectionUsername.trim() || !selectedCollection) return
    
    try {
      const result = await addUserToCollection(selectedCollection, collectionUsername.trim())
      if (result.success) {
        setCollectionUsername("")
        setSelectedCollection("")
      } else {
        console.error('Failed to add user to collection:', result.message)
      }
    } catch (error) {
      console.error('Error adding user to collection:', error)
    }
  }

  const getRelativeTime = (date: Date | string): string => {
    const now = new Date()
    const targetDate = typeof date === 'string' ? new Date(date) : date
    const diffMs = now.getTime() - targetDate.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return targetDate.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{"My Distills"}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Curated insights from X (and more coming soon) </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className={
                  theme === "light"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                }
              >
                Light
              </Button>
              <Button
                variant={theme === "cyberpunk" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("cyberpunk")}
                className={
                  theme === "cyberpunk"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan"
                    : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                }
              >
                Cyberpunk
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Unified Management Sidebar */}
          <aside className="lg:col-span-3 space-y-4">
            {/* Tab Navigation */}
            <Card className="border-border bg-card">
              <CardContent className="p-2">
                <div className="flex flex-col gap-1">
                  <Button
                    variant={managementTab === "users" ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      managementTab === "users"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                    onClick={() => setManagementTab("users")}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Users
                  </Button>
                  <Button
                    variant={managementTab === "collections" ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      managementTab === "collections"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                    onClick={() => setManagementTab("collections")}
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Collections
                  </Button>
                  <Button
                    variant={managementTab === "channels" ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      managementTab === "channels"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                    onClick={() => setManagementTab("channels")}
                  >
                    <Layers className="w-4 h-4 mr-2" />
                    Channels
                    <Badge
                      variant="secondary"
                      className="ml-auto bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px] px-1.5 py-0"
                    >
                      Soon
                    </Badge>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tab Content */}
            {managementTab === "users" && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-card-foreground">Manage Users</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-card-foreground">Add User</label>
                    <div className="space-y-2">
                      <Input
                        placeholder="e.g., elonmusk"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                        disabled={isAddingUser}
                      />
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={handleAddUser}
                        disabled={isAddingUser || !newUsername.trim()}
                      >
                        {isAddingUser ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <UserPlus className="w-4 h-4 mr-2" />
                        )}
                        {isAddingUser ? "Adding..." : "Add"}
                      </Button>
                    </div>
                    {usersError && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        {usersError}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-card-foreground">Watched Users</h3>
                      {usersLoading && (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-2">
                        {watchedUsers.length === 0 && !usersLoading ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No users being watched</p>
                            <p className="text-xs">Add users above to start monitoring</p>
                          </div>
                        ) : (
                          watchedUsers.map((user) => (
                            <div
                              key={user.username}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors group cursor-pointer"
                              onClick={() => handleUserClick(user.username)}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <Avatar className="h-8 w-8 border border-border">
                                  <AvatarImage src={user.profile?.avatar_url || "/placeholder.svg"} />
                                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                                    {user.username ? user.username.slice(1, 3).toUpperCase() : "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-card-foreground truncate">{user.username}</p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {user.profile?.name || user.name || "No name available"}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemoveUser(user.username)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Collections Preview */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium text-card-foreground">Collections</h3>
                        {collectionsLoading && (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setManagementTab("collections")}
                        className="text-xs bg-primary/10 hover:bg-primary/20 text-primary border-primary/30"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Manage
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {collections.length === 0 && !collectionsLoading ? (
                        <div className="text-center py-3 text-muted-foreground">
                          <Folder className="w-5 h-5 mx-auto mb-1 opacity-50" />
                          <p className="text-xs">No collections</p>
                          <p className="text-[10px] text-muted-foreground">Create collections to group users</p>
                        </div>
                      ) : (
                        collections.slice(0, 3).map((collection) => (
                          <div
                            key={collection.name}
                            className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors cursor-pointer"
                            onClick={() => handleCollectionClick(collection.name)}
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-card-foreground truncate">{collection.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate">
                                {collection.accounts?.length || 0} members
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCollectionClick(collection.name)
                              }}
                              className="text-[10px] h-6 px-2 text-muted-foreground hover:text-primary"
                            >
                              View
                            </Button>
                          </div>
                        ))
                      )}
                      {collections.length > 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setManagementTab("collections")}
                          className="w-full text-xs text-muted-foreground hover:text-primary"
                        >
                          View all {collections.length} collections
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {managementTab === "collections" && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-card-foreground">Manage Collections</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Data Sync */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-card-foreground">Data Sync</h3>
                      {isSyncing && (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Trigger a sync to fetch latest tweets and generate summaries
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last sync: {lastSyncTime ? getRelativeTime(lastSyncTime) : 'Never'}
                    </p>
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={handleSyncAndSummarize}
                      disabled={isSyncing}
                    >
                      {isSyncing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      {isSyncing ? "Syncing..." : "Sync & Summarize"}
                    </Button>
                    {distillsError && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        {distillsError}
                      </div>
                    )}
                  </div>

                  {/* Collections List */}
                  <div className="pt-4 border-t border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium text-card-foreground">Collections</h3>
                        {collectionsLoading && (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs bg-primary/10 hover:bg-primary/20 text-primary border-primary/30"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        New Collection
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {collections.length === 0 && !collectionsLoading ? (
                        <div className="text-center py-6 text-muted-foreground">
                          <Folder className="w-8 h-8 mx-auto mb-3 opacity-50" />
                          <p className="text-sm font-medium mb-1">No collections yet</p>
                          <p className="text-xs">Create your first collection to group users</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 text-xs bg-primary/10 hover:bg-primary/20 text-primary border-primary/30"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Create Collection
                          </Button>
                        </div>
                      ) : (
                        collections.map((collection) => (
                          <div
                            key={collection.name}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group cursor-pointer"
                            onClick={() => handleCollectionClick(collection.name)}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium text-card-foreground truncate">{collection.name}</p>
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                                  {collection.accounts?.length || 0} members
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {collection.description || "No description"}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {collectionsError && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        {collectionsError}
                      </div>
                    )}
                  </div>

                  {/* Add User to Collection */}
                  <div className="pt-4 border-t border-border space-y-3">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-muted-foreground" />
                      <h3 className="text-sm font-medium text-card-foreground">Add User to Collection</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-xs text-muted-foreground">Username</label>
                          <Input
                            placeholder="e.g., elonmusk"
                            value={collectionUsername}
                            onChange={(e) => setCollectionUsername(e.target.value)}
                            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-muted-foreground">Collection</label>
                          <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                            <SelectTrigger className="bg-secondary border-border text-foreground">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                              {collections.map((collection) => (
                                <SelectItem
                                  key={collection.name}
                                  value={collection.name}
                                  className="text-popover-foreground"
                                >
                                  {collection.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={handleAddUserToCollection}
                        disabled={!collectionUsername.trim() || !selectedCollection}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add User to Collection
                      </Button>
                    </div>
                  </div>

                  {/* Create New Collection */}
                  <div className="pt-4 border-t border-border space-y-3">
                    <div className="flex items-center gap-2">
                      <FolderPlus className="w-4 h-4 text-muted-foreground" />
                      <h3 className="text-sm font-medium text-card-foreground">Create New Collection</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Collection Name</label>
                        <Input
                          placeholder="e.g., ai-researchers"
                          value={newCollectionName}
                          onChange={(e) => setNewCollectionName(e.target.value)}
                          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <Button 
                        variant="outline"
                        className="w-full border-primary/30 text-primary hover:bg-primary/10"
                        disabled={!newCollectionName.trim()}
                      >
                        <FolderPlus className="w-4 h-4 mr-2" />
                        Create Collection
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {managementTab === "channels" && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-card-foreground">Content Channels</CardTitle>
                    <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-xs">
                      Coming Soon
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Expand your distills beyond X by connecting additional content sources
                  </p>

                  {/* Available Channels */}
                  <div className="space-y-2">
                    {contentChannels.map((channel) => {
                      const Icon = channel.icon
                      return (
                        <div
                          key={channel.name}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/50 opacity-60"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`flex items-center justify-center w-9 h-9 rounded-lg ${
                                channel.color === "green"
                                  ? "bg-green-500/15 text-green-600"
                                  : channel.color === "orange"
                                    ? "bg-orange-500/15 text-orange-600"
                                    : channel.color === "pink"
                                      ? "bg-pink-500/15 text-pink-600"
                                      : "bg-slate-500/15 text-slate-600"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-card-foreground truncate">{channel.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{channel.description}</p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] px-2 py-0.5"
                          >
                            Soon
                          </Badge>
                        </div>
                      )
                    })}
                  </div>

                  {/* Add Channel Form (Disabled) */}
                  <div className="pt-4 border-t border-border space-y-3 opacity-60">
                    <label className="text-sm font-medium text-card-foreground">Add Channel</label>
                    <div className="space-y-2">
                      <Select value={selectedChannel} onValueChange={setSelectedChannel} disabled>
                        <SelectTrigger className="bg-secondary/50 border-border text-foreground cursor-not-allowed">
                          <SelectValue placeholder="Select channel..." />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {contentChannels.map((channel) => (
                            <SelectItem key={channel.name} value={channel.name} className="text-popover-foreground">
                              {channel.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        disabled
                        className="w-full bg-primary/50 text-primary-foreground cursor-not-allowed opacity-50"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Connect Channel
                      </Button>
                    </div>
                  </div>

                  {/* Info Message */}
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      Multi-channel support is in development. Stay tuned for updates!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>

          {/* Center - Unified Distills Feed with Viral Tweets */}
          <main className="lg:col-span-9 space-y-8">
            {selectedDistill === null ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">Distills</h2>
                  <div className="flex items-center gap-2">
                    {distillsLoading && (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    )}
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                      {distillsWithTweets.length} active
                    </Badge>
                  </div>
                </div>

                {distillsError && (
                  <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Failed to load distills</p>
                      <p className="text-xs text-destructive/80">{distillsError}</p>
                    </div>
                  </div>
                )}

                {/* Filter Indicator */}
                {filterBy.type && filterBy.name && (
                  <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      {filterBy.type === 'user' ? (
                        <Users className="w-4 h-4 text-primary" />
                      ) : (
                        <Folder className="w-4 h-4 text-primary" />
                      )}
                      <span className="text-sm font-medium text-primary">
                        Showing {filterBy.type === 'user' ? 'user' : 'collection'}: {filterBy.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilter}
                      className="text-primary hover:bg-primary/20 h-6 px-2"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-2 p-1 bg-secondary/30 rounded-lg border border-border w-fit">
                  <Button
                    variant={sortFilter === "recent" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSortFilter("recent")}
                    className={
                      sortFilter === "recent"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                    Most Recent
                  </Button>
                  <Button
                    variant={sortFilter === "influence" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSortFilter("influence")}
                    className={
                      sortFilter === "influence"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }
                  >
                    <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                    Highest Influence
                  </Button>
                </div>

                <div className="space-y-4">
                  {sortedDistills.length === 0 && !distillsLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No distills available</h3>
                      <p className="text-sm mb-4">Start by adding users to watch or trigger a sync to generate summaries</p>
                      <Button 
                        onClick={handleSyncAndSummarize}
                        disabled={isSyncing}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        {isSyncing ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        {isSyncing ? "Syncing..." : "Sync & Summarize"}
                      </Button>
                    </div>
                  ) : distillsLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
                      <p className="text-sm">Loading distills...</p>
                    </div>
                  ) : (
                    sortedDistills.map((distill) => (
                    <Card
                      key={distill.id}
                      className="border-border bg-card hover:border-primary/50 transition-all cursor-pointer relative"
                      onClick={() => setSelectedDistill(distill.id)}
                    >
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
                          distill.collectionColor === "blue"
                            ? "bg-blue-500/50"
                            : distill.collectionColor === "purple"
                              ? "bg-purple-500/50"
                              : distill.collectionColor === "green"
                                ? "bg-green-500/50"
                                : "bg-amber-500/50"
                        }`}
                      />
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 border-2 border-border">
                            <AvatarImage src={
                              distill.collection !== 'general' && collectionAvatars[distill.collection]
                                ? collectionAvatars[distill.collection]
                                : distill.avatar || "/placeholder.svg"
                            } />
                            <AvatarFallback className="bg-secondary text-secondary-foreground">
                              {distill.account ? distill.account.slice(0, 2).toUpperCase() : "AC"}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0 space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-lg font-semibold text-card-foreground">{distill.account}</h3>
                              <Badge
                                variant="outline"
                                className={`text-xs font-medium ${getCollectionBadgeClass(distill.collectionColor)}`}
                              >
                                <Folder className="w-3 h-3 mr-1" />
                                {distill.collection}
                              </Badge>
                              <div className="flex -space-x-2">
                                {Array.from({ length: Math.min(distill.participants, 6) }).map((_, i) => (
                                  <Avatar key={i} className="h-6 w-6 border-2 border-card">
                                    <AvatarImage
                                      src={`/abstract-geometric-shapes.png?key=zizcs&height=24&width=24&query=user${i}`}
                                    />
                                    <AvatarFallback className="bg-secondary text-[10px]">U{i}</AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                              {distill.participants > 6 && (
                                <span className="text-xs text-muted-foreground">+{distill.participants - 6}</span>
                              )}
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed">{distill.content}</p>

                            {distill.mentions && distill.mentions.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {distill.mentions.slice(0, 5).map((mention, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="text-xs bg-secondary/50 text-secondary-foreground hover:bg-secondary"
                                  >
                                    {mention}
                                  </Badge>
                                ))}
                                {distill.mentions.length > 5 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-secondary/50 text-secondary-foreground"
                                  >
                                    +{distill.mentions.length - 5}
                                  </Badge>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MessageSquare className="w-4 h-4" />
                                  <span className="text-sm">
                                    {distill.conversations.toLocaleString()} conversations
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <TrendingUp className="w-4 h-4" />
                                  <span className="text-sm">{distill.engagement.toLocaleString()} engagement</span>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                {(() => {
                  const distill = distillsWithTweets.find((d) => d.id === selectedDistill)
                  if (!distill) return null

                  return (
                    <div className="space-y-6">
                      {/* Back button */}
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedDistill(null)
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Distills
                      </Button>

                      {/* Distill Summary */}
                      <Card
                        className="border-border bg-card relative cursor-pointer"
                        onClick={() => setSelectedDistill(null)}
                      >
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
                            distill.collectionColor === "blue"
                              ? "bg-blue-500/50"
                              : distill.collectionColor === "purple"
                                ? "bg-purple-500/50"
                                : distill.collectionColor === "green"
                                  ? "bg-green-500/50"
                                  : "bg-amber-500/50"
                          }`}
                        />
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 border-2 border-border" onClick={(e) => e.stopPropagation()}>
                              <AvatarImage src={
                                distill.collection !== 'general' && collectionAvatars[distill.collection]
                                  ? collectionAvatars[distill.collection]
                                  : distill.avatar || "/placeholder.svg"
                              } />
                              <AvatarFallback className="bg-secondary text-secondary-foreground">
                                {distill.account ? distill.account.slice(0, 2).toUpperCase() : "AC"}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0 space-y-4">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="text-lg font-semibold text-card-foreground">{distill.account}</h3>
                                <Badge
                                  variant="outline"
                                  className={`text-xs font-medium ${getCollectionBadgeClass(distill.collectionColor)}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Folder className="w-3 h-3 mr-1" />
                                  {distill.collection}
                                </Badge>
                                <div className="flex -space-x-2" onClick={(e) => e.stopPropagation()}>
                                  {Array.from({ length: Math.min(distill.participants, 6) }).map((_, i) => (
                                    <Avatar key={i} className="h-6 w-6 border-2 border-card">
                                      <AvatarImage
                                        src={`/abstract-geometric-shapes.png?key=zizcs&height=24&width=24&query=user${i}`}
                                      />
                                      <AvatarFallback className="bg-secondary text-[10px]">U{i}</AvatarFallback>
                                    </Avatar>
                                  ))}
                                </div>
                                {distill.participants > 6 && (
                                  <span className="text-xs text-muted-foreground">+{distill.participants - 6}</span>
                                )}
                              </div>

                              <p className="text-sm text-muted-foreground leading-relaxed">{distill.content}</p>

                              {distill.mentions && distill.mentions.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {distill.mentions.slice(0, 5).map((mention, i) => (
                                    <Badge
                                      key={i}
                                      variant="secondary"
                                      className="text-xs bg-secondary/50 text-secondary-foreground hover:bg-secondary"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {mention}
                                    </Badge>
                                  ))}
                                  {distill.mentions.length > 5 && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-secondary/50 text-secondary-foreground"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      +{distill.mentions.length - 5}
                                    </Badge>
                                  )}
                                </div>
                              )}

                              {distill.links && distill.links.length > 0 && (
                                <div className="pt-3 border-t border-border space-y-2">
                                  <div className="flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4 text-primary" />
                                    <h4 className="text-sm font-semibold text-card-foreground">Relevant Links</h4>
                                  </div>
                                  <div className="space-y-1.5">
                                    {distill.links.map((link, i) => (
                                      <a
                                        key={i}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:underline transition-colors group"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span className="truncate">{link.title}</span>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {distill.highInfluenceParticipants && distill.highInfluenceParticipants.length > 0 && (
                                <div className="pt-3 border-t border-border space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    <h4 className="text-sm font-semibold text-card-foreground">
                                      High-Influence Participants
                                    </h4>
                                  </div>
                                  <div className="space-y-2">
                                    {distill.highInfluenceParticipants.map((participant, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="flex items-center gap-3">
                                          <Avatar className="h-8 w-8 border border-border">
                                            <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                                            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                                              {participant.username.slice(1, 3).toUpperCase()}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="text-sm font-medium text-card-foreground">
                                            {participant.username}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                          <div className="flex items-center gap-1">
                                            <Heart className="w-3.5 h-3.5 text-pink-500" />
                                            <span>{participant.hearts.toLocaleString()}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Repeat2 className="w-3.5 h-3.5 text-green-500" />
                                            <span>{participant.retweets.toLocaleString()}</span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Recent Tweets Section */}
                              {distill.recentTweets && distill.recentTweets.length > 0 && (
                                <div className="pt-3 border-t border-border space-y-3">
                                  <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-blue-500" />
                                    <h4 className="text-sm font-semibold text-card-foreground">
                                      Recent Tweets
                                    </h4>
                                  </div>
                                  <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {distill.recentTweets.map((tweet, i) => (
                                      <div
                                        key={tweet.id}
                                        className="p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors border border-border/50"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="flex items-start gap-3">
                                          <Avatar className="h-8 w-8 border border-border">
                                            <AvatarImage src={tweet.avatar || "/placeholder.svg"} />
                                            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                                              {tweet.author.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="flex-1 min-w-0 space-y-2">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-semibold text-card-foreground">
                                                @{tweet.author}
                                              </span>
                                              <span className="text-xs text-muted-foreground">
                                                {getRelativeTime(tweet.created_at)}
                                              </span>
                                            </div>
                                            <p className="text-sm text-foreground leading-relaxed">
                                              {tweet.text}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                              <div className="flex items-center gap-1">
                                                <Heart className="w-3 h-3" />
                                                <span>{tweet.likes.toLocaleString()}</span>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <Repeat2 className="w-3 h-3" />
                                                <span>{tweet.retweets.toLocaleString()}</span>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <MessageSquare className="w-3 h-3" />
                                                <span>{tweet.replies.toLocaleString()}</span>
                                              </div>
                                              {tweet.views && (
                                                <div className="flex items-center gap-1">
                                                  <Eye className="w-3 h-3" />
                                                  <span>{tweet.views.toLocaleString()}</span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-6 pt-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MessageSquare className="w-4 h-4" />
                                  <span className="text-sm">
                                    {distill.conversations.toLocaleString()} conversations
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <TrendingUp className="w-4 h-4" />
                                  <span className="text-sm">{distill.engagement.toLocaleString()} engagement</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Viral Tweets Section */}
                      {distill.viralTweets && distill.viralTweets.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Badge
                              className="bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30"
                              onClick={(e) => e.stopPropagation()}
                            >
                              VIRAL ({distill.viralTweets.length})
                            </Badge>
                          </div>

                          <div className="space-y-3">
                            {distill.viralTweets.map((tweet) => (
                              <Card
                                key={tweet.id}
                                className="border-border bg-card/50 hover:border-primary/50 transition-colors cursor-pointer"
                                onClick={() => setSelectedDistill(null)}
                              >
                                <CardContent className="p-5 space-y-3">
                                  {/* Tweet Header */}
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                      <Avatar className="h-9 w-9 border border-border">
                                        <AvatarImage src={tweet.avatar || "/placeholder.svg"} />
                                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                                          {tweet.username.slice(1, 3).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="text-sm font-semibold text-card-foreground">{tweet.username}</p>
                                        <p className="text-xs text-muted-foreground">{tweet.timestamp}</p>
                                      </div>
                                    </div>
                                    <Badge
                                      className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Viral
                                    </Badge>
                                  </div>

                                  {/* Tweet Content */}
                                  <p className="text-sm text-foreground leading-relaxed">{tweet.content}</p>

                                  {/* Engagement Metrics */}
                                  <div className="flex items-center gap-5 text-muted-foreground">
                                    <button
                                      className="flex items-center gap-1.5 hover:text-pink-400 transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Heart className="w-3.5 h-3.5" />
                                      <span className="text-xs">{tweet.likes}</span>
                                    </button>
                                    <button
                                      className="flex items-center gap-1.5 hover:text-green-400 transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Repeat2 className="w-3.5 h-3.5" />
                                      <span className="text-xs">{tweet.retweets}</span>
                                    </button>
                                    <button
                                      className="flex items-center gap-1.5 hover:text-blue-400 transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" />
                                      <span className="text-xs">{tweet.replies}</span>
                                    </button>
                                    <button
                                      className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span className="text-xs">{tweet.views}</span>
                                    </button>
                                    <button
                                      className="flex items-center gap-1.5 hover:text-primary transition-colors ml-auto"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                      <span className="text-xs">View</span>
                                    </button>
                                  </div>

                                  {/* Summary Section */}
                                  <div className="pt-3 border-t border-border space-y-1.5">
                                    <div>
                                      <span className="text-xs font-semibold text-card-foreground">Summary: </span>
                                      <span className="text-xs text-muted-foreground">{tweet.summary}</span>
                                    </div>
                                    <div>
                                      <span className="text-xs font-semibold text-card-foreground">
                                        Why interesting:{" "}
                                      </span>
                                      <span className="text-xs text-muted-foreground">{tweet.whyInteresting}</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
