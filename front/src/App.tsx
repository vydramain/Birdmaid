import { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useLocation, useParams } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

// GlobalNavigation component with menu bar tabs
const GlobalNavigation = () => {
  const location = useLocation();
  const { gameId } = useParams();

  return (
    <nav className="win-menu">
      <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
        <span>Catalog</span>
      </Link>
      {gameId && (
        <Link to={`/games/${gameId}`} style={{ textDecoration: "none", color: "inherit" }}>
          <span>Game</span>
        </Link>
      )}
      <Link to="/admin/teams" style={{ textDecoration: "none", color: "inherit" }}>
        <span>Teams</span>
      </Link>
      <Link to="/admin/games/new" style={{ textDecoration: "none", color: "inherit" }}>
        <span>Editor</span>
      </Link>
      <Link to="/admin/settings" style={{ textDecoration: "none", color: "inherit" }}>
        <span>Settings</span>
      </Link>
    </nav>
  );
};

// Simplified fetchJson without auth
const fetchJson = async (path: string, options?: RequestInit) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...options?.headers,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Request failed (${response.status})` }));
    const error = new Error(errorData.message || `Request failed (${response.status})`);
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }
  return response.json();
};

type GameSummary = {
  id: string;
  title: string;
  cover_url?: string;
  tags_user?: string[];
  tags_system?: string[];
  status: string;
};

type GameDetails = GameSummary & {
  description_md?: string;
  repo_url?: string;
  build_url?: string | null;
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

const WindowShell = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="app-root">
    <div className="win-window">
      <header className="win-titlebar">
        <div className="title">
          <span>◆</span>
          <span>{title}</span>
        </div>
        <WindowControls />
      </header>
      {children}
    </div>
  </div>
);

const CatalogPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<GameSummary[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");

  const loadTags = async () => {
    try {
      const data = (await fetchJson("/tags")) as string[];
      setTags(data);
    } catch (err) {
      // Ignore tag loading errors
    }
  };

  const loadGames = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedTag) {
        params.append("tag", selectedTag);
      }
      if (sortBy) {
        params.append("sort", sortBy);
      }
      const queryString = params.toString();
      const url = `/games${queryString ? `?${queryString}` : ""}`;
      const data = (await fetchJson(url)) as GameSummary[];
      setGames(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTags();
  }, []);

  useEffect(() => {
    void loadGames();
  }, [selectedTag, sortBy]);

  return (
    <WindowShell title="Nexus Games - Catalog.exe">
      <GlobalNavigation />
      <div className="toolbar">
        <div className="win-inset" style={{ flex: 1 }}>
          <input
            placeholder="C:\\Nexus\\Games\\Search..."
            style={{ width: "100%", border: "none", background: "transparent" }}
          />
        </div>
        <button className="win-btn" type="button">
          Go
        </button>
        <button className="win-btn" type="button">
          User_01
        </button>
      </div>
      <main className="content">
        <section className="win-outset tag-bar" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", padding: 8 }}>
          <span
            className="tag-chip"
            style={{ cursor: "pointer", backgroundColor: selectedTag === "" ? "#008080" : "transparent" }}
            onClick={() => setSelectedTag("")}
          >
            All Games
          </span>
          {tags.map((tag) => (
            <span
              key={tag}
              className="tag-chip"
              style={{ cursor: "pointer", backgroundColor: selectedTag === tag ? "#008080" : "transparent" }}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </span>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <label style={{ fontSize: 12 }}>Sort:</label>
            <select
              className="win-inset"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: 4, border: "2px inset", background: "#c0c0c0" }}
            >
              <option value="">Default</option>
              <option value="title_asc">Title (A-Z)</option>
              <option value="title_desc">Title (Z-A)</option>
            </select>
          </div>
        </section>
        {loading && (
          <div className="win-outset panel" style={{ padding: 16, textAlign: "center" }}>
            <p>Loading games...</p>
          </div>
        )}
        {!loading && error && (
          <div className="win-outset panel" style={{ padding: 16 }}>
            <p style={{ marginTop: 0 }}>Unable to load catalog.</p>
            <button className="win-btn" type="button" onClick={loadGames}>
              Retry
            </button>
          </div>
        )}
        {!loading && !error && games.length === 0 && (
          <div className="win-outset panel" style={{ padding: 32, textAlign: "center" }}>
            <h2 style={{ marginTop: 0 }}>No games available</h2>
            <p>There are no published games in the catalog yet.</p>
            <Link className="win-btn" to="/admin/games/new" style={{ marginTop: 16, display: "inline-block" }}>
              Create First Game
            </Link>
          </div>
        )}
        {!loading && !error && games.length > 0 && (
          <div className="catalog-grid">
            {games.map((game) => (
              <div key={game.id} className="win-outset game-card">
                <div
                  className="win-inset"
                  style={{
                    padding: 2,
                    marginBottom: 8,
                    aspectRatio: "3/4",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {game.cover_url ? (
                    <img
                      src={game.cover_url}
                      alt={game.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      className="game-thumb"
                      style={{
                        width: "100%",
                        height: "100%",
                        background: "linear-gradient(135deg, #0c0c0c, #2b2b2b)",
                      }}
                    />
                  )}
                </div>
                <div style={{ padding: "0 4px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <strong style={{ fontSize: 14, marginBottom: 4, fontFamily: "inherit" }}>{game.title}</strong>
                  <span style={{ fontSize: 11, color: "#666", marginBottom: 8, fontFamily: "inherit" }}>
                    {(game.tags_user ?? []).concat(game.tags_system ?? []).join(" • ") || "No tags"}
                  </span>
                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: 8,
                      borderTop: "1px solid #fff",
                      boxShadow: "0 -1px 0 #808080",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        textTransform: "uppercase",
                        color: "#006600",
                        fontWeight: "bold",
                      }}
                    >
                      Published
                    </span>
                    <Link className="win-btn" to={`/games/${game.id}`} style={{ padding: "4px 12px", fontSize: 12 }}>
                      Play
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </WindowShell>
  );
};

const GamePage = () => {
  const { gameId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [game, setGame] = useState<GameDetails | null>(null);
  const [play, setPlay] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    const loadGame = async () => {
      setLoading(true);
      setError(null);
      setIframeError(false);
      try {
        const data = (await fetchJson(`/games/${gameId}`)) as GameDetails;
        setGame(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    if (gameId) {
      void loadGame();
    }
  }, [gameId]);

  const canPlay = Boolean(game?.build_url);

  return (
    <WindowShell title="Birdmaid Admin - Game Details">
      <GlobalNavigation />
      <main className="content">
        <section className="win-outset game-hero">
          <div className="hero-content">
            <button className="win-btn" type="button" onClick={() => setPlay(true)} disabled={!canPlay}>
              Play
            </button>
            <span style={{ color: "#7fff7f" }}>System Ready...</span>
          </div>
        </section>
        {loading && <p>Loading...</p>}
        {!loading && error && (
          <>
            <p>Game unavailable.</p>
            <p>Unable to load build.</p>
          </>
        )}
            {!loading && !error && game && (
          <>
            <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
              <Link className="win-btn" to="/">
                ← Back to Catalog
              </Link>
              <Link className="win-btn" to={`/admin/games/${gameId}`}>
                Edit Game
              </Link>
            </div>
            <div className="win-outset panel">
              <h2 style={{ marginTop: 0 }}>{game.title}</h2>
              <div className="game-meta">
                <span>{game.repo_url}</span>
                <span>WebGL</span>
                <span>Rating 4.8</span>
              </div>
              <p>{game.description_md}</p>
            </div>
            {!canPlay && <p>Unable to load build.</p>}
            {play && game.build_url && (
              <iframe
                title="Game build"
                src={game.build_url}
                sandbox="allow-scripts allow-forms allow-pointer-lock"
                allow="fullscreen; autoplay; gamepad"
                style={{ width: "100%", height: 480, border: "2px solid #000" }}
                onError={() => setIframeError(true)}
              />
            )}
            {iframeError && <p>Unable to load build.</p>}
          </>
        )}
      </main>
    </WindowShell>
  );
};

const AdminTeamsPage = () => {
  const [name, setName] = useState("");
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTeams = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = (await fetchJson("/admin/teams")) as { id: string; name: string; _id?: string }[];
        setTeams(data.map((team) => ({ id: team._id ?? team.id, name: team.name })));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load teams");
      } finally {
        setLoading(false);
      }
    };
    void loadTeams();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      return;
    }
    try {
      const team = await fetchJson("/admin/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      setTeams((prev) => [...prev, { id: team._id ?? team.id, name: team.name }]);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team");
    }
  };

  return (
    <WindowShell title="Birdmaid Admin System">
      <GlobalNavigation />
      <main className="content">
        <div className="teams-layout">
          <aside className="sidebar win-inset">
            <strong>Teams</strong>
            <ul>
              <li>Dashboard</li>
              <li>Teams</li>
              <li>Users</li>
              <li>Settings</li>
            </ul>
          </aside>
          <section>
            <div className="win-outset panel" style={{ marginBottom: 12 }}>
              <h2 style={{ marginTop: 0 }}>Team Registry</h2>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  className="win-inset"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Team name"
                />
                <button className="win-btn" type="button" onClick={handleCreate}>
                  Create team
                </button>
              </div>
            </div>
            <div className="teams-cards">
              {teams.map((team) => (
                <div className="win-outset panel" key={team.id}>
                  <strong>{team.name}</strong>
                  <p>ID: {team.id}</p>
                  <Link className="win-btn" to={`/admin/games/new`}>
                    Create Game
                  </Link>
                </div>
              ))}
              {teams.length === 0 && (
                <div className="win-outset panel">
                  <strong>New Team Object</strong>
                  <p>Use “Create team” to add a new entry.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </WindowShell>
  );
};

const AdminGameEditorPage = () => {
  const { gameId: routeGameId } = useParams();
  const [teamId, setTeamId] = useState("");
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [teamSearch, setTeamSearch] = useState("");
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [gameId, setGameId] = useState(routeGameId ?? "");
  const [buildUrl, setBuildUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("editing");
  const [remark, setRemark] = useState("");
  const [tagsUser, setTagsUser] = useState("");
  const [tagsSystem, setTagsSystem] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const publishDisabled = useMemo(
    () => !description || !coverUrl || !buildUrl,
    [description, coverUrl, buildUrl]
  );

  // Load teams list
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const data = (await fetchJson("/admin/teams")) as { id: string; name: string; _id?: string }[];
        setTeams(data.map((team) => ({ id: team._id ?? team.id, name: team.name })));
      } catch (err) {
        // Ignore errors, teams list is optional
      }
    };
    void loadTeams();
  }, []);

  // Filter teams by search
  const filteredTeams = useMemo(() => {
    if (!teamSearch.trim()) {
      return teams;
    }
    const searchLower = teamSearch.toLowerCase();
    return teams.filter((team) => team.name.toLowerCase().includes(searchLower));
  }, [teams, teamSearch]);

  // Get selected team name
  const selectedTeamName = useMemo(() => {
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : "";
  }, [teams, teamId]);

  // Load existing game when gameId is provided and not "new"
  useEffect(() => {
    if (routeGameId && routeGameId !== "new" && routeGameId !== gameId) {
      setGameId(routeGameId);
    }
  }, [routeGameId, gameId]);

  useEffect(() => {
    const loadGame = async () => {
      if (!gameId || gameId === "new") {
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const game = (await fetchJson(`/admin/games/${gameId}`)) as {
          id: string;
          teamId: string;
          title: string;
          description_md: string;
          repo_url: string;
          cover_url: string;
          status: string;
          tags_user: string[];
          tags_system: string[];
          build_url: string | null;
          adminRemark: string | null;
        };
        setTeamId(game.teamId);
        setTitle(game.title);
        setDescription(game.description_md);
        setRepoUrl(game.repo_url);
        setCoverUrl(game.cover_url);
        setStatus(game.status);
        setBuildUrl(game.build_url);
        setTagsUser((game.tags_user ?? []).join(", "));
        setTagsSystem((game.tags_system ?? []).join(", "));
        setRemark(game.adminRemark ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load game");
      } finally {
        setLoading(false);
      }
    };
    void loadGame();
  }, [gameId]);

  // Update team search when teamId or teams change
  useEffect(() => {
    if (teamId && teams.length > 0) {
      const team = teams.find((t) => t.id === teamId);
      if (team) {
        setTeamSearch(team.name);
      }
    } else if (!teamId) {
      setTeamSearch("");
    }
  }, [teamId, teams]);

  const handleCreateGame = async () => {
    try {
      setError(null);
      const game = await fetchJson("/admin/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          title,
          description_md: description,
          repo_url: repoUrl,
          cover_url: coverUrl,
        }),
      });
      setGameId(game._id ?? game.id);
    } catch (err: any) {
      setError(err.message || "Failed to create game");
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      setError(null);
      // If game doesn't exist yet, create it first
      let currentGameId = gameId;
      if (!currentGameId || currentGameId === "new") {
                      if (!title.trim() || !teamId.trim()) {
                        setError("Please select Team and enter Game Title before uploading build");
                        return;
                      }
        const game = await fetchJson("/admin/games", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamId,
            title,
            description_md: description || "",
            repo_url: repoUrl || "",
            cover_url: coverUrl || "",
          }),
        });
        currentGameId = game._id ?? game.id;
        setGameId(currentGameId);
      }
      // Upload build
      const formData = new FormData();
      formData.append("file", file);
      const result = await fetchJson(`/admin/games/${currentGameId}/build`, {
        method: "POST",
        body: formData,
      });
      setBuildUrl(result.build_url ?? null);
    } catch (err: any) {
      setError(err.message || "Failed to upload build");
    }
  };

  const handlePublish = async () => {
    if (!gameId) {
      return;
    }
    try {
      await fetchJson(`/admin/games/${gameId}/publish`, { method: "POST" });
      setStatus("published");
    } catch (err: any) {
      setError(err.message || "Failed to publish game");
    }
  };

  const handleStatusUpdate = async () => {
    if (!gameId) {
      return;
    }
    try {
      setError(null);
      await fetchJson(`/admin/games/${gameId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, remark }),
      });
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    }
  };

  const handleTagsUpdate = async () => {
    if (!gameId) {
      return;
    }
    try {
      const toArray = (value: string) =>
        value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      await fetchJson(`/admin/games/${gameId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags_user: toArray(tagsUser), tags_system: toArray(tagsSystem) }),
      });
    } catch (err: any) {
      setError(err.message || "Failed to update tags");
    }
  };

  return (
    <WindowShell title="Birdmaid - Admin Game Editor">
      <GlobalNavigation />
      <main className="content">
        {error && (
          <div className="win-outset panel" style={{ background: "#ff0000", color: "#fff", marginBottom: 12 }}>
            <p>{error}</p>
          </div>
        )}
        {loading && <p>Loading game...</p>}
        {publishDisabled && !loading && (
          <div className="win-outset panel" style={{ marginBottom: 12 }}>
            <p>Publish requires cover, description, and build</p>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <div>
            <div className="status-pill">STATUS: {status.toUpperCase()}</div>
          </div>
          <div className="status-pill">LAST_EDIT: ADMIN</div>
        </div>
        <div className="editor-layout">
          <div>
            <section className="win-outset panel">
              <h3>General Properties</h3>
              <div className="form-field" style={{ position: "relative" }}>
                <label>Team</label>
                <div style={{ position: "relative" }}>
                  <input
                    value={showTeamDropdown ? teamSearch : selectedTeamName}
                    onChange={(event) => {
                      setTeamSearch(event.target.value);
                      setShowTeamDropdown(true);
                      // Clear teamId if search doesn't match any team
                      const matchingTeam = teams.find(
                        (t) => t.name.toLowerCase() === event.target.value.toLowerCase()
                      );
                      if (matchingTeam) {
                        setTeamId(matchingTeam.id);
                      } else if (event.target.value === "") {
                        setTeamId("");
                      }
                    }}
                    onFocus={() => setShowTeamDropdown(true)}
                    onBlur={() => {
                      // Delay to allow click on dropdown item
                      setTimeout(() => setShowTeamDropdown(false), 200);
                    }}
                    placeholder="Search or select team..."
                  />
                  {showTeamDropdown && filteredTeams.length > 0 && (
                    <div
                      className="win-outset"
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        maxHeight: 200,
                        overflowY: "auto",
                        marginTop: 2,
                        padding: 4,
                        background: "var(--win-gray)",
                      }}
                    >
                      {filteredTeams.map((team) => (
                        <div
                          key={team.id}
                          className="win-inset"
                          style={{
                            padding: "6px 8px",
                            cursor: "pointer",
                            marginBottom: 2,
                            backgroundColor: teamId === team.id ? "#d0d0d0" : "var(--win-white)",
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setTeamId(team.id);
                            setTeamSearch(team.name);
                            setShowTeamDropdown(false);
                          }}
                        >
                          {team.name}
                        </div>
                      ))}
                    </div>
                  )}
                  {showTeamDropdown && filteredTeams.length === 0 && teamSearch.trim() && (
                    <div
                      className="win-outset"
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        marginTop: 2,
                        padding: 8,
                        background: "var(--win-gray)",
                      }}
                    >
                      <p style={{ margin: 0, fontSize: 12 }}>No teams found</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-field">
                <label>Game Title</label>
                <input value={title} onChange={(event) => setTitle(event.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="description">Description</label>
                <textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="repo">Repository</label>
                <input id="repo" value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="cover">Cover Image (URL or upload)</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                  <input
                    id="cover"
                    type="text"
                    value={coverUrl}
                    onChange={(event) => setCoverUrl(event.target.value)}
                    placeholder="Enter cover image URL"
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontSize: 12 }}>or</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) {
                        return;
                      }
                      try {
                        setError(null);
                        // If game doesn't exist yet, create it first
                        let currentGameId = gameId;
                        if (!currentGameId || currentGameId === "new") {
                        if (!title.trim() || !teamId.trim()) {
                          setError("Please select Team and enter Game Title before uploading cover");
                          return;
                        }
                          const game = await fetchJson("/admin/games", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              teamId,
                              title,
                              description_md: description || "",
                              repo_url: repoUrl || "",
                              cover_url: "",
                            }),
                          });
                          currentGameId = game._id ?? game.id;
                          setGameId(currentGameId);
                        }
                        // Upload cover image
                        const formData = new FormData();
                        formData.append("file", file);
                        const result = await fetchJson(`/admin/games/${currentGameId}/cover`, {
                          method: "POST",
                          body: formData,
                        });
                        setCoverUrl(result.cover_url);
                      } catch (err: any) {
                        setError(err.message || "Failed to upload cover image");
                      }
                    }}
                  />
                </div>
                {coverUrl && (
                  <img
                    src={coverUrl}
                    alt="Cover preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 200,
                      marginTop: 8,
                      border: "2px solid #000",
                      objectFit: "contain",
                    }}
                    onError={() => {
                      // Silently fail if image doesn't load
                    }}
                  />
                )}
              </div>
              <button className="win-btn" type="button" onClick={handleCreateGame}>
                Save game
              </button>
              {gameId && <span style={{ marginLeft: 8 }}>Game ID: {gameId}</span>}
            </section>
            <section className="win-outset panel">
              <h3>Build Upload</h3>
              <p style={{ fontSize: 12, color: "#666", marginBottom: 8, marginTop: 0 }}>
                ⚠ <strong>Important:</strong> Please save the game first (click "Save game" above) before uploading the build file.
              </p>
              <input
                type="file"
                accept=".zip"
                onChange={handleUpload}
                disabled={!gameId || gameId === "new"}
                title={!gameId || gameId === "new" ? "Please create game first (click 'Save game')" : ""}
              />
              {(!gameId || gameId === "new") && (
                <p style={{ fontSize: 11, color: "#aa0000", marginTop: 4, marginBottom: 0, fontWeight: "bold" }}>
                  Game must be saved before uploading build
                </p>
              )}
              {buildUrl && (
                <iframe
                  title="Build preview"
                  src={buildUrl}
                  style={{ width: "100%", height: 240, marginTop: 12, border: "2px solid #000" }}
                />
              )}
            </section>
            <section className="win-outset panel">
              <h3>Tags</h3>
              <div className="form-field">
                <label htmlFor="tagsUser">User tags</label>
                <input id="tagsUser" value={tagsUser} onChange={(event) => setTagsUser(event.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="tagsSystem">System tags</label>
                <input id="tagsSystem" value={tagsSystem} onChange={(event) => setTagsSystem(event.target.value)} />
              </div>
              <button className="win-btn" type="button" onClick={handleTagsUpdate} disabled={!gameId}>
                Save tags
              </button>
            </section>
          </div>
          <aside className="win-outset panel">
            <h3>Publishing</h3>
            <button className="win-btn" type="button" disabled={publishDisabled} onClick={handlePublish}>
              Publish
            </button>
            <div className="form-field">
              <label>Status</label>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="editing">editing</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </select>
            </div>
            <div className="form-field">
              <label>Remark</label>
              <input value={remark} onChange={(event) => setRemark(event.target.value)} />
            </div>
            <button className="win-btn" type="button" onClick={handleStatusUpdate} disabled={!gameId}>
              Update status
            </button>
            <div className="danger" style={{ marginTop: 12 }}>
              Danger Zone
            </div>
          </aside>
        </div>
      </main>
    </WindowShell>
  );
};

const AdminSettingsPage = () => {
  const [maxBuildSize, setMaxBuildSize] = useState(300 * 1024 * 1024);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const settings = (await fetchJson("/admin/settings/build-limits")) as {
          maxBuildSizeBytes: number;
        };
        setMaxBuildSize(settings.maxBuildSizeBytes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    void loadSettings();
  }, []);

  const handleUpdate = async () => {
    try {
      setError(null);
      await fetchJson("/admin/settings/build-limits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxBuildSizeBytes: maxBuildSize }),
      });
    } catch (err: any) {
      setError(err.message || "Failed to update settings");
    }
  };

  return (
    <WindowShell title="Birdmaid - Admin Settings">
      <GlobalNavigation />
      <main className="content">
        {error && (
          <div className="win-outset panel" style={{ background: "#ff0000", color: "#fff", marginBottom: 12 }}>
            <p>{error}</p>
          </div>
        )}
        {loading && <p>Loading settings...</p>}
        {!loading && (
          <section className="win-outset panel">
            <h2 style={{ marginTop: 0 }}>Max build size</h2>
            <div className="form-field">
              <label htmlFor="maxBuildSize">Max build size (bytes)</label>
              <input
                id="maxBuildSize"
                type="number"
                value={maxBuildSize}
                onChange={(event) => setMaxBuildSize(Number(event.target.value))}
              />
            </div>
            <button className="win-btn" type="button" onClick={handleUpdate}>
              Update
            </button>
          </section>
        )}
      </main>
    </WindowShell>
  );
};

const NotFound = () => (
  <WindowShell title="Birdmaid - 404.exe">
    <GlobalNavigation />
    <main className="content">
      <div className="win-outset panel">
        <h2>404 - Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <Link className="win-btn" to="/">
          Go to Catalog
        </Link>
      </div>
    </main>
  </WindowShell>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/games/:gameId" element={<GamePage />} />
      <Route path="/admin/teams" element={<AdminTeamsPage />} />
      <Route path="/admin/games/:gameId" element={<AdminGameEditorPage />} />
      <Route path="/admin/games/new" element={<AdminGameEditorPage />} />
      <Route path="/admin/settings" element={<AdminSettingsPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
