import { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useParams } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

const fetchJson = async (path: string, options?: RequestInit) => {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
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

  const loadGames = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await fetchJson("/games")) as GameSummary[];
      setGames(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGames();
  }, []);

  return (
    <WindowShell title="Nexus Games - Catalog.exe">
      <nav className="win-menu">
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Options</span>
        <span>Help</span>
      </nav>
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
        <section className="win-outset">
          <div className="featured">
            <div className="win-inset featured-image" />
            <div className="panel">
              <h1 style={{ fontSize: 28, margin: 0 }}>Cyber Odyssey: Neon Nights</h1>
              <p>Welcome to the future. Neon-drenched streets await your command.</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="win-btn" type="button">
                  Run Game
                </button>
                <button className="win-btn" type="button">
                  ReadMe.txt
                </button>
              </div>
            </div>
          </div>
        </section>
        <section className="win-outset tag-bar">
          <span className="tag-chip">All Files (*.*)</span>
          <span className="tag-chip">Action</span>
          <span className="tag-chip">Strategy</span>
          <span className="tag-chip">RPG</span>
          <span className="tag-chip">Sports</span>
          <span className="tag-chip">Sim</span>
        </section>
        {loading && <p>Loading...</p>}
        {!loading && error && (
          <div className="win-outset panel">
            <p>Unable to load catalog.</p>
            <button className="win-btn" type="button" onClick={loadGames}>
              Retry
            </button>
          </div>
        )}
        {!loading && !error && games.length === 0 && <p>No games available.</p>}
        {!loading && !error && games.length > 0 && (
          <div className="catalog-grid">
            {games.map((game) => (
              <div key={game.id} className="win-outset game-card">
                <div className="game-thumb" />
                <strong>{game.title}</strong>
                <span style={{ fontSize: 12 }}>
                  {(game.tags_user ?? []).concat(game.tags_system ?? []).join(", ")}
                </span>
                <Link className="win-btn" to={`/games/${game.id}`}>
                  Open
                </Link>
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
      <nav className="win-menu">
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Tools</span>
        <span>Help</span>
      </nav>
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

  const handleCreate = async () => {
    if (!name.trim()) {
      return;
    }
    const team = await fetchJson("/admin/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setTeams((prev) => [...prev, { id: team._id ?? team.id, name: team.name }]);
    setName("");
  };

  return (
    <WindowShell title="Birdmaid Admin System">
      <nav className="win-menu">
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Help</span>
      </nav>
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
  const [teamId, setTeamId] = useState("team-1");
  const [title, setTitle] = useState("Cyber Odyssey");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [gameId, setGameId] = useState(routeGameId ?? "");
  const [buildUrl, setBuildUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("editing");
  const [remark, setRemark] = useState("");
  const [tagsUser, setTagsUser] = useState("");
  const [tagsSystem, setTagsSystem] = useState("");

  const publishDisabled = useMemo(
    () => !description || !coverUrl || !buildUrl,
    [description, coverUrl, buildUrl]
  );

  const handleCreateGame = async () => {
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
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0] || !gameId) {
      return;
    }
    const formData = new FormData();
    formData.append("file", event.target.files[0]);
    const result = await fetchJson(`/admin/games/${gameId}/build`, {
      method: "POST",
      body: formData,
    });
    setBuildUrl(result.build_url ?? null);
  };

  const handlePublish = async () => {
    if (!gameId) {
      return;
    }
    await fetchJson(`/admin/games/${gameId}/publish`, { method: "POST" });
    setStatus("published");
  };

  const handleStatusUpdate = async () => {
    if (!gameId) {
      return;
    }
    await fetchJson(`/admin/games/${gameId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, remark }),
    });
  };

  const handleTagsUpdate = async () => {
    if (!gameId) {
      return;
    }
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
  };

  return (
    <WindowShell title="Birdmaid - Admin Game Editor">
      <nav className="win-menu">
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Help</span>
      </nav>
      <main className="content">
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
              <div className="form-field">
                <label>Team ID</label>
                <input value={teamId} onChange={(event) => setTeamId(event.target.value)} />
              </div>
              <div className="form-field">
                <label>Game Title</label>
                <input value={title} onChange={(event) => setTitle(event.target.value)} />
              </div>
              <div className="form-field">
                <label>Description</label>
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
              </div>
              <div className="form-field">
                <label>Repository</label>
                <input value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} />
              </div>
              <div className="form-field">
                <label>Cover</label>
                <input value={coverUrl} onChange={(event) => setCoverUrl(event.target.value)} />
              </div>
              <button className="win-btn" type="button" onClick={handleCreateGame}>
                Save game
              </button>
              {gameId && <span style={{ marginLeft: 8 }}>Game ID: {gameId}</span>}
            </section>
            <section className="win-outset panel">
              <h3>Build Upload</h3>
              <input type="file" accept=".zip" onChange={handleUpload} disabled={!gameId} />
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
                <label>User tags</label>
                <input value={tagsUser} onChange={(event) => setTagsUser(event.target.value)} />
              </div>
              <div className="form-field">
                <label>System tags</label>
                <input value={tagsSystem} onChange={(event) => setTagsSystem(event.target.value)} />
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
      <Route path="/admin/teams" element={<AdminTeamsPage />} />
      <Route path="/admin/games/:gameId" element={<AdminGameEditorPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
