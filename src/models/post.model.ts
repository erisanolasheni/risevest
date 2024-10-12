import {
  IPost,
  IPostCreate,
  IPostUpdate,
  IPostResponse,
} from "../types/custom";
import { pool } from "../config/database";

export class PostModel {
  static async create(postData: IPostCreate): Promise<IPost> {
    const result = await pool.query(
      `INSERT INTO "posts" ("title", "content", "userId", "createdAt") 
VALUES ($1, $2, $3, CURRENT_TIMESTAMP) 
RETURNING "id", "title", "content", "createdAt";
`,
      [postData.title, postData.content, postData.userId]
    );
    return result.rows[0];
  }

  static async getAllPosts() {
    const query = "SELECT * FROM posts";
    const { rows } = await pool.query(query);
    return rows;
  }

  static async getPostById(id: string): Promise<IPostResponse[]> {
    const result = await pool.query(
      `SELECT p."id", p."title", p."content", p."createdAt",
       u."name" AS "authorName",
       COUNT(c."id") AS "commentCount"
FROM "posts" p
JOIN "users" u ON p."userId" = u."id"
LEFT JOIN "comments" c ON p."id" = c."postId"
WHERE p."id" = $1
GROUP BY p."id", u."name"
ORDER BY p."createdAt" DESC;
`,
      [id]
    );

    return result.rows[0] || null;
  }

  static async getPostsByUser(userId: string): Promise<IPostResponse[]> {
    const result = await pool.query(
      `SELECT p."id", p."title", p."content", p."createdAt",
       u."name" AS "authorName",
       COUNT(c."id") AS "commentCount"
FROM "posts" p
JOIN "users" u ON p."userId" = u."id"
LEFT JOIN "comments" c ON p."id" = c."postId"
WHERE p."userId" = $1
GROUP BY p."id", u."name"
ORDER BY p."createdAt" DESC;
`,
      [userId]
    );
    return result.rows;
  }

  static async update(
    id: string,
    userId: string,
    postData: IPostUpdate
  ): Promise<IPost> {

    console.log(postData);
    const fields = Object.keys(postData)
    // $1 and $2 already used for id and userId
      .map((key, index) => `${key} = $${index + 3}`)
      .join(", ");

    const query = `
            UPDATE "posts" 
SET ${fields}, "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = $1 AND "userId" = $2
RETURNING "id", "title", "content", "createdAt", "updatedAt";

        `;

    const values = [id, userId, ...Object.values(postData)];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async delete(id: string, userId: string): Promise<void> {
    await pool.query(`DELETE FROM posts WHERE id = $1 AND "userId" = $2`, [
      id,
      userId,
    ]);
  }
}
