import { pool } from '../config/database';
import { IComment } from '../types/custom';
import { DatabaseError } from '../utils/logger';

export class CommentModel {
  static async create(postId: string, userId: string, content: string): Promise<IComment> {
    const query = `
      INSERT INTO "comments" ("postId", "userId", "content")
VALUES ($1, $2, $3)
RETURNING "id", "postId", "userId", "content", "createdAt", "updatedAt";

    `;
    const result = await pool.query(query, [postId, userId, content]);
    return result.rows[0];
  }

  static async findById(id: string): Promise<IComment | null> {
    const query = `
      SELECT c.*, u."name" AS "author"
FROM "comments" c
JOIN "users" u ON c."userId" = u."id"
WHERE c."id" = $1;

    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByPostId(postId: string): Promise<IComment[]> {
    const query = `
      SELECT c.*, u."name" AS "author"
FROM "comments" c
JOIN "users" u ON c."userId" = u."id"
WHERE c."postId" = $1
ORDER BY c."createdAt" DESC;

    `;
    const result = await pool.query(query, [postId]);
    return result.rows;
  }

  static async update(id: string, content: string): Promise<IComment | null> {
    const query = `
      UPDATE "comments"
SET "content" = $2, "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = $1
RETURNING "id", "postId", "userId", "content", "createdAt", "updatedAt";

    `;
    const result = await pool.query(query, [id, content]);
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const query = `
      DELETE FROM comments
      WHERE id = $1
      RETURNING id
    `;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
  static async checkPostExists(postId: string): Promise<boolean> {
    const query = `
      SELECT id FROM posts WHERE id = $1
    `;
    const result = await pool.query(query, [postId]);
    return (result.rowCount ?? 0) > 0;
  }
}
