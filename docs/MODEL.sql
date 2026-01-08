-- Logical data model for MongoDB; not SQL DDL.
-- Define schema after UX_MAP and API alignment.

-- Collection: admins
-- fields: _id, email, role ("superadmin"), createdAt
-- indexes: (email unique)

-- Collection: teams
-- fields: _id, name, members[] (optional), createdAt
-- indexes: (name)
-- notes: team can exist with zero members.

-- Collection: games
-- fields: _id, teamId, title, description_md, repo_url, cover_url, status,
--         tags_user[], tags_system[],
--         currentBuild { id, url, createdAt }, adminRemark { text, at }
-- indexes: (status), (tags_user), (tags_system), (teamId), (title)
-- notes: publish requires cover_url + description_md + currentBuild.

-- Collection: builds
-- fields: _id, gameId, storage_url, s3_key, createdAt, sizeBytes, checksum
-- indexes: (gameId), (createdAt)
-- notes: single current build per game; reupload replaces previous reference.

-- Relations (MongoDB):
-- - games.teamId references teams._id (no joins; resolve in app).
-- - builds.gameId references games._id; games.currentBuild embeds minimal build info.
-- - adminRemark embedded in games for MVP (no separate audit log).
-- - tags stored on games; no separate tags collection in FP1.
