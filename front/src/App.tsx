import { useEffect, useMemo, useState, useRef } from "react";
import { Link, Route, Routes, useParams, useNavigate } from "react-router-dom";
import { apiClient } from "./api/client";
import { useAuth } from "./contexts/AuthContext";
import { useWindowPosition } from "./contexts/WindowPositionContext";
import { AuthModal } from "./components/AuthModal";
import { PlayModal } from "./components/PlayModal";
import { HourglassLoader } from "./components/win95/HourglassLoader";
import { Win95Button } from "./components/win95/Win95Button";
import { Win95Input } from "./components/win95/Win95Input";
import { Win95Textarea } from "./components/win95/Win95Textarea";
import { Win95Modal } from "./components/win95/Win95Modal";

// Fix for TypeScript import.meta.env
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

type GameSummary = {
  id: string;
  title: string;
  cover_url?: string;
  tags_user?: string[];
  tags_system?: string[];
  status: string;
  teamId?: string;
};

type GameDetails = GameSummary & {
  description_md?: string;
  repo_url?: string;
  build_url?: string | null;
  team?: { name: string; members: string[] };
  teamId?: string;
};

type Team = {
  id: string;
  name: string;
  leader: string;
  leaderLogin?: string;
  members: string[];
  memberLogins?: string[];
};

type Comment = {
  id: string;
  text: string;
  userLogin: string;
  userId: string;
  createdAt: string;
};

const WindowControls = () => (
  <div className="win-window-controls">
    <button className="win-btn" type="button">
      _
    </button>
    <button className="win-btn" type="button">
      □
    </button>
    <button className="win-btn" type="button">
      ×
    </button>
  </div>
);

