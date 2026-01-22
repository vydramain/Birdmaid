import { useState, useEffect } from "react";
import { apiClient } from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import { useWindow } from "../contexts/WindowContext";
import { HourglassLoader } from "./win95/HourglassLoader";

type Game = {
  id: string;
  title: string;
  teamId?: string;
  tags_user?: string[];
  tags_system?: string[];
  status: string;
};

type FolderNode = {
  name: string;
  type: "folder" | "game";
  children?: FolderNode[];
  game?: Game;
  expanded?: boolean;
};

export function ExplorerWindow() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tree, setTree] = useState<FolderNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const auth = useAuth();
  const { openWindow } = useWindow();

  useEffect(() => {
    void loadGames();
  }, []);

  const loadGames = async () => {
    setLoading(true);
    setError(null);
    try {
      const games = await apiClient.json<Game[]>("/games");
      
      // Build tree structure: jams → years → games
      // For now, we'll use a simplified structure: just show games grouped by team
      // In a full implementation, we'd group by jam → year → games
      const treeData: FolderNode[] = [];
      const teamMap = new Map<string, Game[]>();
      
      games.forEach((game) => {
        if (game.status === "published" || (auth.user && game.teamId)) {
          const teamId = game.teamId || "unknown";
          if (!teamMap.has(teamId)) {
            teamMap.set(teamId, []);
          }
          teamMap.get(teamId)!.push(game);
        }
      });
      
      teamMap.forEach((teamGames, teamId) => {
        treeData.push({
          name: `Team ${teamId}`,
          type: "folder",
          children: teamGames.map((game) => ({
            name: game.title,
            type: "game" as const,
            game,
          })),
          expanded: false,
        });
      });
      
      setTree(treeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load games");
    } finally {
      setLoading(false);
    }
  };

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderPath)) {
        next.delete(folderPath);
      } else {
        next.add(folderPath);
      }
      return next;
    });
  };

  const handleGameClick = (game: Game) => {
    openWindow("game", { title: game.title, buildUrl: null, gameId: game.id });
  };

  const renderTree = (nodes: FolderNode[], path: string = ""): JSX.Element[] => {
    return nodes.map((node, index) => {
      const nodePath = path ? `${path}/${index}` : `${index}`;
      const isExpanded = expandedFolders.has(nodePath);
      
      if (node.type === "folder") {
        return (
          <div key={nodePath} style={{ marginLeft: path ? "16px" : "0" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                padding: "2px 4px",
                userSelect: "none",
              }}
              onClick={() => toggleFolder(nodePath)}
            >
              <span style={{ marginRight: "4px" }}>{isExpanded ? "▼" : "▶"}</span>
              <span>{node.name}</span>
            </div>
            {isExpanded && node.children && (
              <div style={{ marginLeft: "16px" }}>
                {renderTree(node.children, nodePath)}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div
            key={nodePath}
            style={{
              marginLeft: path ? "32px" : "16px",
              padding: "2px 4px",
              cursor: "pointer",
            }}
            onClick={() => node.game && handleGameClick(node.game)}
          >
            {node.name}
          </div>
        );
      }
    });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
        <HourglassLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "12px" }}>
        <p style={{ color: "var(--win-red)" }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "8px", fontSize: "12px" }}>
      {tree.length === 0 ? (
        <p>No games available</p>
      ) : (
        renderTree(tree)
      )}
    </div>
  );
}
