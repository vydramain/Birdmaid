-- Logical data model for MongoDB; not SQL DDL.
-- Define schema after UX_MAP and API alignment.

-- Collection: admins (FP1; deprecated in FP4, migrate to users)
-- fields: _id, email, role ("superadmin"), createdAt
-- indexes: (email unique)
-- notes: Migrate to users collection with isSuperAdmin: true (ADR-039).

-- Collection: users (FP4)
-- fields: _id, email (unique), login (unique), password (hashed, bcrypt), isSuperAdmin (boolean, default false), createdAt, updatedAt
-- indexes: (email unique), (login unique)
-- notes: Authentication uses either email or login as identifier. Password minimum 6 chars (ADR-030). JWT tokens for sessions (ADR-036).

-- Collection: teams
-- fields: _id, name, leader (userId, references users._id), members[] (array of userId references), createdAt
-- indexes: (name), (leader), (members)
-- notes: Team leader can add members (ADR-034). Leader can be transferred. Creator becomes initial leader.

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

-- Collection: comments (FP4)
-- fields: _id, gameId (references games._id), userId (references users._id), text, userLogin (denormalized for display), createdAt
-- indexes: (gameId), (userId), (createdAt)
-- notes: Comments visible to all users on published games. Stored in separate collection (ADR-035).

-- Relations (MongoDB):
-- - games.teamId references teams._id (no joins; resolve in app).
-- - builds.gameId references games._id; games.currentBuild embeds minimal build info.
-- - adminRemark embedded in games for MVP (no separate audit log).
-- - tags stored on games; no separate tags collection in FP1.
-- - teams.leader references users._id; teams.members[] contains user IDs.
-- - comments.gameId references games._id; comments.userId references users._id.