const WindowShell = ({ title, children, toolbar }: { title: string; children: React.ReactNode; toolbar?: React.ReactNode }) => {
  const { position, setPosition } = useWindowPosition();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".win-titlebar")) {
      setIsDragging(true);
      if (windowRef.current) {
        const rect = windowRef.current.getBoundingClientRect();
        setDragStart({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, setPosition]);

  return (
    <div className="app-root">
      <div
        ref={windowRef}
        className="win-window-base win-window"
        style={{
          position: "absolute",
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? "grabbing" : "default",
        }}
      >
        <header
          className="win-titlebar"
          onMouseDown={handleMouseDown}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          <div className="title">
            <span>◆</span>
            <span>{title}</span>
          </div>
          <WindowControls />
        </header>
        {toolbar}
        {children}
      </div>
    </div>
  );
};

// Component for cover image with loader
const CoverImageWithLoader = ({ src, alt }: { src: string | null | undefined; alt: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Don't render if src is empty
  if (!src) {
    return (
      <div style={{ 
        width: "100%", 
        height: "100%", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        padding: "20px", 
        textAlign: "center", 
        color: "var(--win-gray-dark)",
        fontSize: "11px"
      }}>
        No image available
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {loading && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <HourglassLoader />
        </div>
      )}
      {error ? (
        <div style={{ 
          padding: "20px", 
          textAlign: "center", 
          color: "var(--win-gray-dark)",
          fontSize: "11px",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          Failed to load image
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            border: "2px solid var(--win-gray-dark)",
            opacity: loading ? 0 : 1,
            transition: "opacity 0.3s",
          }}
          onLoad={() => {
            setLoading(false);
            setError(false);
          }}
          onError={(e) => {
            console.error("Failed to load cover image:", src, e);
            setLoading(false);
            setError(true);
          }}
        />
      )}
    </div>
  );
};

const CatalogPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<GameSummary[]>([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [teamFilterId, setTeamFilterId] = useState<string | null>(null);
  const [teamFilterName, setTeamFilterName] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  // Check URL params for teamId filter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const teamId = params.get("teamId");
    if (teamId) {
      setTeamFilterId(teamId);
      // Load team name
      apiClient.json<{ teams: Team[] }>("/teams")
        .then((data) => {
          const team = data.teams.find((t) => t.id === teamId);
          if (team) {
            setTeamFilterName(team.name);
            if (!selectedTags.includes(team.name)) {
              setSelectedTags((prev) => [...prev, team.name]);
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  const loadGames = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchTitle.trim()) params.append("title", searchTitle.trim());
      if (selectedTags.length > 0) {
        selectedTags.forEach((tag) => params.append("tag", tag));
      }
      if (teamFilterId) {
        params.append("teamId", teamFilterId);
      }
      const query = params.toString();
      const data = (await apiClient.json<GameSummary[]>(`/games${query ? `?${query}` : ""}`)) as GameSummary[];
      
      // Debug: log cover URLs to verify they are signed URLs, not S3 keys
      data.forEach((game) => {
        if (game.cover_url) {
          if (game.cover_url.startsWith('covers/')) {
            console.error(`[CatalogPage] ERROR: Received S3 key instead of signed URL for game ${game.id}: ${game.cover_url}`);
          } else if (game.cover_url.startsWith('http')) {
            console.log(`[CatalogPage] Received signed URL for game ${game.id}: ${game.cover_url.substring(0, 100)}...`);
          } else {
            console.warn(`[CatalogPage] Unexpected cover_url format for game ${game.id}: ${game.cover_url}`);
          }
        }
      });
      
      setGames(data);
      
      // Extract all unique tags from games
      const tagsSet = new Set<string>();
      data.forEach((game) => {
        (game.tags_user || []).forEach((tag) => tagsSet.add(tag));
        (game.tags_system || []).forEach((tag) => tagsSet.add(tag));
      });
      // Add team filter name to tags if present
      if (teamFilterName && !tagsSet.has(teamFilterName)) {
        tagsSet.add(teamFilterName);
      }
      setAllTags(Array.from(tagsSet).sort());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGames();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadGames();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTitle, selectedTags, teamFilterId]);

  const toggleTag = (tag: string) => {
    // If removing team filter tag, clear team filter
    if (teamFilterName && tag === teamFilterName) {
      setTeamFilterId(null);
      setTeamFilterName(null);
      navigate("/", { replace: true });
    }
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const toolbar = (
    <>
      <nav className="win-menu">
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}><span>Catalog</span></Link>
        <Link to="/teams" style={{ textDecoration: "none", color: "inherit" }}><span>Teams</span></Link>
        {auth.user && <Link to="/editor/games/new" style={{ textDecoration: "none", color: "inherit" }}><span>New Game</span></Link>}
        {auth.user?.isSuperAdmin && <Link to="#" style={{ textDecoration: "none", color: "inherit" }}><span>Settings</span></Link>}
        <div style={{ position: "relative", display: "inline-block" }}>
          <span onClick={() => setHelpOpen(!helpOpen)} style={{ cursor: "pointer" }}>Help</span>
          {helpOpen && (
            <div
              className="win-outset"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "4px",
                minWidth: "300px",
                zIndex: 101,
                padding: "12px",
              }}
            >
              <p style={{ margin: 0, fontSize: "12px" }}>
                <strong>Birdmaid</strong> — каталог игр для сообщества геймдевов Омска. 
                Здесь можно публиковать веб-сборки игр, просматривать каталог и играть в браузере.
              </p>
            </div>
          )}
        </div>
      </nav>
      <div className="toolbar">
        <Win95Input
          placeholder="Search by title..."
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          style={{ flex: 1 }}
        />
        <div style={{ marginLeft: "8px", position: "relative" }}>
          {auth.user ? (
            <div style={{ position: "relative" }}>
              <Win95Button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ minWidth: "120px" }}
              >
                {auth.user.login}
              </Win95Button>
              {menuOpen && (
                <div
                  className="win-outset"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "4px",
                    minWidth: "120px",
                    zIndex: 101,
                  }}
                >
                  <button
                    className="win-btn"
                    type="button"
                    onClick={() => {
                      auth.logout();
                      setMenuOpen(false);
                    }}
                    style={{ width: "100%" }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Win95Button type="button" onClick={() => setAuthModalOpen(true)}>
              Login
            </Win95Button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      <WindowShell title="Birdmaid - Catalog.exe" toolbar={toolbar}>
        <div className="tag-bar" style={{ padding: "8px 12px", borderBottom: "1px solid var(--win-gray-dark)", minHeight: "40px" }}>
          {allTags.length > 0 ? (
            <>
              {allTags.slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  className={`tag-chip ${selectedTags.includes(tag) ? "selected" : ""}`}
                  onClick={() => toggleTag(tag)}
                  style={{
                    backgroundColor: selectedTags.includes(tag) ? "var(--win-blue)" : "var(--win-gray)",
                    color: selectedTags.includes(tag) ? "var(--win-white)" : "var(--win-black)",
                  }}
                >
                  {tag}
                </button>
              ))}
              {allTags.length > 10 && (
                <select
                  className="win-inset"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) toggleTag(e.target.value);
                    e.target.value = "";
                  }}
                  style={{ padding: "4px 6px", marginLeft: "8px" }}
                >
                  <option value="">More tags...</option>
                  {allTags.slice(10).map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              )}
            </>
          ) : (
            <span style={{ fontSize: "11px", color: "var(--win-gray-dark)" }}>No tags available</span>
          )}
        </div>
        <main className="content">
        {loading && <p>Loading...</p>}
        {!loading && error && (
          <div className="win-outset panel">
            <p>Unable to load catalog.</p>
            <Win95Button type="button" onClick={loadGames}>
              Retry
            </Win95Button>
          </div>
        )}
        {!loading && !error && games.length === 0 && <p>No games available.</p>}
        {!loading && !error && games.length > 0 && (
          <div className="catalog-grid">
            {games.map((game) => (
              <div key={game.id} className="win-outset game-card" style={{ aspectRatio: "1", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div className="game-thumb" style={{ width: "100%", flex: 1, minHeight: 0, position: "relative", overflow: "hidden", backgroundColor: "#0c0c0c" }}>
                  <CoverImageWithLoader src={game.cover_url || null} alt={game.title} />
                </div>
                <div style={{ padding: "4px", display: "flex", flexDirection: "column", gap: "4px", flexShrink: 0 }}>
                  <strong style={{ fontSize: "12px" }}>{game.title}</strong>
                  <span style={{ fontSize: 10, color: "var(--win-gray-dark)" }}>
                    {(game.tags_user ?? []).concat(game.tags_system ?? []).slice(0, 2).join(", ")}
                  </span>
                  <Link className="win-btn" to={`/games/${game.id}`} style={{ textDecoration: "none", color: "inherit", fontSize: "11px", padding: "4px 8px" }}>
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        </main>
      </WindowShell>
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

const GamePage = () => {
  const { gameId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [game, setGame] = useState<GameDetails | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [playModalOpen, setPlayModalOpen] = useState(false);
  const auth = useAuth();

  const loadComments = async () => {
    if (!gameId) return;
    try {
      const data = await apiClient.json<{ comments: Comment[] }>(`/games/${gameId}/comments`);
      setComments(data.comments);
    } catch (err) {
      // Ignore errors
    }
  };

  useEffect(() => {
    const loadGame = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = (await apiClient.json<GameDetails>(`/games/${gameId}`)) as GameDetails;
        setGame(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    if (gameId) {
      void loadGame();
      void loadComments();
    }
  }, [gameId]);

  const handlePostComment = async () => {
    if (!commentText.trim() || !auth.user) return;
    try {
      await apiClient.json(`/games/${gameId}/comments`, {
        method: "POST",
        body: JSON.stringify({ text: commentText }),
      });
      setCommentText("");
      void loadComments();
    } catch (err) {
      // Ignore errors
    }
  };

  const canPlay = Boolean(game?.build_url);
  const currentGameId = game?.id;

  const [helpOpen, setHelpOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const toolbar = (
    <>
      <nav className="win-menu">
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}><span>Catalog</span></Link>
        <Link to="/teams" style={{ textDecoration: "none", color: "inherit" }}><span>Teams</span></Link>
        {auth.user && <Link to="/editor/games/new" style={{ textDecoration: "none", color: "inherit" }}><span>New Game</span></Link>}
        {auth.user?.isSuperAdmin && <Link to="#" style={{ textDecoration: "none", color: "inherit" }}><span>Settings</span></Link>}
        <div style={{ position: "relative", display: "inline-block" }}>
          <span onClick={() => setHelpOpen(!helpOpen)} style={{ cursor: "pointer" }}>Help</span>
          {helpOpen && (
            <div
              className="win-outset"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "4px",
                minWidth: "300px",
                zIndex: 101,
                padding: "12px",
              }}
            >
              <p style={{ margin: 0, fontSize: "12px" }}>
                <strong>Birdmaid</strong> — каталог игр для сообщества геймдевов Омска. 
                Здесь можно публиковать веб-сборки игр, просматривать каталог и играть в браузере.
              </p>
            </div>
          )}
        </div>
      </nav>
      <div className="toolbar">
        <div style={{ marginLeft: "auto", position: "relative" }}>
          {auth.user ? (
            <div style={{ position: "relative" }}>
              <Win95Button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ minWidth: "120px" }}
              >
                {auth.user.login}
              </Win95Button>
              {menuOpen && (
                <div
                  className="win-outset"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "4px",
                    minWidth: "120px",
                    zIndex: 101,
                  }}
                >
                  <button
                    className="win-btn"
                    type="button"
                    onClick={() => {
                      auth.logout();
                      setMenuOpen(false);
                    }}
                    style={{ width: "100%" }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Win95Button type="button" onClick={() => setAuthModalOpen(true)}>
              Login
            </Win95Button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      <WindowShell title="Birdmaid - Game Details" toolbar={toolbar}>
        <main className="content">
          {loading && <p>Loading...</p>}
          {!loading && error && (
            <>
              <p>Game unavailable.</p>
            </>
          )}
          {!loading && !error && game && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "16px" }}>
              <div>
                <div className="win-outset panel">
                  <h2 style={{ marginTop: 0 }}>{game.title}</h2>
                  {game.description_md && <p>{game.description_md}</p>}
                  {game.team && (
                    <div style={{ marginTop: "12px" }}>
                      <strong>Team:</strong> {game.team.name}
                      {game.team.members.length > 0 && (
                        <div style={{ marginTop: "4px", fontSize: "12px" }}>
                          Members: {game.team.members.join(", ")}
                        </div>
                      )}
                    </div>
                  )}
                  {game.repo_url && (
                    <div style={{ marginTop: "8px" }}>
                      <a href={game.repo_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--win-blue)" }}>
                        Repository
                      </a>
                    </div>
                  )}
                  <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                    <Win95Button 
                      type="button" 
                      onClick={() => {
                        console.log("Play button clicked, build_url:", game?.build_url);
                        setPlayModalOpen(true);
                      }} 
                      disabled={!canPlay}
                    >
                      Play
                    </Win95Button>
                    {currentGameId && (auth.user?.isSuperAdmin || (game.team && game.team.members && auth.user && game.team.members.includes(auth.user.login))) && (
                      <Link to={`/editor/games/${currentGameId}`}>
                        <Win95Button type="button">
                          Edit
                        </Win95Button>
                      </Link>
                    )}
                  </div>
                </div>

                <div className="win-outset panel" style={{ marginTop: "12px" }}>
                  <h3 style={{ marginTop: 0 }}>Comments</h3>
                  {comments.length === 0 && <p style={{ fontSize: "12px", color: "var(--win-gray-dark)" }}>No comments yet.</p>}
                  {comments.map((comment) => (
                    <div key={comment.id} style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid var(--win-gray-dark)" }}>
                      <div style={{ fontSize: "12px", fontWeight: "bold" }}>{comment.userLogin}</div>
                      <div style={{ fontSize: "13px", marginTop: "4px" }}>{comment.text}</div>
                      <div style={{ fontSize: "11px", color: "var(--win-gray-dark)", marginTop: "4px" }}>
                        {new Date(comment.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {auth.user && (
                    <div style={{ marginTop: "12px" }}>
                      <Win95Textarea
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        style={{ width: "100%", minHeight: "60px", marginBottom: "8px" }}
                      />
                      <Win95Button type="button" onClick={handlePostComment}>
                        Post Comment
                      </Win95Button>
                    </div>
                  )}
                  {!auth.user && (
                    <p style={{ fontSize: "12px", marginTop: "12px", color: "var(--win-gray-dark)" }}>
                      <Link to="/" style={{ color: "var(--win-blue)" }}>Login</Link> to post comments
                    </p>
                  )}
                </div>
              </div>
              {game.cover_url && (
                <div className="win-outset panel" style={{ height: "fit-content", position: "relative", minHeight: "200px" }}>
                  <CoverImageWithLoader src={game.cover_url} alt={game.title} />
                </div>
              )}
            </div>
          )}
        </main>
      </WindowShell>
      <PlayModal open={playModalOpen} onClose={() => setPlayModalOpen(false)} buildUrl={game?.build_url || null} />
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

const TeamsPage = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [searchName, setSearchName] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [infoModalOpen, setInfoModalOpen] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [allUsers, setAllUsers] = useState<Array<{ id: string; login: string }>>([]);
  const [newMemberLogin, setNewMemberLogin] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<Array<{ id: string; login: string }>>([]);
  const [createError, setCreateError] = useState("");
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    void loadTeams();
    void loadUsers();
  }, []);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const data = await apiClient.json<{ teams: Team[] }>("/teams");
      setTeams(data.teams);
      setFilteredTeams(data.teams);
    } catch (err) {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchName.trim()) {
      const query = searchName.toLowerCase();
      setFilteredTeams(teams.filter(team => team.name.toLowerCase().includes(query)));
    } else {
      setFilteredTeams(teams);
    }
  }, [searchName, teams]);

  const loadUsers = async () => {
    // TODO: Add endpoint to get all users
    // For now, we'll use empty array
    setAllUsers([]);
  };

  const handleCreate = async () => {
    if (!newTeamName.trim() || !auth.user) {
      setCreateError("Team name is required");
      return;
    }
    try {
      const team = await apiClient.json<Team>("/teams", {
        method: "POST",
        body: JSON.stringify({ name: newTeamName.trim() }),
      });
      await loadTeams();
      setNewTeamName("");
      setCreateModalOpen(false);
      setCreateError("");
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create team");
    }
  };

  const handleOpenInfo = (team: Team) => {
    setSelectedTeam(team);
    setInfoModalOpen(team.id);
  };

  const handleAddMember = async () => {
    if (!selectedTeam || !newMemberLogin.trim() || !auth.user) return;
    try {
      await apiClient.json(`/teams/${selectedTeam.id}/members`, {
        method: "POST",
        body: JSON.stringify({ userLogin: newMemberLogin.trim() }),
      });
      await loadTeams();
      // Update selectedTeam with new data
      const updatedTeams = await apiClient.json<{ teams: Team[] }>("/teams");
      const updatedTeam = updatedTeams.teams.find(t => t.id === selectedTeam.id);
      if (updatedTeam) {
        setSelectedTeam(updatedTeam);
      }
      setNewMemberLogin("");
      setFilteredUsers([]);
    } catch (err) {
      console.error("Error adding member:", err);
      // TODO: Show error modal
    }
  };

  const handleSearchUsers = async (loginQuery: string) => {
    if (!loginQuery.trim() || !auth.user) {
      setFilteredUsers([]);
      return;
    }
    try {
      const data = await apiClient.json<{ users: Array<{ id: string; login: string }> }>(`/users?login=${encodeURIComponent(loginQuery)}`);
      setFilteredUsers(data.users);
    } catch (err) {
      console.error("Error searching users:", err);
      setFilteredUsers([]);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void handleSearchUsers(newMemberLogin);
    }, 300);
    return () => clearTimeout(timer);
  }, [newMemberLogin]);

  const handleRemoveMember = async (userId: string) => {
    if (!selectedTeam || !auth.user) return;
    try {
      await apiClient.json(`/teams/${selectedTeam.id}/members/${userId}`, {
        method: "DELETE",
      });
      await loadTeams();
      const updatedTeams = await apiClient.json<{ teams: Team[] }>("/teams");
      const updatedTeam = updatedTeams.teams.find(t => t.id === selectedTeam.id);
      if (updatedTeam) {
        setSelectedTeam(updatedTeam);
      }
    } catch (err) {
      console.error("Error removing member:", err);
    }
  };

  const handleTransferLeadership = async (userId: string) => {
    if (!selectedTeam || !auth.user) return;
    try {
      await apiClient.json(`/teams/${selectedTeam.id}/leader`, {
        method: "POST",
        body: JSON.stringify({ newLeaderId: userId }),
      });
      await loadTeams();
      const updatedTeams = await apiClient.json<{ teams: Team[] }>("/teams");
      const updatedTeam = updatedTeams.teams.find(t => t.id === selectedTeam.id);
      if (updatedTeam) {
        setSelectedTeam(updatedTeam);
      }
    } catch (err) {
      console.error("Error transferring leadership:", err);
    }
  };

  const [helpOpen, setHelpOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const toolbar = (
    <>
      <nav className="win-menu">
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}><span>Catalog</span></Link>
        <Link to="/teams" style={{ textDecoration: "none", color: "inherit" }}><span>Teams</span></Link>
        {auth.user && <Link to="/editor/games/new" style={{ textDecoration: "none", color: "inherit" }}><span>New Game</span></Link>}
        {auth.user?.isSuperAdmin && <Link to="#" style={{ textDecoration: "none", color: "inherit" }}><span>Settings</span></Link>}
        <div style={{ position: "relative", display: "inline-block" }}>
          <span onClick={() => setHelpOpen(!helpOpen)} style={{ cursor: "pointer" }}>Help</span>
          {helpOpen && (
            <div
              className="win-outset"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "4px",
                minWidth: "300px",
                zIndex: 101,
                padding: "12px",
              }}
            >
              <p style={{ margin: 0, fontSize: "12px" }}>
                <strong>Birdmaid</strong> — каталог игр для сообщества геймдевов Омска. 
                Здесь можно публиковать веб-сборки игр, просматривать каталог и играть в браузере.
              </p>
            </div>
          )}
        </div>
      </nav>
      <div className="toolbar">
        <div style={{ marginLeft: "auto", position: "relative" }}>
          {auth.user ? (
            <div style={{ position: "relative" }}>
              <Win95Button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ minWidth: "120px" }}
              >
                {auth.user.login}
              </Win95Button>
              {menuOpen && (
                <div
                  className="win-outset"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "4px",
                    minWidth: "120px",
                    zIndex: 101,
                  }}
                >
                  <button
                    className="win-btn"
                    type="button"
                    onClick={() => {
                      auth.logout();
                      setMenuOpen(false);
                    }}
                    style={{ width: "100%" }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Win95Button type="button" onClick={() => setAuthModalOpen(true)}>
              Login
            </Win95Button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <WindowShell title="Birdmaid - Teams" toolbar={toolbar}>
      <main className="content">
        <div className="win-outset panel" style={{ marginBottom: 12 }}>
          <h2 style={{ marginTop: 0 }}>Team Registry</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Win95Input
              value={searchName}
              onChange={(event) => setSearchName(event.target.value)}
              placeholder="Search teams by name..."
              style={{ flex: 1 }}
            />
            {auth.user && (
              <Win95Button type="button" onClick={() => setCreateModalOpen(true)} style={{ whiteSpace: "nowrap" }}>
                Create Team
              </Win95Button>
            )}
          </div>
        </div>
        {loading && <p>Loading...</p>}
        {!loading && (
          <div className="teams-cards">
            {filteredTeams.map((team) => (
              <div className="win-outset panel" key={team.id}>
                <strong>{team.name}</strong>
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <Win95Button
                    type="button"
                    onClick={() => {
                      navigate(`/?teamId=${team.id}`);
                      window.location.reload();
                    }}
                  >
                    View Games
                  </Win95Button>
                  <Win95Button type="button" onClick={() => handleOpenInfo(team)}>
                    Info
                  </Win95Button>
                </div>
              </div>
            ))}
            {filteredTeams.length === 0 && (
              <div className="win-outset panel">
                <strong>New Team Object</strong>
                <p>Use "Create team" to add a new entry.</p>
              </div>
            )}
          </div>
        )}
      </main>
      {infoModalOpen && selectedTeam && (
        <Win95Modal title={`Team: ${selectedTeam.name}`} open={!!infoModalOpen} onClose={() => setInfoModalOpen(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: "250px", maxWidth: "350px" }}>
            <div style={{ fontSize: "12px" }}>
              <strong>Leader:</strong> {selectedTeam.leaderLogin || selectedTeam.leader}
            </div>
            <div style={{ fontSize: "12px" }}>
              <strong>Members:</strong>
              <ul style={{ margin: "2px 0", paddingLeft: "20px", fontSize: "12px" }}>
                {selectedTeam.memberLogins && selectedTeam.memberLogins.length > 0 ? (
                  selectedTeam.memberLogins.map((memberLogin, idx) => {
                    const memberId = selectedTeam.members[idx];
                    const isLeader = memberId === selectedTeam.leader;
                    return (
                      <li key={memberId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                        <span>{memberLogin}</span>
                        {auth.user && (auth.user.id === selectedTeam.leader || auth.user.login === selectedTeam.leaderLogin) && !isLeader && (
                          <div style={{ display: "flex", gap: "4px" }}>
                            <Win95Button type="button" onClick={() => handleTransferLeadership(memberId)} style={{ fontSize: "10px", padding: "2px 6px" }}>
                              Make Leader
                            </Win95Button>
                            <Win95Button type="button" onClick={() => handleRemoveMember(memberId)} style={{ fontSize: "10px", padding: "2px 6px" }}>
                              Remove
                            </Win95Button>
                          </div>
                        )}
                      </li>
                    );
                  })
                ) : (
                  <li>No members</li>
                )}
              </ul>
            </div>
            {auth.user && (auth.user.id === selectedTeam.leader || auth.user.login === selectedTeam.leaderLogin) && (
              <div style={{ marginTop: "4px", paddingTop: "6px", borderTop: "1px solid var(--win-gray-dark)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <Win95Input
                    placeholder="Search by login..."
                    value={newMemberLogin}
                    onChange={(e) => setNewMemberLogin(e.target.value)}
                  />
                  {filteredUsers.length > 0 && (
                    <div className="win-outset" style={{ maxHeight: "150px", overflowY: "auto", padding: "4px" }}>
                      {filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          className="win-btn"
                          style={{ display: "block", width: "100%", textAlign: "left", padding: "4px 8px", marginBottom: "2px", cursor: "pointer" }}
                          onClick={() => {
                            setNewMemberLogin(user.login);
                            setFilteredUsers([]);
                          }}
                        >
                          {user.login}
                        </div>
                      ))}
                    </div>
                  )}
                  <Win95Button type="button" onClick={handleAddMember} disabled={!newMemberLogin.trim()} style={{ marginTop: "2px" }}>
                    Add Member
                  </Win95Button>
                </div>
              </div>
            )}
          </div>
        </Win95Modal>
      )}
      {createModalOpen && (
        <Win95Modal title="Create New Team" open={createModalOpen} onClose={() => { setCreateModalOpen(false); setNewTeamName(""); setCreateError(""); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "300px", fontSize: "12px" }}>
            <div className="form-field">
              <label>Team Name</label>
              <Win95Input
                value={newTeamName}
                onChange={(e) => {
                  setNewTeamName(e.target.value);
                  setCreateError("");
                }}
                placeholder="Enter team name..."
                autoFocus
              />
            </div>
            {createError && (
              <div className="win-outset" style={{ padding: "8px", backgroundColor: "var(--win-red)", color: "var(--win-white)", fontSize: "11px" }}>
                {createError}
              </div>
            )}
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" }}>
              <Win95Button type="button" onClick={() => { setCreateModalOpen(false); setNewTeamName(""); setCreateError(""); }}>
                Cancel
              </Win95Button>
              <Win95Button type="button" onClick={handleCreate} disabled={!newTeamName.trim()}>
                Create
              </Win95Button>
            </div>
          </div>
        </Win95Modal>
      )}
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </WindowShell>
  );
};

const EditorPage = () => {
  const { gameId: routeGameId } = useParams();
  const [teamId, setTeamId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [gameId, setGameId] = useState(routeGameId ?? "");
  const [buildUrl, setBuildUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("editing");
  const [remark, setRemark] = useState("");
  const [tagsUser, setTagsUser] = useState<string[]>([]);
  const [tagsSystem, setTagsSystem] = useState<string[]>([]);
  const [tagsUserInput, setTagsUserInput] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.user) {
      navigate("/");
      return;
    }
    void loadTeams();
    if (routeGameId && routeGameId !== "new") {
      void loadGame();
    } else {
      // Reset form for new game
      setGameId("");
      setTitle("");
      setDescription("");
      setRepoUrl("");
      setCoverUrl("");
      setBuildUrl(null);
      setStatus("editing");
      setTagsUser([]);
      setTagsSystem([]);
      setTagsUserInput("");
    }
  }, [auth.user, routeGameId]);

  const loadTeams = async () => {
    try {
      const data = await apiClient.json<{ teams: Team[] }>("/teams");
      setTeams(data.teams.filter((t) => t.members.includes(auth.user!.id) || auth.user!.isSuperAdmin));
    } catch (err) {
      // Ignore errors
    }
  };

  const loadGame = async () => {
    try {
      const data = await apiClient.json<GameDetails>(`/games/${routeGameId}`);
      setTitle(data.title);
      setDescription(data.description_md || "");
      setRepoUrl(data.repo_url || "");
      setCoverUrl(data.cover_url || "");
      setStatus(data.status);
      setTagsUser(data.tags_user || []);
      setTagsSystem(data.tags_system || []);
      setTagsUserInput("");
      setBuildUrl(data.build_url || null);
      // Load teamId from the game data
      if (data.teamId) {
        setTeamId(data.teamId);
      }
    } catch (err) {
      // Ignore errors
    }
  };

  const publishDisabled = useMemo(
    () => !description || !coverUrl || !buildUrl,
    [description, coverUrl, buildUrl]
  );

  const handleCreateGame = async () => {
    const errors: string[] = [];
    if (!teamId) errors.push("Team is required");
    if (!title || !title.trim()) errors.push("Game title is required");
    if (!auth.user) errors.push("You must be logged in");
    
    if (errors.length > 0) {
      setErrorMessage(errors.join(". "));
      setErrorModalOpen(true);
      return;
    }
    
    try {
      const game = await apiClient.json<{ id: string }>("/games", {
        method: "POST",
        body: JSON.stringify({
          teamId,
          title,
          description_md: description,
          repo_url: repoUrl,
          // cover_url is not sent here - it will be uploaded via /cover endpoint after game creation
        }),
      });
      setGameId(game.id);
      
      // Upload cover if user selected a file
      if (coverFile && coverUrl && coverUrl.startsWith("blob:")) {
        try {
          const formData = new FormData();
          formData.append("file", coverFile);
          await apiClient.json(`/games/${game.id}/cover`, {
            method: "POST",
            body: formData,
          });
        } catch (err) {
          console.error("Error uploading cover:", err);
          setErrorMessage(err instanceof Error ? err.message : "Failed to upload cover image");
          setErrorModalOpen(true);
        }
      }
      
      // Save tags if they were set
      if (tagsUser.length > 0 || tagsSystem.length > 0) {
        try {
          await apiClient.json(`/games/${game.id}/tags`, {
            method: "PATCH",
            body: JSON.stringify({ 
              tags_user: tagsUser,
              tags_system: auth.user?.isSuperAdmin ? tagsSystem : undefined,
            }),
          });
        } catch (err) {
          console.error("Error saving tags:", err);
          // Don't block navigation if tags fail
        }
      }
      
      navigate(`/editor/games/${game.id}`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to create game");
      setErrorModalOpen(true);
    }
  };

  const handleUpdateGame = async () => {
    if (!gameId || !auth.user) return;
    try {
      // Don't send cover_url in update - it's handled by separate upload endpoint
      // If coverUrl is a blob URL, it means user selected a file but didn't upload yet
      // In that case, we should upload it first
      if (coverFile && coverUrl && coverUrl.startsWith("blob:")) {
        // Upload cover if it's a new file
        const formData = new FormData();
        formData.append("file", coverFile);
        await apiClient.json(`/games/${gameId}/cover`, {
          method: "POST",
          body: formData,
        });
      }
      
      await apiClient.json(`/games/${gameId}`, {
        method: "PATCH",
        body: JSON.stringify({
          teamId,
          title,
          description_md: description,
          repo_url: repoUrl,
          // cover_url is not sent here - it's managed via /cover endpoint
        }),
      });
      // Save tags if they were changed
      if (tagsUser.length > 0 || tagsSystem.length > 0) {
        await apiClient.json(`/games/${gameId}/tags`, {
          method: "PATCH",
          body: JSON.stringify({ 
            tags_user: tagsUser,
            tags_system: auth.user?.isSuperAdmin ? tagsSystem : undefined,
          }),
        });
      }
      // Reload game to get updated team info, cover URL, and tags
      void loadGame();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update game");
      setErrorModalOpen(true);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) return;
    // For new games, create the game first if it doesn't exist
    if (!gameId && teamId && title) {
      try {
        const game = await apiClient.json<{ id: string }>("/games", {
          method: "POST",
          body: JSON.stringify({
            teamId,
            title,
            description_md: description,
            repo_url: repoUrl,
            cover_url: coverUrl,
          }),
        });
        setGameId(game.id);
        // Continue with upload after game is created
        const formData = new FormData();
        formData.append("file", event.target.files[0]);
        const result = await apiClient.json<{ build_url: string }>(`/admin/games/${game.id}/build`, {
          method: "POST",
          body: formData,
        });
        setBuildUrl(result.build_url);
        navigate(`/editor/games/${game.id}`);
        return;
      } catch (err) {
        console.error("Error creating game for upload:", err);
        return;
      }
    }
    if (!gameId) return;
    const formData = new FormData();
    formData.append("file", event.target.files[0]);
    try {
      const result = await apiClient.json<{ build_url: string }>(`/admin/games/${gameId}/build`, {
        method: "POST",
        body: formData,
      });
      setBuildUrl(result.build_url);
    } catch (err) {
      // Ignore errors
    }
  };

  const handlePublish = async () => {
    if (!gameId) return;
    try {
      await apiClient.json(`/games/${gameId}/publish`, { method: "POST" });
      setStatus("published");
    } catch (err) {
      // Ignore errors
    }
  };

  const handleArchive = async () => {
    if (!gameId) return;
    try {
      await apiClient.json(`/games/${gameId}/archive`, { method: "POST" });
      setStatus("archived");
    } catch (err) {
      // Ignore errors
    }
  };

  const handleStatusUpdate = async () => {
    if (!gameId || !auth.user?.isSuperAdmin) return;
    try {
      await apiClient.json(`/games/${gameId}/status`, {
        method: "POST",
        body: JSON.stringify({ status, remark: remark || undefined }),
      });
    } catch (err) {
      // Ignore errors
    }
  };

  const handleTagsUpdate = async () => {
    if (!gameId) return;
    try {
      await apiClient.json(`/games/${gameId}/tags`, {
        method: "PATCH",
        body: JSON.stringify({ 
          tags_user: tagsUser,
          tags_system: auth.user?.isSuperAdmin ? tagsSystem : undefined,
        }),
      });
      // Reload game to get updated tags
      void loadGame();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save tags");
      setErrorModalOpen(true);
    }
  };

  const handleAddUserTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = tagsUserInput.trim();
      if (value && !tagsUser.includes(value)) {
        setTagsUser([...tagsUser, value]);
        setTagsUserInput("");
      }
    }
  };

  const handleRemoveUserTag = (tagToRemove: string) => {
    setTagsUser(tagsUser.filter((tag) => tag !== tagToRemove));
  };

  // Predefined system tags (hackathons and genres)
  const systemTagsOptions = [
    "omsk-hackathon-2024",
    "omsk-hackathon-2025",
    "global-game-jam",
    "ludum-dare",
    "action",
    "puzzle",
    "platformer",
    "rpg",
    "strategy",
    "arcade",
  ];

  const [helpOpen, setHelpOpen] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [helpTooltipOpen, setHelpTooltipOpen] = useState<string | null>(null);

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (300 KB)
    const maxSize = 300 * 1024; // 300 KB
    if (file.size > maxSize) {
      setErrorMessage(`File size exceeds 300 KB limit. Current size: ${(file.size / 1024).toFixed(2)} KB`);
      setErrorModalOpen(true);
      event.target.value = ""; // Clear input
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrorMessage("File must be an image");
      setErrorModalOpen(true);
      event.target.value = ""; // Clear input
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setCoverUrl(previewUrl);
    setCoverFile(file);

    // Upload to server if game exists
    if (gameId) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        await apiClient.json(`/games/${gameId}/cover`, {
          method: "POST",
          body: formData,
        });
        // Reload game to get signed URL for cover
        void loadGame();
      } catch (err) {
        console.error("Error uploading cover:", err);
        setErrorMessage(err instanceof Error ? err.message : "Failed to upload cover image");
        setErrorModalOpen(true);
        // Keep preview URL for now
      }
    }
  };

  if (!auth.user) return null;

  const toolbar = (
    <>
      <nav className="win-menu">
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}><span>Catalog</span></Link>
        <Link to="/teams" style={{ textDecoration: "none", color: "inherit" }}><span>Teams</span></Link>
        {auth.user && <Link to="/editor/games/new" style={{ textDecoration: "none", color: "inherit" }}><span>New Game</span></Link>}
        {auth.user?.isSuperAdmin && <Link to="#" style={{ textDecoration: "none", color: "inherit" }}><span>Settings</span></Link>}
        <div style={{ position: "relative", display: "inline-block" }}>
          <span onClick={() => setHelpOpen(!helpOpen)} style={{ cursor: "pointer" }}>Help</span>
          {helpOpen && (
            <div
              className="win-outset"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "4px",
                minWidth: "300px",
                zIndex: 101,
                padding: "12px",
              }}
            >
              <p style={{ margin: 0, fontSize: "12px" }}>
                <strong>Birdmaid</strong> — каталог игр для сообщества геймдевов Омска. 
                Здесь можно публиковать веб-сборки игр, просматривать каталог и играть в браузере.
              </p>
            </div>
          )}
        </div>
      </nav>
      <div className="toolbar">
        <div style={{ marginLeft: "auto", position: "relative" }}>
          {auth.user ? (
            <div style={{ position: "relative" }}>
              <Win95Button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ minWidth: "120px" }}
              >
                {auth.user.login}
              </Win95Button>
              {menuOpen && (
                <div
                  className="win-outset"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "4px",
                    minWidth: "120px",
                    zIndex: 101,
                  }}
                >
                  <button
                    className="win-btn"
                    type="button"
                    onClick={() => {
                      auth.logout();
                      setMenuOpen(false);
                    }}
                    style={{ width: "100%" }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Win95Button type="button" onClick={() => setAuthModalOpen(true)}>
              Login
            </Win95Button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      <WindowShell title="Birdmaid - Game Editor" toolbar={toolbar}>
      <main className="content">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <div>
            <div className="status-pill">STATUS: {status.toUpperCase()}</div>
          </div>
        </div>
        <div className="editor-layout">
          <div>
            <section className="win-outset panel">
              <h3>General Properties</h3>
              <div className="form-field">
                <label>Team</label>
                <select
                  className="win-inset"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  style={{ padding: "4px 6px", width: "100%" }}
                >
                  <option value="">Select team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Game Title</label>
                <Win95Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Description</label>
                <Win95Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Repository</label>
                <Win95Input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
              </div>
              <div className="form-field" style={{ position: "relative" }}>
                <label>
                  Cover Image (max 300 KB)
                  <button
                    type="button"
                    onClick={() => setHelpTooltipOpen(helpTooltipOpen === "cover" ? null : "cover")}
                    style={{
                      marginLeft: "4px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "12px",
                      color: "var(--win-blue)",
                      textDecoration: "underline",
                    }}
                  >
                    ?
                  </button>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  style={{ marginBottom: "8px" }}
                />
                {coverUrl && (
                  <div style={{ marginTop: "8px", position: "relative", minHeight: "200px" }}>
                    <CoverImageWithLoader src={coverUrl} alt="Cover preview" />
                  </div>
                )}
                {coverFile && (
                  <div style={{ marginTop: "4px", fontSize: "11px", color: "var(--win-gray-dark)" }}>
                    File: {coverFile.name} ({(coverFile.size / 1024).toFixed(2)} KB)
                  </div>
                )}
              </div>
              {!gameId ? (
                <Win95Button type="button" onClick={handleCreateGame}>
                  Create game
                </Win95Button>
              ) : (
                <>
                  <Win95Button type="button" onClick={handleUpdateGame}>
                    Save game
                  </Win95Button>
                  <span style={{ marginLeft: 8 }}>Game ID: {gameId}</span>
                </>
              )}
            </section>
            {gameId && (
              <>
                <section className="win-outset panel" style={{ position: "relative" }}>
                  <h3>
                    Build Upload
                    <button
                      type="button"
                      onClick={() => setHelpTooltipOpen(helpTooltipOpen === "build" ? null : "build")}
                      style={{
                        marginLeft: "4px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "12px",
                        color: "var(--win-blue)",
                        textDecoration: "underline",
                      }}
                    >
                      ?
                    </button>
                  </h3>
                  <div style={{ marginBottom: "8px" }}>
                    <input type="file" accept=".zip" onChange={handleUpload} />
                  </div>
                  {buildUrl && (
                    <div style={{ marginTop: "12px" }}>
                      <iframe
                        title="Build preview"
                        src={buildUrl}
                        style={{ width: "100%", height: 240, border: "2px solid #000" }}
                      />
                    </div>
                  )}
                </section>
                <section className="win-outset panel">
                  <h3>Tags</h3>
                  <div className="form-field">
                    <label>User tags (comma-separated or press Enter)</label>
                    <Win95Input 
                      value={tagsUserInput} 
                      onChange={(e) => setTagsUserInput(e.target.value)}
                      onKeyDown={handleAddUserTag}
                      placeholder="Type tag and press Enter or comma"
                    />
                    {tagsUser.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
                        {tagsUser.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "2px 6px",
                              backgroundColor: "var(--win-gray)",
                              border: "1px solid var(--win-gray-dark)",
                              fontSize: "11px",
                            }}
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveUserTag(tag)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 0,
                                margin: 0,
                                fontSize: "12px",
                                lineHeight: 1,
                                color: "var(--win-black)",
                                fontWeight: "bold",
                              }}
                              title="Remove tag"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {auth.user?.isSuperAdmin && (
                    <div className="form-field">
                      <label>System tags</label>
                      <select
                        className="win-inset"
                        multiple
                        value={tagsSystem}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                          setTagsSystem(selected);
                        }}
                        style={{ padding: "4px", width: "100%", minHeight: "80px" }}
                      >
                        {systemTagsOptions.map((tag) => (
                          <option key={tag} value={tag}>
                            {tag}
                          </option>
                        ))}
                      </select>
                      <div style={{ fontSize: "11px", color: "var(--win-gray-dark)", marginTop: "4px" }}>
                        Hold Ctrl/Cmd to select multiple tags
                      </div>
                      {tagsSystem.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
                          {tagsSystem.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "2px 6px",
                                backgroundColor: "var(--win-blue)",
                                color: "var(--win-white)",
                                border: "1px solid var(--win-gray-dark)",
                                fontSize: "11px",
                              }}
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => setTagsSystem(tagsSystem.filter((t) => t !== tag))}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: 0,
                                  margin: 0,
                                  fontSize: "12px",
                                  lineHeight: 1,
                                  color: "var(--win-white)",
                                  fontWeight: "bold",
                                }}
                                title="Remove tag"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <Win95Button type="button" onClick={handleTagsUpdate} style={{ marginTop: "8px" }}>
                    Save tags
                  </Win95Button>
                </section>
              </>
            )}
          </div>
          {gameId && (
            <aside className="win-outset panel">
              <h3>Publishing</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Win95Button type="button" disabled={publishDisabled} onClick={handlePublish}>
                  Publish
                </Win95Button>
                <Win95Button type="button" onClick={handleArchive}>
                  Archive
                </Win95Button>
              </div>
              {auth.user.isSuperAdmin && (
                <>
                  <div className="form-field" style={{ marginTop: "12px" }}>
                    <label>Status</label>
                    <select
                      className="win-inset"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      style={{ padding: "4px 6px", width: "100%" }}
                    >
                      <option value="editing">editing</option>
                      <option value="published">published</option>
                      <option value="archived">archived</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Remark (optional)</label>
                    <Win95Input value={remark} onChange={(e) => setRemark(e.target.value)} />
                  </div>
                  <Win95Button type="button" onClick={handleStatusUpdate}>
                    Force Status Change
                  </Win95Button>
                </>
              )}
            </aside>
          )}
        </div>
      </main>
      </WindowShell>
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      {errorModalOpen && (
        <Win95Modal title="Error" open={errorModalOpen} onClose={() => setErrorModalOpen(false)}>
          <div>
            <p style={{ margin: "0 0 8px 0", fontSize: "12px" }}>{errorMessage || "An error occurred"}</p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Win95Button type="button" onClick={() => setErrorModalOpen(false)}>
                Close
              </Win95Button>
            </div>
          </div>
        </Win95Modal>
      )}
      {helpTooltipOpen === "cover" && (
        <Win95Modal title="Help - Cover Image" open={true} onClose={() => setHelpTooltipOpen(null)}>
          <div style={{ maxWidth: "400px" }}>
            <p style={{ margin: 0, fontSize: "12px" }}>
              Cover images must be image files (JPG, PNG, GIF, WebP) and cannot exceed 300 KB in size.
            </p>
          </div>
        </Win95Modal>
      )}
      {helpTooltipOpen === "build" && (
        <Win95Modal title="Help - Build Upload" open={true} onClose={() => setHelpTooltipOpen(null)}>
          <div style={{ maxWidth: "400px" }}>
            <p style={{ margin: 0, fontSize: "12px" }}>
              Upload a ZIP file containing your game build. The ZIP should contain an index.html file at the root. Maximum size: 300 MB.
            </p>
          </div>
        </Win95Modal>
      )}
    </>
  );
};

const NotFound = () => (
  <WindowShell title="Birdmaid - 404.exe">
    <main className="content">
      <p>Not Found</p>
    </main>
  </WindowShell>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/games/:gameId" element={<GamePage />} />
      <Route path="/teams" element={<TeamsPage />} />
      <Route path="/editor/games/new" element={<EditorPage />} />
      <Route path="/editor/games/:gameId" element={<EditorPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
